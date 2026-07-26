import unittest

from assistant_read_tools import (
    READ_TOOL_SPECS,
    allowed_tools_for_section,
    build_read_tool_path,
    execute_requested_read_tools,
    normalize_requested_tools,
)
from assistant_runtime import CAPABILITY_PACKS


class AssistantReadToolsTests(unittest.TestCase):
    def test_allowed_tools_are_section_scoped(self):
        self.assertIn("list_due_tasks", allowed_tools_for_section("today"))
        self.assertNotIn("get_provider", allowed_tools_for_section("today"))

    def test_normalizes_requested_tools_to_known_unique_names(self):
        self.assertEqual(
            normalize_requested_tools(["list_due_tasks", "bad", "list_due_tasks", 123]),
            ("list_due_tasks",),
        )

    def test_builds_due_tasks_path_with_current_user_filter(self):
        path = build_read_tool_path("list_due_tasks", {"current_user_id": "user-1"})
        self.assertIn("wein_tasks?select=", path)
        self.assertIn("status=neq.done", path)
        self.assertIn("assigned_to_user_id=eq.user-1", path)
        self.assertNotIn("owner_id", path)

    def test_rejects_unsafe_record_id(self):
        with self.assertRaises(ValueError):
            build_read_tool_path("get_task", {"record_id": "abc;delete"})

    def test_executes_only_allowed_tools_and_captures_errors(self):
        calls = []

        def fake_get(path):
            calls.append(path)
            return [{"id": "t1"}]

        results, errors = execute_requested_read_tools(
            section_id="today",
            payload={"current_user_id": "user-1"},
            requested_tools=["list_today_signals", "get_provider"],
            supabase_get=fake_get,
        )
        self.assertIn("list_due_tasks", results)
        self.assertIn("list_unresolved_mentions", results)
        self.assertEqual(errors["get_provider"], "tool not allowed in section today")
        self.assertEqual(len(calls), 2)

    def test_composite_tool_expansion_is_deduped_with_explicit_tools(self):
        calls = []

        def fake_get(path):
            calls.append(path)
            return []

        results, errors = execute_requested_read_tools(
            section_id="today",
            payload={"current_user_id": "user-1"},
            requested_tools=["list_today_signals", "list_due_tasks", "list_unresolved_mentions"],
            supabase_get=fake_get,
        )

        self.assertEqual(set(results), {"list_due_tasks", "list_unresolved_mentions"})
        self.assertEqual(errors, {})
        self.assertEqual(len(calls), 2)

    def test_runtime_capability_packs_only_advertise_implemented_tools(self):
        advertised = {
            tool
            for pack in CAPABILITY_PACKS.values()
            for tool in pack.read_tools
        }
        self.assertTrue(advertised)
        self.assertLessEqual(advertised, set(READ_TOOL_SPECS))

    def test_read_tool_paths_do_not_encode_write_methods_or_service_role(self):
        samples = {
            "list_due_tasks": {"current_user_id": "user-1"},
            "list_unresolved_mentions": {"current_user_id": "user-1"},
            "get_task": {"record_id": "task-1"},
            "list_related_comments": {"record_id": "task-1"},
            "get_provider": {"record_id": "provider-1"},
            "list_provider_offers": {"record_id": "provider-1"},
            "list_provider_discussion": {"record_id": "provider-1"},
            "get_offer": {"record_id": "offer-1"},
            "list_offer_discussion": {"record_id": "offer-1"},
            "get_chat_thread": {"record_id": "conversation-1"},
            "list_team_members": {},
        }
        forbidden = ("method=post", "method=patch", "method=delete", "/rpc/", "service_role", "service-role")
        for tool_name, payload in samples.items():
            path = build_read_tool_path(tool_name, payload).lower()
            for token in forbidden:
                self.assertNotIn(token, path, tool_name)
            if tool_name in {"list_due_tasks", "get_task"}:
                self.assertNotIn("owner_id", path, tool_name)


if __name__ == "__main__":
    unittest.main()
