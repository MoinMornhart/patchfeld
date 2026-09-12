'use strict';

// Talks to Claude through Claude Code (Claude Agent SDK), using the learner's own Claude login.
// Kept free of Electron imports so it can be tested with a fake SDK.
const { z } = require('zod');
const catalog = require('./catalog');
const { courseName } = require('../shared/courses');

const SERVER = 'patchfeld';
const TOOL = { exercise: 'set_exercise', task: 'load_exam_task', profile: 'update_learning_profile' };
const ALLOWED_TOOLS = Object.values(TOOL).map((name) => `mcp__${SERVER}__${name}`);

let sdkPromise = null;
function loadSdk() {
  // The SDK is an ES module; dynamic import works from CommonJS.
  if (!sdkPromise) sdkPromise = import('@anthropic-ai/claude-agent-sdk');
  return sdkPromise;
}

const exerciseShape = {
  title: z.string().describe('Short title of the task'),
  instructions: z.string().describe('Task in Markdown: company situation (IHK style), numbered sub-tasks, given values, hints on the expected form of the answer'),
  answer_template: z.string().describe('Optional skeleton for the answer field, e.g. headings, a table frame or "Rechenweg:" – never the solution. May be empty.'),
};

const taskShape = {
  area: z.string().describe(`Catalog topic id (${'{AREAS}'}). Empty string = a topic of the current course.`),
  type: z.string().describe('Question type: sc (single choice), mc (multiple choice), in (calculation/input, random values), match, order, open – or empty for any'),
};

const profileShape = {
  level: z.number().int().describe('Current level 0–10'),
  lesson: z.number().int().describe('Current lesson number within the level'),
  phase: z.string().describe('Current phase, e.g. Onboarding, Placement, Lesson, Case study, Exam'),
  progress_percent: z.number().int().describe('Progress within the current level, 0–100'),
  streak: z.number().int().describe('Lessons in a row'),
  goals: z.string().describe('Training year, company/industry, exam dates, weekly time budget, session length, learning style'),
  mastered: z.array(z.string()).describe('Mastered topics (green)'),
  shaky: z.array(z.string()).describe('Shaky topics (yellow)'),
  open: z.array(z.string()).describe('Open topics (red)'),
  mistakes: z.array(z.object({
    topic: z.string(),
    clean_reviews: z.number().int().describe('Error-free reviews so far, 0–3'),
    next_review: z.string().describe('When to ask again, e.g. "Lesson 7"'),
  })).describe('Open mistake list'),
  projects: z.array(z.object({
    level: z.number().int(),
    name: z.string(),
    rating: z.string().describe('Result, e.g. "78 % · Note 3" or points "41/50"'),
  })).describe('Completed level case studies and exam simulations'),
  glossary: z.array(z.object({ term: z.string(), meaning: z.string() })).describe('All terms learned so far'),
  recommendation: z.string().describe('What the learner should work on next'),
};

function typeLabel(type, lang) {
  const de = lang !== 'en';
  return {
    sc: de ? 'Single Choice' : 'single choice',
    mc: de ? 'Mehrfachauswahl' : 'multiple choice',
    in: de ? 'Rechenaufgabe' : 'calculation',
    match: de ? 'Zuordnung' : 'matching',
    order: de ? 'Reihenfolge' : 'ordering',
    open: de ? 'Offene Frage' : 'open question',
  }[type] || type;
}

function createToolServer(sdk, handlers, lang) {
  const de = lang !== 'en';
  const reply = (text) => ({ content: [{ type: 'text', text }] });
  const shape = { ...taskShape, area: taskShape.area.describe(`Catalog topic id: ${catalog.areaIds().join(', ')}. Empty string = a topic of the current course.`) };
  return sdk.createSdkMcpServer({
    name: SERVER,
    version: '1.0.0',
    alwaysLoad: true, // built-in tools (incl. tool search) are disabled, so schemas must be in the prompt
    tools: [
      sdk.tool(
        TOOL.exercise,
        'Load a task you wrote yourself into the learner\'s work area in the app: title, task text (Markdown) and an optional answer skeleton (never the solution). The learner answers in a free-text field.',
        exerciseShape,
        async (args) => {
          handlers.onExercise(args);
          return reply(de
            ? 'Die Aufgabe liegt im Arbeitsbereich. Warte jetzt, bis der Lernende seine Antwort schickt.'
            : 'The task is in the work area. Now wait until the learner sends their answer.');
        },
      ),
      sdk.tool(
        TOOL.task,
        'Load a real IHK-style exam task from the Patchfeld catalog (360 questions, calculations with fresh random values) into the work area. The app shows it with answer widgets and checks the answer automatically. The tool result contains the task and its solution – for you only.',
        shape,
        async (args) => reply(handlers.onTask(args)),
      ),
      sdk.tool(
        TOOL.profile,
        'Save the complete learning profile of the current course. Always pass the full profile, not just changes.',
        profileShape,
        async (args) => {
          handlers.onProfile(args);
          return reply(de ? 'Lernprofil gespeichert.' : 'Learning profile saved.');
        },
      ),
    ],
  });
}

function buildSystemPrompt(promptText, course, lang) {
  const de = lang !== 'en';
  const areas = course.areas.map((id) => `${id} (${catalog.areaLabel(id, lang)})`).join(', ');
  const lines = [
    promptText.trim(),
    '',
    de ? '## Aktueller Kurs' : '## Current course',
    `**${courseName(course, lang)}**`,
    course.notes[de ? 'de' : 'en'],
    de ? `Katalogbereiche dieses Kurses für load_exam_task: ${areas}.` : `Catalog topics of this course for load_exam_task: ${areas}.`,
    de
      ? 'Antworte auf Deutsch, englische Fachbegriffe mit deutscher Erklärung.'
      : 'Answer in English; keep German exam terms (e.g. Lastenheft, AP 1) and explain them.',
  ];
  return lines.join('\n');
}

// Claude Code treats messages that start with "/" as its own slash commands,
// so the course commands (/weiter, /status …) are sent as plain text.
function toPrompt(text, lang) {
  const trimmed = String(text).trim();
  if (!trimmed.startsWith('/')) return trimmed;
  return `${lang === 'en' ? 'Command' : 'Befehl'}: ${trimmed}`;
}

function buildKickoff({ course, state, others, lang, date }) {
  const de = lang !== 'en';
  const lines = [`[Patchfeld · ${courseName(course, lang)} · ${de ? 'Tag' : 'Day'} ${state.day}]`];
  if (state.profile) {
    lines.push(de ? 'Neue Tages-Session. Gespeichertes Lernprofil:' : 'New daily session. Saved learning profile:');
    lines.push('```json', JSON.stringify(state.profile, null, 2), '```');
  } else {
    lines.push(de
      ? 'Erster Start dieses Kurses – es gibt noch kein Lernprofil. Beginne mit Phase 0.'
      : 'First start of this course – there is no learning profile yet. Begin with phase 0.');
  }
  if (others.length) {
    lines.push(de ? 'Stand in den anderen Kursen:' : 'Progress in the other courses:');
    for (const other of others) {
      const goals = other.goals ? ` – ${de ? 'Ziele' : 'goals'}: ${other.goals}` : '';
      lines.push(`- ${other.name}: Level ${other.level}, ${other.progress_percent} %${goals}`);
    }
  }
  lines.push(`${de ? 'Datum' : 'Date'}: ${date}`);
  return lines.join('\n');
}

const AUTH_ERRORS = new Set(['authentication_failed', 'oauth_org_not_allowed', 'verification_required', 'account_on_hold']);
const LIMIT_ERRORS = new Set(['rate_limit', 'billing_error']);

function classifyError(error) {
  if (AUTH_ERRORS.has(error)) return { code: 'auth', message: error };
  if (LIMIT_ERRORS.has(error)) return { code: 'limit', message: error };
  return { code: 'generic', message: String(error) };
}

async function runTurn(opts) {
  const { sdk, course, state, prompt, lang, send, save } = opts;
  const courseId = course.id;
  const de = lang !== 'en';

  const setExercise = (exercise, chip) => {
    state.exercise = exercise;
    state.answer = exercise.kind === 'free' ? exercise.answer_template || '' : '';
    state.taskAnswer = null;
    state.transcript.push(chip);
    send('exercise:set', { courseId, exercise });
    save();
  };

  const server = createToolServer(sdk, {
    onExercise: (args) => {
      setExercise({ kind: 'free', title: args.title, instructions: args.instructions, answer_template: args.answer_template || '' },
        { type: 'tool', name: TOOL.exercise, title: args.title });
    },
    onTask: (args) => {
      const area = String(args.area || '').trim();
      const type = catalog.TYPES.includes(String(args.type || '').trim()) ? String(args.type).trim() : '';
      const task = catalog.pickTask({ areas: area ? [area] : course.areas, type, exclude: state.usedTasks || [], lang });
      if (!task) return de ? 'Im Katalog gibt es dazu keine Aufgabe. Schreib eine eigene mit set_exercise.' : 'There is no catalog task for this. Write your own with set_exercise.';
      const title = `${catalog.areaLabel(task.a, lang)} · ${typeLabel(task.t, lang)}`;
      state.usedTasks = [...(state.usedTasks || []), task.id].slice(-300);
      setExercise({ kind: 'catalog', title, task }, { type: 'tool', name: TOOL.task, title });
      return [
        de ? `Die Aufgabe (${task.id}) liegt im Arbeitsbereich. Sie lautet:` : `The task (${task.id}) is in the work area. It reads:`,
        '',
        catalog.taskMarkdown(task, lang),
        '',
        de ? '--- Lösung – NUR für dich. Nicht verraten, bevor der Lernende geantwortet hat (Hilfe-Eskalation!) ---'
          : '--- Solution – for you ONLY. Do not reveal it before the learner has answered (help escalation!) ---',
        catalog.solutionMarkdown(task, lang),
        '',
        de ? 'Sag in einem Satz, dass die Aufgabe im Arbeitsbereich liegt, und warte. Die App prüft die Antwort automatisch und schickt dir das Ergebnis.'
          : 'Say in one sentence that the task is in the work area, then wait. The app checks the answer automatically and sends you the result.',
      ].join('\n');
    },
    onProfile: (profile) => {
      state.profile = profile;
      state.transcript.push({ type: 'tool', name: TOOL.profile });
      send('profile:update', { courseId, profile });
      save();
    },
  }, lang);

  const options = {
    systemPrompt: buildSystemPrompt(opts.promptText, course, lang),
    tools: [], // no files, no shell – only the three app tools
    mcpServers: { [SERVER]: server },
    allowedTools: ALLOWED_TOOLS,
    permissionMode: 'dontAsk',
    settingSources: [], // ignore the user's own Claude Code settings and CLAUDE.md files
    includePartialMessages: true,
    maxTurns: 12,
    cwd: opts.cwd,
    env: opts.env,
  };
  if (state.sessionId) options.resume = state.sessionId;
  if (opts.model) options.model = opts.model;
  if (opts.effort) options.effort = opts.effort;
  if (opts.claudePath) options.pathToClaudeCodeExecutable = opts.claudePath;

  let error = null;
  try {
    for await (const message of sdk.query({ prompt, options })) {
      if (message.type === 'system' && message.subtype === 'init') {
        state.sessionId = message.session_id;
      } else if (message.type === 'stream_event') {
        const event = message.event;
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send('mentor:delta', { courseId, delta: event.delta.text });
        }
      } else if (message.type === 'assistant') {
        if (message.error) error = error || message.error;
        for (const block of message.message.content || []) {
          if (block.type === 'text' && block.text.trim()) state.transcript.push({ type: 'mentor', text: block.text });
        }
        // Each completed block ends the current chat bubble; the next text starts a new one.
        send('mentor:segment', { courseId });
      } else if (message.type === 'result') {
        if (message.session_id) state.sessionId = message.session_id;
        if (message.is_error && !error) {
          error = message.subtype === 'success'
            ? message.result || 'error'
            : (message.errors || []).join('; ') || message.subtype;
        }
      }
    }
  } catch (err) {
    if (!error) error = err && err.message ? err.message : String(err);
  }
  save();
  return error ? { ok: false, error: classifyError(error) } : { ok: true };
}

module.exports = {
  SERVER,
  TOOL,
  ALLOWED_TOOLS,
  loadSdk,
  buildSystemPrompt,
  buildKickoff,
  toPrompt,
  classifyError,
  runTurn,
};
