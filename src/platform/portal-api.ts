import { getAccessToken, getLegacyPortalBridge, getSupabaseAnonKey, getSupabaseUrl } from './supabase-client';

export class PortalApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = 'PortalApiError';
  }
}

export function sbHeaders(): Record<string, string> {
  const bridgeHeaders = getLegacyPortalBridge().headers?.();
  if (bridgeHeaders) return bridgeHeaders;

  const anonKey = getSupabaseAnonKey();
  return {
    apikey: anonKey,
    Authorization: `Bearer ${getAccessToken() || anonKey}`,
    'Content-Type': 'application/json',
  };
}

async function assertOk(response: Response, operation: string): Promise<void> {
  if (response.ok) return;
  const body = await response.text();
  throw new PortalApiError(`Supabase ${operation} failed: ${response.status}${body ? ` ${body}` : ''}`, response.status, body);
}

export async function sbGet<T = unknown>(path: string): Promise<T> {
  const legacyGet = getLegacyPortalBridge().get;
  if (legacyGet) return legacyGet<T>(path);

  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${path}`, { headers: sbHeaders() });
  await assertOk(response, 'GET');
  return response.json() as Promise<T>;
}

export async function sbPost<T = unknown>(table: string, body: unknown): Promise<T> {
  const legacyPost = getLegacyPortalBridge().post;
  if (legacyPost) return legacyPost<T>(table, body);

  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...sbHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(body),
  });
  await assertOk(response, 'POST');
  return response.json() as Promise<T>;
}

export async function sbPatch(path: string, body: unknown): Promise<boolean> {
  const legacyPatch = getLegacyPortalBridge().patch;
  if (legacyPatch) return legacyPatch(path, body);

  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: sbHeaders(),
    body: JSON.stringify(body),
  });
  return response.ok;
}

export async function sbDelete(path: string): Promise<boolean> {
  const legacyDelete = getLegacyPortalBridge().delete;
  if (legacyDelete) return legacyDelete(path);

  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${path}`, { method: 'DELETE', headers: sbHeaders() });
  await assertOk(response, 'DELETE');
  return true;
}

export const portalApi = {
  headers: sbHeaders,
  get: sbGet,
  post: sbPost,
  patch: sbPatch,
  delete: sbDelete,
};
