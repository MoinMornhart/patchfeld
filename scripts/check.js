#!/usr/bin/env node
/* Patchfeld – Prüfwerkzeug für den Fragenkatalog
 *
 * Aufruf:  npm run check   bzw.   node scripts/check.js [--min 20] [--area hw] [--frag datei.js]
 *
 * Prüft:
 *  - Syntax aller Skripte der Oberfläche (src/renderer/*.js)
 *  - Fragen: eindeutige IDs, gültiger Bereich, Typ, beide Sprachen (de/en) mit gleicher Struktur,
 *    Lösungsindizes, Erklärung (e) und naheliegender Fehler (n)
 *  - Generatoren: 300 Durchläufe je Sprache ohne NaN/undefined, Lösungen vorhanden
 *  - Glossar-Einträge
 *  - Version in package.json folgt dem Zählerschema und steht in CHANGELOG.md und CHANGELOG.en.md
 * Exit-Code 1 bei Fehlern.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const RENDERER = path.join(ROOT, 'src', 'renderer');
const args = process.argv.slice(2);
const MIN = +(args[args.indexOf('--min') + 1] || 0) || 0;
const ONLY = args.includes('--area') ? args[args.indexOf('--area') + 1] : null;

const errors = [], warns = [];
const err = m => errors.push(m), warn = m => warns.push(m);

/* Syntax aller Oberflächen-Skripte */
for (const file of fs.readdirSync(RENDERER).filter(f => f.endsWith('.js'))) {
  try { new vm.Script(fs.readFileSync(path.join(RENDERER, file), 'utf8'), {filename: file}); } catch (e) { err(`Syntaxfehler in ${file}: ${e.message}`); }
}

/* Katalog ausführen (Bereiche, Generatoren, Fragen, Glossar) */
/* --frag datei.js: zusätzlichen Fragen-Block (noch nicht im Katalog) mitprüfen */
const FRAG = args.includes('--frag') ? fs.readFileSync(path.resolve(args[args.indexOf('--frag') + 1]), 'utf8') : '';
const dataCode = fs.readFileSync(path.join(RENDERER, 'catalog.js'), 'utf8') + '\n;\n' + FRAG + '\n;globalThis.__out = {AREAS, AREA, Q, GEN, GLOSSAR};';
const sandbox = {console, Math, Number, String, JSON, Object, Array, Date};
vm.createContext(sandbox);
try { vm.runInContext(dataCode, sandbox); } catch (e) { err(`Laufzeitfehler in Daten-Skripten: ${e.message}`); report(); }
const {AREAS, AREA, Q, GEN, GLOSSAR} = sandbox.__out;
const APP_VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;

const TYPES = ['sc', 'mc', 'in', 'match', 'order', 'open'];
const isStr = s => typeof s === 'string' && s.trim().length > 0;
const bad = s => /undefined|NaN|\[object Object\]/.test(String(s));

const ids = new Set();
for (const q of Q) {
  if (ONLY && q.a !== ONLY) continue;
  const w = `[${q.id}]`;
  if (ids.has(q.id)) err(`${w} doppelte ID`); ids.add(q.id);
  if (!AREA[q.a]) err(`${w} unbekannter Bereich "${q.a}"`);
  if (!q.id.startsWith(q.a + '-')) err(`${w} ID muss mit "${q.a}-" beginnen`);
  if (q.gen) {
    if (!GEN[q.gen]) { err(`${w} Generator "${q.gen}" fehlt`); continue; }
    for (const L of ['de', 'en']) for (let k = 0; k < 300; k++) {
      let d; try { d = GEN[q.gen](L); } catch (e) { err(`${w} Generator wirft (${L}): ${e.message}`); break; }
      if (d.t !== 'in') { err(`${w} Generator muss t:'in' liefern`); break; }
      for (const f of ['s', 'q', 'e', 'n']) if (!isStr(d[f]) || bad(d[f])) { err(`${w} Generator-Feld ${f} fehlerhaft (${L}): ${d[f]}`); k = 999; break; }
      if (!Array.isArray(d.f) || !d.f.length) { err(`${w} Generator ohne Felder f`); break; }
      for (const f of d.f) {
        if (!isStr(f.l)) err(`${w} Feld ohne Beschriftung (${L})`);
        if (typeof f.v === 'number' ? !isFinite(f.v) : !isStr(f.v)) { err(`${w} ungültiger Lösungswert (${L}): ${f.v}`); k = 999; }
      }
    }
    continue;
  }
  if (!TYPES.includes(q.t)) { err(`${w} unbekannter Typ "${q.t}"`); continue; }
  const de = q.de, en = q.en;
  if (!de || !en) { err(`${w} de und en sind Pflicht`); continue; }
  for (const [L, d] of [['de', de], ['en', en]]) {
    for (const f of ['s', 'q']) if (!isStr(d[f])) err(`${w} ${L}.${f} fehlt`);
    if (q.t === 'open') { if (!isStr(d.m)) err(`${w} ${L}.m (Musterlösung) fehlt`); if (!Array.isArray(d.k) || d.k.length < 2) err(`${w} ${L}.k braucht mind. 2 Stichpunkte`); }
    else { if (!isStr(d.e)) err(`${w} ${L}.e (Erklärung) fehlt`); if (!isStr(d.n)) err(`${w} ${L}.n (naheliegender Fehler) fehlt`); }
  }
  if (q.t === 'sc' || q.t === 'mc') {
    if (!Array.isArray(de.o) || !Array.isArray(en.o) || de.o.length !== en.o.length) { err(`${w} Optionen de/en ungleich`); continue; }
    if (de.o.length < 3) err(`${w} mind. 3 Optionen`);
    const cs = Array.isArray(q.c) ? q.c : [q.c];
    if (q.t === 'sc' && (Array.isArray(q.c) || !Number.isInteger(q.c))) err(`${w} sc braucht c als Zahl`);
    if (q.t === 'mc' && (!Array.isArray(q.c) || q.c.length < 1 || q.c.length >= de.o.length)) err(`${w} mc braucht c als Array (mind. 1, nicht alle)`);
    if (cs.some(c => c < 0 || c >= de.o.length)) err(`${w} Lösungsindex außerhalb`);
    if (new Set(de.o).size !== de.o.length || new Set(en.o).size !== en.o.length) err(`${w} doppelte Optionen`);
  }
  if (q.t === 'match') {
    if (!Array.isArray(de.p) || !Array.isArray(en.p) || de.p.length !== en.p.length) { err(`${w} Paare de/en ungleich`); continue; }
    if (de.p.length < 3) err(`${w} mind. 3 Paare`);
    for (const [L, d] of [['de', de], ['en', en]]) { const r = d.p.map(p => p[1]); if (new Set(r).size !== r.length) err(`${w} ${L}: rechte Seiten müssen eindeutig sein`); if (d.p.some(p => !isStr(p[0]) || !isStr(p[1]))) err(`${w} ${L}: leeres Paar`); }
  }
  if (q.t === 'order') {
    if (!Array.isArray(de.o) || !Array.isArray(en.o) || de.o.length !== en.o.length) { err(`${w} Schritte de/en ungleich`); continue; }
    if (de.o.length < 3 || de.o.length > 9) err(`${w} 3–9 Schritte`);
  }
  if (q.t === 'in') {
    if (!Array.isArray(q.f) || !q.f.length) { err(`${w} in braucht f`); continue; }
    for (const [L, d] of [['de', de], ['en', en]]) if (!Array.isArray(d.l) || d.l.length !== q.f.length) err(`${w} ${L}.l muss ${q.f.length} Beschriftung(en) haben`);
  }
}

/* Glossar */
const terms = new Set();
for (const g of GLOSSAR) {
  if (!Array.isArray(g) || g.length < 5) { err(`Glossar: fehlerhafter Eintrag ${JSON.stringify(g).slice(0, 60)}`); continue; }
  if (!AREA[g[1]]) err(`Glossar "${g[0]}": unbekannter Bereich ${g[1]}`);
  if (terms.has(g[0])) err(`Glossar: doppelter Begriff ${g[0]}`); terms.add(g[0]);
  if (!isStr(g[3]) || !isStr(g[4])) err(`Glossar "${g[0]}": Erklärung de/en fehlt`);
}

/* Versionen */
for (const file of ['CHANGELOG.md', 'CHANGELOG.en.md']) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (!text.includes(`## [Patchfeld ${APP_VERSION}]`)) err(`${file} ohne Eintrag für ${APP_VERSION}`);
}
if (!/^\d+\.\d\.\d$/.test(APP_VERSION)) err(`Version ${APP_VERSION} verletzt das Schema (Nebenstellen 0–9)`);

/* Übersicht */
const counts = {}, types = {};
for (const q of Q) { counts[q.a] = (counts[q.a] || 0) + 1; const t = q.gen ? 'in*' : q.t; (types[q.a] = types[q.a] || {})[t] = (types[q.a][t] || 0) + 1; }
console.log(`Patchfeld v${APP_VERSION} – ${Q.length} Fragen, ${GLOSSAR.length} Glossarbegriffe\n`);
for (const a of AREAS) {
  if (ONLY && a.id !== ONLY) continue;
  const n = counts[a.id] || 0;
  console.log(`${String(a.y)}. LJ  ${a.id.padEnd(9)} ${String(n).padStart(3)}  ${Object.entries(types[a.id] || {}).map(([t, c]) => `${t}:${c}`).join(' ')}`);
  if (MIN && n < MIN) warn(`Bereich ${a.id}: ${n} < ${MIN} Fragen`);
}
report();

function report() {
  if (warns.length) console.log('\nHinweise:\n  ' + warns.join('\n  '));
  if (errors.length) { console.log('\nFEHLER:\n  ' + errors.join('\n  ')); process.exit(1); }
  console.log('\n✓ Keine Fehler.');
  process.exit(0);
}
