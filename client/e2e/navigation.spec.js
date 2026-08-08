import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    const loginForm = page.locator('input[type="email"], input[type="password"]').first();
    await expect(loginForm).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register');
    const nameField = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    await expect(nameField).toBeVisible();
  });

  test('should show navbar on all pages', async ({ page }) => {
    await page.goto('/');
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();
  });

  test('should have working home link in navbar', async ({ page }) => {
    await page.goto('/login');
    const homeLink = page.locator('a[href="/"]').first();
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should show 404 page for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    const notFoundText = page.locator('text=/404|not found|page.*not/i').first();
    await expect(notFoundText).toBeVisible();
  });
});
