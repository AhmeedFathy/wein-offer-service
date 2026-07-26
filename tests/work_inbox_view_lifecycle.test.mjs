import assert from "node:assert/strict";

import { createWorkInboxViewModule } from "../src/features/work-inbox/work-inbox-view.mjs";

class FakeElement {
  constructor() {
    this.innerHTML = "";
    this.dataset = {};
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
  const calls = { loaded: 0, subscribed: 0, unsubscribed: 0 };
  return {
    calls,
    async loadInbox() {
      calls.loaded += 1;
      return [{
        kind: "task",
        entity_id: "task-1",
        title: "Call provider",
        reason_code: "task_due",
        severity: "critical",
        owner_id: "u1",
        due_at: "2026-07-25T10:00:00Z",
        next_action: "Open task",
        href: "#tasks/task-1",
      }];
    },
    subscribeToInboxEvents(onEvent) {
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
  return 13;
};
globalThis.clearInterval = (id) => {
  if (id === 13) cleared = true;
};

try {
  const root = new FakeElement();
  const service = makeService();
  const cleanup = createWorkInboxViewModule().mount(root, { service });

  await Promise.resolve();
  assert.equal(root.classList.contains("wein-work-inbox-root"), true);
  assert.equal(service.calls.subscribed, 1);
  assert.equal(typeof intervalCallback, "function");
  assert.equal(root.innerHTML.includes("Work inbox"), true);
  assert.equal(root.innerHTML.includes("Call provider"), true);

  cleanup();

  assert.equal(service.calls.unsubscribed, 1);
  assert.equal(cleared, true);
  assert.equal(root.classList.contains("wein-work-inbox-root"), false);
  assert.equal(root.innerHTML, "");
} finally {
  globalThis.setInterval = originalSetInterval;
  globalThis.clearInterval = originalClearInterval;
}

console.log("work inbox view lifecycle tests passed");
