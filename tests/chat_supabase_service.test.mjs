import assert from "node:assert/strict";

import { createSupabaseChatService } from "../src/features/chat/supabase-chat-service.mjs";

function makeResult(data) {
  return { data, error: null };
}

class FakeQuery {
  constructor(fake, table) {
    this.fake = fake;
    this.table = table;
    this.action = "select";
    this.payload = null;
    this.filters = [];
    this.selectClause = null;
    this.singleRow = false;
  }

  select(clause) {
    this.selectClause = clause;
    return this;
  }

  insert(payload) {
    this.action = "insert";
    this.payload = payload;
    return this;
  }

  update(payload) {
    this.action = "update";
    this.payload = payload;
    return this;
  }

  eq(column, value) {
    this.filters.push(["eq", column, value]);
    return this;
  }

  is(column, value) {
    this.filters.push(["is", column, value]);
    return this;
  }

  order(column, options) {
    this.filters.push(["order", column, options || null]);
    return this;
  }

  limit(count, options) {
    this.filters.push(["limit", count, options || null]);
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  then(resolve) {
    this.fake.calls.push({
      kind: "from",
      table: this.table,
      action: this.action,
      payload: this.payload,
      filters: this.filters,
      select: this.selectClause,
      single: this.singleRow,
    });
    resolve(makeResult(this.fake.responseFor(this)));
  }
}

class FakeSupabase {
  constructor() {
    this.calls = [];
    this.removedChannels = [];
  }

  from(table) {
    return new FakeQuery(this, table);
  }

  channel(name) {
    const channel = {
      name,
      handlers: [],
      on: (event, filter, handler) => {
        channel.handlers.push({ event, filter, handler });
        return channel;
      },
      subscribe: () => {
        this.calls.push({ kind: "subscribe", name, handlers: channel.handlers });
        return channel;
      },
      unsubscribe: () => {
        this.calls.push({ kind: "unsubscribe", name });
      },
    };
    this.calls.push({ kind: "channel", name });
    return channel;
  }

  removeChannel(channel) {
    this.removedChannels.push(channel.name);
  }

  async rpc(name, args) {
    this.calls.push({ kind: "rpc", name, args });
    if (name === "wein_chat_create_group") return makeResult("group-1");
    if (name === "wein_chat_get_or_create_dm") return makeResult("dm-1");
    return makeResult(null);
  }

  responseFor(query) {
    if (query.table === "profiles") {
      return [{ id: "u-1", full_name: "Ahmed", role: "admin", email: "a@example.com" }];
    }
    if (query.table === "wein_chat_conversations") {
      const row = {
        id: "group-1",
        kind: "group",
        title: "Launch",
        created_by: "u-1",
        created_at: "2026-07-26T00:00:00Z",
        archived_at: null,
        members: [
          {
            conversation_id: "group-1",
            user_id: "u-1",
            membership_role: "owner",
            joined_at: "2026-07-26T00:00:00Z",
            left_at: null,
            last_read_seq: 0,
            notification_level: "all",
            profile: { id: "u-1", full_name: "Ahmed", role: "admin", email: "a@example.com" },
          },
        ],
        last_message: [
          {
            id: "m-1",
            conversation_id: "group-1",
            message_seq: 1,
            sender_id: "u-1",
            body: "hello",
            reply_to_id: null,
            client_nonce: "n-1",
            created_at: "2026-07-26T00:00:01Z",
            edited_at: null,
            deleted_at: null,
            sender: { id: "u-1", full_name: "Ahmed", role: "admin", email: "a@example.com" },
          },
        ],
      };
      return query.singleRow ? row : [row];
    }
    if (query.table === "wein_chat_members") {
      return [{ conversation_id: "group-1", user_id: "u-2", last_read_seq: 1 }];
    }
    if (query.table === "wein_chat_messages") {
      const row = {
        id: "m-1",
        conversation_id: "group-1",
        message_seq: 1,
        sender_id: "u-1",
        body: "hello",
        reply_to_id: null,
        client_nonce: "n-1",
        created_at: "2026-07-26T00:00:01Z",
        edited_at: null,
        deleted_at: null,
        sender: { id: "u-1", full_name: "Ahmed", role: "admin", email: "a@example.com" },
      };
      return query.singleRow ? row : [row];
    }
    return [];
  }
}

async function testSupabaseAdapterContract() {
  const fake = new FakeSupabase();
  const service = createSupabaseChatService({ supabase: fake, currentUserId: "u-1" });

  assert.deepEqual(await service.listProfiles(), [
    { id: "u-1", full_name: "Ahmed", role: "admin", email: "a@example.com" },
  ]);

  const groupId = await service.createGroup("Launch", ["u-2"]);
  assert.equal(groupId, "group-1");
  assert.deepEqual(fake.calls[1], {
    kind: "rpc",
    name: "wein_chat_create_group",
    args: { p_title: "Launch" },
  });
  const addMemberCall = fake.calls.find((call) => call.table === "wein_chat_members" && call.payload?.user_id === "u-2");
  assert.equal(addMemberCall.action, "insert");

  assert.equal(await service.getOrCreateDm("u-2"), "dm-1");
  assert.deepEqual(fake.calls.find((call) => call.name === "wein_chat_get_or_create_dm").args, {
    p_other_user_id: "u-2",
  });

  const conversations = await service.listConversations();
  assert.equal(conversations[0].id, "group-1");
  assert.equal(conversations[0].last_message.message_seq, 1);
  assert.equal(conversations[0].unread_count, 1);

  const messages = await service.listMessages("group-1");
  assert.equal(messages[0].sender.full_name, "Ahmed");

  const sent = await service.sendMessage({
    conversationId: "group-1",
    body: "hello",
    clientNonce: "nonce",
  });
  assert.equal(sent.message_seq, 1);
  const sendCall = fake.calls.find((call) => call.table === "wein_chat_messages" && call.payload?.client_nonce === "nonce");
  assert.equal(sendCall.payload.sender_id, "u-1");
  assert.equal(sendCall.payload.client_nonce, "nonce");

  await service.markRead("group-1", 1);
  const markReadCall = fake.calls.find((call) => call.table === "wein_chat_members" && call.action === "update");
  assert.equal(markReadCall.payload.last_read_seq, 1);
  assert.deepEqual(markReadCall.filters.filter((filter) => filter[0] === "eq").map((filter) => filter.slice(1)), [
    ["conversation_id", "group-1"],
    ["user_id", "u-1"],
  ]);

  const unsubscribe = service.subscribeToConversationEvents(() => {});
  const subscribeCall = fake.calls.find((call) => call.kind === "subscribe");
  assert.equal(subscribeCall.name, "wein-chat:u-1");
  assert.deepEqual(subscribeCall.handlers.map((handler) => handler.filter.table), [
    "wein_chat_conversations",
    "wein_chat_members",
    "wein_chat_messages",
  ]);
  unsubscribe();
  assert.deepEqual(fake.removedChannels, ["wein-chat:u-1"]);
}

await testSupabaseAdapterContract();

console.log("chat supabase service tests passed");
