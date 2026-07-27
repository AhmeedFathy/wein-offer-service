import assert from "node:assert/strict";
import { test } from "node:test";
import { createSupabaseDiscussionService } from "../src/features/record-discussion/supabase-discussion-service.mjs";

function makeBuilder(result, calls) {
  const builder = {
    select(value) {
      calls.push(["select", value]);
      return this;
    },
    order(column, opts) {
      calls.push(["order", column, opts]);
      return this;
    },
    eq(column, value) {
      calls.push(["eq", column, value]);
      return this;
    },
    insert(value) {
      calls.push(["insert", value]);
      return this;
    },
    update(value) {
      calls.push(["update", value]);
      return this;
    },
    single() {
      calls.push(["single"]);
      return Promise.resolve(result);
    },
    then(resolve) {
      return Promise.resolve(result).then(resolve);
    },
  };
  return builder;
}

test("supabase adapter lists comments with scoped filters", async () => {
  const calls = [];
  const supabase = {
    from(table) {
      calls.push(["from", table]);
      return makeBuilder({ data: [], error: null }, calls);
    },
  };
  const service = createSupabaseDiscussionService({ supabase, currentUserId: "u1" });
  await service.listComments({ taskId: "task-1" });
  assert.deepEqual(calls.filter((call) => call[0] === "eq"), [["eq", "task_id", "task-1"]]);
});

test("supabase adapter posts comments to wein_comments", async () => {
  const calls = [];
  const supabase = {
    from(table) {
      calls.push(["from", table]);
      return makeBuilder({ data: { id: "c1" }, error: null }, calls);
    },
  };
  const service = createSupabaseDiscussionService({ supabase, currentUserId: "u1" });
  const comment = await service.postComment({ taskId: "task-1", body: "Body", replyToId: "parent" });
  assert.equal(comment.id, "c1");
  assert.equal(calls[0][1], "wein_comments");
  assert.equal(calls.find((call) => call[0] === "insert")[1].reply_to_id, "parent");
});

test("supabase adapter never sends provider_id/offer_id keys (columns do not exist on wein_comments)", async () => {
  const calls = [];
  const supabase = {
    from(table) {
      calls.push(["from", table]);
      return makeBuilder({ data: { id: "c1" }, error: null }, calls);
    },
  };
  const service = createSupabaseDiscussionService({ supabase, currentUserId: "u1" });
  await service.postComment({ taskId: "task-1", body: "Body" });
  const insertPayload = calls.find((call) => call[0] === "insert")[1];
  assert.equal("provider_id" in insertPayload, false);
  assert.equal("offer_id" in insertPayload, false);
});

test("supabase adapter rejects provider/offer scope until those columns exist", async () => {
  const supabase = { from: () => makeBuilder({ data: null, error: null }, []) };
  const service = createSupabaseDiscussionService({ supabase, currentUserId: "u1" });
  await assert.rejects(() => service.postComment({ providerId: "provider-1", body: "Body" }), /not supported yet/);
  await assert.rejects(() => service.postComment({ offerId: "offer-1", body: "Body" }), /not supported yet/);
});

test("supabase adapter guards zero-row resolve updates", async () => {
  const supabase = {
    from() {
      return makeBuilder({ data: [], error: null }, []);
    },
  };
  const service = createSupabaseDiscussionService({ supabase, currentUserId: "u1" });
  await assert.rejects(() => service.resolveComment("missing"), /zero comments/);
});

test("supabase adapter calls task-from-comment RPC", async () => {
  const calls = [];
  const supabase = {
    rpc(name, args) {
      calls.push([name, args]);
      return Promise.resolve({ data: "task-1", error: null });
    },
  };
  const service = createSupabaseDiscussionService({ supabase, currentUserId: "u1" });
  const taskId = await service.createTaskFromComment("comment-1", "Task title", "assignee", "2026-08-01");
  assert.equal(taskId, "task-1");
  assert.equal(calls[0][0], "wein_create_task_from_comment");
  assert.equal(calls[0][1].p_comment_id, "comment-1");
});
