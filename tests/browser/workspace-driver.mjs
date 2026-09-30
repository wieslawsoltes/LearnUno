import {expect} from '@playwright/test';

/** Prepare code through the editor API, but run it through the learner's UI path.
 * A raw transport request deliberately does not select the mobile preview pane.
 */
export async function runWorkspaceCode(page, code) {
  await page.waitForFunction(() => !!window.learnUnoLab);
  await page.evaluate(source => window.learnUnoLab.setValue(source), code);
  const run = page.getByRole('button', {name: 'Run code', exact: false});
  await run.click();
  // The restored Run label is set in finally, after success/error presentation.
  await expect(run).toBeEnabled({timeout: 120000});
  await expect(page.locator('#run-output')).toHaveClass(/success/);
  await expect(page.locator('#run-output')).toContainText('Roslyn + Uno');
  await expect(page.locator('.preview-pane')).toBeVisible();
  return page.frameLocator('iframe[title="Real Uno WebAssembly preview"]');
}
