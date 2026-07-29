import {
  conversationDisplayTitle,
  makeClientNonce,
  messagePreview,
  sortConversations,
} from "./chat-domain.mjs";
import { activeMentionToken, mentionedNames, parseMentions } from "../mentions.mjs";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function roleLabel(role) {
  return {
    admin: "Admin",
    manager: "Manager",
    deal_breaker: "Deal breaker",
    team: "Team",
  }[role] || role;
}

function localId(prefix) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(36)}`;
}

function isImageMime(mime) {
  return typeof mime === "string" && mime.startsWith("image/");
}

function formatFileSize(bytes) {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIconClass(mime) {
  if (mime === "application/pdf") return "ti-file-type-pdf";
  if (mime?.includes("word")) return "ti-file-type-doc";
  if (mime?.includes("sheet") || mime?.includes("excel")) return "ti-file-type-xls";
  return "ti-file";
}

function shortChatTime(timestamp, now = new Date()) {
  if (!timestamp) return "";
  const then = new Date(timestamp);
  if (Number.isNaN(then.getTime())) return "";
  const diffMs = now.getTime() - then.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const sameWeek = diffMs < 6 * 86400000;
  if (sameWeek) return then.toLocaleDateString(undefined, { weekday: "short" });
  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Consecutive messages from the same sender within this window group under
// one header instead of repeating the name/timestamp for every message.
const MESSAGE_GROUP_WINDOW_MS = 5 * 60 * 1000;

function shouldShowMessageHeader(message, previousMessage) {
  if (!previousMessage) return true;
  if (message.sender_id !== previousMessage.sender_id) return true;
  const gap = new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime();
  return !(gap >= 0 && gap < MESSAGE_GROUP_WINDOW_MS);
}

export function createChatViewModule() {
  return {
    id: "team-chat",
    mount(root, context) {
      const state = {
        profiles: [],
        conversations: [],
        messages: [],
        selectedConversationId: null,
        editingMessageId: null,
        editDraft: "",
        replyToMessageId: null,
        composeOpen: false,
        composeSearch: "",
        composeGroupTitle: "",
        composeSelectedMemberIds: new Set(),
        membersOpen: false,
        memberAddOpen: false,
        memberSearch: "",
        memberSelectedIds: new Set(),
        renameOpen: false,
        renameDraft: "",
        archiveConfirmOpen: false,
        // Mention typeahead. Lives on state (not the DOM) because render()
        // rewrites root.innerHTML wholesale on every poll.
        mentionQuery: null,
        mentionIndex: 0,
        mentionStart: 0,
        mentionDraft: "",
        // Attachments picked but not yet sent, keyed by a local id. Each is
        // { id, name, mime, size, status: "uploading"|"done"|"error", error, uploaded }.
        pendingAttachments: [],
        openMessageMenuId: null,
        confirmingDeleteMessageId: null,
        loading: true,
        error: null,
      };
      // Signed URLs for attachments already sent, keyed by storage path.
      // Lives outside state (not serializable, and losing it on render is fine
      // -- it just gets re-fetched) but persists across renders within a mount.
      const signedUrlCache = new Map(); // path -> { url, expiresAt }
      const signedUrlFetching = new Set();
      let disposed = false;
      let initialConversationPending = context.initialConversationId || null;
      let refreshTimer = null;
      let unsubscribeRealtime = null;
      let forceScrollBottom = false;

      function wasScrolledNearBottom() {
        const list = root.querySelector(".chat-message-list");
        if (!list) return true;
        return list.scrollHeight - list.scrollTop - list.clientHeight < 80;
      }

      function scrollMessageListToBottom() {
        const list = root.querySelector(".chat-message-list");
        if (list) list.scrollTop = list.scrollHeight;
      }

      function autoGrowComposer(textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      }

      // Only people actually in this conversation are mentionable -- state.profiles
      // is the whole org, and @-ing someone who can't read the thread is noise.
      function mentionCandidates(conversation) {
        if (!conversation) return [];
        return conversation.members
          .filter((member) => !member.left_at && member.profile)
          .map((member) => member.profile);
      }

      function matchingMentionCandidates(conversation) {
        const query = String(state.mentionQuery || "").trim().toLowerCase();
        const candidates = mentionCandidates(conversation)
          .filter((profile) => profile.id !== context.currentUser.id);
        if (!query) return candidates;
        return candidates.filter((profile) => (profile.full_name || "").toLowerCase().includes(query));
      }

      function closeMentionPicker({ rerender = true } = {}) {
        if (state.mentionQuery === null) return;
        state.mentionQuery = null;
        state.mentionIndex = 0;
        if (rerender) render();
      }

      function syncMentionPicker(textarea) {
        state.mentionDraft = textarea.value;
        const token = activeMentionToken(textarea.value, textarea.selectionStart ?? textarea.value.length);
        const nextQuery = token ? token.query : null;
        if (nextQuery === state.mentionQuery) return false;
        state.mentionQuery = nextQuery;
        state.mentionStart = token ? token.start : 0;
        state.mentionIndex = 0;
        return true;
      }

      function applyMention(conversation, profile) {
        const textarea = root.querySelector("[data-chat-composer]");
        if (!textarea || !profile) return;
        const caret = textarea.selectionStart ?? textarea.value.length;
        const before = textarea.value.slice(0, state.mentionStart);
        const after = textarea.value.slice(caret);
        const inserted = `@${profile.full_name} `;
        const nextValue = `${before}${inserted}${after}`;
        const nextCaret = before.length + inserted.length;
        state.mentionQuery = null;
        state.mentionIndex = 0;
        state.mentionDraft = nextValue;
        render();
        // render() replaces the textarea, so value and caret are restored after
        // the fact -- the same pattern the compose/member search inputs use.
        const restored = root.querySelector("[data-chat-composer]");
        if (!restored) return;
        restored.value = nextValue;
        autoGrowComposer(restored);
        restored.focus();
        restored.setSelectionRange?.(nextCaret, nextCaret);
      }

      function moveMentionSelection(conversation, delta) {
        const matches = matchingMentionCandidates(conversation);
        if (!matches.length) return;
        const next = (state.mentionIndex + delta + matches.length) % matches.length;
        state.mentionIndex = next;
        const value = root.querySelector("[data-chat-composer]")?.value ?? state.mentionDraft;
        const caret = root.querySelector("[data-chat-composer]")?.selectionStart ?? value.length;
        state.mentionDraft = value;
        render();
        const restored = root.querySelector("[data-chat-composer]");
        if (!restored) return;
        restored.value = value;
        autoGrowComposer(restored);
        restored.focus();
        restored.setSelectionRange?.(caret, caret);
      }

      root.classList.add("wein-chat-root");

      function handleRootClick(event) {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (
          state.composeOpen
          && !target.closest("[data-chat-compose-popover]")
          && !target.closest("[data-chat-compose-toggle]")
        ) {
          closeCompose();
          return;
        }
        if (
          state.membersOpen
          && !target.closest("[data-chat-members-panel]")
          && !target.closest("[data-chat-members-toggle]")
        ) {
          closeMembers();
          return;
        }
        if (
          state.openMessageMenuId
          && !target.closest("[data-chat-message-menu-panel]")
          && !target.closest("[data-chat-message-menu]")
        ) {
          state.openMessageMenuId = null;
          render();
        }
      }

      function handleDocumentKeydown(event) {
        if (event.key !== "Escape") return;
        if (state.composeOpen) {
          closeCompose();
          return;
        }
        if (state.membersOpen) {
          closeMembers();
          return;
        }
        if (state.openMessageMenuId || state.confirmingDeleteMessageId) {
          state.openMessageMenuId = null;
          state.confirmingDeleteMessageId = null;
          render();
        }
      }

      root.addEventListener?.("click", handleRootClick);
      if (typeof document !== "undefined") {
        document.addEventListener("keydown", handleDocumentKeydown);
      }

      async function refresh({ keepMessages = true } = {}) {
        try {
          state.error = null;
          const [profiles, conversations] = await Promise.all([
            context.service.listProfiles(),
            context.service.listConversations(),
          ]);
          state.profiles = profiles;
          state.conversations = sortConversations(conversations);
          if (initialConversationPending) {
            if (state.conversations.some((conversation) => conversation.id === initialConversationPending)) {
              state.selectedConversationId = initialConversationPending;
            }
            initialConversationPending = null;
          }
          if (!state.selectedConversationId && state.conversations.length) {
            state.selectedConversationId = state.conversations[0].id;
          }
          if (state.selectedConversationId && keepMessages) {
            state.messages = await context.service.listMessages(state.selectedConversationId);
            const lastSeq = state.messages.at(-1)?.message_seq || 0;
            // Read-receipt bookkeeping is best-effort: it must never surface as a
            // chat-wide error when the actual message list just loaded successfully.
            if (lastSeq) {
              try {
                await context.service.markRead(state.selectedConversationId, lastSeq);
              } catch (error) {
                console.error("Failed to mark chat messages as read", error);
              }
            }
          }
        } catch (error) {
          state.error = error.message || String(error);
        } finally {
          state.loading = false;
          if (!disposed) render();
        }
      }

      async function selectConversation(conversationId) {
        state.selectedConversationId = conversationId;
        state.membersOpen = false;
        state.memberAddOpen = false;
        state.memberSearch = "";
        state.memberSelectedIds = new Set();
        state.renameOpen = false;
        state.renameDraft = "";
        state.archiveConfirmOpen = false;
        state.pendingAttachments = [];
        root.classList.add("chat-has-selection");
        state.messages = await context.service.listMessages(conversationId);
        forceScrollBottom = true;
        if (!disposed) render();
        const lastSeq = state.messages.at(-1)?.message_seq || 0;
        if (lastSeq) {
          try {
            await context.service.markRead(conversationId, lastSeq);
          } catch (error) {
            console.error("Failed to mark chat messages as read", error);
          }
        }
        await refresh();
      }

      function clearMobileSelection() {
        root.classList.remove("chat-has-selection");
      }

      function addPendingFiles(fileList) {
        const conversationId = state.selectedConversationId;
        if (!conversationId) return;
        const files = [...(fileList || [])];
        for (const file of files) {
          const entry = { id: localId("pending"), name: file.name, mime: file.type || "application/octet-stream", size: file.size, status: "uploading", error: null, uploaded: null };
          state.pendingAttachments = [...state.pendingAttachments, entry];
          context.service.uploadAttachment(conversationId, file).then((uploaded) => {
            entry.status = "done";
            entry.uploaded = uploaded;
            if (!disposed) render();
          }).catch((error) => {
            entry.status = "error";
            entry.error = error?.message || "Upload failed";
            if (!disposed) render();
          });
        }
        render();
      }

      function removePendingAttachment(pendingId) {
        state.pendingAttachments = state.pendingAttachments.filter((entry) => entry.id !== pendingId);
        render();
      }

      async function sendMessage(form) {
        const input = form.querySelector("[data-chat-composer]");
        const body = input.value.trim();
        const uploading = state.pendingAttachments.some((entry) => entry.status === "uploading");
        const attachments = state.pendingAttachments
          .filter((entry) => entry.status === "done")
          .map((entry) => entry.uploaded);
        if (uploading || (!body && !attachments.length) || !state.selectedConversationId) return;
        const replyToId = state.replyToMessageId;
        const conversation = state.conversations.find((row) => row.id === state.selectedConversationId) || null;
        // Parse before the input is cleared below.
        const mentionedUserIds = parseMentions(body, mentionCandidates(conversation));
        input.value = "";
        state.replyToMessageId = null;
        state.mentionQuery = null;
        state.mentionDraft = "";
        state.pendingAttachments = [];
        const message = await context.service.sendMessage({
          conversationId: state.selectedConversationId,
          body,
          clientNonce: makeClientNonce("portal-chat"),
          replyToId,
          mentionedUserIds,
          attachments,
        });
        // Render the sent message immediately -- it already exists in the database at
        // this point, so a subsequent failure (e.g. markRead) must not hide it from
        // the sender's own view until the next refresh.
        state.messages = [...state.messages, message];
        forceScrollBottom = true;
        if (!disposed) render();
        try {
          await context.service.markRead(state.selectedConversationId, message.message_seq);
        } catch (error) {
          console.error("Failed to mark chat message as read", error);
        }
        await refresh();
      }

      function startReply(messageId) {
        if (!messageId) return;
        state.replyToMessageId = messageId;
        render();
        root.querySelector("[data-chat-composer]")?.focus();
      }

      function clearReply() {
        state.replyToMessageId = null;
        render();
      }

      function openCompose() {
        state.composeOpen = true;
        render();
        root.querySelector("[data-chat-compose-search]")?.focus();
      }

      function closeCompose({ reset = false } = {}) {
        state.composeOpen = false;
        if (reset) {
          state.composeSearch = "";
          state.composeGroupTitle = "";
          state.composeSelectedMemberIds = new Set();
        }
        render();
      }

      function toggleComposeMember(userId, checked) {
        const next = new Set(state.composeSelectedMemberIds);
        if (checked) next.add(userId);
        else next.delete(userId);
        state.composeSelectedMemberIds = next;
        render();
      }

      function hasOwnerOrManagerPrivilege(conversation) {
        const self = conversation.members.find((member) => member.user_id === context.currentUser.id && !member.left_at);
        return self?.membership_role === "owner" || ["admin", "manager"].includes(context.currentUser.role);
      }

      function canManageMembers(conversation) {
        if (!conversation || conversation.kind !== "group") return false;
        return hasOwnerOrManagerPrivilege(conversation);
      }

      function canArchiveConversation(conversation) {
        if (!conversation) return false;
        return hasOwnerOrManagerPrivilege(conversation);
      }

      function openMembers() {
        state.membersOpen = true;
        render();
      }

      function closeMembers({ reset = false } = {}) {
        state.membersOpen = false;
        state.memberAddOpen = false;
        if (reset) {
          state.memberSearch = "";
          state.memberSelectedIds = new Set();
        }
        render();
      }

      function toggleMemberAdd() {
        state.memberAddOpen = !state.memberAddOpen;
        render();
        if (state.memberAddOpen) root.querySelector("[data-chat-member-search]")?.focus();
      }

      function toggleMemberPicker(userId, checked) {
        const next = new Set(state.memberSelectedIds);
        if (checked) next.add(userId);
        else next.delete(userId);
        state.memberSelectedIds = next;
        render();
      }

      async function addSelectedMembers(conversationId) {
        const memberIds = [...state.memberSelectedIds];
        if (!conversationId || !memberIds.length) return;
        for (const userId of memberIds) {
          await context.service.addMember(conversationId, userId);
        }
        state.memberSearch = "";
        state.memberSelectedIds = new Set();
        state.memberAddOpen = false;
        if (!disposed) render();
        await refresh();
      }

      async function removeMember(conversationId, userId) {
        if (!conversationId || !userId) return;
        await context.service.removeMember(conversationId, userId);
        state.conversations = state.conversations.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;
          return {
            ...conversation,
            members: conversation.members.map((member) => (
              member.user_id === userId
                ? { ...member, left_at: member.left_at || new Date().toISOString() }
                : member
            )),
          };
        });
        if (userId === context.currentUser.id) {
          state.membersOpen = false;
          state.memberAddOpen = false;
        }
        if (!disposed) render();
        await refresh();
      }

      function startEdit(messageId) {
        const message = state.messages.find((row) => row.id === messageId);
        if (!message) return;
        state.editingMessageId = messageId;
        state.editDraft = message.body || "";
        render();
        const input = root.querySelector(`[data-chat-edit-input="${CSS.escape(messageId)}"]`);
        input?.focus();
        input?.select?.();
      }

      function cancelEdit() {
        state.editingMessageId = null;
        state.editDraft = "";
        render();
      }

      async function submitEdit(form) {
        const messageId = form.dataset.chatEditForm;
        const input = form.querySelector("[data-chat-edit-input]");
        const body = input.value.trim();
        if (!messageId || !body) return;
        const conversation = state.conversations.find((row) => row.id === state.selectedConversationId) || null;
        // Re-parse on edit so adding or removing an @name takes effect.
        const updated = await context.service.updateMessage(messageId, body, parseMentions(body, mentionCandidates(conversation)));
        state.messages = state.messages.map((message) => (message.id === updated.id ? updated : message));
        state.editingMessageId = null;
        state.editDraft = "";
        if (!disposed) render();
        await refresh();
      }

      async function deleteMessage(messageId) {
        if (!messageId) return;
        const deleted = await context.service.deleteMessage(messageId);
        state.messages = state.messages.map((message) => (
          message.id === messageId
            ? { ...message, ...deleted, body: "Message deleted", deleted_at: deleted.deleted_at || new Date().toISOString() }
            : message
        ));
        if (state.replyToMessageId === messageId) state.replyToMessageId = null;
        state.confirmingDeleteMessageId = null;
        state.openMessageMenuId = null;
        if (!disposed) render();
        await refresh();
      }

      async function toggleMute(conversation) {
        const self = conversation.members.find((member) => member.user_id === context.currentUser.id);
        const nextLevel = self?.notification_level === "muted" ? "all" : "muted";
        await context.service.setNotificationLevel(conversation.id, nextLevel);
        state.conversations = state.conversations.map((row) => {
          if (row.id !== conversation.id) return row;
          return {
            ...row,
            members: row.members.map((member) => (
              member.user_id === context.currentUser.id
                ? { ...member, notification_level: nextLevel }
                : member
            )),
          };
        });
        if (!disposed) render();
        await refresh();
      }

      function openRename(conversation) {
        state.renameOpen = true;
        state.renameDraft = conversation.title || "";
        render();
        root.querySelector("[data-chat-rename-input]")?.focus();
      }

      function closeRename() {
        state.renameOpen = false;
        state.renameDraft = "";
        render();
      }

      async function renameConversation(conversation, title) {
        const trimmed = (title || "").trim();
        if (!trimmed) return;
        await context.service.renameConversation(conversation.id, trimmed);
        state.conversations = state.conversations.map((row) => (
          row.id === conversation.id ? { ...row, title: trimmed } : row
        ));
        state.renameOpen = false;
        state.renameDraft = "";
        if (!disposed) render();
        await refresh();
      }

      function openArchiveConfirm() {
        state.archiveConfirmOpen = true;
        render();
      }

      function closeArchiveConfirm() {
        state.archiveConfirmOpen = false;
        render();
      }

      async function setConversationArchived(conversation, archived) {
        await context.service.setConversationArchived(conversation.id, archived);
        state.archiveConfirmOpen = false;
        if (archived && state.selectedConversationId === conversation.id) {
          state.selectedConversationId = null;
          clearMobileSelection();
        }
        state.conversations = state.conversations.map((row) => (
          row.id === conversation.id ? { ...row, archived_at: archived ? new Date().toISOString() : null } : row
        ));
        if (!disposed) render();
        await refresh();
      }

      async function setMemberRole(conversationId, userId, role) {
        if (!conversationId || !userId) return;
        await context.service.setMembershipRole(conversationId, userId, role);
        state.conversations = state.conversations.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;
          return {
            ...conversation,
            members: conversation.members.map((member) => (
              member.user_id === userId ? { ...member, membership_role: role } : member
            )),
          };
        });
        if (!disposed) render();
        await refresh();
      }

      async function startDm(otherUserId) {
        if (!otherUserId) return;
        const conversationId = await context.service.getOrCreateDm(otherUserId);
        state.composeOpen = false;
        state.composeSearch = "";
        state.composeGroupTitle = "";
        state.composeSelectedMemberIds = new Set();
        await selectConversation(conversationId);
      }

      async function createGroup(title, memberIds) {
        title = title.trim();
        if (!title) return;
        const conversationId = await context.service.createGroup(title, memberIds);
        state.composeOpen = false;
        state.composeSearch = "";
        state.composeGroupTitle = "";
        state.composeSelectedMemberIds = new Set();
        await selectConversation(conversationId);
      }

      function scheduleRefresh() {
        if (disposed) return;
        refresh();
      }

      function conversationItem(conversation) {
        const selected = conversation.id === state.selectedConversationId ? " selected" : "";
        const unread = conversation.unread_count ? `<span class="chat-count">${conversation.unread_count}</span>` : "";
        const title = conversationDisplayTitle(conversation, context.currentUser.id);
        const timestamp = shortChatTime(conversation.last_message?.created_at);
        return `
          <button type="button" class="chat-conversation${selected}" data-chat-select="${escapeHtml(conversation.id)}">
            <span class="chat-conversation-avatar" aria-hidden="true">${escapeHtml((title || "?").slice(0, 1).toUpperCase())}</span>
            <span class="chat-conversation-body">
              <span class="chat-conversation-row">
                <span class="chat-conversation-title">${escapeHtml(title)}</span>
                ${timestamp ? `<span class="chat-conversation-timestamp">${escapeHtml(timestamp)}</span>` : ""}
                ${unread}
              </span>
              <span class="chat-conversation-preview">${escapeHtml(messagePreview(conversation.last_message))}</span>
            </span>
          </button>
        `;
      }

      function canModerateDelete() {
        return ["admin", "manager"].includes(context.currentUser.role);
      }

      function composePopover(selectableProfiles) {
        if (!state.composeOpen) return "";
        const query = state.composeSearch.trim().toLowerCase();
        const filteredProfiles = selectableProfiles.filter((profile) => (
          !query || (profile.full_name || "").toLowerCase().includes(query)
        ));
        const selectedCount = state.composeSelectedMemberIds.size;
        const oneSelectedId = selectedCount === 1 ? [...state.composeSelectedMemberIds][0] : "";
        return `
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${escapeHtml(state.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${selectedCount} selected</div>
            <div class="chat-compose-list">
              ${filteredProfiles.map((profile) => {
                const checked = state.composeSelectedMemberIds.has(profile.id) ? " checked" : "";
                return `
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${escapeHtml(profile.id)}"${checked}>
                    <span class="chat-compose-avatar">${escapeHtml((profile.full_name || "?").slice(0, 1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${escapeHtml(profile.full_name || "Unknown")}</strong>
                      <span>${escapeHtml(roleLabel(profile.role))}</span>
                    </span>
                  </label>
                `;
              }).join("")}
              ${!filteredProfiles.length ? `<div class="chat-muted">No matching people.</div>` : ""}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${escapeHtml(oneSelectedId)}"${selectedCount === 1 ? "" : " disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${escapeHtml(state.composeGroupTitle)}">
                <button type="button" data-chat-create-group${state.composeGroupTitle.trim() ? "" : " disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </div>
            </div>
          </div>
        `;
      }

      function mentionPicker(conversation) {
        if (state.mentionQuery === null || !conversation) return "";
        const matches = matchingMentionCandidates(conversation);
        if (!matches.length) return "";
        const activeIndex = Math.min(state.mentionIndex, matches.length - 1);
        return `
          <div class="chat-compose-popover chat-mention-picker" data-chat-mention-picker role="listbox" aria-label="Mention someone">
            ${matches.map((profile, index) => `
              <button
                type="button"
                class="chat-compose-person chat-mention-option${index === activeIndex ? " active" : ""}"
                data-chat-mention-pick="${escapeHtml(profile.id)}"
                role="option"
                aria-selected="${index === activeIndex}"
              >
                <span class="chat-compose-avatar">${escapeHtml((profile.full_name || "?").slice(0, 1))}</span>
                <span class="chat-compose-person-copy">
                  <strong>${escapeHtml(profile.full_name || "Unknown")}</strong>
                  <span>${escapeHtml(roleLabel(profile.role))}</span>
                </span>
              </button>
            `).join("")}
          </div>
        `;
      }

      function membersPanel(conversation) {
        if (!state.membersOpen || !conversation || conversation.kind !== "group") return "";
        const activeMembers = conversation.members.filter((member) => !member.left_at);
        const manager = canManageMembers(conversation);
        const activeMemberIds = new Set(activeMembers.map((member) => member.user_id));
        const query = state.memberSearch.trim().toLowerCase();
        const selectableProfiles = state.profiles.filter((profile) => (
          profile.id !== context.currentUser.id
          && !activeMemberIds.has(profile.id)
          && (!query || (profile.full_name || "").toLowerCase().includes(query))
        ));
        const selectedCount = state.memberSelectedIds.size;
        return `
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${activeMembers.map((member) => {
                const profile = member.profile || {};
                const isSelf = member.user_id === context.currentUser.id;
                const canRemove = manager || isSelf;
                return `
                  <div class="chat-member-row" data-chat-member-row="${escapeHtml(member.user_id)}">
                    <span class="chat-compose-avatar">${escapeHtml((profile.full_name || "?").slice(0, 1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${escapeHtml(profile.full_name || member.user_id)}</strong>
                      <span>${escapeHtml(profile.role ? roleLabel(profile.role) : "Member")}</span>
                    </span>
                    ${member.membership_role === "owner" ? `<span class="chat-owner-badge">Owner</span>` : ""}
                    ${manager ? `
                      <button type="button" class="chat-member-promote" data-chat-promote-member="${escapeHtml(member.user_id)}" data-chat-role="${member.membership_role === "owner" ? "member" : "owner"}">
                        <i class="ti ${member.membership_role === "owner" ? "ti-user-minus" : "ti-shield-plus"}"></i><span>${member.membership_role === "owner" ? "Remove owner" : "Make owner"}</span>
                      </button>
                    ` : ""}
                    ${canRemove ? `
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${escapeHtml(member.user_id)}">
                        <i class="ti ${isSelf ? "ti-logout" : "ti-user-minus"}"></i><span>${isSelf ? "Leave" : "Remove"}</span>
                      </button>
                    ` : ""}
                  </div>
                `;
              }).join("")}
            </div>
            ${manager ? `
              <div class="chat-member-add">
                <button type="button" class="chat-member-add-toggle" data-chat-member-add-toggle>
                  <i class="ti ti-user-plus"></i><span>Add member</span>
                </button>
                ${state.memberAddOpen ? `
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${escapeHtml(state.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${selectedCount} selected</div>
                  <div class="chat-compose-list">
                    ${selectableProfiles.map((profile) => {
                      const checked = state.memberSelectedIds.has(profile.id) ? " checked" : "";
                      return `
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${escapeHtml(profile.id)}"${checked}>
                          <span class="chat-compose-avatar">${escapeHtml((profile.full_name || "?").slice(0, 1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${escapeHtml(profile.full_name || "Unknown")}</strong>
                            <span>${escapeHtml(roleLabel(profile.role))}</span>
                          </span>
                        </label>
                      `;
                    }).join("")}
                    ${!selectableProfiles.length ? `<div class="chat-muted">No matching people.</div>` : ""}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${escapeHtml(conversation.id)}"${selectedCount ? "" : " disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                  </div>
                ` : ""}
              </div>
            ` : ""}
          </div>
        `;
      }

      function messageSnippet(message) {
        const body = message.deleted_at ? "Message deleted" : message.body || "";
        return body.length > 90 ? `${body.slice(0, 87)}...` : body;
      }

      function quotedReference(message) {
        if (!message?.reply_to_id) return "";
        const referenced = state.messages.find((row) => row.id === message.reply_to_id);
        if (!referenced) {
          return `<div class="chat-quote"><span>Replying to a message</span></div>`;
        }
        return `
          <div class="chat-quote">
            <strong>${escapeHtml(referenced.sender?.full_name || "Unknown")}</strong>
            <span>${escapeHtml(messageSnippet(referenced))}</span>
          </div>
        `;
      }

      function replyStrip() {
        const message = state.messages.find((row) => row.id === state.replyToMessageId);
        if (!message) return "";
        return `
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${escapeHtml(message.sender?.full_name || "Unknown")}</strong>
              <span>${escapeHtml(messageSnippet(message))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `;
      }

      function pendingAttachmentsStrip() {
        if (!state.pendingAttachments.length) return "";
        return `
          <div class="chat-pending-attachments">
            ${state.pendingAttachments.map((entry) => `
              <div class="chat-pending-attachment${entry.status === "error" ? " error" : ""}" data-chat-pending-attachment="${escapeHtml(entry.id)}">
                <i class="ti ${entry.status === "error" ? "ti-alert-triangle" : isImageMime(entry.mime) ? "ti-photo" : fileIconClass(entry.mime)}"></i>
                <span class="chat-pending-attachment-name">${escapeHtml(entry.name)}</span>
                ${entry.status === "uploading" ? `<span class="chat-pending-attachment-status">Uploading…</span>` : ""}
                ${entry.status === "error" ? `<span class="chat-pending-attachment-status">${escapeHtml(entry.error || "Failed")}</span>` : ""}
                <button type="button" data-chat-remove-pending="${escapeHtml(entry.id)}" aria-label="Remove attachment"><i class="ti ti-x"></i></button>
              </div>
            `).join("")}
          </div>
        `;
      }

      function attachmentHtml(attachment) {
        const cached = signedUrlCache.get(attachment.path);
        const url = cached && cached.expiresAt > Date.now() ? cached.url : null;
        if (isImageMime(attachment.mime)) {
          return url
            ? `<a class="chat-attachment-image-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">
                 <img class="chat-attachment-image" src="${escapeHtml(url)}" alt="${escapeHtml(attachment.name)}">
               </a>`
            : `<div class="chat-attachment-image chat-attachment-image-loading"><i class="ti ti-photo"></i></div>`;
        }
        return `
          <a class="chat-attachment-file" href="${url ? escapeHtml(url) : "#"}" target="_blank" rel="noopener" data-chat-attachment-path="${escapeHtml(attachment.path)}">
            <i class="ti ${fileIconClass(attachment.mime)}"></i>
            <span class="chat-attachment-file-copy">
              <strong>${escapeHtml(attachment.name)}</strong>
              <span>${escapeHtml(formatFileSize(attachment.size))}</span>
            </span>
            <i class="ti ti-download"></i>
          </a>
        `;
      }

      function attachmentsHtml(message) {
        if (!message.attachments?.length) return "";
        return `<div class="chat-message-attachments">${message.attachments.map(attachmentHtml).join("")}</div>`;
      }

      // Signed URLs expire server-side after an hour; refresh a little early
      // and cache so render()'s wholesale innerHTML rewrite (every poll)
      // doesn't re-sign every attachment on every tick.
      async function ensureAttachmentUrls() {
        const paths = new Set();
        for (const message of state.messages) {
          for (const attachment of message.attachments || []) paths.add(attachment.path);
        }
        let fetchedAny = false;
        for (const path of paths) {
          const cached = signedUrlCache.get(path);
          if ((cached && cached.expiresAt > Date.now()) || signedUrlFetching.has(path)) continue;
          signedUrlFetching.add(path);
          try {
            const url = await context.service.getSignedAttachmentUrl(path);
            signedUrlCache.set(path, { url, expiresAt: Date.now() + 55 * 60 * 1000 });
            fetchedAny = true;
          } catch (error) {
            console.error("Failed to sign chat attachment URL", error);
          } finally {
            signedUrlFetching.delete(path);
          }
        }
        if (fetchedAny && !disposed) render();
      }

      function editForm(message) {
        return `
          <form class="chat-edit-form" data-chat-edit-form="${escapeHtml(message.id)}">
            <input data-chat-edit-input="${escapeHtml(message.id)}" type="text" value="${escapeHtml(state.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `;
      }

      // Highlights @names in a message body. Escapes FIRST and then matches
      // against escaped names, so no unescaped input can ever reach the DOM.
      function messageBodyHtml(message) {
        const escaped = escapeHtml(message.body);
        const conversation = state.conversations.find((row) => row.id === message.conversation_id)
          || state.conversations.find((row) => row.id === state.selectedConversationId)
          || null;
        const people = mentionCandidates(conversation);
        const names = mentionedNames(message.body, people);
        if (!names.length) return escaped;

        const selfNames = new Set(
          people
            .filter((profile) => profile.id === context.currentUser.id)
            .map((profile) => String(profile.full_name)),
        );
        let html = escaped;
        for (const name of names) {
          const needle = `@${escapeHtml(name)}`;
          const className = selfNames.has(name) ? "chat-mention chat-mention-self" : "chat-mention";
          html = html.split(needle).join(`<span class="${className}">${needle}</span>`);
        }
        return html;
      }

      function messageRow(message, showHeader = true) {
        const mine = message.sender_id === context.currentUser.id ? " mine" : "";
        const isDeleted = Boolean(message.deleted_at);
        const canEdit = mine && !isDeleted;
        const canDelete = !isDeleted && (mine || canModerateDelete());
        const edited = message.edited_at && !isDeleted ? `<span class="chat-edited">(edited)</span>` : "";
        const actionButtons = !isDeleted ? `
            <button type="button" data-chat-reply="${escapeHtml(message.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${canEdit ? `<button type="button" data-chat-edit="${escapeHtml(message.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>` : ""}
            ${canDelete ? `<button type="button" data-chat-delete="${escapeHtml(message.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>` : ""}
        ` : "";
        const actions = !isDeleted ? `
          <div class="chat-message-actions" aria-label="Message actions">
            ${actionButtons}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${escapeHtml(message.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${state.openMessageMenuId === message.id ? `
            <div class="chat-message-menu" data-chat-message-menu-panel="${escapeHtml(message.id)}">
              ${actionButtons}
            </div>
          ` : ""}
          ${state.confirmingDeleteMessageId === message.id ? `
            <div class="chat-delete-confirm">
              <span>Delete message?</span>
              <button type="button" data-chat-confirm-delete="${escapeHtml(message.id)}">Confirm</button>
              <button type="button" data-chat-cancel-delete="${escapeHtml(message.id)}">Cancel</button>
            </div>
          ` : ""}
        ` : "";
        return `
          <div class="chat-message${mine}${isDeleted ? " deleted" : ""}${showHeader ? "" : " chat-message-grouped"}" tabindex="0" data-chat-message-id="${escapeHtml(message.id)}">
            ${showHeader ? `
              <div class="chat-message-meta">
                <span>${escapeHtml(message.sender?.full_name || "Unknown")}</span>
                <span>#${message.message_seq} ${edited}</span>
              </div>
            ` : ""}
            ${quotedReference(message)}
            ${state.editingMessageId === message.id ? editForm(message) : `
              ${message.body.trim() ? `<div class="chat-message-body">${isDeleted ? escapeHtml("Message deleted") : messageBodyHtml(message)}</div>` : ""}
              ${!isDeleted ? attachmentsHtml(message) : ""}
            `}
            ${actions}
          </div>
        `;
      }

      function render() {
        const shouldScrollAfterRender = forceScrollBottom || wasScrolledNearBottom();
        forceScrollBottom = false;
        const selected = state.conversations.find((conversation) => conversation.id === state.selectedConversationId) || null;
        const selectableProfiles = state.profiles.filter((profile) => profile.id !== context.currentUser.id);
        const selfMember = selected?.members.find((member) => member.user_id === context.currentUser.id);
        const muted = selfMember?.notification_level === "muted";
        const activeMembers = selected?.members.filter((member) => !member.left_at) || [];
        const manager = selected ? canManageMembers(selected) : false;
        const canArchive = selected ? canArchiveConversation(selected) : false;
        root.innerHTML = `
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${escapeHtml(roleLabel(context.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${composePopover(selectableProfiles)}
              <div class="chat-conversation-list">
                ${state.loading ? `<div class="chat-muted">Loading...</div>` : ""}
                ${state.conversations.map(conversationItem).join("")}
                ${!state.loading && !state.conversations.length ? `<div class="chat-muted">No conversations yet.</div>` : ""}
              </div>
            </aside>
            <main class="chat-thread">
              ${state.error ? `<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${escapeHtml(state.error)}</span></div>` : ""}
              ${selected ? `
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations"><i class="ti ti-arrow-left"></i></button>
                  <div>
                    <div class="chat-eyebrow">${selected.kind === "dm" ? "Direct message" : "Group"}</div>
                    ${state.renameOpen ? `
                      <form class="chat-rename-form" data-chat-rename-form>
                        <input data-chat-rename-input type="text" value="${escapeHtml(state.renameDraft)}" placeholder="Group name">
                        <button type="submit" aria-label="Save name"><i class="ti ti-check"></i></button>
                        <button type="button" data-chat-rename-cancel aria-label="Cancel rename"><i class="ti ti-x"></i></button>
                      </form>
                    ` : `<h2>${escapeHtml(conversationDisplayTitle(selected, context.currentUser.id))}</h2>`}
                  </div>
                  <div class="chat-thread-tools">
                    ${selected.kind === "group" ? `
                      <button type="button" class="chat-icon-btn${state.membersOpen ? " active" : ""}" data-chat-members-toggle aria-label="Manage members" title="Manage members">
                        <i class="ti ti-users"></i>
                      </button>
                    ` : ""}
                    ${selected.kind === "group" && manager ? `
                      <button type="button" class="chat-icon-btn" data-chat-rename-toggle aria-label="Rename group" title="Rename group">
                        <i class="ti ti-edit"></i>
                      </button>
                    ` : ""}
                    ${canArchive ? `
                      <button type="button" class="chat-icon-btn" data-chat-archive-toggle aria-label="Archive conversation" title="Archive conversation">
                        <i class="ti ti-archive"></i>
                      </button>
                    ` : ""}
                    <button type="button" class="chat-icon-btn${muted ? " active" : ""}" data-chat-toggle-mute aria-label="${muted ? "Unmute conversation" : "Mute conversation"}" title="${muted ? "Unmute conversation" : "Mute conversation"}">
                      <i class="ti ${muted ? "ti-bell-off" : "ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${activeMembers.map((member) => `<span title="${escapeHtml(member.profile?.full_name || member.user_id)}">${escapeHtml((member.profile?.full_name || "?").slice(0, 1))}</span>`).join("")}
                    </div>
                  </div>
                  ${membersPanel(selected)}
                  ${state.archiveConfirmOpen ? `
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Archive this ${selected.kind === "group" ? "group" : "conversation"}?</span>
                      <button type="button" data-chat-confirm-archive>Confirm</button>
                      <button type="button" data-chat-cancel-archive>Cancel</button>
                    </div>
                  ` : ""}
                </header>
                <div class="chat-message-list">
                  ${state.messages.map((message, index) => messageRow(message, shouldShowMessageHeader(message, state.messages[index - 1]))).join("")}
                  ${!state.messages.length ? `<div class="chat-muted">No messages yet.</div>` : ""}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${replyStrip()}
                  ${pendingAttachmentsStrip()}
                  ${mentionPicker(selected)}
                  <input type="file" data-chat-file-input multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" hidden>
                  <button type="button" class="chat-attach-btn" data-chat-attach-toggle aria-label="Attach a file" title="Attach a file">
                    <i class="ti ti-paperclip"></i>
                  </button>
                  <textarea data-chat-composer rows="1" placeholder="Write a message..."></textarea>
                  <button type="submit"><i class="ti ti-send"></i><span>Send</span></button>
                </form>
              ` : `
                <div class="chat-empty-panel">
                  <i class="ti ti-messages"></i>
                  <h2>No conversation selected</h2>
                  <p>Start a DM or create a group to begin.</p>
                </div>
              `}
            </main>
          </section>
        `;
        root.querySelectorAll("[data-chat-select]").forEach((button) => {
          button.addEventListener("click", () => selectConversation(button.dataset.chatSelect));
        });
        root.querySelector("[data-chat-back]")?.addEventListener("click", () => clearMobileSelection());
        root.querySelector("[data-chat-toggle-mute]")?.addEventListener("click", () => {
          if (selected) toggleMute(selected);
        });
        root.querySelector("[data-chat-members-toggle]")?.addEventListener("click", () => {
          if (!selected) return;
          if (state.membersOpen) closeMembers();
          else openMembers();
        });
        root.querySelector("[data-chat-members-close]")?.addEventListener("click", () => closeMembers({ reset: true }));
        root.querySelector("[data-chat-rename-toggle]")?.addEventListener("click", () => {
          if (selected) openRename(selected);
        });
        root.querySelector("[data-chat-rename-cancel]")?.addEventListener("click", () => closeRename());
        root.querySelector("[data-chat-rename-form]")?.addEventListener("submit", (event) => {
          event.preventDefault();
          if (selected) renameConversation(selected, state.renameDraft);
        });
        root.querySelector("[data-chat-rename-input]")?.addEventListener("input", (event) => {
          state.renameDraft = event.currentTarget.value;
        });
        root.querySelector("[data-chat-archive-toggle]")?.addEventListener("click", () => openArchiveConfirm());
        root.querySelector("[data-chat-confirm-archive]")?.addEventListener("click", () => {
          if (selected) setConversationArchived(selected, true);
        });
        root.querySelector("[data-chat-cancel-archive]")?.addEventListener("click", () => closeArchiveConfirm());
        root.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click", () => toggleMemberAdd());
        root.querySelector("[data-chat-member-search]")?.addEventListener("input", (event) => {
          state.memberSearch = event.currentTarget.value;
          render();
          const input = root.querySelector("[data-chat-member-search]");
          input?.focus();
          input?.setSelectionRange?.(input.value.length, input.value.length);
        });
        root.querySelectorAll("[data-chat-member-pick]").forEach((checkbox) => {
          checkbox.addEventListener("change", () => toggleMemberPicker(checkbox.dataset.chatMemberPick, checkbox.checked));
        });
        root.querySelector("[data-chat-add-members]")?.addEventListener("click", (event) => {
          addSelectedMembers(event.currentTarget.dataset.chatAddMembers);
        });
        root.querySelectorAll("[data-chat-remove-member]").forEach((button) => {
          button.addEventListener("click", () => {
            if (selected) removeMember(selected.id, button.dataset.chatRemoveMember);
          });
        });
        root.querySelectorAll("[data-chat-promote-member]").forEach((button) => {
          button.addEventListener("click", () => {
            if (selected) setMemberRole(selected.id, button.dataset.chatPromoteMember, button.dataset.chatRole);
          });
        });
        root.querySelector("[data-chat-compose-toggle]")?.addEventListener("click", () => {
          if (state.composeOpen) closeCompose();
          else openCompose();
        });
        root.querySelector("[data-chat-compose-close]")?.addEventListener("click", () => closeCompose());
        root.querySelector("[data-chat-compose-search]")?.addEventListener("input", (event) => {
          state.composeSearch = event.currentTarget.value;
          render();
          const input = root.querySelector("[data-chat-compose-search]");
          input?.focus();
          input?.setSelectionRange?.(input.value.length, input.value.length);
        });
        root.querySelectorAll("[data-chat-compose-member]").forEach((checkbox) => {
          checkbox.addEventListener("change", () => toggleComposeMember(checkbox.dataset.chatComposeMember, checkbox.checked));
        });
        root.querySelector("[data-chat-group-title]")?.addEventListener("input", (event) => {
          state.composeGroupTitle = event.currentTarget.value;
          render();
          const input = root.querySelector("[data-chat-group-title]");
          input?.focus();
          input?.setSelectionRange?.(input.value.length, input.value.length);
        });
        root.querySelector("[data-chat-start-dm]")?.addEventListener("click", (event) => {
          startDm(event.currentTarget.dataset.chatStartDm);
        });
        root.querySelector("[data-chat-create-group]")?.addEventListener("click", () => {
          createGroup(state.composeGroupTitle, [...state.composeSelectedMemberIds]);
        });
        const sendForm = root.querySelector("[data-chat-send-form]");
        sendForm?.addEventListener("submit", (event) => {
          event.preventDefault();
          sendMessage(event.currentTarget);
        });
        const composerTextarea = root.querySelector("[data-chat-composer]");
        composerTextarea?.addEventListener("input", () => {
          autoGrowComposer(composerTextarea);
          if (!syncMentionPicker(composerTextarea)) return;
          const { value, selectionStart } = composerTextarea;
          render();
          const restored = root.querySelector("[data-chat-composer]");
          if (!restored) return;
          restored.value = value;
          autoGrowComposer(restored);
          restored.focus();
          restored.setSelectionRange?.(selectionStart, selectionStart);
        });
        composerTextarea?.addEventListener("keydown", (event) => {
          // The picker owns these keys while it is open, so Enter must select a
          // person rather than fall through to the send branch below.
          if (state.mentionQuery !== null && selected) {
            const matches = matchingMentionCandidates(selected);
            if (matches.length) {
              if (event.key === "ArrowDown") { event.preventDefault(); moveMentionSelection(selected, 1); return; }
              if (event.key === "ArrowUp") { event.preventDefault(); moveMentionSelection(selected, -1); return; }
              if (event.key === "Enter" || event.key === "Tab") {
                event.preventDefault();
                applyMention(selected, matches[Math.min(state.mentionIndex, matches.length - 1)]);
                return;
              }
            }
            if (event.key === "Escape") { event.preventDefault(); closeMentionPicker(); return; }
          }
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendForm?.requestSubmit();
          }
        });
        root.querySelectorAll("[data-chat-mention-pick]").forEach((button) => {
          button.addEventListener("mousedown", (event) => {
            // mousedown, not click: the textarea must not lose focus first.
            event.preventDefault();
            const profile = mentionCandidates(selected).find((row) => row.id === button.dataset.chatMentionPick);
            if (profile) applyMention(selected, profile);
          });
        });
        root.querySelector("[data-chat-clear-reply]")?.addEventListener("click", () => clearReply());
        root.querySelectorAll("[data-chat-reply]").forEach((button) => {
          button.addEventListener("click", () => startReply(button.dataset.chatReply));
        });
        root.querySelectorAll("[data-chat-edit]").forEach((button) => {
          button.addEventListener("click", () => startEdit(button.dataset.chatEdit));
        });
        root.querySelectorAll("[data-chat-delete]").forEach((button) => {
          button.addEventListener("click", () => {
            state.confirmingDeleteMessageId = button.dataset.chatDelete;
            state.openMessageMenuId = null;
            render();
          });
        });
        root.querySelectorAll("[data-chat-message-menu]").forEach((button) => {
          button.addEventListener("click", () => {
            state.openMessageMenuId = state.openMessageMenuId === button.dataset.chatMessageMenu ? null : button.dataset.chatMessageMenu;
            state.confirmingDeleteMessageId = null;
            render();
          });
        });
        root.querySelectorAll("[data-chat-confirm-delete]").forEach((button) => {
          button.addEventListener("click", () => deleteMessage(button.dataset.chatConfirmDelete));
        });
        root.querySelectorAll("[data-chat-cancel-delete]").forEach((button) => {
          button.addEventListener("click", () => {
            if (state.confirmingDeleteMessageId === button.dataset.chatCancelDelete) state.confirmingDeleteMessageId = null;
            render();
          });
        });
        root.querySelectorAll("[data-chat-edit-form]").forEach((form) => {
          form.addEventListener("submit", (event) => {
            event.preventDefault();
            submitEdit(event.currentTarget);
          });
        });
        root.querySelectorAll("[data-chat-cancel-edit]").forEach((button) => {
          button.addEventListener("click", () => cancelEdit());
        });
        const fileInput = root.querySelector("[data-chat-file-input]");
        root.querySelector("[data-chat-attach-toggle]")?.addEventListener("click", () => fileInput?.click());
        fileInput?.addEventListener("change", (event) => {
          addPendingFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        });
        root.querySelectorAll("[data-chat-remove-pending]").forEach((button) => {
          button.addEventListener("click", () => removePendingAttachment(button.dataset.chatRemovePending));
        });
        const dropTarget = root.querySelector("[data-chat-send-form]");
        dropTarget?.addEventListener("dragover", (event) => event.preventDefault());
        dropTarget?.addEventListener("drop", (event) => {
          event.preventDefault();
          if (event.dataTransfer?.files?.length) addPendingFiles(event.dataTransfer.files);
        });
        composerTextarea?.addEventListener("paste", (event) => {
          const files = [...(event.clipboardData?.files || [])];
          if (files.length) addPendingFiles(files);
        });
        if (shouldScrollAfterRender) scrollMessageListToBottom();
        ensureAttachmentUrls();
      }

      refresh();
      refreshTimer = setInterval(() => refresh(), 30000);
      if (typeof context.service.subscribeToConversationEvents === "function") {
        unsubscribeRealtime = context.service.subscribeToConversationEvents(() => scheduleRefresh());
      }

      return () => {
        disposed = true;
        if (refreshTimer) clearInterval(refreshTimer);
        if (unsubscribeRealtime) unsubscribeRealtime();
        root.removeEventListener?.("click", handleRootClick);
        if (typeof document !== "undefined") {
          document.removeEventListener("keydown", handleDocumentKeydown);
        }
        root.classList.remove("wein-chat-root");
        root.classList.remove("chat-has-selection");
        root.innerHTML = "";
      };
    },
  };
}
