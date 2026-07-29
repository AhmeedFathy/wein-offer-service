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

const extraProfile = {
  id: 'user-3',
  role: 'team',
  full_name: 'Smoke Candidate',
  email: 'candidate@example.com',
};

const taskFixture = {
  id: 'task-1',
  title: 'Call Smoke Lead',
  status: 'pending',
  due_date: '2020-01-01',
  assigned_to_user_id: mockUser.id,
};

const taskCommentFixture = {
  task_id: taskFixture.id,
  author_name: profile.full_name,
  created_at: '2026-07-20T11:00:00.000Z',
};

const otherUserTaskFixture = {
  id: 'task-2',
  title: 'Someone elses overdue task',
  status: 'pending',
  due_date: '2020-01-01',
  assigned_to_user_id: otherProfile.id,
};

const providerFixture = {
  id: 'provider-1',
  provider_name: 'Smoke Provider',
  vertical: 'Dining',
  category: 'Dining',
  location: 'Naama Bay',
  contact_name: 'Rana',
  contact_phone: '+201000000000',
  created_at: '2026-07-20T10:00:00.000Z',
  updated_at: '2026-07-24T10:00:00.000Z',
  contract_status: 'draft',
  commission_pct: 10,
  featured: false,
};

const offerFixture = {
  id: 'offer-1',
  provider_id: providerFixture.id,
  title: 'Smoke Offer',
  status: 'pending',
  regular_egp: 1000,
  promo_egp: 750,
  created_at: '2026-07-20T10:00:00.000Z',
};

type PortalMockOptions = {
  initialConversations?: boolean;
  chatKind?: 'dm' | 'group';
  currentRole?: 'admin' | 'manager' | 'deal_breaker' | 'team';
  currentMembershipRole?: 'owner' | 'member';
  notifications?: unknown[];
  unreadMessageSeq?: number;
};

function restRows(url: URL, options: PortalMockOptions = {}): unknown[] {
  const path = url.pathname.split('/rest/v1/')[1] || '';
  const currentProfile = { ...profile, role: options.currentRole ?? profile.role };
  if (path.startsWith('profiles')) return [currentProfile, otherProfile, extraProfile];
  if (path.startsWith('wein_providers')) return [providerFixture];
  if (path.startsWith('wein_offers')) return [offerFixture];
  if (path.startsWith('wein_negotiations')) return [];
  if (path.startsWith('wein_files')) return [];
  if (path.startsWith('wein_leads')) return [];
  if (path.startsWith('offer_outcomes')) return [];
  if (path.startsWith('wein_tasks')) return [taskFixture, otherUserTaskFixture];
  if (path.startsWith('wein_redemptions')) return [];
  if (path.startsWith('wein_campaigns')) return [];
  if (path.startsWith('wein_calendar_notes')) return [];
  if (path.startsWith('wein_comments')) return [taskCommentFixture];
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
  const currentProfile = { ...profile, role: options.currentRole ?? profile.role };
  const currentMembershipRole = options.currentMembershipRole ?? 'owner';
  const chatKind = options.chatKind ?? 'dm';
  // Baked into the fixture at construction time (not mutated after login)
  // so it survives being read by main.ts's global unread-badge poller,
  // which shares this same mocked client instance with the chat view.
  const unreadLastMessage = options.unreadMessageSeq
    ? JSON.stringify([{ id: 'seed-msg', message_seq: options.unreadMessageSeq, created_at: '2026-07-27T10:00:00.000Z' }])
    : '[]';
  // listMessages() must return a real row at the same seq, or markRead()
  // (which reads state.messages.at(-1).message_seq, not last_message
  // directly) would advance last_read_seq to the wrong number and the
  // "read it, badge clears" test would never actually clear.
  const seededSentMessages = options.unreadMessageSeq
    ? JSON.stringify([{
        id: 'seed-msg',
        conversation_id: chatKind === 'group' ? 'group-1' : 'dm-1',
        message_seq: options.unreadMessageSeq,
        sender_id: otherProfile.id,
        body: 'Seeded unread message',
        reply_to_id: null,
        client_nonce: 'seed-nonce',
        created_at: '2026-07-27T10:00:00.000Z',
        edited_at: null,
        deleted_at: null,
        mentioned_user_ids: null,
        attachments: [],
      }])
    : '[]';
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.supabase = {
          createClient() {
            const session = { access_token: 'mock-token', user: ${JSON.stringify(mockUser)} };
            const currentProfile = ${JSON.stringify(currentProfile)};
            const dmConversation = {
              id: 'dm-1',
              kind: 'dm',
              title: null,
              created_by: ${JSON.stringify(mockUser.id)},
              created_at: '2026-07-20T10:00:00.000Z',
              archived_at: null,
              members: [
                { conversation_id: 'dm-1', user_id: ${JSON.stringify(mockUser.id)}, membership_role: 'member', joined_at: '2026-07-20T10:00:00.000Z', left_at: null, last_read_seq: 0, notification_level: 'all', profile: currentProfile },
                { conversation_id: 'dm-1', user_id: ${JSON.stringify(otherProfile.id)}, membership_role: 'member', joined_at: '2026-07-20T10:00:00.000Z', left_at: null, last_read_seq: 0, notification_level: 'all', profile: ${JSON.stringify(otherProfile)} }
              ],
              last_message: ${unreadLastMessage}
            };
            const groupConversation = {
              id: 'group-1',
              kind: 'group',
              title: 'Smoke Group',
              created_by: ${JSON.stringify(otherProfile.id)},
              created_at: '2026-07-20T10:00:00.000Z',
              archived_at: null,
              members: [
                { conversation_id: 'group-1', user_id: ${JSON.stringify(mockUser.id)}, membership_role: ${JSON.stringify(currentMembershipRole)}, joined_at: '2026-07-20T10:00:00.000Z', left_at: null, last_read_seq: 0, notification_level: 'all', profile: currentProfile },
                { conversation_id: 'group-1', user_id: ${JSON.stringify(otherProfile.id)}, membership_role: ${JSON.stringify(currentMembershipRole === 'owner' ? 'member' : 'owner')}, joined_at: '2026-07-20T10:00:00.000Z', left_at: null, last_read_seq: 0, notification_level: 'all', profile: ${JSON.stringify(otherProfile)} }
              ],
              last_message: ${unreadLastMessage}
            };
            const initialConversations = ${JSON.stringify(Boolean(options.initialConversations))};
            let conversations = initialConversations ? [${JSON.stringify(chatKind)} === 'group' ? groupConversation : dmConversation] : [];
            let dmCreated = false;
            let nextMessageSeq = ${options.unreadMessageSeq ? options.unreadMessageSeq + 1 : 1};
            const sentMessages = ${seededSentMessages};
            const taskFixture = {
              id: 'task-1',
              title: 'Call Smoke Lead',
              status: 'pending',
              due_date: '2020-01-01',
              assigned_to_user_id: ${JSON.stringify(mockUser.id)}
            };
            const mentionCommentFixture = {
              id: 'comment-mention-1',
              body: 'Please take a look at this',
              resolved_at: null,
              created_at: '2026-07-20T10:00:00.000Z'
            };
            const mentionFixture = {
              comment_id: mentionCommentFixture.id,
              mentioned_user_id: ${JSON.stringify(mockUser.id)},
              created_at: '2026-07-20T10:00:00.000Z',
              wein_comments: mentionCommentFixture
            };
            let nextCommentSeq = 1;
            const taskComments = [];
            window.__WEIN_CHAT_NOTIFICATION_CALLS__ = [];
            window.__WEIN_CHAT_DELETE_CALLS__ = [];
            window.__WEIN_CHAT_ADD_MEMBER_CALLS__ = [];
            window.__WEIN_CHAT_REMOVE_MEMBER_CALLS__ = [];
            window.__WEIN_CHAT_MENTION_SENDS__ = [];
            window.__WEIN_CHAT_UPLOADS__ = [];
            window.__WEIN_CHAT_SIGN_CALLS__ = [];
            window.__WEIN_CHAT_RENAME_CALLS__ = [];
            window.__WEIN_CHAT_ARCHIVE_CALLS__ = [];
            window.__WEIN_CHAT_ROLE_CALLS__ = [];
            function query(table) {
              const builder = {
                table,
                _insertPayload: null,
                _updatePayload: null,
                _filters: [],
                select() { return this; },
                eq(column, value) { this._filters.push(['eq', column, value]); return this; },
                neq() { return this; },
                is() { return this; },
                order() { return this; },
                limit() { return this; },
                insert(payload) {
                  // Mimic PostgREST's real schema-cache rejection: an insert
                  // naming a column the table does not have fails outright,
                  // even when that column's value is null. wein_comments has
                  // no provider_id/offer_id column -- catching this here is
                  // what a live check against the real DB caught and a
                  // schema-blind mock previously missed.
                  if (table === 'wein_comments') {
                    const allowedColumns = ['negotiation_id', 'lead_id', 'task_id', 'campaign_id', 'provider_id', 'offer_id', 'body', 'author_role', 'author_name', 'author_id', 'reply_to_id', 'resolved_at', 'resolved_by', 'resolved_note'];
                    const unknownColumn = Object.keys(payload).find((key) => !allowedColumns.includes(key));
                    if (unknownColumn) {
                      this._insertError = { message: "Could not find the '" + unknownColumn + "' column of 'wein_comments' in the schema cache" };
                    }
                  }
                  this._insertPayload = payload;
                  return this;
                },
                update(payload) { this._updatePayload = payload; return this; },
                async single() {
                  if (this._insertError) return { data: null, error: this._insertError };
                  if (table === 'profiles') return { data: currentProfile, error: null };
                  if (table === 'wein_comments' && this._insertPayload) {
                    const row = {
                      id: 'comment-' + (nextCommentSeq++),
                      task_id: this._insertPayload.task_id || null,
                      provider_id: this._insertPayload.provider_id || null,
                      offer_id: this._insertPayload.offer_id || null,
                      reply_to_id: this._insertPayload.reply_to_id || null,
                      body: this._insertPayload.body,
                      author_role: this._insertPayload.author_role || 'team',
                      author_name: currentProfile.full_name,
                      resolved_at: null,
                      created_at: new Date().toISOString()
                    };
                    taskComments.push(row);
                    return { data: row, error: null };
                  }
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
                      mentioned_user_ids: this._insertPayload.mentioned_user_ids || null,
                      attachments: this._insertPayload.attachments || [],
                      sender: ${JSON.stringify(profile)}
                    };
                    if (row.mentioned_user_ids) window.__WEIN_CHAT_MENTION_SENDS__.push({ body: row.body, mentioned_user_ids: row.mentioned_user_ids });
                    sentMessages.push(row);
                    return { data: row, error: null };
                  }
                  if (table === 'wein_chat_messages' && this._updatePayload) {
                    const idFilter = this._filters.find((filter) => filter[1] === 'id');
                    const row = sentMessages.find((message) => message.id === idFilter?.[2]);
                    if (!row) return { data: null, error: { message: 'message not found' } };
                    Object.assign(row, this._updatePayload);
                    if (this._updatePayload.deleted_at) window.__WEIN_CHAT_DELETE_CALLS__.push(row.id);
                    return { data: row, error: null };
                  }
                  return { data: null, error: null };
                },
                then(resolve) {
                  let rows = [];
                  if (table === 'profiles') rows = [currentProfile, ${JSON.stringify(otherProfile)}, ${JSON.stringify(extraProfile)}];
                  else if (table === 'wein_chat_conversations' && this._updatePayload) {
                    const idFilter = this._filters.find((filter) => filter[1] === 'id');
                    const target = conversations.find((conversation) => conversation.id === idFilter?.[2]) || groupConversation;
                    if ('title' in this._updatePayload) {
                      target.title = this._updatePayload.title;
                      window.__WEIN_CHAT_RENAME_CALLS__.push({ conversationId: target.id, title: this._updatePayload.title });
                    }
                    if ('archived_at' in this._updatePayload) {
                      target.archived_at = this._updatePayload.archived_at;
                      window.__WEIN_CHAT_ARCHIVE_CALLS__.push({ conversationId: target.id, archived_at: this._updatePayload.archived_at });
                      if (this._updatePayload.archived_at) conversations = conversations.filter((conversation) => conversation.id !== target.id);
                    }
                    rows = [target];
                  }
                  else if (table === 'wein_chat_conversations') rows = conversations;
                  else if (table === 'wein_chat_messages') rows = sentMessages.filter((message) => !message.deleted_at);
                  else if (table === 'wein_tasks') rows = [taskFixture];
                  else if (table === 'wein_comment_mentions') rows = [mentionFixture];
                  else if (table === 'wein_comments') {
                    const scopeFilter = this._filters.find((filter) => ['task_id', 'provider_id', 'offer_id'].includes(filter[1]));
                    rows = scopeFilter ? taskComments.filter((row) => row[scopeFilter[1]] === scopeFilter[2]) : taskComments;
                  }
                  else if (table === 'wein_chat_members' && this._updatePayload) {
                    const conversationId = this._filters.find((filter) => filter[1] === 'conversation_id')?.[2] || 'dm-1';
                    const userId = this._filters.find((filter) => filter[1] === 'user_id')?.[2] || ${JSON.stringify(mockUser.id)};
                    const activeConversation = conversations[0] || dmConversation;
                    const self = activeConversation.members.find((member) => member.user_id === ${JSON.stringify(mockUser.id)});
                    if (self && this._updatePayload.notification_level) {
                      self.notification_level = this._updatePayload.notification_level;
                      window.__WEIN_CHAT_NOTIFICATION_CALLS__.push({
                        conversationId,
                        userId,
                        level: this._updatePayload.notification_level
                      });
                    }
                    if (self && typeof this._updatePayload.last_read_seq === 'number') {
                      self.last_read_seq = this._updatePayload.last_read_seq;
                    }
                    rows = [{ conversation_id: conversationId, user_id: userId, last_read_seq: self?.last_read_seq ?? (this._updatePayload.last_read_seq || 0), notification_level: this._updatePayload.notification_level || self?.notification_level || 'all' }];
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
              rpc(fnName, args) {
                if (fnName === 'wein_chat_get_or_create_dm') {
                  dmCreated = true;
                  conversations = [dmConversation];
                  return Promise.resolve({ data: 'dm-1', error: null });
                }
                if (fnName === 'wein_chat_add_member') {
                  window.__WEIN_CHAT_ADD_MEMBER_CALLS__.push(args);
                  const profile = [currentProfile, ${JSON.stringify(otherProfile)}, ${JSON.stringify(extraProfile)}].find((row) => row.id === args.p_user_id);
                  const existing = groupConversation.members.find((member) => member.user_id === args.p_user_id);
                  if (existing) existing.left_at = null;
                  else groupConversation.members.push({
                    conversation_id: args.p_conversation_id,
                    user_id: args.p_user_id,
                    membership_role: 'member',
                    joined_at: new Date().toISOString(),
                    left_at: null,
                    last_read_seq: 0,
                    notification_level: 'all',
                    profile
                  });
                  conversations = [groupConversation];
                  return Promise.resolve({ data: null, error: null });
                }
                if (fnName === 'wein_chat_remove_member') {
                  window.__WEIN_CHAT_REMOVE_MEMBER_CALLS__.push(args);
                  const member = groupConversation.members.find((row) => row.user_id === args.p_user_id);
                  if (member) member.left_at = new Date().toISOString();
                  conversations = [groupConversation];
                  return Promise.resolve({ data: null, error: null });
                }
                if (fnName === 'wein_chat_set_membership_role') {
                  window.__WEIN_CHAT_ROLE_CALLS__.push(args);
                  const member = groupConversation.members.find((row) => row.user_id === args.p_user_id);
                  if (member) member.membership_role = args.p_role;
                  conversations = [groupConversation];
                  return Promise.resolve({ data: null, error: null });
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
              removeChannel() { window.__WEIN_REMOVED_CHAT_CHANNELS__ += 1; },
              storage: {
                from(bucket) {
                  return {
                    async upload(path, file) {
                      window.__WEIN_CHAT_UPLOADS__.push({ bucket, path, name: file.name, type: file.type, size: file.size });
                      return { data: { path }, error: null };
                    },
                    async createSignedUrl(path) {
                      window.__WEIN_CHAT_SIGN_CALLS__.push({ bucket, path });
                      return { data: { signedUrl: 'https://signed.example/' + bucket + '/' + path }, error: null };
                    }
                  };
                }
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
      body: JSON.stringify(restRows(new URL(route.request().url()), options)),
    });
  });

  await page.route('**/api/chat', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Mock reply' }) });
  });
}

async function login(page: Page, options: PortalMockOptions = {}) {
  await installIntervalProbe(page);
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await installPortalMocks(page, options);
  await page.goto('/portal-new');
  await page.fill('#loginEmail', mockUser.email);
  await page.fill('#loginPassword', 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#appShell')).toBeVisible();
  await expect(page.locator('#page-title')).not.toHaveText('');
}

async function openTeamChat(page: Page) {
  await page.locator('.nav-parent[data-group-toggle="system"]').click();
  await page.locator('.nav-item[data-view="team-chat"]').click();
}

async function startDmFromCompose(page: Page, fullName: string) {
  await page.getByLabel('New conversation').click();
  await page.locator('[data-chat-compose-search]').fill(fullName);
  const personRow = page.locator('.chat-compose-person').filter({ hasText: fullName });
  await personRow.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'Start DM' }).click();
}

test('team chat mounts through a real nav click and cleans up on navigation away', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await login(page);

  const baselineIntervals = await page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0);
  await openTeamChat(page);
  await expect(page.locator('#mainArea .chat-shell')).toBeVisible();
  await expect(page.locator('#mainArea')).toContainText('Portal chat');
  await expect(page.locator('#mainArea')).toContainText('No conversations yet.');
  await expect.poll(() => page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0)).toBe(baselineIntervals + 1);

  await page.locator('.nav-item[data-view="today"]').click();
  await expect(page.locator('#mainArea')).toContainText('Today');
  // Today now mounts the work-inbox module, which holds its own 60s refresh
  // interval while active (same precedent as chat's own polling) -- so
  // landing on Today for the first time in this test legitimately adds one,
  // it does not return to the pre-chat baseline.
  await expect.poll(() => page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0)).toBe(baselineIntervals + 1);
  await expect.poll(() => page.evaluate(() => window.__WEIN_REMOVED_CHAT_CHANNELS__ ?? 0)).toBe(1);
  expect(pageErrors).toEqual([]);
});

test('opening a DM shows a composer that actually fits on screen and can send a message', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await login(page);
  await openTeamChat(page);

  await startDmFromCompose(page, otherProfile.full_name);
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

test('conversation list items show an avatar', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'dm' });
  await openTeamChat(page);
  await expect(page.locator('.chat-conversation').first().locator('.chat-conversation-avatar')).toBeVisible();
});

test('consecutive messages from the same sender group under one header', async ({ page }) => {
  await login(page);
  await openTeamChat(page);
  await startDmFromCompose(page, otherProfile.full_name);

  const composer = page.locator('[data-chat-composer]');
  await composer.fill('First message');
  await page.locator('[data-chat-send-form] button[type="submit"]').click();
  await expect(page.locator('.chat-message-body').last()).toHaveText('First message');

  await composer.fill('Second message right after');
  await page.locator('[data-chat-send-form] button[type="submit"]').click();
  await expect(page.locator('.chat-message-body').last()).toHaveText('Second message right after');

  const messages = page.locator('.chat-message');
  await expect(messages).toHaveCount(2);
  await expect(messages.nth(0)).not.toHaveClass(/chat-message-grouped/);
  await expect(messages.nth(1)).toHaveClass(/chat-message-grouped/);
});

test('sending a message scrolls the thread to the bottom', async ({ page }) => {
  await login(page);
  await openTeamChat(page);
  await startDmFromCompose(page, otherProfile.full_name);

  const composer = page.locator('[data-chat-composer]');
  for (let i = 0; i < 3; i++) {
    await composer.fill(`Message number ${i}`);
    await page.locator('[data-chat-send-form] button[type="submit"]').click();
    await expect(page.locator('.chat-message-body').last()).toHaveText(`Message number ${i}`);
  }

  const scrollState = await page.locator('.chat-message-list').evaluate((el) => ({
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
  }));
  expect(scrollState.scrollHeight - scrollState.scrollTop - scrollState.clientHeight).toBeLessThan(80);
});

test('team chat supports edit, delete, quoted reply, and mute actions', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await login(page);
  await openTeamChat(page);

  await startDmFromCompose(page, otherProfile.full_name);

  const composer = page.locator('[data-chat-composer]');
  await composer.fill('Original message');
  await page.locator('[data-chat-send-form] button[type="submit"]').click();
  await expect(page.locator('.chat-message-body')).toHaveText('Original message');

  await page.locator('.chat-message').first().hover();
  await page.locator('.chat-message').first().getByLabel('Edit message').click();
  await page.locator('[data-chat-edit-input]').fill('Edited message');
  await page.getByLabel('Save edit').click();
  await expect(page.locator('.chat-message-body')).toHaveText('Edited message');
  await expect(page.locator('.chat-message-meta')).toContainText('(edited)');

  await page.locator('.chat-message').first().hover();
  await page.locator('.chat-message').first().getByLabel('Reply').click();
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

  await page.locator('.chat-message').first().hover();
  await page.locator('.chat-message').first().getByLabel('Delete message').click();
  await page.locator('.chat-message').first().getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('.chat-message-body')).not.toContainText('Edited message');

  expect(pageErrors).toEqual([]);
});

test('message action toolbar is hidden until a message is hovered', async ({ page }) => {
  await login(page);
  await openTeamChat(page);
  await startDmFromCompose(page, otherProfile.full_name);

  const composer = page.locator('[data-chat-composer]');
  await composer.fill('Toolbar visibility check');
  await page.locator('[data-chat-send-form] button[type="submit"]').click();

  const message = page.locator('.chat-message').first();
  const toolbar = message.locator('.chat-message-actions');
  await expect(toolbar).toBeHidden();
  await message.hover();
  await expect(toolbar).toBeVisible();
  await expect(message.getByLabel('Reply')).toBeVisible();
});

test('message delete requires an inline confirmation step', async ({ page }) => {
  await login(page);
  await openTeamChat(page);
  await startDmFromCompose(page, otherProfile.full_name);

  const composer = page.locator('[data-chat-composer]');
  await composer.fill('Delete confirmation check');
  await page.locator('[data-chat-send-form] button[type="submit"]').click();
  await expect(page.locator('.chat-message-body')).toHaveText('Delete confirmation check');

  const message = page.locator('.chat-message').first();
  await message.hover();
  await message.getByLabel('Delete message').click();
  await expect(message.locator('.chat-delete-confirm')).toContainText('Delete message?');
  await expect(page.locator('.chat-message-body')).toHaveText('Delete confirmation check');
  await expect.poll(() => page.evaluate(() => window.__WEIN_CHAT_DELETE_CALLS__?.length ?? 0)).toBe(0);

  await message.getByRole('button', { name: 'Confirm' }).click();
  await expect.poll(() => page.evaluate(() => window.__WEIN_CHAT_DELETE_CALLS__?.length ?? 0)).toBe(1);
  await expect(page.locator('.chat-message-body')).toHaveCount(0);
  await expect(page.locator('.chat-message-list')).toContainText('No messages yet.');
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

test('manage members appears for groups but not DMs', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'dm' });
  await openTeamChat(page);
  await expect(page.getByLabel('Manage members')).toHaveCount(0);

  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);
  await expect(page.getByLabel('Manage members')).toBeVisible();
});

test('non-owner non-admin member only sees their own leave action', async ({ page }) => {
  await login(page, {
    initialConversations: true,
    chatKind: 'group',
    currentRole: 'team',
    currentMembershipRole: 'member',
  });
  await openTeamChat(page);
  await page.getByLabel('Manage members').click();

  await expect(page.locator('[data-chat-members-panel]')).toBeVisible();
  await expect(page.locator('[data-chat-member-add-toggle]')).toHaveCount(0);
  await expect(page.locator('[data-chat-remove-member]')).toHaveCount(1);
  await expect(page.locator('[data-chat-member-row="user-1"]')).toContainText('Leave');
  await expect(page.locator('[data-chat-member-row="user-2"]')).not.toContainText('Remove');
});

test('adding a group member calls the membership RPC with the selected user', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);
  await page.getByLabel('Manage members').click();
  await page.getByRole('button', { name: 'Add member' }).click();
  await page.locator('[data-chat-member-search]').fill(extraProfile.full_name);
  await page.locator('.chat-compose-person').filter({ hasText: extraProfile.full_name }).locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'Add selected' }).click();

  await expect.poll(() => page.evaluate(() => window.__WEIN_CHAT_ADD_MEMBER_CALLS__?.at(-1))).toEqual({
    p_conversation_id: 'group-1',
    p_user_id: extraProfile.id,
  });
});

test('group member panel renders owner badges', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);
  await page.getByLabel('Manage members').click();

  await expect(page.locator('[data-chat-member-row="user-1"] .chat-owner-badge')).toHaveText('Owner');
});

test('typing @ opens the mention picker with conversation members only', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);

  await page.locator('[data-chat-composer]').fill('hey @');
  await expect(page.locator('[data-chat-mention-picker]')).toBeVisible();
  // otherProfile is in the group; extraProfile is not, so must not be offered.
  await expect(page.locator(`[data-chat-mention-pick="${otherProfile.id}"]`)).toBeVisible();
  await expect(page.locator(`[data-chat-mention-pick="${extraProfile.id}"]`)).toHaveCount(0);
  // Never offer to mention yourself.
  await expect(page.locator(`[data-chat-mention-pick="${mockUser.id}"]`)).toHaveCount(0);
});

test('picking a mention inserts the name and sends the mentioned user id', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);

  await page.locator('[data-chat-composer]').fill('hey @Smoke Team');
  await page.locator(`[data-chat-mention-pick="${otherProfile.id}"]`).click();
  await expect(page.locator('[data-chat-composer]')).toHaveValue(`hey @${otherProfile.full_name} `);
  await expect(page.locator('[data-chat-mention-picker]')).toHaveCount(0);

  await page.locator('[data-chat-composer]').press('Enter');
  await expect.poll(() => page.evaluate(() => window.__WEIN_CHAT_MENTION_SENDS__?.at(-1))).toEqual({
    body: `hey @${otherProfile.full_name}`,
    mentioned_user_ids: [otherProfile.id],
  });
  await expect(page.locator('.chat-message-body .chat-mention')).toHaveText(`@${otherProfile.full_name}`);
});

test('Escape closes the mention picker and Enter then sends normally', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);

  await page.locator('[data-chat-composer]').fill('hey @');
  await expect(page.locator('[data-chat-mention-picker]')).toBeVisible();
  await page.locator('[data-chat-composer]').press('Escape');
  await expect(page.locator('[data-chat-mention-picker]')).toHaveCount(0);
});

test('team chat hides the global AI assistant button', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await expect(page.locator('#chatFab')).toHaveClass(/visible/);

  await openTeamChat(page);
  await expect(page.locator('#chatFab')).not.toHaveClass(/visible/);

  // ...and it comes back on any other view.
  await page.locator('.nav-item[data-view="today"]').click();
  await expect(page.locator('#chatFab')).toHaveClass(/visible/);
});

test('sidebar badge and tab title show a global unread chat count before Team Chat is ever opened', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group', unreadMessageSeq: 3 });

  // Never calls openTeamChat -- the poller in main.ts is independent of the view.
  await expect.poll(
    () => page.locator('[data-chat-unread-badge]').textContent(),
    { timeout: 10000 },
  ).toBe('3');
  await expect(page.locator('[data-chat-unread-badge]')).toBeVisible();
  await expect.poll(() => page.title(), { timeout: 10000 }).toBe('(3) WeIN OS — Pipeline');
});

test('reading the unread conversation clears the sidebar badge and tab title', async ({ page }) => {
  // Once the initial post-login catch-up poll fires, the badge settles onto
  // the same 30s steady-state cadence as every other nav refresh in this
  // app -- clearing after a read is correctly slow, not broken. This test
  // waits out that real interval rather than shortening it artificially.
  test.setTimeout(45000);
  await login(page, { initialConversations: true, chatKind: 'group', unreadMessageSeq: 2 });
  await expect.poll(() => page.locator('[data-chat-unread-badge]').textContent(), { timeout: 10000 }).toBe('2');

  await openTeamChat(page);
  await page.locator('.chat-conversation').first().click();

  await expect(page.locator('[data-chat-unread-badge]')).toBeHidden({ timeout: 35000 });
  await expect.poll(() => page.title(), { timeout: 5000 }).toBe('WeIN OS — Pipeline');
});

test('attaching an image uploads it and sends as an inline attachment', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);

  await page.locator('[data-chat-file-input]').setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fake-image-bytes'),
  });

  await expect(page.locator('[data-chat-pending-attachment]')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => window.__WEIN_CHAT_UPLOADS__?.length ?? 0)).toBe(1);
  await expect(page.locator('.chat-pending-attachment-status')).toHaveCount(0);

  await page.locator('[data-chat-send-form] button[type="submit"]').click();
  await expect(page.locator('[data-chat-pending-attachment]')).toHaveCount(0);

  const lastMessage = page.locator('.chat-message').last();
  await expect(lastMessage.locator('.chat-attachment-image')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__WEIN_CHAT_SIGN_CALLS__?.length ?? 0)).toBeGreaterThan(0);
});

test('attaching a PDF sends as a downloadable file chip, not an inline image', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);

  await page.locator('[data-chat-file-input]').setInputFiles({
    name: 'menu.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 fake'),
  });
  await expect.poll(() => page.evaluate(() => window.__WEIN_CHAT_UPLOADS__?.length ?? 0)).toBe(1);

  await page.locator('[data-chat-send-form] button[type="submit"]').click();

  const lastMessage = page.locator('.chat-message').last();
  await expect(lastMessage.locator('.chat-attachment-file')).toContainText('menu.pdf');
  await expect(lastMessage.locator('.chat-attachment-image')).toHaveCount(0);
});

test('removing a pending attachment before sending drops it', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);

  await page.locator('[data-chat-file-input]').setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fake-image-bytes'),
  });
  await expect(page.locator('[data-chat-pending-attachment]')).toHaveCount(1);

  await page.locator('[data-chat-remove-pending]').click();
  await expect(page.locator('[data-chat-pending-attachment]')).toHaveCount(0);
});

test('non-owner non-admin member sees no rename, archive, or promote controls', async ({ page }) => {
  await login(page, {
    initialConversations: true,
    chatKind: 'group',
    currentRole: 'team',
    currentMembershipRole: 'member',
  });
  await openTeamChat(page);

  await expect(page.locator('[data-chat-rename-toggle]')).toHaveCount(0);
  await expect(page.locator('[data-chat-archive-toggle]')).toHaveCount(0);

  await page.getByLabel('Manage members').click();
  await expect(page.locator('[data-chat-promote-member]')).toHaveCount(0);
});

test('group owner can rename the conversation', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);

  await page.getByLabel('Rename group').click();
  await page.locator('[data-chat-rename-input]').fill('Renamed Group');
  await page.locator('[data-chat-rename-form] button[type="submit"]').click();

  await expect(page.locator('#mainArea .chat-thread-head h2')).toHaveText('Renamed Group');
  await expect.poll(() => page.evaluate(() => window.__WEIN_CHAT_RENAME_CALLS__?.at(-1))).toEqual({
    conversationId: 'group-1',
    title: 'Renamed Group',
  });
});

test('group owner can promote a member to owner', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);
  await page.getByLabel('Manage members').click();

  await page.locator('[data-chat-member-row="user-2"] [data-chat-promote-member]').click();

  await expect(page.locator('[data-chat-member-row="user-2"] .chat-owner-badge')).toHaveText('Owner');
  await expect.poll(() => page.evaluate(() => window.__WEIN_CHAT_ROLE_CALLS__?.at(-1))).toEqual({
    p_conversation_id: 'group-1',
    p_user_id: 'user-2',
    p_role: 'owner',
  });
});

test('archiving a group removes it from the conversation list', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'group' });
  await openTeamChat(page);

  await page.getByLabel('Archive conversation').click();
  await page.locator('[data-chat-confirm-archive]').click();

  await expect.poll(() => page.evaluate(() => {
    const call = window.__WEIN_CHAT_ARCHIVE_CALLS__?.at(-1);
    return call ? { conversationId: call.conversationId, archived: typeof call.archived_at === 'string' } : null;
  })).toEqual({ conversationId: 'group-1', archived: true });
  await expect(page.locator('.chat-conversation-list .chat-conversation')).toHaveCount(0);
});

test('admin can archive a DM conversation', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'dm', currentRole: 'admin' });
  await openTeamChat(page);

  await page.getByLabel('Archive conversation').click();
  await page.locator('[data-chat-confirm-archive]').click();

  await expect.poll(() => page.evaluate(() => {
    const call = window.__WEIN_CHAT_ARCHIVE_CALLS__?.at(-1);
    return call ? { conversationId: call.conversationId, archived: typeof call.archived_at === 'string' } : null;
  })).toEqual({ conversationId: 'dm-1', archived: true });
  await expect(page.locator('.chat-conversation-list .chat-conversation')).toHaveCount(0);
});

test('non-admin DM participant sees no archive control', async ({ page }) => {
  await login(page, { initialConversations: true, chatKind: 'dm', currentRole: 'team' });
  await openTeamChat(page);

  // A DM participant is always membership_role='member' (DMs have no owner
  // concept), so archiving a DM is gated purely on the global admin/manager
  // role check -- matching the DB trigger, which relies on the same
  // wein_chat_can_manage_members() check regardless of conversation kind.
  await expect(page.locator('[data-chat-archive-toggle]')).toHaveCount(0);
});

test('opening a task renders the record-discussion UI and a posted comment appears, with no interval leak on close/reopen', async ({ page }) => {
  await login(page);

  await page.evaluate((id) => (window as unknown as { openTaskModal: (id: string) => void }).openTaskModal(id), 'task-1');
  await expect(page.locator('#task-modal-backdrop')).toBeVisible();
  await expect(page.locator('#tm-comments-section .discussion-shell')).toBeVisible();
  await expect(page.locator('#tm-comments-section')).toContainText('No comments yet.');

  await page.locator('#tm-comments-section textarea[data-discussion-body]').fill('Checked with the provider.');
  await page.locator('#tm-comments-section button[type="submit"]').click();
  await expect(page.locator('#tm-comments-section .discussion-comment-body')).toHaveText('Checked with the provider.');

  const openIntervals = await page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0);
  await page.locator('#task-modal-backdrop').getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('#task-modal-backdrop')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0)).toBe(openIntervals - 1);

  await page.evaluate((id) => (window as unknown as { openTaskModal: (id: string) => void }).openTaskModal(id), 'task-1');
  await expect(page.locator('#tm-comments-section .discussion-shell')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0)).toBe(openIntervals);
});

test('Today mounts the work inbox section with normalized task and mention signals', async ({ page }) => {
  await login(page);
  await page.locator('.nav-item[data-view="today"]').click();
  await expect(page.locator('#today-work-inbox-section')).toBeVisible();
  await expect(page.locator('#today-work-inbox-section')).toContainText('Call Smoke Lead');
  await expect(page.locator('#today-work-inbox-section')).toContainText('Mention');
});

test('clicking a task item in the work inbox opens the real task modal', async ({ page }) => {
  await login(page);
  await page.locator('.nav-item[data-view="today"]').click();
  await page.locator('#today-work-inbox-section [data-inbox-item^="task:"]').click();
  await expect(page.locator('#task-modal-backdrop')).toBeVisible();
  await expect(page.locator('#tm-title')).toHaveValue('Call Smoke Lead');
});

test('task board card shows the assignee replied once their comment is the latest activity', async ({ page }) => {
  await login(page);
  await page.locator('.nav-item[data-view="tasks"]').click();
  const card = page.locator('.provider-card[data-task-id="task-1"]');
  await expect(card).toContainText('1 replied');
});

test('Today only shows tasks assigned to the current user, not everyone else\'s', async ({ page }) => {
  await login(page);
  await page.locator('.nav-item[data-view="today"]').click();
  await expect(page.locator('#mainArea')).toContainText('Call Smoke Lead');
  await expect(page.locator('#mainArea')).not.toContainText('Someone elses overdue task');
});

test('quick Add Task requires a due date once an assignee is selected', async ({ page }) => {
  await login(page);
  await page.locator('.nav-item[data-view="tasks"]').click();
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.locator('#taskTitle').fill('Needs a deadline');
  await page.locator('#taskAssignee').selectOption({ label: profile.full_name });
  await page.locator('#taskSaveBtn').click();
  await expect(page.locator('#addTaskError')).toBeVisible();
  await expect(page.locator('#addTaskError')).toContainText('due date');
});

test('task modal requires a due date once an assignee is selected', async ({ page }) => {
  await login(page);
  await page.evaluate((id) => (window as unknown as { openTaskModal: (id: string) => void }).openTaskModal(id), taskFixture.id);
  await page.locator('#tm-due').fill('');
  await page.locator('#tm-save-btn').click();
  await expect(page.locator('#tm-error')).toBeVisible();
  await expect(page.locator('#tm-error')).toContainText('due date');
});

test('provider modal Discussion tab mounts record-discussion scoped to that provider', async ({ page }) => {
  await login(page);
  await page.evaluate((id) => (window as unknown as { openProviderModal: (id: string) => void }).openProviderModal(id), providerFixture.id);
  await page.evaluate(() => (window as unknown as { setModalTab: (tab: string) => void }).setModalTab('discussion'));
  await expect(page.locator('#modal-provider-discussion .discussion-shell')).toBeVisible();

  const openIntervals = await page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0);
  await page.evaluate(() => (window as unknown as { closeProviderModal: () => void }).closeProviderModal());
  await expect.poll(() => page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0)).toBe(openIntervals - 1);
});

test('offer-edit modal mounts record-discussion scoped to that offer', async ({ page }) => {
  await login(page);
  await page.evaluate((id) => (window as unknown as { openOfferEdit: (id: string) => void }).openOfferEdit(id), offerFixture.id);
  await expect(page.locator('#offer-edit-discussion .discussion-shell')).toBeVisible();

  const openIntervals = await page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0);
  await page.evaluate(() => (window as unknown as { closeOfferEdit: () => void }).closeOfferEdit());
  await expect.poll(() => page.evaluate(() => window.__WEIN_ACTIVE_INTERVAL_COUNT__?.() ?? 0)).toBe(openIntervals - 1);
});

declare global {
  interface Window {
    __WEIN_ACTIVE_INTERVAL_COUNT__?: () => number;
    __WEIN_REMOVED_CHAT_CHANNELS__?: number;
    __WEIN_CHAT_NOTIFICATION_CALLS__?: Array<{ conversationId: string; userId: string; level: string }>;
    __WEIN_CHAT_DELETE_CALLS__?: string[];
    __WEIN_CHAT_ADD_MEMBER_CALLS__?: Array<{ p_conversation_id: string; p_user_id: string }>;
    __WEIN_CHAT_REMOVE_MEMBER_CALLS__?: Array<{ p_conversation_id: string; p_user_id: string }>;
    __WEIN_CHAT_MENTION_SENDS__?: Array<{ body: string; mentioned_user_ids: string[] }>;
    __WEIN_CHAT_UPLOADS__?: Array<{ bucket: string; path: string; name: string; type: string; size: number }>;
    __WEIN_CHAT_SIGN_CALLS__?: Array<{ bucket: string; path: string }>;
    __WEIN_CHAT_RENAME_CALLS__?: Array<{ conversationId: string; title: string }>;
    __WEIN_CHAT_ARCHIVE_CALLS__?: Array<{ conversationId: string; archived_at: string | null }>;
    __WEIN_CHAT_ROLE_CALLS__?: Array<{ p_conversation_id: string; p_user_id: string; p_role: string }>;
  }
}
