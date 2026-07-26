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

export function createMockChatService(currentUserId) {
  const profiles = [
    { id: "u-ahmed", full_name: "Ahmed Fathy", role: "admin", email: "af8847492@gmail.com" },
    { id: "u-fady", full_name: "Fady Abdo", role: "admin", email: "fady@wein.local" },
    { id: "u-team", full_name: "Portal Chat Team Test", role: "team", email: "portal-chat-team-test@wein-test.local" },
  ];
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const actorId = currentUserId || profiles[0].id;

  const conversations = new Map();
  const messages = new Map();
  const dmPairs = new Map();

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
      return clone([...conversations.values()].map(decorateConversation));
    },

    async listMessages(conversationId) {
      const conversation = requireConversation(conversationId);
      requireActiveMember(conversation);
      return clone((messages.get(conversationId) || []).map((message) => ({
        ...message,
        sender: profileById.get(message.sender_id) || null,
      })));
    },

    createGroup,

    getOrCreateDm,

    async addMember(conversationId, userId) {
      const conversation = requireConversation(conversationId);
      if (conversation.created_by !== actorId) throw new Error("Only the creator can add members");
      addMemberRow(conversation, userId, "member");
    },

    async sendMessage({ conversationId, body, clientNonce, replyToId = null }) {
      const conversation = requireConversation(conversationId);
      requireActiveMember(conversation);
      const trimmed = (body || "").trim();
      if (!trimmed) throw new Error("Message body is required");
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
      };
      list.push(message);
      messages.set(conversationId, list);
      return clone({ ...message, sender: profileById.get(actorId) || null });
    },

    async markRead(conversationId, lastReadSeq) {
      const conversation = requireConversation(conversationId);
      const member = requireActiveMember(conversation);
      member.last_read_seq = Math.max(member.last_read_seq, Number(lastReadSeq) || 0);
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
