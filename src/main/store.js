'use strict';

// Persists settings and course progress as JSON in the app's userData folder
// (%APPDATA%\Patchfeld\patchfeld-data.json). The optional API key is encrypted with safeStorage.
const fs = require('fs');
const path = require('path');
const { app, safeStorage } = require('electron');

let data = null;
let file = null;
let saveTimer = null;

function defaultSettings() {
  return {
    uiLang: app.getLocale().toLowerCase().startsWith('de') ? 'de' : 'en',
    model: '',
    effort: 'medium',
    apiKeyEnc: null,
  };
}

function emptyCourse() {
  return {
    sessionId: null, // Claude Code session of the current learning day
    transcript: [], // what the chat shows: {type: 'user'|'mentor'|'day'|'tool', ...}
    profile: null,
    exercise: null, // {kind: 'free', title, instructions, answer_template} or {kind: 'catalog', title, task}
    answer: '', // free-text answer / calculation of the current exercise
    taskAnswer: null, // answer state of a catalog task (options, fields, order …)
    usedTasks: [], // catalog ids already given in this course (avoids repeats)
    day: 0,
    archive: [], // transcripts of earlier days
    sessionDates: [],
  };
}

function load() {
  file = path.join(app.getPath('userData'), 'patchfeld-data.json');
  data = { settings: defaultSettings(), courses: {} };
  try {
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    data.settings = { ...data.settings, ...saved.settings };
    for (const [id, course] of Object.entries(saved.courses || {})) {
      data.courses[id] = { ...emptyCourse(), ...course };
    }
  } catch {
    // first start or unreadable file – begin with defaults
  }
  return data;
}

function get() {
  return data;
}

function course(id) {
  if (!data.courses[id]) data.courses[id] = emptyCourse();
  return data.courses[id];
}

function peekCourse(id) {
  return data.courses[id] || null;
}

function resetCourse(id) {
  delete data.courses[id];
  save();
}

function save() {
  clearTimeout(saveTimer);
  saveTimer = null;
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, file);
}

function saveSoon() {
  if (!saveTimer) saveTimer = setTimeout(save, 500);
}

function setApiKey(key) {
  if (!key) {
    data.settings.apiKeyEnc = null;
  } else {
    if (!safeStorage.isEncryptionAvailable()) throw new Error('Verschlüsselung ist auf diesem System nicht verfügbar.');
    data.settings.apiKeyEnc = safeStorage.encryptString(key).toString('base64');
  }
  save();
}

function getApiKey() {
  if (!data.settings.apiKeyEnc) return null;
  try {
    return safeStorage.decryptString(Buffer.from(data.settings.apiKeyEnc, 'base64'));
  } catch {
    return null;
  }
}

module.exports = { load, get, course, peekCourse, resetCourse, save, saveSoon, setApiKey, getApiKey };
