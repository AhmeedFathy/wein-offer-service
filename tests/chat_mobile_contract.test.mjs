import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/features/chat/chat-styles.css", import.meta.url), "utf8");
const view = readFileSync(new URL("../src/features/chat/chat-view.mjs", import.meta.url), "utf8");

assert.match(css, /@media \(max-width: 760px\)/);
assert.match(css, /\.wein-chat-root\.chat-has-selection \.chat-sidebar\s*{[^}]*display:\s*none;/s);
assert.match(css, /\.wein-chat-root\.chat-has-selection \.chat-thread\s*{[^}]*display:\s*grid;/s);
assert.match(css, /\.chat-composer\s*{[^}]*position:\s*sticky;/s);
assert.match(css, /\.chat-composer input,\s*\.chat-composer button\s*{[^}]*min-height:\s*44px;/s);
assert.match(css, /\.chat-message-body\s*{[^}]*overflow-wrap:\s*anywhere;/s);

assert.match(view, /class="chat-back-btn"/);
assert.match(view, /root\.classList\.add\("chat-has-selection"\)/);
assert.match(view, /root\.classList\.remove\("chat-has-selection"\)/);
assert.match(view, /\[data-chat-back\]/);

console.log("chat mobile contract tests passed");
