import { canDelete, canEditProviderProfile, canManageDeals, defaultViewForRole, navHiddenForRole, type SessionContext } from '../auth/permissions';
import { portalApi } from '../platform/portal-api';
import { getAccessToken, getSupabaseClient } from '../platform/supabase-client';
import { portalStore } from '../state/portal-store';

export interface PermissionService {
  canDelete(): boolean;
  canManageDeals(): boolean;
  canEditProviderProfile(): boolean;
  navHiddenForRole(role?: string | null): readonly string[];
  defaultViewForRole(role?: string | null): string;
}

export interface PortalContext {
  api: typeof portalApi;
  store: typeof portalStore;
  session: SessionContext & {
    accessToken: string | null;
    client: ReturnType<typeof getSupabaseClient>;
  };
  permissions: PermissionService;
  navigate(view: string, params?: unknown): void;
}

declare global {
  interface Window {
    WEIN?: {
      user?: unknown;
      role?: string | null;
      fullName?: string | null;
    };
    showView?: (name: string, params?: unknown) => void;
  }
}

function currentSession() {
  const legacySession = window.WEIN ?? {};
  return {
    user: legacySession.user,
    role: legacySession.role ?? sessionStorage.getItem('weinRole'),
    fullName: legacySession.fullName ?? null,
    accessToken: getAccessToken(),
    client: getSupabaseClient(),
  };
}

export function createPortalContext(): PortalContext {
  const session = currentSession();
  return {
    api: portalApi,
    store: portalStore,
    session,
    permissions: {
      canDelete: () => canDelete(currentSession()),
      canManageDeals: () => canManageDeals(currentSession()),
      canEditProviderProfile: () => canEditProviderProfile(currentSession()),
      navHiddenForRole,
      defaultViewForRole,
    },
    navigate(view: string, params?: unknown) {
      window.showView?.(view, params);
    },
  };
}
