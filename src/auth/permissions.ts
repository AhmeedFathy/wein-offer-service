export type PortalRole = 'admin' | 'manager' | 'deal_breaker' | 'team' | string | null | undefined;

export type SessionContext = {
  role?: PortalRole;
  user?: unknown;
  fullName?: string | null;
};

function roleOf(session: SessionContext | PortalRole): PortalRole {
  return typeof session === 'object' && session !== null ? session.role : session;
}

export function canDelete(session: SessionContext | PortalRole): boolean {
  const role = roleOf(session);
  return role === 'admin' || role === 'manager';
}

export const canManageDeals = canDelete;

export function canEditProviderProfile(session: SessionContext | PortalRole): boolean {
  const role = roleOf(session);
  return role === 'admin' || role === 'manager' || role === 'deal_breaker';
}

export const NAV_HIDDEN_FOR_ROLE: Record<string, readonly string[]> = {
  deal_breaker: ['analytics', 'settings'],
  team: ['analytics', 'settings', 'leads', 'pipeline', 'deals', 'launch', 'providers', 'offers', 'map', 'marketing'],
};

export function navHiddenForRole(role: PortalRole): readonly string[] {
  return role ? NAV_HIDDEN_FOR_ROLE[role] ?? [] : [];
}

export function defaultViewForRole(role: PortalRole): string {
  return navHiddenForRole(role).includes('pipeline') ? 'tasks' : 'pipeline';
}
