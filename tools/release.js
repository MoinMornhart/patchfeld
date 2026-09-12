#!/usr/bin/env node
/* Patchfeld – Release-Werkzeug
 *
 * Erhöht die Versionsnummer nach dem Patchfeld-Schema (jede Stelle 0–9:
 * 0.0.1 … 0.0.9 → 0.1.0 … 0.9.9 → 1.0.0), trägt die Änderungen in
 * index.html (APP_VERSION, Meta-Tag, CHANGELOG), version.json, CHANGELOG.md
 * und sw.js ein und erzeugt die Commit-Nachricht.
 *
 * Aufruf:
 *   node tools/release.js --notes notes.json [--commit]
 *   node tools/release.js --de "Änderung 1|Änderung 2" --en "Change 1|Change 2" [--commit]
 *   node tools/release.js --next          (zeigt nur die nächste Versionsnummer)
 *
 * notes.json: { "de": ["…"], "en": ["…"] }
 * Mit --commit wird alles gestaged, committet und als vX.Y.Z getaggt.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const P = f => path.join(ROOT, f);
const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

function bump(v) {
  let [a, b, c] = v.split('.').map(Number);
  c++;
  if (c > 9) { c = 0; b++; }
  if (b > 9) { b = 0; a++; }
  return `${a}.${b}.${c}`;
}

const vj = JSON.parse(fs.readFileSync(P('version.json'), 'utf8'));
const next = bump(vj.version);
if (args.includes('--next')) { console.log(next); process.exit(0); }

let notes;
if (opt('--notes')) notes = JSON.parse(fs.readFileSync(path.resolve(opt('--notes')), 'utf8'));
else notes = { de: (opt('--de') || '').split('|').filter(Boolean), en: (opt('--en') || '').split('|').filter(Boolean) };
if (!notes.de.length || !notes.en.length) {
  console.error('Fehler: Änderungen fehlen. Bitte --de und --en (oder --notes) angeben – beide Sprachen sind Pflicht.');
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const js = s => JSON.stringify(s).replace(/^"|"$/g, '').replace(/'/g, "\\'");

/* index.html */
let html = fs.readFileSync(P('index.html'), 'utf8');
html = html.replace(/const APP_VERSION = '[^']+';/, `const APP_VERSION = '${next}';`);
html = html.replace(/<meta name="app-version" content="[^"]+">/, `<meta name="app-version" content="${next}">`);
const entry = `  {v:'${next}', d:'${date}',\n   de:[${notes.de.map(n => `'${js(n)}'`).join(',')}],\n   en:[${notes.en.map(n => `'${js(n)}'`).join(',')}]},\n`;
html = html.replace('const CHANGELOG = [\n', 'const CHANGELOG = [\n' + entry);
fs.writeFileSync(P('index.html'), html);

/* version.json */
fs.writeFileSync(P('version.json'), JSON.stringify({ version: next, date, file: 'index.html', notes }, null, 2) + '\n');

/* CHANGELOG.md */
const cl = fs.readFileSync(P('CHANGELOG.md'), 'utf8');
const section = `## ${next} – ${date}\n\n${notes.de.map(n => `- ${n}`).join('\n')}\n\n**English**\n\n${notes.en.map(n => `- ${n}`).join('\n')}\n\n`;
fs.writeFileSync(P('CHANGELOG.md'), cl.replace('<!-- releases -->\n\n', `<!-- releases -->\n\n${section}`));

/* sw.js – neuer Cache-Name, damit installierte Apps die neue Version laden */
const sw = fs.readFileSync(P('sw.js'), 'utf8').replace(/const CACHE = '[^']+';/, `const CACHE = 'patchfeld-cache-v${next}';`);
fs.writeFileSync(P('sw.js'), sw);

/* Commit-Nachricht */
const msg = `v${next}: ${notes.de[0]}\n\n${notes.de.map(n => `- ${n}`).join('\n')}\n\nEN:\n${notes.en.map(n => `- ${n}`).join('\n')}\n`;
fs.writeFileSync(P('.git/RELEASE_MSG'), msg);
console.log(`Version ${vj.version} → ${next}\n\n${msg}`);

if (args.includes('--commit')) {
  execSync('git add -A', { cwd: ROOT, stdio: 'inherit' });
  execSync('git commit -F .git/RELEASE_MSG', { cwd: ROOT, stdio: 'inherit' });
  execSync(`git tag -a v${next} -m "Patchfeld v${next}"`, { cwd: ROOT, stdio: 'inherit' });
  /* --push: auf GitHub veröffentlichen – GitHub Pages und alle Autoupdates holen sich dann die neue Version */
  if (args.includes('--push')) {
    execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' });
    execSync(`git push origin v${next}`, { cwd: ROOT, stdio: 'inherit' });
  }
}
