# Portal Chat Feature Module

Isolated Phase 3 module for the portal team-chat plan. This folder does not
touch `portal_new.html` and should not be registered into the live shell until
the modularization completion gate is met.

## Entry Point

- `chat-view.mjs` exports `createChatViewModule()`.
- `supabase-chat-service.mjs` exports `createSupabaseChatService()`.
- The returned module has `id: "team-chat"` and a `mount(root, context)` method.
- `mount()` returns a cleanup function and owns its polling interval.
- Realtime is optional. If the injected service exposes
  `subscribeToConversationEvents(onEvent)`, the view subscribes and refreshes on
  chat table changes; otherwise it falls back to 30s polling.

Expected future registry shape:

```js
import { createChatViewModule } from "./features/chat/chat-view.mjs";
import { createSupabaseChatService } from "./features/chat/supabase-chat-service.mjs";

registry.register(createChatViewModule());
```

## Required Context

```js
{
  currentUser: { id, full_name, role, email },
  service: {
    listProfiles,
    listConversations,
    listMessages,
    createGroup,
    getOrCreateDm,
    addMember,
    sendMessage,
    markRead
  }
}
```

## Live Backend Contract

- Group creation should call `rpc/wein_chat_create_group`, not direct INSERT
  into `wein_chat_conversations`.
- DM creation should call `rpc/wein_chat_get_or_create_dm`.
- Membership is explicit through `wein_chat_members`; no department-derived
  authorization.
- Message send requires `client_nonce`; retries with the same nonce must not
  duplicate a message.
- Unread state is `wein_chat_members.last_read_seq`, not timestamps.
- Realtime listens to `wein_chat_conversations`, `wein_chat_members`, and
  `wein_chat_messages`. Presence and typing indicators remain deferred.

`createSupabaseChatService({ supabase, currentUserId })` expects the future
portal context to pass the single authenticated Supabase client owned by the
modular platform layer. It does not create its own client.

## Local Mock

Open `chat-mock.html` in a browser to inspect the isolated UI. The mock service
implements the same contract in memory and is covered by:

```powershell
node tests\chat_feature.test.mjs
node tests\chat_supabase_service.test.mjs
node tests\chat_view_lifecycle.test.mjs
node tests\chat_mobile_contract.test.mjs
```

## Mobile Behavior

At phone width, the module uses a focused two-state layout:

- Conversation list first.
- Selecting a conversation adds `chat-has-selection` to the root and shows only
  the thread.
- The thread has a back button that returns to the list.
- The composer is sticky at the bottom with 44px controls and safe-area padding.
- Long message text uses `overflow-wrap:anywhere` to prevent horizontal scroll.
