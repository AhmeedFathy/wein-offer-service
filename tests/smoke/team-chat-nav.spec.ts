import { expect, test, type Page, type Route } from '@playwright/test';

const SB_URL = 'https://iwyufqeqtjbbojunomgq.supabase.co';

const mockUser = {
  id: 'user-1',
  email: 'admin@example.com',
};

const profile = {
  id: mockUser.id,
  role: 'admin',
  full_name: 'Smoke Admin',
  email: mockUser.email,
};

const otherProfile = {
  id: 'user-2',
  role: 'team',
  full_name: 'Smoke Teammate',
  email: 'teammate@example.com',
};

function restRows(url: URL): unknown[] {
  const path = url.pathname.split('/rest/v1/')[1] || '';
  if (path.startsWith('profiles')) return [profile, otherProfile];
  if (path.startsWith('wein_providers')) return [];
  if (path.startsWith('wein_offers')) return [];
  if (path.startsWith('wein_negotiations')) return [];
  if (path.startsWith('wein_files')) return [];
  if (path.startsWith('wein_leads')) return [];
  if (path.startsWith('offer_outcomes')) return [];
  if (path.startsWith('wein_tasks')) return [];
  if (path.startsWith('wein_redemptions')) return [];
  if (path.startsWith('wein_campaigns')) return [];
  if (path.startsWith('wein_calendar_notes')) return [];
  if (path.startsWith('wein_comments')) return [];
  if (path.startsWith('wein_notifications')) return [];
  if (path.startsWith('provider_profiles')) return [];
  if (path.startsWith('wein_accepted_offers')) return [];
  return [];
}

async function installIntervalProbe(page: Page) {
  await page.addInitScript(() => {
    const nativeSetInterval = window.setInterval.bind(window);
    const nativeClearInterval = window.clearInterval.bind(window);
    const activeIntervals = new Set<number>();
    window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
      const id = nativeSetInterval(handler, timeout, ...args);
      activeIntervals.add(id);
      return id;
    }) as typeof window.setInterval;
    window.clearInterval = ((id?: number) => {
      if (typeof id === 'number') activeIntervals.delete(id);
      nativeClearInterval(id);
    }) as typeof window.clearInterval;
    window.__WEIN_ACTIVE_INTERVAL_COUNT__ = () => activeIntervals.size;
    window.__WEIN_REMOVED_CHAT_CHANNELS__ = 0;
  });
}

async function installPortalMocks(page: Page) {
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.supabase = {
          createClient() {
            const session = { access_token: 'mock-token', user: ${JSON.stringify(mockUser)} };
            function query(table) {
              const builder = {
                table,
                select() { return this; },
                eq() { return this; },
                is() { return this; },
                order() { return this; },
                limit() { return this; },
                insert() { return this; },
                update() { return this; },
                async single() {
                  if (table === 'profiles') return { data: ${JSON.stringify(profile)}, error: null };
                  return { data: null, error: null };
                },
                then(resolve) {
                  const rows = table === 'profiles'
                    ? ${JSON.stringify([profile, otherProfile])}
                    : [];
                  return Promise.resolve({ data: rows, error: null }).then(resolve);
                }
              };
              return builder;
            }
            return {
              auth: {
                async signInWithPassword() { return { data: { session }, error: null }; },
                async getSession() { return { data: { session: null } }; },
                onAuthStateChange() {},
                async signOut() { return { error: null }; },
                async resetPasswordForEmail() { return { error: null }; },
                async updateUser() { return { error: null }; }
              },
              from: query,
              rpc() { return Promise.resolve({ data: 'mock-id', error: null }); },
              channel() {
                return {
                  on() { return this; },
                  subscribe() { return this; },
                  unsubscribe() { window.__WEIN_REMOVED_CHAT_CHANNELS__ += 1; }
                };
              },
              removeChannel() { window.__WEIN_REMOVED_CHAT_CHANNELS__ += 1; }
            };
          }
        };
      `,
    });
  });

  await page.route(`${SB_URL}/rest/v1/**`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(restRows(new URL(route.request().url()))),
    });
  });

  await page.route('**/api/chat', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Mock reply' }) });
  });
}

async function login(page: Page) {
  await installIntervalProbe(page);
  await installPortalMocks(page);
  await page.goto('/portal-new');
  await page.fill('#loginEmail', mockUser.email);
  await page.fill('#loginPassword', 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#appShell')).toBeVisible();
  await expect(page.locator('#page-title')).toHaveText('Pipeline');
}

test('team chat mounts through a real nav click and cleans up on navigation away', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await login(page);

  const baselineIntervals = await page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0);
  await page.locator('.nav-parent[data-group-toggle="system"]').click();
  await page.locator('.nav-item[data-view="team-chat"]').click();
  await expect(page.locator('#mainArea .chat-shell')).toBeVisible();
  await expect(page.locator('#mainArea')).toContainText('Portal chat');
  await expect(page.locator('#mainArea')).toContainText('No conversations yet.');
  await expect.poll(() => page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0)).toBe(baselineIntervals + 1);

  await page.locator('.nav-item[data-view="today"]').click();
  await expect(page.locator('#mainArea')).toContainText('Today');
  await expect.poll(() => page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0)).toBe(baselineIntervals);
  await expect.poll(() => page.evaluate(() => window.__WEIN_REMOVED_CHAT_CHANNELS__ ?? 0)).toBe(1);
  expect(pageErrors).toEqual([]);
});

declare global {
  interface Window {
    __WEIN_ACTIVE_INTERVAL_COUNT__?: () => number;
    __WEIN_REMOVED_CHAT_CHANNELS__?: number;
  }
}
