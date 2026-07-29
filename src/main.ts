import { canDelete, canEditProviderProfile, canManageDeals, defaultViewForRole, navHiddenForRole } from './auth/permissions';
import { createPortalContext } from './core/portal-context';
import { getView, mountView, registeredViewIds, registerDummyCleanupProbeView, registerView } from './core/view-registry';
import { registerFeatureViews, requestOpenChatConversation } from './features/register-feature-views';
import { createSupabaseChatService } from './features/chat/supabase-chat-service.mjs';
import { formatTabTitle, totalUnreadCount } from './features/chat/chat-unread-badge.mjs';
import { createDiscussionViewModule } from './features/record-discussion/discussion-view.mjs';
import { createSupabaseDiscussionService } from './features/record-discussion/supabase-discussion-service.mjs';
import { createWorkInboxViewModule } from './features/work-inbox/work-inbox-view.mjs';
import { createSupabaseWorkInboxService } from './features/work-inbox/supabase-work-inbox-service.mjs';
import { LEGACY_VIEW_IDS, registerLegacyViews } from './legacy/register-legacy-views';
import { portalApi } from './platform/portal-api';
import { getAccessToken, getSessionContext, getSupabaseClient } from './platform/supabase-client';
import { categoryChipsHtml, categoryLabel, catBadgeClass, matchesCategoryFilter } from './shared/category-chips';
import { dayDiffFromToday, daysSince, startOfLocalDay } from './shared/dates';
import { escapeHtml } from './shared/html';
import { whatsappButtonHtml, whatsappLink } from './shared/whatsapp';
import { portalStore } from './state/portal-store';
import * as selectors from './state/selectors';

declare global {
  interface Window {
    WEIN_PORTAL_MODULES?: typeof portalModules;
    WEIN_PORTAL_MODULES_READY?: Array<(modules: typeof portalModules) => void>;
  }
}

// Sidebar Team Chat badge + tab-title prefix. Not tied to a view mount --
// it polls independently so the indicator is visible before Team Chat is
// ever opened. Deliberately not wired into chat-view.mjs's own 30s poll:
// see the plan notes on why that would add cross-module state for one
// extra lightweight read every 30s while Team Chat happens to be open.
function startChatUnreadBadge(): void {
  const baseTitle = document.title;
  let steadyStateStarted = false;

  async function tick(): Promise<void> {
    const userId = (window.WEIN?.user as { id?: string } | undefined)?.id;
    if (!userId) return;
    try {
      const service = createSupabaseChatService({ supabase: getSupabaseClient(), currentUserId: userId });
      const conversations = await service.listConversations();
      const total = totalUnreadCount(conversations);
      const badge = document.querySelector<HTMLElement>('[data-chat-unread-badge]');
      if (badge) {
        badge.textContent = String(total);
        badge.style.display = total > 0 ? 'inline-flex' : 'none';
      }
      document.title = formatTabTitle(baseTitle, total);
    } catch {
      // A transient fetch failure must not break the interval loop.
    }
  }

  // main.ts loads once at the very first page load, well before the login
  // form is even submitted -- a single "tick now, then every 30s" would
  // leave the badge silent for up to 30s after a fresh login. Poll quickly
  // until a logged-in user shows up, then switch to the steady 30s cadence.
  const bootstrapPoll = setInterval(() => {
    if ((window.WEIN?.user as { id?: string } | undefined)?.id && !steadyStateStarted) {
      steadyStateStarted = true;
      clearInterval(bootstrapPoll);
      setInterval(tick, 30000);
    }
    tick();
  }, 2000);
}

registerDummyCleanupProbeView();
registerFeatureViews();
startChatUnreadBadge();

const portalModules = {
  api: portalApi,
  auth: {
    canDelete,
    canManageDeals,
    canEditProviderProfile,
    navHiddenForRole,
    defaultViewForRole,
  },
  platform: {
    getSupabaseClient,
    getAccessToken,
    getSessionContext,
  },
  shared: {
    escapeHtml,
    daysSince,
    startOfLocalDay,
    dayDiffFromToday,
    whatsappLink,
    whatsappButtonHtml,
    categoryChipsHtml,
    matchesCategoryFilter,
    categoryLabel,
    catBadgeClass,
  },
  core: {
    createPortalContext,
    getView,
    mountView,
    registeredViewIds,
    registerView,
  },
  legacy: {
    LEGACY_VIEW_IDS,
    registerLegacyViews,
  },
  features: {
    requestOpenChatConversation,
    createDiscussionViewModule,
    createSupabaseDiscussionService,
    createWorkInboxViewModule,
    createSupabaseWorkInboxService,
  },
  store: portalStore,
  selectors,
};

window.WEIN_PORTAL_MODULES = portalModules;
for (const callback of window.WEIN_PORTAL_MODULES_READY ?? []) callback(portalModules);
window.WEIN_PORTAL_MODULES_READY = [];

export { portalModules };
