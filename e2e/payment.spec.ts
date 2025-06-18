import { test, expect } from '@playwright/test';

test.describe('Payment Processing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as parent first
    await page.goto('/login');
    await page.fill('input[placeholder="email@example.com"]', 'parent@example.com');
    await page.fill('input[placeholder="••••••••"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display payment form when Pay Now is clicked', async ({ page }) => {
    await page.click('button:has-text("Pay Now")');
    
    await expect(page.locator('h3')).toContainText('Make Payment');
    await expect(page.locator('text=Payment Method')).toBeVisible();
  });

  test('should process credit card payment successfully', async ({ page }) => {
    await page.click('button:has-text("Pay Now")');
    
    // Select credit card payment
    await page.click('input[value="credit"]');
    
    // Fill credit card details
    await page.fill('input[placeholder="John Doe"]', 'Test User');
    await page.fill('input[placeholder="1234 5678 9012 3456"]', '1234567890123456');
    await page.selectOption('select:near(:text("Expiry Month"))', '12');
    await page.selectOption('select:near(:text("Expiry Year"))', '2025');
    await page.fill('input[placeholder="123"]', '123');
    
    // Submit payment
    await page.click('button:has-text("Pay $500")');
    
    // Wait for success message
    await expect(page.locator('text=Payment Successful!')).toBeVisible({ timeout: 10000 });
  });

  test('should show bank transfer instructions', async ({ page }) => {
    await page.click('button:has-text("Pay Now")');
    
    // Select bank transfer
    await page.click('input[value="bank"]');
    
    await expect(page.locator('text=Bank Transfer Instructions')).toBeVisible();
    await expect(page.locator('text=School National Bank')).toBeVisible();
    await expect(page.locator('text=Account Number')).toBeVisible();
  });

  test('should validate credit card form fields', async ({ page }) => {
    await page.click('button:has-text("Pay Now")');
    
    // Select credit card payment
    await page.click('input[value="credit"]');
    
    // Try to submit without filling required fields
    await page.click('button:has-text("Pay $500")');
    
    await expect(page.locator('text=Name is required')).toBeVisible();
  });

  test('should validate card number format', async ({ page }) => {
    await page.click('button:has-text("Pay Now")');
    
    // Select credit card payment
    await page.click('input[value="credit"]');
    
    // Fill with invalid card number
    await page.fill('input[placeholder="John Doe"]', 'Test User');
    await page.fill('input[placeholder="1234 5678 9012 3456"]', '123');
    
    await page.click('button:has-text("Pay $500")');
    
    await expect(page.locator('text=Card number must be 16 digits')).toBeVisible();
  });

  test('should handle payment processing errors gracefully', async ({ page }) => {
    // Mock a payment failure scenario
    await page.route('**/api/payments', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Payment declined' })
      });
    });

    await page.click('button:has-text("Pay Now")');
    
    // Select credit card payment
    await page.click('input[value="credit"]');
    
    // Fill valid details
    await page.fill('input[placeholder="John Doe"]', 'Test User');
    await page.fill('input[placeholder="1234 5678 9012 3456"]', '1234567890123456');
    await page.selectOption('select:near(:text("Expiry Month"))', '12');
    await page.selectOption('select:near(:text("Expiry Year"))', '2025');
    await page.fill('input[placeholder="123"]', '123');
    
    await page.click('button:has-text("Pay $500")');
    
    await expect(page.locator('text=Payment Failed')).toBeVisible({ timeout: 10000 });
  });
});