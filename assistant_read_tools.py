"""Deterministic read-only tools for the contextual portal assistant.

The assistant model never gets raw database access. This module exposes a small
allowlist of narrow REST reads that can be executed with the caller's own JWT,
so Supabase RLS remains the authorization boundary.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable
from urllib.parse import quote


SupabaseGet = Callable[[str], Any]


@dataclass(frozen=True)
class ReadToolSpec:
    name: str
    sections: tuple[str, ...]
    required_args: tuple[str, ...] = ()


READ_TOOL_SPECS: dict[str, ReadToolSpec] = {
    "list_due_tasks": ReadToolSpec("list_due_tasks", ("today", "tasks")),
    "list_unresolved_mentions": ReadToolSpec("list_unresolved_mentions", ("today",)),
    "list_today_signals": ReadToolSpec("list_today_signals", ("today",)),
    "get_task": ReadToolSpec("get_task", ("tasks", "today"), ("record_id",)),
    "list_related_comments": ReadToolSpec("list_related_comments", ("tasks",), ("record_id",)),
    "get_provider": ReadToolSpec("get_provider", ("providers",), ("record_id",)),
    "list_provider_offers": ReadToolSpec("list_provider_offers", ("providers",), ("record_id",)),
    "list_provider_discussion": ReadToolSpec("list_provider_discussion", ("providers",), ("record_id",)),
    "get_offer": ReadToolSpec("get_offer", ("offers",), ("record_id",)),
    "list_offer_discussion": ReadToolSpec("list_offer_discussion", ("offers",), ("record_id",)),
    "get_chat_thread": ReadToolSpec("get_chat_thread", ("chat",), ("record_id",)),
    "list_team_members": ReadToolSpec("list_team_members", ("team",)),
}


def _safe_uuidish(value: Any) -> str:
    text = str(value or "").strip()
    if not text:
        raise ValueError("missing identifier")
    allowed = "".join(ch for ch in text if ch.isalnum() or ch in ("-", "_"))
    if allowed != text or len(text) > 120:
        raise ValueError("unsafe identifier")
    return quote(text, safe="")


def _current_user_id(payload: dict[str, Any]) -> str | None:
    user_id = payload.get("current_user_id") or payload.get("user_id")
    if not user_id:
        return None
    return _safe_uuidish(user_id)


def build_read_tool_path(tool_name: str, payload: dict[str, Any]) -> str:
    """Return a fixed Supabase REST path for an allowlisted read tool."""

    record_id = _safe_uuidish(payload.get("record_id")) if payload.get("record_id") else None
    current_user_id = _current_user_id(payload)

    if tool_name == "list_due_tasks":
        assignee_filter = f"&assigned_to_user_id=eq.{current_user_id}" if current_user_id else ""
        return (
            "wein_tasks?select=id,title,description,status,priority,due_date,assigned_to,assigned_to_user_id,"
            "provider_id,provider_name,task_type,created_at"
            "&status=neq.done&order=due_date.asc.nullslast&limit=25"
            + assignee_filter
        )
    if tool_name == "list_unresolved_mentions":
        if not current_user_id:
            raise ValueError("current_user_id is required for list_unresolved_mentions")
        return (
            "wein_comment_mentions?select=comment_id,mentioned_user_id,created_at,"
            "wein_comments(id,body,task_id,provider_id,offer_id,resolved_at,created_at,author_id,author_name)"
            f"&mentioned_user_id=eq.{current_user_id}&wein_comments.resolved_at=is.null&order=created_at.asc&limit=25"
        )
    if tool_name == "get_task":
        return (
            "wein_tasks?select=id,title,description,status,priority,due_date,assigned_to,assigned_to_user_id,"
            f"provider_id,provider_name,task_type,created_at&id=eq.{record_id}&limit=1"
        )
    if tool_name == "list_related_comments":
        return (
            "wein_comments?select=id,task_id,author_id,author_name,author_role,reply_to_id,body,"
            f"resolved_at,resolved_by,resolved_note,created_at&task_id=eq.{record_id}&order=created_at.asc&limit=50"
        )
    if tool_name == "get_provider":
        return (
            "wein_providers?select=id,provider_name,provider_slug,vertical,location,category,"
            "location_hook,view_or_atmosphere,peak_moments,unique_format,wein_exclusives,created_at,updated_at"
            f"&id=eq.{record_id}&limit=1"
        )
    if tool_name == "list_provider_offers":
        return (
            "wein_offers?select=id,provider_id,title,hook,category,regular_egp,promo_egp,discount_pct,"
            f"hook_type,title_strategy,upgrade_tier,wein_exclusive,gap_offer,terms,created_at&provider_id=eq.{record_id}&limit=20"
        )
    if tool_name == "list_provider_discussion":
        return (
            "wein_comments?select=id,provider_id,author_id,author_name,author_role,reply_to_id,body,"
            f"resolved_at,resolved_by,resolved_note,created_at&provider_id=eq.{record_id}&order=created_at.asc&limit=50"
        )
    if tool_name == "get_offer":
        return (
            "wein_offers?select=id,provider_id,title,hook,category,regular_egp,promo_egp,discount_pct,"
            f"hook_type,title_strategy,upgrade_tier,wein_exclusive,gap_offer,terms,items,created_at&id=eq.{record_id}&limit=1"
        )
    if tool_name == "list_offer_discussion":
        return (
            "wein_comments?select=id,offer_id,author_id,author_name,author_role,reply_to_id,body,"
            f"resolved_at,resolved_by,resolved_note,created_at&offer_id=eq.{record_id}&order=created_at.asc&limit=50"
        )
    if tool_name == "get_chat_thread":
        return (
            "wein_chat_messages?select=id,conversation_id,message_seq,sender_id,body,reply_to_id,created_at,edited_at,deleted_at"
            f"&conversation_id=eq.{record_id}&order=message_seq.desc&limit=50"
        )
    if tool_name == "list_team_members":
        return "profiles?select=id,role,full_name,email&order=full_name.asc&limit=100"
    if tool_name == "list_today_signals":
        raise ValueError("list_today_signals is a composite tool; execute list_due_tasks and list_unresolved_mentions")

    raise ValueError(f"unknown read tool: {tool_name}")


def allowed_tools_for_section(section_id: str) -> set[str]:
    return {name for name, spec in READ_TOOL_SPECS.items() if section_id in spec.sections}


def normalize_requested_tools(raw: Any) -> tuple[str, ...]:
    if not isinstance(raw, list):
        return ()
    result = []
    for item in raw[:10]:
        if not isinstance(item, str):
            continue
        name = item.strip()
        if name in READ_TOOL_SPECS and name not in result:
            result.append(name)
    return tuple(result)


def execute_requested_read_tools(
    *,
    section_id: str,
    payload: dict[str, Any],
    requested_tools: Any,
    supabase_get: SupabaseGet,
) -> tuple[dict[str, Any], dict[str, str]]:
    """Execute allowlisted read tools for the active section.

    Returns (tool_results, tool_errors). Errors are captured per tool so the
    assistant can be honest about missing context instead of failing closed into
    a vague chatbot error.
    """

    allowed = allowed_tools_for_section(section_id)
    results: dict[str, Any] = {}
    errors: dict[str, str] = {}

    expanded: list[str] = []
    for tool_name in normalize_requested_tools(requested_tools):
        if tool_name == "list_today_signals":
            expanded.extend(["list_due_tasks", "list_unresolved_mentions"])
        else:
            expanded.append(tool_name)

    deduped_expanded = []
    for tool_name in expanded:
        if tool_name not in deduped_expanded:
            deduped_expanded.append(tool_name)

    for tool_name in deduped_expanded:
        if tool_name not in allowed:
            errors[tool_name] = f"tool not allowed in section {section_id}"
            continue
        try:
            path = build_read_tool_path(tool_name, payload)
            results[tool_name] = supabase_get(path)
        except Exception as exc:
            errors[tool_name] = str(exc)

    return results, errors
