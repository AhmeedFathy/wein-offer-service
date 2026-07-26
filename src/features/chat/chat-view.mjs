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
        loading: true,
        error: null,
      };
      let disposed = false;
      let initialConversationPending = context.initialConversationId || null;
      let refreshTimer = null;
      let unsubscribeRealtime = null;

      root.classList.add("wein-chat-root");

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
        root.classList.add("chat-has-selection");
        state.messages = await context.service.listMessages(conversationId);
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

      async function startDm(select) {
        const otherUserId = select.value;
        if (!otherUserId) return;
        const conversationId = await context.service.getOrCreateDm(otherUserId);
        select.value = "";
        await selectConversation(conversationId);
      }

      async function createGroup(form) {
        const titleInput = form.querySelector("[data-chat-group-title]");
        const memberSelect = form.querySelector("[data-chat-group-members]");
        const title = titleInput.value.trim();
        const memberIds = [...memberSelect.selectedOptions].map((option) => option.value);
        if (!title) return;
        const conversationId = await context.service.createGroup(title, memberIds);
        titleInput.value = "";
        for (const option of memberSelect.options) option.selected = false;
        await selectConversation(conversationId);
      }

      function scheduleRefresh() {
        if (disposed) return;
        refresh();
      }

      function conversationItem(conversation) {
        const selected = conversation.id === state.selectedConversationId ? " selected" : "";
        const unread = conversation.unread_count ? `<span class="chat-count">${conversation.unread_count}</span>` : "";
        return `
          <button type="button" class="chat-conversation${selected}" data-chat-select="${escapeHtml(conversation.id)}">
            <span class="chat-conversation-title">${escapeHtml(conversationDisplayTitle(conversation, context.currentUser.id))}</span>
            ${unread}
            <span class="chat-conversation-preview">${escapeHtml(messagePreview(conversation.last_message))}</span>
          </button>
        `;
      }

      function canModerateDelete() {
        return ["admin", "manager"].includes(context.currentUser.role);
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

      function messageRow(message) {
        const mine = message.sender_id === context.currentUser.id ? " mine" : "";
        const isDeleted = Boolean(message.deleted_at);
        const canEdit = mine && !isDeleted;
        const canDelete = !isDeleted && (mine || canModerateDelete());
        const edited = message.edited_at && !isDeleted ? `<span class="chat-edited">(edited)</span>` : "";
        const actions = !isDeleted ? `
          <div class="chat-message-actions">
            <button type="button" data-chat-reply="${escapeHtml(message.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${canEdit ? `<button type="button" data-chat-edit="${escapeHtml(message.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>` : ""}
            ${canDelete ? `<button type="button" data-chat-delete="${escapeHtml(message.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>` : ""}
          </div>
        ` : "";
        return `
          <div class="chat-message${mine}${isDeleted ? " deleted" : ""}">
            <div class="chat-message-meta">
              <span>${escapeHtml(message.sender?.full_name || "Unknown")}</span>
              <span>#${message.message_seq} ${edited}</span>
            </div>
            ${quotedReference(message)}
            ${state.editingMessageId === message.id ? editForm(message) : `<div class="chat-message-body">${escapeHtml(isDeleted ? "Message deleted" : message.body)}</div>`}
            ${actions}
          </div>
        `;
      }

      function render() {
        const selected = state.conversations.find((conversation) => conversation.id === state.selectedConversationId) || null;
        const selectableProfiles = state.profiles.filter((profile) => profile.id !== context.currentUser.id);
        const selfMember = selected?.members.find((member) => member.user_id === context.currentUser.id);
        const muted = selfMember?.notification_level === "muted";
        root.innerHTML = `
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <span class="chat-user-pill">${escapeHtml(roleLabel(context.currentUser.role))}</span>
              </div>
              <label class="chat-field">
                <span>Start DM</span>
                <select data-chat-dm>
                  <option value="">Choose person...</option>
                  ${selectableProfiles.map((profile) => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.full_name)}</option>`).join("")}
                </select>
              </label>
              <form class="chat-group-form" data-chat-group-form>
                <input data-chat-group-title type="text" placeholder="New group name">
                <select data-chat-group-members multiple size="3">
                  ${selectableProfiles.map((profile) => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.full_name)}</option>`).join("")}
                </select>
                <button type="submit"><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </form>
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
                    <button type="button" class="chat-icon-btn${muted ? " active" : ""}" data-chat-toggle-mute aria-label="${muted ? "Unmute conversation" : "Mute conversation"}" title="${muted ? "Unmute conversation" : "Mute conversation"}">
                      <i class="ti ${muted ? "ti-bell-off" : "ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${selected.members.map((member) => `<span title="${escapeHtml(member.profile?.full_name || member.user_id)}">${escapeHtml((member.profile?.full_name || "?").slice(0, 1))}</span>`).join("")}
                    </div>
                  </div>
                </header>
                <div class="chat-message-list">
                  ${state.messages.map(messageRow).join("")}
                  ${!state.messages.length ? `<div class="chat-muted">No messages yet.</div>` : ""}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${replyStrip()}
                  <input data-chat-composer type="text" placeholder="Write a message...">
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
        root.querySelector("[data-chat-dm]")?.addEventListener("change", (event) => startDm(event.currentTarget));
        root.querySelector("[data-chat-group-form]")?.addEventListener("submit", (event) => {
          event.preventDefault();
          createGroup(event.currentTarget);
        });
        root.querySelector("[data-chat-send-form]")?.addEventListener("submit", (event) => {
          event.preventDefault();
          sendMessage(event.currentTarget);
        });
        root.querySelector("[data-chat-clear-reply]")?.addEventListener("click", () => clearReply());
        root.querySelectorAll("[data-chat-reply]").forEach((button) => {
          button.addEventListener("click", () => startReply(button.dataset.chatReply));
        });
        root.querySelectorAll("[data-chat-edit]").forEach((button) => {
          button.addEventListener("click", () => startEdit(button.dataset.chatEdit));
        });
        root.querySelectorAll("[data-chat-delete]").forEach((button) => {
          button.addEventListener("click", () => deleteMessage(button.dataset.chatDelete));
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
        root.classList.remove("wein-chat-root");
        root.classList.remove("chat-has-selection");
        root.innerHTML = "";
      };
    },
  };
}
