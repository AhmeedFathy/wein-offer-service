import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildCommentTree,
  commentPreview,
  displayAuthor,
  extractMentionIds,
  unresolvedCount,
} from "../src/features/record-discussion/discussion-domain.mjs";
import { createMockDiscussionService } from "../src/features/record-discussion/mock-discussion-service.mjs";

test("comment tree nests replies and keeps chronological order", () => {
  const tree = buildCommentTree([
    { id: "reply", reply_to_id: "root", body: "Reply", created_at: "2026-01-02T00:00:00Z" },
    { id: "root", reply_to_id: null, body: "Root", created_at: "2026-01-01T00:00:00Z" },
  ]);
  assert.equal(tree.length, 1);
  assert.equal(tree[0].id, "root");
  assert.equal(tree[0].replies[0].id, "reply");
});

test("mock service posts comments, extracts mentions, resolves, and creates task links", async () => {
  const service = createMockDiscussionService({
    currentUser: { id: "actor", full_name: "Actor", role: "team" },
    people: [{ id: "founder", full_name: "Fady" }],
  });
  const comment = await service.postComment({ taskId: "task-1", body: "Need review from @Fady" });
  const reply = await service.postComment({ taskId: "task-1", replyToId: comment.id, body: "Reply" });
  await service.resolveComment(comment.id, "done");
  const taskId = await service.createTaskFromComment(comment.id, "Follow-up task", "actor");
  const state = service.debugState();

  assert.equal(reply.reply_to_id, comment.id);
  assert.equal(state.mentions[0].mentioned_user_id, "founder");
  assert.equal(state.comments[0].resolved_by, "actor");
  assert.equal(state.taskLinks[0].task_id, taskId);
  assert.equal(state.taskLinks[0].link_type, "created_from");
});

test("domain helpers format authors, mentions, previews, and unresolved count", () => {
  assert.equal(displayAuthor({ author_id: "u1", author_name: "Snapshot" }, { u1: { full_name: "Live Name" } }), "Live Name");
  assert.deepEqual(extractMentionIds("Ping @Fady please", [{ id: "u1", full_name: "Fady" }]), ["u1"]);
  assert.equal(unresolvedCount([{ resolved_at: null }, { resolved_at: "2026-01-01T00:00:00Z" }]), 1);
  assert.equal(commentPreview({ body: "x ".repeat(80) }, 12), "x x x x x x…");
});
