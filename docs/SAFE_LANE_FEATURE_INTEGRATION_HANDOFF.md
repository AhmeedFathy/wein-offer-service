# Safe-lane feature integration handoff

This document is for the future modular portal integration step. It does not authorize editing `portal_new.html` before the modularization completion gate is met.

## Gate before integration

Do not register these modules into the live portal shell until the modularization plan gate is true:

- Flask serves the real Vite production output.
- Exactly one Supabase client exists.
- Shared caches have one authoritative owner.
- Navigation runs through `core/view-registry`.
- A dummy test view can mount, navigate away, and run cleanup.
- Chat can be added without new globals or legacy renderer edits.

Source plan: `D:\Fady\outputs\WeIN\workflow\docs\Portal_Codebase_Modularization_Plan.md`.

## Preflight command

Preferred cross-repo readiness command from `D:\Fady\outputs\WeIN\workflow`:

```powershell
python scripts\verify_portal_chat_plan_readiness.py
```

Expected final line:

```text
PORTAL CHAT PLAN READINESS PASSED (LOCAL ONLY)
```

When live Supabase verification is required and scoped test-row writes are acceptable:

```powershell
python scripts\verify_portal_chat_plan_readiness.py --live
```

Live mode first runs a read-only schema smoke check (`scripts\verify_portal_chat_live_schema.py --live`) and then runs the scoped RLS/discussion harnesses that create and clean test rows.

Feature-only fallback from `D:\Fady\outputs\WeIN\portal`:

```powershell
python run_safe_lane_tests.py
```

Expected final line:

```text
SAFE-LANE VERIFICATION PASSED
```

`run_safe_lane_tests.py` is the canonical portal-only preflight for the isolated chat, discussion, work-inbox, feature-manifest, and assistant-runtime work. The workflow-side readiness command runs that portal preflight plus workflow migration/SQL contract tests.

Latest verified status, 2026-07-26:

- `python run_safe_lane_tests.py` passed locally.
- `python scripts\verify_chat_rls.py --live` passed from the workflow repo: 8/8 chat RLS checks, with cleanup.
- `python scripts\verify_record_discussion_phase7.py --live` passed from the workflow repo: 7/7 record-discussion checks, with cleanup.

The live checks mean the manually applied Supabase SQL is working for the scoped chat and record-discussion paths. They do not mean the modules are integrated into the live portal shell yet; that still waits on the modularization gate above.

## Manifest entry point

Use one import path for the future registry:

```js
import { PORTAL_FEATURE_MANIFEST } from "./features/portal-feature-manifest.mjs";
```

Current manifest entries:

| id | phase | target | style |
|---|---:|---|---|
| `team-chat` | 3 | future view registry | `src/features/chat/chat-styles.css` |
| `record-discussion` | 7 | record detail panels | `src/features/record-discussion/discussion-styles.css` |
| `work-inbox` | 8 | existing Today aggregator | `src/features/work-inbox/work-inbox-styles.css` |

Each manifest entry exposes `createModule()`. Each module returns:

```js
{
  id: string,
  mount(root, context) // returns cleanup function
}
```

Each manifest entry also declares `requiredServiceMethods`. The test
`tests/feature_service_contract.test.mjs` verifies the Supabase adapters satisfy
those contracts.

## Required context by feature

### `team-chat`

Required:

```js
{
  currentUser: { id, full_name, role, email },
  service
}
```

Service source:

```js
import { createSupabaseChatService } from "./features/chat/supabase-chat-service.mjs";
```

The service must receive the single authenticated Supabase client from the modular platform layer:

```js
const service = createSupabaseChatService({ supabase, currentUserId: currentUser.id });
```

Backend contract:

- Group creation uses `wein_chat_create_group`.
- DM creation uses `wein_chat_get_or_create_dm`.
- Membership is explicit rows in `wein_chat_members`.
- Message send includes `client_nonce`.
- Unread state is `last_read_seq`.
- Optional realtime hook: `subscribeToConversationEvents(onEvent)`.

### `record-discussion`

Required:

```js
{
  currentUser: { id, full_name, role, email },
  people,
  scope,
  service
}
```

`scope` must identify exactly one record target:

```js
{ taskId }       // task thread
{ providerId }   // provider thread
{ offerId }      // offer thread
```

Service source:

```js
import { createSupabaseDiscussionService } from "./features/record-discussion/supabase-discussion-service.mjs";
```

Backend contract:

- Uses existing `wein_comments`.
- Uses Phase 7 fields: `author_id`, `reply_to_id`, `resolved_at`, `resolved_by`, `resolved_note`.
- Mentions use `wein_comment_mentions`.
- Task links use `wein_comment_task_links`.
- Create task from comment uses `wein_create_task_from_comment`.
- Optional realtime hook: `subscribeToDiscussionEvents(onEvent)`.

### `work-inbox`

Required:

```js
{
  service,
  onSelectItem // optional future navigation adapter
}
```

Service source:

```js
import { createSupabaseWorkInboxService } from "./features/work-inbox/supabase-work-inbox-service.mjs";
```

Backend contract:

- Loads open `wein_tasks`.
- Loads unresolved UUID mentions from `wein_comment_mentions` joined to `wein_comments`.
- Normalizes every item to:

```js
kind, entity_id, title, reason_code, severity, owner_id, due_at, next_action, href
```

Important: integrate this into the existing Today aggregator. Do not create a second live inbox tab unless Fady explicitly changes the product decision.

Optional realtime hook: `subscribeToInboxEvents(onEvent)`.

## Assistant runtime integration

Backend files:

- `assistant_runtime.py`
- `assistant_read_tools.py`

Frontend helper:

- `src/features/assistant/assistant-client.mjs`

`/api/chat` already uses the runtime. The frontend can pass:

```js
{
  section_id,
  record_type,
  record_id,
  current_user_id,
  caller_capabilities,
  requested_read_tools,
  messages
}
```

Read tools are allowlisted, section-scoped, and executed with the caller bearer token plus Supabase anon key. They are not service-role reads and they do not write.

Server requirements for assistant read tools:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- hosting that allows server-side outbound HTTPS to Supabase

Current PythonAnywhere free-tier hosting may block server-side Supabase calls. If that is still true at integration time, assistant read tools should remain disabled/unrequested until the Phase 6 hosting move is complete. The endpoint will surface read-tool errors in runtime metadata and in the assistant prompt instead of silently pretending it had context.

No AI write actions are implemented. Keep it read-only until explicitly approved and backed by deterministic preview + confirmation + affected-row checks.

## Integration order after the gate

1. Run `python run_safe_lane_tests.py`.
2. Import `PORTAL_FEATURE_MANIFEST` into the modular registry layer.
3. Load each entry's stylesheet through the Vite build path.
4. Register `team-chat` as a new view module.
5. Mount `record-discussion` inside record detail panels where the target scope is known.
6. Feed Work Inbox normalization into the existing Today aggregator.
7. Run the modularization smoke tests plus `python run_safe_lane_tests.py`.
8. Only then consider staging-to-production merge/deploy.

## Explicit non-goals

- Do not add departments as an authorization boundary.
- Do not add presence or typing indicators.
- Do not add AI write actions.
- Do not add a parallel Work Inbox tab.
- Do not create a second Supabase client inside any feature module.
- Do not edit legacy renderer bodies to integrate these features before the registry gate.

## Known issues

### Unread badge stuck forever if the latest message in a conversation is deleted (resolved, 2026-07-29)

Found by Claude while building/verifying the global sidebar unread badge (shipped `59dcf72`), not the original task — deliberately not fixed inline since it touches shared, heavily-used chat queries. Assigned to Codex to implement.

Root cause: in `src/features/chat/supabase-chat-service.mjs`, the `last_message` embedded-resource query used by both `fetchConversation()` and `listConversations()` (two near-identical blocks, roughly lines 93-113 and 124-143) has no `deleted_at` filter, unlike `listMessages()` in the same file which correctly does `.is("deleted_at", null)`. It always returns the single latest message by `message_seq` via `.order("message_seq", {referencedTable: "wein_chat_messages", ascending: false}).limit(1, {referencedTable: "wein_chat_messages"})`, regardless of whether that message was soft-deleted.

`unreadCount()` in `chat-domain.mjs` computes `last_message.message_seq - self.last_read_seq`. `markRead()` (called by `selectConversation()` in `chat-view.mjs`) only ever advances `last_read_seq` to `state.messages.at(-1)?.message_seq`, and `state.messages` never contains deleted messages (since `listMessages()` excludes them). Net effect: if the single latest message in a conversation gets deleted, no client can ever advance `last_read_seq` past that deleted message's seq again — the unread count is permanently stuck for anyone who hadn't already read up to that point, even after opening and "reading" the conversation. Affects both the pre-existing in-thread `.chat-count` badges and the new global sidebar badge equally.

Confirmed live on the real "Engineer Team" test group: `last_read_seq` was stuck at 14 while the actual latest (deleted) message was seq 15; opening/reading the conversation through the real UI did not advance it. Manually corrected via a one-off direct `last_read_seq` REST PATCH for that single conversation only — the underlying bug is still live in the codebase.

Recommended fix: widen `.limit(1, {referencedTable: "wein_chat_messages"})` to a small N (e.g. 5) in both `fetchConversation()` and `listConversations()`, keep the same `.order(..., ascending: false)`, then in `conversationFromRow()` pick the first element of that array whose `deleted_at` is null (falling back to `null`/no-last-message only in the vanishingly rare case of 5+ consecutive deletions) instead of blindly taking index 0. This avoids relying on uncertain PostgREST embedded-resource filter syntax — supabase-js v2 has no `referencedTable` option on `.eq()`/`.is()`, only on `.order()`/`.limit()` — and keeps the fix low-risk for the common (zero-deletion) case.

Definition of done:
1. Completed: fix applied in both query blocks in `supabase-chat-service.mjs`; each embedded `last_message` query now fetches 5 rows ordered by descending `message_seq`, and `conversationFromRow()` picks the first row whose `deleted_at` is null.
2. Completed: `tests/chat_supabase_service.test.mjs` now proves a deleted latest embedded message is skipped, `last_message` falls back to the next non-deleted message, and `unread_count` is computed from that fallback message.
3. Completed: full smoke suite passed with `python run_safe_lane_tests.py`; final line was `SAFE-LANE VERIFICATION PASSED`.
4. Completed: live-verified against the real portal (Claude, with credentials Codex's environment didn't have). Created a temp group, sent two real messages, deleted the newer one through the actual UI, and confirmed via the conversation list preview *and* a direct REST query that the older, non-deleted message correctly became `last_message` (previously this would have shown blank/stuck-unread instead). Temp group and messages cleaned up afterward.
