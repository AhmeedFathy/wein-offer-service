export function makeClientNonce(prefix = "chat") {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

export function conversationDisplayTitle(conversation, currentUserId) {
  if (conversation.kind === "group") return conversation.title || "Untitled group";
  if (conversation.kind === "channel") return conversation.title || "Untitled channel";
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

// Shared async-action state: one keyed map instead of a separate pending/error
// flag pair per feature. Immutable transitions (returns a new object) so they
// stay trivially testable -- chat-view.mjs owns the single mutable
// state.actionState field and reassigns it through these.
export function startChatAction(actionState, actionId) {
  return { ...actionState, [actionId]: { pending: true, error: null } };
}

export function resolveChatAction(actionState, actionId) {
  return { ...actionState, [actionId]: { pending: false, error: null } };
}

export function failChatAction(actionState, actionId, message) {
  return { ...actionState, [actionId]: { pending: false, error: message } };
}

export function clearChatAction(actionState, actionId) {
  if (!(actionId in actionState)) return actionState;
  const next = { ...actionState };
  delete next[actionId];
  return next;
}

export function isChatActionPending(actionState, actionId) {
  return Boolean(actionState?.[actionId]?.pending);
}

export function chatActionError(actionState, actionId) {
  return actionState?.[actionId]?.error ?? null;
}

// Known RAISE EXCEPTION strings from the chat migrations, already
// human-readable on their own -- these get passed through with friendlier
// phrasing. Anything unrecognized (a raw Postgres/network error, a dropped
// connection) falls back to a generic message instead of leaking internals.
// Service methods prefix these with a "label: " debugging tag (see
// requireRpc/requireRows in supabase-chat-service.mjs), so matching is a
// substring test, not an exact one.
const KNOWN_CHAT_ERRORS = [
  ["only an admin or manager may create a channel", "Only an admin or manager can create a channel."],
  ["channel name is required", "Enter a channel name."],
  ["only channels can be joined this way", "That conversation can't be joined this way."],
  ["this channel has been archived", "This channel has been archived and can no longer be joined."],
  ["conversation not found", "This conversation no longer exists."],
  ["chat conversation immutable columns cannot be updated", "That change isn't allowed."],
  ["only group or channel conversations can be renamed", "Direct messages can't be renamed."],
];

export function mapChatActionError(error) {
  const raw = (error instanceof Error ? error.message : String(error ?? "")).toLowerCase();
  const known = KNOWN_CHAT_ERRORS.find(([fragment]) => raw.includes(fragment));
  return known ? known[1] : "Something went wrong. Please try again.";
}
