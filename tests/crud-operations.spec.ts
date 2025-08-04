import { test, expect } from '@playwright/test';

test.describe('CRUD Operations Tests', () => {
  test.describe('Super Admin CRUD Operations', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'superadmin@example.com');
      await page.fill('input[type="password"]', 'any-password');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should perform full CRUD on organizations', async ({ page }) => {
      await page.goto('/organizations');
      
      // CREATE
      await page.click('button:has-text("Add Organization")');
      await page.fill('input[name="name"]', 'CRUD Test Org');
      await page.fill('textarea[name="description"]', 'CRUD Test Description');
      await page.click('button:has-text("Create")');
      await expect(page.locator('body')).toContainText('CRUD Test Org');

      // READ - Verify it's in the list
      await expect(page.locator('body')).toContainText('CRUD Test Description');

      // UPDATE
      await page.click('button:has-text("Edit")');
      await page.fill('input[name="name"]', 'Updated CRUD Test Org');
      await page.click('button:has-text("Update")');
      await expect(page.locator('body')).toContainText('Updated CRUD Test Org');

      // DELETE
      await page.click('button:has-text("Delete")');
      await page.click('button:has-text("Confirm")');
      await expect(page.locator('body')).not.toContainText('Updated CRUD Test Org');
    });

    test('should perform full CRUD on users', async ({ page }) => {
      await page.goto('/users');
      
      // CREATE
      await page.click('button:has-text("Add User")');
      await page.fill('input[name="name"]', 'CRUD Test User');
      await page.fill('input[name="email"]', 'crudtest@example.com');
      await page.selectOption('select[name="role"]', 'org_user');
      await page.selectOption('select[name="organizationId"]', 'techcorp');
      await page.click('button:has-text("Create")');
      await expect(page.locator('body')).toContainText('CRUD Test User');

      // READ - Verify it's in the list
      await expect(page.locator('body')).toContainText('crudtest@example.com');

      // UPDATE
      await page.click('button:has-text("Edit")');
      await page.fill('input[name="name"]', 'Updated CRUD Test User');
      await page.click('button:has-text("Update")');
      await expect(page.locator('body')).toContainText('Updated CRUD Test User');

      // DELETE
      await page.click('button:has-text("Delete")');
      await page.click('button:has-text("Confirm")');
      await expect(page.locator('body')).not.toContainText('Updated CRUD Test User');
    });

    test('should perform full CRUD on orders', async ({ page }) => {
      await page.goto('/orders');
      
      // CREATE
      await page.click('button:has-text("Add Order")');
      await page.fill('input[name="title"]', 'CRUD Test Order');
      await page.fill('textarea[name="description"]', 'CRUD Test Order Description');
      await page.selectOption('select[name="status"]', 'pending');
      await page.selectOption('select[name="userId"]', 'user@techcorp.com');
      await page.selectOption('select[name="organizationId"]', 'techcorp');
      await page.click('button:has-text("Create")');
      await expect(page.locator('body')).toContainText('CRUD Test Order');

      // READ - Verify it's in the list
      await expect(page.locator('body')).toContainText('CRUD Test Order Description');

      // UPDATE
      await page.click('button:has-text("Edit")');
      await page.fill('input[name="title"]', 'Updated CRUD Test Order');
      await page.click('button:has-text("Update")');
      await expect(page.locator('body')).toContainText('Updated CRUD Test Order');

      // DELETE
      await page.click('button:has-text("Delete")');
      await page.click('button:has-text("Confirm")');
      await expect(page.locator('body')).not.toContainText('Updated CRUD Test Order');
    });
  });

  test.describe('Org Admin CRUD Operations', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'admin@techcorp.com');
      await page.fill('input[type="password"]', 'any-password');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should perform full CRUD on users within organization', async ({ page }) => {
      await page.goto('/users');
      
      // CREATE
      await page.click('button:has-text("Add User")');
      await page.fill('input[name="name"]', 'Org CRUD Test User');
      await page.fill('input[name="email"]', 'orgcrudtest@techcorp.com');
      await page.selectOption('select[name="role"]', 'org_user');
      await page.click('button:has-text("Create")');
      await expect(page.locator('body')).toContainText('Org CRUD Test User');

      // READ - Verify it's in the list
      await expect(page.locator('body')).toContainText('orgcrudtest@techcorp.com');

      // UPDATE
      await page.click('button:has-text("Edit")');
      await page.fill('input[name="name"]', 'Updated Org CRUD Test User');
      await page.click('button:has-text("Update")');
      await expect(page.locator('body')).toContainText('Updated Org CRUD Test User');

      // DELETE
      await page.click('button:has-text("Delete")');
      await page.click('button:has-text("Confirm")');
      await expect(page.locator('body')).not.toContainText('Updated Org CRUD Test User');
    });

    test('should perform full CRUD on orders within organization', async ({ page }) => {
      await page.goto('/orders');
      
      // CREATE
      await page.click('button:has-text("Add Order")');
      await page.fill('input[name="title"]', 'Org CRUD Test Order');
      await page.fill('textarea[name="description"]', 'Org CRUD Test Order Description');
      await page.selectOption('select[name="status"]', 'pending');
      await page.selectOption('select[name="userId"]', 'user@techcorp.com');
      await page.click('button:has-text("Create")');
      await expect(page.locator('body')).toContainText('Org CRUD Test Order');

      // READ - Verify it's in the list
      await expect(page.locator('body')).toContainText('Org CRUD Test Order Description');

      // UPDATE
      await page.click('button:has-text("Edit")');
      await page.fill('input[name="title"]', 'Updated Org CRUD Test Order');
      await page.click('button:has-text("Update")');
      await expect(page.locator('body')).toContainText('Updated Org CRUD Test Order');

      // DELETE
      await page.click('button:has-text("Delete")');
      await page.click('button:has-text("Confirm")');
      await expect(page.locator('body')).not.toContainText('Updated Org CRUD Test Order');
    });
  });

  test.describe('Org User CRUD Operations', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@techcorp.com');
      await page.fill('input[type="password"]', 'any-password');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should perform full CRUD on own orders', async ({ page }) => {
      await page.goto('/orders');
      
      // CREATE
      await page.click('button:has-text("Add Order")');
      await page.fill('input[name="title"]', 'User CRUD Test Order');
      await page.fill('textarea[name="description"]', 'User CRUD Test Order Description');
      await page.selectOption('select[name="status"]', 'pending');
      await page.click('button:has-text("Create")');
      await expect(page.locator('body')).toContainText('User CRUD Test Order');

      // READ - Verify it's in the list
      await expect(page.locator('body')).toContainText('User CRUD Test Order Description');

      // UPDATE
      await page.click('button:has-text("Edit")');
      await page.fill('input[name="title"]', 'Updated User CRUD Test Order');
      await page.click('button:has-text("Update")');
      await expect(page.locator('body')).toContainText('Updated User CRUD Test Order');

      // DELETE
      await page.click('button:has-text("Delete")');
      await page.click('button:has-text("Confirm")');
      await expect(page.locator('body')).not.toContainText('Updated User CRUD Test Order');
    });

    test('should not be able to access user management', async ({ page }) => {
      await page.goto('/users');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should not be able to access organization management', async ({ page }) => {
      await page.goto('/organizations');
      await expect(page).toHaveURL(/.*dashboard/);
    });
  });
}); 