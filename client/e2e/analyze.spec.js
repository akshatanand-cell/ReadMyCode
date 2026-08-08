import { test, expect } from '@playwright/test';

test.describe('Analyze Page', () => {
  test('should load the analyze page', async ({ page }) => {
    await page.goto('/analyze');
    const heading = page.locator('text=Analyze').first();
    await expect(heading).toBeVisible();
  });

  test('should display GitHub URL input field', async ({ page }) => {
    await page.goto('/analyze');
    const input = page.locator('input[type="text"], input[type="url"], input[placeholder*="github"]').first();
    await expect(input).toBeVisible();
  });

  test('should display Analyze Repository button', async ({ page }) => {
    await page.goto('/analyze');
    const analyzeBtn = page.locator('button:has-text("Analyze")').first();
    await expect(analyzeBtn).toBeVisible();
  });

  test('should have GitHub URL and ZIP Upload tabs', async ({ page }) => {
    await page.goto('/analyze');
    const githubTab = page.locator('text=GitHub').first();
    const zipTab = page.locator('text=ZIP').first();
    await expect(githubTab).toBeVisible();
    await expect(zipTab).toBeVisible();
  });

  test('should switch to ZIP upload tab', async ({ page }) => {
    await page.goto('/analyze');
    const zipTab = page.locator('button:has-text("ZIP"), [role="tab"]:has-text("ZIP")').first();
    await zipTab.click();
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();
  });
});
