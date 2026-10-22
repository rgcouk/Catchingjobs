import { test, expect, type Page } from '@playwright/test';

import { jobs, locations } from './support/public-fixtures';

// All browser checks use local fixtures and reject writes, including accidental applications.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() !== 'GET') {
      return route.fulfill({ status: 405, json: { error: 'Browser audit is read-only.' } });
    }
    if (url.pathname === '/api/jobs') {
      const sector = url.searchParams.get('sector');
      return route.fulfill({ json: sector ? jobs.filter((job) => job.sector === sector) : jobs });
    }
    if (url.pathname.startsWith('/api/jobs/')) {
      const job = jobs.find((job) => job.id === Number(url.pathname.split('/').at(-1)));
      return route.fulfill({ status: job ? 200 : 404, json: job || { error: 'Not found' } });
    }
    if (url.pathname === '/api/locations') return route.fulfill({ json: locations });
    return route.fulfill({ json: [] });
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const overlay = page.locator('vite-error-overlay');
    if (await overlay.count()) {
      await testInfo.attach('vite-overlay', {
        body: await overlay.evaluate(
          (node) => node.shadowRoot?.textContent || node.textContent || '',
        ),
        contentType: 'text/plain',
      });
    }
  }
});

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    })),
  ).toEqual({ viewport: page.viewportSize()!.width, document: page.viewportSize()!.width });
}

test('desktop navigation uses page context and opens keyboard-accessible menus', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('header')).toHaveCSS('background-color', 'rgb(255, 124, 32)');
  const trigger = page.getByRole('button', { name: 'Catching Jobs', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toHaveCSS('background-color', 'rgb(255, 124, 32)');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Locations' })
    .click();
  await expect(page.locator('header')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Home', exact: true }),
  ).not.toHaveAttribute('aria-current', 'page');
});

for (const [route, colour] of [
  ['/', 'rgb(255, 124, 32)'],
  ['/jobs', 'rgb(255, 255, 255)'],
] as const) {
  test(`mobile menu follows ${route} context and closes after navigation`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await expect(page.getByRole('dialog')).toHaveCSS('background-color', colour);
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: 'Locations' })
      .click();
    await expect(page).toHaveURL(/\/locations$/);
    await expect(page.getByRole('dialog')).not.toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}

test('vacancies can be searched, filtered by sector and reset', async ({ page }) => {
  await page.route('**/api/jobs', (route) => route.fulfill({ json: jobs }));
  await page.goto('/jobs');
  await expect(page.getByRole('heading', { name: '2 matching roles' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search by job title or town' }).fill('Boston');
  await expect(page.getByRole('heading', { name: 'Night Shift Broiler Catcher' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Commercial Turkey Catcher' })).not.toBeVisible();
  await page.getByRole('checkbox', { name: 'Commercial Turkey', exact: true }).check();
  await expect(page.getByRole('heading', { name: 'No roles match your search' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('heading', { name: '2 matching roles' })).toBeVisible();
});

const publicRoutes = [
  '/',
  '/jobs',
  '/locations',
  '/chickens',
  '/turkeys',
  '/chickens/boston',
  '/corporate',
  '/login',
  '/register',
  '/training/moffett',
];

for (const width of [390, 1440]) {
  for (const route of publicRoutes) {
    test(`${route} fits ${width}px and loads its leading artwork`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(route);
      await expect(page.locator('h1').first()).toBeVisible();
      // Wait for API-backed content before checking dimensions, rather than only the loading shell.
      if (route === '/jobs')
        await expect(page.getByRole('heading', { name: '2 matching roles' })).toBeVisible();
      if (route === '/locations')
        await expect(
          page.getByRole('heading', { name: 'Lincolnshire', exact: true }),
        ).toBeVisible();
      await expectNoHorizontalOverflow(page);
      const illustration = page.locator('img[src*="/assets/brand/illustrations/"]:visible').first();
      if (await illustration.count()) {
        await expect(illustration).toBeVisible();
        await expect
          .poll(() =>
            illustration.evaluate(
              (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
            ),
          )
          .toBe(true);
      }
    });
  }
}

test('updated home map hero searches by pickup area with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hero = page.locator('#home');
  const image = hero.locator('picture img');
  await expect(image).toHaveAttribute('src', /home-hero-map\/HT8IN\.png$/);
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
    .toBe(true);
  const search = page.getByRole('form', { name: 'Search catching jobs by home location' });
  await search.getByRole('textbox').fill('Boston');
  await search.getByRole('button', { name: 'Find jobs near me' }).click();
  await expect(page).toHaveURL(/\/jobs\?town=Boston$/);
  await expect(page.getByRole('heading', { name: 'Night Shift Broiler Catcher' })).toBeVisible();
});

test('a vacancy card opens the correct live-data detail route', async ({ page }) => {
  await page.goto('/jobs');
  const card = page
    .getByRole('link')
    .filter({ has: page.getByRole('heading', { name: 'Night Shift Broiler Catcher' }) });
  await expect(card).toContainText('Boston');
  await expect(card).toContainText('£15.50 - £18.50/hr');
  await card.click();
  await expect(page).toHaveURL(/\/jobs\/1(?:\/[^/]+)?$/);
  await expect(
    page.getByRole('heading', { name: 'Night Shift Broiler Catcher' }).first(),
  ).toBeVisible();
});

test('Moffett training uses the approved complete yard scene and real contact actions', async ({
  page,
}) => {
  await page.goto('/training/moffett');
  await expect(page.locator('h1')).toContainText(/moffett|confidence/i);
  await expect(page.getByRole('link', { name: 'Enquire about training' })).toHaveAttribute(
    'href',
    'tel:01205330190',
  );
  const art = page.getByRole('img', {
    name: 'Moffett training yard with instructor, forklift, poultry modules and lorry',
  });
  expect(await art.count()).toBeGreaterThanOrEqual(1);
  for (const image of await art.all()) {
    await expect
      .poll(() =>
        image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0),
      )
      .toBe(true);
  }
});

for (const path of [
  '/jobs',
  '/jobs/1',
  '/locations',
  '/chickens',
  '/turkeys',
  '/corporate',
  '/training/moffett',
  '/login',
  '/register',
]) {
  test(`light-page menu stays consistent with a dark logo on ${path}`, async ({ page }) => {
    await page.goto(path);
    const header = page.locator('header[data-hero-tone]').first();
    await expect(header).toHaveAttribute('data-hero-tone', 'light');
    await expect(header).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(header.locator('svg').first()).toHaveCSS('color', 'rgb(54, 47, 43)');
    await expect(header.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  });
}
test('regional orange hero shares its orange menu', async ({ page }) => {
  await page.goto('/chickens/boston');
  const header = page.locator('header[data-hero-tone]').first();
  await expect(header).toHaveAttribute('data-hero-tone', 'orange');
  await expect(header).toHaveCSS('background-color', 'rgb(255, 118, 5)');
});

test('brand fonts load when external font services are unavailable', async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => ({
    navigation: document.fonts.check('700 16px "Manrope Variable"'),
    heading: document.fonts.check('700 54px "Plus Jakarta Sans Variable"'),
  }));
  expect(loaded).toEqual({ navigation: true, heading: true });
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Home', exact: true }),
  ).toHaveCSS('font-family', /Manrope Variable/);
});
