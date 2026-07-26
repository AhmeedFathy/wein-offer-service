import { canDelete, canEditProviderProfile, canManageDeals, defaultViewForRole, navHiddenForRole } from './auth/permissions';
import { createPortalContext } from './core/portal-context';
import { getView, mountView, registeredViewIds, registerDummyCleanupProbeView, registerView } from './core/view-registry';
import { registerFeatureViews, requestOpenChatConversation } from './features/register-feature-views';
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

registerDummyCleanupProbeView();
registerFeatureViews();

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
  },
  store: portalStore,
  selectors,
};

window.WEIN_PORTAL_MODULES = portalModules;
for (const callback of window.WEIN_PORTAL_MODULES_READY ?? []) callback(portalModules);
window.WEIN_PORTAL_MODULES_READY = [];

export { portalModules };
