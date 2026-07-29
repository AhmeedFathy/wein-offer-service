import assert from "node:assert/strict";

import { formatTabTitle, totalUnreadCount } from "../src/features/chat/chat-unread-badge.mjs";

function testTotalUnreadCount() {
  assert.equal(totalUnreadCount([]), 0);
  assert.equal(totalUnreadCount(undefined), 0);
  assert.equal(
    totalUnreadCount([{ unread_count: 2 }, { unread_count: 0 }, { unread_count: 5 }]),
    7,
  );
  // Defensive against missing/malformed data -- a poll tick must never throw.
  assert.equal(totalUnreadCount([{}, { unread_count: null }, { unread_count: "3" }]), 3);
  assert.equal(totalUnreadCount([{ unread_count: -4 }]), 0);
}

function testFormatTabTitle() {
  assert.equal(formatTabTitle("WeIN OS — Pipeline", 0), "WeIN OS — Pipeline");
  assert.equal(formatTabTitle("WeIN OS — Pipeline", 3), "(3) WeIN OS — Pipeline");
  // Re-applying to the ORIGINAL base (as the real poller always does -- it
  // never re-derives base from the already-prefixed document.title) must
  // never stack a second prefix.
  const prefixed = formatTabTitle("WeIN OS — Pipeline", 3);
  assert.equal(formatTabTitle("WeIN OS — Pipeline", 3), prefixed);
  assert.equal(formatTabTitle(undefined, 2), "(2) ");
}

testTotalUnreadCount();
testFormatTabTitle();

console.log("chat unread badge tests passed");
