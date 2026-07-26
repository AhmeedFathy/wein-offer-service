# Assistant client module

Isolated Phase 9 frontend helper for calling the contextual `/api/chat` endpoint.

This module is not wired into `portal_new.html`. It is meant for the future modular shell once the registry/context layer exists.

## Entry points

- `buildAssistantPayload(input)`: builds the backend payload with `section_id`, `record_type`, `record_id`, `current_user_id`, caller capabilities, requested read tools, optional supplied tool results, and normalized messages.
- `sendAssistantMessage(input)`: POSTs to `/api/chat`, attaches the caller bearer token when supplied, and returns `{ reply, runtime, raw }`.
- `toolsForAssistantSection(sectionId)`: frontend mirror of the initial recommended read-tool list per section.

## Contract

The backend remains the source of truth for allowed tools and permissions. Frontend requested tools are hints only; `/api/chat` revalidates section scope and uses the caller bearer token, not service-role access.

No AI write actions are exposed here.
