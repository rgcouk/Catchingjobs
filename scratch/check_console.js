import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  
  console.log("Checking /login...");
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scratch/login.png' });
  
  console.log("Checking /admin...");
  await page.goto('http://localhost:3000/admin');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scratch/admin.png' });
  
  await browser.close();
})();
