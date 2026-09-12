'use strict';

// Gives the main process (mentor tools) access to the question catalog of the renderer.
// catalog.js and engine.js are plain browser scripts; they run here in an isolated vm context.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = path.join(__dirname, '..', 'renderer');
const TYPES = ['sc', 'mc', 'in', 'match', 'order', 'open'];
let pf = null;

function load() {
  if (pf) return pf;
  const context = vm.createContext({ console, Math, JSON, Object, Array, Number, String, Date });
  for (const file of ['catalog.js', 'engine.js']) {
    vm.runInContext(fs.readFileSync(path.join(DIR, file), 'utf8'), context, { filename: file });
  }
  vm.runInContext('globalThis.__pf = { AREAS, AREA, Q, QI, inst, grade, qType, fmt, setLang: (l) => { L = l; } };', context);
  pf = context.__pf;
  return pf;
}

const plain = (value) => JSON.parse(JSON.stringify(value));

function areaIds() {
  return load().AREAS.map((a) => a.id);
}

// Picks a catalog question for the given topics (optionally a type), preferring ones not given yet,
// and turns it into a concrete task (options shuffled, calculation values generated).
function pickTask({ areas, type, exclude = [], lang = 'de' }) {
  const { Q, qType, inst, setLang } = load();
  const wanted = (areas || []).filter(Boolean);
  let pool = Q.filter((q) => (!wanted.length || wanted.includes(q.a)) && (!type || qType(q) === type));
  if (!pool.length) pool = Q.filter((q) => !wanted.length || wanted.includes(q.a));
  if (!pool.length) return null;
  const fresh = pool.filter((q) => !exclude.includes(q.id));
  const from = fresh.length ? fresh : pool;
  const q = from[Math.floor(Math.random() * from.length)];
  setLang(lang === 'en' ? 'en' : 'de');
  return plain(inst(q));
}

function fmtValue(field, lang) {
  const { fmt } = load();
  if (typeof field.v !== 'number') return String(field.v);
  const decimals = (String(field.v).split('.')[1] || '').length;
  return fmt(field.v, decimals, lang);
}

// Task text in Markdown – what the learner sees, in the same order.
function taskMarkdown(task, lang) {
  const de = lang !== 'en';
  const lines = [];
  if (task.s) lines.push(task.s, '');
  if (task.tb) {
    lines.push(`| ${task.tb.h.join(' | ')} |`, `|${task.tb.h.map(() => '---').join('|')}|`);
    for (const row of task.tb.r) lines.push(`| ${row.join(' | ')} |`);
    lines.push('');
  }
  if (task.code) lines.push('```text', task.code, '```', '');
  lines.push(`**${task.q}**`);
  if (task.opts) task.opts.forEach((o, i) => lines.push(`${i + 1}. ${o.x}`));
  if (task.left) lines.push(de ? 'Zuordnen:' : 'Match:', ...task.left.map((l) => `- ${l} → ?`), de ? `Auswahl: ${task.right.join(' · ')}` : `Choices: ${task.right.join(' · ')}`);
  if (task.items) lines.push(de ? 'Schritte (gemischt):' : 'Steps (shuffled):', ...task.disp.map((i) => `- ${task.items[i]}`));
  if (task.f) lines.push(...task.f.map((f) => `- ${f.l}${f.u && f.u !== '/' ? ` [${f.u}]` : ''}: ___`));
  return lines.join('\n');
}

// Solution in Markdown – for the mentor and for the result after checking.
function solutionMarkdown(task, lang) {
  const de = lang !== 'en';
  const lines = [];
  if (task.opts) lines.push(`${de ? 'Richtig' : 'Correct'}: ${task.opts.filter((o) => o.ok).map((o) => o.x).join(' | ')}`);
  if (task.left) lines.push(...task.left.map((l, i) => `- ${l} → ${task.sol[i]}`));
  if (task.items) lines.push(...task.items.map((it, i) => `${i + 1}. ${it}`));
  if (task.f) lines.push(...task.f.map((f) => `- ${f.l}: ${f.u === '/' ? '/' : ''}${fmtValue(f, lang)}${f.u && f.u !== '/' ? ` ${f.u}` : ''}`));
  if (task.m) lines.push(task.m, '', `${de ? 'Stichpunkte' : 'Key points'}: ${(task.k || []).join('; ')}`);
  if (task.e) lines.push('', `${de ? 'Erklärung' : 'Explanation'}: ${task.e}`);
  if (task.n) lines.push(`${de ? 'Naheliegender Fehler' : 'Tempting mistake'}: ${task.n}`);
  return lines.join('\n');
}

function areaLabel(id, lang) {
  const area = load().AREA[id];
  return area ? area[lang === 'en' ? 'en' : 'de'] : id;
}

module.exports = { TYPES, load, areaIds, pickTask, taskMarkdown, solutionMarkdown, areaLabel };
