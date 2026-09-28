import {test, expect} from '@playwright/test';

test('Roslyn hover, local definitions, formatting and signatures use real semantic services', async ({page}) => {
  await page.goto('./#/playground/csharp-essentials');
  await page.evaluate(() => window.learnUnoLab.start());
  const call = payload => page.evaluate(request => window.learnUnoLab.request(request), payload);
  const code = 'using Microsoft.UI.Xaml.Controls; class Example { void M() { var title = new TextBlock(); title.Text = "Hello"; } }';
  const position = code.indexOf('title.Text');
  const hover = await call({method: 'hover', language: 'csharp', code, position});
  expect(hover.text).toContain('TextBlock');
  const definition = await call({method: 'definition', language: 'csharp', code, position});
  expect(definition.start).toBe(code.indexOf('title ='));
  const formatted = await call({method: 'format', language: 'csharp', code});
  expect(formatted.text).toContain('title.Text = "Hello"');
  expect(formatted.text).toContain('\n');
  const invocation = 'using System; class Example { void M() { Math.Clamp(2, 0, 10); } }';
  const signature = await call({method: 'signature', language: 'csharp', code: invocation, position: invocation.indexOf('2,') + 2});
  expect(signature.signatures.some(item => item.label.includes('Clamp'))).toBeTruthy();
  expect(signature.activeParameter).toBe(1);
  await test.info().attach('language-services', {body: JSON.stringify({hover, definition, signature}, null, 2), contentType: 'application/json'});
});
