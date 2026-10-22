import { test, expect } from '@playwright/test';

test('public routes deliver real HTML and job metadata before JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [url, text] of [
    ['/', 'Catching'],
    ['/jobs', 'Night Shift Broiler Catcher'],
    ['/locations', 'Lincolnshire'],
    ['/jobs/1', 'Night Shift Broiler Catcher'],
    ['/training/moffett', 'Real confidence'],
  ]) {
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toContainText(text);
  }
  await page.goto('/jobs/1');
  const schema = page.locator('script[type="application/ld+json"]');
  expect(await schema.allTextContents()).toEqual(
    expect.arrayContaining([expect.stringContaining('JobPosting')]),
  );
  await context.close();
});

test('missing routes and jobs use HTTP 404', async ({ request }) => {
  for (const path of ['/unknown-page', '/jobs/999999']) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('Page not found');
  }
});

test('server HTML hydrates without mismatched content', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (/hydration|did not match|server rendered html/i.test(message.text()))
      failures.push(message.text());
  });
  await page.goto('/ssr-test');
  await expect(page.getByTestId('ssr-target')).toHaveText('Client (Hydrated)');
  expect(failures).toEqual([]);
});
