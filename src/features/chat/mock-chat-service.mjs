import { unreadCount } from "./chat-domain.mjs";

function id(prefix) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(36)}`;
}

function iso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Two independent createMockChatService() calls never see each other's data
// by default -- each gets its own fresh Maps. That's fine for single-actor
// tests, but silently wrong for anything that needs to prove a multi-user
// invariant (e.g. "a channel one admin creates is visible to a different
// user who never touched it"): without a shared store, a second actor's
// service is just an empty workspace, and any "they can/can't see it"
// assertion against it passes or fails for the wrong reason. Pass the same
// object (from createSharedChatStore()) to multiple createMockChatService()
// calls to put them in one shared workspace.
export function createSharedChatStore() {
  return {
    conversations: new Map(),
    messages: new Map(),
    dmPairs: new Map(),
    storedFiles: new Map(),
  };
}

export function createMockChatService(currentUserId, sharedStore = null) {
  const profiles = [
    { id: "u-ahmed", full_name: "Ahmed Fathy", role: "admin", email: "af8847492@gmail.com" },
    { id: "u-fady", full_name: "Fady Abdo", role: "admin", email: "fady@wein.local" },
    { id: "u-team", full_name: "Portal Chat Team Test", role: "team", email: "portal-chat-team-test@wein-test.local" },
  ];
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const actorId = currentUserId || profiles[0].id;

  const conversations = sharedStore?.conversations || new Map();
  const messages = sharedStore?.messages || new Map();
  const dmPairs = sharedStore?.dmPairs || new Map();
  const storedFiles = sharedStore?.storedFiles || new Map(); // path -> { name, mime, size }

  function decorateConversation(conversation) {
    const conversationMessages = messages.get(conversation.id) || [];
    const lastMessage = conversationMessages[conversationMessages.length - 1] || null;
    const decorated = {
      ...conversation,
      members: conversation.members.map((member) => ({
        ...member,
        profile: profileById.get(member.user_id) || null,
      })),
      last_message: lastMessage ? { ...lastMessage, sender: profileById.get(lastMessage.sender_id) || null } : null,
    };
    decorated.unread_count = unreadCount(decorated, actorId);
    return decorated;
  }

  function requireConversation(conversationId) {
    const conversation = conversations.get(conversationId);
    if (!conversation) throw new Error(`Conversation not found: ${conversationId}`);
    return conversation;
  }

  function requireActiveMember(conversation, userId = actorId) {
    const member = conversation.members.find((row) => row.user_id === userId && !row.left_at);
    if (!member) throw new Error("Active membership required");
    return member;
  }

  function addMemberRow(conversation, userId, membershipRole = "member") {
    if (!profileById.has(userId)) throw new Error(`Unknown profile: ${userId}`);
    const existing = conversation.members.find((member) => member.user_id === userId);
    if (existing) {
      existing.left_at = null;
      existing.membership_role = membershipRole;
      return;
    }
    conversation.members.push({
      conversation_id: conversation.id,
      user_id: userId,
      membership_role: membershipRole,
      joined_at: iso(),
      left_at: null,
      last_read_seq: 0,
      notification_level: "all",
    });
  }

  function canManageMembers(conversation) {
    const actor = profileById.get(actorId);
    return conversation.members.some((member) => (
      member.user_id === actorId
      && member.membership_role === "owner"
      && !member.left_at
    )) || ["admin", "manager"].includes(actor?.role);
  }

  async function createGroup(title, memberIds = []) {
    if (!title || !title.trim()) throw new Error("Group title is required");
    const conversation = {
      id: id("group"),
      kind: "group",
      title: title.trim(),
      created_by: actorId,
      created_at: iso(),
      archived_at: null,
      members: [],
    };
    addMemberRow(conversation, actorId, "owner");
    for (const memberId of memberIds) addMemberRow(conversation, memberId, "member");
    conversations.set(conversation.id, conversation);
    messages.set(conversation.id, []);
    return conversation.id;
  }

  // Unlike a group (invite-only, an owner has to add you), a channel is
  // discoverable and self-service joinable by anyone -- creating one is the
  // only part that's restricted, matching the real wein_chat_create_channel
  // RPC's admin/manager-only check (061_chat_channels.sql).
  async function createChannel(title) {
    const actor = profileById.get(actorId);
    if (!["admin", "manager"].includes(actor?.role)) throw new Error("only an admin or manager may create a channel");
    if (!title || !title.trim()) throw new Error("Channel name is required");
    const conversation = {
      id: id("channel"),
      kind: "channel",
      title: title.trim(),
      created_by: actorId,
      created_at: iso(),
      archived_at: null,
      members: [],
    };
    addMemberRow(conversation, actorId, "owner");
    conversations.set(conversation.id, conversation);
    messages.set(conversation.id, []);
    return conversation.id;
  }

  async function joinChannel(conversationId) {
    const conversation = requireConversation(conversationId);
    if (conversation.kind !== "channel") throw new Error("only channels can be joined this way");
    if (conversation.archived_at) throw new Error("this channel has been archived");
    // Rejoining must not demote the channel's owner: leaving keeps the
    // membership_role and only sets left_at, so passing a flat "member" here
    // would strip ownership from a creator who left and came back. Mirrors the
    // CASE in wein_chat_join_channel's ON CONFLICT (061_chat_channels.sql).
    const existing = conversation.members.find((member) => member.user_id === actorId);
    addMemberRow(conversation, actorId, existing?.membership_role === "owner" ? "owner" : "member");
  }

  async function listChannels() {
    return clone(
      [...conversations.values()]
        .filter((conversation) => conversation.kind === "channel" && !conversation.archived_at)
        .map(({ id: channelId, kind, title, created_by, created_at, archived_at }) => (
          { id: channelId, kind, title, created_by, created_at, archived_at }
        ))
        .sort((a, b) => (a.title || "").localeCompare(b.title || "")),
    );
  }

  async function getOrCreateDm(otherUserId) {
    if (!otherUserId || otherUserId === actorId) throw new Error("Choose another person");
    const pair = [actorId, otherUserId].sort().join(":");
    if (dmPairs.has(pair)) return dmPairs.get(pair);
    const conversation = {
      id: id("dm"),
      kind: "dm",
      title: null,
      created_by: actorId,
      created_at: iso(),
      archived_at: null,
      members: [],
    };
    addMemberRow(conversation, actorId, "member");
    addMemberRow(conversation, otherUserId, "member");
    conversations.set(conversation.id, conversation);
    messages.set(conversation.id, []);
    dmPairs.set(pair, conversation.id);
    return conversation.id;
  }

  const service = {
    async listProfiles() {
      return clone(profiles);
    },

    async listConversations() {
      // Matches the real chat_conversations_select_member RLS policy: only
      // conversations the caller is an active member of. This matters now
      // that channels exist -- a channel someone else created must not show
      // up here until the actor actually joins it (listChannels() is the
      // separate "discover, not yet a member" view).
      return clone(
        [...conversations.values()]
          .filter((conversation) => conversation.members.some((member) => member.user_id === actorId && !member.left_at))
          .map(decorateConversation),
      );
    },

    async listMessages(conversationId) {
      const conversation = requireConversation(conversationId);
      requireActiveMember(conversation);
      return clone((messages.get(conversationId) || []).map((message) => ({
        ...message,
        sender: profileById.get(message.sender_id) || null,
      })));
    },

    async searchMessages(query) {
      const trimmed = (query || "").trim();
      if (!trimmed) return [];
      const needle = trimmed.toLowerCase();
      const hits = [];
      for (const conversation of conversations.values()) {
        const isActiveMember = conversation.members.some((row) => row.user_id === actorId && !row.left_at);
        if (!isActiveMember) continue;
        for (const message of messages.get(conversation.id) || []) {
          if (message.deleted_at) continue;
          if (!message.body?.toLowerCase().includes(needle)) continue;
          hits.push({ ...message, sender: profileById.get(message.sender_id) || null });
        }
      }
      hits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return clone(hits.slice(0, 50));
    },

    createGroup,

    createChannel,

    joinChannel,

    listChannels,

    getOrCreateDm,

    async addMember(conversationId, userId) {
      const conversation = requireConversation(conversationId);
      if (!canManageMembers(conversation)) throw new Error("Cannot add members");
      addMemberRow(conversation, userId, "member");
    },

    async removeMember(conversationId, userId) {
      const conversation = requireConversation(conversationId);
      if (userId !== actorId && !canManageMembers(conversation)) throw new Error("Cannot remove members");
      const member = conversation.members.find((row) => row.user_id === userId && !row.left_at);
      if (member) member.left_at = iso();
    },

    async renameConversation(conversationId, title) {
      const conversation = requireConversation(conversationId);
      if (!canManageMembers(conversation)) throw new Error("Cannot rename this conversation");
      const trimmed = (title || "").trim();
      if (!trimmed) throw new Error("Group title is required");
      conversation.title = trimmed;
    },

    async setConversationArchived(conversationId, archived) {
      const conversation = requireConversation(conversationId);
      if (!canManageMembers(conversation)) throw new Error("Cannot archive this conversation");
      conversation.archived_at = archived ? iso() : null;
    },

    async setMembershipRole(conversationId, userId, role) {
      const conversation = requireConversation(conversationId);
      if (!canManageMembers(conversation)) throw new Error("Cannot change member roles");
      const member = conversation.members.find((row) => row.user_id === userId && !row.left_at);
      if (!member) throw new Error(`Active member not found: ${userId}`);
      member.membership_role = role;
    },

    async uploadAttachment(conversationId, file) {
      requireActiveMember(requireConversation(conversationId));
      const safeName = String(file.name || "file").replace(/[^a-zA-Z0-9._-]+/g, "_");
      const path = `${conversationId}/${id("att")}-${safeName}`;
      const meta = { name: file.name || safeName, mime: file.type || "application/octet-stream", size: file.size || 0 };
      storedFiles.set(path, meta);
      return { path, ...meta };
    },

    async getSignedAttachmentUrl(path) {
      if (!storedFiles.has(path)) throw new Error(`Attachment not found: ${path}`);
      return `mock://chat-attachments/${path}`;
    },

    async sendMessage({ conversationId, body, clientNonce, replyToId = null, mentionedUserIds = [], attachments = [] }) {
      const conversation = requireConversation(conversationId);
      requireActiveMember(conversation);
      const trimmed = (body || "").trim();
      if (!trimmed && !attachments.length) throw new Error("Message body is required");
      const list = messages.get(conversationId) || [];
      const duplicate = list.find((message) => message.sender_id === actorId && message.client_nonce === clientNonce);
      if (duplicate) return clone(duplicate);
      const message = {
        id: id("msg"),
        conversation_id: conversationId,
        message_seq: list.length + 1,
        sender_id: actorId,
        body: trimmed,
        reply_to_id: replyToId,
        client_nonce: clientNonce,
        created_at: iso(),
        edited_at: null,
        deleted_at: null,
        mentioned_user_ids: [...mentionedUserIds],
        attachments: [...attachments],
      };
      list.push(message);
      messages.set(conversationId, list);
      return clone({ ...message, sender: profileById.get(actorId) || null });
    },

    async updateMessage(messageId, body, mentionedUserIds = []) {
      const trimmed = (body || "").trim();
      if (!trimmed) throw new Error("Message body is required");
      for (const [conversationId, list] of messages.entries()) {
        const message = list.find((row) => row.id === messageId);
        if (!message) continue;
        if (message.sender_id !== actorId || message.deleted_at) throw new Error("Cannot edit message");
        message.body = trimmed;
        message.edited_at = iso();
        message.mentioned_user_ids = [...mentionedUserIds];
        return clone({ ...message, sender: profileById.get(actorId) || null });
      }
      throw new Error(`Message not found: ${messageId}`);
    },

    async deleteMessage(messageId) {
      const actor = profileById.get(actorId);
      for (const [conversationId, list] of messages.entries()) {
        const message = list.find((row) => row.id === messageId);
        if (!message) continue;
        if (message.sender_id !== actorId && !["admin", "manager"].includes(actor?.role)) throw new Error("Cannot delete message");
        message.deleted_at = iso();
        return clone({ ...message, sender: profileById.get(message.sender_id) || null });
      }
      throw new Error(`Message not found: ${messageId}`);
    },

    async markRead(conversationId, lastReadSeq) {
      const conversation = requireConversation(conversationId);
      const member = requireActiveMember(conversation);
      member.last_read_seq = Math.max(member.last_read_seq, Number(lastReadSeq) || 0);
    },

    async setNotificationLevel(conversationId, level) {
      const conversation = requireConversation(conversationId);
      const member = requireActiveMember(conversation);
      if (!["all", "mentions", "muted"].includes(level)) throw new Error("Invalid notification level");
      member.notification_level = level;
    },

    subscribeToConversationEvents() {
      return () => {};
    },
  };

  service.__seed = async () => {
    const groupId = await createGroup("Launch room", ["u-fady", "u-team"]);
    await service.sendMessage({
      conversationId: groupId,
      body: "Use this room for launch coordination.",
      clientNonce: "seed-launch-1",
    });
    await getOrCreateDm("u-fady");
    return service;
  };

  return service;
}
