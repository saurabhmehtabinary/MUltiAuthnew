import { test, expect } from '@playwright/test';

test.describe('Error Handling and Edge Cases', () => {
  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrong-password');
    await page.click('button[type="submit"]');
    
    // Should stay on login page or show error message
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle empty form submissions', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    
    // Should not proceed with empty fields
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle unauthorized access attempts', async ({ page }) => {
    // Try to access protected pages without login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
    
    await page.goto('/organizations');
    await expect(page).toHaveURL(/.*login/);
    
    await page.goto('/users');
    await expect(page).toHaveURL(/.*login/);
    
    await page.goto('/orders');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle role-based access restrictions', async ({ page }) => {
    // Login as org user
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@techcorp.com');
    await page.fill('input[type="password"]', 'any-password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Try to access super admin pages
    await page.goto('/organizations');
    await expect(page).toHaveURL(/.*dashboard/);
    
    await page.goto('/users');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should handle form validation errors', async ({ page }) => {
    // Login as super admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@example.com');
    await page.fill('input[type="password"]', 'any-password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Test organization creation with empty fields
    await page.goto('/organizations');
    await page.click('button:has-text("Add Organization")');
    await page.click('button:has-text("Create")');
    
    // Should not create organization with empty name
    await expect(page.locator('body')).not.toContainText('Created successfully');
  });

  test('should handle data persistence', async ({ page }) => {
    // Login and create data
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@example.com');
    await page.fill('input[type="password"]', 'any-password');
    await page.click('button[type="submit"]');
    
    await page.goto('/organizations');
    await page.click('button:has-text("Add Organization")');
    await page.fill('input[name="name"]', 'Persistence Test Org');
    await page.fill('textarea[name="description"]', 'Testing data persistence');
    await page.click('button:has-text("Create")');
    
    // Verify data was created
    await expect(page.locator('body')).toContainText('Persistence Test Org');
    
    // Refresh page and verify data persists
    await page.reload();
    await expect(page.locator('body')).toContainText('Persistence Test Org');
    
    // Clean up
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');
  });

  test('should handle concurrent operations', async ({ page }) => {
    // Login as super admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@example.com');
    await page.fill('input[type="password"]', 'any-password');
    await page.click('button[type="submit"]');
    
    await page.goto('/organizations');
    
    // Create multiple organizations quickly
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("Add Organization")');
      await page.fill('input[name="name"]', `Concurrent Org ${i}`);
      await page.fill('textarea[name="description"]', `Description ${i}`);
      await page.click('button:has-text("Create")');
    }
    
    // Verify all were created
    await expect(page.locator('body')).toContainText('Concurrent Org 1');
    await expect(page.locator('body')).toContainText('Concurrent Org 2');
    await expect(page.locator('body')).toContainText('Concurrent Org 3');
    
    // Clean up
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("Delete")');
      await page.click('button:has-text("Confirm")');
    }
  });

  test('should handle logout functionality', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@example.com');
    await page.fill('input[type="password"]', 'any-password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/.*login/);
    
    // Try to access protected page after logout
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle session timeout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@example.com');
    await page.fill('input[type="password"]', 'any-password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Clear localStorage to simulate session timeout
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Try to access protected page
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle navigation edge cases', async ({ page }) => {
    // Try to access non-existent pages
    await page.goto('/nonexistent');
    // Should redirect to login or show 404
    
    await page.goto('/login');
    await page.fill('input[type="email"]', 'superadmin@example.com');
    await page.fill('input[type="password"]', 'any-password');
    await page.click('button[type="submit"]');
    
    await page.goto('/nonexistent');
    // Should redirect to dashboard or show 404
  });
}); 