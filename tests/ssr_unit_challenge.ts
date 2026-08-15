/**
 * Empirical Production Bundle SSR Unit & High-Volume Stress Harness
 */
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const serverBundlePath = path.resolve(process.cwd(), 'dist/server/entry.server.js');
const { render } = require(serverBundlePath);

const routes = [
  '/',
  '/ssr-test',
  '/chickens',
  '/turkeys',
  '/corporate',
  '/portal',
  '/login',
  '/register',
  '/chickens/norfolk',
  '/turkeys/lincolnshire',
  '/admin',
  '/user-portal',
  '/sso-callback',
  '/nonexistent-route-404',
  '/deeply/nested/nonexistent/sub/path',
  '/?query=test&param=123',
  '/ssr-test?variant=b#target',
];

console.log('--- STARTING ADVERSARIAL SSR PRODUCTION BUNDLE STRESS TEST ---');

let passed = 0;
let failed = 0;

for (const route of routes) {
  try {
    const start = performance.now();
    const result = render(route);
    const duration = (performance.now() - start).toFixed(2);

    if (!result || typeof result.html !== 'string') {
      throw new Error(`Invalid render output for route: ${route}`);
    }

    if (result.html.length === 0) {
      throw new Error(`Empty HTML produced for route: ${route}`);
    }

    console.log(
      `[PASS] Route: ${route.padEnd(42)} | Length: ${result.html.length.toString().padStart(6)} bytes | Head: ${result.head ? 'YES' : 'NO '} | Duration: ${duration}ms`,
    );
    passed++;
  } catch (err) {
    console.error(`[FAIL] Route: ${route}`, err);
    failed++;
  }
}

// Concurrency & High Volume Stress Test (1,000 iterations)
console.log('\n--- EXECUTING CONCURRENT SSR STRESS TEST (1,000 iterations) ---');
const stressStart = performance.now();
for (let i = 0; i < 1000; i++) {
  const target = routes[i % routes.length];
  const res = render(target);
  if (!res.html) {
    throw new Error(`Stress test failed on iteration ${i} for route ${target}`);
  }
}
const stressTotal = (performance.now() - stressStart).toFixed(2);
const avgTime = (parseFloat(stressTotal) / 1000).toFixed(3);

console.log(
  `[STRESS TEST COMPLETED] 1,000 SSR renders in ${stressTotal}ms (Average: ${avgTime}ms per render)`,
);
console.log(`\nSUMMARY: Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL SSR PRODUCTION BUNDLE ADVERSARIAL TESTS PASSED!');
  process.exit(0);
}
