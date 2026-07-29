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

async function testGroupOwnerManagementContract() {
  const service = createMockChatService("u-ahmed");
  const groupId = await service.createGroup("Ops room", ["u-team"]);

  await service.renameConversation(groupId, "  Ops HQ  ");
  let conversation = (await service.listConversations()).find((row) => row.id === groupId);
  assert.equal(conversation.title, "Ops HQ");
  await assert.rejects(() => service.renameConversation(groupId, "   "), /Group title is required/);

  await service.setMembershipRole(groupId, "u-team", "owner");
  conversation = (await service.listConversations()).find((row) => row.id === groupId);
  assert.equal(conversation.members.find((member) => member.user_id === "u-team").membership_role, "owner");

  await service.setMembershipRole(groupId, "u-team", "member");
  conversation = (await service.listConversations()).find((row) => row.id === groupId);
  assert.equal(conversation.members.find((member) => member.user_id === "u-team").membership_role, "member");

  await service.setConversationArchived(groupId, true);
  conversation = (await service.listConversations()).find((row) => row.id === groupId);
  assert.notEqual(conversation.archived_at, null);

  await service.setConversationArchived(groupId, false);
  conversation = (await service.listConversations()).find((row) => row.id === groupId);
  assert.equal(conversation.archived_at, null);
}

async function testDmArchiveContract() {
  const service = createMockChatService("u-ahmed");
  const dmId = await service.getOrCreateDm("u-fady");

  await service.setConversationArchived(dmId, true);
  let conversation = (await service.listConversations()).find((row) => row.id === dmId);
  assert.notEqual(conversation.archived_at, null);

  await service.setConversationArchived(dmId, false);
  conversation = (await service.listConversations()).find((row) => row.id === dmId);
  assert.equal(conversation.archived_at, null);

  // Archiving a DM (or group) requires ownership or a global admin/manager role --
  // a plain member of the DM (the only role a DM participant ever has, since DMs
  // never assign membership_role='owner') must be rejected the same way a
  // non-owner group member already is.
  const nonAdminService = createMockChatService("u-team");
  const otherDmId = await nonAdminService.getOrCreateDm("u-fady");
  await assert.rejects(
    () => nonAdminService.setConversationArchived(otherDmId, true),
    /Cannot archive this conversation/,
  );
}

async function testAttachmentContract() {
  const service = createMockChatService("u-ahmed");
  const groupId = await service.createGroup("Files room", ["u-fady"]);

  const uploaded = await service.uploadAttachment(groupId, { name: "menu.pdf", type: "application/pdf", size: 4096 });
  assert.equal(uploaded.name, "menu.pdf");
  assert.equal(uploaded.mime, "application/pdf");
  assert.match(uploaded.path, new RegExp(`^${groupId}/`));

  const signedUrl = await service.getSignedAttachmentUrl(uploaded.path);
  assert.match(signedUrl, /^mock:\/\/chat-attachments\//);
  await assert.rejects(() => service.getSignedAttachmentUrl("not-a-real-path"), /not found/);

  // Attachment-only messages (empty body) must be allowed.
  const message = await service.sendMessage({
    conversationId: groupId,
    body: "",
    clientNonce: "n-attach",
    attachments: [uploaded],
  });
  assert.deepEqual(message.attachments, [uploaded]);
  assert.equal(message.body, "");

  // But a message with neither body nor attachments is still rejected.
  await assert.rejects(
    () => service.sendMessage({ conversationId: groupId, body: "  ", clientNonce: "n-empty" }),
    /Message body is required/,
  );
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
await testGroupOwnerManagementContract();
await testDmArchiveContract();
await testAttachmentContract();
testDomainFormatting();

console.log("chat feature tests passed");
