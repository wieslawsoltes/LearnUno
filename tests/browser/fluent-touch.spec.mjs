import {test, expect} from '@playwright/test';

// Coarse-pointer Chromium emulation; not a claim of physical iOS/Safari testing.
test('Fluent touch targets and portrait/landscape layouts remain usable', async ({browser, baseURL}) => {
  const context = await browser.newContext({
    baseURL, viewport: {width: 393, height: 852}, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const fits = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  try {
    await page.goto('./#/lesson/grid-sizing/learn');
    await expect(page.locator('.study-main')).toBeVisible();
    expect(await page.evaluate(() => matchMedia('(pointer:coarse)').matches)).toBe(true);
    const opener = page.getByRole('button', {name: 'Toggle navigation', exact: true});
    const box = await opener.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await opener.tap();
    const drawer = page.getByRole('dialog', {name: 'Course navigation', exact: true});
    await expect(drawer).toBeVisible();
    const targets = await drawer.locator('.main-nav a').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
    expect(targets).toHaveLength(12);
    expect(targets.every(height => height >= 44)).toBe(true);
    await drawer.getByRole('button', {name: 'Close navigation', exact: true}).tap();
    await page.locator('.chapter-contents > summary').tap();
    await page.locator('.study-outline [data-study-jump="step-1"]').tap();
    await expect(page.locator('#study-grid-sizing-step-1')).toBeFocused();
    await fits();
    await page.screenshot({path: 'artifacts/evidence/fluent-touch-portrait.png'});
    await page.setViewportSize({width: 852, height: 393});
    await fits();
    await opener.tap();
    await expect(drawer).toBeVisible();
    const size = await drawer.boundingBox();
    expect(size.height).toBeLessThanOrEqual(393);
    await drawer.getByRole('button', {name: 'Close navigation', exact: true}).tap();
    expect(await page.locator('.page-shell').evaluate(node => node.inert)).toBe(false);
    await fits();
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});
