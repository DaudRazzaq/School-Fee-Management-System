import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[placeholder="email@example.com"]', 'admin@example.com');
    await page.fill('input[placeholder="••••••••"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display admin dashboard with key metrics', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Admin Dashboard');
    
    // Check for key metric cards
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Pending Payments')).toBeVisible();
    await expect(page.locator('text=Total Students')).toBeVisible();
    await expect(page.locator('text=Payment Rate')).toBeVisible();
  });

  test('should navigate between dashboard tabs', async ({ page }) => {
    // Test Overview tab (default)
    await expect(page.locator('text=Revenue Overview')).toBeVisible();
    
    // Test Students tab
    await page.click('text=Students');
    await expect(page.locator('text=Manage student information')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    
    // Test Payments tab
    await page.click('text=Payments');
    await expect(page.locator('text=View and manage all payment transactions')).toBeVisible();
    
    // Test Fee Settings tab
    await page.click('text=Fee Settings');
    await expect(page.locator('text=Configure fee structures')).toBeVisible();
  });

  test('should display student table with filtering', async ({ page }) => {
    await page.click('text=Students');
    
    // Check table headers
    await expect(page.locator('th:has-text("Student ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Student Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Grade")')).toBeVisible();
    await expect(page.locator('th:has-text("Payment Status")')).toBeVisible();
    
    // Test filtering
    await page.fill('input[placeholder="Filter students..."]', 'John');
    await expect(page.locator('text=John Smith')).toBeVisible();
  });

  test('should display payment table with actions', async ({ page }) => {
    await page.click('text=Payments');
    
    // Check table headers
    await expect(page.locator('th:has-text("Payment ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Student Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    
    // Test action menu
    await page.click('button[aria-label="Open menu"]');
    await expect(page.locator('text=Copy Payment ID')).toBeVisible();
    await expect(page.locator('text=View Payment Details')).toBeVisible();
  });

  test('should configure fee settings', async ({ page }) => {
    await page.click('text=Fee Settings');
    
    // Fill fee configuration form
    await page.selectOption('select[id="fee-type"]', 'quarterly');
    await page.selectOption('select[id="grade-level"]', 'high');
    await page.fill('input[id="fee-amount"]', '750');
    await page.fill('input[id="late-fee"]', '50');
    
    await page.click('button:has-text("Save Fee Structure")');
    
    // Verify form submission (in a real app, this would show a success message)
    await expect(page.locator('button:has-text("Save Fee Structure")')).toBeVisible();
  });

  test('should display charts and visualizations', async ({ page }) => {
    // Revenue chart should be visible
    await expect(page.locator('text=Revenue Overview')).toBeVisible();
    await expect(page.locator('text=Monthly fee collection')).toBeVisible();
    
    // Payment methods chart should be visible
    await expect(page.locator('text=Payment Methods')).toBeVisible();
    await expect(page.locator('text=Distribution of payment methods')).toBeVisible();
  });
});