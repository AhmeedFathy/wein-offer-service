import assert from "node:assert/strict";

import {
  chatActionError,
  clearChatAction,
  failChatAction,
  isChatActionPending,
  mapChatActionError,
  resolveChatAction,
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

testActionStateTransitions();
testActionStateDefaults();
testMapChatActionError();

console.log("chat domain action-state tests passed");
