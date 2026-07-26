import os
import unittest
from unittest.mock import patch

import app as portal_app


class ChatEndpointRuntimeTests(unittest.TestCase):
    def test_chat_endpoint_returns_runtime_metadata_on_success(self):
        client = portal_app.app.test_client()

        def fake_mistral(api_key, messages, system_prompt):
            self.assertEqual(api_key, "test-key")
            self.assertEqual(messages, [{"role": "user", "content": "What is due today?"}])
            self.assertIn("section_id: today", system_prompt)
            self.assertIn("You are read-only", system_prompt)
            return "No live portal context was supplied."

        with patch.dict(os.environ, {"MISTRAL_API_KEY": "test-key"}, clear=False):
            with patch.object(portal_app, "_chat_via_mistral", side_effect=fake_mistral):
                with patch.object(portal_app, "_chat_via_anthropic") as anthropic:
                    response = client.post(
                        "/api/chat",
                        json={
                            "section_id": "today",
                            "record_type": "task",
                            "record_id": "task-1",
                            "caller_capabilities": ["read:tasks"],
                            "messages": [{"role": "user", "content": "What is due today?"}],
                        },
                    )

        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertEqual(body["reply"], "No live portal context was supplied.")
        self.assertEqual(body["runtime"]["section_id"], "today")
        self.assertEqual(body["runtime"]["record_type"], "task")
        self.assertEqual(body["runtime"]["record_id"], "task-1")
        anthropic.assert_not_called()

    def test_chat_endpoint_executes_requested_read_tools_with_user_bearer(self):
        client = portal_app.app.test_client()
        captured = {}

        def fake_read(path, bearer):
            captured["path"] = path
            captured["bearer"] = bearer
            return [{"id": "task-1"}]

        def fake_mistral(api_key, messages, system_prompt):
            self.assertIn("list_due_tasks", system_prompt)
            return "Task context supplied."

        with patch.dict(os.environ, {"MISTRAL_API_KEY": "test-key", "SUPABASE_URL": "https://example.supabase.co", "SUPABASE_ANON_KEY": "anon"}, clear=False):
            with patch.object(portal_app, "_supabase_read_with_user_jwt", side_effect=fake_read):
                with patch.object(portal_app, "_chat_via_mistral", side_effect=fake_mistral):
                    response = client.post(
                        "/api/chat",
                        headers={"Authorization": "Bearer user-jwt"},
                        json={
                            "section_id": "today",
                            "current_user_id": "user-1",
                            "requested_read_tools": ["list_due_tasks"],
                            "messages": [{"role": "user", "content": "What is due today?"}],
                        },
                    )

        self.assertEqual(response.status_code, 200)
        self.assertIn("wein_tasks?select=", captured["path"])
        self.assertEqual(captured["bearer"], "user-jwt")
        self.assertTrue(response.get_json()["runtime"]["has_supplied_context"])

    def test_assistant_read_helper_uses_get_anon_and_caller_bearer_only(self):
        captured = {}

        def fake_get(url, headers, timeout):
            captured["url"] = url
            captured["headers"] = headers
            captured["timeout"] = timeout

            class Response:
                def raise_for_status(self):
                    return None

                def json(self):
                    return [{"id": "row-1"}]

            return Response()

        with patch.dict(os.environ, {
            "SUPABASE_URL": "https://example.supabase.co",
            "SUPABASE_ANON_KEY": "anon-key",
            "SUPABASE_SERVICE_ROLE_KEY": "service-key-that-must-not-be-used",
        }, clear=False):
            with patch.object(portal_app.requests_lib, "get", side_effect=fake_get) as get_mock:
                result = portal_app._supabase_read_with_user_jwt("wein_tasks?select=id", "caller-jwt")

        self.assertEqual(result, [{"id": "row-1"}])
        self.assertEqual(captured["url"], "https://example.supabase.co/rest/v1/wein_tasks?select=id")
        self.assertEqual(captured["headers"]["apikey"], "anon-key")
        self.assertEqual(captured["headers"]["Authorization"], "Bearer caller-jwt")
        self.assertNotIn("service-key-that-must-not-be-used", str(captured))
        get_mock.assert_called_once()


if __name__ == "__main__":
    unittest.main()
