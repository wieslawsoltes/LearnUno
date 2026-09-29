import test from 'node:test';
import assert from 'node:assert/strict';
import {colorCode, languageFor, languages} from '../site/src/coloring/engine.mjs';

function textOf(html) {
  return html.replace(/<\/?span\b[^>]*>/g, '').replace(/&(?:amp|lt|gt|quot|#x27|#39);/g,
    entity => ({'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'", '&#39;': "'"}[entity]));
}
const fixtures = [
  ['dotnetcli', 'bash', 'dotnet publish -c Release # publish the actual target'],
  ['pwsh', 'powershell', '$target = "browserwasm"\nWrite-Output $target'],
  ['nginx', 'nginx', 'server { listen 443; location / { try_files $uri $uri/ =404; } }'],
  ['apache', 'apache', '<IfModule mod_mime.c>\n  AddType application/wasm .wasm\n</IfModule>'],
  ['gradle', 'gradle', 'plugins { id "com.android.application" }\ndependencies { implementation "example:library:1.0" }'],
  ['swift', 'swift', 'import Foundation\nlet title: String = "Uno"\nfunc greet() -> String { return title }'],
  ['mermaid', 'mermaid', 'flowchart LR\n  State["State"] --> View["View"]\n  %% Source only; no diagram script is executed.'],
  ['sln', 'sln', 'Microsoft Visual Studio Solution File, Format Version 12.00\n# Visual Studio Version 17\nGlobal\nEndGlobal']
];
for (const [hint, language, code] of fixtures) test('reference fence coloring: ' + hint, () => {
  const result = colorCode(code, hint);
  assert.equal(result.language, language);
  assert.match(result.html, /hljs-/);
  assert.equal(textOf(result.html), code);
});
test('all registered reference grammars preserve hostile markup as text', () => {
  for (const language of ['apache', 'nginx', 'gradle', 'swift', 'mermaid', 'sln']) {
    const code = '</code><img src=x onerror="alert(1)"><script>alert(1)</script>\n"quotes" & <tags>';
    const result = colorCode(code, language);
    assert.equal(result.language, language);
    assert.equal(textOf(result.html), code);
    assert.doesNotMatch(result.html, /<(?:img|script|code)\b/i);
  }
});
test('logs, file lists and unsupported fences explicitly remain plaintext', () => {
  for (const hint of ['plain', 'paths', 'output', 'uri', 'schema', 'resources', 'error', 'unknown-format']) {
    assert.equal(languageFor('Output is not necessarily C# source.', hint), 'plaintext');
  }
  assert.equal(new Set(languages).size, 26);
});
