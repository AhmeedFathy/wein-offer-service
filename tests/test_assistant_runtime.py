import unittest
from pathlib import Path

from assistant_runtime import (
    build_system_prompt,
    normalize_chat_messages,
    resolve_capability_pack,
)


class AssistantRuntimeTests(unittest.TestCase):
    def test_resolves_known_section_pack(self):
        pack = resolve_capability_pack("today")
        self.assertEqual(pack.section_id, "today")
        self.assertIn("list_today_signals", pack.read_tools)

    def test_unknown_section_falls_back_to_generic(self):
        pack = resolve_capability_pack("finance")
        self.assertEqual(pack.section_id, "generic")

    def test_prompt_is_read_only_and_contextual(self):
        prompt, meta = build_system_prompt(
            {
                "section_id": "providers",
                "record_type": "provider",
                "record_id": "provider-123",
                "caller_capabilities": ["read:providers", "write:providers"],
                "tool_results": {"provider": {"id": "provider-123", "updated_at": "2026-07-26T10:00:00Z"}},
            }
        )
        self.assertEqual(meta["section_id"], "providers")
        self.assertEqual(meta["record_type"], "provider")
        self.assertEqual(meta["record_id"], "provider-123")
        self.assertTrue(meta["has_supplied_context"])
        self.assertIn("You are read-only", prompt)
        self.assertIn("provider-123", prompt)
        self.assertIn("get_provider", prompt)
        self.assertIn("object supplied with keys", prompt)

    def test_prompt_summarizes_tool_errors(self):
        prompt, meta = build_system_prompt(
            {
                "section_id": "today",
                "tool_results": {"list_due_tasks": []},
                "tool_errors": {"list_unresolved_mentions": "Authorization bearer token is required"},
            }
        )
        self.assertTrue(meta["has_supplied_context"])
        self.assertIn("list_due_tasks", prompt)
        self.assertIn("Authorization bearer token is required", prompt)

    def test_prompt_does_not_claim_live_data_without_context(self):
        prompt, meta = build_system_prompt({"section_id": "tasks"})
        self.assertFalse(meta["has_supplied_context"])
        self.assertIn("No live portal context/tool results were supplied", prompt)

    def test_normalizes_messages(self):
        messages = normalize_chat_messages(
            [
                {"role": "system", "content": "drop"},
                {"role": "user", "content": "hello"},
                {"role": "assistant", "content": "hi"},
                {"role": "user", "content": ""},
                "bad",
            ]
        )
        self.assertEqual(messages, [{"role": "user", "content": "hello"}, {"role": "assistant", "content": "hi"}])

    def test_no_stale_inline_chat_prompt_in_app(self):
        app_source = Path("app.py").read_text(encoding="utf-8")
        runtime_source = Path("assistant_runtime.py").read_text(encoding="utf-8")
        self.assertNotIn("CHAT_SYSTEM_PROMPT", app_source)
        self.assertNotIn("run_pipeline", app_source)
        self.assertNotIn("does not execute database reads yet", runtime_source)


if __name__ == "__main__":
    unittest.main()
