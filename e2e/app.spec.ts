import { test, expect, type Page } from '@playwright/test';

// ── Auth helpers ───────────────────────────────────────────────────────────────
//
// Protected routes are guarded by AuthGuard (redirects to /login when
// isAuthenticated is false) and by AuthInitializer (calls GET /auth/me on
// mount; logs out on failure). In E2E there is no running backend, so we:
//
//   1. Seed the Zustand persist key in localStorage via addInitScript — runs
//      before page JS so the store hydrates as already-authenticated.
//   2. Intercept GET /api/v1/auth/me with page.route and return 200 so
//      AuthInitializer does not call logout() and strip the auth state.

const MOCK_AUTH_STATE = {
  state: {
    user: {
      _id: 'e2e-user-001',
      username: 'e2etester',
      email: 'e2e@linkora.app',
      role: 'user',
      status: 'active',
      emailVerified: true,
      phoneVerified: false,
      twoFactorEnabled: false,
      lastSeen: '',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    accessToken: 'e2e-fake-access-token',
    refreshToken: 'e2e-fake-refresh-token',
    sessionId: 'e2e-fake-session-id',
    isAuthenticated: true,
  },
  version: 0,
};

async function seedAuth(page: Page): Promise<void> {
  // Abort socket.io long-polling & websocket retries in E2E tests
  await page.route('**/*socket.io*', (route) => route.abort());

  // Set localStorage before any page script runs.
  await page.addInitScript((auth) => {
    localStorage.setItem('linkora_auth', JSON.stringify(auth));
  }, MOCK_AUTH_STATE);

  // Default catch-all for all API requests
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    }),
  );

  // Return 200 for session-validation so AuthInitializer doesn't log us out
  await page.route('**/*auth/me*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: MOCK_AUTH_STATE.state.user }),
    }),
  );

  // Return 200 with valid profile object for own profile queries
  await page.route('**/*profile/me*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 'e2e-profile-001',
          userId: 'e2e-user-001',
          displayName: 'E2E Tester',
          bio: 'E2E test profile',
        },
      }),
    }),
  );
}

// ── Protected routes ───────────────────────────────────────────────────────────

test.describe('App routing › protected pages', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test('/ renders landing page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-landing')).toBeVisible();
  });

  test('/chat renders the chat page', async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-chat')).toBeVisible();
  });

  test('/chat/:id renders the chat page with a conversation open', async ({ page }) => {
    await page.goto('/chat/abc123', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-chat')).toBeVisible();
  });

  test('/profile renders the profile page', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-profile')).toBeVisible();
  });

  test('/settings renders the settings page', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-settings')).toBeVisible();
  });
});

// ── Public routes ──────────────────────────────────────────────────────────────

test.describe('App routing › public pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*socket.io*', (route) => route.abort());
  });

  test('/login renders the login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-login')).toBeVisible();
  });

  test('/register renders the register page', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-register')).toBeVisible();
  });

  test('/forgot-password renders the forgot-password page', async ({ page }) => {
    await page.goto('/forgot-password', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-forgot-password')).toBeVisible();
  });

  test('unknown route renders the 404 page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-not-found')).toBeVisible();
  });
});

// ── Document metadata ──────────────────────────────────────────────────────────

test.describe('Page titles and document', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test('page has a title', async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('page uses UTF-8 charset', async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    const charset = await page.evaluate(
      () => document.querySelector('meta[charset]')?.getAttribute('charset') ?? '',
    );
    expect(charset.toLowerCase()).toBe('utf-8');
  });
});
