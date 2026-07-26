import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const doc = readFileSync("docs/SAFE_LANE_FEATURE_INTEGRATION_HANDOFF.md", "utf8");

assert.match(doc, /python run_safe_lane_tests\.py/);
assert.match(doc, /PORTAL_FEATURE_MANIFEST/);
assert.match(doc, /team-chat/);
assert.match(doc, /record-discussion/);
assert.match(doc, /work-inbox/);
assert.match(doc, /existing Today aggregator/);
assert.match(doc, /single authenticated Supabase client/);
assert.match(doc, /caller bearer token/);
assert.match(doc, /SUPABASE_ANON_KEY/);
assert.match(doc, /hosting that allows server-side outbound HTTPS to Supabase/);
assert.match(doc, /PythonAnywhere free-tier hosting may block/);
assert.match(doc, /No AI write actions are implemented/);
assert.match(doc, /Do not create a second Supabase client/);

console.log("integration handoff doc tests passed");
