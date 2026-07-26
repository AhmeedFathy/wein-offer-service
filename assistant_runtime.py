"""Read-only assistant runtime scaffolding for the WeIN portal.

This module owns the Phase 9 prompt contract: one assistant endpoint,
section-specific capability packs, record context, supplied read-tool summaries,
and strict read-only/honest-grounding rules. Deterministic Supabase reads live in
`assistant_read_tools.py`; writes/actions are intentionally out of scope.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


BASE_ASSISTANT_RULES = """You are the WeIN portal assistant for a premium lifestyle marketplace in Sharm El Sheikh, Egypt.

Core rules:
- You are read-only in this runtime. Never claim to create, edit, archive, accept, assign, invite, deploy, or trigger workflows.
- Do not emit JSON action blocks or pretend that an action was queued.
- Use live portal facts only when they are explicitly provided in the request context/tool results. If no facts are supplied, say that you do not have live data for that answer.
- Every factual answer that uses supplied context should name the relevant record and the timestamp/source if available.
- Keep sales, operations, chat, and review conversations separated by the active section context.
- Do not provide Finance or Engineering assistant behavior unless the request includes real Finance or Engineering portal data.
- If a write/action is requested, provide a safe draft/checklist or tell the user which portal area to use; do not imply execution.
"""


@dataclass(frozen=True)
class CapabilityPack:
    section_id: str
    label: str
    compact_instructions: str
    read_tools: tuple[str, ...]


CAPABILITY_PACKS: dict[str, CapabilityPack] = {
    "today": CapabilityPack(
        section_id="today",
        label="Today / Work inbox",
        compact_instructions=(
            "Help the user interpret due work, unresolved mentions, overdue tasks, and next actions. "
            "Do not invent inbox rows; rely only on supplied inbox context."
        ),
        read_tools=("list_today_signals", "list_unresolved_mentions", "list_due_tasks"),
    ),
    "tasks": CapabilityPack(
        section_id="tasks",
        label="Tasks",
        compact_instructions=(
            "Help summarize task status, blockers, owners, and next steps from supplied task records. "
            "You may draft task text, but you cannot create or update tasks."
        ),
        read_tools=("get_task", "list_related_comments"),
    ),
    "providers": CapabilityPack(
        section_id="providers",
        label="Providers",
        compact_instructions=(
            "Help reason about provider records, follow-ups, notes, and offer readiness from supplied provider context."
        ),
        read_tools=("get_provider", "list_provider_offers", "list_provider_discussion"),
    ),
    "offers": CapabilityPack(
        section_id="offers",
        label="Offers",
        compact_instructions=(
            "Help review offer copy, pricing, terms, and founder-review status from supplied offer context."
        ),
        read_tools=("get_offer", "list_offer_discussion"),
    ),
    "chat": CapabilityPack(
        section_id="chat",
        label="Team chat",
        compact_instructions=(
            "Help draft replies and summarize supplied chat snippets. Do not claim to send messages."
        ),
        read_tools=("get_chat_thread",),
    ),
    "team": CapabilityPack(
        section_id="team",
        label="Team",
        compact_instructions=(
            "Help with team-facing drafts and role-aware explanations. Do not invite users or alter roles."
        ),
        read_tools=("list_team_members",),
    ),
    "generic": CapabilityPack(
        section_id="generic",
        label="Generic portal assistant",
        compact_instructions=(
            "Help with general portal reasoning, drafting, and navigation. Be explicit when live context is missing."
        ),
        read_tools=(),
    ),
}


def sanitize_identifier(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback
    text = str(value).strip()
    if not text:
        return fallback
    return "".join(ch for ch in text if ch.isalnum() or ch in ("_", "-", ":"))[:120] or fallback


def resolve_capability_pack(section_id: Any) -> CapabilityPack:
    key = sanitize_identifier(section_id, "generic").lower()
    return CAPABILITY_PACKS.get(key, CAPABILITY_PACKS["generic"])


def normalize_caller_capabilities(raw: Any) -> tuple[str, ...]:
    if not isinstance(raw, (list, tuple, set)):
        return ()
    cleaned = []
    for item in raw:
        value = sanitize_identifier(item)
        if value and value not in cleaned:
            cleaned.append(value)
    return tuple(cleaned[:20])


def summarize_supplied_context(tool_results: Any) -> str:
    if not tool_results:
        return "No live portal context/tool results were supplied with this request."
    if not isinstance(tool_results, dict):
        return "Context was supplied, but it is not in the expected structured dictionary format."

    lines = []
    for name, value in sorted(tool_results.items()):
        safe_name = sanitize_identifier(name, "context")
        if isinstance(value, list):
            lines.append(f"- {safe_name}: {len(value)} row(s) supplied.")
        elif isinstance(value, dict):
            keys = ", ".join(sorted(sanitize_identifier(key) for key in value.keys())[:8])
            lines.append(f"- {safe_name}: object supplied with keys [{keys}].")
        else:
            lines.append(f"- {safe_name}: scalar value supplied.")
    return "\n".join(lines) if lines else "No live portal context/tool results were supplied with this request."


def summarize_tool_errors(tool_errors: Any) -> str:
    if not tool_errors:
        return "No read-tool errors."
    if not isinstance(tool_errors, dict):
        return "Read-tool errors were supplied in an unexpected format."
    lines = []
    for name, error in sorted(tool_errors.items()):
        safe_name = sanitize_identifier(name, "tool")
        lines.append(f"- {safe_name}: {str(error)[:300]}")
    return "\n".join(lines) if lines else "No read-tool errors."


def build_system_prompt(payload: dict[str, Any] | None = None) -> tuple[str, dict[str, Any]]:
    payload = payload or {}
    pack = resolve_capability_pack(payload.get("section_id"))
    record_type = sanitize_identifier(payload.get("record_type"), "none")
    record_id = sanitize_identifier(payload.get("record_id"), "none")
    caller_capabilities = normalize_caller_capabilities(payload.get("caller_capabilities"))
    supplied_context_summary = summarize_supplied_context(payload.get("tool_results"))
    tool_error_summary = summarize_tool_errors(payload.get("tool_errors"))

    metadata = {
        "section_id": pack.section_id,
        "section_label": pack.label,
        "record_type": record_type,
        "record_id": record_id,
        "caller_capabilities": caller_capabilities,
        "read_tools": pack.read_tools,
        "has_supplied_context": bool(payload.get("tool_results")),
    }

    prompt = f"""{BASE_ASSISTANT_RULES}

Active section:
- section_id: {pack.section_id}
- section_label: {pack.label}
- record_type: {record_type}
- record_id: {record_id}
- caller_capabilities: {", ".join(caller_capabilities) if caller_capabilities else "none supplied"}

Section instructions:
{pack.compact_instructions}

Read-tool contract for this section:
{", ".join(pack.read_tools) if pack.read_tools else "No read tools are currently wired for this section."}

Supplied context summary:
{supplied_context_summary}

Read-tool error summary:
{tool_error_summary}
"""
    return prompt, metadata


def normalize_chat_messages(raw: Any) -> list[dict[str, str]]:
    if not isinstance(raw, list):
        return []
    messages: list[dict[str, str]] = []
    for item in raw[-40:]:
        if not isinstance(item, dict):
            continue
        role = item.get("role")
        content = item.get("content")
        if role not in {"user", "assistant"} or not isinstance(content, str) or not content.strip():
            continue
        messages.append({"role": role, "content": content[:8000]})
    return messages
