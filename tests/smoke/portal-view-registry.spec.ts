import { expect, test, type Page, type Route } from '@playwright/test';
import { LEGACY_VIEW_IDS } from '../../src/legacy/register-legacy-views';

const SB_URL = 'https://iwyufqeqtjbbojunomgq.supabase.co';

const mockUser = {
  id: 'user-1',
  email: 'admin@example.com',
};

const provider = {
  id: 'provider-1',
  provider_name: 'Smoke Provider',
  vertical: 'Dining',
  location: 'Naama Bay',
  latitude: 27.91,
  longitude: 34.32,
  contact_name: 'Rana',
  contact_phone: '+201000000000',
  contact_whatsapp: '+201000000000',
  created_at: '2026-07-20T10:00:00.000Z',
  updated_at: '2026-07-24T10:00:00.000Z',
  contract_status: 'draft',
  commission_pct: 10,
  featured: true,
};

const lead = {
  id: 'lead-1',
  business_name: 'Smoke Lead',
  contact_name: 'Mina',
  contact_phone: '+201011111111',
  category: 'Dining',
  area: 'Naama Bay',
  status: 'new',
  priority: 'high',
  next_action_date: '2026-07-26',
  created_at: '2026-07-20T10:00:00.000Z',
  updated_at: '2026-07-25T10:00:00.000Z',
};

const task = {
  id: 'task-1',
  title: 'Call Smoke Lead',
  status: 'pending',
  priority: 'high',
  due_date: '2026-07-26',
  assigned_to_user_id: 'user-1',
  lead_id: 'lead-1',
  created_by: 'Smoke Admin',
  created_at: '2026-07-20T10:00:00.000Z',
  updated_at: '2026-07-25T10:00:00.000Z',
};

const negotiation = {
  id: 'neg-1',
  provider_id: provider.id,
  stage: 'negotiating',
  deal_breaker: 'Smoke Admin',
  next_action_date: '2026-07-26',
  updated_at: '2026-07-25T10:00:00.000Z',
};

const offer = {
  id: 'offer-1',
  provider_id: provider.id,
  title: 'Smoke Offer',
  status: 'pending',
  regular_egp: 1000,
  promo_egp: 750,
  created_at: '2026-07-20T10:00:00.000Z',
};

const campaign = {
  id: 'campaign-1',
  name: 'Smoke Campaign',
  channel: 'whatsapp',
  status: 'draft',
  scheduled_date: '2026-07-27',
  created_at: '2026-07-20T10:00:00.000Z',
};

const profile = {
  id: mockUser.id,
  role: 'admin',
  full_name: 'Smoke Admin',
  email: mockUser.email,
};

function restRows(url: URL): unknown[] {
  const path = url.pathname.split('/rest/v1/')[1] || '';
  if (path.startsWith('wein_providers')) return [provider];
  if (path.startsWith('wein_offers')) return [offer];
  if (path.startsWith('wein_negotiations')) return [negotiation];
  if (path.startsWith('wein_files')) return [];
  if (path.startsWith('wein_leads')) return [lead];
  if (path.startsWith('offer_outcomes')) return [];
  if (path.startsWith('wein_tasks')) return [task];
  if (path.startsWith('profiles')) return [profile];
  if (path.startsWith('wein_redemptions')) return [];
  if (path.startsWith('wein_campaigns')) return [campaign];
  if (path.startsWith('wein_calendar_notes')) return [];
  if (path.startsWith('wein_comments')) return [];
  if (path.startsWith('wein_notifications')) return [];
  if (path.startsWith('provider_profiles')) return [];
  if (path.startsWith('wein_accepted_offers')) return [];
  return [];
}

async function installPortalMocks(page: Page) {
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.supabase = {
          createClient() {
            const session = { access_token: 'mock-token', user: ${JSON.stringify(mockUser)} };
            return {
              auth: {
                async signInWithPassword() { return { data: { session }, error: null }; },
                async getSession() { return { data: { session: null } }; },
                onAuthStateChange() {},
                async signOut() { return { error: null }; },
                async resetPasswordForEmail() { return { error: null }; },
                async updateUser() { return { error: null }; }
              },
              from() {
                return {
                  select() { return this; },
                  eq() { return this; },
                  async single() { return { data: ${JSON.stringify(profile)}, error: null }; }
                };
              }
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
  await installPortalMocks(page);
  await page.goto('/portal-new');
  await page.fill('#loginEmail', mockUser.email);
  await page.fill('#loginPassword', 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#appShell')).toBeVisible();
  await expect(page.locator('#page-title')).toHaveText('Pipeline');
}

test('legacy registry registers every current dispatcher view and each renders non-empty content', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await login(page);

  const registeredIds = await page.evaluate(() => window.WEIN_PORTAL_MODULES?.core.registeredViewIds() ?? []);
  for (const viewId of LEGACY_VIEW_IDS) {
    expect(registeredIds).toContain(viewId);
  }

  for (const viewId of LEGACY_VIEW_IDS) {
    await page.evaluate((view) => window.showView?.(view), viewId);
    await expect(page.locator('#page-title')).toHaveText(viewId === 'pipeline' ? 'Pipeline' : new RegExp('.+'));
    await page.waitForFunction(() => (document.getElementById('mainArea')?.textContent ?? '').trim().length > 0);
    const textLength = await page.locator('#mainArea').evaluate((el) => (el.textContent ?? '').trim().length);
    expect(textLength, `${viewId} should render non-empty #mainArea content`).toBeGreaterThan(0);
  }

  expect(pageErrors).toEqual([]);
});

test('dummy registry view mounts and runs cleanup when navigating away', async ({ page }) => {
  await login(page);

  await page.evaluate(() => window.showView?.('__dummy_cleanup_probe'));
  await expect(page.locator('#mainArea')).toContainText('Dummy Cleanup Probe');
  await expect.poll(() => page.evaluate(() => window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT ?? 0)).toBe(0);

  await page.evaluate(() => window.showView?.('today'));
  await expect(page.locator('#mainArea')).toContainText('Today');
  await expect.poll(() => page.evaluate(() => window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT ?? 0)).toBe(1);
});
