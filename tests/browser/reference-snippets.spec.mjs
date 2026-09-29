import {test, expect} from '@playwright/test';

// Read actual imported documents, not merely hand-built highlighter fixtures.
test('lesson edition colors the CLI, platform and hosting fences in the pinned reference corpus', async ({page}) => {
  const response = await page.request.get('./reference/index.json');
  expect(response.ok()).toBe(true);
  const catalog = await response.json();
  const cases = [
    ['doc/articles/guides/raspberry-pi/raspberry-pi-intro.md', 'dotnetcli', 'bash'],
    ['doc/articles/uno-publishing-windows-packaged-unsigned.md', 'pwsh', 'powershell'],
    ['doc/articles/how-to-host-a-webassembly-app.md', 'nginx', 'nginx'],
    ['doc/articles/how-to-host-a-webassembly-app.md', 'apache', 'apache'],
    ['doc/articles/uno-development/Uno-UI-Debugging-Android-Studio.md', 'gradle', 'gradle'],
    ['doc/articles/migrating-to-uno-7.md', 'swift', 'swift'],
    ['doc/articles/uno-development/Uno-UI-Layouting-Android.md', 'mermaid', 'mermaid'],
    ['doc/articles/migrating-apps.md', 'sln', 'sln']
  ];
  for (const [path, hint, expected] of cases) {
    const document = catalog.documents.find(item => item.path === path);
    expect(document, path + ' must be present at the pinned revision').toBeTruthy();
    await page.goto('./#/document/' + document.id);
    const code = page.locator(`.document-prose pre code[data-language="${hint}"]`).first();
    await expect(code).toBeVisible();
    const source = await code.textContent();
    await expect(code).toHaveAttribute('data-colored', expected, {timeout: 20000});
    expect(await code.textContent()).toBe(source);
    await expect(code.locator('img,script,iframe')).toHaveCount(0);
  }
});
