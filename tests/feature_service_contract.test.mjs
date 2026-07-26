import assert from "node:assert/strict";

import { PORTAL_FEATURE_MANIFEST } from "../src/features/portal-feature-manifest.mjs";
import { createSupabaseChatService } from "../src/features/chat/supabase-chat-service.mjs";
import { createMockChatService } from "../src/features/chat/mock-chat-service.mjs";
import { createSupabaseDiscussionService } from "../src/features/record-discussion/supabase-discussion-service.mjs";
import { createMockDiscussionService } from "../src/features/record-discussion/mock-discussion-service.mjs";
import { createSupabaseWorkInboxService } from "../src/features/work-inbox/supabase-work-inbox-service.mjs";
import { createMockWorkInboxService } from "../src/features/work-inbox/mock-work-inbox-service.mjs";

const noopBuilder = {
  select() { return this; },
  order() { return this; },
  eq() { return this; },
  is() { return this; },
  insert() { return this; },
  update() { return this; },
  neq() { return this; },
  single() { return Promise.resolve({ data: {}, error: null }); },
  then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); },
};

const fakeSupabase = {
  from() { return noopBuilder; },
  rpc() { return Promise.resolve({ data: "id", error: null }); },
  channel() {
    return {
      on() { return this; },
      subscribe() { return this; },
      unsubscribe() {},
    };
  },
  removeChannel() {},
};

const servicesById = {
  "team-chat": createSupabaseChatService({ supabase: fakeSupabase, currentUserId: "user-1" }),
  "record-discussion": createSupabaseDiscussionService({ supabase: fakeSupabase, currentUserId: "user-1" }),
  "work-inbox": createSupabaseWorkInboxService({ supabase: fakeSupabase, currentUserId: "user-1" }),
};

const mockServicesById = {
  "team-chat": createMockChatService("u-ahmed"),
  "record-discussion": createMockDiscussionService({ currentUser: { id: "user-1", full_name: "User", role: "team" } }),
  "work-inbox": createMockWorkInboxService(),
};

for (const entry of PORTAL_FEATURE_MANIFEST) {
  const service = servicesById[entry.id];
  assert.ok(service, `${entry.id} should have a Supabase service fixture`);
  for (const method of entry.requiredServiceMethods) {
    assert.equal(typeof service[method], "function", `${entry.id}.${method} should be implemented`);
  }

  const mockService = mockServicesById[entry.id];
  assert.ok(mockService, `${entry.id} should have a mock service fixture`);
  for (const method of entry.requiredServiceMethods) {
    assert.equal(typeof mockService[method], "function", `${entry.id} mock ${method} should be implemented`);
  }
}

console.log("feature service contract tests passed");
