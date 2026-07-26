import { getLegacyPortalBridge } from '../platform/supabase-client';

export type PortalCacheName =
  | 'providers'
  | 'offers'
  | 'negotiations'
  | 'files'
  | 'leads'
  | 'outcomes'
  | 'tasks'
  | 'profiles'
  | 'redemptions'
  | 'campaigns'
  | 'calendarNotes';

export type PortalRow = Record<string, unknown>;

export type PortalCaches = Record<PortalCacheName, readonly PortalRow[]>;

const EMPTY_CACHES: PortalCaches = {
  providers: [],
  offers: [],
  negotiations: [],
  files: [],
  leads: [],
  outcomes: [],
  tasks: [],
  profiles: [],
  redemptions: [],
  campaigns: [],
  calendarNotes: [],
};

function liveCaches(): PortalCaches {
  const caches = getLegacyPortalBridge().getCaches?.() as Partial<Record<PortalCacheName, PortalRow[]>> | undefined;
  if (!caches) return EMPTY_CACHES;
  return {
    providers: caches.providers ?? [],
    offers: caches.offers ?? [],
    negotiations: caches.negotiations ?? [],
    files: caches.files ?? [],
    leads: caches.leads ?? [],
    outcomes: caches.outcomes ?? [],
    tasks: caches.tasks ?? [],
    profiles: caches.profiles ?? [],
    redemptions: caches.redemptions ?? [],
    campaigns: caches.campaigns ?? [],
    calendarNotes: caches.calendarNotes ?? [],
  };
}

export function getCache<T extends PortalRow = PortalRow>(name: PortalCacheName): readonly T[] {
  return liveCaches()[name] as readonly T[];
}

export function getPortalCaches(): PortalCaches {
  return liveCaches();
}

export function replaceCache<T extends PortalRow = PortalRow>(name: PortalCacheName, rows: readonly T[]): void {
  const setCache = getLegacyPortalBridge().setCache;
  if (!setCache) throw new Error('Portal cache bridge is not available yet.');
  setCache(name, [...rows]);
}

export function updateCache<T extends PortalRow = PortalRow>(
  name: PortalCacheName,
  updater: (rows: readonly T[]) => readonly T[],
): void {
  replaceCache(name, updater(getCache<T>(name)));
}

export const portalStore = {
  get providers() { return getCache('providers'); },
  get offers() { return getCache('offers'); },
  get negotiations() { return getCache('negotiations'); },
  get files() { return getCache('files'); },
  get leads() { return getCache('leads'); },
  get outcomes() { return getCache('outcomes'); },
  get tasks() { return getCache('tasks'); },
  get profiles() { return getCache('profiles'); },
  get redemptions() { return getCache('redemptions'); },
  get campaigns() { return getCache('campaigns'); },
  get calendarNotes() { return getCache('calendarNotes'); },
  getCache,
  replaceCache,
  updateCache,
};
