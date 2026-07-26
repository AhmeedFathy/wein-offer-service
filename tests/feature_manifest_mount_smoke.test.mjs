import assert from "node:assert/strict";

import { PORTAL_FEATURE_MANIFEST } from "../src/features/portal-feature-manifest.mjs";
import { createMockChatService } from "../src/features/chat/mock-chat-service.mjs";
import { createMockDiscussionService } from "../src/features/record-discussion/mock-discussion-service.mjs";
import { createMockWorkInboxService } from "../src/features/work-inbox/mock-work-inbox-service.mjs";

class FakeElement {
  constructor() {
    this.innerHTML = "";
    this.dataset = {};
    this.value = "";
    this.options = [];
    this.selectedOptions = [];
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

const currentUser = {
  id: "u-ahmed",
  full_name: "Ahmed Fathy",
  role: "admin",
  email: "af8847492@gmail.com",
};

const people = [
  currentUser,
  { id: "u-fady", full_name: "Fady Abdo", role: "admin", email: "fady@wein.local" },
  { id: "u-team", full_name: "Portal Chat Team Test", role: "team", email: "portal-chat-team-test@wein-test.local" },
];

async function contextFor(entryId) {
  if (entryId === "team-chat") {
    const service = createMockChatService(currentUser.id);
    await service.__seed();
    return { currentUser, service };
  }

  if (entryId === "record-discussion") {
    const service = createMockDiscussionService({
      currentUser,
      people,
      seedComments: [{
        id: "comment-1",
        task_id: "task-1",
        author_id: "u-fady",
        author_name: "Fady Abdo",
        author_role: "admin",
        body: "Please review this task.",
        resolved_at: null,
        resolved_by: null,
        resolved_note: null,
        created_at: "2026-07-26T10:00:00Z",
      }],
    });
    return { currentUser, people, scope: { taskId: "task-1" }, service };
  }

  if (entryId === "work-inbox") {
    return {
      service: createMockWorkInboxService({
        source: {
          tasks: [{
            id: "task-1",
            title: "Call provider",
            status: "pending",
            assigned_to_user_id: currentUser.id,
            due_date: "2026-07-26",
          }],
          mentions: [],
          commentsById: {},
        },
      }),
      onSelectItem() {},
    };
  }

  throw new Error(`No smoke-test context for ${entryId}`);
}

async function flushAsyncRender() {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
}

const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
const intervalIds = [];
const clearedIds = [];
let nextIntervalId = 1000;

globalThis.setInterval = (callback) => {
  const id = nextIntervalId++;
  intervalIds.push({ id, callback });
  return id;
};
globalThis.clearInterval = (id) => {
  clearedIds.push(id);
};

try {
  for (const entry of PORTAL_FEATURE_MANIFEST) {
    const root = new FakeElement();
    const module = entry.createModule();
    assert.equal(module.id, entry.id, `${entry.id} module id should match manifest id`);
    const context = await contextFor(entry.id);

    const cleanup = module.mount(root, context);
    assert.equal(typeof cleanup, "function", `${entry.id} should return cleanup`);

    await flushAsyncRender();

    assert.notEqual(root.innerHTML, "", `${entry.id} should render initial markup`);
    assert.equal(
      entry.requiredContext.every((key) => key === "service" || key in context),
      true,
      `${entry.id} smoke context should include manifest-required keys`,
    );

    cleanup();
    assert.equal(root.innerHTML, "", `${entry.id} cleanup should clear root markup`);
  }

  assert.equal(clearedIds.length, PORTAL_FEATURE_MANIFEST.length, "every mounted feature should clear its interval");
} finally {
  globalThis.setInterval = originalSetInterval;
  globalThis.clearInterval = originalClearInterval;
}

console.log("feature manifest mount smoke tests passed");
