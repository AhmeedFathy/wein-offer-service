"""Run the portal safe-lane verification suite.

This is intentionally dependency-light because the current portal repo has no
package.json/Vite test command yet. It verifies the isolated chat, discussion,
work-inbox, feature-manifest, and assistant-runtime modules without touching
production or the legacy portal shell.
"""

from __future__ import annotations

import ast
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent

PYTHON_FILES = [
    "app.py",
    "assistant_runtime.py",
    "assistant_read_tools.py",
]

PYTHON_UNITTESTS = [
    "tests/test_assistant_runtime.py",
    "tests/test_assistant_read_tools.py",
    "tests/test_assistant_tool_contract_consistency.py",
    "tests/test_chat_endpoint_runtime.py",
    "tests/test_safe_lane_runner_coverage.py",
]

NODE_CHECKS = [
    "src/features/assistant/assistant-client.mjs",
    "src/features/portal-feature-manifest.mjs",
    "src/features/work-inbox/work-inbox-view.mjs",
    "src/features/work-inbox/mock-work-inbox-service.mjs",
    "src/features/work-inbox/supabase-work-inbox-service.mjs",
    "src/features/record-discussion/discussion-view.mjs",
]

NODE_TESTS = [
    "tests/assistant_client.test.mjs",
    "tests/feature_manifest_mount_smoke.test.mjs",
    "tests/feature_service_contract.test.mjs",
    "tests/feature_type_contract.test.mjs",
    "tests/integration_handoff_doc.test.mjs",
    "tests/plan_completion_audit.test.mjs",
    "tests/portal_feature_manifest.test.mjs",
    "tests/work_inbox_feature.test.mjs",
    "tests/work_inbox_supabase_service.test.mjs",
    "tests/work_inbox_view_lifecycle.test.mjs",
    "tests/work_inbox_view_static_contract.test.mjs",
    "tests/discussion_feature.test.mjs",
    "tests/discussion_supabase_service.test.mjs",
    "tests/discussion_view_lifecycle.test.mjs",
    "tests/discussion_view_static_contract.test.mjs",
    "tests/chat_feature.test.mjs",
    "tests/chat_supabase_service.test.mjs",
    "tests/chat_view_lifecycle.test.mjs",
    "tests/chat_mobile_contract.test.mjs",
]


def ast_parse_python() -> None:
    for relative in PYTHON_FILES:
        path = ROOT / relative
        ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    print(f"python syntax ok ({len(PYTHON_FILES)} files)", flush=True)


def run_command(args: list[str]) -> None:
    print("+", " ".join(args), flush=True)
    subprocess.run(args, cwd=ROOT, check=True)


def main() -> int:
    ast_parse_python()
    run_command([sys.executable, "-m", "unittest", *PYTHON_UNITTESTS])
    for path in NODE_CHECKS:
        run_command(["node", "--check", path])
    for path in NODE_TESTS:
        run_command(["node", path])
    print("SAFE-LANE VERIFICATION PASSED", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
