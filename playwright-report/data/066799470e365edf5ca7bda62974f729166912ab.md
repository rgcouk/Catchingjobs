# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m2_challenger_verification.spec.ts >> Milestone 2 Empirical Challenge Verification >> 2. Client Hydration Integrity & Console Error Capture >> Hydration integrity on /turkeys/unknown-outpost-404: zero hydration mismatches, zero fatal errors
- Location: tests/m2_challenger_verification.spec.ts:116:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/turkeys/unknown-outpost-404
Call log:
  - navigating to "http://localhost:3000/turkeys/unknown-outpost-404", waiting until "domcontentloaded"

```

# Test source

```ts
  48  |       // Verify no intake / triage / RTW strings exist in HTML forms or inputs
  49  |       expect(html).not.toMatch(/name=["']hasRightToWork["']/i);
  50  |       expect(html).not.toMatch(/name=["']rightToWork["']/i);
  51  |       expect(html).not.toMatch(/id=["']intake-form["']/i);
  52  |       expect(html).not.toMatch(/id=["']triage-form["']/i);
  53  |       expect(html).not.toMatch(/data-testid=["']hero-triage-form["']/i);
  54  |     });
  55  | 
  56  |     test('CH-M2-002: Interactive DOM on / contains strictly ZERO form tags, ZERO input tags, ZERO triage widgets', async ({
  57  |       page,
  58  |     }) => {
  59  |       await page.goto('/', { waitUntil: 'domcontentloaded' });
  60  |       await expect(page.locator('h1').first()).toBeVisible();
  61  | 
  62  |       // Check all possible interactive form / intake elements in hydrated DOM
  63  |       const forms = page.locator('form');
  64  |       const inputs = page.locator('input');
  65  |       const textareas = page.locator('textarea');
  66  |       const selects = page.locator('select');
  67  |       const triageWidgets = page.locator(
  68  |         '[data-testid*="triage"], [data-testid*="intake"], #intake-form, #triage-form',
  69  |       );
  70  | 
  71  |       expect(await forms.count(), 'Forms found in interactive DOM on /').toBe(0);
  72  |       expect(await inputs.count(), 'Inputs found in interactive DOM on /').toBe(0);
  73  |       expect(await textareas.count(), 'Textareas found in interactive DOM on /').toBe(0);
  74  |       expect(await selects.count(), 'Selects found in interactive DOM on /').toBe(0);
  75  |       expect(await triageWidgets.count(), 'Triage widgets found in interactive DOM on /').toBe(0);
  76  |     });
  77  | 
  78  |     test('CH-M2-003: Zero-JS DOM on / contains strictly ZERO form tags and ZERO input tags', async ({
  79  |       browser,
  80  |     }) => {
  81  |       const context = await browser.newContext({ javaScriptEnabled: false });
  82  |       const page = await context.newPage();
  83  | 
  84  |       const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  85  |       expect(response?.status()).toBe(200);
  86  | 
  87  |       const forms = page.locator('form');
  88  |       const inputs = page.locator('input');
  89  | 
  90  |       expect(await forms.count(), 'Forms found in zero-JS DOM on /').toBe(0);
  91  |       expect(await inputs.count(), 'Inputs found in zero-JS DOM on /').toBe(0);
  92  | 
  93  |       await context.close();
  94  |     });
  95  |   });
  96  | 
  97  |   // ---------------------------------------------------------------------------
  98  |   // 2. Client Hydration Integrity & Console Error Capture on Town Routes
  99  |   // ---------------------------------------------------------------------------
  100 |   test.describe('2. Client Hydration Integrity & Console Error Capture', () => {
  101 |     const testRoutes = [
  102 |       '/chickens/boston',
  103 |       '/chickens/sleaford',
  104 |       '/chickens/norwich',
  105 |       '/chickens/attleborough',
  106 |       '/chickens/hull',
  107 |       '/chickens/shrewsbury',
  108 |       '/chickens/bury-st-edmunds',
  109 |       '/turkeys/sleaford',
  110 |       '/turkeys/york',
  111 |       '/chickens/invalid-town-test',
  112 |       '/turkeys/unknown-outpost-404',
  113 |     ];
  114 | 
  115 |     for (const route of testRoutes) {
  116 |       test(`Hydration integrity on ${route}: zero hydration mismatches, zero fatal errors`, async ({
  117 |         page,
  118 |       }) => {
  119 |         const consoleErrors: string[] = [];
  120 |         const hydrationWarnings: string[] = [];
  121 |         const pageErrors: string[] = [];
  122 | 
  123 |         page.on('console', (msg) => {
  124 |           const type = msg.type();
  125 |           const text = msg.text();
  126 | 
  127 |           if (
  128 |             text.toLowerCase().includes('hydration') ||
  129 |             text.toLowerCase().includes('did not match') ||
  130 |             text.toLowerCase().includes('server-rendered html') ||
  131 |             text.toLowerCase().includes('extra attributes from the server') ||
  132 |             text.toLowerCase().includes('minified react error #418') ||
  133 |             text.toLowerCase().includes('minified react error #423') ||
  134 |             text.toLowerCase().includes('minified react error #425')
  135 |           ) {
  136 |             hydrationWarnings.push(`[${type}] ${text}`);
  137 |           }
  138 | 
  139 |           if (type === 'error') {
  140 |             consoleErrors.push(text);
  141 |           }
  142 |         });
  143 | 
  144 |         page.on('pageerror', (err) => {
  145 |           pageErrors.push(err.message || String(err));
  146 |         });
  147 | 
> 148 |         const res = await page.goto(route, { waitUntil: 'domcontentloaded' });
      |                                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/turkeys/unknown-outpost-404
  149 |         expect(res?.status()).toBeLessThan(500);
  150 | 
  151 |         // Strict assertion: zero hydration warnings
  152 |         expect(
  153 |           hydrationWarnings,
  154 |           `Hydration mismatch warnings detected on ${route}: ${hydrationWarnings.join('\n')}`,
  155 |         ).toHaveLength(0);
  156 | 
  157 |         // Strict assertion: zero uncaught page errors
  158 |         expect(
  159 |           pageErrors,
  160 |           `Uncaught page errors detected on ${route}: ${pageErrors.join('\n')}`,
  161 |         ).toHaveLength(0);
  162 | 
  163 |         // Filter out benign external / dev noise if any
  164 |         const severeConsoleErrors = consoleErrors.filter(
  165 |           (err) =>
  166 |             !err.includes('Clerk:') &&
  167 |             !err.includes('publishableKey') &&
  168 |             !err.includes('favicon.ico') &&
  169 |             !err.includes('Failed to load resource'),
  170 |         );
  171 |         expect(
  172 |           severeConsoleErrors,
  173 |           `Severe console errors detected on ${route}: ${severeConsoleErrors.join('\n')}`,
  174 |         ).toHaveLength(0);
  175 |       });
  176 |     }
  177 |   });
  178 | 
  179 |   // ---------------------------------------------------------------------------
  180 |   // 3. Interactive Navigation Transitions
  181 |   // ---------------------------------------------------------------------------
  182 |   test.describe('3. Interactive Navigation Transitions & Routing Flow', () => {
  183 |     test('CH-M2-004: Seamless multi-tier client transitions: / -> /chickens -> /chickens/boston -> back to /chickens -> /turkeys/sleaford', async ({
  184 |       page,
  185 |     }) => {
  186 |       // 1. Start at National Hub
  187 |       await page.goto('/', { waitUntil: 'domcontentloaded' });
  188 |       await expect(page.locator('h1').first()).toContainText('Honest work.');
  189 | 
  190 |       // 2. Click "Explore Chicken Catching"
  191 |       const chickenExplore = page.locator('a[href="/chickens"]').first();
  192 |       await expect(chickenExplore).toBeVisible();
  193 |       await chickenExplore.click();
  194 |       await page.waitForURL('**/chickens');
  195 |       expect(page.url()).toContain('/chickens');
  196 |       await expect(page.locator('h1').first()).toContainText('Chicken Catching');
  197 | 
  198 |       // 3. Click on Boston town link
  199 |       const bostonLink = page.locator('a[href="/chickens/boston"]').first();
  200 |       await expect(bostonLink).toBeVisible();
  201 |       await bostonLink.click();
  202 |       await page.waitForURL('**/chickens/boston');
  203 |       expect(page.url()).toContain('/chickens/boston');
  204 |       await expect(page.locator('h1').first()).toContainText('Boston');
  205 |       await expect(page.locator('text=Boston Catching Area').first()).toBeVisible();
  206 | 
  207 |       // 4. Click Back to Sector button
  208 |       const backBtn = page.locator('#btn-region-back');
  209 |       await expect(backBtn).toBeVisible();
  210 |       await backBtn.click();
  211 |       await page.waitForURL('**/chickens');
  212 |       expect(page.url()).toContain('/chickens');
  213 | 
  214 |       // 5. Navigate to Turkey sector via navbar
  215 |       const turkeyNavBtn = page.locator('button:has-text("Turkeys")').first();
  216 |       await turkeyNavBtn.click();
  217 |       await page.waitForURL('**/turkeys');
  218 |       expect(page.url()).toContain('/turkeys');
  219 |       await expect(page.locator('h1').first()).toContainText('Turkey Catching');
  220 | 
  221 |       // 6. Click on Sleaford town link
  222 |       const sleafordLink = page.locator('a[href="/turkeys/sleaford"]').first();
  223 |       await expect(sleafordLink).toBeVisible();
  224 |       await sleafordLink.click();
  225 |       await page.waitForURL('**/turkeys/sleaford');
  226 |       expect(page.url()).toContain('/turkeys/sleaford');
  227 |       await expect(page.locator('h1').first()).toContainText('Sleaford');
  228 | 
  229 |       // 7. Test Browser Back and Forward History
  230 |       await page.goBack();
  231 |       await page.waitForURL('**/turkeys');
  232 |       expect(page.url()).toContain('/turkeys');
  233 | 
  234 |       await page.goForward();
  235 |       await page.waitForURL('**/turkeys/sleaford');
  236 |       expect(page.url()).toContain('/turkeys/sleaford');
  237 |       await expect(page.locator('h1').first()).toContainText('Sleaford');
  238 |     });
  239 | 
  240 |     test('CH-M2-005: 404 fallback routing and recovery transition to National Hub', async ({
  241 |       page,
  242 |     }) => {
  243 |       await page.goto('/chickens/nonexistent-corridor-999', { waitUntil: 'domcontentloaded' });
  244 | 
  245 |       // Verifies fallback UI renders
  246 |       await expect(
  247 |         page.locator('text=/Catching Location Not Found|Location Not Found/i').first(),
  248 |       ).toBeVisible();
```