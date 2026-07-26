export function makeClientNonce(prefix = "chat") {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

export function conversationDisplayTitle(conversation, currentUserId) {
  if (conversation.kind === "group") return conversation.title || "Untitled group";
  const other = (conversation.members || [])
    .map((member) => member.profile)
    .find((profile) => profile && profile.id !== currentUserId);
  return other?.full_name || "Direct message";
}

export function sortConversations(conversations) {
  return [...conversations].sort((a, b) => {
    const aTime = a.last_message?.created_at || a.created_at;
    const bTime = b.last_message?.created_at || b.created_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

export function unreadCount(conversation, currentUserId) {
  const self = (conversation.members || []).find((member) => member.user_id === currentUserId);
  const lastSeq = conversation.last_message?.message_seq || 0;
  return Math.max(0, lastSeq - (self?.last_read_seq || 0));
}

export function activeMemberIds(conversation) {
  return (conversation.members || [])
    .filter((member) => !member.left_at)
    .map((member) => member.user_id);
}

export function messagePreview(message) {
  if (!message) return "No messages yet";
  const body = (message.deleted_at ? "Message deleted" : message.body || "").trim();
  return body.length > 82 ? `${body.slice(0, 79)}...` : body;
}
