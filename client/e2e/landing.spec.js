import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the home page with hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ReadMyCode/i);
    const heroText = page.locator('text=ReadMyCode');
    await expect(heroText.first()).toBeVisible();
  });

  test('should have a Get Started button', async ({ page }) => {
    await page.goto('/');
    const getStartedBtn = page.locator('text=Get Started').first();
    await expect(getStartedBtn).toBeVisible();
  });

  test('should navigate to analyze page from CTA', async ({ page }) => {
    await page.goto('/');
    const ctaButton = page.locator('a[href*="analyze"], button:has-text("Get Started")').first();
    await ctaButton.click();
    await expect(page).toHaveURL(/\/(analyze|login|register)/);
  });
});
