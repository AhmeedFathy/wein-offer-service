import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const audit = readFileSync("docs/PORTAL_CHAT_PLAN_COMPLETION_AUDIT.md", "utf8");
const handoff = readFileSync("docs/SAFE_LANE_FEATURE_INTEGRATION_HANDOFF.md", "utf8");

for (const phase of [
  "Phase 0",
  "Phase 1",
  "Phase 2",
  "Phase 3",
  "Phase 4",
  "Phase 5",
  "Phase 6",
  "Phase 7",
  "Phase 8",
  "Phase 9",
]) {
  assert.match(audit, new RegExp(`### ${phase}\\b`), `${phase} should be audited`);
}

for (const required of [
  "Status: **not complete**",
  "Modular shell gate",
  "SAFE-LANE VERIFICATION PASSED",
  "verify_chat_rls.py --live",
  "verify_record_discussion_phase7.py --live",
  "Production deployment",
  "Real invite hosting",
  "No department tables",
  "No AI write actions",
  "No second Supabase client",
  "No parallel Work Inbox live tab",
]) {
  assert.match(audit, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${required} should be explicit`);
}

assert.match(audit, /not integrated into live portal shell/i);
assert.match(audit, /not fed into the real Today aggregator/i);
assert.match(audit, /not integrated into record panels/i);
assert.match(audit, /not done/i);
assert.match(handoff, /does not authorize editing `portal_new\.html` before the modularization completion gate is met/i);

console.log("plan completion audit tests passed");
