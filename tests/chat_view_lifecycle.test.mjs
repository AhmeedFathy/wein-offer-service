import assert from "node:assert/strict";

import { createChatViewModule } from "../src/features/chat/chat-view.mjs";

class FakeElement {
  constructor() {
    this.innerHTML = "";
    this.dataset = {};
    this.options = [];
    this.selectedOptions = [];
    this.value = "";
    this.classList = {
      values: new Set(),
      add: (value) => this.classList.values.add(value),
      remove: (value) => this.classList.values.delete(value),
      contains: (value) => this.classList.values.has(value),
    };
  }

  querySelector() {
    return null;
  }

  querySelectorAll() {
    return [];
  }

  addEventListener() {}
}

function makeService() {
  const calls = { subscribed: 0, unsubscribed: 0, refreshed: 0 };
  return {
    calls,
    async listProfiles() {
      calls.refreshed += 1;
      return [];
    },
    async listConversations() {
      return [];
    },
    async listMessages() {
      return [];
    },
    async markRead() {},
    subscribeToConversationEvents(onEvent) {
      calls.subscribed += 1;
      this.emit = onEvent;
      return () => {
        calls.unsubscribed += 1;
      };
    },
  };
}

const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
let intervalCallback = null;
let cleared = false;

globalThis.setInterval = (callback) => {
  intervalCallback = callback;
  return 7;
};
globalThis.clearInterval = (id) => {
  if (id === 7) cleared = true;
};

try {
  const root = new FakeElement();
  const service = makeService();
  const cleanup = createChatViewModule().mount(root, {
    currentUser: { id: "u-1", full_name: "Ahmed", role: "admin" },
    service,
  });

  await Promise.resolve();
  assert.equal(root.classList.contains("wein-chat-root"), true);
  root.classList.add("chat-has-selection");
  assert.equal(service.calls.subscribed, 1);
  assert.equal(typeof intervalCallback, "function");

  cleanup();

  assert.equal(service.calls.unsubscribed, 1);
  assert.equal(cleared, true);
  assert.equal(root.classList.contains("wein-chat-root"), false);
  assert.equal(root.classList.contains("chat-has-selection"), false);
  assert.equal(root.innerHTML, "");
} finally {
  globalThis.setInterval = originalSetInterval;
  globalThis.clearInterval = originalClearInterval;
}

console.log("chat view lifecycle tests passed");
