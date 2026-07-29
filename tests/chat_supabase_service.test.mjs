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

  get storage() {
    const fake = this;
    return {
      from(bucket) {
        return {
          async upload(path, file, options) {
            fake.calls.push({ kind: "storage-upload", bucket, path, contentType: options?.contentType });
            return { data: { path }, error: null };
          },
          async createSignedUrl(path, expiresIn) {
            fake.calls.push({ kind: "storage-sign", bucket, path, expiresIn });
            return { data: { signedUrl: `https://signed.example/${bucket}/${path}` }, error: null };
          },
        };
      },
    };
  }

  async rpc(name, args) {
    this.calls.push({ kind: "rpc", name, args });
    if (name === "wein_chat_create_group") return makeResult("group-1");
    if (name === "wein_chat_get_or_create_dm") return makeResult("dm-1");
    if (name === "wein_chat_add_member") return makeResult(null);
    if (name === "wein_chat_remove_member") return makeResult(null);
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
            id: "m-2",
            conversation_id: "group-1",
            message_seq: 2,
            sender_id: "u-1",
            body: "deleted latest",
            reply_to_id: null,
            client_nonce: "n-2",
            created_at: "2026-07-26T00:00:02Z",
            edited_at: null,
            deleted_at: "2026-07-26T00:00:03Z",
            sender: { id: "u-1", full_name: "Ahmed", role: "admin", email: "a@example.com" },
          },
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
  const addMemberCall = fake.calls.find((call) => call.name === "wein_chat_add_member" && call.args?.p_user_id === "u-2");
  assert.deepEqual(addMemberCall.args, { p_conversation_id: "group-1", p_user_id: "u-2" });

  await service.removeMember("group-1", "u-2");
  const removeMemberCall = fake.calls.find((call) => call.name === "wein_chat_remove_member");
  assert.deepEqual(removeMemberCall.args, { p_conversation_id: "group-1", p_user_id: "u-2" });

  await service.renameConversation("group-1", "  New name  ");
  const renameCall = fake.calls.find((call) => call.table === "wein_chat_conversations" && call.action === "update" && call.payload?.title);
  assert.equal(renameCall.payload.title, "New name");
  assert.deepEqual(renameCall.filters.filter((filter) => filter[0] === "eq").map((filter) => filter.slice(1)), [
    ["id", "group-1"],
  ]);
  await assert.rejects(() => service.renameConversation("group-1", "   "), /Group title is required/);

  await service.setConversationArchived("group-1", true);
  const archiveCall = fake.calls.find((call) => call.table === "wein_chat_conversations" && call.action === "update" && call.payload && "archived_at" in call.payload && call.payload.archived_at);
  assert.equal(typeof archiveCall.payload.archived_at, "string");
  assert.deepEqual(archiveCall.filters.filter((filter) => filter[0] === "eq").map((filter) => filter.slice(1)), [
    ["id", "group-1"],
  ]);

  await service.setConversationArchived("group-1", false);
  const unarchiveCall = fake.calls.find((call) => call.table === "wein_chat_conversations" && call.action === "update" && call.payload && call.payload.archived_at === null);
  assert.equal(unarchiveCall.payload.archived_at, null);

  await service.setMembershipRole("group-1", "u-2", "owner");
  const roleCall = fake.calls.find((call) => call.name === "wein_chat_set_membership_role");
  assert.deepEqual(roleCall.args, { p_conversation_id: "group-1", p_user_id: "u-2", p_role: "owner" });

  // Mentions must ride along on the message INSERT itself -- the AFTER INSERT
  // notify trigger cannot see rows written in a later round trip.
  await service.sendMessage({
    conversationId: "group-1",
    body: "ping @Ahmed",
    clientNonce: "nonce-mention",
    mentionedUserIds: ["u-2", "u-3"],
  });
  const mentionSend = fake.calls.find((call) => call.table === "wein_chat_messages" && call.payload?.client_nonce === "nonce-mention");
  assert.deepEqual(mentionSend.payload.mentioned_user_ids, ["u-2", "u-3"]);

  await service.sendMessage({
    conversationId: "group-1",
    body: "no mentions",
    clientNonce: "nonce-plain",
  });
  const plainSend = fake.calls.find((call) => call.table === "wein_chat_messages" && call.payload?.client_nonce === "nonce-plain");
  assert.equal(plainSend.payload.mentioned_user_ids, null);

  const uploaded = await service.uploadAttachment("group-1", { name: "photo one.png", type: "image/png", size: 2048 });
  assert.match(uploaded.path, /^group-1\/.+-photo_one\.png$/);
  assert.equal(uploaded.name, "photo one.png");
  assert.equal(uploaded.mime, "image/png");
  assert.equal(uploaded.size, 2048);
  const uploadCall = fake.calls.find((call) => call.kind === "storage-upload");
  assert.equal(uploadCall.bucket, "chat-attachments");
  assert.equal(uploadCall.path, uploaded.path);
  assert.equal(uploadCall.contentType, "image/png");

  const signedUrl = await service.getSignedAttachmentUrl(uploaded.path);
  assert.equal(signedUrl, `https://signed.example/chat-attachments/${uploaded.path}`);
  const signCall = fake.calls.find((call) => call.kind === "storage-sign");
  assert.equal(signCall.path, uploaded.path);
  assert.equal(signCall.expiresIn, 3600);

  await service.sendMessage({
    conversationId: "group-1",
    body: "",
    clientNonce: "nonce-attachment",
    attachments: [uploaded],
  });
  const attachmentSend = fake.calls.find((call) => call.table === "wein_chat_messages" && call.payload?.client_nonce === "nonce-attachment");
  assert.deepEqual(attachmentSend.payload.attachments, [uploaded]);
  assert.equal(attachmentSend.payload.body, "");

  await service.updateMessage("m-1", "edited @Ahmed", ["u-2"]);
  const mentionEdit = fake.calls.find((call) => call.table === "wein_chat_messages" && call.payload?.body === "edited @Ahmed");
  assert.deepEqual(mentionEdit.payload.mentioned_user_ids, ["u-2"]);

  assert.equal(await service.getOrCreateDm("u-2"), "dm-1");
  assert.deepEqual(fake.calls.find((call) => call.name === "wein_chat_get_or_create_dm").args, {
    p_other_user_id: "u-2",
  });

  const conversations = await service.listConversations();
  assert.equal(conversations[0].id, "group-1");
  assert.equal(conversations[0].last_message.id, "m-1");
  assert.equal(conversations[0].last_message.message_seq, 1);
  assert.equal(conversations[0].unread_count, 1);
  const listConversationsCall = fake.calls.find((call) => (
    call.table === "wein_chat_conversations" && !call.single && call.select?.includes("last_message:wein_chat_messages")
  ));
  assert.deepEqual(
    listConversationsCall.filters.filter((filter) => filter[0] === "limit" && filter[2]?.referencedTable === "wein_chat_messages"),
    [["limit", 5, { referencedTable: "wein_chat_messages" }]],
  );

  const fetchedConversation = await service.fetchConversation("group-1");
  assert.equal(fetchedConversation.last_message.id, "m-1");
  assert.equal(fetchedConversation.unread_count, 1);
  const fetchConversationCall = fake.calls.find((call) => (
    call.table === "wein_chat_conversations" && call.single && call.select?.includes("last_message:wein_chat_messages")
  ));
  assert.deepEqual(
    fetchConversationCall.filters.filter((filter) => filter[0] === "limit" && filter[2]?.referencedTable === "wein_chat_messages"),
    [["limit", 5, { referencedTable: "wein_chat_messages" }]],
  );

  const messages = await service.listMessages("group-1");
  assert.equal(messages[0].sender.full_name, "Ahmed");

  const sent = await service.sendMessage({
    conversationId: "group-1",
    body: "hello",
    clientNonce: "nonce",
    replyToId: "m-0",
  });
  assert.equal(sent.message_seq, 1);
  const sendCall = fake.calls.find((call) => call.table === "wein_chat_messages" && call.payload?.client_nonce === "nonce");
  assert.equal(sendCall.payload.sender_id, "u-1");
  assert.equal(sendCall.payload.client_nonce, "nonce");
  assert.equal(sendCall.payload.reply_to_id, "m-0");

  const updated = await service.updateMessage("m-1", "edited");
  assert.equal(updated.id, "m-1");
  const updateCall = fake.calls.find((call) => call.table === "wein_chat_messages" && call.payload?.body === "edited");
  assert.equal(updateCall.action, "update");
  assert.equal(typeof updateCall.payload.edited_at, "string");
  assert.deepEqual(updateCall.filters.filter((filter) => filter[0] === "eq").map((filter) => filter.slice(1)), [
    ["id", "m-1"],
  ]);

  const deleted = await service.deleteMessage("m-1");
  assert.equal(deleted.id, "m-1");
  const deleteCall = fake.calls.find((call) => call.table === "wein_chat_messages" && call.payload?.deleted_at);
  assert.equal(deleteCall.action, "update");
  assert.deepEqual(deleteCall.filters.filter((filter) => filter[0] === "eq").map((filter) => filter.slice(1)), [
    ["id", "m-1"],
  ]);

  await service.markRead("group-1", 1);
  const markReadCall = fake.calls.find((call) => call.table === "wein_chat_members" && call.payload?.last_read_seq === 1);
  assert.equal(markReadCall.payload.last_read_seq, 1);
  assert.deepEqual(markReadCall.filters.filter((filter) => filter[0] === "eq").map((filter) => filter.slice(1)), [
    ["conversation_id", "group-1"],
    ["user_id", "u-1"],
  ]);

  await service.setNotificationLevel("group-1", "muted");
  const notificationCall = fake.calls.find((call) => call.table === "wein_chat_members" && call.payload?.notification_level === "muted");
  assert.equal(notificationCall.action, "update");
  assert.deepEqual(notificationCall.filters.filter((filter) => filter[0] === "eq").map((filter) => filter.slice(1)), [
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
