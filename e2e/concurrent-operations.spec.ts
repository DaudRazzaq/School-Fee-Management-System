import { test, expect } from '@playwright/test';

test.describe('Concurrent Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[placeholder="email@example.com"]', 'admin@example.com');
    await page.fill('input[placeholder="••••••••"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to concurrent demo page', async ({ page }) => {
    await page.click('text=Concurrent Demo');
    await expect(page).toHaveURL('/dashboard/concurrent-demo');
    await expect(page.locator('h2')).toContainText('Concurrent Operations Demo');
  });

  test('should process concurrent payments successfully', async ({ page }) => {
    await page.click('text=Concurrent Demo');
    
    await page.click('button:has-text("Process 10 Payments Concurrently")');
    
    // Wait for processing to start
    await expect(page.locator('text=Processing 10 Payments Concurrently...')).toBeVisible();
    
    // Wait for completion (with timeout)
    await expect(page.locator('text=Concurrent Processing Complete')).toBeVisible({ timeout: 15000 });
    
    // Check that results table is displayed
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Student ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should generate reports without blocking UI', async ({ page }) => {
    await page.click('text=Concurrent Demo');
    
    // Switch to reports tab
    await page.click('text=Report Generation');
    
    // Select report type and generate
    await page.selectOption('select', 'monthly');
    await page.click('button:has-text("Generate Report")');
    
    // Verify UI is not blocked during generation
    await expect(page.locator('text=Generating...')).toBeVisible();
    
    // Wait for report completion
    await expect(page.locator('text=Monthly Report')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Total Payments:')).toBeVisible();
    await expect(page.locator('text=Total Amount:')).toBeVisible();
  });

  test('should handle multiple concurrent operations', async ({ page }) => {
    await page.click('text=Concurrent Demo');
    
    // Start concurrent payments
    await page.click('button:has-text("Process 10 Payments Concurrently")');
    
    // Immediately switch to reports and start generation
    await page.click('text=Report Generation');
    await page.selectOption('select', 'weekly');
    await page.click('button:has-text("Generate Report")');
    
    // Both operations should complete successfully
    await expect(page.locator('text=Weekly Report')).toBeVisible({ timeout: 15000 });
    
    // Switch back to payments tab
    await page.click('text=Concurrent Payments');
    await expect(page.locator('text=Concurrent Processing Complete')).toBeVisible();
  });
});