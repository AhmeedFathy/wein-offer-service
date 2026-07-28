import assert from "node:assert/strict";

import { activeMentionToken, mentionedNames, parseMentions } from "../src/features/mentions.mjs";
import { extractMentionIds } from "../src/features/record-discussion/discussion-domain.mjs";

const people = [
  { id: "u-ali", full_name: "Ali" },
  { id: "u-alice", full_name: "Alice Smith" },
  { id: "u-fady", full_name: "Fady Abdo" },
  { id: "u-noname", full_name: "" },
];

function testBasicMatching() {
  assert.deepEqual(parseMentions("Ping @Fady Abdo please", people), ["u-fady"]);
  assert.deepEqual(parseMentions("@Ali can you check", people), ["u-ali"]);
  assert.deepEqual(parseMentions("no mentions here", people), []);
  assert.deepEqual(parseMentions("", people), []);
  assert.deepEqual(parseMentions("@Fady Abdo", []), []);
}

function testLongestMatchWinsOverPrefix() {
  // The old substring scan matched "Ali" inside "@Alice Smith" because it
  // did a bare includes("@ali"). Longest-first + boundary check fixes it.
  const ids = parseMentions("hey @Alice Smith look", people);
  assert.deepEqual(ids, ["u-alice"]);
  assert.equal(ids.includes("u-ali"), false);
}

function testBoundaryRules() {
  // "@" must start a token: an email address must not mention anyone.
  assert.deepEqual(parseMentions("mail me at fady@Ali.com", people), []);
  // Trailing punctuation still counts as a boundary.
  assert.deepEqual(parseMentions("thanks @Ali!", people), ["u-ali"]);
  assert.deepEqual(parseMentions("(@Ali)", people), ["u-ali"]);
  // A longer word starting with the name is not a match.
  assert.deepEqual(parseMentions("@Alison is different", people), []);
}

function testCaseInsensitiveAndDeduped() {
  assert.deepEqual(parseMentions("@fady abdo and @FADY ABDO", people), ["u-fady"]);
  assert.deepEqual(parseMentions("@Ali @Alice Smith @Ali", people), ["u-ali", "u-alice"]);
}

function testIgnoresPeopleWithoutNameOrId() {
  assert.deepEqual(parseMentions("@ hello", people), []);
  assert.deepEqual(parseMentions("@Ali", [{ full_name: "Ali" }]), []);
}

function testMentionedNames() {
  assert.deepEqual(mentionedNames("hi @Alice Smith and @Ali", people), ["Alice Smith", "Ali"]);
  assert.deepEqual(mentionedNames("nobody", people), []);
}

function testActiveMentionToken() {
  assert.deepEqual(activeMentionToken("hello @fa", 9), { query: "fa", start: 6 });
  assert.deepEqual(activeMentionToken("@", 1), { query: "", start: 0 });
  // Multi-word names need spaces inside the token.
  assert.deepEqual(activeMentionToken("hi @Fady Ab", 11), { query: "Fady Ab", start: 3 });
  // Not a mention token.
  assert.equal(activeMentionToken("no at sign", 5), null);
  assert.equal(activeMentionToken("mail fady@ali", 13), null);
  // A newline ends the token.
  assert.equal(activeMentionToken("@fady\nnext", 10), null);
}

function testDiscussionDomainDelegates() {
  // The pre-existing assertion in discussion_feature.test.mjs must keep working.
  assert.deepEqual(extractMentionIds("Ping @Fady please", [{ id: "u1", full_name: "Fady" }]), ["u1"]);
  // And it now inherits the false-positive fix.
  assert.deepEqual(extractMentionIds("hey @Alice Smith", people), ["u-alice"]);
}

testBasicMatching();
testLongestMatchWinsOverPrefix();
testBoundaryRules();
testCaseInsensitiveAndDeduped();
testIgnoresPeopleWithoutNameOrId();
testMentionedNames();
testActiveMentionToken();
testDiscussionDomainDelegates();

console.log("shared mention parser tests passed");
