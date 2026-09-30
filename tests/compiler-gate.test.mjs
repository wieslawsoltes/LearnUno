import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, chmodSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const script = fileURLToPath(new URL('../scripts/compile-lessons.sh', import.meta.url));
for (const status of [0, 23]) test(`compiler gate preserves exit ${status} and its report through tee`, {skip: process.platform === 'win32'}, t => {
  const directory = mkdtempSync(path.join(tmpdir(), 'learnuno-compiler-gate-'));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  const compiler = path.join(directory, 'dotnet');
  const message = status ? 'Fixture compiler rejected the source.' : 'Fixture compiler accepted the source.';
  writeFileSync(compiler, `#!/bin/sh\nprintf '%s\\n' '${message}'\nprintf '%s\\n' 'Compiler diagnostic stream.' >&2\nexit ${status}\n`);
  chmodSync(compiler, 0o755);
  const report = path.join(directory, 'reports with spaces', 'result.log');
  const result = spawnSync('bash', [script, 'metadata with spaces.dll', 'lessons.json', report], {
    encoding: 'utf8', env: {...process.env, PATH: directory + path.delimiter + process.env.PATH}
  });
  assert.ifError(result.error);
  assert.equal(result.status, status, result.stderr);
  assert.match(result.stdout, new RegExp(message.replaceAll('.', '\\.')));
  assert.equal(readFileSync(report, 'utf8'), result.stdout);
  assert.match(result.stdout, /Compiler diagnostic stream/);
});
test('compiler gate rejects missing arguments before starting the compiler', {skip: process.platform === 'win32'}, () => {
  const result = spawnSync('bash', [script], {encoding: 'utf8'});
  assert.equal(result.status, 64);
  assert.match(result.stderr, /Usage:/);
});
