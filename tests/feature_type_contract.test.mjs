import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { PORTAL_FEATURE_MANIFEST } from "../src/features/portal-feature-manifest.mjs";

const typeFilesById = {
  "team-chat": "src/features/chat/chat-types.d.ts",
  "record-discussion": "src/features/record-discussion/discussion-types.d.ts",
  "work-inbox": "src/features/work-inbox/work-inbox-types.d.ts",
};

for (const entry of PORTAL_FEATURE_MANIFEST) {
  const typeFile = typeFilesById[entry.id];
  assert.ok(typeFile, `${entry.id} should have a declared type file`);
  const source = readFileSync(typeFile, "utf8");

  for (const method of entry.requiredServiceMethods) {
    assert.match(
      source,
      new RegExp(`\\b${method}\\??\\s*\\(`),
      `${typeFile} should declare service method ${method}`,
    );
  }
}

console.log("feature type contract tests passed");
