'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { spawnSync } = require('child_process');
const catalog = require('../src/main/catalog');
const { COURSES } = require('../src/shared/courses');

test('Katalogprüfung (scripts/check.js) ist fehlerfrei und jeder Bereich hat mindestens 20 Fragen', () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'check.js'), '--min', '20'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.doesNotMatch(result.stdout, /Hinweise:/);
});

test('jede Aufgabe wird mit ihrer eigenen Lösung als richtig bewertet (DE und EN)', () => {
  const { Q, inst, grade, fmt, setLang } = catalog.load();
  for (const lang of ['de', 'en']) {
    setLang(lang);
    for (const q of Q) {
      for (let k = 0; k < (q.gen ? 20 : 1); k += 1) {
        const task = inst(q);
        if (task.t === 'open') continue;
        let answer;
        if (task.t === 'sc') answer = task.opts.findIndex((o) => o.ok);
        else if (task.t === 'mc') answer = task.opts.map((o, i) => (o.ok ? i : -1)).filter((i) => i >= 0);
        else if (task.t === 'match') answer = task.sol.slice();
        else if (task.t === 'order') answer = task.items.map((_, i) => i);
        else answer = task.f.map((f) => (typeof f.v === 'number' ? fmt(f.v, (String(f.v).split('.')[1] || '').length, lang) : String(f.v)));
        assert.equal(grade(task, answer), 1, `${q.id} (${lang}): ${JSON.stringify(answer)}`);
      }
    }
  }
});

test('jeder Kurs verweist nur auf vorhandene Katalogbereiche', () => {
  const ids = catalog.areaIds();
  for (const c of COURSES) for (const a of c.areas) assert.ok(ids.includes(a), `${c.id}: ${a}`);
});

test('Aufgabentext und Lösung für den Mentor sind vollständig', () => {
  for (const type of catalog.TYPES) {
    const task = catalog.pickTask({ areas: [], type, lang: 'de' });
    assert.ok(task, type);
    const text = catalog.taskMarkdown(task, 'de');
    const solution = catalog.solutionMarkdown(task, 'de');
    assert.ok(text.includes(task.q), `${type}: Frage fehlt`);
    assert.ok(solution.length > 20, `${type}: Lösung fehlt`);
    assert.doesNotMatch(text + solution, /undefined|NaN/);
  }
});
