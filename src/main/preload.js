'use strict';

// Bridge between the sandboxed renderer and the main process. Only these calls exist.
const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);
const subscribe = (channel) => (callback) => {
  const handler = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};

contextBridge.exposeInMainWorld('patchfeld', {
  getInfo: () => invoke('app:info'),
  getSettings: () => invoke('settings:get'),
  setSettings: (patch) => invoke('settings:set', patch),
  listCourses: () => invoke('courses:list'),
  getCourse: (id) => invoke('course:get', id),
  saveAnswer: (id, answer, taskAnswer) => invoke('course:saveAnswer', id, answer, taskAnswer),
  startDay: (id) => invoke('course:startDay', id),
  send: (id, text) => invoke('course:send', id, text),
  resetCourse: (id) => invoke('course:reset', id),
  checkUpdates: () => invoke('update:check'),
  installUpdate: () => invoke('update:install'),
  openExternal: (url) => invoke('shell:open', url),
  saveFile: (name, content) => invoke('file:save', name, content),
  selftestResult: (result) => ipcRenderer.send('selftest:result', result),
  onDelta: subscribe('mentor:delta'),
  onSegment: subscribe('mentor:segment'),
  onProfile: subscribe('profile:update'),
  onExercise: subscribe('exercise:set'),
  onUpdate: subscribe('update:status'),
});
