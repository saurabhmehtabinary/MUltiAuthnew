import { test, expect } from '@playwright/test';

test.describe('Org Admin Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as org admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@techcorp.com');
    await page.fill('input[type="password"]', 'any-password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should access dashboard and see org admin statistics', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('body')).toContainText('Organization Users');
    await expect(page.locator('body')).toContainText('Organization Orders');
  });

  test('should manage users within organization', async ({ page }) => {
    // Navigate to users page
    await page.goto('/users');
    await expect(page.locator('h1')).toContainText('Users');

    // Create new user
    await page.click('button:has-text("Add User")');
    await page.fill('input[name="name"]', 'Test Org User');
    await page.fill('input[name="email"]', 'testorguser@techcorp.com');
    await page.selectOption('select[name="role"]', 'org_user');
    await page.click('button:has-text("Create")');

    // Verify user was created
    await expect(page.locator('body')).toContainText('Test Org User');
    await expect(page.locator('body')).toContainText('testorguser@techcorp.com');

    // Edit user
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="name"]', 'Updated Test Org User');
    await page.click('button:has-text("Update")');

    // Verify user was updated
    await expect(page.locator('body')).toContainText('Updated Test Org User');

    // Delete user
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');

    // Verify user was deleted
    await expect(page.locator('body')).not.toContainText('Updated Test Org User');
  });

  test('should manage orders within organization', async ({ page }) => {
    // Navigate to orders page
    await page.goto('/orders');
    await expect(page.locator('h1')).toContainText('Orders');

    // Create new order
    await page.click('button:has-text("Add Order")');
    await page.fill('input[name="title"]', 'Test Org Order');
    await page.fill('textarea[name="description"]', 'Test Org Order Description');
    await page.selectOption('select[name="status"]', 'pending');
    await page.selectOption('select[name="userId"]', 'user@techcorp.com');
    await page.click('button:has-text("Create")');

    // Verify order was created
    await expect(page.locator('body')).toContainText('Test Org Order');
    await expect(page.locator('body')).toContainText('Test Org Order Description');

    // Edit order
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="title"]', 'Updated Test Org Order');
    await page.click('button:has-text("Update")');

    // Verify order was updated
    await expect(page.locator('body')).toContainText('Updated Test Org Order');

    // Delete order
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');

    // Verify order was deleted
    await expect(page.locator('body')).not.toContainText('Updated Test Org Order');
  });

  test('should not access organizations page', async ({ page }) => {
    // Try to access organizations page (should redirect to dashboard)
    await page.goto('/organizations');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should have proper navigation menu', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check navigation menu items for org admin
    await expect(page.locator('nav')).toContainText('Dashboard');
    await expect(page.locator('nav')).toContainText('Users');
    await expect(page.locator('nav')).toContainText('Orders');
    
    // Should not have Organizations menu item
    await expect(page.locator('nav')).not.toContainText('Organizations');
  });

  test('should only see users from their organization', async ({ page }) => {
    await page.goto('/users');
    
    // Should see users from TechCorp organization
    await expect(page.locator('body')).toContainText('admin@techcorp.com');
    await expect(page.locator('body')).toContainText('user@techcorp.com');
    
    // Should not see users from other organizations
    await expect(page.locator('body')).not.toContainText('superadmin@example.com');
  });

  test('should only see orders from their organization', async ({ page }) => {
    await page.goto('/orders');
    
    // Should see orders from TechCorp organization
    await expect(page.locator('body')).toContainText('TechCorp');
    
    // Should not see orders from other organizations
    await expect(page.locator('body')).not.toContainText('Other Organization');
  });
}); 