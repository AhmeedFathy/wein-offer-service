const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export function severityForDueDate(dueAt, now = new Date()) {
  if (!dueAt) return "low";
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return "low";
  const diffMs = due.getTime() - now.getTime();
  if (diffMs < 0) return "critical";
  if (diffMs <= 24 * 60 * 60 * 1000) return "high";
  if (diffMs <= 3 * 24 * 60 * 60 * 1000) return "medium";
  return "low";
}

export function normalizeTask(task, { now = new Date() } = {}) {
  return {
    kind: "task",
    entity_id: task.id,
    title: task.title || "Untitled task",
    reason_code: task.due_date ? "task_due" : "task_open",
    severity: severityForDueDate(task.due_date, now),
    owner_id: task.assigned_to_user_id || task.owner_id || null,
    due_at: task.due_date || null,
    next_action: "Open task",
    href: `#tasks/${task.id}`,
    source: task,
  };
}

export function normalizeMention(mention, { comment, currentUserId } = {}) {
  return {
    kind: "mention",
    entity_id: mention.comment_id,
    title: comment?.body ? `Mention: ${comment.body}` : "Mention in discussion",
    reason_code: "unresolved_mention",
    severity: comment?.resolved_at ? "low" : "high",
    owner_id: currentUserId || mention.mentioned_user_id,
    due_at: comment?.created_at || mention.created_at || null,
    next_action: "Reply or resolve",
    href: `#comments/${mention.comment_id}`,
    source: { mention, comment },
  };
}

export function normalizeAwaitingReply(comment, { currentUserId, now = new Date() } = {}) {
  return {
    kind: "discussion",
    entity_id: comment.id,
    title: comment.body || "Discussion awaiting reply",
    reason_code: "thread_awaiting_reply",
    severity: severityForDueDate(comment.next_reply_due_at || comment.created_at, now),
    owner_id: currentUserId || null,
    due_at: comment.next_reply_due_at || null,
    next_action: "Reply in thread",
    href: `#comments/${comment.id}`,
    source: comment,
  };
}

export function normalizeFounderReview(item, { now = new Date() } = {}) {
  return {
    kind: item.kind || "review",
    entity_id: item.id,
    title: item.title || item.offer_title || "Founder review needed",
    reason_code: item.reason_code || "founder_review",
    severity: severityForDueDate(item.due_at || item.created_at, now),
    owner_id: item.owner_id || null,
    due_at: item.due_at || item.created_at || null,
    next_action: "Review",
    href: item.href || `#review/${item.id}`,
    source: item,
  };
}

export function sortInboxItems(items = []) {
  return [...items].sort((a, b) => {
    const severityDelta = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
    if (severityDelta) return severityDelta;
    return String(a.due_at || "").localeCompare(String(b.due_at || ""));
  });
}

export function dedupeInboxItems(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.kind}:${item.entity_id}:${item.reason_code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildWorkInbox({ tasks = [], mentions = [], commentsById = {}, awaitingReplies = [], founderReviews = [] }, options = {}) {
  const normalized = [
    ...tasks.map((task) => normalizeTask(task, options)),
    ...mentions.map((mention) => normalizeMention(mention, { ...options, comment: commentsById[mention.comment_id] })),
    ...awaitingReplies.map((comment) => normalizeAwaitingReply(comment, options)),
    ...founderReviews.map((item) => normalizeFounderReview(item, options)),
  ];
  return sortInboxItems(dedupeInboxItems(normalized));
}
