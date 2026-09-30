import {test, expect} from '@playwright/test';
import {unoControls} from './uno-controls.mjs';
import {lessons, appBuildingTrackIds, trackMap} from '../../site/src/course.mjs';
import {labMap, labForLesson} from '../../site/src/atlas/catalog.mjs';

const additions = lessons.filter(lesson => lesson.introducedIn === '0.4.0');
const byId = new Map(additions.map(lesson => [lesson.id, lesson]));

async function startRuntime(page) {
  await page.goto('./#/playground/toolkit-observable');
  await page.evaluate(() => window.learnUnoLab.start());
  return page.frameLocator('iframe[title="Real Uno WebAssembly preview"]');
}
async function execute(page, id, variant = 'code') {
  const lesson = byId.get(id);
  const result = await page.evaluate(request => window.learnUnoLab.request(request), {
    method: 'run', language: lesson.language, code: lesson[variant]
  });
  expect(result.rendered, `${id}/${variant}: ${JSON.stringify(result)}`).toBe(true);
  return result;
}

test('app-building roadmap exposes five ordered paths without changing progress', async ({page}) => {
  await page.goto('./#/app-building');
  await expect(page.locator('[data-app-track]')).toHaveCount(5);
  await expect(page.locator('[data-app-lesson]')).toHaveCount(30);
  await expect(page.locator('.app-goals article')).toHaveCount(4);
  for (const id of appBuildingTrackIds) {
    const path = trackMap.get(id);
    const section = page.locator(`[data-app-track="${id}"]`);
    for (const prerequisite of path.prerequisites) {
      await expect(section.locator(`a[href="#/path/${prerequisite}"]`)).toHaveCount(1);
    }
  }
  await page.locator('[data-app-lesson="toolkit-validation"]').click();
  await expect(page.locator('[data-chapter="toolkit-validation"]')).toBeVisible();
  await expect(page.locator('.study-package-contract')).toContainText('CommunityToolkit.Mvvm 8.4.0');
  await page.goto('./#/lesson/dependency-injection/learn');
  await expect(page.locator('.study-continue-with')).toContainText('composition root');
});

for (const lesson of additions) test('app-building chapter and unique atlas: ' + lesson.id, async ({page}) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`./#/lesson/${lesson.id}/learn`);
  await expect(page.locator(`[data-chapter="${lesson.id}"]`)).toBeVisible();
  await expect(page.locator('.study-steps > article')).toHaveCount(4);
  await expect(page.locator('.study-concepts')).toHaveCount(0);
  await expect(page.locator('.study-vocabulary dt')).toHaveCount(3);
  await expect(page.locator('.study-variation-table tbody tr')).toHaveCount(2);
  const code = page.locator('.study-code code').first();
  await code.scrollIntoViewIfNeeded();
  await expect(code).toHaveAttribute('data-colored', 'csharp');
  expect(await code.textContent()).toBe(lesson.code);
  const comparison = page.locator('[data-study-variation]');
  await comparison.click();
  await expect(page.locator('.study-infographic')).toHaveAttribute('data-variation', 'true');
  await page.goto(`./#/lesson/${lesson.id}/visualize`);
  const lab = labMap.get(labForLesson(lesson));
  await expect(page.locator('.visual-lab')).toHaveAttribute('data-lab', lab.id);
  await page.getByRole('button', {name: 'Next step', exact: true}).click();
  await expect(page.locator('#stage-title')).toHaveText(lab.steps[1][0]);
  expect(errors).toEqual([]);
});

test('app-building real controls submit search and preserve an explicit modal decision', async ({page}) => {
  const frame = await startRuntime(page);
  const controls = unoControls(page, frame);
  await execute(page, 'textbox-editing');
  const input = frame.getByRole('textbox').first();
  await input.fill('Ship the interface');
  await controls.button('Save title').click();
  await expect(frame.getByText('Saved: Ship the interface', {exact: true})).toBeVisible();
  await execute(page, 'autosuggest-search');
  const search = frame.getByRole('textbox').first();
  await search.fill('Grid');
  await search.press('Enter');
  await expect(frame.getByText('Submitted: Grid', {exact: true})).toBeVisible();
  await execute(page, 'dialog-decisions');
  await controls.button('Review delete decision').click();
  await controls.button('Keep draft').click();
  await expect(frame.getByText('Draft kept', {exact: true})).toBeVisible();
});

test('app-building actual Toolkit commands, validation, messaging and edit transactions', async ({page}) => {
  const frame = await startRuntime(page);
  const controls = unoControls(page, frame);
  await execute(page, 'toolkit-commands');
  const create = controls.button('Create task');
  await create.expectEnabled(false);
  await frame.getByRole('textbox').first().fill('ab');
  await create.expectEnabled(false);
  await frame.getByRole('textbox').first().fill('abc');
  await create.expectEnabled(true);
  await create.click();
  await expect(frame.getByText('Created: abc', {exact: true})).toBeVisible();

  await execute(page, 'toolkit-validation');
  await frame.getByRole('textbox').first().fill('A');
  await expect(frame.getByText('Ready to submit', {exact: true})).toHaveCount(0);
  await frame.getByRole('textbox').first().fill('Valid workspace');
  await expect(frame.getByText('Ready to submit', {exact: true})).toBeVisible();

  await execute(page, 'toolkit-messaging');
  await controls.button('Deactivate recipient').click();
  await controls.button('Send typed notice').click();
  await expect(frame.getByText('No notice received', {exact: true})).toBeVisible();
  await execute(page, 'toolkit-messaging');
  await controls.button('Send typed notice').click();
  await expect(frame.getByText('Task changed', {exact: true})).toBeVisible();

  await execute(page, 'mvvm-drafts');
  const draft = frame.getByRole('textbox').first();
  await draft.fill('Unsaved title');
  await controls.button('Discard edits').click();
  await expect(draft).toHaveValue('Original title');
  await draft.fill('  Saved edit  ');
  await controls.button('Commit draft').click();
  await expect(draft).toHaveValue('Saved edit');
  await controls.button('Discard edits').expectEnabled(false);
});

test('app-building actual AsyncRelayCommand cooperates with cancellation and can run again', async ({page}) => {
  const frame = await startRuntime(page);
  const controls = unoControls(page, frame);
  await execute(page, 'toolkit-async-command', 'solution');
  const load = controls.button('Load task list');
  const cancel = controls.button('Cancel load');
  await load.click();
  await cancel.expectEnabled(true);
  await cancel.click();
  await expect(frame.getByText('Cancelled', {exact: true})).toBeVisible();
  await load.expectEnabled(true);
  await load.click();
  await expect(frame.getByText('Loaded', {exact: true})).toBeVisible();
  await cancel.expectEnabled(false);
});

test('app-building real navigation history and request-local results', async ({page}) => {
  const frame = await startRuntime(page);
  const controls = unoControls(page, frame);
  await execute(page, 'frame-history');
  const back = controls.button('Go back');
  const open = controls.button('Open another page');
  await back.expectEnabled(false);
  await open.click();
  await expect(frame.getByText('Visit 1', {exact: true})).toBeVisible();
  await open.click();
  await expect(frame.getByText('Back entries: 1', {exact: true})).toBeVisible();
  await back.click();
  await expect(frame.getByText('Visit 1', {exact: true})).toBeVisible();
  await back.expectEnabled(false);

  await execute(page, 'navigation-results');
  const choose = controls.button('Choose workspace');
  await choose.click();
  await controls.button('Cancel picker').click();
  await expect(frame.getByText('Picker cancelled', {exact: true})).toBeVisible();
  await choose.click();
  await controls.button('Use workspace').click();
  await expect(frame.getByText('Chosen: Design', {exact: true})).toBeVisible();
  await choose.expectEnabled(true);
});

test('app-building real DI validates ownership, captures, decoration and options', async ({page}) => {
  await startRuntime(page);
  const cases = [
    ['scope-ownership', 'code', ['Same within scope: True', 'First disposed: True', 'Different session: True']],
    ['scope-ownership', 'solution', ['Same within scope: False', 'First disposed: True']],
    ['captive-dependencies', 'code', ['Graph rejected']],
    ['captive-dependencies', 'solution', ['Graph accepted']],
    ['service-decorators', 'code', ['Underlying reads: 1']],
    ['service-decorators', 'solution', ['Underlying reads: 2']],
    ['options-validation', 'code', ['Configuration rejected']],
    ['options-validation', 'solution', ['Validated page size: 50']]
  ];
  for (const [id, variant, expected] of cases) {
    const result = await execute(page, id, variant);
    for (const text of expected) expect(result.text).toContain(text);
  }
});

test('app-building roadmap and chapters are readable on mobile in both themes', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('./#/app-building');
  await expect(page.locator('[data-app-track]')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.goto('./#/lesson/scope-ownership/learn');
  await expect(page.locator('[data-chapter="scope-ownership"]')).toBeVisible();
  await page.getByRole('button', {name: 'Switch color theme'}).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.locator('.study-outline [data-study-jump="step-2"]').click();
  await expect(page.locator('#study-scope-ownership-step-2')).toBeFocused();
  await page.screenshot({path: 'artifacts/evidence/app-building-mobile.png', fullPage: true});
});
