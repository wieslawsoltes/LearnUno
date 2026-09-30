import {test, expect} from '@playwright/test';

// This release-only test intentionally requires the complete Uno artifact.
// Its title is outside the interface workflow's UI-test name filters.
test('release artifact matches the source revision and current presentation assets', async ({page}) => {
  const expected = process.env.GITHUB_SHA;
  const readManifest = async () => {
    const suffix = expected ? '?revision=' + encodeURIComponent(expected) : '';
    const response = await page.request.get('./build.json' + suffix);
    expect(response.ok()).toBe(true);
    return response.json();
  };
  if (expected) {
    await expect.poll(async () => (await readManifest()).commit,
      {timeout: 60000, intervals: [1000, 2000, 5000]}).toBe(expected);
  }
  const manifest = await readManifest();
  expect(manifest.runtime).toBe(true);
  expect(manifest.lessons).toBe(90);
  expect(manifest.designLessons).toBe(12);
  await page.goto('./#/lesson/grid-sizing/learn');
  await expect(page.locator('html')).toHaveAttribute('data-fluent', 'true');
  await expect(page.locator('.study-main')).toBeVisible();
  const style = await page.request.get('./design/fluent.css');
  expect(style.ok()).toBe(true);
  expect(await style.text()).toContain('scroll-margin-top');
  await test.info().attach('release-provenance', {
    body: JSON.stringify(manifest, null, 2), contentType: 'application/json'
  });
});
