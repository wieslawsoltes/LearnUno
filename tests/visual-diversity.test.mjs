import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lessons} from '../site/src/course.mjs';
import {labMap, labForLesson} from '../site/src/atlas/catalog.mjs';
import {scene} from '../site/src/atlas/scenes.mjs';

// A title change must not disguise a duplicated default scene. This complements
// the per-model outcome tests; it is not a substitute for reviewing pedagogy.
test('lesson visuals remain distinct after captions and DOM identifiers are removed', () => {
  const fingerprints = new Map();
  for (const lesson of lessons) {
    const lab = labMap.get(labForLesson(lesson));
    const state = {...lab.defaults, revision: 0, trace: [], status: 'idle', sequence: 0};
    const geometry = scene(lab, state, 0).svg
      .replace(/<text\b[\s\S]*?<\/text>/g, '')
      .replace(/\s(?:aria-[\w-]+|data-[\w-]+)="[^"]*"/g, '')
      .replace(/\s+/g, ' ').trim();
    assert.ok(geometry.length > 0, lesson.id + ' must have inspectable geometry');
    const fingerprint = createHash('sha256').update(geometry).digest('hex');
    assert.ok(!fingerprints.has(fingerprint),
      `${lesson.id} repeats the geometry of ${fingerprints.get(fingerprint)}`);
    fingerprints.set(fingerprint, lesson.id);
  }
  assert.equal(fingerprints.size, lessons.length);
});
