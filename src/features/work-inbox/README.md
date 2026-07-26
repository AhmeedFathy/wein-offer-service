# Work Inbox module

Isolated Phase 8 safe-lane module for extending the portal `Today` aggregator later.

This does not edit or register into `portal_new.html`. When the modularized portal shell is ready, this module should feed the existing Today view instead of creating a parallel inbox screen.

## Normalized item shape

Every signal becomes:

`kind, entity_id, title, reason_code, severity, owner_id, due_at, next_action, href`

## Current v1 sources

- Open/overdue `wein_tasks`
- Unresolved UUID mentions from `wein_comment_mentions` joined to `wein_comments`
- Pure helper support for thread-awaiting-reply and founder-review signals

The live adapter intentionally starts with sources now present in the schema. Offer/content review and negotiation-staleness signals can plug into the same normalizer once their authoritative status fields are confirmed.

## Module files

- `work-inbox-domain.mjs`: pure normalization, severity, sorting, and dedupe helpers.
- `supabase-work-inbox-service.mjs`: authenticated Supabase adapter for current v1 sources.
- `mock-work-inbox-service.mjs`: in-memory adapter for isolated UI development.
- `work-inbox-view.mjs`: mountable attention-list UI for later Today integration.
- `work-inbox-styles.css`: standalone styling and mobile touch-target rules.
- `work-inbox-mock.html`: local mock harness that does not touch live portal state.
