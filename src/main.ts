import { canDelete, canEditProviderProfile, canManageDeals, defaultViewForRole, navHiddenForRole } from './auth/permissions';
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
  }
}

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
  store: portalStore,
  selectors,
};

window.WEIN_PORTAL_MODULES = portalModules;

export { portalModules };
