import { expect, test, type Page, type Route } from '@playwright/test';

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
  if (path.startsWith('wein_campaigns')) return [];
  if (path.startsWith('wein_calendar_notes')) return [];
  if (path.startsWith('wein_comments')) return [];
  if (path.startsWith('wein_notifications')) return [];
  if (path.startsWith('provider_profiles')) return [];
  if (path.startsWith('wein_accepted_offers')) return [];
  return [];
}

async function installPortalMocks(page: Page, seenRequests: string[]) {
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
    seenRequests.push(route.request().url());
    const rows = restRows(new URL(route.request().url()));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(rows),
    });
  });

  await page.route('**/api/chat', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Mock reply' }) });
  });
}

async function login(page: Page, seenRequests: string[]) {
  await installPortalMocks(page, seenRequests);
  await page.goto('/portal-new');
  await expect(page.locator('script[src="/portal-dist/assets/portal.js"]')).toHaveCount(1);
  await expect(page.locator('script[src^="/src/"]')).toHaveCount(0);
  await expect(page.locator('#loginScreen')).toBeVisible();
  await page.fill('#loginEmail', mockUser.email);
  await page.fill('#loginPassword', 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#appShell')).toBeVisible();
  await expect(page.locator('#page-title')).toHaveText('Pipeline');
}

async function goToView(page: Page, view: string, title: string) {
  await page.locator(`.nav-item[data-view="${view}"]`).evaluate((el) => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await expect(page.locator('#page-title')).toHaveText(title);
  await expect(page.locator('#mainArea')).toContainText(title);
}

test('login loads the Vite production bundle through Flask', async ({ page }) => {
  const seenRequests: string[] = [];
  await login(page, seenRequests);

  expect(seenRequests.some((url) => url.includes('/rest/v1/wein_providers'))).toBeTruthy();
  const scriptResponse = await page.request.get('/portal-dist/assets/portal.js');
  expect(scriptResponse.ok()).toBeTruthy();
  expect(await scriptResponse.text()).toContain('PRESERVED LOGIC');
});

test('navigation covers Today, Leads, Tasks, and Providers', async ({ page }) => {
  await login(page, []);

  await goToView(page, 'today', 'Today');
  await expect(page.locator('#mainArea')).toContainText('Call Smoke Lead');

  await goToView(page, 'leads', 'Leads');
  await expect(page.locator('#mainArea')).toContainText('Smoke Lead');

  await goToView(page, 'tasks', 'Tasks');
  await expect(page.locator('#mainArea')).toContainText('Call Smoke Lead');

  await goToView(page, 'providers', 'Providers');
  await expect(page.locator('#mainArea')).toContainText('Smoke Provider');
});

test('Today view opens and closes the task modal', async ({ page }) => {
  await login(page, []);
  await goToView(page, 'today', 'Today');

  await page.locator('.file-card').filter({ hasText: 'Call Smoke Lead' }).evaluate((el) => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await expect(page.locator('#task-modal-backdrop')).toBeVisible();
  await page.locator('#task-modal-backdrop').getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('#task-modal-backdrop')).toBeHidden();
});

test('Leads view opens and closes the lead drawer', async ({ page }) => {
  await login(page, []);
  await goToView(page, 'leads', 'Leads');

  await page.locator('[data-lead-id="lead-1"]').evaluate((el) => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await expect(page.locator('#lead-drawer-backdrop')).toBeVisible();
  await page.locator('#lead-drawer button').first().click();
  await expect(page.locator('#lead-drawer-backdrop')).toBeHidden();
});

test('Tasks view opens and closes the task modal', async ({ page }) => {
  await login(page, []);
  await goToView(page, 'tasks', 'Tasks');

  await page.locator('[data-task-id="task-1"]').click();
  await expect(page.locator('#task-modal-backdrop')).toBeVisible();
  await page.locator('#task-modal-backdrop').getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('#task-modal-backdrop')).toBeHidden();
});

test('Providers view opens and closes the provider modal', async ({ page }) => {
  await login(page, []);
  await goToView(page, 'providers', 'Providers');

  await page.locator('[data-provider-id="provider-1"]').first().click();
  await expect(page.locator('#provider-modal-backdrop')).toBeVisible();
  await page.locator('#provider-modal button').filter({ hasText: 'x' }).click();
  await expect(page.locator('#provider-modal-backdrop')).toBeHidden();
});
