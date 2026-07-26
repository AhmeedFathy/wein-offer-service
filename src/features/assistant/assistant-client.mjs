const DEFAULT_ENDPOINT = "/api/chat";

export function normalizeAssistantMessages(messages = []) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string" && message.content.trim())
    .slice(-40)
    .map((message) => ({ role: message.role, content: message.content.slice(0, 8000) }));
}

export function buildAssistantPayload({
  sectionId = "generic",
  recordType = null,
  recordId = null,
  currentUser = null,
  callerCapabilities = [],
  requestedReadTools = [],
  toolResults = null,
  messages = [],
} = {}) {
  return {
    section_id: sectionId,
    record_type: recordType,
    record_id: recordId,
    current_user_id: currentUser?.id || null,
    caller_capabilities: Array.isArray(callerCapabilities) ? callerCapabilities : [],
    requested_read_tools: Array.isArray(requestedReadTools) ? requestedReadTools : [],
    ...(toolResults ? { tool_results: toolResults } : {}),
    messages: normalizeAssistantMessages(messages),
  };
}

export async function sendAssistantMessage({
  fetchImpl = globalThis.fetch,
  endpoint = DEFAULT_ENDPOINT,
  accessToken = null,
  ...payloadInput
} = {}) {
  if (typeof fetchImpl !== "function") throw new Error("fetch implementation is required");
  const payload = buildAssistantPayload(payloadInput);
  if (!payload.messages.length) throw new Error("At least one user/assistant message is required");

  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    throw new Error(body?.error || `Assistant request failed with status ${response.status}`);
  }

  return {
    reply: body.reply || "",
    runtime: body.runtime || null,
    raw: body,
  };
}

export function toolsForAssistantSection(sectionId) {
  return {
    today: ["list_today_signals", "list_unresolved_mentions", "list_due_tasks"],
    tasks: ["get_task", "list_related_comments"],
    providers: ["get_provider", "list_provider_offers", "list_provider_discussion"],
    offers: ["get_offer", "list_offer_discussion"],
    chat: ["get_chat_thread"],
    team: ["list_team_members"],
  }[sectionId] || [];
}
