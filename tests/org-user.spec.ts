import { test, expect } from '@playwright/test';

test.describe('Org User Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as org user
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@techcorp.com');
    await page.fill('input[type="password"]', 'any-password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should access dashboard and see user statistics', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('body')).toContainText('My Orders');
  });

  test('should manage own orders', async ({ page }) => {
    // Navigate to orders page
    await page.goto('/orders');
    await expect(page.locator('h1')).toContainText('Orders');

    // Create new order
    await page.click('button:has-text("Add Order")');
    await page.fill('input[name="title"]', 'My Test Order');
    await page.fill('textarea[name="description"]', 'My Test Order Description');
    await page.selectOption('select[name="status"]', 'pending');
    await page.click('button:has-text("Create")');

    // Verify order was created
    await expect(page.locator('body')).toContainText('My Test Order');
    await expect(page.locator('body')).toContainText('My Test Order Description');

    // Edit order
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="title"]', 'Updated My Test Order');
    await page.click('button:has-text("Update")');

    // Verify order was updated
    await expect(page.locator('body')).toContainText('Updated My Test Order');

    // Delete order
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');

    // Verify order was deleted
    await expect(page.locator('body')).not.toContainText('Updated My Test Order');
  });

  test('should not access organizations page', async ({ page }) => {
    // Try to access organizations page (should redirect to dashboard)
    await page.goto('/organizations');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should not access users page', async ({ page }) => {
    // Try to access users page (should redirect to dashboard)
    await page.goto('/users');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should have proper navigation menu', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check navigation menu items for org user
    await expect(page.locator('nav')).toContainText('Dashboard');
    await expect(page.locator('nav')).toContainText('Orders');
    
    // Should not have Organizations or Users menu items
    await expect(page.locator('nav')).not.toContainText('Organizations');
    await expect(page.locator('nav')).not.toContainText('Users');
  });

  test('should only see own orders', async ({ page }) => {
    await page.goto('/orders');
    
    // Should only see orders created by the current user
    await expect(page.locator('body')).toContainText('user@techcorp.com');
    
    // Should not see orders from other users
    await expect(page.locator('body')).not.toContainText('admin@techcorp.com');
  });

  test('should be able to change order status', async ({ page }) => {
    await page.goto('/orders');
    
    // Create an order first
    await page.click('button:has-text("Add Order")');
    await page.fill('input[name="title"]', 'Status Test Order');
    await page.fill('textarea[name="description"]', 'Testing status changes');
    await page.selectOption('select[name="status"]', 'pending');
    await page.click('button:has-text("Create")');

    // Edit the order to change status
    await page.click('button:has-text("Edit")');
    await page.selectOption('select[name="status"]', 'in_progress');
    await page.click('button:has-text("Update")');

    // Verify status was changed
    await expect(page.locator('body')).toContainText('in_progress');

    // Clean up
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');
  });

  test('should see order details correctly', async ({ page }) => {
    await page.goto('/orders');
    
    // Create an order with specific details
    await page.click('button:has-text("Add Order")');
    await page.fill('input[name="title"]', 'Detailed Test Order');
    await page.fill('textarea[name="description"]', 'This is a detailed test order');
    await page.selectOption('select[name="status"]', 'completed');
    await page.click('button:has-text("Create")');

    // Verify all details are displayed correctly
    await expect(page.locator('body')).toContainText('Detailed Test Order');
    await expect(page.locator('body')).toContainText('This is a detailed test order');
    await expect(page.locator('body')).toContainText('completed');

    // Clean up
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');
  });
}); 