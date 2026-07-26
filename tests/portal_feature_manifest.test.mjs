import assert from "node:assert/strict";
import { existsSync } from "node:fs";

import {
  PORTAL_FEATURE_MANIFEST,
  createPortalFeatureModules,
  getPortalFeatureManifestEntry,
} from "../src/features/portal-feature-manifest.mjs";

const ids = PORTAL_FEATURE_MANIFEST.map((entry) => entry.id);
assert.deepEqual(ids, ["team-chat", "record-discussion", "work-inbox"]);
assert.equal(new Set(ids).size, ids.length);

for (const entry of PORTAL_FEATURE_MANIFEST) {
  assert.equal(typeof entry.createModule, "function");
  assert.equal(Array.isArray(entry.styles), true);
  assert.equal(Array.isArray(entry.requiredContext), true);
  assert.equal(Array.isArray(entry.requiredServiceMethods), true);
  assert.equal(entry.requiredServiceMethods.length > 0, true);
  for (const stylePath of entry.styles) {
    assert.equal(existsSync(stylePath), true, `${stylePath} should exist`);
  }
}

const modules = createPortalFeatureModules();
assert.deepEqual(modules.map((module) => module.id), ids);
for (const module of modules) {
  assert.equal(typeof module.mount, "function");
}

assert.equal(getPortalFeatureManifestEntry("work-inbox").integrationTarget, "existing Today aggregator");
assert.equal(getPortalFeatureManifestEntry("missing"), null);

console.log("portal feature manifest tests passed");
