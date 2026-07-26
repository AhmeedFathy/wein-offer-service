# Portal chat plan completion audit

This is the working completion audit for `D:\Fady\outputs\WeIN\workflow\docs\Portal_Team_Chat_Plan.md`.

It is intentionally stricter than “tests pass.” The plan is complete only when every phase below has direct evidence in the current repo or live environment. Safe-lane work can be ready while the plan is still incomplete.

## Current summary

Status: **not complete**.

Reason: the chat/discussion/work-inbox/assistant modules and Supabase foundations are built and verified in isolation, but the live portal shell integration is still gated by `D:\Fady\outputs\WeIN\workflow\docs\Portal_Codebase_Modularization_Plan.md`. Production merge/deploy and real invite verification have not been done.

## Required gates before claiming complete

| Gate | Required proof | Current status |
|---|---|---|
| Modular shell gate | Vite/TypeScript portal shell exists, Flask serves production build, one Supabase client, registry navigation, dummy cleanup-view test, no legacy renderer edits needed for chat | **Not proven / still gated** |
| Local safe-lane verification | `python scripts\verify_portal_chat_plan_readiness.py` ends with `PORTAL CHAT PLAN READINESS PASSED (LOCAL ONLY)` | **Passing** |
| Live read-only schema smoke | `python scripts\verify_portal_chat_live_schema.py --live` passes zero-row Supabase REST checks for chat/discussion columns | **Available; not rerun in latest local-only pass** |
| Live chat RLS verification | `python scripts\verify_chat_rls.py --live` passes 8/8 and cleans up | **Passing as of 2026-07-26** |
| Live record-discussion verification | `python scripts\verify_record_discussion_phase7.py --live` passes 7/7 and cleans up | **Passing as of 2026-07-26** |
| Staging/browser integration | Real portal UI can create/read/send DMs and group chat; unread/realtime/mobile behavior verified with the team test account | **Not done** |
| Production deployment | Staging-tested build merged/deployed, no production regressions, smoke test passes | **Not done** |
| Real invite hosting | Phase 6 hosting move complete and `/api/invite-user` verified by inviting one real person | **Not done** |

The workflow-side readiness command includes the portal-only preflight. If run separately from `D:\Fady\outputs\WeIN\portal`, `python run_safe_lane_tests.py` must still end with `SAFE-LANE VERIFICATION PASSED`.

## Phase-by-phase audit

### Phase 0 — assistant honesty

Requirement: remove false live-data/action claims, stop dead action JSON behavior, surface assistant unavailable honestly.

Current evidence:

- `app.py` routes `/api/chat` through `assistant_runtime.py`.
- Regression tests verify the old `CHAT_SYSTEM_PROMPT` / `run_pipeline` path is gone.
- `portal/portal_new.html` AI drawer copy was locally adjusted to the limited/unavailable state.

Status: **implemented locally; production not verified**.

Proof still needed for complete: deployed browser smoke test showing the live portal no longer claims unavailable capabilities.

### Phase 1 — chat prerequisites

Requirement: formalize `profiles`, ship affected-row helper/RLS harness, create `team` test account.

Current evidence:

- `supabase/046_profiles_foundation.sql`.
- `scripts/supabase_affected_rows.py`.
- `scripts/verify_chat_prereqs.py`.
- `scripts/verify_portal_chat_plan_readiness.py` runs the cross-repo local readiness suite.
- Team test account credentials exist locally and prior live verification passed.
- `tests/test_portal_chat_sql_contracts.py` guards the migration contract.

Status: **implemented and live-verified for development scope**.

Proof still needed for complete: none beyond preserving the test account or replacing it with an equivalent test identity.

### Phase 2 — chat data layer and RLS

Requirement: `wein_chat_conversations`, `wein_chat_members`, `wein_chat_messages`, `wein_chat_dm_pairs`; per-conversation `message_seq`; `client_nonce`; canonical DM uniqueness; membership-only RLS; team-role verification.

Current evidence:

- `supabase/047_chat_schema_rls.sql`.
- `supabase/048_chat_table_grants.sql`.
- `supabase/049_chat_insert_policy_fix.sql`.
- `supabase/050_chat_conversation_insert_policy.sql`.
- `supabase/051_chat_group_creation_rpc.sql`.
- `scripts/verify_chat_rls.py --live` passed 8/8.
- `tests/test_portal_chat_sql_contracts.py` guards required SQL invariants.
- `scripts/verify_portal_chat_live_schema.py --live` can run read-only zero-row Supabase REST checks for the expected live columns.
- `scripts/verify_portal_chat_plan_readiness.py --live` can rerun the read-only schema smoke plus scoped live chat and discussion harnesses when live writes are acceptable.

Status: **implemented and live-verified**.

Proof still needed for complete: repeat live RLS verification after any migration changes.

### Phase 3 — chat UI and send/receive

Requirement: conversation list, thread view, composer, start-DM picker, group creation; correctness before realtime.

Current evidence:

- Isolated module under `src/features/chat/`.
- Mock and Supabase services exist.
- Local tests cover domain, Supabase adapter, lifecycle, mobile contract.
- Manifest entry `team-chat` is ready for the future registry.

Status: **implemented in isolation, not integrated into live portal shell**.

Proof still needed for complete: mounted in the modular registry and browser-tested against Supabase with the team test account.

### Phase 4 — realtime and unread

Requirement: Supabase Realtime subscriptions and unread badges from `last_read_seq`; no typing/presence.

Current evidence:

- Chat service/view include optional realtime subscription support and cleanup.
- `last_read_seq` exists in schema and service contracts.
- Tests cover lifecycle/cleanup.

Status: **implemented in isolation, not browser-verified in the live shell**.

Proof still needed for complete: two-browser or two-account browser test proving message refresh/unread behavior through the real portal.

### Phase 5 — mobile and polish

Requirement: one-hand phone test, thumb-reachable composer, sane keyboard behavior.

Current evidence:

- Isolated chat module has mobile-oriented CSS/contracts.
- `chat_mobile_contract.test.mjs` passes.

Status: **implemented in isolation, not device/browser-verified in live portal**.

Proof still needed for complete: mobile viewport/browser smoke test after shell integration.

### Phase 6 — hosting move and real invites

Requirement: execute droplet move, verify Supabase URL, confirm `/api/invite-user` by inviting one real person.

Current evidence:

- Not completed in this workstream.
- Current handoff warns PythonAnywhere may block backend Supabase read tools/invites.

Status: **not done**.

Proof still needed for complete: deployed hosting environment with working server-side Supabase outbound access and one successful real invite.

### Phase 7 — record-attached discussion

Requirement: threaded/resolvable discussion attached to records, UUID mentions, create/link authoritative tasks.

Current evidence:

- `supabase/052_record_discussion_phase7.sql`.
- `scripts/verify_record_discussion_phase7.py --live` passed 7/7.
- Isolated module under `src/features/record-discussion/`.
- Local tests cover domain, Supabase adapter, lifecycle, static view contract.

Status: **schema live-verified and UI implemented in isolation; not integrated into record panels**.

Proof still needed for complete: mounted in provider/task/offer detail panels with known scope and browser-tested.

### Phase 8 — Work Inbox / Today extension

Requirement: extend existing Today aggregator, not a parallel inbox; add mentions/replies/review/no-next-action signals normalized to `kind, entity_id, title, reason_code, severity, owner_id, due_at, next_action, href`.

Current evidence:

- Isolated module under `src/features/work-inbox/`.
- Supabase service reads open tasks and unresolved mentions.
- Manifest target is explicitly `existing Today aggregator`.
- Handoff explicitly forbids a parallel live inbox tab.

Status: **implemented in isolation; not fed into the real Today aggregator**.

Proof still needed for complete: Today view integration after modularization, with browser test showing old Today signals still work plus new attention signals.

### Phase 9 — one contextual AI assistant

Requirement: one runtime with section capability packs, authenticated `/api/chat`, narrow read tools, caller capabilities, read-only first, no fake finance/engineering assistants.

Current evidence:

- `assistant_runtime.py`.
- `assistant_read_tools.py`.
- `src/features/assistant/assistant-client.mjs`.
- Tests cover runtime prompt behavior, read-tool allowlist/security, endpoint context, frontend/backend tool hint consistency.

Status: **safe-lane read-only runtime implemented; live read-tool usefulness depends on hosting/API configuration**.

Proof still needed for complete: integrated frontend payload in the modular shell, server environment with API key and outbound Supabase access, browser-tested answers citing real records; no write actions until separately approved.

## Non-goals that must stay true

- No department tables or department-derived authorization boundary.
- No presence/typing indicators in this plan.
- No mobile push in this plan.
- No AI write actions before deterministic preview, explicit confirmation, and affected-row checks are designed and approved.
- No second Supabase client inside feature modules.
- No parallel Work Inbox live tab unless Fady explicitly changes the product decision.
- No direct legacy renderer-body integration before the modularization registry gate.

## Next valid implementation step

The next real completion step is **not another isolated module**. It is either:

1. Finish the modularization completion gate, then register the existing feature manifest into the new registry and browser-test the integrated portal; or
2. If Fady explicitly overrides the gate, accept the merge risk and wire into the legacy `portal_new.html` shell directly.

Until one of those happens, the plan can be hardened and tested, but it cannot honestly be called complete.
