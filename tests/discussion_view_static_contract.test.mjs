import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const view = readFileSync("src/features/record-discussion/discussion-view.mjs", "utf8");
const css = readFileSync("src/features/record-discussion/discussion-styles.css", "utf8");

assert.match(view, /data-discussion-reply/);
assert.match(view, /data-discussion-resolve/);
assert.match(view, /data-discussion-reopen/);
assert.match(view, /createTaskFromComment/);
assert.match(view, /subscribeToDiscussionEvents/);
assert.match(css, /position:\s*sticky/);
assert.match(css, /safe-area-inset-bottom/);
assert.match(css, /min-height:\s*44px/);

console.log("discussion view static contract tests passed");
