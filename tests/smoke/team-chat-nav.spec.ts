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

type PortalMockOptions = {
  initialConversations?: boolean;
  notifications?: unknown[];
};

function restRows(url: URL, options: PortalMockOptions = {}): unknown[] {
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
  if (path.startsWith('wein_notifications')) return options.notifications ?? [];
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

async function installPortalMocks(page: Page, options: PortalMockOptions = {}) {
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.supabase = {
          createClient() {
            const session = { access_token: 'mock-token', user: ${JSON.stringify(mockUser)} };
            const dmConversation = {
              id: 'dm-1',
              kind: 'dm',
              title: null,
              created_by: ${JSON.stringify(mockUser.id)},
              created_at: '2026-07-20T10:00:00.000Z',
              archived_at: null,
              members: [
                { conversation_id: 'dm-1', user_id: ${JSON.stringify(mockUser.id)}, membership_role: 'member', joined_at: '2026-07-20T10:00:00.000Z', left_at: null, last_read_seq: 0, notification_level: 'all', profile: ${JSON.stringify(profile)} },
                { conversation_id: 'dm-1', user_id: ${JSON.stringify(otherProfile.id)}, membership_role: 'member', joined_at: '2026-07-20T10:00:00.000Z', left_at: null, last_read_seq: 0, notification_level: 'all', profile: ${JSON.stringify(otherProfile)} }
              ],
              last_message: []
            };
            const initialConversations = ${JSON.stringify(Boolean(options.initialConversations))};
            let dmCreated = false;
            let nextMessageSeq = 1;
            const sentMessages = [];
            window.__WEIN_CHAT_NOTIFICATION_CALLS__ = [];
            function query(table) {
              const builder = {
                table,
                _insertPayload: null,
                _updatePayload: null,
                _filters: [],
                select() { return this; },
                eq(column, value) { this._filters.push(['eq', column, value]); return this; },
                is() { return this; },
                order() { return this; },
                limit() { return this; },
                insert(payload) { this._insertPayload = payload; return this; },
                update(payload) { this._updatePayload = payload; return this; },
                async single() {
                  if (table === 'profiles') return { data: ${JSON.stringify(profile)}, error: null };
                  if (table === 'wein_chat_messages' && this._insertPayload) {
                    const row = {
                      id: 'msg-' + nextMessageSeq,
                      conversation_id: this._insertPayload.conversation_id,
                      message_seq: nextMessageSeq++,
                      sender_id: this._insertPayload.sender_id,
                      body: this._insertPayload.body,
                      reply_to_id: this._insertPayload.reply_to_id || null,
                      client_nonce: this._insertPayload.client_nonce,
                      created_at: new Date().toISOString(),
                      edited_at: null,
                      deleted_at: null,
                      sender: ${JSON.stringify(profile)}
                    };
                    sentMessages.push(row);
                    return { data: row, error: null };
                  }
                  if (table === 'wein_chat_messages' && this._updatePayload) {
                    const idFilter = this._filters.find((filter) => filter[1] === 'id');
                    const row = sentMessages.find((message) => message.id === idFilter?.[2]);
                    if (!row) return { data: null, error: { message: 'message not found' } };
                    Object.assign(row, this._updatePayload);
                    return { data: row, error: null };
                  }
                  return { data: null, error: null };
                },
                then(resolve) {
                  let rows = [];
                  if (table === 'profiles') rows = ${JSON.stringify([profile, otherProfile])};
                  else if (table === 'wein_chat_conversations' && (dmCreated || initialConversations)) rows = [dmConversation];
                  else if (table === 'wein_chat_messages') rows = sentMessages.filter((message) => !message.deleted_at);
                  else if (table === 'wein_chat_members' && this._updatePayload) {
                    const conversationId = this._filters.find((filter) => filter[1] === 'conversation_id')?.[2] || 'dm-1';
                    const userId = this._filters.find((filter) => filter[1] === 'user_id')?.[2] || ${JSON.stringify(mockUser.id)};
                    const self = dmConversation.members.find((member) => member.user_id === ${JSON.stringify(mockUser.id)});
                    if (self && this._updatePayload.notification_level) {
                      self.notification_level = this._updatePayload.notification_level;
                      window.__WEIN_CHAT_NOTIFICATION_CALLS__.push({
                        conversationId,
                        userId,
                        level: this._updatePayload.notification_level
                      });
                    }
                    rows = [{ conversation_id: conversationId, user_id: userId, last_read_seq: this._updatePayload.last_read_seq || 0, notification_level: this._updatePayload.notification_level || self?.notification_level || 'all' }];
                  }
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
              rpc(fnName) {
                if (fnName === 'wein_chat_get_or_create_dm') {
                  dmCreated = true;
                  return Promise.resolve({ data: 'dm-1', error: null });
                }
                return Promise.resolve({ data: 'mock-id', error: null });
              },
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
      body: JSON.stringify(restRows(new URL(route.request().url()), options)),
    });
  });

  await page.route('**/api/chat', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Mock reply' }) });
  });
}

async function login(page: Page, options: PortalMockOptions = {}) {
  await installIntervalProbe(page);
  await installPortalMocks(page, options);
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

test('opening a DM shows a composer that actually fits on screen and can send a message', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await login(page);
  await page.locator('.nav-parent[data-group-toggle="system"]').click();
  await page.locator('.nav-item[data-view="team-chat"]').click();

  await page.locator('select[data-chat-dm]').selectOption({ label: otherProfile.full_name });
  await expect(page.locator('.chat-thread-head')).toContainText(otherProfile.full_name);

  // The regression this guards: chat-styles.css previously sized .chat-thread to
  // 100vh, which is taller than the space actually available under the portal's
  // 52px top bar once mounted in #mainArea -- pushing the composer below the
  // visible area even though it was present in the DOM. toBeVisible() alone can
  // pass on an element with zero effective viewport overlap in some layouts, so
  // this also asserts the composer's bounding box sits within the viewport.
  const composer = page.locator('[data-chat-composer]');
  await expect(composer).toBeVisible();
  const box = await composer.boundingBox();
  const viewport = page.viewportSize();
  expect(box, 'composer should have a real bounding box').not.toBeNull();
  expect(viewport, 'viewport size should be available').not.toBeNull();
  if (box && viewport) {
    expect(box.y, 'composer top should be within the viewport').toBeLessThan(viewport.height);
    expect(box.y + box.height, 'composer bottom should be within the viewport').toBeLessThanOrEqual(viewport.height);
  }

  await composer.fill('Hello from the smoke test');
  await page.locator('[data-chat-send-form] button[type="submit"]').click();
  await expect(page.locator('.chat-message-body').last()).toHaveText('Hello from the smoke test');

  expect(pageErrors).toEqual([]);
});

test('team chat supports edit, delete, quoted reply, and mute actions', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await login(page);
  await page.locator('.nav-parent[data-group-toggle="system"]').click();
  await page.locator('.nav-item[data-view="team-chat"]').click();

  await page.locator('select[data-chat-dm]').selectOption({ label: otherProfile.full_name });

  const composer = page.locator('[data-chat-composer]');
  await composer.fill('Original message');
  await page.locator('[data-chat-send-form] button[type="submit"]').click();
  await expect(page.locator('.chat-message-body')).toHaveText('Original message');

  await page.getByLabel('Edit message').click();
  await page.locator('[data-chat-edit-input]').fill('Edited message');
  await page.getByLabel('Save edit').click();
  await expect(page.locator('.chat-message-body')).toHaveText('Edited message');
  await expect(page.locator('.chat-message-meta')).toContainText('(edited)');

  await page.getByLabel('Reply').click();
  await expect(page.locator('.chat-reply-strip')).toContainText('Edited message');
  await composer.fill('Reply body');
  await page.locator('[data-chat-send-form] button[type="submit"]').click();
  await expect(page.locator('.chat-message').last().locator('.chat-quote')).toContainText('Edited message');
  await expect(page.locator('.chat-message-body').last()).toHaveText('Reply body');

  await page.getByLabel('Mute conversation').click();
  await expect.poll(() => page.evaluate(() => window.__WEIN_CHAT_NOTIFICATION_CALLS__?.at(-1))).toEqual({
    conversationId: 'dm-1',
    userId: mockUser.id,
    level: 'muted',
  });

  await page.locator('.chat-message').first().getByLabel('Delete message').click();
  await expect(page.locator('.chat-message-body')).not.toContainText('Edited message');

  expect(pageErrors).toEqual([]);
});

test('clicking a chat notification opens team chat on the notified conversation', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await login(page, {
    initialConversations: true,
    notifications: [
      {
        id: 'notif-chat-1',
        type: 'chat_message',
        title: otherProfile.full_name,
        body: 'Smoke notification preview',
        actor_name: otherProfile.full_name,
        entity_type: 'chat_conversation',
        entity_id: 'dm-1',
        recipient_user_id: mockUser.id,
        is_read: false,
        created_at: '2026-07-26T10:00:00.000Z',
      },
    ],
  });

  await page.locator('#notif-btn').click();
  await expect(page.locator('#notif-list')).toContainText('Smoke notification preview');
  await page.locator('#notif-list .notif-item.clickable').click();

  await expect(page.locator('#page-title')).toHaveText('team-chat');
  await expect(page.locator('#mainArea .chat-thread-head')).toContainText(otherProfile.full_name);
  await expect(page.locator('#mainArea .chat-conversation.selected')).toContainText(otherProfile.full_name);

  expect(pageErrors).toEqual([]);
});

declare global {
  interface Window {
    __WEIN_ACTIVE_INTERVAL_COUNT__?: () => number;
    __WEIN_REMOVED_CHAT_CHANNELS__?: number;
    __WEIN_CHAT_NOTIFICATION_CALLS__?: Array<{ conversationId: string; userId: string; level: string }>;
  }
}
