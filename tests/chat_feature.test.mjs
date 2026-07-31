import assert from "node:assert/strict";

import {
  conversationDisplayTitle,
  messagePreview,
  sortConversations,
  unreadCount,
} from "../src/features/chat/chat-domain.mjs";
import { createMockChatService, createSharedChatStore } from "../src/features/chat/mock-chat-service.mjs";

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

async function testChannelContract() {
  // A single shared store so these three services actually represent three
  // people in the same workspace -- without it, each createMockChatService()
  // call gets its own empty, disconnected data, and cross-user assertions
  // (the entire point of a channel vs. a group) would pass or fail for the
  // wrong reason regardless of the real logic being tested.
  const store = createSharedChatStore();
  const adminService = createMockChatService("u-ahmed", store);

  // Only admin/manager may create a channel -- u-team is a plain "team" role.
  const teamService = createMockChatService("u-team", store);
  await assert.rejects(
    () => teamService.createChannel("announcements"),
    /only an admin or manager may create a channel/,
  );

  const channelId = await adminService.createChannel("announcements");
  const adminConversations = await adminService.listConversations();
  assert.ok(adminConversations.some((conversation) => conversation.id === channelId));

  // A channel is discoverable by anyone -- u-fady never got added by u-ahmed,
  // but the channel must not appear in their regular list until they join.
  // listChannels() itself always returns every channel regardless of
  // membership (matching the real service -- filtering out ones already
  // joined is the browse-UI's job in chat-view.mjs, not the service's), so
  // it's asserted here only as "the channel is visible to browse", not as
  // "it disappears once joined".
  const otherAdminService = createMockChatService("u-fady", store);
  let otherConversations = await otherAdminService.listConversations();
  assert.ok(!otherConversations.some((conversation) => conversation.id === channelId));
  let discoverable = await otherAdminService.listChannels();
  assert.ok(discoverable.some((channel) => channel.id === channelId));

  await otherAdminService.joinChannel(channelId);
  otherConversations = await otherAdminService.listConversations();
  assert.ok(otherConversations.some((conversation) => conversation.id === channelId));

  // Leaving reuses the same self-removal path a group member already has --
  // no channel-specific "leave" method needed.
  await otherAdminService.removeMember(channelId, "u-fady");
  otherConversations = await otherAdminService.listConversations();
  assert.ok(!otherConversations.some((conversation) => conversation.id === channelId));
  discoverable = await otherAdminService.listChannels();
  assert.ok(discoverable.some((channel) => channel.id === channelId));

  // joinChannel is a channel-only door -- it must not become a backdoor into
  // a group someone was never invited to.
  const groupId = await adminService.createGroup("Private ops", []);
  await assert.rejects(
    () => otherAdminService.joinChannel(groupId),
    /only channels can be joined this way/,
  );

  // Rejoining must not demote the channel's owner. Leaving only sets left_at
  // and keeps membership_role, so a flat "member" on rejoin would silently
  // strip ownership from the creator -- losing them the owner badge and
  // canManageMembers() rights on a channel they made.
  const ownerRole = (conversations) => conversations
    .find((conversation) => conversation.id === channelId)
    .members.find((member) => member.user_id === "u-ahmed")
    .membership_role;

  assert.equal(ownerRole(await adminService.listConversations()), "owner");
  await adminService.removeMember(channelId, "u-ahmed");
  await adminService.joinChannel(channelId);
  assert.equal(ownerRole(await adminService.listConversations()), "owner");

  // A plain member rejoining stays a plain member -- the owner-preserving
  // branch must not promote anyone.
  await otherAdminService.joinChannel(channelId);
  const rejoined = (await otherAdminService.listConversations())
    .find((conversation) => conversation.id === channelId)
    .members.find((member) => member.user_id === "u-fady");
  assert.equal(rejoined.membership_role, "member");

  // An archived channel is gone from the directory, but a stale client could
  // still hold its id -- joining one would hand back a membership row that
  // grants nothing, so it fails loudly instead.
  await adminService.setConversationArchived(channelId, true);
  assert.ok(!(await otherAdminService.listChannels()).some((channel) => channel.id === channelId));
  await otherAdminService.removeMember(channelId, "u-fady");
  await assert.rejects(
    () => otherAdminService.joinChannel(channelId),
    /this channel has been archived/,
  );
}

async function testMessageSearchContract() {
  // Shared store: the outsider check below needs u-team to be a REAL member
  // of groupB (in the same workspace as u-ahmed) for its empty result to mean
  // anything -- against two disconnected per-instance stores it would come
  // back empty regardless of membership logic, proving nothing.
  const store = createSharedChatStore();
  const service = createMockChatService("u-ahmed", store);
  const groupAId = await service.createGroup("Ops room", ["u-fady"]);
  const groupBId = await service.createGroup("Sales room", ["u-team"]);

  await service.sendMessage({ conversationId: groupAId, body: "check the Ottoman menu", clientNonce: "n-a1" });
  const toDelete = await service.sendMessage({ conversationId: groupBId, body: "OTTOMAN discount draft", clientNonce: "n-b1" });
  await service.sendMessage({ conversationId: groupBId, body: "unrelated update", clientNonce: "n-b2" });
  await service.deleteMessage(toDelete.id);

  // Case-insensitive, and finds hits across every conversation the searching
  // user belongs to (both groupA and groupB here).
  const results = await service.searchMessages("ottoman");
  assert.deepEqual(results.map((message) => message.body), ["check the Ottoman menu"]);

  // u-team is a real member of groupB (in the same shared workspace) but not
  // groupA -- their search for "ottoman" must come back empty because
  // groupB's only matching message was deleted above, not because they can't
  // see anything at all. This is the actual membership-scoping guarantee;
  // without the shared store this assertion would trivially pass either way.
  const outsiderService = createMockChatService("u-team", store);
  const outsiderResults = await outsiderService.searchMessages("ottoman");
  assert.deepEqual(outsiderResults.map((message) => message.conversation_id), []);

  assert.deepEqual(await service.searchMessages("   "), []);
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

async function testChannelMetadataAndDirectoryContract() {
  const store = createSharedChatStore();
  const adminService = createMockChatService("u-ahmed", store);
  const teamService = createMockChatService("u-team", store);

  const channelId = await adminService.createChannel("announcements");

  // member_count/joined_by_current_user must be computed identically
  // regardless of whether the caller has joined -- a non-member sees the
  // same shape as a member, just joined_by_current_user: false. This is the
  // uniformity 062's comment requires: never embed real rows for joined
  // channels and aggregate only for the rest.
  let adminDirectory = await adminService.listChannels();
  let teamDirectory = await teamService.listChannels();
  const adminEntry = adminDirectory.find((channel) => channel.id === channelId);
  const teamEntry = teamDirectory.find((channel) => channel.id === channelId);
  assert.equal(adminEntry.member_count, 1);
  assert.equal(adminEntry.joined_by_current_user, true);
  assert.equal(adminEntry.creator_name, "Ahmed Fathy");
  assert.equal(teamEntry.member_count, 1);
  assert.equal(teamEntry.joined_by_current_user, false);
  assert.equal(teamEntry.creator_name, "Ahmed Fathy");
  assert.equal(teamEntry.topic, null);
  assert.equal(teamEntry.description, null);

  await teamService.joinChannel(channelId);
  teamDirectory = await teamService.listChannels();
  assert.equal(teamDirectory.find((channel) => channel.id === channelId).member_count, 2);

  // A plain member (not owner, not admin/manager) cannot edit channel
  // details -- only the mismatch here is membership_role, u-team has none of
  // owner/admin/manager.
  await assert.rejects(
    () => teamService.updateChannelDetails(channelId, { title: "Announcements", topic: "News", description: "d" }),
    /only the channel owner, an admin, or a manager may edit channel details/,
  );

  // The creator/owner can.
  await adminService.updateChannelDetails(channelId, {
    title: "Announcements",
    topic: "Company news",
    description: "Official updates only",
  });
  adminDirectory = await adminService.listChannels();
  const updated = adminDirectory.find((channel) => channel.id === channelId);
  assert.equal(updated.title, "Announcements");
  assert.equal(updated.topic, "Company news");
  assert.equal(updated.description, "Official updates only");

  // Server-side length limits, not just a UI hint -- 160 / 1000 chars.
  await assert.rejects(
    () => adminService.updateChannelDetails(channelId, { title: "Announcements", topic: "x".repeat(161), description: "" }),
    /channel topic must be 160 characters or fewer/,
  );
  await assert.rejects(
    () => adminService.updateChannelDetails(channelId, { title: "Announcements", topic: "", description: "x".repeat(1001) }),
    /channel description must be 1000 characters or fewer/,
  );
  await assert.rejects(
    () => adminService.updateChannelDetails(channelId, { title: "   ", topic: "", description: "" }),
    /channel name is required/,
  );

  // Not a backdoor into editing a group's title/whatever via this method.
  const groupId = await adminService.createGroup("Private ops", []);
  await assert.rejects(
    () => adminService.updateChannelDetails(groupId, { title: "x", topic: "", description: "" }),
    /only channel details can be edited this way/,
  );

  // An archived channel's details cannot be edited.
  await adminService.setConversationArchived(channelId, true);
  await assert.rejects(
    () => adminService.updateChannelDetails(channelId, { title: "Announcements", topic: "", description: "" }),
    /this channel has been archived/,
  );
  await adminService.setConversationArchived(channelId, false);

  // leaveChannel is the explicit method the view calls -- it must actually
  // remove the CALLER, and the channel must become joinable again afterward.
  await teamService.leaveChannel(channelId);
  teamDirectory = await teamService.listChannels();
  const afterLeave = teamDirectory.find((channel) => channel.id === channelId);
  assert.equal(afterLeave.joined_by_current_user, false);
  assert.equal(afterLeave.member_count, 1);
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
await testChannelContract();
await testChannelMetadataAndDirectoryContract();
await testMessageSearchContract();
await testAttachmentContract();
testDomainFormatting();

console.log("chat feature tests passed");
