import {test, expect} from '@playwright/test';

test('lesson edition recolors inferred grammar and language-only changes without altering source', async ({page}) => {
  await page.goto('./#/fundamentals/values-and-identity');
  await page.evaluate(() => {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.id = 'grammar-probe';
    code.textContent = 'var count = 3;';
    pre.append(code);
    document.querySelector('#main').append(pre);
  });
  const code = page.locator('#grammar-probe');
  await expect(code).toHaveAttribute('data-colored', 'csharp');
  await code.evaluate(node => { node.textContent = '<TextBlock Text="A new grammar" />'; });
  await expect(code).toHaveAttribute('data-colored', 'xml');
  await expect(code.locator('.hljs-name')).toHaveText('TextBlock');
  const original = await code.textContent();
  await code.evaluate(node => { node.dataset.language = 'plaintext'; });
  await expect(code).toHaveAttribute('data-colored', 'plaintext');
  await expect(code.locator('span')).toHaveCount(0);
  expect(await code.textContent()).toBe(original);
  await code.evaluate(node => { delete node.dataset.language; node.classList.add('language-xml'); });
  await expect(code).toHaveAttribute('data-colored', 'xml');
  expect(await code.textContent()).toBe(original);
});
