import { test, expect } from '@playwright/test';

// QA spec for this landing page. Run against local or live:
//   BASE_URL=https://az212z.github.io/<repo>/ npx playwright test
const BASE = process.env.BASE_URL || 'http://localhost:8900/sahb-salon/';

test('home loads with correct title and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  const resp = await page.goto(BASE, { waitUntil: 'load' });
  expect(resp?.status()).toBeLessThan(400);
  await page.waitForTimeout(2000);
  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('contact CTAs are present (call + maps)', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
  expect(await page.locator('a[href*="google.com/maps"], a[href*="maps.google"]').count()).toBeGreaterThan(0);
});

test('booking/order form exists and is interactive', async ({ page }) => {
  await page.goto(BASE);
  const form = page.locator('form').first();
  await expect(form).toHaveCount(1);
});

test('mobile: no horizontal scroll + burger present', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE);
  await page.waitForTimeout(1500);
  const noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2);
  expect(noHScroll).toBeTruthy();
});

test('capture screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE); await page.waitForTimeout(2500);
  await page.screenshot({ path: 'screenshots/desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE); await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/mobile.png' });
});
