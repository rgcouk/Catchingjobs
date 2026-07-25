import { test, expect } from '@playwright/test';

test('Intake Wizard submission flow', async ({ page }) => {
  await page.goto('/');
  
  // Click on Sign Up button
  await page.click('button:has-text("Sign Up")');
  
  // Intake Wizard should be visible
  await expect(page.locator('h3:has-text("Secure Roster Enrollment")')).toBeVisible();
  
  // Click on Continue with Google
  const googleBtn = page.locator('button:has-text("Continue with Google")');
  await expect(googleBtn).toBeVisible();
  await googleBtn.click();
  
  // After clicking, it should show authentication progress
  await expect(page.locator('text=Initializing Secure Google Sign-In...')).toBeVisible();
});
