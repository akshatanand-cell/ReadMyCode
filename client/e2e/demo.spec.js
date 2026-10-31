import { test, expect } from '@playwright/test';

test.describe('Public Demo & Compliance Flows', () => {
  test('should allow unauthenticated visitors to explore demo repository', async ({ page }) => {
    await page.goto('/repo/demo-react-app');
    
    // Check that we are not redirected to /login
    await expect(page).toHaveURL(/\/repo\/demo-react-app/);
    
    // Check that repository name is displayed
    const repoTitle = page.locator('text=/ShopStream|Interactive Workspace/i').first();
    await expect(repoTitle).toBeVisible();

    // Check that Quick Actions bar is present
    const shareBtn = page.locator('button:has-text("Share Link")').first();
    const downloadSpecsBtn = page.locator('button:has-text("Download Specs")').first();
    await expect(shareBtn).toBeVisible();
    await expect(downloadSpecsBtn).toBeVisible();
  });

  test('should display Ask AI drawer toggle on repo pages', async ({ page }) => {
    await page.goto('/repo/demo-react-app');
    
    // Check that Ask Grok AI button exists
    const askAiBtn = page.locator('button:has-text("Ask Grok AI"), button:has-text("Ask AI")').first();
    await expect(askAiBtn).toBeVisible();

    // Click to open drawer
    await askAiBtn.click();
    const drawerTitle = page.locator('text=/Ask ReadMyCode AI|Codebase Intelligence/i').first();
    await expect(drawerTitle).toBeVisible();
  });

  test('should render Terms of Service with AI accuracy disclaimer', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveTitle(/ReadMyCode/i);
    
    const termsHeading = page.locator('h1:has-text("Terms of Service")');
    await expect(termsHeading).toBeVisible();
    
    const disclaimer = page.locator('text=/AI Accuracy Disclaimer|Mandatory AI Output Notice/i').first();
    await expect(disclaimer).toBeVisible();
  });

  test('should render Privacy Policy with token encryption disclosure', async ({ page }) => {
    await page.goto('/privacy');
    const privacyHeading = page.locator('h1:has-text("Privacy Policy")');
    await expect(privacyHeading).toBeVisible();
    
    const encDisclosure = page.locator('text=/AES-256-GCM/i').first();
    await expect(encDisclosure).toBeVisible();
  });

  test('should render Scope Warranty checkbox on analyze page', async ({ page }) => {
    await page.goto('/analyze');
    const warrantyText = page.locator('text=/I confirm I have the authority|never used for model training/i').first();
    await expect(warrantyText).toBeVisible();
  });
});
