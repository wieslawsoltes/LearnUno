import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {lessons} from '../site/src/course.mjs';
import {labMap, labForLesson} from '../site/src/atlas/catalog.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
export function codeFences(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const blocks = []; let start = -1, language = '', fence = '';
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^\s*(`{3,}|~{3,})([\w#+.-]*)\s*$/);
    if (!match) continue;
    if (start < 0) { start = i + 1; language = match[2] || 'plaintext'; fence = match[1]; }
    else if (match[1][0] === fence[0] && match[1].length >= fence.length) {
      const code = lines.slice(start, i).join('\n');
      if (code.trim()) blocks.push({code, language, startLine: start + 1, endLine: i});
      start = -1;
    }
  }
  return blocks;
}
export function sourceUrl(lock, file, start, end) {
  const base = `https://github.com/${lock.repository}/blob/${lock.revision}/${file.split('/').map(encodeURIComponent).join('/')}`;
  return start ? `${base}#L${start}-L${end || start}` : base;
}
function assertSafePath(file) {
  if (typeof file !== 'string' || !/^(doc|src)\//.test(file) || file.split('/').some(p => p === '..' || p === '.') || file.includes('\\')) throw new Error('Invalid pinned source path: ' + file);
}
function excerptDocument(text, file) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const heading = lines.findIndex(line => /^#{1,3}\s+/.test(line));
  const title = heading >= 0 ? lines[heading].replace(/^#+\s*/, '').trim() : path.basename(file, '.md').replace(/^include-/, '').replaceAll('-', ' ');
  let bodyStart = heading >= 0 ? heading + 1 : 0;
  if (lines[bodyStart]?.trim() === '---') {
    const end = lines.findIndex((line, index) => index > bodyStart && line.trim() === '---');
    if (end >= 0) bodyStart = end + 1;
  }
  let inFence = false;
  while (bodyStart < lines.length) {
    const line = lines[bodyStart];
    if (/^\s*(`{3,}|~{3,})/.test(line)) { inFence = !inFence; bodyStart++; continue; }
    if (inFence || !line.trim() || /^#+\s/.test(line)) { bodyStart++; continue; }
    break;
  }
  let end = bodyStart;
  while (end < lines.length && end < bodyStart + 18 && !/^\s*(`{3,}|~{3,})|^#{1,3}\s/.test(lines[end])) end++;
  if (end === bodyStart) throw new Error('No readable documentation passage: ' + file);
  return {title, markdown: lines.slice(bodyStart, end).join('\n'), startLine: bodyStart + 1, endLine: end};
}
export async function buildStudyMaterial({sourceRoot = process.env.UNO_SOURCE || '.sources/uno', outputRoot = 'dist/study', strict = process.env.REQUIRE_SOURCES === '1'} = {}) {
  const lock = JSON.parse(await readFile('sources.lock.json', 'utf8'));
  const manifest = JSON.parse(await readFile('site/content/source-map.json', 'utf8'));
  if (existsSync(path.join(sourceRoot, '.git'))) {
    const head = execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
    if (head !== lock.revision) throw new Error(`Source revision mismatch: ${head} != ${lock.revision}`);
  }
  await mkdir(outputRoot, {recursive: true});
  const report = {version: 1, revision: lock.revision, lessons: [], authoredWords: 0, steps: 0, documentExcerpts: 0, codeExcerpts: 0};
  for (const lesson of lessons) {
    const file = `site/content/chapters/${lesson.id}.json`;
    if (!existsSync(file)) { if (strict) throw new Error('Missing expanded chapter: ' + lesson.id); continue; }
    const authored = JSON.parse(await readFile(file, 'utf8'));
    if (authored.id !== lesson.id || authored.steps?.length !== 4) throw new Error('Invalid chapter contract: ' + lesson.id);
    const lab = labMap.get(labForLesson(lesson));
    const selections = manifest[lesson.id];
    if (!selections?.documents?.length) throw new Error('Missing source selection: ' + lesson.id);
    const documents = [], candidates = [], snippets = [];
    for (const selection of selections.documents) {
      assertSafePath(selection.path);
      const source = path.join(sourceRoot, selection.path);
      if (!existsSync(source)) { if (strict) throw new Error('Missing Uno document: ' + selection.path); continue; }
      const raw = await readFile(source, 'utf8');
      if (selection.expectedHash && sha(raw) !== selection.expectedHash) throw new Error('Pinned document hash changed: ' + selection.path);
      const extracted = excerptDocument(raw, selection.path);
      const id = sha(selection.path).slice(0, 20);
      documents.push({...extracted, path: selection.path, id, digest: sha(raw), url: sourceUrl(lock, selection.path, extracted.startLine, extracted.endLine)});
      const fences = codeFences(raw);
      fences.forEach((fence, index) => candidates.push({...fence, path: selection.path, kind: 'Documentation example', index, digest: sha(raw)}));
    }
    if (selections.code) {
      for (const selection of selections.code) {
        assertSafePath(selection.path);
        const source = path.join(sourceRoot, selection.path);
        if (!existsSync(source)) { if (strict) throw new Error('Missing Uno code: ' + selection.path); continue; }
        const raw = await readFile(source, 'utf8');
        let item;
        if (selection.path.endsWith('.md')) {
          item = codeFences(raw)[selection.fence];
          if (!item) throw new Error(`Missing fence ${selection.fence} in ${selection.path}`);
        } else {
          const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/);
          const start = selection.startLine || 1, end = Math.min(selection.endLine || lines.length, lines.length);
          if (start < 1 || end < start || end - start > 119) throw new Error('Invalid source line selection: ' + selection.path);
          item = {code: lines.slice(start - 1, end).join('\n'), startLine: start, endLine: end, language: selection.path.endsWith('.xaml') ? 'xml' : 'csharp'};
        }
        if (selection.expectedHash && sha(item.code) !== selection.expectedHash) throw new Error('The selected code changed: ' + selection.path);
        snippets.push({...item, path: selection.path, digest: sha(raw), kind: selection.kind || (selection.path.endsWith('.md') ? 'Documentation example' : selection.path.includes('Tests') ? 'Repository test/sample' : 'Repository implementation/sample'), caption: selection.caption || 'Read this excerpt in its enclosing project context.', url: sourceUrl(lock, selection.path, item.startLine, item.endLine), codeHash: sha(item.code)});
      }
    } else {
      // Authoring fallback only. Final publication requires explicit, reviewed selections.
      for (const c of candidates.filter(c => c.code.length >= 50).slice(0, 2)) snippets.push({...c, codeHash: sha(c.code), caption: 'Pinned documentation example; supporting project context may be required.', url: sourceUrl(lock, c.path, c.startLine, c.endLine)});
      if (strict) throw new Error('Code selection has not been reviewed: ' + lesson.id);
    }
    if (strict && (!documents.length || !snippets.length)) throw new Error('Incomplete source evidence: ' + lesson.id);
    const textValues = value => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(textValues) : value && typeof value === 'object' ? Object.values(value).flatMap(textValues) : [];
    const words = textValues(authored).join(' ').trim().split(/\s+/).length;
    const chapter = {...authored, title: lesson.title, lab: lab.id, revision: lock.revision, repository: lock.repository,
      words, readingMinutes: Math.ceil(words / 180), documents, snippets,
      steps: authored.steps.map((step, index) => ({...step, index, title: lab.steps[index][0], summary: lab.steps[index][1]}))};
    await writeFile(path.join(outputRoot, lesson.id + '.json'), JSON.stringify(chapter));
    report.lessons.push({id: lesson.id, words, readingMinutes: chapter.readingMinutes, documents: documents.length, snippets: snippets.length, stepWords: chapter.steps.map(s => (s.explain + ' ' + s.worked + ' ' + s.question + ' ' + s.answer).split(/\s+/).length)});
    report.authoredWords += words; report.steps += chapter.steps.length; report.documentExcerpts += documents.length; report.codeExcerpts += snippets.length;
  }
  await writeFile(path.join(outputRoot, 'index.json'), JSON.stringify(report));
  console.log(`Study chapters: ${report.lessons.length}, expanded steps: ${report.steps}, source excerpts: ${report.documentExcerpts} docs / ${report.codeExcerpts} code.`);
  return report;
}
