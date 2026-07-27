import {
  conversationDisplayTitle,
  makeClientNonce,
  messagePreview,
  sortConversations,
} from "./chat-domain.mjs";

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
        openMessageMenuId: null,
        confirmingDeleteMessageId: null,
        loading: true,
        error: null,
      };
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

      async function sendMessage(form) {
        const input = form.querySelector("[data-chat-composer]");
        const body = input.value.trim();
        if (!body || !state.selectedConversationId) return;
        const replyToId = state.replyToMessageId;
        input.value = "";
        state.replyToMessageId = null;
        const message = await context.service.sendMessage({
          conversationId: state.selectedConversationId,
          body,
          clientNonce: makeClientNonce("portal-chat"),
          replyToId,
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

      function canManageMembers(conversation) {
        if (!conversation || conversation.kind !== "group") return false;
        const self = conversation.members.find((member) => member.user_id === context.currentUser.id && !member.left_at);
        return self?.membership_role === "owner" || ["admin", "manager"].includes(context.currentUser.role);
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
        const updated = await context.service.updateMessage(messageId, body);
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

      function editForm(message) {
        return `
          <form class="chat-edit-form" data-chat-edit-form="${escapeHtml(message.id)}">
            <input data-chat-edit-input="${escapeHtml(message.id)}" type="text" value="${escapeHtml(state.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `;
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
            ${state.editingMessageId === message.id ? editForm(message) : `<div class="chat-message-body">${escapeHtml(isDeleted ? "Message deleted" : message.body)}</div>`}
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
                    <h2>${escapeHtml(conversationDisplayTitle(selected, context.currentUser.id))}</h2>
                  </div>
                  <div class="chat-thread-tools">
                    ${selected.kind === "group" ? `
                      <button type="button" class="chat-icon-btn${state.membersOpen ? " active" : ""}" data-chat-members-toggle aria-label="Manage members" title="Manage members">
                        <i class="ti ti-users"></i>
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
                </header>
                <div class="chat-message-list">
                  ${state.messages.map((message, index) => messageRow(message, shouldShowMessageHeader(message, state.messages[index - 1]))).join("")}
                  ${!state.messages.length ? `<div class="chat-muted">No messages yet.</div>` : ""}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${replyStrip()}
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
        composerTextarea?.addEventListener("input", () => autoGrowComposer(composerTextarea));
        composerTextarea?.addEventListener("keydown", (event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendForm?.requestSubmit();
          }
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
        if (shouldScrollAfterRender) scrollMessageListToBottom();
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
