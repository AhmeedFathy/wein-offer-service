import assert from "node:assert/strict";

import { createDiscussionViewModule } from "../src/features/record-discussion/discussion-view.mjs";

class FakeElement {
  constructor() {
    this.innerHTML = "";
    this.dataset = {};
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
  const calls = { listed: 0, subscribed: 0, unsubscribed: 0 };
  return {
    calls,
    async listComments() {
      calls.listed += 1;
      return [];
    },
    async postComment() {},
    async resolveComment() {},
    async reopenComment() {},
    async createTaskFromComment() {},
    subscribeToDiscussionEvents(onEvent) {
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
  return 11;
};
globalThis.clearInterval = (id) => {
  if (id === 11) cleared = true;
};

try {
  const root = new FakeElement();
  const service = makeService();
  const cleanup = createDiscussionViewModule().mount(root, {
    currentUser: { id: "u1", full_name: "Ahmed", role: "admin" },
    people: [],
    scope: { taskId: "task-1" },
    service,
  });

  await Promise.resolve();
  assert.equal(root.classList.contains("wein-discussion-root"), true);
  assert.equal(service.calls.subscribed, 1);
  assert.equal(typeof intervalCallback, "function");
  assert.equal(root.innerHTML.includes("Discussion"), true);

  cleanup();

  assert.equal(service.calls.unsubscribed, 1);
  assert.equal(cleared, true);
  assert.equal(root.classList.contains("wein-discussion-root"), false);
  assert.equal(root.innerHTML, "");
} finally {
  globalThis.setInterval = originalSetInterval;
  globalThis.clearInterval = originalClearInterval;
}

console.log("discussion view lifecycle tests passed");
