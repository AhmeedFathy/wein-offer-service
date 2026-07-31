import assert from "node:assert/strict";

import {
  chatActionError,
  clearChatAction,
  failChatAction,
  groupConversationsIntoSections,
  isChatActionPending,
  mapChatActionError,
  resolveChatAction,
  sortConversationsForSidebar,
  startChatAction,
} from "../src/features/chat/chat-domain.mjs";

function testActionStateTransitions() {
  let state = {};

  state = startChatAction(state, "rename:c1");
  assert.equal(isChatActionPending(state, "rename:c1"), true);
  assert.equal(chatActionError(state, "rename:c1"), null);
  // A second, unrelated action must not disturb the first -- this is the
  // entire point of keying by action id instead of one shared flag pair.
  state = startChatAction(state, "archive:c2");
  assert.equal(isChatActionPending(state, "rename:c1"), true);
  assert.equal(isChatActionPending(state, "archive:c2"), true);

  state = resolveChatAction(state, "rename:c1");
  assert.equal(isChatActionPending(state, "rename:c1"), false);
  assert.equal(chatActionError(state, "rename:c1"), null);
  // Resolving one action must not touch the other still in flight.
  assert.equal(isChatActionPending(state, "archive:c2"), true);

  state = failChatAction(state, "archive:c2", "Something went wrong. Please try again.");
  assert.equal(isChatActionPending(state, "archive:c2"), false);
  assert.equal(chatActionError(state, "archive:c2"), "Something went wrong. Please try again.");

  state = clearChatAction(state, "archive:c2");
  assert.equal(chatActionError(state, "archive:c2"), null);
  assert.equal(isChatActionPending(state, "archive:c2"), false);
}

function testActionStateDefaults() {
  // Reading a never-touched action id must be inert, not throw -- render()
  // calls this for every button on every paint, most of which are idle.
  assert.equal(isChatActionPending({}, "never-run"), false);
  assert.equal(chatActionError({}, "never-run"), null);
  assert.equal(isChatActionPending(undefined, "never-run"), false);
  assert.equal(chatActionError(undefined, "never-run"), null);
}

function testMapChatActionError() {
  // Each known RAISE EXCEPTION string (see 061_chat_channels.sql) arrives
  // wrapped in a "label: " debugging prefix from requireRpc/requireRows --
  // the mapper must match on substring, not exact string, and strip the
  // internal label out of what the user actually sees.
  assert.equal(
    mapChatActionError(new Error("create channel: only an admin or manager may create a channel")),
    "Only an admin or manager can create a channel.",
  );
  assert.equal(
    mapChatActionError(new Error("create channel: channel name is required")),
    "Enter a channel name.",
  );
  assert.equal(
    mapChatActionError(new Error("join channel: only channels can be joined this way")),
    "That conversation can't be joined this way.",
  );
  assert.equal(
    mapChatActionError(new Error("join channel: this channel has been archived")),
    "This channel has been archived and can no longer be joined.",
  );
  assert.equal(
    mapChatActionError(new Error("join channel: conversation not found")),
    "This conversation no longer exists.",
  );
  assert.equal(
    mapChatActionError(new Error("rename conversation: chat conversation immutable columns cannot be updated")),
    "That change isn't allowed.",
  );
  assert.equal(
    mapChatActionError(new Error("rename conversation: only group or channel conversations can be renamed")),
    "Direct messages can't be renamed.",
  );
  assert.equal(
    mapChatActionError(new Error("update channel details: only channel details can be edited this way")),
    "That change isn't allowed here.",
  );
  assert.equal(
    mapChatActionError(new Error("update channel details: only the channel owner, an admin, or a manager may edit channel details")),
    "Only the channel owner, an admin, or a manager can edit channel details.",
  );
  assert.equal(
    mapChatActionError(new Error("update channel details: channel topic must be 160 characters or fewer")),
    "Topic must be 160 characters or fewer.",
  );
  assert.equal(
    mapChatActionError(new Error("update channel details: channel description must be 1000 characters or fewer")),
    "Description must be 1000 characters or fewer.",
  );
  assert.equal(
    mapChatActionError(new Error("pin message: active membership required to pin a message")),
    "You need to be a member of this conversation to pin a message.",
  );
  assert.equal(
    mapChatActionError(new Error("unpin message: active membership required to unpin a message")),
    "You need to be a member of this conversation to unpin a message.",
  );
  assert.equal(
    mapChatActionError(new Error("pin message: this message is already pinned")),
    "That message is already pinned.",
  );
  assert.equal(
    mapChatActionError(new Error("pin message: message does not belong to this conversation")),
    "That message can't be pinned here.",
  );
  assert.equal(
    mapChatActionError(new Error("pin message: message not found")),
    "This message no longer exists.",
  );
  // Case-insensitive: Postgres/Supabase don't guarantee a fixed case, and
  // matching is meant to be resilient to that.
  assert.equal(
    mapChatActionError(new Error("Only An Admin Or Manager May Create A Channel")),
    "Only an admin or manager can create a channel.",
  );
  // A raw, unrecognized backend error (network drop, generic constraint
  // violation) must never reach the user verbatim.
  assert.equal(
    mapChatActionError(new Error("fetch failed: getaddrinfo ENOTFOUND xyz.supabase.co")),
    "Something went wrong. Please try again.",
  );
  assert.equal(mapChatActionError("plain string, not an Error"), "Something went wrong. Please try again.");
  assert.equal(mapChatActionError(undefined), "Something went wrong. Please try again.");
}

function conversation(overrides) {
  return {
    id: "c1",
    kind: "dm",
    created_at: "2026-01-01T00:00:00Z",
    unread_count: 0,
    last_message: null,
    ...overrides,
  };
}

function testSortConversationsForSidebar() {
  const read = conversation({ id: "read", unread_count: 0, created_at: "2026-01-03T00:00:00Z" });
  const unreadOlder = conversation({ id: "unread-older", unread_count: 2, created_at: "2026-01-01T00:00:00Z" });
  const unreadNewer = conversation({ id: "unread-newer", unread_count: 1, created_at: "2026-01-02T00:00:00Z" });
  const sorted = sortConversationsForSidebar([read, unreadOlder, unreadNewer]);
  // Unread beats read regardless of recency -- unreadOlder is chronologically
  // the oldest of the three but must still rank above the read conversation.
  assert.deepEqual(sorted.map((row) => row.id), ["unread-newer", "unread-older", "read"]);

  // A muted-but-unread conversation still sorts to the top of its bucket --
  // muting is a styling concern (subdued badge), never a sort demotion. The
  // mock/real member shape isn't needed here since sortConversationsForSidebar
  // only reads unread_count, already computed upstream.
  const mutedUnread = conversation({ id: "muted-unread", unread_count: 3, created_at: "2026-01-01T00:00:00Z" });
  const sortedWithMuted = sortConversationsForSidebar([read, mutedUnread]);
  assert.equal(sortedWithMuted[0].id, "muted-unread");
}

function testGroupConversationsIntoSections() {
  const channel = conversation({ id: "ch1", kind: "channel" });
  const group = conversation({ id: "gr1", kind: "group" });
  const dm = conversation({ id: "dm1", kind: "dm" });
  const sections = groupConversationsIntoSections([dm, group, channel]);

  // Fixed display order -- Channels, Private groups, Direct messages --
  // regardless of the input array's order.
  assert.deepEqual(sections.map((section) => section.kind), ["channel", "group", "dm"]);
  assert.deepEqual(sections[0].conversations.map((row) => row.id), ["ch1"]);
  assert.deepEqual(sections[1].conversations.map((row) => row.id), ["gr1"]);
  assert.deepEqual(sections[2].conversations.map((row) => row.id), ["dm1"]);

  // Every bucket is present even when empty, so the view can decide whether
  // to render an empty section without re-deriving the kind list itself.
  const onlyDm = groupConversationsIntoSections([dm]);
  assert.deepEqual(onlyDm.map((section) => section.kind), ["channel", "group", "dm"]);
  assert.deepEqual(onlyDm[0].conversations, []);
  assert.deepEqual(onlyDm[1].conversations, []);

  // Sections are sorted internally by the same unread-first rule.
  const readChannel = conversation({ id: "ch-read", kind: "channel", unread_count: 0, created_at: "2026-01-02T00:00:00Z" });
  const unreadChannel = conversation({ id: "ch-unread", kind: "channel", unread_count: 5, created_at: "2026-01-01T00:00:00Z" });
  const mixed = groupConversationsIntoSections([readChannel, unreadChannel]);
  assert.deepEqual(mixed[0].conversations.map((row) => row.id), ["ch-unread", "ch-read"]);
}

testActionStateTransitions();
testActionStateDefaults();
testMapChatActionError();
testSortConversationsForSidebar();
testGroupConversationsIntoSections();

console.log("chat domain action-state tests passed");
