import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Login');
  });

  test('should login as admin successfully', async ({ page }) => {
    await page.click('text=Login');
    
    await page.fill('input[placeholder="email@example.com"]', 'admin@example.com');
    await page.fill('input[placeholder="••••••••"]', 'password');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h2')).toContainText('Admin Dashboard');
  });

  test('should login as parent successfully', async ({ page }) => {
    await page.click('text=Login');
    
    await page.fill('input[placeholder="email@example.com"]', 'parent@example.com');
    await page.fill('input[placeholder="••••••••"]', 'password');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h2')).toContainText('Parent Dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Login');
    
    await page.fill('input[placeholder="email@example.com"]', 'invalid@example.com');
    await page.fill('input[placeholder="••••••••"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Login failed')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.click('text=Login');
    
    await page.fill('input[placeholder="email@example.com"]', 'invalid-email');
    await page.fill('input[placeholder="••••••••"]', 'password');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('should validate password length', async ({ page }) => {
    await page.click('text=Login');
    
    await page.fill('input[placeholder="email@example.com"]', 'test@example.com');
    await page.fill('input[placeholder="••••••••"]', '123');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
  });
});