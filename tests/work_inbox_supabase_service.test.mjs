import assert from "node:assert/strict";
import { test } from "node:test";
import { createSupabaseWorkInboxService } from "../src/features/work-inbox/supabase-work-inbox-service.mjs";

function makeBuilder(result, calls) {
  const builder = {
    select(value) {
      calls.push(["select", value]);
      return this;
    },
    neq(column, value) {
      calls.push(["neq", column, value]);
      return this;
    },
    eq(column, value) {
      calls.push(["eq", column, value]);
      return this;
    },
    is(column, value) {
      calls.push(["is", column, value]);
      return this;
    },
    or(value) {
      calls.push(["or", value]);
      return this;
    },
    order(column, opts) {
      calls.push(["order", column, opts]);
      return this;
    },
    then(resolve) {
      return Promise.resolve(result).then(resolve);
    },
  };
  return builder;
}

test("work inbox service fetches assigned open tasks", async () => {
  const calls = [];
  const supabase = {
    from(table) {
      calls.push(["from", table]);
      return makeBuilder({ data: [], error: null }, calls);
    },
  };
  const service = createSupabaseWorkInboxService({ supabase, currentUserId: "u1" });
  await service.fetchOpenTasks();
  assert.equal(calls[0][1], "wein_tasks");
  assert.deepEqual(calls.find((call) => call[0] === "neq"), ["neq", "status", "done"]);
  assert.deepEqual(calls.find((call) => call[0] === "eq"), ["eq", "assigned_to_user_id", "u1"]);
  assert.equal(calls.some((call) => call[0] === "or"), false);
});

test("work inbox service loads mentions into normalized inbox", async () => {
  const supabase = {
    from(table) {
      if (table === "wein_tasks") return makeBuilder({ data: [], error: null }, []);
      return makeBuilder({
        data: [{
          comment_id: "c1",
          mentioned_user_id: "u1",
          created_at: "2026-07-26T10:00:00Z",
          wein_comments: { id: "c1", body: "Check this", resolved_at: null },
        }],
        error: null,
      }, []);
    },
  };
  const service = createSupabaseWorkInboxService({ supabase, currentUserId: "u1" });
  const inbox = await service.loadInbox();
  assert.equal(inbox.length, 1);
  assert.equal(inbox[0].kind, "mention");
  assert.equal(inbox[0].owner_id, "u1");
});

test("work inbox service subscribes to inbox source tables and cleans up", () => {
  const calls = [];
  const channel = {
    on(event, filter, callback) {
      calls.push(["on", event, filter.table]);
      this.callback = callback;
      return this;
    },
    subscribe() {
      calls.push(["subscribe"]);
      return this;
    },
  };
  const supabase = {
    channel(name) {
      calls.push(["channel", name]);
      return channel;
    },
    removeChannel(value) {
      calls.push(["removeChannel", value === channel]);
    },
  };
  const service = createSupabaseWorkInboxService({ supabase, currentUserId: "u1" });
  const cleanup = service.subscribeToInboxEvents(() => {});
  cleanup();
  assert.deepEqual(calls.map((call) => call[0]), ["channel", "on", "on", "on", "subscribe", "removeChannel"]);
  assert.deepEqual(calls.filter((call) => call[0] === "on").map((call) => call[2]), [
    "wein_tasks",
    "wein_comments",
    "wein_comment_mentions",
  ]);
});
