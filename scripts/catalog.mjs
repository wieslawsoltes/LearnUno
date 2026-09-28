import { readdir, readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
export async function buildCatalog() {
  const lock = JSON.parse(await readFile('sources.lock.json', 'utf8'));
  const root = process.env.UNO_SOURCE || '.sources/uno';
  const output = 'dist/reference';
  await mkdir(output + '/documents', { recursive: true });
  const docs = [], samples = [], xrefs = {};
  async function walk(folder, visit) {
    for (const entry of (await readdir(folder, { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) await walk(file, visit); else await visit(file);
    }
  }
  if (existsSync(path.join(root, 'doc'))) {
    await walk(path.join(root, 'doc'), async file => {
      if (!/\.md$/i.test(file)) return;
      const relative = path.relative(root, file).split(path.sep).join('/');
      const body = await readFile(file, 'utf8');
      const id = createHash('sha256').update(relative).digest('hex').slice(0, 20);
      const title = body.match(/^#\s+(.+)$/m)?.[1]?.replace(/[*`]/g, '').trim() || path.basename(file, '.md').replaceAll('-', ' ');
      const uid = body.match(/^uid:\s*(.+)$/m)?.[1]?.trim();
      if (uid) xrefs[uid] = id;
      const words = body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]*>/g, ' ').replace(/[#*`\[\]()>]/g, ' ').replace(/\s+/g, ' ').trim();
      docs.push({ id, title, path: relative, category: relative.split('/')[2] || 'Overview', excerpt: words.slice(0, 230), search: words.slice(0, 5000).toLowerCase(), bytes: Buffer.byteLength(body), url: `https://github.com/${lock.repository}/blob/${lock.revision}/${relative}` });
      await writeFile(`${output}/documents/${id}.json`, JSON.stringify({ title, path: relative, markdown: body, revision: lock.revision }));
    });
    for (const filename of ['LICENSE', 'LICENSE.md', 'NOTICE', 'NOTICE.md']) if (existsSync(path.join(root, filename))) await cp(path.join(root, filename), path.join(output, filename + '.txt'));
    if (existsSync(path.join(root, 'src'))) await walk(path.join(root, 'src'), async file => {
      if (!/\.(cs|xaml)$/i.test(file)) return;
      const relative = path.relative(root, file).split(path.sep).join('/');
      samples.push({ path: relative, name: path.basename(file), kind: relative.includes('SamplesApp') ? 'sample' : relative.includes('Tests') ? 'test' : 'implementation', url: `https://github.com/${lock.repository}/blob/${lock.revision}/${relative}` });
    });
  } else if (process.env.REQUIRE_SOURCES === '1') throw new Error('Pinned Uno source checkout is missing; refusing to publish an empty reference library.');
  await writeFile(output + '/index.json', JSON.stringify({ ...lock, count: docs.length, documents: docs, xrefs }));
  await writeFile(output + '/source-index.json', JSON.stringify(samples));
  console.log(`Reference library: ${docs.length} full Markdown documents and ${samples.length} source/sample/test paths.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await buildCatalog();
