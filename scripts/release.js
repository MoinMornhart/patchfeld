#!/usr/bin/env node
'use strict';

// Publishes the current version: pushes commits and tags, creates a draft GitHub release
// with the changelog as notes, lets electron-builder build the installer and upload it into
// that draft, then publishes the release. Installed apps pick it up through auto-update.
//
// The release is created up front on purpose: when electron-builder creates it itself, its
// parallel uploads can race and end up in two separate releases for the same tag.
//
// Run `npm run bump -- …` first so the version commit and tag exist.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function gh(args, env) {
  return execFileSync('gh', args, { cwd: ROOT, encoding: 'utf8', env }).trim();
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

// The changelog entry of one version, without its heading.
function changelogSection(file, version) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const start = text.indexOf(`## [Patchfeld ${version}]`);
  if (start === -1) return '';
  const body = text.slice(text.indexOf('\n', start) + 1);
  const end = body.search(/^## \[/m);
  return (end === -1 ? body : body.slice(0, end)).trim();
}

const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const tag = `v${version}`;

if (git(['status', '--porcelain'])) fail('Es gibt nicht committete Änderungen. Erst `npm run bump -- …` ausführen.');
if (!git(['tag', '--points-at', 'HEAD']).split(/\s+/).includes(tag)) {
  fail(`Der aktuelle Commit hat nicht den Tag ${tag}. Erst \`npm run bump -- …\` ausführen.`);
}

let token = process.env.GH_TOKEN;
if (!token) {
  try {
    token = gh(['auth', 'token']);
  } catch {
    fail('Kein GitHub-Token gefunden. `gh auth login` ausführen oder GH_TOKEN setzen.');
  }
}
const env = { ...process.env, GH_TOKEN: token };

console.log(`→ Push von main und ${tag} …`);
execFileSync('git', ['push', 'origin', 'HEAD', '--follow-tags'], { cwd: ROOT, stdio: 'inherit' });

console.log(`→ Lege Release-Entwurf ${tag} an …`);
const notes = [
  '### Deutsch',
  '',
  changelogSection('CHANGELOG.md', version),
  '',
  '### English',
  '',
  changelogSection('CHANGELOG.en.md', version),
  '',
].join('\n');
const notesFile = path.join(os.tmpdir(), `patchfeld-notes-${version}.md`);
fs.writeFileSync(notesFile, notes);
try {
  gh(['release', 'create', tag, '--draft', '--verify-tag', '--title', `Patchfeld ${version}`, '--notes-file', notesFile], env);
} finally {
  fs.rmSync(notesFile, { force: true });
}

console.log(`→ Baue Patchfeld ${version} und lade den Installer hoch …`);
const cli = path.join(ROOT, 'node_modules', 'electron-builder', 'cli.js');
const result = spawnSync(process.execPath, [cli, '--win', '--publish', 'always'], { cwd: ROOT, stdio: 'inherit', env });
if (result.status !== 0) fail(`electron-builder ist fehlgeschlagen. Der Entwurf ${tag} ist noch nicht veröffentlicht.`);

console.log(`→ Veröffentliche ${tag} …`);
gh(['release', 'edit', tag, '--draft=false', '--latest'], env);
console.log(`✓ Release ${tag} veröffentlicht.`);
