import {readdir, readFile, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {brotliCompressSync, gzipSync} from 'node:zlib';

/** Generated Uno configuration contains root-absolute dependency URLs. Relocate it, not the sandbox. */
export function relocateConfiguration(config, moduleUrl) {
  const packageUrl = new URL('.', moduleUrl);
  const oldPrefix = config.uno_app_base.replace(/\/+$/, '') + '/';
  config.uno_dependencies = (config.uno_dependencies || []).map(dependency => {
    if (!dependency.startsWith(oldPrefix)) throw new Error('Unexpected Uno dependency outside its package: ' + dependency);
    return new URL(dependency.slice(oldPrefix.length), packageUrl).href;
  });
  config.uno_app_base = packageUrl.href.replace(/\/$/, '');
  config.environmentVariables ||= {};
  config.environmentVariables.UNO_BOOTSTRAP_APP_BASE = packageUrl.pathname.split('/').filter(Boolean).at(-1);
  config.environmentVariables.UNO_BOOTSTRAP_WEBAPP_BASE_PATH = new URL('../', moduleUrl).pathname;
  return config;
}

export async function relocateRuntime(root) {
  let patched = 0;
  const marker = '// LearnUno relocatable BrowserEmbedded configuration';
  async function walk(directory) {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.name === 'uno-config.js') {
        let source = await readFile(file, 'utf8');
        if (!source.includes(marker)) {
          source += '\n' + marker + '\n(' + relocateConfiguration.toString() + ')(config, import.meta.url);\n';
          await writeFile(file, source);
          if (existsSync(file + '.br')) await writeFile(file + '.br', brotliCompressSync(Buffer.from(source)));
          if (existsSync(file + '.gz')) await writeFile(file + '.gz', gzipSync(Buffer.from(source)));
        }
        patched++;
      }
    }
  }
  await walk(root);
  if (patched !== 1) throw new Error(`Expected one Uno bootstrap configuration, found ${patched}.`);
}
