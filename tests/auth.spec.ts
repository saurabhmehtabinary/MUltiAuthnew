import { test, expect } from '@playwright/test';

const users = [
  { email: 'superadmin@example.com', role: 'super_admin' },
  { email: 'admin@techcorp.com', role: 'org_admin' },
  { email: 'user@techcorp.com', role: 'org_user' },
];

test.describe('Authentication and Dashboard', () => {
  for (const user of users) {
    test(`should login and see dashboard for ${user.role}`, async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', user.email);
      await page.fill('input[type="password"]', 'any-password');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('h1')).toContainText('Dashboard');
      await expect(page.locator('body')).toContainText(user.email.split('@')[0].replace('.', ' '));
    });
  }
});