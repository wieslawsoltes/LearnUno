import {test, expect} from '@playwright/test';

test('keyboard skip link focuses lesson content without changing the route', async ({page}) => {
  await page.goto('./#/lesson/one-codebase/learn');
  await expect(page.getByRole('heading', {name: 'One codebase, many platforms'})).toBeVisible();
  const originalUrl = page.url();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', {name: 'Skip to course content'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  expect(page.url()).toBe(originalUrl);
  await expect(page.getByRole('heading', {name: 'One codebase, many platforms'})).toBeVisible();
});
