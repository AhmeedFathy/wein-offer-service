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
        loading: true,
        error: null,
      };
      let disposed = false;
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
          if (!state.selectedConversationId && state.conversations.length) {
            state.selectedConversationId = state.conversations[0].id;
          }
          if (state.selectedConversationId && keepMessages) {
            state.messages = await context.service.listMessages(state.selectedConversationId);
            const lastSeq = state.messages.at(-1)?.message_seq || 0;
            if (lastSeq) await context.service.markRead(state.selectedConversationId, lastSeq);
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
        const lastSeq = state.messages.at(-1)?.message_seq || 0;
        if (lastSeq) await context.service.markRead(conversationId, lastSeq);
        await refresh();
      }

      function clearMobileSelection() {
        root.classList.remove("chat-has-selection");
      }

      async function sendMessage(form) {
        const input = form.querySelector("[data-chat-composer]");
        const body = input.value.trim();
        if (!body || !state.selectedConversationId) return;
        input.value = "";
        const message = await context.service.sendMessage({
          conversationId: state.selectedConversationId,
          body,
          clientNonce: makeClientNonce("portal-chat"),
        });
        state.messages = [...state.messages, message];
        await context.service.markRead(state.selectedConversationId, message.message_seq);
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

      function messageRow(message) {
        const mine = message.sender_id === context.currentUser.id ? " mine" : "";
        return `
          <div class="chat-message${mine}">
            <div class="chat-message-meta">
              <span>${escapeHtml(message.sender?.full_name || "Unknown")}</span>
              <span>#${message.message_seq}</span>
            </div>
            <div class="chat-message-body">${escapeHtml(message.body)}</div>
          </div>
        `;
      }

      function render() {
        const selected = state.conversations.find((conversation) => conversation.id === state.selectedConversationId) || null;
        const selectableProfiles = state.profiles.filter((profile) => profile.id !== context.currentUser.id);
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
                <button type="submit">Create group</button>
              </form>
              <div class="chat-conversation-list">
                ${state.loading ? `<div class="chat-muted">Loading...</div>` : ""}
                ${state.conversations.map(conversationItem).join("")}
                ${!state.loading && !state.conversations.length ? `<div class="chat-muted">No conversations yet.</div>` : ""}
              </div>
            </aside>
            <main class="chat-thread">
              ${state.error ? `<div class="chat-error">${escapeHtml(state.error)}</div>` : ""}
              ${selected ? `
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations">Back</button>
                  <div>
                    <div class="chat-eyebrow">${selected.kind === "dm" ? "Direct message" : "Group"}</div>
                    <h2>${escapeHtml(conversationDisplayTitle(selected, context.currentUser.id))}</h2>
                  </div>
                  <div class="chat-member-stack">
                    ${selected.members.map((member) => `<span title="${escapeHtml(member.profile?.full_name || member.user_id)}">${escapeHtml((member.profile?.full_name || "?").slice(0, 1))}</span>`).join("")}
                  </div>
                </header>
                <div class="chat-message-list">
                  ${state.messages.map(messageRow).join("")}
                  ${!state.messages.length ? `<div class="chat-muted">No messages yet.</div>` : ""}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  <input data-chat-composer type="text" placeholder="Write a message...">
                  <button type="submit">Send</button>
                </form>
              ` : `
                <div class="chat-empty-panel">
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
        root.querySelector("[data-chat-dm]")?.addEventListener("change", (event) => startDm(event.currentTarget));
        root.querySelector("[data-chat-group-form]")?.addEventListener("submit", (event) => {
          event.preventDefault();
          createGroup(event.currentTarget);
        });
        root.querySelector("[data-chat-send-form]")?.addEventListener("submit", (event) => {
          event.preventDefault();
          sendMessage(event.currentTarget);
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
