# Team Chat Upgrade Plan — v2 (revised)

Revision of the original single-release "Team Chat Upgrade Plan" after verifying every
claim against the actual portal repo and the `workflow/supabase/*.sql` migrations.

**What changed from v1, in one paragraph:** the work is split into five independently
shippable slices instead of one coordinated release; the reliability/async-state refactor
moves to the *front* so new features are built on it rather than retrofitted onto it; two
real defects in the not-yet-pasted `061_chat_channels.sql` are fixed in place before it
ever reaches Supabase; the search RPC's security mode is now specified (`SECURITY INVOKER`)
along with why; and the "two-user Playwright" tests are corrected to what the mocked test
harness can actually prove, with real cross-user RLS verification moved to a live step that
has a stated prerequisite.

Corrections to the review that produced this revision: `npm run typecheck` **does** exist in
`package.json` (v1's verification block was fine as written), and per-section unread counts
are **not** a second source of truth — `conversation.unread_count` is set by the same
`unreadCount()` in `chat-domain.mjs:23` that the global sidebar badge already sums.

---

## 0. Ground truth (verified, not assumed)

| Claim | Status |
|---|---|
| `060_chat_dm_archive.sql` written, **not pasted** into Supabase | confirmed (`MASTER_CONTEXT.md:281`) |
| `061_chat_channels.sql` written, **not pasted** into Supabase | confirmed (`MASTER_CONTEXT.md:271`) |
| Messages are **soft**-deleted (`deleted_at` UPDATE, row never removed) | confirmed (`supabase-chat-service.mjs:349`) |
| `attachments` is `jsonb NOT NULL DEFAULT '[]'`, filename key is `name` | confirmed (`059:19`, `supabase-chat-service.mjs:291`) |
| `wein_chat_is_active_member` already requires `c.archived_at IS NULL` | confirmed (`047:93`) |
| `chat_messages_select_member` already scopes messages to active membership | confirmed (`047:205`) |
| `listChannels()` already exists in both real and mock services | confirmed (`supabase-chat-service.mjs:211`, `mock-chat-service.mjs:149`) |
| Sidebar is a **flat** recency sort, no sections | confirmed (`chat-domain.mjs:15`) |
| Playwright suite mocks Supabase entirely (fabricated session, baked fixtures) | confirmed (`tests/smoke/team-chat-nav.spec.ts:364`) |
| `npm run typecheck` / `npm run build` / `npm run test:smoke` all exist | confirmed (`package.json`) |
| A second, **non-admin** Supabase account already exists | confirmed — `WEIN_TEAM_TEST_EMAIL` in `workflow/.env`, profile "Portal Chat Team Test", role `team` |
| `scripts/apply_supabase_sql.py` cannot connect — **known broken** | `SUPABASE_DB_URL`'s password is wrapped in literal `[...]`; `resolve_db_url()` strips brackets from the host only, so auth fails. This is why migrations are hand-pasted. |

---

## 1. Fix `061_chat_channels.sql` before it is ever pasted — ✅ APPLIED

All three defects below are cheap to fix now and expensive to fix after the migration is
live. None was a fix-forward candidate, so `061` was edited in place.

**Status: done.** `061_chat_channels.sql` now carries all three fixes, `mock-chat-service.mjs`
mirrors the two behavioral ones, and coverage was added in both test layers. Verified:
37/37 SQL contract tests (6 new), 43/43 portal unit tests, 42/42 Playwright smoke,
`npm run typecheck` clean. The file is ready to paste after `060`.

### 1a. Rejoining a channel demotes its owner

`061:157` currently ends with:

```sql
ON CONFLICT (conversation_id, user_id) DO UPDATE
  SET left_at = NULL,
      membership_role = 'member';
```

Leaving sets `left_at` but preserves `membership_role='owner'`. Rejoining then overwrites it
to `'member'`. This makes v1 §5's "if the channel owner leaves, ownership remains recorded"
false, and would silently revoke a creator's metadata-edit rights (v1 §2) after a single
leave/rejoin cycle.

Fix as applied — preserve an existing owner role on rejoin. The old-row reference uses the
bare relation name (`wein_chat_members.`), not the schema-qualified form, which is what
Postgres accepts inside `ON CONFLICT DO UPDATE`:

```sql
ON CONFLICT (conversation_id, user_id) DO UPDATE
  SET left_at = NULL,
      membership_role = CASE
        WHEN wein_chat_members.membership_role = 'owner' THEN 'owner'
        ELSE 'member'
      END;
```

`mock-chat-service.mjs`'s `joinChannel()` had the identical bug — it passed a flat
`"member"` to `addMemberRow()`, which overwrites `membership_role` on reactivation — and now
reads the existing row first. `addMemberRow()` itself was left alone: it is shared with the
group `addMember` path, which mirrors 055's own unconditional reset.

**Noted, deliberately not fixed:** `wein_chat_add_member` (055:47) has the same
unconditional `membership_role = 'member'` on conflict, so re-adding a former group owner
demotes them. It is already live, and the semantics differ — a manager explicitly re-adding
someone is a deliberate act, whereas self-rejoining a channel is not. Out of scope here;
worth its own decision later.

**And, independently:** metadata-edit permission (§3 below) is keyed off `created_by`, not
`membership_role`. `created_by` is immutable — the guard trigger at `061:80` raises on any
change to it — so it is the durable ownership signal. The `ON CONFLICT` fix above is still
correct on its own merits (member-list badges, `canManageMembers()`), but permission does
not depend on it.

### 1b. Re-running 061 would silently delete 062's constraints

`061:31-38` loops over **every** check constraint on `wein_chat_conversations`, drops all of
them, and re-adds exactly two. Once `062` adds `topic`/`description` length checks, any
later re-run of `061` removes them with no error and no warning.

Fix as applied — narrow the loop to constraints whose definition mentions `kind`:

```sql
FOR con IN
  SELECT conname
  FROM pg_constraint
  WHERE conrelid = 'public.wein_chat_conversations'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ~* '\mkind\M'
LOOP
```

Verified this is the exact filter rather than an approximation:
`wein_chat_conversations` has only ever carried four check constraints — 047's two inline
ones (`kind IN ('dm','group')` and `kind = 'group' OR title IS NULL`) plus the two 061
re-adds — and all four reference `kind`. No other migration adds one. So the loop still
drops everything it must, stays re-runnable, and leaves 062's future topic/description
checks alone.

The original wide loop existed because 047 declared its checks inline and unnamed, so their
generated names could not be guessed. Filtering on the constraint *definition* preserves
that property. Every migration from 062 on **must** use explicitly named constraints so
this cannot recur.

### 1c. `wein_chat_join_channel` does not reject archived channels

v1 §3 says archived channels leave the directory, but a stale client can still call join on
one — and since `wein_chat_is_active_member()` already returns false for an archived
conversation (047:93), that join would succeed into a membership row granting nothing.

Fix as applied — the `SELECT` now fetches `archived_at` alongside `kind`, and the RPC fails
loudly next to the existing `v_kind <> 'channel'` guard:

```sql
IF v_archived_at IS NOT NULL THEN
  RAISE EXCEPTION 'this channel has been archived';
END IF;
```

`mock-chat-service.mjs`'s `joinChannel()` throws the same message.

### Verification before anything else starts — ✅ DONE, all green

`060` then `061` were pasted 2026-07-30 and verified against live Supabase: **15/15
structural checks** (pg_catalog: constraints, policies, function bodies, grants) and
**16/16 behavioral checks** run as real users inside a rolled-back transaction. Zero test
data persisted — the channel count was back to 0 immediately after.

Notable structural confirmations: `wein_chat_conversations` now carries exactly two check
constraints, both explicitly named, with no orphaned 047 duplicates left behind — so the
narrowed drop loop (§1b) behaved correctly on a real apply. Message SELECT RLS is unchanged
and still membership-gated; channels did not loosen it.

The checklist, all passing:

- Admin and manager can create public channels; a regular team member cannot.
- Every authenticated user can discover active public channels.
- A non-member cannot read a channel's messages.
- Join → leave → rejoin works, **and the original owner is still `owner` after rejoin** (1a).
- Join RPC rejects a DM id, a group id, and an archived channel id (1c).
- DM archiving works; DM titles still cannot be changed.
- Direct REST insert of `kind='channel'` from a non-admin account is rejected by RLS
  (`061:62`), not only by the RPC.

---

## 2. Slice order

Five slices, each with its own commit, its own full-suite run, and its own live
verification — the same discipline every shipped Team Chat feature has followed. Only
Slice 0 is a hard prerequisite for the rest; Slices 2–5 could reorder if priorities change.

| # | Slice | Migration | Rationale for position |
|---|---|---|---|
| 0 | Fix + paste 060/061 (§1) | edits to 061 | Everything else assumes channels work |
| 1 | Reliability / async-action state | none | Front-loaded — see below |
| 2 | Channel metadata + directory | `062` | Highest user-visible value |
| 3 | Sidebar sections | none | Client-only; independent |
| 4 | Pinned messages | `063` | Self-contained |
| 5 | Advanced search | `064` | Replaces a working feature — go last |

**Why the reliability refactor moves to the front.** v1 put it last (§7), applied to every
action including the nine already shipped and tested. Retrofitting a state machine onto
working code *after* four new features have landed on the old pattern means touching all of
it twice and bisecting failures across both. Doing it first means it is a pure refactor with
zero new behavior — the cleanest thing in the world to verify, because every existing test
must still pass unchanged — and Slices 2–5 are then written on the new substrate from the
start.

**Why search goes last.** Search already works today (`supabase-chat-service.mjs:168`).
Slice 5 replaces something users depend on, so it should ship when nothing else is in
flight and a revert is a single clean commit.

---

## Slice 1 — Reliability and feedback substrate — ✅ SHIPPED (2026-07-31)

No migration. Pure refactor: no new user-visible capability, no behavior change.

**Status: done.** Every existing test passes unchanged (44/44 unit — 1 new file,
`chat_domain.test.mjs` — the other 43 untouched; 42/42 Playwright smoke, zero test-file
edits), `npm run typecheck` clean, and the shared substrate is live end-to-end against real
Supabase (mute toggle proven: pending disables the control synchronously, the underlying RPC
call resolves, and the DOM re-enables with the new state — verified by monkey-patching
`Element.prototype.innerHTML`'s setter to catch the render() call in real time, not just by
reading the eventual result).

**Process gap found and closed while verifying this slice — matters beyond Slice 1.** The
portal serves a **pre-built bundle** at `/portal-dist/assets/main.js` (`vite.config.ts`:
`outDir: 'portal/dist'`), not the raw `src/` files. `npm run test:smoke` was just
`playwright test` with no build step before it. Editing `chat-view.mjs`, running the smoke
suite, and seeing it pass proves nothing if the bundle wasn't rebuilt first — the suite is
silently testing whatever code happened to be in `portal/dist` already. This was caught only
because a live browser check (monkey-patching `innerHTML` to detect synchronous renders)
showed the pending-disable behavior wasn't happening — the running bundle predated this
slice's edits entirely, despite Playwright reporting 42/42 green against it.

**Fixed durably, not just noted:** added `"pretest:smoke": "npm run build"` to
`package.json` — npm's lifecycle convention runs `pre<script>` automatically before
`<script>`, so `npm run test:smoke` now always rebuilds first. Verified by deleting
`portal/dist/assets/main.js` and confirming `npm run test:smoke` regenerated it before
Playwright launched. From here on, **`npm run build` must run before any Playwright or live
browser check** — either via `npm run test:smoke` (now automatic) or manually before a raw
`npx playwright test` invocation or before opening the browser preview.

Replace the ad hoc per-action flags in `chat-view.mjs` with one shared async-action state
keyed by action id. Cover the nine operations that exist **today**:

Replace the ad hoc per-action flags in `chat-view.mjs` with one shared async-action state
keyed by action id. Cover the nine operations that exist **today**:

create channel/group · start DM · join channel · add/remove member · rename ·
archive · set membership role · send/edit/delete message · upload attachment

Each gets: disabled controls while pending, no duplicate submission, a visible contextual
error, retry where the action is safely repeatable, success feedback where the UI does not
otherwise obviously change, state refresh on success, and existing state retained on
failure.

Add a single error-mapping helper that turns known backend failures into readable messages
with a generic fallback. Raw Supabase/Postgres error strings must never reach the user.
Seed it with the exceptions the migrations actually raise, so the mapping is grounded in
real strings rather than guesses:

- `only an admin or manager may create a channel` (061:109)
- `channel name is required` (061:112)
- `only channels can be joined this way` (061:152)
- `this channel has been archived` (§1c)
- `conversation not found` (061:149)
- `chat conversation immutable columns cannot be updated` (061:82)
- `only group or channel conversations can be renamed` (061:86)

Slices 2–5 register their new actions with this substrate; they do not add new flags.

**Done when:** every existing unit and smoke test passes with no test-file changes beyond
selector updates, `npm run typecheck` clean, and a deliberately failed action (offline the
network mid-call) shows a mapped message and leaves prior state intact.

---

## Slice 2 — Channel metadata and directory (`062_chat_channel_metadata.sql`)

### Schema

```sql
ALTER TABLE public.wein_chat_conversations
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.wein_chat_conversations
  ADD CONSTRAINT wein_chat_conversations_topic_len
    CHECK (topic IS NULL OR char_length(topic) <= 160),
  ADD CONSTRAINT wein_chat_conversations_description_len
    CHECK (description IS NULL OR char_length(description) <= 1000);
```

Named constraints, per §1b. DMs and private groups do not use these fields in this release.
Length limits are enforced **server-side as well as** in the UI — the 160/1000 UI limits
alone are not a constraint.

### `wein_chat_update_channel_details(p_conversation_id, p_title, p_topic, p_description)`

`SECURITY DEFINER`. Permission: `created_by = auth.uid()` **or**
`wein_chat_is_admin_or_manager(auth.uid())`. Keyed on `created_by`, not `membership_role`
— see §1a. Rejects non-channel kinds, rejects archived channels, trims and length-checks
inputs, and raises named exceptions that Slice 1's mapper already knows how to render.

### Directory RPC

`SECURITY DEFINER` — required, not a convenience. A plain table select **cannot** return
`member_count` for a channel the caller has not joined, because `wein_chat_members` RLS is
unchanged by 061; this is exactly why the current `listChannels()` returns only bare
conversation rows and documents that limitation at `supabase-chat-service.mjs:212-218`.

Returns per row: `id, title, topic, description, created_by, creator_name, created_at,
member_count, joined_by_current_user, archived_at`.

Two hard rules on the implementation:

1. `member_count` is computed as an explicit server-side `COUNT(*) FILTER (WHERE left_at IS
   NULL)`. Never `SELECT *` from `wein_chat_members` and count client-side — that ships
   member identities to a non-member over the wire even if the UI never renders them.
2. The aggregate is computed **identically** whether or not the caller has joined. Do not
   embed real member rows for joined channels and aggregate only for the rest; uniform is
   simpler to reason about and simpler to test.

Archived channels are excluded from the directory.

### Service contracts

`listChannels()` already exists in both services — this slice **changes its implementation**
from a table select to the directory RPC and widens its return shape. Add
`updateChannelDetails(conversationId, details)` and an explicit
`leaveChannel(conversationId)`; the latter may internally call
`removeMember(conversationId, currentUserId)`, but the view calls the explicit method so
intent and error messages stay clear. Mock service keeps behavioral parity, including the
new directory fields.

### UI

Replace the minimal join list with a real directory: search by title and topic; all active
public channels; joined first then alphabetical; name, topic, member count, creator per row;
`Current` / `Open` / `Join` per state; create-channel entry point for admins/managers;
refresh after create/join/leave/rename/archive; directory state preserved on failure
(Slice 1 handles the last two).

Channel header gains: name, topic underneath when present, member count, search, notification
control, and an actions menu (view details · edit details for creator/admin/manager · leave ·
archive for creator/admin/manager). Leaving requires confirmation, explains rejoining via
Browse Channels, then removes the channel from the sidebar, closes its message view, selects
the next conversation, and leaves it visible in the directory.

**Leave-flow asymmetry, resolved deliberately:** channels get a prominent header Leave
action; groups keep self-leave in the members panel. This is intentional — channel
membership is self-service, group membership is not — and is recorded here so it does not
read as an oversight later.

Ownership transfer remains out of scope.

---

## Slice 3 — Sidebar sections

No migration, no service change. Genuinely new work: `sortConversations()`
(`chat-domain.mjs:15`) is a flat recency sort today with no grouping of any kind.

Three sections: Channels (`#`), Private groups (lock), Direct messages (avatar). Within each
section, unread sorts above read; ties break on latest activity. Sections collapse and hold
that state for the session. Section headers show an unread count when nonzero — summed from
the same `conversation.unread_count` the global sidebar badge already uses, so the two can
never disagree. Muted conversations stay visible with subdued unread styling. Leaving a
channel removes it from the sidebar but keeps it in the directory; archiving removes it from
both.

Mobile: opening a conversation closes the sidebar and preserves the selection.

Grouping and sorting go in `chat-domain.mjs` as pure functions so they get direct
`node --test` coverage, matching the `.mjs`-for-logic split this repo already follows.

---

## Slice 4 — Pinned messages (`063_chat_pinned_messages.sql`)

### Schema

```sql
CREATE TABLE IF NOT EXISTS public.wein_chat_pinned_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.wein_chat_conversations(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES public.wein_chat_messages(id) ON DELETE CASCADE,
  pinned_by uuid NOT NULL REFERENCES public.profiles(id),
  pinned_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wein_chat_pinned_messages_unique UNIQUE (conversation_id, message_id)
);
```

**Deleted-message pins — v1 specified two contradictory behaviors; this picks one.** v1's
constraints section said "deleting a message automatically removes its pin" while its UI
section said pins merely "disappear from the pinned panel." Messages are soft-deleted (an
UPDATE setting `deleted_at`, `supabase-chat-service.mjs:349`) — the row never disappears, so
`ON DELETE CASCADE` will never fire for a user-initiated delete.

**Decision: filter at read time.** `listPinnedMessages` joins messages and applies
`WHERE m.deleted_at IS NULL`, exactly how every other message query in the service already
behaves. No trigger, no physical cleanup. The `ON DELETE CASCADE` above stays for genuine
row deletion (conversation hard-delete, admin cleanup) but is not the mechanism for the
normal case.

### Security

RLS: read requires `wein_chat_is_active_member(conversation_id, auth.uid())` — which also
means pins in an archived conversation become unreadable, consistent with messages
(`047:93`). Direct table INSERT/DELETE is not granted; pin and unpin go through RPCs. Any
active member may pin or unpin — deliberately not gated to admin/manager, since gating
defeats the purpose of a "flag this" affordance. Members who left lose access. The pin RPC
validates that the message actually belongs to the named conversation.

### Service and UI

`listPinnedMessages(conversationId)` · `pinMessage(conversationId, messageId)` ·
`unpinMessage(conversationId, messageId)`, both services, identical shapes.

Pin/unpin in each message's action menu with a filled state when pinned; a compact pinned
strip beneath the conversation header; a Pinned Messages panel showing sender, excerpt,
attachment indicator, who pinned it, and date; jump-to-message from the panel; confirmation
before unpinning someone else's pin; empty/loading/failure states via Slice 1.

---

## Slice 5 — Advanced message search (`064_chat_search.sql`)

Replaces the working global body search at `supabase-chat-service.mjs:168`.

### `wein_chat_search_messages` — `SECURITY INVOKER`

```sql
wein_chat_search_messages(
  p_query text,
  p_conversation_id uuid default null,
  p_sender_id uuid default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_has_attachments boolean default null,
  p_limit integer default 50
)
```

**`SECURITY INVOKER` is the specification, not an implementation detail** — v1 left it
unstated, and it is the one place where a wrong default silently exposes every user's DMs to
every other user. Under INVOKER, existing RLS delivers two of the six rules for free:
`chat_messages_select_member` (`047:205`) scopes results to active memberships, and
`wein_chat_is_active_member` itself requires `archived_at IS NULL` (`047:93`), so archived
conversations are already excluded. Under `SECURITY DEFINER` both would have to be
hand-reimplemented correctly inside the function, with nothing behind them if they are not.

If a future full-text index makes DEFINER unavoidable, the membership predicate must be
re-added explicitly and covered by its own negative test before the change ships.

### Rules

- Deleted messages excluded (`deleted_at IS NULL`).
- Newest first.
- `LEAST(COALESCE(p_limit, 50), 50)` — the cap is enforced in the RPC, not documented as a
  default. A caller passing `p_limit => 10000` gets 50.
- Blank `p_query` allowed when another filter is set.
- Case-insensitive matching, Arabic included, no language-specific stemming.

### Attachment filename matching

`attachments` is `jsonb NOT NULL DEFAULT '[]'` (`059:19`) and the filename key is `name`
(`supabase-chat-service.mjs:291`):

```sql
EXISTS (
  SELECT 1 FROM jsonb_array_elements(m.attachments) a
  WHERE a->>'name' ILIKE '%' || p_query || '%'
)
```

Reuse the existing `escapeIlikePattern` on the client so `%` and `_` in a user's query stay
literal — the current search already does this, and dropping it would be a regression.

### UI

Scope toggle (current conversation / all joined), text query, sender filter, date range,
attachments-only toggle. Results show conversation title for context, highlight matched
terms and filenames, and open the conversation scrolled to the message on selection.

The RPC is the stable frontend contract; moving to a full-text index later must not change
it.

---

## Testing

### Per slice (all five)

```bash
npm run typecheck
```
```bash
node --test tests/
```
```bash
npm run test:smoke
```

`npm run test:smoke` rebuilds automatically via `pretest:smoke` (added in Slice 1 — see
above) before Playwright runs, so the suite is always exercising the current source. Run
`npm run build` manually only when checking the app in a live browser outside this command
— that step is easy to forget and was in fact forgotten once during Slice 1, silently
testing a stale bundle for a full round of "verification" until a live DOM check caught it.

Plus desktop and mobile screenshot review for overflow, overlapping controls, empty panels,
and sidebar stability.

### Unit / mock coverage

Channel discovery for non-members · admin/manager create permission and regular-user
rejection · join/leave/**rejoin-preserves-owner** (§1a) · join rejects archived channel
(§1c) · channel metadata validation including server-side length limits · sidebar section
grouping and sort order · all-member pin/unpin · duplicate pin rejection · pin hidden after
soft delete · search scope and each filter · membership isolation for pins and search.

Supabase adapter tests assert exact RPC names and parameter shapes, backend error mapping,
empty responses, and directory metadata shape.

### Browser tests — corrected scope

**v1 §9 asked for two-user Playwright flows. The harness cannot provide them.** The smoke
suite mocks Supabase entirely in-page: `signInWithPassword` returns a fabricated session
(`tests/smoke/team-chat-nav.spec.ts:364`) against fixtures baked at construction. There is
no second user and no RLS in that environment.

What Playwright will actually cover, honestly labeled: a second `login()` with a *simulated*
different identity/role, proving the **UI branches** — create-channel hidden for a
non-admin, Join vs Open vs Current states, another member's pin showing the unpin
confirmation, directory refresh after each mutation, search filter combinations, mobile
sidebar and directory behavior, and loading / permission-denied / simulated-backend-error
states.

What Playwright will **not** cover, and must not be claimed: that a non-member genuinely
cannot read a channel's messages, that a regular user genuinely cannot create a channel,
that search genuinely cannot cross a membership boundary. Those are RLS properties and are
only provable against live Supabase.

**Prerequisite — already met.** Real cross-user verification needs a second Supabase account
with a non-admin role, and one already exists: `WEIN_TEAM_TEST_EMAIL` in `workflow/.env`,
profile "Portal Chat Team Test", role `team`. (An earlier draft of this plan claimed only
one test account existed and made creating a second a Slice 0 prerequisite. That was wrong.)
The live roster is two `admin` profiles and that one `team` profile — enough for every
permission split this release introduces, since all of them are admin/manager-vs-everyone.

### The verification technique to reuse: rolled-back transaction against live Supabase

There is no separate staging Supabase project, so "verify in staging" has no literal
referent. The substitute used to verify 060/061 works well and should be reused for
062–064:

Connect over the transaction pooler with `autocommit=False`, impersonate a real user with

```sql
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<uuid>","role":"authenticated"}', true);
```

(which is exactly what `auth.uid()` reads), exercise the RPCs and RLS for real, wrap each
expected-failure case in a `SAVEPOINT`, then `conn.rollback()` at the end. RLS and
`SECURITY DEFINER` behave normally inside a transaction, so the results are genuine — but
nothing persists, so no test channel ever appears in a real user's sidebar.

This is the only way to get true RLS proof here without either a staging project or leaving
debris in production. It is strictly better than the mocked Playwright layer for permission
questions, and strictly better than manual clicking for repeatability.

---

## Rollout (per slice)

1. Back up the Supabase schema.
2. Slice 0 only: apply and verify `060`, then the corrected `061`, against the §1 checklist.
3. Apply this slice's migration (`062`/`063`/`064`) in staging.
4. Deploy through the **development** portal entry. Production `index.html` is not edited
   until dev has passed verification.
5. Run the full automated suite against mock and staging Supabase.
6. Two-account permission testing with the admin and the non-admin account created in
   Slice 0.
7. Promote to the production portal only after staging passes.
8. Monitor failed chat RPC calls, search latency, attachment failures, and RLS denials for
   the first production day.
9. Update `MASTER_CONTEXT.md` with the migration, service contracts, tests, and deployment
   status before starting the next slice.

---

## Assumptions and boundaries

Unchanged from v1: all channels are public and discoverable, private communication stays in
groups and DMs; channel creation stays admin/manager-only; any active member may pin or
unpin; channel details are editable by creator, admin, or manager; existing messages, DMs,
groups, mentions, attachments, unread state, and notifications stay compatible.

Out of scope: message threads, reactions, presence indicators, voice/video, private channels,
ownership transfer, subchannels.

Added in v2: metadata-edit permission keys off `created_by` rather than `membership_role`;
pins are hidden by read-time filtering rather than removed on soft delete; the search RPC is
`SECURITY INVOKER`; the channel-vs-group leave-flow asymmetry is deliberate.
