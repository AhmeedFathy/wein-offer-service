import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const view = readFileSync("src/features/work-inbox/work-inbox-view.mjs", "utf8");
const css = readFileSync("src/features/work-inbox/work-inbox-styles.css", "utf8");

assert.match(view, /createWorkInboxViewModule/);
assert.match(view, /loadInbox/);
assert.match(view, /subscribeToInboxEvents/);
assert.match(view, /data-inbox-refresh/);
assert.match(view, /data-inbox-item/);
assert.match(css, /severity-critical/);
assert.match(css, /severity-high/);
assert.match(css, /min-height:\s*44px/);

console.log("work inbox view static contract tests passed");
