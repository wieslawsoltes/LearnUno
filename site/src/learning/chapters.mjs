import {installChapterNavigation} from '../presentation/chapter-navigation.mjs';
import {lessonMap} from '../course.mjs';
import {$, $$, escapeHtml as h, inline, markdown, icon} from '../helpers.mjs';
import {labMap, labForLesson} from '../atlas/catalog.mjs';
import {scene} from '../atlas/scenes.mjs';
import {phaseOverlay} from '../atlas/phase-focus.mjs';

// Each chapter is a separate build artifact; reading does not load Monaco or Uno.
const chapters = new Map();
export function loadChapter(id) {
  if (!/^[a-z0-9-]+$/.test(id)) return Promise.reject(new Error('Invalid chapter identifier.'));
  if (!chapters.has(id)) {
    const pending = fetch(new URL(`./study/${id}.json`, document.baseURI))
      .then(async response => {
        if (!response.ok) throw new Error(`Chapter unavailable (${response.status}).`);
        const text = await response.text();
        if (text.length > 2_000_000) throw new Error('Chapter exceeds the supported content limit.');
        const chapter = JSON.parse(text);
        if (chapter.id !== id || chapter.steps?.length !== 4 || !Array.isArray(chapter.documents) || !Array.isArray(chapter.snippets)) throw new Error('Invalid chapter content.');
        return chapter;
      }).catch(error => { chapters.delete(id); throw error; });
    chapters.set(id, pending);
    while (chapters.size > 16) chapters.delete(chapters.keys().next().value);
  }
  return chapters.get(id);
}
const paragraph = value => `<p>${inline(value)}</p>`;
const code = (value, language, title, note = '') => `<figure class="study-code"><figcaption><span>${icon('code', 15)} ${h(title)}</span><span>${h(language === 'xml' ? 'XAML / XML' : language)}</span></figcaption>${note ? `<p class="study-code-note">${h(note)}</p>` : ''}<pre><code data-language="${h(language)}">${h(value)}</code></pre></figure>`;
const external = (url, label, cls = '') => `<a class="${cls}" href="${h(url)}" target="_blank" rel="noopener noreferrer">${h(label)} ↗</a>`;
const sectionId = (id, key) => `study-${id}-${key}`;
const stepsOf = c => c.steps.map((s, index) => [s.title, s.summary, index]);

/** Find a real outcome-changing input; never offer a comparison that only resets the model. */
export function comparisonFor(lab) {
  const initial = {...lab.defaults, revision: 0, trace: [], status: 'idle', sequence: 0};
  const fingerprint = state => {
    const output = scene(lab, state, 0);
    return JSON.stringify({data: output.data, metrics: output.metrics});
  };
  const before = fingerprint(initial);
  const candidates = (lab.presets || []).map(([name, patch]) => ({name, patch}));
  for (const c of lab.controls) {
    const values = c.type === 'toggle' ? [!c.value] : c.type === 'select' ? c.options : c.type === 'range' ? [c.min, c.max] : [c.value + ' changed', ''];
    for (const value of values) if (value !== c.value) candidates.push({name: `${c.label}: ${c.value} → ${value}`, patch: {[c.key]: value}});
  }
  return candidates.find(candidate => fingerprint({...initial, ...candidate.patch}) !== before) || null;
}

/** Generated diagrams use controlled, escaped SVG primitives authored in the atlas. */
export function renderChapter(chapter, lesson) {
  const primaryLinks=(chapter.references||[]).filter(item=>{
    try { const u=new URL(item.url); return u.protocol==='https:' && ['learn.microsoft.com','platform.uno'].includes(u.hostname); } catch { return false; }
  });
  const continueWith=(chapter.continueWith||[]).filter(item=>lessonMap.has(item.id));

  const lab = labMap.get(labForLesson(lesson));
  const jump = (key, label) => `<button type="button" data-study-jump="${key}">${h(label)}</button>`;
  const heading = (key, eyebrow, title) => `<header class="study-section-heading" id="${sectionId(lesson.id, key)}" tabindex="-1"><span class="eyebrow">${h(eyebrow)}</span><h2>${h(title)}</h2></header>`;
  const sourceCard = (item, index) => `<section class="study-source" id="${sectionId(lesson.id, 'source-' + index)}"><div class="study-source-heading"><span class="study-source-number">S${index + 1}</span><div><span class="eyebrow">${h(item.kind)} · UPSTREAM, NOT A STANDALONE LAB</span><h3>${h(item.path.split('/').at(-1))}</h3></div></div>${paragraph(item.caption)}${code(item.code, item.language, `Pinned excerpt · lines ${item.startLine}–${item.endLine}`, 'Unmodified source excerpt, normalized to LF line endings. Supporting types, packages and project context may be required.')}<div class="study-source-links">${external(item.url, 'Read these lines in Uno')}<span>Apache-2.0 · ${h(chapter.revision.slice(0, 12))}</span></div><details class="study-provenance"><summary>Source integrity and enclosing file</summary><dl><dt>Repository path</dt><dd>${h(item.path)}</dd><dt>Full source SHA-256</dt><dd>${h(item.digest)}</dd><dt>Excerpt SHA-256</dt><dd>${h(item.codeHash)}</dd></dl></details></section>`;
  const blocks = [
    ['overview', 'Start with the problem'], ['model', 'See the mechanism'], ['steps', 'Four guided steps'],
    ['example', 'Read the runnable example'], ['sources', 'Study the Uno source'], ['practice', 'Practice and explain']
  ];
  return `<div class="study-layout" data-chapter="${h(lesson.id)}"><article class="study-main lesson-prose">
    <section class="study-intro" id="${sectionId(lesson.id, 'overview')}" tabindex="-1"><div class="study-intro-meta"><span class="eyebrow">A GUIDED CHAPTER · ${h(lesson.level)}</span><span>≈ ${chapter.readingMinutes} min added reading · practice at your pace</span></div><h2>Start with a real problem.</h2>${paragraph(chapter.scenario)}<div class="study-objectives">${lesson.objectives.map(item => `<span>${icon('check', 15)} ${h(item)}</span>`).join('')}</div></section>
    <dl class="study-vocabulary" aria-label="Key vocabulary">${chapter.vocabulary.map(v => `<div><dt>${h(v.term)}</dt><dd>${h(v.meaning)}</dd></div>`).join('')}</dl>
    ${lesson.introducedIn ? '' : `<div class="study-concepts">${lesson.concepts.map(([title, text], index) => `<section><span class="study-concept-number">0${index + 1}</span><div><h3>${h(title)}</h3>${paragraph(text)}</div></section>`).join('')}</div>`}
    ${heading('model', 'LINK THE IDEA TO A PICTURE', 'See the mechanism before the code.')}
    <figure class="study-infographic"><div class="study-figure-top"><strong>${h(lab.short)}</strong><span>Explanatory model · not an instrumented Uno trace</span></div><div class="study-figure-scroll"><svg class="study-scene" viewBox="0 0 800 400" role="img" aria-label="${h(lab.title)}"></svg></div><div class="study-figure-controls" role="group" aria-label="Select an explanation phase">${stepsOf(chapter).map(([title, , i]) => `<button type="button" data-study-phase="${i}" aria-pressed="${i === 0}"><span>0${i + 1}</span>${h(title)}</button>`).join('')}</div><div class="study-metrics" aria-label="Model calculations"></div><figcaption><strong class="study-model-title"></strong><p class="study-model-caption"></p></figcaption><div class="study-figure-links"><button type="button" class="secondary small" data-study-variation>Compare the controlled variation</button><a href="#/lesson/${lesson.id}/visualize">Open the full interactive experiment →</a></div><details class="study-scope"><summary>Model assumptions and limits</summary><p>${h(lab.scope)}</p></details></figure>
    <section class="lesson-depth">${heading('steps', 'READ → PREDICT → TRY → EXPLAIN', lab.title)}<p class="study-step-intro">Work through these steps in order, or use the chapter outline to revisit one. Answer the question before revealing the reasoning; a correct explanation is more useful than a completion click.</p><div class="depth-steps study-steps">${chapter.steps.map((step, index) => `<article id="${sectionId(lesson.id, 'step-' + index)}" data-chapter-step="${index}" tabindex="-1"><header><span class="study-step-number">0${index + 1}</span><div><span class="eyebrow">GUIDED STEP ${index + 1} OF 4</span><h3>${h(step.title)}</h3></div><button type="button" class="text-button" data-study-show-phase="${index}">${icon('layers', 15)} See the diagram</button></header>${paragraph(step.explain)}<div class="study-worked"><strong>Try it, then explain the result.</strong>${paragraph(step.worked)}</div><details class="study-recall"><summary><span>${icon('target', 15)} Check your reasoning</span>${h(step.question)}</summary>${paragraph(step.answer)}</details><div class="study-step-links">${jump('sources', 'Compare the Uno evidence ↓')}<a href="#/lesson/${lesson.id}/visualize?step=${index}">Explore this phase interactively ↗</a></div></article>`).join('')}</div></section>
    ${heading('example', 'CONNECT THE STEPS TO WORKING CODE', 'Read the runnable example.')}
    <div class="study-prediction"><strong>Predict before running.</strong>${paragraph(lesson.predict)}</div>
    ${code(lesson.code, lesson.language, lesson.language === 'xml' ? 'Original runtime-XAML starter' : 'C# starter · Lesson.Build()', 'This is the runnable lesson source. Opening the playground preserves your saved draft; reading this copy does not execute code or overwrite your work.')}
    <div class="study-example-actions"><a class="primary" href="#/lesson/${lesson.id}/playground">Run and edit in real Uno ${icon('arrow', 17)}</a><span>${h(lesson.challenge)}</span></div>
    ${Object.keys(lesson.packages||{}).length?`<aside class="study-package-contract"><strong>Actual library dependencies</strong><p>${Object.entries(lesson.packages).map(([name,version])=>`<code data-language="plaintext">${h(name)} ${h(version)}</code>`).join(' · ')}</p><p>The updated runner and exported project declare these packages. Reading this code does not install packages or execute source generators. Project-only generator alternatives remain separately labelled.</p></aside>`:''}
    ${lesson.projectCode ? code(lesson.projectCode, '', 'Additional project-only example', lesson.projectNote) : ''}
    <aside class="study-boundary"><strong>${icon('info', 16)} Keep this boundary in mind</strong>${paragraph(lesson.pitfall)}</aside>
    ${heading('sources', 'PINNED PRIMARY MATERIAL', 'Read the evidence with a question.')}
    <div class="study-source-context">${paragraph(chapter.bridge)}<p class="study-version-note">These excerpts come from <strong>unoplatform/uno</strong> at <code data-language="plaintext">${h(chapter.revision.slice(0, 12))}</code>. The source snapshot and its examples can describe different versions or project features from the pinned online runner. Excerpts are reading material, not a claim that every fragment runs by itself.</p></div>
    ${chapter.snippets.map(sourceCard).join('')}
    <div class="study-documents"><h3>Continue in the documentation</h3>${chapter.documents.map((doc, i) => `<details class="study-document" ${i === 0 ? 'open' : ''}><summary><span>${icon('book', 16)} ${h(doc.title)}</span><small>Original documentation passage</small></summary><div class="study-document-excerpt">${markdown(doc.markdown.replace(/\[([^\]]+)\]\(xref:[^)]+\)/g, '$1'), doc.url)}</div><div class="study-source-links"><a href="#/document/${doc.id}">Read the complete imported document →</a>${external(doc.url, `Pinned lines ${doc.startLine}–${doc.endLine}`)}</div><small class="study-doc-path">${h(doc.path)}</small></details>`).join('')}</div>
    ${primaryLinks.length?`<section class="study-primary-links"><h3>Verify the library contract.</h3><p>External primary references complement the pinned Uno excerpts. Their current documentation is not part of the immutable source snapshot.</p><ul>${primaryLinks.map(item=>`<li>${external(item.url,item.title)}</li>`).join('')}</ul></section>`:''}
    ${heading('practice', 'MAKE THE KNOWLEDGE TRANSFER', 'Change one assumption at a time.')}
    <div class="study-table-scroll"><table class="study-variation-table"><caption>Controlled variations: predict first, then compare the result.</caption><thead><tr><th scope="col">Change</th><th scope="col">Expected observation</th><th scope="col">Why it happens</th></tr></thead><tbody>${chapter.cases.map(c => `<tr><th scope="row">${h(c.change)}</th><td>${h(c.expected)}</td><td>${h(c.why)}</td></tr>`).join('')}</tbody></table></div>
    <section class="study-transfer"><h3>Build a small variation of your own.</h3>${paragraph(lesson.transfer)}<div class="study-next"><a class="secondary" href="#/lesson/${lesson.id}/check">Knowledge check ${icon('arrow', 16)}</a><a href="#/lesson/${lesson.id}/notes">Save your explanation in lesson notes →</a></div><small>Reading and revealing answers do not automatically mark the lesson complete. Your existing code exercise and knowledge check remain the completion criteria.</small></section>
  ${continueWith.length?`<section class="study-continue-with"><span class="eyebrow">BUILD ON THIS FOUNDATION</span><h3>Continue into application patterns.</h3><p>Apply this chapter’s mechanism in a focused feature or service workflow.</p><ul>${continueWith.map(item=>`<li><a href="#/lesson/${item.id}/learn">${h(item.title)} →</a></li>`).join('')}</ul></section>`:''}
  </article><aside class="study-outline"><div class="study-outline-inner"><span class="eyebrow">IN THIS CHAPTER</span><nav aria-label="Chapter outline">${blocks.map(([key, title]) => `<div>${jump(key, title)}${key === 'steps' ? `<ol>${chapter.steps.map((step, index) => `<li>${jump('step-' + index, step.title)}</li>`).join('')}</ol>` : ''}</div>`).join('')}</nav><div class="study-outline-note"><strong>Read at your own pace.</strong><p>Use the diagram, predict a result, and verify it with the code. Source excerpts keep their original context and line links.</p><span>${chapter.snippets.length} code excerpts · ${chapter.documents.length} documents</span></div><a class="secondary small" href="#/lesson/${lesson.id}/playground">Open the playground ${icon('arrow', 14)}</a></div></aside></div>`;
}

export function mountChapter(root, lesson) {
  let disposed = false;
  root.innerHTML = '<div class="study-loading" role="status">Opening the guided chapter and its pinned evidence…</div>';
  const controller = new AbortController();
  const signal = controller.signal;
  loadChapter(lesson.id).then(chapter => {
    if (disposed || !root.isConnected) return;
    root.innerHTML = renderChapter(chapter, lesson);
    const lab = labMap.get(labForLesson(lesson));
    let phase = 0, varied = false;
    const baseState = () => ({...lab.defaults, revision: 0, trace: [], status: 'idle', sequence: 0});
    const comparison = comparisonFor(lab);
    const patch = comparison?.patch || {};
    if (!comparison) $('[data-study-variation]', root).hidden = true;
    function paint() {
      const state = {...baseState(), ...(varied ? patch : {})};
      const result = scene(lab, state, phase);
      $('.study-scene', root).innerHTML = result.svg + phaseOverlay(lab, state, phase);
      $$('.study-scene [data-drag="width"]', root).forEach(node => node.remove());
      $$('.study-scene text', root).forEach(node => { if (node.textContent === 'Drag the right edge →') node.textContent = 'Compare the inputs below'; if (node.textContent === '↔ drag') node.textContent = 'Bounds'; });
      // This is an illustrative snapshot: full controls belong to the atlas view.
      $$('.study-scene [tabindex]', root).forEach(node => node.removeAttribute('tabindex'));
      $$('.study-scene [role="button"],.study-scene [role="slider"]', root).forEach(node => { node.removeAttribute('role'); node.removeAttribute('aria-pressed'); });
      $('.study-metrics', root).innerHTML = result.metrics.map(m => `<div><span>${h(m.label)}</span><output>${h(m.value)} <small>${h(m.unit)}</small></output></div>`).join('');
      $('.study-model-title', root).textContent = `${varied ? 'Controlled variation' : 'Starting inputs'} · Step ${phase + 1}: ${chapter.steps[phase].title}`;
      $('.study-model-caption', root).textContent = (varied ? comparison.name + '. ' : '') + result.readout;
      $$('[data-study-phase]', root).forEach(button => button.setAttribute('aria-pressed', String(+button.dataset.studyPhase === phase)));
      $('[data-study-variation]', root).textContent = varied ? 'Return to the starting inputs' : 'Compare the controlled variation';
      $('.study-infographic', root).dataset.phase = String(phase);
      $('.study-infographic', root).dataset.variation = String(varied);
    }
    function jump(key) {
      const target = document.getElementById(sectionId(lesson.id, key));
      if (!target || !root.contains(target)) return;
      target.scrollIntoView({block: 'start', behavior: 'instant'});
      target.focus({preventScroll: true});
      $$('[data-study-jump]', root).forEach(button => { if (button.dataset.studyJump === key) button.setAttribute('aria-current', 'location'); else button.removeAttribute('aria-current'); });
    }
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || !root.contains(button)) return;
      if (button.dataset.studyJump) jump(button.dataset.studyJump);
      if (button.dataset.studyPhase !== undefined) { phase = +button.dataset.studyPhase; paint(); }
      if (button.dataset.studyShowPhase !== undefined) { phase = +button.dataset.studyShowPhase; paint(); jump('model'); }
      if (button.hasAttribute('data-study-variation')) { varied = !varied; paint(); }
    }, {signal});
    installChapterNavigation(root, signal);
    paint();
    const section = new URLSearchParams(location.hash.split('?').slice(1).join('?')).get('section');
    if (section && /^(?:overview|model|steps|example|sources|practice|step-[0-3])$/.test(section)) requestAnimationFrame(() => { if (!disposed) jump(section); });
  }).catch(error => {
    if (disposed || !root.isConnected) return;
    root.innerHTML = `<div class="study-load-error"><h2>The chapter could not be loaded.</h2><p>${h(error.message)}</p><p>Your drafts, notes and progress have not changed.</p><button class="secondary" type="button" data-study-retry>Try again</button><a href="#/lesson/${lesson.id}/playground">Open the existing playground →</a></div>`;
    $('[data-study-retry]', root).addEventListener('click', () => { if (!disposed) { const old = mountChapter(root, lesson); signal.addEventListener('abort', old, {once: true}); } }, {once: true, signal});
  });
  return () => { disposed = true; controller.abort(); };
}

/** A lazy, phase-synchronized reading companion; no work is done on animation frames. */
export function mountPhaseReading(root, lessonId) {
  let disposed = false, chapter = null, phase = 0, drawn = -1;
  root.innerHTML = '<details class="atlas-phase-reading"><summary>Read this step in depth</summary><div class="phase-reading-content"><p>Open this panel for the guided explanation and source connections.</p></div></details>';
  const details = $('details', root);
  function render() {
    if (disposed || !chapter || !details.open || drawn === phase) return;
    drawn = phase;
    const step = chapter.steps[phase];
    $('.phase-reading-content', root).innerHTML = `<span class="eyebrow">GUIDED STEP ${phase + 1} OF 4</span><h3>${h(step.title)}</h3>${paragraph(step.explain)}<div class="study-worked"><strong>Try it, then explain.</strong>${paragraph(step.worked)}</div><details class="study-recall"><summary>${h(step.question)}</summary>${paragraph(step.answer)}</details><div class="phase-reading-links"><a href="#/lesson/${lessonId}/learn?section=step-${phase}">Read the full chapter at this step →</a><a href="#/lesson/${lessonId}/learn?section=sources">Read the pinned Uno examples →</a></div>`;
    root.dataset.readingStep = String(phase);
  }
  const controller = new AbortController();
  let loading = false;
  details.addEventListener('toggle', async () => {
    if (!details.open || disposed) return;
    if (!chapter && !loading) {
      loading = true;
      try { chapter = await loadChapter(lessonId); }
      catch (error) { if (!disposed) $('.phase-reading-content', root).textContent = `Reading material unavailable: ${error.message}`; }
      finally { loading = false; }
    }
    render();
  }, {signal: controller.signal});
  return {update(index) { phase = Math.max(0, Math.min(3, index)); render(); }, dispose() { disposed = true; controller.abort(); }};
}
