'use strict';

// Renders the README graphics with Electron:  npm run graphics
//   docs/assets/banner-de.png, banner-en.png   header banners
//   build/icon.png, docs/assets/icon.png       app icon (electron-builder picks up build/icon.png)
//   docs/assets/screenshot-*-de|en.png         real screenshots of the running app
// The app runs from a throwaway data folder filled with docs/graphics/demo-*.json; the task in the
// work area is a real catalog task and is really checked by the app, not faked.
const { app, BrowserWindow, nativeTheme } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GRAPHICS = path.join(ROOT, 'docs', 'graphics');
const ASSETS = path.join(ROOT, 'docs', 'assets');
const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'patchfeld-graphics-'));
const DATA_FILE = path.join(DATA_DIR, 'patchfeld-data.json');
const catalog = require('../src/main/catalog');

// Demo state with a real subnetting task (fixed values for a stable picture).
function writeDemo(lang) {
  const demo = JSON.parse(fs.readFileSync(path.join(GRAPHICS, `demo-${lang}.json`), 'utf8'));
  let task = null;
  for (let i = 0; i < 400 && !task; i += 1) {
    const t = catalog.pickTask({ areas: ['net'], type: 'in', lang });
    if (t.id === 'net-01' && /\/26\b/.test(t.s)) task = t;
  }
  if (!task) task = catalog.pickTask({ areas: ['net'], type: 'in', lang });
  demo.courses.lj1.exercise = { kind: 'catalog', title: lang === 'en' ? 'Network fundamentals · calculation' : 'Netzwerkgrundlagen · Rechenaufgabe', task };
  demo.courses.lj1.taskAnswer = null;
  fs.writeFileSync(DATA_FILE, JSON.stringify(demo));
  return task;
}

app.setPath('userData', DATA_DIR);
// Started as `electron scripts/graphics.js`, Electron would report its own version number.
const pkg = require('../package.json');
app.getVersion = () => pkg.version;
let currentTask = writeDemo('de');
require('../src/main/main.js'); // registers protocol and IPC, creates the app window
const store = require('../src/main/store');

let appWindow = null;
app.on('browser-window-created', (_event, win) => {
  if (!appWindow) appWindow = win;
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function save(image, ...targets) {
  const png = image.toPNG();
  const { width, height } = image.getSize();
  for (const target of targets) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, png);
    console.log(`✓ ${path.relative(ROOT, target)} (${width}×${height})`);
  }
}

async function renderPage(file, query, width, height, ...targets) {
  const win = new BrowserWindow({
    width,
    height,
    useContentSize: true,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: { offscreen: true },
  });
  await win.loadFile(path.join(GRAPHICS, file), { query });
  await win.webContents.executeJavaScript('document.fonts.ready.then(() => true)');
  await sleep(400);
  save(await win.webContents.capturePage(), ...targets);
  win.destroy();
}

const js = (code) => appWindow.webContents.executeJavaScript(code);

async function waitFor(expression, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await js(`Boolean(${expression})`)) return;
    await sleep(150);
  }
  throw new Error(`Zeitüberschreitung beim Warten auf: ${expression}`);
}

async function shot(name, lang, rect) {
  appWindow.webContents.invalidate();
  await sleep(500);
  save(await appWindow.webContents.capturePage(rect), path.join(ASSETS, `screenshot-${name}-${lang}.png`));
}

async function load(url) {
  await appWindow.loadURL(url);
  await sleep(300);
}

// Demo progress for the exam trainer (stored in the page's localStorage).
const TRAINER_DEMO = `(() => {
  const z = (n) => String(n).padStart(2, '0');
  const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); };
  const cards = {};
  Q.forEach((q, i) => {
    if (['hw', 'bs', 'net', 'kfm', 'ergo', 'dienste', 'sec', 'ad'].includes(q.a) && i % 3 !== 2) {
      const b = 1 + (i % 5);
      cards[q.id] = { b, due: day(i % 4 === 0 ? 0 : (i % 7) + 1), n: b + 1, r: b, w: 1, ms: (b + 1) * 19000, last: day(-1) };
    }
  });
  const counts = [24, 20, 31, 18, 22, 27, 21, 26, 30, 23, 20, 28, 25];
  const days = {};
  counts.forEach((n, k) => { days[day(k - 13)] = { n, c: Math.round(n * 0.78), ms: n * 20000, met: n >= 20 }; });
  days[day(0)] = { n: 14, c: 11, ms: 280000 };
  const hits = [6, 7, 7, 8, 6, 9, 8, 7, 9, 8, 10, 8, 9, 7, 9, 10, 8, 9];
  const rounds = hits.map((c, i) => ({ date: day(i - 17), mode: 'round', area: ['net', 'hw', 'dienste', 'sec', 'bs'][i % 5], n: 10, c, xp: 120, ms: 420000 }));
  return { v: 1, created: day(-40), xp: 5600, cards,
    mistakes: { 'net-01': { n: 2, last: day(-1) }, 'dienste-03': { n: 1, last: day(-2) }, 'kfm-01': { n: 1, last: day(-3) } },
    days, rounds, exams: [{ date: day(-6), type: 'AP1', pct: 72, ms: 4800000, byArea: {}, weak: ['dienste', 'kfm', 'sec'] }],
    badges: { first: day(-30), streak3: day(-20), streak7: day(-10), allareas: day(-5) },
    stats: { bestCombo: 12, cleared: 6, subnetOk: 14, openDone: 4, bestStreak: 12 },
    settings: { lang: null, theme: 'dark', goal: 20, year: 2, examType: 'AP1', examDate: day(52) }, lastVersion: null, activeExam: null };
})()`;

async function captureApp(lang) {
  await js(`localStorage.setItem('patchfeld.v1', JSON.stringify(${TRAINER_DEMO}))`);
  await load('patchfeld://app/index.html');
  await waitFor("document.querySelectorAll('.course-tile').length === 5");
  await sleep(600);
  await shot('home', lang, { x: 0, y: 0, width: 1440, height: 800 });

  await js("document.querySelectorAll('.course-tile')[0].click()");
  await waitFor("!document.querySelector('#course').hidden && document.querySelectorAll('#messages .msg').length > 3");
  // Type the correct result into the task fields and let the app check it.
  const values = currentTask.f.map((f) => (typeof f.v === 'number' ? String(f.v) : f.v));
  await js(`(${JSON.stringify(values)}).forEach((v, i) => { const input = document.getElementById('f' + i); input.value = v; input.dispatchEvent(new Event('input', { bubbles: true })); }); document.querySelector('#check-btn').click();`);
  await waitFor("document.querySelector('#result .verdict')");
  await js("document.activeElement.blur(); document.querySelector('#messages').scrollTop = 1e9;");
  await shot('course', lang);

  await js("document.querySelector('#toggle-profile').click()");
  await sleep(400);
  await shot('profile', lang);
  await js("document.querySelector('#toggle-profile').click()");

  await load('patchfeld://app/trainer.html#start');
  await waitFor("document.querySelectorAll('.port').length === 18");
  await sleep(600);
  await shot('trainer', lang);
}

app.whenReady()
  .then(async () => {
    await sleep(300);
    if (!appWindow) throw new Error('Das App-Fenster wurde nicht erstellt.');
    nativeTheme.themeSource = 'dark'; // same look as the banner, independent of the Windows theme
    appWindow.setContentSize(1440, 900);
    appWindow.webContents.setBackgroundThrottling(false);
    if (appWindow.webContents.isLoading()) {
      await new Promise((resolve) => appWindow.webContents.once('did-finish-load', resolve));
    }

    await renderPage('banner.html', { lang: 'de' }, 1600, 560, path.join(ASSETS, 'banner-de.png'));
    await renderPage('banner.html', { lang: 'en' }, 1600, 560, path.join(ASSETS, 'banner-en.png'));
    await renderPage('icon.html', {}, 512, 512, path.join(ROOT, 'build', 'icon.png'), path.join(ASSETS, 'icon.png'));

    await captureApp('de');
    currentTask = writeDemo('en');
    store.load();
    await captureApp('en');
    app.exit(0);
  })
  .catch((err) => {
    console.error(err);
    app.exit(1);
  });
