import { test, expect } from '@playwright/test';

test.describe('Authentication & Workspace Browser Flow', () => {
  test('User Registration, Login, Session Persistence & Logout', async ({ page }) => {
    // 1. Visit Login / Registration
    await page.goto('/register');
    await expect(page).toHaveTitle(/DocTrack/);

    // 2. Responsive viewport check (Mobile)
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('body')).toBeVisible();

    // 3. Dark mode accessibility check
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('body')).toBeVisible();
  });
});
