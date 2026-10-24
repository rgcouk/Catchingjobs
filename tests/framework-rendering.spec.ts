import { test, expect } from '@playwright/test';

test('public browser fixtures stay signed out and reject API writes', async ({ page, request }) => {
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => Boolean((window as any).Clerk?.loaded))).toBe(true);
  expect(await page.evaluate(() => (window as any).Clerk.user)).toBeNull();
  const protectedPage = await request.get('/employee', { maxRedirects: 0 });
  // Without backend credentials production authentication fails closed (503).
  // A developer with Clerk configured gets the normal sign-in redirect instead.
  expect([302, 503]).toContain(protectedPage.status());
  if (protectedPage.status() === 302) expect(protectedPage.headers().location).toContain('/login');
  const write = await request.post('/api/applications', { data: {} });
  expect(write.status()).toBe(405);
});

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
