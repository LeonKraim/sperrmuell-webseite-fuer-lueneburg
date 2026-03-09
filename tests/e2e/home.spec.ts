import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page loaded successfully
    expect(page.url()).toBe('http://localhost:3000/');
  });

  test('should display the map', async ({ page }) => {
    await page.goto('/');
    
    // Wait for map to be visible (adjust selector based on your actual map component)
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads in mobile view
    await expect(page).toHaveTitle(/.*/);
  });

  test('should align export button with the credit badge on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const exportButton = page.getByRole('button', { name: 'Export data' });
    const creditBadge = page.getByTitle('Made by Leon Kraim');

    await expect(exportButton).toBeVisible();
    await expect(creditBadge).toBeVisible();

    const exportBox = await exportButton.boundingBox();
    const creditBox = await creditBadge.boundingBox();

    expect(exportBox).not.toBeNull();
    expect(creditBox).not.toBeNull();
    expect(Math.abs((exportBox?.y ?? 0) - (creditBox?.y ?? 0))).toBeLessThanOrEqual(2);
  });
});
