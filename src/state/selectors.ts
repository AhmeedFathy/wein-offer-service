import { getCache, type PortalRow } from './portal-store';

function rowId(row: PortalRow): unknown {
  return row.id;
}

export function profileById<T extends PortalRow = PortalRow>(id: unknown): T | null {
  return (getCache<T>('profiles').find((profile) => rowId(profile) === id) ?? null);
}

export function providerById<T extends PortalRow = PortalRow>(id: unknown): T | null {
  return (getCache<T>('providers').find((provider) => rowId(provider) === id) ?? null);
}

export function leadById<T extends PortalRow = PortalRow>(id: unknown): T | null {
  return (getCache<T>('leads').find((lead) => rowId(lead) === id) ?? null);
}

export function taskById<T extends PortalRow = PortalRow>(id: unknown): T | null {
  return (getCache<T>('tasks').find((task) => rowId(task) === id) ?? null);
}

export function offerById<T extends PortalRow = PortalRow>(id: unknown): T | null {
  return (getCache<T>('offers').find((offer) => rowId(offer) === id) ?? null);
}

export function offersForProvider<T extends PortalRow = PortalRow>(providerId: unknown): readonly T[] {
  return getCache<T>('offers').filter((offer) => offer.provider_id === providerId);
}

export function tasksForProvider<T extends PortalRow = PortalRow>(providerId: unknown): readonly T[] {
  return getCache<T>('tasks').filter((task) => task.provider_id === providerId);
}

export function tasksForLead<T extends PortalRow = PortalRow>(leadId: unknown): readonly T[] {
  return getCache<T>('tasks').filter((task) => task.lead_id === leadId);
}
