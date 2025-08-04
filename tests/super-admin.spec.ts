import { test, expect } from '@playwright/test';

test.describe('Super Admin Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as super admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@example.com');
    await page.fill('input[type="password"]', 'any-password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should access dashboard and see super admin statistics', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('body')).toContainText('Total Organizations');
    await expect(page.locator('body')).toContainText('Total Users');
    await expect(page.locator('body')).toContainText('Total Orders');
  });

  test('should manage organizations', async ({ page }) => {
    // Navigate to organizations page
    await page.goto('/organizations');
    await expect(page.locator('h1')).toContainText('Organizations');

    // Create new organization
    await page.click('button:has-text("Add Organization")');
    await page.fill('input[name="name"]', 'Test Organization');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.click('button:has-text("Create")');

    // Verify organization was created
    await expect(page.locator('body')).toContainText('Test Organization');
    await expect(page.locator('body')).toContainText('Test Description');

    // Edit organization
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="name"]', 'Updated Test Organization');
    await page.click('button:has-text("Update")');

    // Verify organization was updated
    await expect(page.locator('body')).toContainText('Updated Test Organization');

    // Delete organization
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');

    // Verify organization was deleted
    await expect(page.locator('body')).not.toContainText('Updated Test Organization');
  });

  test('should manage users', async ({ page }) => {
    // Navigate to users page
    await page.goto('/users');
    await expect(page.locator('h1')).toContainText('Users');

    // Create new user
    await page.click('button:has-text("Add User")');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.selectOption('select[name="role"]', 'org_user');
    await page.selectOption('select[name="organizationId"]', 'techcorp');
    await page.click('button:has-text("Create")');

    // Verify user was created
    await expect(page.locator('body')).toContainText('Test User');
    await expect(page.locator('body')).toContainText('testuser@example.com');

    // Edit user
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="name"]', 'Updated Test User');
    await page.click('button:has-text("Update")');

    // Verify user was updated
    await expect(page.locator('body')).toContainText('Updated Test User');

    // Delete user
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');

    // Verify user was deleted
    await expect(page.locator('body')).not.toContainText('Updated Test User');
  });

  test('should manage orders', async ({ page }) => {
    // Navigate to orders page
    await page.goto('/orders');
    await expect(page.locator('h1')).toContainText('Orders');

    // Create new order
    await page.click('button:has-text("Add Order")');
    await page.fill('input[name="title"]', 'Test Order');
    await page.fill('textarea[name="description"]', 'Test Order Description');
    await page.selectOption('select[name="status"]', 'pending');
    await page.selectOption('select[name="userId"]', 'user@techcorp.com');
    await page.selectOption('select[name="organizationId"]', 'techcorp');
    await page.click('button:has-text("Create")');

    // Verify order was created
    await expect(page.locator('body')).toContainText('Test Order');
    await expect(page.locator('body')).toContainText('Test Order Description');

    // Edit order
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="title"]', 'Updated Test Order');
    await page.click('button:has-text("Update")');

    // Verify order was updated
    await expect(page.locator('body')).toContainText('Updated Test Order');

    // Delete order
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');

    // Verify order was deleted
    await expect(page.locator('body')).not.toContainText('Updated Test Order');
  });

  test('should have proper navigation menu', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check navigation menu items for super admin
    await expect(page.locator('nav')).toContainText('Dashboard');
    await expect(page.locator('nav')).toContainText('Organizations');
    await expect(page.locator('nav')).toContainText('Users');
    await expect(page.locator('nav')).toContainText('Orders');
  });
}); 