export function displayAuthor(comment, peopleById = {}) {
  if (!comment) return "Unknown";
  if (comment.author_id && peopleById[comment.author_id]?.full_name) {
    return peopleById[comment.author_id].full_name;
  }
  return comment.author_name || "Unknown";
}

export function isResolved(comment) {
  return Boolean(comment?.resolved_at);
}

export function buildCommentTree(comments = []) {
  const byId = new Map();
  const roots = [];

  comments.forEach((comment) => {
    byId.set(comment.id, { ...comment, replies: [] });
  });

  byId.forEach((comment) => {
    if (comment.reply_to_id && byId.has(comment.reply_to_id)) {
      byId.get(comment.reply_to_id).replies.push(comment);
    } else {
      roots.push(comment);
    }
  });

  const byCreatedAt = (a, b) => String(a.created_at || "").localeCompare(String(b.created_at || ""));
  const sortNode = (node) => {
    node.replies.sort(byCreatedAt);
    node.replies.forEach(sortNode);
  };
  roots.sort(byCreatedAt);
  roots.forEach(sortNode);
  return roots;
}

export function extractMentionIds(text = "", people = []) {
  const normalized = String(text).toLowerCase();
  return people
    .filter((person) => person.full_name && normalized.includes(`@${person.full_name.toLowerCase()}`))
    .map((person) => person.id);
}

export function unresolvedCount(comments = []) {
  return comments.filter((comment) => !isResolved(comment)).length;
}

export function commentPreview(comment, maxLength = 90) {
  const body = String(comment?.body || "").replace(/\s+/g, " ").trim();
  if (body.length <= maxLength) return body;
  return `${body.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
