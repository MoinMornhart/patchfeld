'use strict';

const { app, BrowserWindow, ipcMain, shell, protocol, Menu, dialog } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const store = require('./store');
const mentor = require('./mentor');
const setupUpdater = require('./updater');
const { COURSES, courseById, courseName } = require('../shared/courses');

if (!app) {
  // Happens when ELECTRON_RUN_AS_NODE is set: Electron then behaves like plain Node.
  console.error('Patchfeld muss mit Electron gestartet werden – bitte die Umgebungsvariable ELECTRON_RUN_AS_NODE entfernen.');
  process.exit(1);
}

// `electron . --selftest` starts hidden with a throwaway data folder, runs the renderer
// checks and exits with 0 (all passed) or 1.
const SELFTEST = process.argv.includes('--selftest');
if (SELFTEST) app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'patchfeld-selftest-')));

// The UI is served from patchfeld://app/… so that storage and fetch behave like on a
// normal secure origin (file:// blocks several of these).
protocol.registerSchemesAsPrivileged([
  { scheme: 'patchfeld', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

const RENDERER_DIR = path.join(__dirname, '..', 'renderer');
const PROMPTS_DIR = path.join(__dirname, '..', '..', 'prompts');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

let win = null;
let updater = null;
const busy = new Set();
const prompts = {};

function send(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
}

function loadPrompt(lang) {
  if (!prompts[lang]) prompts[lang] = fs.readFileSync(path.join(PROMPTS_DIR, `mentor.${lang}.md`), 'utf8');
  return prompts[lang];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function requireCourse(id) {
  const course = courseById(id);
  if (!course) throw new Error(`Unbekannter Kurs: ${id}`);
  return course;
}

function publicSettings() {
  const s = store.get().settings;
  return { uiLang: s.uiLang, model: s.model, effort: s.effort, hasApiKey: Boolean(s.apiKeyEnc) };
}

// In the installed app the Claude Code binary must run from app.asar.unpacked.
// In development the SDK finds its bundled binary on its own.
function claudeExecutable() {
  if (!app.isPackaged) return undefined;
  const exe = process.platform === 'win32' ? 'claude.exe' : 'claude';
  return path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@anthropic-ai',
    `claude-agent-sdk-${process.platform}-${process.arch}`, exe);
}

function mentorWorkspace() {
  const dir = path.join(app.getPath('userData'), 'mentor-workspace');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function openExternalSafe(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') shell.openExternal(parsed.toString());
  } catch {
    // not a URL – ignore
  }
}

function resolveAppUrl(requestUrl) {
  const rel = decodeURIComponent(new URL(requestUrl).pathname).replace(/^\/+/, '');
  const full = path.normalize(path.join(RENDERER_DIR, rel));
  return full.startsWith(RENDERER_DIR + path.sep) ? full : null; // blocks ../ escapes
}

function registerProtocol() {
  protocol.handle('patchfeld', async (request) => {
    const full = resolveAppUrl(request.url);
    if (!full) return new Response('Not found', { status: 404 });
    try {
      const body = await fs.promises.readFile(full);
      const type = MIME[path.extname(full).toLowerCase()] || 'application/octet-stream';
      return new Response(body, { headers: { 'content-type': type } });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
}

function otherCourseSummaries(id, lang) {
  return COURSES
    .filter((c) => c.id !== id)
    .map((c) => ({ course: c, state: store.peekCourse(c.id) }))
    .filter((x) => x.state && x.state.profile)
    .map((x) => ({
      name: courseName(x.course, lang),
      level: x.state.profile.level,
      progress_percent: x.state.profile.progress_percent,
      goals: x.state.profile.goals,
    }));
}

async function withTurn(id, prepare) {
  const course = requireCourse(id);
  if (busy.has(id)) return { ok: false, error: { code: 'busy' } };
  busy.add(id);
  try {
    const settings = store.get().settings;
    const state = store.course(id);
    const prompt = prepare(state, course, settings.uiLang);
    store.save();
    const apiKey = store.getApiKey();
    return await mentor.runTurn({
      sdk: await mentor.loadSdk(),
      course,
      state,
      prompt,
      lang: settings.uiLang,
      model: settings.model,
      effort: settings.effort,
      promptText: loadPrompt(settings.uiLang),
      cwd: mentorWorkspace(),
      claudePath: claudeExecutable(),
      env: {
        ...process.env,
        CLAUDE_AGENT_SDK_CLIENT_APP: `patchfeld/${app.getVersion()}`,
        ...(apiKey ? { ANTHROPIC_API_KEY: apiKey } : {}),
      },
      send,
      save: () => store.saveSoon(),
    });
  } catch (err) {
    return { ok: false, error: { code: 'generic', message: err.message } };
  } finally {
    busy.delete(id);
    store.save();
  }
}

function registerIpc() {
  ipcMain.handle('app:info', () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    selftest: SELFTEST,
  }));

  ipcMain.handle('settings:get', () => publicSettings());
  ipcMain.handle('settings:set', (_event, patch = {}) => {
    const s = store.get().settings;
    if (patch.uiLang === 'de' || patch.uiLang === 'en') s.uiLang = patch.uiLang;
    if (['', 'opus', 'sonnet'].includes(patch.model)) s.model = patch.model;
    if (['low', 'medium', 'high'].includes(patch.effort)) s.effort = patch.effort;
    try {
      if ('apiKey' in patch) store.setApiKey(String(patch.apiKey || '').trim());
      store.save();
      return publicSettings();
    } catch (err) {
      return { ...publicSettings(), error: err.message };
    }
  });

  ipcMain.handle('courses:list', () => COURSES.map((c) => {
    const state = store.peekCourse(c.id);
    const { notes, ...course } = c;
    return {
      ...course,
      day: state ? state.day : 0,
      profile: state && state.profile
        ? { level: state.profile.level, progress_percent: state.profile.progress_percent }
        : null,
    };
  }));

  ipcMain.handle('course:get', (_event, id) => {
    requireCourse(id);
    const state = store.course(id);
    return {
      id,
      transcript: state.transcript,
      profile: state.profile,
      exercise: state.exercise,
      answer: state.answer,
      taskAnswer: state.taskAnswer,
      day: state.day,
      busy: busy.has(id),
    };
  });

  ipcMain.handle('course:saveAnswer', (_event, id, answer, taskAnswer) => {
    requireCourse(id);
    const state = store.course(id);
    state.answer = String(answer || '').slice(0, 100000);
    state.taskAnswer = taskAnswer === undefined ? state.taskAnswer : taskAnswer;
    store.saveSoon();
  });

  ipcMain.handle('course:send', (_event, id, text) => {
    const clean = String(text || '').trim();
    if (!clean) return { ok: false, error: { code: 'generic', message: 'empty' } };
    return withTurn(id, (state, _course, lang) => {
      state.transcript.push({ type: 'user', text: clean });
      return mentor.toPrompt(clean, lang);
    });
  });

  ipcMain.handle('course:startDay', (_event, id) => withTurn(id, (state, course, lang) => {
    if (state.transcript.length) {
      state.archive.push({ day: state.day, transcript: state.transcript });
      state.archive = state.archive.slice(-60);
    }
    state.transcript = [];
    state.sessionId = null; // every learning day is a fresh Claude Code session
    state.day += 1;
    state.sessionDates.push(today());
    const kickoff = mentor.buildKickoff({ course, state, others: otherCourseSummaries(id, lang), lang, date: today() });
    state.transcript.push({ type: 'day', text: kickoff.split('\n')[0] });
    return kickoff;
  }));

  ipcMain.handle('course:reset', (_event, id) => {
    requireCourse(id);
    if (busy.has(id)) return { ok: false };
    store.resetCourse(id);
    return { ok: true };
  });

  ipcMain.handle('update:check', () => updater.check());
  ipcMain.handle('update:install', () => updater.install());
  ipcMain.handle('shell:open', (_event, url) => openExternalSafe(url));
  ipcMain.handle('file:save', async (_event, name, content) => {
    const result = await dialog.showSaveDialog(win, {
      defaultPath: path.join(app.getPath('documents'), String(name || 'patchfeld.json').replace(/[\\/:*?"<>|]/g, '_')),
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (result.canceled || !result.filePath) return { saved: false };
    await fs.promises.writeFile(result.filePath, String(content || ''), 'utf8');
    return { saved: true };
  });

  ipcMain.on('selftest:result', (_event, result) => {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    app.exit(result && result.ok ? 0 : 1);
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 620,
    show: false,
    backgroundColor: '#0f1117',
    title: 'Patchfeld',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternalSafe(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('patchfeld://')) {
      event.preventDefault();
      openExternalSafe(url);
    }
  });
  if (SELFTEST) {
    win.webContents.on('console-message', (event) => {
      if (event && event.message) process.stderr.write(`[renderer] ${event.message}\n`);
    });
    win.webContents.on('render-process-gone', () => app.exit(3));
  } else {
    win.once('ready-to-show', () => win.show());
  }
  win.loadURL('patchfeld://app/index.html');
  win.on('closed', () => { win = null; });
}

if (!SELFTEST && !app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    store.load();
    registerProtocol();
    registerIpc();
    if (app.isPackaged) Menu.setApplicationMenu(null);
    updater = setupUpdater({ enabled: app.isPackaged && !SELFTEST, send });
    createWindow();
    if (SELFTEST) {
      setTimeout(() => {
        process.stderr.write('selftest timeout\n');
        app.exit(2);
      }, 180000);
    }
  });

  app.on('before-quit', () => {
    try {
      store.save();
    } catch {
      // nothing sensible left to do
    }
  });
  app.on('window-all-closed', () => app.quit());
}
