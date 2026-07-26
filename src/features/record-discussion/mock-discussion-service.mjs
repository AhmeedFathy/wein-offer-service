import { extractMentionIds } from "./discussion-domain.mjs";

export function createMockDiscussionService({ currentUser, people = [], seedComments = [] } = {}) {
  const actor = currentUser || people[0] || { id: "team-1", full_name: "Team Member", role: "team" };
  let commentSeq = seedComments.length + 1;
  let taskSeq = 1;
  const comments = seedComments.map((comment) => ({ ...comment }));
  const mentions = [];
  const taskLinks = [];

  const now = () => new Date().toISOString();

  async function listComments({ taskId, providerId, offerId } = {}) {
    return comments
      .filter((comment) => {
        if (taskId) return comment.task_id === taskId;
        if (providerId) return comment.provider_id === providerId;
        if (offerId) return comment.offer_id === offerId;
        return true;
      })
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  }

  async function postComment({ body, taskId = null, providerId = null, offerId = null, replyToId = null }) {
    const comment = {
      id: `comment-${commentSeq++}`,
      task_id: taskId,
      provider_id: providerId,
      offer_id: offerId,
      reply_to_id: replyToId,
      author_id: actor.id,
      author_name: actor.full_name || "Team Member",
      author_role: actor.role || "team",
      body,
      resolved_at: null,
      resolved_by: null,
      resolved_note: null,
      created_at: now(),
    };
    comments.push(comment);

    extractMentionIds(body, people).forEach((mentionedUserId) => {
      mentions.push({ comment_id: comment.id, mentioned_user_id: mentionedUserId, created_at: now() });
    });
    return comment;
  }

  async function resolveComment(commentId, note = "") {
    const comment = comments.find((item) => item.id === commentId);
    if (!comment) throw new Error("Comment not found");
    comment.resolved_at = now();
    comment.resolved_by = actor.id;
    comment.resolved_note = note;
    return { ...comment };
  }

  async function reopenComment(commentId) {
    const comment = comments.find((item) => item.id === commentId);
    if (!comment) throw new Error("Comment not found");
    comment.resolved_at = null;
    comment.resolved_by = null;
    comment.resolved_note = null;
    return { ...comment };
  }

  async function createTaskFromComment(commentId, title, assignedToUserId = null, dueDate = null) {
    const comment = comments.find((item) => item.id === commentId);
    if (!comment) throw new Error("Comment not found");
    const taskId = `task-from-comment-${taskSeq++}`;
    taskLinks.push({
      comment_id: commentId,
      task_id: taskId,
      link_type: "created_from",
      created_by: actor.id,
      created_at: now(),
      title,
      assigned_to_user_id: assignedToUserId,
      due_date: dueDate,
    });
    return taskId;
  }

  return {
    listComments,
    postComment,
    resolveComment,
    reopenComment,
    createTaskFromComment,
    subscribeToDiscussionEvents: () => () => {},
    debugState: () => ({ comments, mentions, taskLinks }),
  };
}
