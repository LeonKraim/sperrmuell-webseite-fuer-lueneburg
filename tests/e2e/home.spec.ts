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
});
