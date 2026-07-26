import assert from "node:assert/strict";

import {
  conversationDisplayTitle,
  messagePreview,
  sortConversations,
  unreadCount,
} from "../src/features/chat/chat-domain.mjs";
import { createMockChatService } from "../src/features/chat/mock-chat-service.mjs";

async function testGroupConversationContract() {
  const service = createMockChatService("u-ahmed");
  const groupId = await service.createGroup("Ops room", ["u-fady"]);
  let conversations = await service.listConversations();
  const group = conversations.find((conversation) => conversation.id === groupId);
  assert.equal(group.kind, "group");
  assert.equal(group.title, "Ops room");
  assert.deepEqual(group.members.map((member) => member.user_id).sort(), ["u-ahmed", "u-fady"]);

  await service.addMember(groupId, "u-team");
  conversations = await service.listConversations();
  const updated = conversations.find((conversation) => conversation.id === groupId);
  assert.deepEqual(updated.members.map((member) => member.user_id).sort(), ["u-ahmed", "u-fady", "u-team"]);

  await service.removeMember(groupId, "u-team");
  conversations = await service.listConversations();
  const removed = conversations.find((conversation) => conversation.id === groupId);
  assert.equal(removed.members.find((member) => member.user_id === "u-team").left_at !== null, true);

  await service.addMember(groupId, "u-team");
  conversations = await service.listConversations();
  const reactivated = conversations.find((conversation) => conversation.id === groupId);
  assert.equal(reactivated.members.find((member) => member.user_id === "u-team").left_at, null);
}

async function testMessageSeqAndNonceIdempotency() {
  const service = createMockChatService("u-ahmed");
  const groupId = await service.createGroup("Launch", ["u-fady"]);
  const first = await service.sendMessage({
    conversationId: groupId,
    body: "first",
    clientNonce: "nonce-1",
  });
  const duplicate = await service.sendMessage({
    conversationId: groupId,
    body: "first again",
    clientNonce: "nonce-1",
  });
  const second = await service.sendMessage({
    conversationId: groupId,
    body: "second",
    clientNonce: "nonce-2",
  });

  assert.equal(first.id, duplicate.id);
  assert.equal(first.body, duplicate.body);
  assert.equal(first.message_seq, 1);
  assert.equal(second.message_seq, 2);
}

async function testDmIdempotencyAndTitles() {
  const service = createMockChatService("u-ahmed");
  const one = await service.getOrCreateDm("u-fady");
  const two = await service.getOrCreateDm("u-fady");
  assert.equal(one, two);
  const conversation = (await service.listConversations()).find((row) => row.id === one);
  assert.equal(conversationDisplayTitle(conversation, "u-ahmed"), "Fady Abdo");
}

async function testUnreadAndReadState() {
  const service = createMockChatService("u-ahmed");
  const groupId = await service.createGroup("Unread", ["u-fady"]);
  await service.sendMessage({ conversationId: groupId, body: "hello", clientNonce: "n1" });
  let conversation = (await service.listConversations()).find((row) => row.id === groupId);
  assert.equal(unreadCount(conversation, "u-ahmed"), 1);
  await service.markRead(groupId, 1);
  conversation = (await service.listConversations()).find((row) => row.id === groupId);
  assert.equal(unreadCount(conversation, "u-ahmed"), 0);
}

function testDomainFormatting() {
  const conversations = [
    { id: "older", created_at: "2026-01-01T00:00:00Z", members: [], last_message: null },
    { id: "newer", created_at: "2026-01-01T00:00:00Z", members: [], last_message: { created_at: "2026-01-02T00:00:00Z" } },
  ];
  assert.equal(sortConversations(conversations)[0].id, "newer");
  assert.equal(messagePreview(null), "No messages yet");
  assert.equal(messagePreview({ body: "x".repeat(90) }).length, 82);
}

await testGroupConversationContract();
await testMessageSeqAndNonceIdempotency();
await testDmIdempotencyAndTitles();
await testUnreadAndReadState();
testDomainFormatting();

console.log("chat feature tests passed");
