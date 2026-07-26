import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildWorkInbox,
  dedupeInboxItems,
  normalizeMention,
  normalizeTask,
  severityForDueDate,
} from "../src/features/work-inbox/work-inbox-domain.mjs";

const NOW = new Date("2026-07-26T12:00:00Z");

test("severity maps overdue and near-term due dates", () => {
  assert.equal(severityForDueDate("2026-07-25T12:00:00Z", NOW), "critical");
  assert.equal(severityForDueDate("2026-07-27T10:00:00Z", NOW), "high");
  assert.equal(severityForDueDate("2026-07-29T10:00:00Z", NOW), "medium");
  assert.equal(severityForDueDate("2026-08-05T10:00:00Z", NOW), "low");
});

test("task normalizer emits the agreed inbox shape", () => {
  const item = normalizeTask({ id: "t1", title: "Call provider", due_date: "2026-07-25T12:00:00Z", assigned_to_user_id: "u1" }, { now: NOW });
  assert.deepEqual(
    Object.keys(item).filter((key) => key !== "source"),
    ["kind", "entity_id", "title", "reason_code", "severity", "owner_id", "due_at", "next_action", "href"],
  );
  assert.equal(item.severity, "critical");
});

test("mention normalizer points to unresolved comment", () => {
  const item = normalizeMention(
    { comment_id: "c1", mentioned_user_id: "u1", created_at: "2026-07-26T10:00:00Z" },
    { currentUserId: "u1", comment: { id: "c1", body: "Please check this", resolved_at: null } },
  );
  assert.equal(item.kind, "mention");
  assert.equal(item.reason_code, "unresolved_mention");
  assert.equal(item.severity, "high");
});

test("inbox builder dedupes and sorts by severity", () => {
  const inbox = buildWorkInbox(
    {
      tasks: [{ id: "future", title: "Later", due_date: "2026-08-05T10:00:00Z" }],
      mentions: [
        { comment_id: "c1", mentioned_user_id: "u1", created_at: "2026-07-26T10:00:00Z" },
        { comment_id: "c1", mentioned_user_id: "u1", created_at: "2026-07-26T10:00:00Z" },
      ],
      commentsById: { c1: { id: "c1", body: "Mention", resolved_at: null } },
    },
    { currentUserId: "u1", now: NOW },
  );
  assert.equal(inbox.length, 2);
  assert.equal(inbox[0].kind, "mention");
  assert.equal(inbox[1].entity_id, "future");
});

test("dedupe uses kind, entity, and reason code", () => {
  const items = dedupeInboxItems([
    { kind: "task", entity_id: "1", reason_code: "task_due" },
    { kind: "task", entity_id: "1", reason_code: "task_due" },
    { kind: "task", entity_id: "1", reason_code: "task_open" },
  ]);
  assert.equal(items.length, 2);
});
