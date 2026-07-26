type SupabaseAuthSession = {
  access_token?: string;
  user?: unknown;
};

export type SupabaseClientLike = {
  auth: {
    getSession?: () => Promise<{ data: { session: SupabaseAuthSession | null } }>;
    onAuthStateChange?: (...args: unknown[]) => unknown;
    signInWithPassword?: (...args: unknown[]) => unknown;
    signOut?: (...args: unknown[]) => unknown;
    resetPasswordForEmail?: (...args: unknown[]) => unknown;
    updateUser?: (...args: unknown[]) => unknown;
  };
  from?: (...args: unknown[]) => unknown;
};

export type LegacyPortalBridge = {
  supabaseClient?: SupabaseClientLike;
  getSupabaseUrl?: () => string;
  getSupabaseAnonKey?: () => string;
  getAccessToken?: () => string | null;
  headers?: () => Record<string, string>;
  get?: <T = unknown>(path: string) => Promise<T>;
  post?: <T = unknown>(table: string, body: unknown) => Promise<T>;
  patch?: (path: string, body: unknown) => Promise<boolean>;
  delete?: (path: string) => Promise<boolean>;
  getCaches?: () => unknown;
  setCache?: (name: string, rows: unknown[]) => void;
};

declare global {
  interface Window {
    WEIN_PORTAL_LEGACY?: LegacyPortalBridge;
  }
}

export function getLegacyPortalBridge(): LegacyPortalBridge {
  return window.WEIN_PORTAL_LEGACY ?? {};
}

export function getSupabaseClient(): SupabaseClientLike {
  const client = getLegacyPortalBridge().supabaseClient;
  if (!client) throw new Error('Portal Supabase client is not available yet.');
  return client;
}

export function getSupabaseUrl(): string {
  const url = getLegacyPortalBridge().getSupabaseUrl?.();
  if (!url) throw new Error('Portal Supabase URL is not available yet.');
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = getLegacyPortalBridge().getSupabaseAnonKey?.();
  if (!key) throw new Error('Portal Supabase anon key is not available yet.');
  return key;
}

export function getAccessToken(): string | null {
  return getLegacyPortalBridge().getAccessToken?.() ?? null;
}

export function getSessionContext() {
  return {
    client: getSupabaseClient(),
    accessToken: getAccessToken(),
  };
}
