# Record Discussion module

Isolated Phase 7 implementation for portal record comments.

This module is intentionally not wired into `portal_new.html` yet. The main portal shell remains frozen until the modularization gate is logged.

## Data contract

Reads/writes the existing `wein_comments` table plus the Phase 7 additions:

- `author_id`
- `reply_to_id`
- `resolved_at`
- `resolved_by`
- `resolved_note`

Additional Phase 7 tables:

- `wein_comment_mentions`
- `wein_comment_task_links`

Task creation goes through the `wein_create_task_from_comment` RPC so comments create authoritative `wein_tasks` rows instead of a parallel task system.

## Module files

- `discussion-domain.mjs`: pure formatting/tree/mention helpers.
- `mock-discussion-service.mjs`: in-memory service for UI development and tests.
- `supabase-discussion-service.mjs`: authenticated Supabase adapter with zero-row guards for updates.
- `discussion-view.mjs`: mountable isolated UI for comments, replies, resolve/reopen, and create-task-from-comment.
- `discussion-styles.css`: standalone styling with mobile sticky composer.
- `discussion-mock.html`: local mock harness that does not touch live portal state.

## Integration rule

Future integration should mount this module inside record detail views only after the portal modularization plan permits editing the shell/view registry.
