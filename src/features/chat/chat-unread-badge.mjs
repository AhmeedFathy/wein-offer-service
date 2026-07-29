// Pure logic for the global unread-chat indicator (sidebar badge + tab
// title). Kept separate from the polling/DOM glue in main.ts so it gets
// direct node --test coverage -- .ts files in this repo have none today.

export function totalUnreadCount(conversations = []) {
  return conversations.reduce((sum, conversation) => {
    const count = Number(conversation?.unread_count);
    return sum + (Number.isFinite(count) && count > 0 ? count : 0);
  }, 0);
}

export function formatTabTitle(baseTitle, unreadCount) {
  const base = String(baseTitle ?? "");
  return unreadCount > 0 ? `(${unreadCount}) ${base}` : base;
}
