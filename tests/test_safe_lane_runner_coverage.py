import unittest
from pathlib import Path

import run_safe_lane_tests


class SafeLaneRunnerCoverageTests(unittest.TestCase):
    def test_runner_includes_every_safe_lane_test_file(self):
        test_dir = Path("tests")
        python_tests = sorted(str(path).replace("\\", "/") for path in test_dir.glob("test_*.py"))
        node_tests = sorted(str(path).replace("\\", "/") for path in test_dir.glob("*.test.mjs"))

        declared_python = sorted(path.replace("\\", "/") for path in run_safe_lane_tests.PYTHON_UNITTESTS)
        declared_node = sorted(path.replace("\\", "/") for path in run_safe_lane_tests.NODE_TESTS)

        self.assertEqual(declared_python, python_tests)
        self.assertEqual(declared_node, node_tests)

    def test_runner_syntax_targets_exist(self):
        for relative in run_safe_lane_tests.PYTHON_FILES + run_safe_lane_tests.NODE_CHECKS:
            self.assertTrue(Path(relative).exists(), relative)


if __name__ == "__main__":
    unittest.main()
