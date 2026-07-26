import json
import subprocess
import unittest

from assistant_runtime import CAPABILITY_PACKS


class AssistantToolContractConsistencyTests(unittest.TestCase):
    def test_frontend_tool_hints_match_backend_capability_packs(self):
        node_script = """
          import { toolsForAssistantSection } from './src/features/assistant/assistant-client.mjs';
          const sections = ['today', 'tasks', 'providers', 'offers', 'chat', 'team', 'generic'];
          const result = Object.fromEntries(sections.map((section) => [section, toolsForAssistantSection(section)]));
          console.log(JSON.stringify(result));
        """
        response = subprocess.run(
            ["node", "--input-type=module", "-e", node_script],
            check=True,
            capture_output=True,
            text=True,
        )
        frontend = json.loads(response.stdout)
        backend = {section: list(pack.read_tools) for section, pack in CAPABILITY_PACKS.items()}
        for section, backend_tools in backend.items():
            expected = [] if section == "generic" else backend_tools
            self.assertEqual(frontend[section], expected, section)


if __name__ == "__main__":
    unittest.main()
