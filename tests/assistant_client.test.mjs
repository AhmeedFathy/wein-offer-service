import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildAssistantPayload,
  normalizeAssistantMessages,
  sendAssistantMessage,
  toolsForAssistantSection,
} from "../src/features/assistant/assistant-client.mjs";

test("normalizes assistant messages to supported roles and caps history", () => {
  const messages = [
    { role: "system", content: "drop" },
    { role: "user", content: "hello" },
    { role: "assistant", content: "hi" },
    { role: "user", content: "" },
  ];
  assert.deepEqual(normalizeAssistantMessages(messages), [
    { role: "user", content: "hello" },
    { role: "assistant", content: "hi" },
  ]);
});

test("builds contextual assistant payload", () => {
  const payload = buildAssistantPayload({
    sectionId: "providers",
    recordType: "provider",
    recordId: "provider-1",
    currentUser: { id: "user-1" },
    callerCapabilities: ["read:providers"],
    requestedReadTools: ["get_provider"],
    messages: [{ role: "user", content: "summarize this" }],
  });
  assert.equal(payload.section_id, "providers");
  assert.equal(payload.record_type, "provider");
  assert.equal(payload.record_id, "provider-1");
  assert.equal(payload.current_user_id, "user-1");
  assert.deepEqual(payload.requested_read_tools, ["get_provider"]);
});

test("sends assistant request with bearer token and parses success", async () => {
  const calls = [];
  const result = await sendAssistantMessage({
    fetchImpl: async (url, options) => {
      calls.push([url, options]);
      return {
        ok: true,
        async json() {
          return { reply: "ok", runtime: { section_id: "today" } };
        },
      };
    },
    accessToken: "jwt",
    sectionId: "today",
    messages: [{ role: "user", content: "what is due?" }],
  });
  assert.equal(result.reply, "ok");
  assert.equal(calls[0][0], "/api/chat");
  assert.equal(calls[0][1].headers.Authorization, "Bearer jwt");
  assert.equal(JSON.parse(calls[0][1].body).section_id, "today");
});

test("throws backend errors cleanly", async () => {
  await assert.rejects(
    () => sendAssistantMessage({
      fetchImpl: async () => ({
        ok: false,
        status: 500,
        async json() {
          return { error: "No chat API key configured" };
        },
      }),
      messages: [{ role: "user", content: "hello" }],
    }),
    /No chat API key configured/,
  );
});

test("section tool hints match supported frontend sections", () => {
  assert.deepEqual(toolsForAssistantSection("today"), ["list_today_signals", "list_unresolved_mentions", "list_due_tasks"]);
  assert.deepEqual(toolsForAssistantSection("offers"), ["get_offer", "list_offer_discussion"]);
  assert.deepEqual(toolsForAssistantSection("unknown"), []);
});
