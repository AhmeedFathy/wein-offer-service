import { registerView } from '../core/view-registry';
import type { PortalContext } from '../core/portal-context';
import { createChatViewModule } from './chat/chat-view.mjs';
import { createSupabaseChatService } from './chat/supabase-chat-service.mjs';

type AuthUser = {
  id?: string | null;
  email?: string | null;
};

function authUserFromContext(context: PortalContext): AuthUser {
  return typeof context.session.user === 'object' && context.session.user !== null
    ? context.session.user
    : {};
}

function currentUserForChat(context: PortalContext) {
  const authUser = authUserFromContext(context);
  const id = authUser.id;
  if (!id) throw new Error('Team chat requires an authenticated user id.');

  return {
    id,
    full_name: context.session.fullName || authUser.email || 'Portal user',
    role: context.session.role || 'team',
    email: authUser.email || null,
  };
}

let pendingChatConversationId: string | null = null;

export function requestOpenChatConversation(id: string | null | undefined): void {
  pendingChatConversationId = id || null;
}

export function registerFeatureViews(): void {
  const chatModule = createChatViewModule();

  registerView({
    id: 'team-chat',
    mount(root, portalContext) {
      const initialConversationId = pendingChatConversationId;
      pendingChatConversationId = null;
      const currentUser = currentUserForChat(portalContext);
      const service = createSupabaseChatService({
        supabase: portalContext.session.client,
        currentUserId: currentUser.id,
      });

      return chatModule.mount(root, { currentUser, service, initialConversationId });
    },
  });
}
