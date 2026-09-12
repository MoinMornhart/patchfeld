'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const MD = require('../src/renderer/md.js');

test('HTML wird immer escaped', () => {
  const html = MD.render('<img src=x onerror=alert(1)> <script>alert(1)</script>');
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('Codeblöcke bekommen Sprache, Inhalt und Editor-Knopf', () => {
  const html = MD.render('Vorher\n```python\nprint("<hi>")\n```\nNachher', { toEditorLabel: 'In Editor' });
  assert.match(html, /<span>python<\/span>/);
  assert.match(html, /print\(&quot;&lt;hi&gt;&quot;\)/);
  assert.match(html, /class="to-editor">In Editor</);
  assert.match(html, /<p>Nachher<\/p>/);
});

test('ein offener Codeblock (während des Streamings) wird trotzdem gerendert', () => {
  const html = MD.render('```js\nconsole.log(1)');
  assert.match(html, /<code>console\.log\(1\)<\/code>/);
});

test('Inline-Code bleibt unformatiert, normale Zahlen bleiben Text', () => {
  const html = MD.render('Level 1 und 2 – nutze `print(*args)` 3 mal');
  assert.match(html, /Level 1 und 2/);
  assert.match(html, /<code>print\(\*args\)<\/code> 3 mal/);
  assert.equal((html.match(/<code>/g) || []).length, 1);
});

test('die Quelldatei enthält keine rohen Steuerzeichen', () => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'src', 'renderer', 'md.js'), 'utf8');
  assert.equal([...src].filter((c) => c.charCodeAt(0) < 9).length, 0);
});

test('Multiplikation wird nicht kursiv', () => {
  const html = MD.render('2 * 3 * 4');
  assert.ok(!html.includes('<em>'));
  assert.match(MD.render('*kursiv*'), /<em>kursiv<\/em>/);
});

test('nur http(s)-Links werden zu Links', () => {
  assert.match(MD.render('[Doku](https://docs.python.org)'), /<a href="https:\/\/docs\.python\.org"/);
  assert.ok(!MD.render('[x](javascript:alert(1))').includes('<a '));
});

test('Tabellen, Listen und Überschriften', () => {
  const html = MD.render('# Titel\n- a\n- b\n\n1. eins\n2. zwei\n\n| A | B |\n|---|---|\n| 1 | 2 |');
  assert.match(html, /<h3>Titel<\/h3>/);
  assert.match(html, /<ul><li>a<\/li><li>b<\/li><\/ul>/);
  assert.match(html, /<ol start="1"><li>eins<\/li><li>zwei<\/li><\/ol>/);
  assert.match(html, /<th>A<\/th><th>B<\/th>/);
  assert.match(html, /<td>1<\/td><td>2<\/td>/);
});
