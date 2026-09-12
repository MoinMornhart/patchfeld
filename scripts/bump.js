#!/usr/bin/env node
'use strict';

// Raises the Patchfeld version by one step (counter scheme), updates package.json,
// both changelogs and both READMEs, then commits everything with a versioned message
// and tags the commit (vX.Y.Z).
//
// npm run bump -- --title "Kurzer Titel" --de "Änderung 1" --de "Änderung 2" --en "Change 1" --en "Change 2"
// Optional: --trailer "Co-Authored-By: …"  --dry-run
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { nextVersion } = require('../src/shared/version');

const ROOT = path.join(__dirname, '..');
const USAGE = 'Aufruf: npm run bump -- --title "Titel" --de "Änderung" [--de …] --en "Change" [--en …] [--trailer "…"] [--dry-run]';

function parseArgs(argv) {
  const args = { title: '', de: [], en: [], trailer: [], dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--title') args.title = argv[++i] || '';
    else if (arg === '--de') args.de.push(argv[++i] || '');
    else if (arg === '--en') args.en.push(argv[++i] || '');
    else if (arg === '--trailer') args.trailer.push(argv[++i] || '');
    else if (arg === '--dry-run') args.dryRun = true;
    else throw new Error(`Unbekanntes Argument: ${arg}\n${USAGE}`);
  }
  args.de = args.de.filter(Boolean);
  args.en = args.en.filter(Boolean);
  if (!args.title || !args.de.length || !args.en.length) throw new Error(USAGE);
  return args;
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function write(file, content, dryRun) {
  if (!dryRun) fs.writeFileSync(path.join(ROOT, file), content);
}

function insertAfterMarker(content, marker, entry, file) {
  const index = content.indexOf(marker);
  if (index === -1) throw new Error(`Markierung ${marker} fehlt in ${file}`);
  const at = index + marker.length;
  return `${content.slice(0, at)}\n\n${entry.trimEnd()}\n${content.slice(at).replace(/^\n+/, '\n')}`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const pkg = JSON.parse(read('package.json'));
  const from = pkg.version;
  const to = nextVersion(from);
  const date = new Date().toISOString().slice(0, 10);
  const bullets = (items) => items.map((item) => `- ${item}`).join('\n');

  pkg.version = to;
  write('package.json', JSON.stringify(pkg, null, 2) + '\n', args.dryRun);

  if (fs.existsSync(path.join(ROOT, 'package-lock.json'))) {
    const lock = JSON.parse(read('package-lock.json'));
    lock.version = to;
    if (lock.packages && lock.packages['']) lock.packages[''].version = to;
    write('package-lock.json', JSON.stringify(lock, null, 2) + '\n', args.dryRun);
  }

  const entryDe = `## [Patchfeld ${to}] – ${date}\n${bullets(args.de)}`;
  const entryEn = `## [Patchfeld ${to}] – ${date}\n${bullets(args.en)}`;
  write('CHANGELOG.md', insertAfterMarker(read('CHANGELOG.md'), '<!-- EINTRÄGE -->', entryDe, 'CHANGELOG.md'), args.dryRun);
  write('CHANGELOG.en.md', insertAfterMarker(read('CHANGELOG.en.md'), '<!-- ENTRIES -->', entryEn, 'CHANGELOG.en.md'), args.dryRun);
  // The version line may be Markdown (**…**) or HTML (<b>…</b>).
  write('README.md', read('README.md').replace(/((?:\*\*|<b>)Patchfeld-Version:(?:\*\*|<\/b>) )[\d.]+/, `$1${to}`), args.dryRun);
  write('README.en.md', read('README.en.md').replace(/((?:\*\*|<b>)Patchfeld version:(?:\*\*|<\/b>) )[\d.]+/, `$1${to}`), args.dryRun);

  let message = `[Patchfeld ${to}] ${args.title}\n\nDE:\n${bullets(args.de)}\nEN:\n${bullets(args.en)}\n`;
  if (args.trailer.length) message += `\n${args.trailer.join('\n')}\n`;

  if (args.dryRun) {
    console.log(`Version: ${from} → ${to}\n\n${message}`);
    return;
  }

  const messageFile = path.join(os.tmpdir(), `patchfeld-commit-${Date.now()}.txt`);
  fs.writeFileSync(messageFile, message);
  try {
    execFileSync('git', ['add', '-A'], { cwd: ROOT, stdio: 'inherit' });
    execFileSync('git', ['commit', '-q', '-F', messageFile], { cwd: ROOT, stdio: 'inherit' });
    // Annotated tag: only those are pushed by `git push --follow-tags` in release.js.
    execFileSync('git', ['tag', '-a', `v${to}`, '-m', `Patchfeld ${to}`], { cwd: ROOT, stdio: 'inherit' });
  } finally {
    fs.rmSync(messageFile, { force: true });
  }
  console.log(`✓ Version ${from} → ${to}, Commit und Tag v${to} erstellt.`);
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
