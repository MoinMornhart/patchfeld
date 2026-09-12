/* =====================================================================
   APP – Teil 1: Zustand, Sprache, Leitner, XP, Abzeichen, Update, Backup
   ===================================================================== */
const LS_KEY = 'patchfeld.v1';
const INTERVALS = [1, 3, 7, 16, 35];
const ROUND_SIZE = 10, LIVES = 3;
const EXAMS = {
  AP1: {n:30, min:90,  years:{1:0.5, 2:0.5}, de:'Abschlussprüfung Teil 1', en:'Final exam part 1'},
  AP2: {n:40, min:120, years:{2:0.4, 3:0.6}, de:'Abschlussprüfung Teil 2', en:'Final exam part 2'}
};
const XP_BASE = {sc:10, mc:12, match:15, order:15, in:15, open:10};
const RANKS = [[1,'Azubi','Apprentice'],[3,'Kabelzieher','Cable puller'],[5,'First-Level-Support','First-level support'],[8,'Second-Level-Support','Second-level support'],[12,'Junior-Admin','Junior admin'],[17,'Systemadministrator','System administrator'],[23,'Netzwerk-Engineer','Network engineer'],[30,'Senior-Administrator','Senior administrator'],[38,'IT-Consultant','IT consultant'],[47,'Systemarchitekt','Systems architect']];
const HOST_THEME = document.documentElement.getAttribute('data-theme');
const bridge = window.patchfeld || null; // Desktop-App (Electron) – im reinen Browser nicht vorhanden
let APP_VERSION = '';

/* ---------- Datum ---------- */
function todayStr(d = new Date()){ const z = n => String(n).padStart(2,'0'); return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`; }
function addDays(s, n){ const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return todayStr(d); }
function diffDays(a, b){ return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5); }
function fmtDate(s){ if (!s) return ''; const d = new Date(s + 'T12:00:00'); return d.toLocaleDateString(L==='en'?'en-GB':'de-DE', {day:'2-digit', month:'2-digit', year:'numeric'}); }

/* ---------- Zustand ---------- */
const DEFAULT = () => ({
  v:1, created: todayStr(), xp:0, cards:{}, mistakes:{}, days:{}, rounds:[], exams:[], badges:{},
  stats:{bestCombo:0, cleared:0, subnetOk:0, openDone:0, bestStreak:0},
  settings:{lang:null, theme:'auto', goal:20, year:1, examType:'AP1', examDate:''},
  lastVersion:null, activeExam:null
});
let st = DEFAULT();
function hydrate(data){
  const d = DEFAULT(), s = Object.assign(d, data || {});
  s.settings = Object.assign(DEFAULT().settings, (data && data.settings) || {});
  s.stats = Object.assign(DEFAULT().stats, (data && data.stats) || {});
  return s;
}
function load(){ try { const raw = localStorage.getItem(LS_KEY); st = hydrate(raw ? JSON.parse(raw) : null); } catch(e){ st = DEFAULT(); } }
let saveWarned = false;
function save(){ try { localStorage.setItem(LS_KEY, JSON.stringify(st)); } catch(e){ if (!saveWarned){ saveWarned = true; toast(x('Speichern im Browser nicht möglich – bitte regelmäßig exportieren.','Cannot save in this browser – please export regularly.')); } } }

/* ---------- Level & Ränge ---------- */
const levelOf = xp => Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
const xpFor = lv => 50 * (lv - 1) * lv;
function rankOf(lv){ let r = RANKS[0]; for (const k of RANKS) if (lv >= k[0]) r = k; return L==='en' ? r[2] : r[1]; }
function nextRank(lv){ const r = RANKS.find(k => k[0] > lv); return r ? {lv:r[0], name:L==='en'?r[2]:r[1]} : null; }
const comboMult = c => c >= 8 ? 3 : c >= 5 ? 2 : c >= 3 ? 1.5 : 1;
function addXp(n){
  const before = levelOf(st.xp); st.xp += Math.round(n); const after = levelOf(st.xp);
  if (after > before) toast(`${x('Level','Level')} ${after} · ${rankOf(after)}`, 'LEVEL UP');
}

/* ---------- Tage, Serie, Fälligkeit ---------- */
function streak(){
  let d = todayStr(), c = 0;
  if (!(st.days[d] && st.days[d].met)) d = addDays(d, -1);
  while (st.days[d] && st.days[d].met){ c++; d = addDays(d, -1); }
  return c;
}
const todayDay = () => st.days[todayStr()] || {n:0, c:0, ms:0};
function dueIds(filter){
  const t = todayStr();
  return Object.keys(st.cards).filter(id => QI[id] && st.cards[id].b > 0 && st.cards[id].due <= t && (!filter || filter(QI[id])));
}
function areaStats(a){
  const qs = Q.filter(q => q.a === a); let sum = 0, seen = 0, mast = 0, r = 0, w = 0, n = 0, ms = 0;
  const box = [0,0,0,0,0,0];
  for (const q of qs){ const c = st.cards[q.id]; if (c){ sum += c.b; seen++; if (c.b >= 3) mast++; r += c.r; w += c.w; n += c.n; ms += c.ms; box[c.b]++; } else box[0]++; }
  return {total:qs.length, seen, mast, mastery: qs.length ? sum / (qs.length * 5) : 0, rate: (r + w) ? r / (r + w) : null, n, avgMs: n ? ms / n : null, box};
}

/* ---------- Ergebnis verbuchen ---------- */
function record(o, score, ms, mode){
  const t = todayStr(); ms = Math.min(ms || 0, 300000);
  const c = st.cards[o.id] || (st.cards[o.id] = {b:0, due:null, n:0, r:0, w:0, ms:0});
  c.n++; c.ms += ms; c.last = t;
  if (score === 1){ c.b = Math.min(5, c.b + 1); c.due = addDays(t, INTERVALS[c.b - 1]); c.r++; }
  else if (score === 0.5){ c.b = Math.max(1, c.b); c.due = addDays(t, 1); c.r += 0.5; c.w += 0.5; }
  else { c.b = 1; c.due = addDays(t, 1); c.w++; const m = st.mistakes[o.id] || (st.mistakes[o.id] = {n:0}); m.n++; m.last = t; }
  if (score === 1 && mode === 'mistakes' && st.mistakes[o.id]){ delete st.mistakes[o.id]; st.stats.cleared++; }
  const d = st.days[t] || (st.days[t] = {n:0, c:0, ms:0});
  d.n++; d.c += score; d.ms += ms;
  if (!d.met && d.n >= st.settings.goal){ d.met = true; toast(x(`Tagesziel erreicht – Serie: ${streak()} Tag(e)`, `Daily goal reached – streak: ${streak()} day(s)`), x('ZIEL','GOAL')); }
  if (score === 1 && QI[o.id] && /^subnet/.test(QI[o.id].gen || '')) st.stats.subnetOk++;
  if (o.t === 'open') st.stats.openDone++;
  st.stats.bestStreak = Math.max(st.stats.bestStreak, streak());
}

/* ---------- Abzeichen ---------- */
const BADGES = [
  {id:'first',    de:['Erster Link','Erste Runde abgeschlossen'], en:['First link','First round completed'], t:() => st.rounds.length >= 1},
  {id:'perfect',  de:['Fehlerfrei','Runde mit 10 von 10 richtig'], en:['Flawless','Round with 10 out of 10 correct'], t:() => st.rounds.some(r => r.n >= 10 && r.c === r.n)},
  {id:'combo10',  de:['Vollduplex','Kombo von 10 richtigen Antworten in Folge'], en:['Full duplex','Combo of 10 correct answers in a row'], t:() => st.stats.bestCombo >= 10},
  {id:'streak3',  de:['Link up','Serie von 3 Tagen'], en:['Link up','3-day streak'], t:() => st.stats.bestStreak >= 3},
  {id:'streak7',  de:['Dauerbetrieb','Serie von 7 Tagen'], en:['Always on','7-day streak'], t:() => st.stats.bestStreak >= 7},
  {id:'streak30', de:['Five Nines','Serie von 30 Tagen'], en:['Five nines','30-day streak'], t:() => st.stats.bestStreak >= 30},
  {id:'allareas', de:['Voll gepatcht','In jedem Bereich mindestens eine Frage beantwortet'], en:['Fully patched','Answered at least one question in every topic'], t:() => AREAS.every(a => Q.some(q => q.a === a.id && st.cards[q.id]))},
  {id:'box5',     de:['Langzeitspeicher','10 Karten in Fach 5'], en:['Long-term storage','10 cards in box 5'], t:() => Object.values(st.cards).filter(c => c.b === 5).length >= 10},
  {id:'subnet20', de:['Subnetz-Profi','20 Subnetting-Aufgaben richtig gelöst'], en:['Subnet pro','20 subnetting tasks solved correctly'], t:() => st.stats.subnetOk >= 20},
  {id:'cleared10',de:['Aufgeräumt','10 Einträge im Fehlerbuch abgearbeitet'], en:['Cleaned up','10 mistake log entries resolved'], t:() => st.stats.cleared >= 10},
  {id:'open10',   de:['Redegewandt','10 offene Fachgesprächsfragen bearbeitet'], en:['Well spoken','10 open interview questions practised'], t:() => st.stats.openDone >= 10},
  {id:'exam50',   de:['Bestanden','Eine Prüfungssimulation mit mindestens 50 % bestanden'], en:['Passed','Passed an exam simulation with at least 50 %'], t:() => st.exams.some(e => e.pct >= 50)},
  {id:'exam92',   de:['Sehr gut','Eine Prüfungssimulation mit mindestens 92 %'], en:['Excellent','An exam simulation with at least 92 %'], t:() => st.exams.some(e => e.pct >= 92)},
  {id:'lvl12',    de:['Junior-Admin','Level 12 erreicht'], en:['Junior admin','Reached level 12'], t:() => levelOf(st.xp) >= 12},
  {id:'year1',    de:['Lehrjahr 1 gepatcht','Alle Fragen des 1. Lehrjahres mindestens in Fach 3'], en:['Year 1 patched','All year-1 questions in box 3 or higher'], t:() => Q.filter(q => AREA[q.a].y === 1).every(q => st.cards[q.id] && st.cards[q.id].b >= 3)}
];
function checkBadges(){
  for (const b of BADGES){
    if (!st.badges[b.id] && b.t()){ st.badges[b.id] = todayStr(); toast(`${b[L][0]} – ${b[L][1]}`, x('ABZEICHEN','BADGE')); }
  }
}

/* ---------- Theme & Sprache ---------- */
function applyTheme(){
  const t = st.settings.theme, root = document.documentElement;
  if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t);
  else if (HOST_THEME) root.setAttribute('data-theme', HOST_THEME);
  else root.removeAttribute('data-theme');
}
function pickLang(){
  const qp = new URLSearchParams(location.search).get('lang');
  if (qp === 'de' || qp === 'en') st.settings.lang = qp;
  L = st.settings.lang || ((navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en');
  document.documentElement.lang = L;
}

/* ---------- Backup ---------- */
function exportJSON(){ return JSON.stringify({app:'patchfeld', version:APP_VERSION, exported:new Date().toISOString(), data:st}, null, 1); }
function download(){
  if (bridge && bridge.saveFile){
    bridge.saveFile(`patchfeld-backup-${todayStr()}.json`, exportJSON()).then(r => { if (r && r.saved) toast(x('Fortschritt gespeichert.','Progress saved.')); });
    return;
  }
  try {
    const blob = new Blob([exportJSON()], {type:'application/json'}), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `patchfeld-backup-${todayStr()}.json`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  } catch(e){ toast(x('Download blockiert – nutze „Kopieren“.','Download blocked – use "Copy".')); }
}
function importJSON(text){
  let j; try { j = JSON.parse(text); } catch(e){ toast(x('Das ist kein gültiges JSON.','This is not valid JSON.')); return false; }
  const data = j && j.data ? j.data : j;
  if (!data || typeof data.cards !== 'object' || !data.settings){ toast(x('Die Datei enthält keinen Patchfeld-Spielstand.','The file does not contain Patchfeld progress.')); return false; }
  if (!confirm(x('Aktuellen Fortschritt durch den importierten ersetzen?','Replace current progress with the imported one?'))) return false;
  st = hydrate(data); st.lastVersion = APP_VERSION; save(); applyTheme(); pickLang(); toast(x('Fortschritt importiert.','Progress imported.')); return true;
}

/* ---------- UI-Helfer ---------- */
function toast(msg, tape){
  const el = document.createElement('div'); el.className = 'toast pop';
  el.innerHTML = (tape ? `<span class="tape">${esc(tape)}</span>` : '') + `<span>${esc(msg)}</span>`;
  const box = document.getElementById('toasts'); box.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}
function dialog(title, html){
  const d = document.createElement('dialog');
  d.innerHTML = `<div class="stack"><h2>${esc(title)}</h2><div>${html}</div><div class="row" style="justify-content:flex-end"><button class="btn" id="dlgOk">OK</button></div></div>`;
  document.body.appendChild(d); d.querySelector('#dlgOk').onclick = () => { d.close(); d.remove(); };
  try { d.showModal(); } catch(e){ d.setAttribute('open',''); }
}


/* =====================================================================
   APP – Teil 2: Ansichten (Start, Lernpfad, Training, Prüfung, Mehr …)
   ===================================================================== */
let view = 'start', session = null, ctx = {};
const main = document.getElementById('main');
const NAV = [
  ['start',    () => x('Start','Home'),      '<path d="M3 11l9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/>'],
  ['pfad',     () => x('Lernpfad','Path'),   '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M7 10h2M11 10h2M15 10h2M7 14h2M11 14h2"/>'],
  ['training', () => x('Training','Practice'),'<path d="M5 12h14M12 5l7 7-7 7"/>'],
  ['pruefung', () => x('Prüfung','Exam'),    '<circle cx="12" cy="13" r="7"/><path d="M12 13V9M12 3v3"/>'],
  ['mehr',     () => x('Mehr','More'),       '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>']
];
const NAV_OF = {stats:'mehr', glossar:'mehr', badges:'mehr', settings:'mehr', fehlerbuch:'training', karten:'training', quiz:'training', roundEnd:'training', exam:'pruefung', examResult:'pruefung'};

function go(v, c){
  if (session && v !== 'quiz' && v !== 'roundEnd' && !confirm(x('Laufende Runde abbrechen?','Abort the current round?'))) return;
  if (v !== 'quiz') session = null;
  view = v; ctx = c || {};
  if (location.hash !== '#' + v && !['quiz','exam','examResult','roundEnd'].includes(v)) history.replaceState(null, '', '#' + v);
  render(); window.scrollTo(0, 0);
}
function render(){
  renderHeader();
  main.innerHTML = (VIEWS[view] || VIEWS.start)();
  if (AFTER[view]) AFTER[view]();
}
function renderHeader(){
  document.getElementById('ver').textContent = APP_VERSION ? 'v' + APP_VERSION : '';
  document.getElementById('backCourses').textContent = x('← Kurse','← Courses');
  const td = todayDay(), s = streak(), due = dueIds().length, goal = st.settings.goal;
  document.getElementById('statleds').innerHTML =
    `<button class="sled" data-act="go" data-v="start" title="${x('Tagesserie','Daily streak')}"><span class="led ${td.met ? 'ok' : s ? 'warn' : ''}"></span><span class="t">${x('Serie','Streak')}</span><b>${s}</b></button>
     <button class="sled" data-act="go" data-v="start" title="${x('Tagesziel','Daily goal')}"><span class="led ${td.met ? 'ok' : td.n ? 'warn' : ''}"></span><span class="t">${x('Ziel','Goal')}</span><b>${td.n}/${goal}</b></button>
     <button class="sled" data-act="review" title="${x('Fällige Wiederholungen','Due reviews')}"><span class="led ${due ? 'warn blink' : 'ok'}"></span><span class="t">${x('Fällig','Due')}</span><b>${due}</b></button>`;
  const cur = NAV_OF[view] || view;
  document.getElementById('navin').innerHTML = NAV.map(([id, lab, ic]) =>
    `<button data-act="go" data-v="${id}" ${cur === id ? 'aria-current="page"' : ''}><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg>${lab()}</button>`).join('');
  document.getElementById('nav').setAttribute('aria-label', x('Hauptnavigation','Main navigation'));
}

/* ---------- Bausteine ---------- */
function portHTML(a, i){
  const s = areaStats(a.id), led = !s.seen ? '' : s.mastery >= 0.6 ? 'ok' : 'warn';
  return `<button class="port" data-act="round" data-area="${a.id}" title="${esc(areaName(a.id))} – ${x('Runde starten','start round')}">
    <span class="pl"><span class="led ${led}"></span>${String(i + 1).padStart(2, '0')}</span>
    <span class="jack wc-${a.w}">${s.seen ? `<span class="plug${a.s ? ' s' : ''}"></span>` : ''}</span>
    <span class="meter"><i style="width:${Math.round(s.mastery * 100)}%"></i></span>
    <span class="nm">${esc(areaName(a.id))}</span></button>`;
}
function patchPanel(y){
  const as = AREAS.filter(a => a.y === y), ex = y === 1 ? 'AP 1' : y === 2 ? 'AP 1 · AP 2' : 'AP 2';
  return `<div class="pp"><div class="pp-label"><span>${x(`${y}. Lehrjahr`, `Year ${y}`)}</span><span>${ex}</span></div>
    <div class="ear"><span class="screw"></span><span class="screw"></span></div>
    <div class="ports">${as.map(portHTML).join('')}</div>
    <div class="ear"><span class="screw"></span><span class="screw"></span></div></div>`;
}
function examTags(a){ return a.ex.map(e => `<span class="tag ${e === 'AP1' ? 'ap1' : e === 'AP2' ? 'ap2' : ''}">${e === 'WiSo' ? 'WiSo' : e.replace('AP', 'AP ')}</span>`).join(' '); }
function boxBar(s){
  const t = s.total || 1, seg = (n, cls) => n ? `<i class="${cls}" style="width:${n / t * 100}%"></i>` : '';
  return `<div class="bar" role="img" aria-label="${x('Karteikasten','Leitner box')}: ${s.box.join('/')}">${seg(s.box[5], 'b5')}${seg(s.box[3] + s.box[4], 'b34')}${seg(s.box[1] + s.box[2], 'b12')}</div>`;
}
const pct = v => v == null ? '–' : Math.round(v * 100) + ' %';

function suggestion(){
  const due = dueIds().length, mist = Object.keys(st.mistakes).filter(id => QI[id]).length;
  const exd = st.settings.examDate ? diffDays(todayStr(), st.settings.examDate) : null, et = st.settings.examType;
  if (due >= 5) return {w:'bl', title:x(`${due} Karten sind fällig`, `${due} cards are due`), text:x('Wiederholen sichert, was du schon kannst – der Karteikasten legt sie genau rechtzeitig vor.','Reviewing locks in what you know – the Leitner box brings cards back just in time.'), btn:x('Wiederholung starten','Start review'), act:'review'};
  if (exd != null && exd >= 0 && exd <= 30 && !st.exams.some(e => e.type === et && diffDays(e.date, todayStr()) <= 7))
    return {w:'or', title:x(`Noch ${exd} Tage bis zur ${et.replace('AP','AP ')}`, `${exd} days left until ${et.replace('AP','AP ')}`), text:x('Mach eine Prüfungssimulation unter Zeitdruck und sieh, wo du stehst.','Take a timed exam simulation and see where you stand.'), btn:x('Simulation starten','Start simulation'), act:'exam', data:`data-type="${et}"`};
  if (mist >= 5) return {w:'br', title:x(`${mist} Fragen im Fehlerbuch`, `${mist} questions in your mistake log`), text:x('Arbeite sie gezielt ab – richtig beantwortete Fragen verschwinden aus der Liste.','Work through them – correctly answered questions leave the list.'), btn:x('Fehlerbuch üben','Practise mistakes'), act:'mistakes'};
  const cand = AREAS.filter(a => a.y <= st.settings.year).map(a => ({a, s:areaStats(a.id)})).sort((p, q) => (p.s.mastery - q.s.mastery) || (q.a.y - p.a.y));
  const c = cand[0];
  if (c && c.s.mastery < 0.6) return {area:c.a.id, w:c.a.w, s:c.a.s, title:areaName(c.a.id), text:c.s.seen ? x(`Dein schwächster Bereich im Lernpfad: ${pct(c.s.mastery)} sicher.`, `Your weakest topic on the path: ${pct(c.s.mastery)} mastered.`) : x('Noch nicht begonnen – starte mit einer Runde.','Not started yet – begin with a round.'), btn:x('Runde starten','Start round'), act:'round', data:`data-area="${c.a.id}"`};
  if (due) return {w:'bl', title:x(`${due} Karten sind fällig`, `${due} cards are due`), text:x('Kurze Wiederholung für heute.','A short review for today.'), btn:x('Wiederholung starten','Start review'), act:'review'};
  return {w:'gr', title:x('Gemischte Runde','Mixed round'), text:x('Alles bis zu deinem Lehrjahr ist gut im Griff – misch die Themen durch oder schau ins nächste Lehrjahr.','Everything up to your year is in good shape – mix topics or look ahead to the next year.'), btn:x('Runde starten','Start round'), act:'round', data:`data-year="${Math.min(3, st.settings.year)}"`};
}
function recommendation(){
  const ex = EXAMS[st.settings.examType], qs = Q.filter(q => ex.years[AREA[q.a].y]);
  const left = qs.reduce((s, q) => s + Math.max(0, 3 - ((st.cards[q.id] || {}).b || 0)), 0);
  const days = Math.max(1, diffDays(todayStr(), st.settings.examDate));
  return {days, perDay: Math.max(5, Math.ceil(left / days) + dueIds(q => ex.years[AREA[q.a].y]).length), mast: qs.filter(q => (st.cards[q.id] || {}).b >= 3).length, total: qs.length};
}

/* ---------- Ansichten ---------- */
const VIEWS = {};
const AFTER = {};

VIEWS.start = () => {
  const lv = levelOf(st.xp), nx = xpFor(lv + 1), cur = xpFor(lv), nr = nextRank(lv), td = todayDay(), goal = st.settings.goal, s = streak();
  const segs = Math.min(40, Math.max(goal, td.n));
  const week = [...Array(7)].map((_, i) => { const d = addDays(todayStr(), i - 6), dd = st.days[d]; return `<span title="${fmtDate(d)}: ${dd ? dd.n : 0}" class="led ${dd && dd.met ? 'ok' : dd && dd.n ? 'warn' : ''}"></span>`; }).join('');
  const due = dueIds().length, sg = suggestion(), fresh = !Object.keys(st.cards).length;
  let countdown = '';
  if (st.settings.examDate){
    const dleft = diffDays(todayStr(), st.settings.examDate);
    if (dleft >= 0){ const r = recommendation();
      countdown = `<div class="panel pad spread"><div class="stack" style="gap:4px"><span class="label">${x('Countdown','Countdown')} · ${esc(EXAMS[st.settings.examType][L])}</span>
        <div class="row"><span class="big mono">${dleft}</span><span class="muted">${x('Tage bis','days until')} ${fmtDate(st.settings.examDate)}</span></div></div>
        <div class="stack" style="gap:4px;text-align:right"><span class="label">${x('Tagesempfehlung','Daily recommendation')}</span><span><b class="mono">${r.perDay}</b> ${x('Fragen pro Tag','questions per day')}</span><span class="small muted">${r.mast}/${r.total} ${x('Prüfungsfragen sicher (Fach ≥ 3)','exam questions mastered (box ≥ 3)')}</span></div></div>`; }
  }
  return `
  ${fresh ? `<section class="panel pad stack"><h1>${x('Willkommen im Patchfeld','Welcome to Patchfeld')}</h1>
    <p class="muted" style="max-width:65ch">${x('Deine Lern-App für die Ausbildung zum Fachinformatiker für Systemintegration. Jeder Port im Patchfeld ist ein Themenbereich – beantworte Fragen, dann steckt ein Kabel und die LED zeigt deinen Stand.','Your learning app for the IT specialist for system integration apprenticeship. Each port on the patch panel is a topic – answer questions, a cable gets plugged in and the LED shows your progress.')}</p>
    <div class="row"><span class="label">${x('Ich bin im','I am in')}</span><div class="seg">${[1,2,3].map(y => `<button data-act="setYear" data-y="${y}" aria-pressed="${st.settings.year === y}">${x(`${y}. Lehrjahr`, `Year ${y}`)}</button>`).join('')}</div></div></section>` : ''}
  <section class="panel pad stack" style="gap:10px">
    <div class="spread"><div><span class="label">${x('Rang','Rank')}</span><h2>${esc(rankOf(lv))}</h2></div>
      <div class="mono small muted" style="text-align:right">Level ${lv} · ${fmt(st.xp, 0, L)} XP<br>${nr ? x(`${nr.name} ab Level ${nr.lv}`, `${nr.name} from level ${nr.lv}`) : x('Höchster Rang erreicht','Highest rank reached')}</div></div>
    <div class="xpbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round((st.xp - cur) / (nx - cur) * 100)}"><i style="width:${(st.xp - cur) / (nx - cur) * 100}%"></i></div>
    <span class="small muted">${x(`Noch ${fmt(nx - st.xp, 0, L)} XP bis Level ${lv + 1}`, `${fmt(nx - st.xp, 0, L)} XP to level ${lv + 1}`)}</span>
  </section>
  <section class="grid3">
    <div class="panel pad stack" style="gap:8px"><span class="label">${x('Tagesziel','Daily goal')}</span><div class="row"><span class="big mono">${td.n}</span><span class="muted">/ ${goal} ${x('Fragen','questions')}</span></div>
      <div class="ledbar" aria-hidden="true">${[...Array(segs)].map((_, i) => `<i class="${i < td.n ? (i < goal ? 'on' : 'over') : ''}"></i>`).join('')}</div>
      <span class="small muted">${td.met ? x('Geschafft – alles Weitere ist Bonus.','Done – everything else is a bonus.') : x(`Noch ${goal - td.n} bis zum Ziel.`, `${goal - td.n} to go.`)}</span></div>
    <div class="panel pad stack" style="gap:8px"><span class="label">${x('Tagesserie','Daily streak')}</span><div class="row"><span class="big mono">${s}</span><span class="muted">${x('Tage','days')} · ${x('Rekord','best')} ${st.stats.bestStreak}</span></div>
      <div class="row" style="gap:6px">${week}</div><span class="small muted">${x('Die Serie zählt Tage mit erreichtem Tagesziel. Ein ausgelassener Tag setzt sie auf null.','The streak counts days with the goal reached. A missed day resets it to zero.')}</span></div>
    <div class="panel pad stack" style="gap:8px"><span class="label">${x('Fällige Wiederholungen','Due reviews')}</span><div class="row"><span class="big mono">${due}</span><span class="muted">${x('Karten','cards')}</span></div>
      <button class="btn ghost small" data-act="review" ${due ? '' : 'disabled'}>${x('Jetzt wiederholen','Review now')}</button><span class="small muted">${x('Leitner-Intervalle: 1 · 3 · 7 · 16 · 35 Tage','Leitner intervals: 1 · 3 · 7 · 16 · 35 days')}</span></div>
  </section>
  <section class="suggest"><span class="wire wc-${sg.w}${sg.s ? ' s' : ''}"></span>
    <div class="stack" style="gap:4px"><span class="label">${x('Vorschlag für heute','Suggestion for today')}</span><h3>${esc(sg.title)}</h3><p class="muted small">${esc(sg.text)}</p></div>
    <button class="btn" data-act="${sg.act}" ${sg.data || ''}>${esc(sg.btn)}</button></section>
  ${countdown || `<p class="small muted">${x('Tipp: Trag dein Prüfungsdatum in den','Tip: enter your exam date in the')} <a href="#settings" data-act="go" data-v="settings">${x('Einstellungen','settings')}</a> ${x('ein – dann gibt es Countdown und Tagesempfehlung.','– you get a countdown and a daily recommendation.')}</p>`}
  <section class="stack"><div class="sec-head"><h2>${x('Patchfeld','Patch panel')}</h2><span class="small muted">${x('Port antippen = Runde starten · LED grün ab 60 % sicher','Tap a port to start a round · LED green from 60 % mastered')}</span></div>
    ${[1,2,3].map(patchPanel).join('')}</section>
  <section class="row"><button class="btn ghost" data-act="round" data-year="${st.settings.year}">${x('Schnelle Runde','Quick round')}</button>
    <button class="btn ghost" data-act="go" data-v="fehlerbuch">${x('Fehlerbuch','Mistake log')} <span class="mono">${Object.keys(st.mistakes).filter(id => QI[id]).length}</span></button>
    <button class="btn ghost" data-act="go" data-v="karten">${x('Karteikarten','Flashcards')}</button>
    <button class="btn ghost" data-act="go" data-v="glossar">${x('Glossar','Glossary')}</button></section>`;
};

VIEWS.pfad = () => {
  const years = [1,2,3].map(y => {
    const rows = AREAS.filter(a => a.y === y).map(a => { const s = areaStats(a.id);
      return `<div class="area-row"><span class="wire wc-${a.w}${a.s ? ' s' : ''}" style="width:10px;height:40px" title="${esc(wireLabel(a.id))}"></span>
        <div class="stack" style="gap:5px;min-width:0"><div class="row" style="gap:8px"><b>${esc(areaName(a.id))}</b><span class="tag">${a.lf}</span>${examTags(a)}</div>
          ${boxBar(s)}<span class="small muted">${s.seen}/${s.total} ${x('gesehen','seen')} · ${s.mast} ${x('sicher','mastered')} · ${x('Trefferquote','hit rate')} ${pct(s.rate)}</span></div>
        <div class="row" style="gap:6px"><button class="btn small" data-act="round" data-area="${a.id}">${x('Runde','Round')}</button><button class="btn ghost small" data-act="cards" data-area="${a.id}">${x('Karten','Cards')}</button></div></div>`; }).join('');
    return `<section class="panel pad stack"><div class="sec-head"><h2>${x(`${y}. Lehrjahr`, `Year ${y}`)}</h2><span class="small muted">${y === 1 ? x('Grundlagen · Prüfungsstoff AP 1','Foundations · AP 1 content') : y === 2 ? x('Schwerpunkt AP 1, Grundlage für AP 2','Focus AP 1, basis for AP 2') : x('Schwerpunkt AP 2','Focus AP 2')}</span></div><div>${rows}</div></section>`;
  }).join('');
  return `<section class="stack"><h1>${x('Lernpfad','Learning path')}</h1>
    <div class="panel pad stack"><span class="label">${x('Prüfungen im Überblick','Exams at a glance')}</span>
      <div class="scroll-x"><table class="tbl"><thead><tr><th>${x('Prüfung','Exam')}</th><th>${x('Zeitpunkt','When')}</th><th>${x('Inhalt','Content')}</th><th class="n">${x('Gewicht','Weight')}</th></tr></thead><tbody>
      <tr><td><span class="tag ap1">AP 1</span></td><td>${x('Mitte 2. Lehrjahr (ersetzt die Zwischenprüfung)','Middle of year 2 (replaces the interim exam)')}</td><td>${x('Einrichten eines IT-gestützten Arbeitsplatzes, 90 min','Setting up an IT-supported workstation, 90 min')}</td><td class="n">20 %</td></tr>
      <tr><td><span class="tag ap2">AP 2</span></td><td>${x('Ende 3. Lehrjahr','End of year 3')}</td><td>${x('Betriebliche Projektarbeit mit Dokumentation, Präsentation und Fachgespräch','Company project with documentation, presentation and expert interview')}</td><td class="n">50 %</td></tr>
      <tr><td><span class="tag ap2">AP 2</span></td><td></td><td>${x('Konzeption und Administration von IT-Systemen, 90 min','Design and administration of IT systems, 90 min')}</td><td class="n">10 %</td></tr>
      <tr><td><span class="tag ap2">AP 2</span></td><td></td><td>${x('Analyse und Entwicklung von Netzwerken, 90 min','Analysis and development of networks, 90 min')}</td><td class="n">10 %</td></tr>
      <tr><td><span class="tag">WiSo</span></td><td></td><td>${x('Wirtschafts- und Sozialkunde, 60 min','Economics and social studies, 60 min')}</td><td class="n">10 %</td></tr></tbody></table></div>
      <span class="small muted">${x('Legende Balken: grün = Fach 5, hellgrün = Fach 3–4, gelb = Fach 1–2, leer = noch nicht gesehen.','Bar legend: green = box 5, light green = box 3–4, amber = box 1–2, empty = not seen yet.')}</span></div>
    ${years}</section>`;
};

VIEWS.training = () => {
  const f = ctx.f || (ctx.f = {year:0, area:'', type:''});
  const areas = AREAS.filter(a => !f.year || a.y === f.year);
  const pool = poolFor(f).length, due = dueIds().length, mist = Object.keys(st.mistakes).filter(id => QI[id]).length;
  return `<section class="stack"><h1>${x('Training','Practice')}</h1>
    <div class="panel pad stack"><span class="label">${x('Runde zusammenstellen','Build a round')}</span>
      <div class="row"><div class="seg" role="group" aria-label="${x('Lehrjahr','Year')}">${[0,1,2,3].map(y => `<button data-act="tf" data-k="year" data-val="${y}" aria-pressed="${f.year === y}">${y ? x(`${y}. LJ`, `Year ${y}`) : x('Alle','All')}</button>`).join('')}</div></div>
      <div class="grid2"><div class="field"><label class="label" for="tfArea">${x('Bereich','Topic')}</label><select id="tfArea" data-chg="tfArea"><option value="">${x('Alle Bereiche','All topics')}</option>${areas.map(a => `<option value="${a.id}" ${f.area === a.id ? 'selected' : ''}>${esc(areaName(a.id))} (${a.lf})</option>`).join('')}</select></div>
        <div class="field"><label class="label" for="tfType">${x('Fragetyp','Question type')}</label><select id="tfType" data-chg="tfType"><option value="">${x('Alle Typen','All types')}</option>${Object.entries(TYPE_NAME()).map(([k, v]) => `<option value="${k}" ${f.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
      <div class="spread"><span class="small muted">${x('Pool','Pool')}: <b class="mono">${pool}</b> ${x('Fragen · 10 Fragen je Runde, 3 Leben','questions · 10 questions per round, 3 lives')}</span>
        <button class="btn" data-act="roundF" ${pool ? '' : 'disabled'}>${x('Runde starten','Start round')} <span class="k">↵</span></button></div></div>
    <div class="grid3">
      <div class="panel pad stack"><span class="label">${x('Karteikasten','Leitner box')}</span><p><b class="mono">${due}</b> ${x('Karten fällig','cards due')}</p><button class="btn ghost small" data-act="review" ${due ? '' : 'disabled'}>${x('Wiederholen','Review')}</button></div>
      <div class="panel pad stack"><span class="label">${x('Fehlerbuch','Mistake log')}</span><p><b class="mono">${mist}</b> ${x('offene Fehler','open mistakes')}</p><button class="btn ghost small" data-act="go" data-v="fehlerbuch">${x('Öffnen','Open')}</button></div>
      <div class="panel pad stack"><span class="label">${x('Karteikarten','Flashcards')}</span><p class="small muted">${x('Durchblättern ohne Wertung','Browse without scoring')}</p><button class="btn ghost small" data-act="cards" data-area="${f.area}" data-year="${f.year}">${x('Durchblättern','Browse')}</button></div>
    </div></section>`;
};
function poolFor(f){ return Q.filter(q => (!f.year || AREA[q.a].y === +f.year) && (!f.area || q.a === f.area) && (!f.type || qType(q) === f.type)); }

VIEWS.pruefung = () => {
  const ae = st.activeExam;
  const card = k => { const e = EXAMS[k], areas = AREAS.filter(a => e.years[a.y]);
    return `<div class="panel pad stack"><div class="spread"><h2>${k.replace('AP', 'AP ')}</h2><span class="tag ${k.toLowerCase()}">${e.n} ${x('Fragen','questions')} · ${e.min} min</span></div>
      <p class="muted small">${esc(e[L])} – ${x('ohne Leben, ohne sofortige Rückmeldung, mit Auswertung nach Themengebiet und Note nach IHK-Schlüssel.','no lives, no instant feedback, evaluated by topic with an IHK grade.')}</p>
      <div class="row" style="gap:4px">${areas.map(a => `<span class="chip">${wireHTML(a.id)}${esc(areaName(a.id))}</span>`).join('')}</div>
      <button class="btn" data-act="exam" data-type="${k}" ${ae ? 'disabled' : ''}>${x('Simulation starten','Start simulation')}</button></div>`; };
  const hist = st.exams.slice().reverse().slice(0, 12);
  return `<section class="stack"><h1>${x('Prüfungssimulation','Exam simulation')}</h1>
    ${ae ? `<div class="panel pad spread" style="border-color:var(--warn)"><div><span class="label">${x('Laufende Prüfung','Exam in progress')}</span><p>${ae.type.replace('AP', 'AP ')} · ${x('Restzeit','time left')} <b class="mono">${fmtClock(examRemaining(ae))}</b></p></div><div class="row"><button class="btn" data-act="resumeExam">${x('Fortsetzen','Resume')}</button><button class="btn ghost" data-act="submitExam">${x('Abgeben','Submit')}</button></div></div>` : ''}
    <div class="grid2">${card('AP1')}${card('AP2')}</div>
    <div class="panel pad stack"><span class="label">${x('Bisherige Simulationen','Previous simulations')}</span>
      ${hist.length ? `<div class="scroll-x"><table class="tbl"><thead><tr><th>${x('Datum','Date')}</th><th>${x('Prüfung','Exam')}</th><th class="n">${x('Punkte','Score')}</th><th class="n">${x('Note','Grade')}</th><th class="n">${x('Zeit','Time')}</th><th>${x('Schwächste Bereiche','Weakest topics')}</th></tr></thead><tbody>
        ${hist.map(e => `<tr><td class="mono">${fmtDate(e.date)}</td><td>${e.type.replace('AP', 'AP ')}</td><td class="n">${e.pct} %</td><td class="n">${ihkGrade(e.pct).n}</td><td class="n">${fmtClock(e.ms)}</td><td class="small">${(e.weak || []).map(a => esc(areaName(a))).join(', ')}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty">${x('Noch keine Simulation – starte mit AP 1, sobald du im 2. Lehrjahr bist.','No simulation yet – start with AP 1 once you are in year 2.')}</div>`}</div></section>`;
};

VIEWS.mehr = () => `<section class="stack"><h1>${x('Mehr','More')}</h1><div class="grid2">
  ${[['stats', x('Statistik','Statistics'), x('Trefferquote je Bereich, Verlauf, Zeit pro Frage','Hit rate per topic, history, time per question')],
     ['glossar', x('Glossar','Glossary'), x(`${GLOSSAR.length} Fachbegriffe und Abkürzungen`, `${GLOSSAR.length} terms and abbreviations`)],
     ['badges', x('Abzeichen','Badges'), `${Object.keys(st.badges).length}/${BADGES.length} ${x('erreicht','earned')}`],
     ['fehlerbuch', x('Fehlerbuch','Mistake log'), x('Falsch beantwortete Fragen gezielt wiederholen','Repeat wrongly answered questions')],
     ['karten', x('Karteikarten','Flashcards'), x('Fragen durchblättern ohne Wertung','Browse questions without scoring')],
     ['settings', x('Einstellungen & Backup','Settings & backup'), x('Sprache, Dunkelmodus, Prüfungsdatum, Export/Import, Updates','Language, dark mode, exam date, export/import, updates')]]
    .map(([v, t, d]) => `<button class="panel pad stack" style="text-align:left" data-act="go" data-v="${v}"><h3>${t}</h3><span class="small muted">${d}</span></button>`).join('')}
  </div><p class="small muted mono">Patchfeld ${APP_VERSION ? 'v' + APP_VERSION : ''} · ${Q.length} ${x('Fragen','questions')} · ${GLOSSAR.length} ${x('Begriffe','terms')}</p></section>`;


/* =====================================================================
   APP – Teil 2b: Statistik, Glossar, Abzeichen, Einstellungen, Fehlerbuch, Karteikarten
   ===================================================================== */
function barChart(vals, o){
  const W = 640, H = o.h || 150, pl = 34, pr = 8, pt = 10, pb = 22, n = vals.length, iw = W - pl - pr, ih = H - pt - pb;
  const ym = o.max || Math.max(1, ...vals, o.goal || 0), bw = iw / n, y = v => pt + ih * (1 - v / ym);
  const ticks = o.ticks || [0, Math.round(ym / 2), Math.round(ym)];
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label)}">`;
  s += ticks.map(t => `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}"/><text class="ax" x="${pl - 6}" y="${y(t) + 4}" text-anchor="end">${t}${o.unit || ''}</text>`).join('');
  vals.forEach((v, i) => { const bx = pl + i * bw + Math.min(3, bw * 0.15), w = Math.max(2, bw - 2 * Math.min(3, bw * 0.15)), hh = Math.max(v > 0 ? 2 : 0, ih * v / ym);
    s += `<g data-tip="${esc(o.tips[i])}"><rect class="hit" x="${pl + i * bw}" y="${pt}" width="${bw}" height="${ih}"/><rect class="bar${i === n - 1 ? ' last' : ''}" x="${bx}" y="${pt + ih - hh}" width="${w}" height="${hh}" rx="2"/></g>`;
    if (o.labels[i]) s += `<text class="ax" x="${pl + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${esc(o.labels[i])}</text>`; });
  if (o.goal) s += `<line class="goal" x1="${pl}" x2="${W - pr}" y1="${y(o.goal)}" y2="${y(o.goal)}"/><text class="ax" x="${W - pr}" y="${y(o.goal) - 4}" text-anchor="end">${x('Ziel','Goal')} ${o.goal}</text>`;
  return s + '</svg>';
}

VIEWS.stats = () => {
  const cards = Object.entries(st.cards).filter(([id]) => QI[id]).map(([, c]) => c);
  const n = cards.reduce((s, c) => s + c.n, 0), r = cards.reduce((s, c) => s + c.r, 0), w = cards.reduce((s, c) => s + c.w, 0), ms = cards.reduce((s, c) => s + c.ms, 0);
  const box = [Q.length - cards.length, 0, 0, 0, 0, 0]; cards.forEach(c => box[c.b]++);
  const days = [...Array(14)].map((_, i) => addDays(todayStr(), i - 13));
  const dv = days.map(d => (st.days[d] || {}).n || 0);
  const rounds = st.rounds.slice(-20), rv = rounds.map(r => Math.round(r.c / r.n * 100));
  const tile = (lab, val, sub) => `<div class="panel pad stack" style="gap:4px"><span class="label">${lab}</span><span class="big mono">${val}</span><span class="small muted">${sub}</span></div>`;
  return `<section class="stack"><h1>${x('Statistik','Statistics')}</h1>
    <div class="grid3" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
      ${tile(x('Beantwortet','Answered'), fmt(n, 0, L), x('Antworten insgesamt','answers in total'))}
      ${tile(x('Trefferquote','Hit rate'), pct((r + w) ? r / (r + w) : null), x('über alle Bereiche','across all topics'))}
      ${tile(x('Ø Zeit/Frage','Avg. time/question'), n ? fmt(ms / n / 1000, 1, L) + ' s' : '–', x('ohne Pausen über 5 min','capped at 5 min'))}
      ${tile(x('Gesehen','Seen'), `${cards.length}/${Q.length}`, x('Fragen im Katalog','questions in the catalogue'))}
    </div>
    <div class="panel pad stack"><span class="label">${x('Karteikasten','Leitner box')}</span>
      <div class="boxes">${box.map((b, i) => `<div><b>${b}</b><span>${i ? x('Fach','Box') + ' ' + i : x('Neu','New')}</span></div>`).join('')}</div>
      <span class="small muted">${x('Wiedervorlage: Fach 1 nach 1 Tag, 2 nach 3, 3 nach 7, 4 nach 16, 5 nach 35 Tagen.','Due: box 1 after 1 day, 2 after 3, 3 after 7, 4 after 16, 5 after 35 days.')}</span></div>
    <div class="panel pad stack chart"><span class="label">${x('Fragen pro Tag – letzte 14 Tage','Questions per day – last 14 days')}</span>
      ${barChart(dv, {label:x('Fragen pro Tag','Questions per day'), goal:st.settings.goal, labels:days.map((d, i) => i % 2 ? '' : d.slice(8) + '.'), tips:days.map((d, i) => `${fmtDate(d)}: ${dv[i]}`)})}</div>
    <div class="panel pad stack chart"><span class="label">${x('Verlauf der letzten Runden – Anteil richtig','Recent rounds – share correct')}</span>
      ${rounds.length ? barChart(rv, {label:x('Anteil richtig je Runde','Share correct per round'), max:100, ticks:[0, 50, 100], unit:'%', labels:rounds.map((_, i) => i === rounds.length - 1 ? x('neu','new') : ''), tips:rounds.map((r, i) => `${fmtDate(r.date)} · ${r.c}/${r.n} (${rv[i]} %) · ${r.area ? areaName(r.area) : x('gemischt','mixed')}`)}) : `<div class="empty">${x('Noch keine Runde gespielt.','No rounds played yet.')}</div>`}</div>
    <div class="panel pad stack"><span class="label">${x('Je Bereich','Per topic')}</span><div class="scroll-x"><table class="tbl">
      <thead><tr><th>${x('Bereich','Topic')}</th><th class="n">${x('Antw.','Ans.')}</th><th style="min-width:120px">${x('Trefferquote','Hit rate')}</th><th class="n">%</th><th class="n">${x('Ø Zeit','Avg. time')}</th></tr></thead><tbody>
      ${AREAS.map(a => { const s = areaStats(a.id); return `<tr><td><span class="row" style="gap:8px;flex-wrap:nowrap">${wireHTML(a.id)}<span>${esc(areaName(a.id))}</span></span></td><td class="n">${s.n}</td><td><div class="hb"><i style="width:${s.rate == null ? 0 : s.rate * 100}%"></i></div></td><td class="n">${pct(s.rate)}</td><td class="n">${s.avgMs ? fmt(s.avgMs / 1000, 0, L) + ' s' : '–'}</td></tr>`; }).join('')}
      </tbody></table></div></div></section>`;
};

function glossRows(qs){
  qs = (qs || '').toLowerCase().trim();
  const list = GLOSSAR.map(g => ({term: L === 'en' && g[5] ? g[5] : g[0], a:g[1], long:g[2], ex: L === 'en' ? g[4] : g[3], raw:g}))
    .filter(g => !qs || (g.term + ' ' + g.long + ' ' + g.ex + ' ' + g.raw[0]).toLowerCase().includes(qs))
    .sort((p, q) => p.term.localeCompare(q.term, L));
  return list.length ? list.map(g => `<div class="gl-item"><dt>${esc(g.term)}</dt><dd><span class="lf">${esc(g.long)}</span><br>${esc(g.ex)} <span class="chip" style="margin-left:4px">${wireHTML(g.a)}${esc(areaName(g.a))}</span></dd></div>`).join('')
    : `<div class="empty">${x('Kein Begriff gefunden.','No term found.')}</div>`;
}
VIEWS.glossar = () => `<section class="stack"><h1>${x('Glossar','Glossary')}</h1>
  <div class="field"><label class="label" for="glSearch">${x('Suchen','Search')}</label><input type="search" id="glSearch" value="${esc(ctx.q || '')}" placeholder="${x('z. B. DHCP, RPO, Pflichtenheft','e.g. DHCP, RPO, Lastenheft')}" autocomplete="off"></div>
  <dl class="panel pad" id="glList" style="margin:0">${glossRows(ctx.q)}</dl></section>`;
AFTER.glossar = () => { const i = document.getElementById('glSearch'); i.oninput = () => { ctx.q = i.value; document.getElementById('glList').innerHTML = glossRows(i.value); }; };

VIEWS.badges = () => `<section class="stack"><h1>${x('Abzeichen','Badges')}</h1><div class="badges">
  ${BADGES.map(b => { const got = st.badges[b.id]; return `<div class="badge ${got ? '' : 'off'}"><span class="led ${got ? 'ok' : ''}" style="margin-top:6px"></span><div class="stack" style="gap:4px"><span class="tape">${esc(b[L][0])}</span><span class="small">${esc(b[L][1])}</span><span class="small muted mono">${got ? fmtDate(got) : x('offen','locked')}</span></div></div>`; }).join('')}
  </div></section>`;

VIEWS.settings = () => { const s = st.settings; return `<section class="stack"><h1>${x('Einstellungen','Settings')}</h1>
  <div class="panel pad stack"><span class="label">${x('Darstellung & Sprache','Display & language')}</span>
    <div class="row"><span style="min-width:110px">${x('Sprache','Language')}</span><div class="seg"><button data-act="setLang" data-l="de" aria-pressed="${L === 'de'}">Deutsch</button><button data-act="setLang" data-l="en" aria-pressed="${L === 'en'}">English</button></div></div>
    <div class="row"><span style="min-width:110px">${x('Modus','Mode')}</span><div class="seg">${[['auto', x('System','System')], ['light', x('Hell','Light')], ['dark', x('Dunkel','Dark')]].map(([k, v]) => `<button data-act="setTheme" data-t="${k}" aria-pressed="${s.theme === k}">${v}</button>`).join('')}</div></div></div>
  <div class="panel pad stack"><span class="label">${x('Lernplan','Study plan')}</span>
    <div class="row"><span style="min-width:110px">${x('Lehrjahr','Year')}</span><div class="seg">${[1,2,3].map(y => `<button data-act="setYear" data-y="${y}" aria-pressed="${s.year === y}">${x(`${y}. Lehrjahr`, `Year ${y}`)}</button>`).join('')}</div></div>
    <div class="grid2"><div class="field"><label class="label" for="sGoal">${x('Tagesziel (Fragen pro Tag)','Daily goal (questions per day)')}</label><input type="number" id="sGoal" min="5" max="200" step="5" value="${s.goal}" data-chg="goal"></div>
      <div class="field"><label class="label" for="sExamDate">${x('Prüfungsdatum','Exam date')}</label><input type="date" id="sExamDate" value="${esc(s.examDate)}" data-chg="examDate"></div></div>
    <div class="row"><span style="min-width:110px">${x('Nächste Prüfung','Next exam')}</span><div class="seg">${['AP1','AP2'].map(k => `<button data-act="setExam" data-k="${k}" aria-pressed="${s.examType === k}">${k.replace('AP','AP ')}</button>`).join('')}</div></div></div>
  <div class="panel pad stack"><span class="label">${x('Updates','Updates')}</span>
    <p class="small muted">${x(`Installiert: v${APP_VERSION || '–'}. Patchfeld aktualisiert sich automatisch über GitHub – Stand und „Nach Updates suchen“ findest du in den Einstellungen auf der Kursseite.`, `Installed: v${APP_VERSION || '–'}. Patchfeld updates itself automatically from GitHub – status and "Check for updates" are in the settings on the course page.`)}</p></div>
  <div class="panel pad stack"><span class="label">${x('Datensicherung','Backup')}</span>
    <p class="small muted">${x('Dein Trainer-Fortschritt liegt auf diesem PC. Exportiere ihn regelmäßig als JSON, um ihn auf einen anderen PC zu übertragen.','Your trainer progress lives on this PC. Export it regularly as JSON to move it to another PC.')}</p>
    <div class="row"><button class="btn small" data-act="exportDl">${x('Als Datei exportieren','Export as file')}</button><button class="btn ghost small" data-act="exportCopy">${x('In Zwischenablage kopieren','Copy to clipboard')}</button><button class="btn ghost small" data-act="exportShow">${x('JSON anzeigen','Show JSON')}</button></div>
    <textarea id="exportBox" readonly hidden aria-label="Export"></textarea>
    <div class="field"><label class="label" for="importFile">${x('Import aus Datei','Import from file')}</label><input type="file" id="importFile" accept="application/json,.json" data-chg="importFile"></div>
    <div class="field"><label class="label" for="importBox">${x('… oder JSON einfügen','… or paste JSON')}</label><textarea id="importBox" placeholder="{ &quot;app&quot;: &quot;patchfeld&quot;, … }"></textarea></div>
    <div class="row"><button class="btn ghost small" data-act="importPaste">${x('Eingefügtes JSON importieren','Import pasted JSON')}</button></div></div>
  <div class="panel pad stack"><span class="label">${x('Zurücksetzen','Reset')}</span><div class="row"><button class="btn ghost small" data-act="reset" style="color:var(--err);border-color:var(--err)">${x('Gesamten Fortschritt löschen','Delete all progress')}</button></div></div>
  </section>`; };

function qSnippet(id){ const q = QI[id]; if (!q) return ''; if (q.gen) return x('Rechenaufgabe mit Zufallswerten','Calculation with random values') + ` (${q.gen})`; const d = q[L] || q.de; const t = d.q + ' – ' + d.s; return t.length > 150 ? t.slice(0, 147) + '…' : t; }
VIEWS.fehlerbuch = () => {
  const fa = ctx.area || '', ids = Object.keys(st.mistakes).filter(id => QI[id] && (!fa || QI[id].a === fa)).sort((a, b) => st.mistakes[b].n - st.mistakes[a].n);
  const areas = AREAS.filter(a => Object.keys(st.mistakes).some(id => QI[id] && QI[id].a === a.id));
  return `<section class="stack"><div class="spread"><h1>${x('Fehlerbuch','Mistake log')}</h1><button class="btn" data-act="mistakes" data-area="${fa}" ${ids.length ? '' : 'disabled'}>${x('Fehler üben','Practise mistakes')} (${Math.min(ROUND_SIZE, ids.length)})</button></div>
    <p class="small muted" style="max-width:65ch">${x('Jede falsch beantwortete Frage landet hier. Beantwortest du sie beim Üben des Fehlerbuchs richtig, wird sie abgehakt.','Every wrongly answered question lands here. Answer it correctly while practising the log and it is ticked off.')}</p>
    ${areas.length > 1 ? `<div class="field" style="max-width:360px"><label class="label" for="fbArea">${x('Bereich','Topic')}</label><select id="fbArea" data-chg="fbArea"><option value="">${x('Alle','All')}</option>${areas.map(a => `<option value="${a.id}" ${fa === a.id ? 'selected' : ''}>${esc(areaName(a.id))}</option>`).join('')}</select></div>` : ''}
    <div class="panel pad">${ids.length ? ids.map(id => { const m = st.mistakes[id]; return `<div class="area-row"><span class="wire wc-${AREA[QI[id].a].w}${AREA[QI[id].a].s ? ' s' : ''}" style="width:8px;height:34px"></span>
      <div class="stack" style="gap:2px;min-width:0"><span class="small muted">${esc(areaName(QI[id].a))} · ${TYPE_NAME()[qType(QI[id])]} · ${m.n}× ${x('falsch','wrong')} · ${fmtDate(m.last)}</span><span>${esc(qSnippet(id))}</span></div>
      <button class="btn ghost small" data-act="delMistake" data-id="${id}" aria-label="${x('Aus Fehlerbuch entfernen','Remove from log')}">${x('Entfernen','Remove')}</button></div>`; }).join('')
      : `<div class="empty">${x('Keine offenen Fehler. Sauber gepatcht!','No open mistakes. Cleanly patched!')}</div>`}</div></section>`;
};

function buildDeck(){ const f = ctx.f || {}; ctx.deck = shuffle(Q.filter(q => (!f.year || AREA[q.a].y === +f.year) && (!f.area || q.a === f.area))).map(inst); ctx.i = 0; ctx.flip = false; }
VIEWS.karten = () => {
  if (!ctx.f) ctx.f = {year:0, area:''}; if (!ctx.deck) buildDeck();
  const f = ctx.f, deck = ctx.deck, o = deck[ctx.i], areas = AREAS.filter(a => !f.year || a.y === +f.year);
  return `<section class="stack"><h1>${x('Karteikarten','Flashcards')}</h1>
    <div class="row"><div class="seg">${[0,1,2,3].map(y => `<button data-act="kf" data-y="${y}" aria-pressed="${+f.year === y}">${y ? x(`${y}. LJ`, `Year ${y}`) : x('Alle','All')}</button>`).join('')}</div>
      <select id="kfArea" data-chg="kfArea" style="max-width:320px" aria-label="${x('Bereich','Topic')}"><option value="">${x('Alle Bereiche','All topics')}</option>${areas.map(a => `<option value="${a.id}" ${f.area === a.id ? 'selected' : ''}>${esc(areaName(a.id))}</option>`).join('')}</select></div>
    ${o ? `<div class="panel qcard flash" data-act="flip" role="button" tabindex="0" aria-label="${x('Karte umdrehen','Flip card')}">
      <div class="spread"><span class="chip">${wireHTML(o.a)}${esc(areaName(o.a))}</span><span class="mono small muted">${ctx.i + 1}/${deck.length}</span></div>
      ${questionHead(o)}${previewBody(o)}
      ${ctx.flip ? `<div class="back stack">${solutionHTML(o)}${o.e ? `<p><b>${x('Erklärung','Explanation')}:</b> ${esc(o.e)}</p>` : ''}</div>` : `<p class="small muted">${x('Tippen, Leertaste oder Enter zum Umdrehen','Tap, space or Enter to flip')}</p>`}</div>
      <div class="qfoot"><span class="hint">← → ${x('blättern','browse')} · ${x('Leertaste','Space')} ${x('umdrehen','flip')}</span><button class="btn ghost" data-act="kNav" data-d="-1" ${ctx.i ? '' : 'disabled'}>← ${x('Zurück','Back')}</button><button class="btn" data-act="kNav" data-d="1" ${ctx.i < deck.length - 1 ? '' : 'disabled'}>${x('Weiter','Next')} →</button></div>`
      : `<div class="empty">${x('Keine Karten für diese Auswahl.','No cards for this selection.')}</div>`}</section>`;
};


/* =====================================================================
   APP – Teil 3: Fragenanzeige, Runden, Prüfungen, Aktionen, Tastatur, Start
   ===================================================================== */
/* ---------- Runden ---------- */
function pickRound(pool, size){
  const t = todayStr();
  const sel = pool.map(q => { const c = st.cards[q.id]; return {q, k:(!c ? 1 : c.due <= t ? 0 : 1 + c.b) + Math.random() * 1.5}; }).sort((a, b) => a.k - b.k).slice(0, size).map(s => s.q);
  const gens = pool.filter(q => q.gen); while (sel.length < size && gens.length) sel.push(pick(gens));
  return shuffle(sel);
}
function startRound(opt){
  let pool, mode = opt.mode || 'round', lives = LIVES, label;
  if (mode === 'review'){ pool = dueIds().map(id => QI[id]); label = x('Wiederholung','Review'); }
  else if (mode === 'mistakes'){ pool = Object.keys(st.mistakes).filter(id => QI[id] && (!opt.area || QI[id].a === opt.area)).map(id => QI[id]); lives = null; label = x('Fehlerbuch','Mistake log'); }
  else { pool = poolFor({year:+opt.year || 0, area:opt.area || '', type:opt.type || ''}); label = opt.area ? areaName(opt.area) : opt.year ? x(`${opt.year}. Lehrjahr gemischt`, `Year ${opt.year} mixed`) : x('Gemischte Runde','Mixed round'); }
  if (!pool.length){ toast(x('Für diese Auswahl gibt es gerade keine Fragen.','There are no questions for this selection right now.')); return; }
  const items = (mode === 'round' ? pickRound(pool, ROUND_SIZE) : shuffle(pool).slice(0, ROUND_SIZE)).map(inst);
  session = {mode, area:opt.area || '', label, items, i:0, lives, combo:0, maxCombo:0, xp:0, res:[], ans:null, checked:false, revealed:false, note:'', t0:performance.now(), started:Date.now()};
  view = 'quiz'; render(); window.scrollTo(0, 0);
}
VIEWS.quiz = () => {
  const S = session, o = S.items[S.i], done = S.checked;
  const prog = S.items.map((_, i) => { const r = S.res[i]; return `<i class="${r ? (r.s === 1 ? 'ok' : r.s === 0.5 ? 'part' : 'err') : i === S.i ? 'cur' : ''}"></i>`; }).join('');
  const lives = S.lives == null ? '' : `<span class="lives" aria-label="${x('Leben','Lives')}: ${S.lives}">${[...Array(LIVES)].map((_, i) => `<span class="led ${i < S.lives ? 'ok' : 'err'}"></span>`).join('')}</span>`;
  let fb = '';
  if (done){ const r = S.res[S.i], cls = r.s === 1 ? 'ok' : r.s === 0.5 ? 'part' : 'err';
    fb = `<div class="fb ${cls} pop" role="status"><div class="verdict"><span class="led ${r.s === 1 ? 'ok' : r.s === 0.5 ? 'warn' : 'err'}"></span>${r.s === 1 ? x('Richtig','Correct') : r.s === 0.5 ? x('Teilweise','Partly') : x('Nicht richtig','Not correct')}<span class="mono small" style="margin-left:auto">${r.xp ? '+' + r.xp + ' XP' : ''}</span></div>
      ${o.t === 'open' ? '' : r.s !== 1 ? solutionHTML(o) : ''}
      ${o.e ? `<p class="why"><b>${x('Warum','Why')}:</b> ${esc(o.e)}</p>` : ''}${o.n ? `<p class="why"><b>${x('Naheliegend, aber falsch','Tempting but wrong')}:</b> ${esc(o.n)}</p>` : ''}</div>`; }
  let openPart = '';
  if (o.t === 'open' && S.revealed) openPart = `<div class="stack">${solutionHTML(o)}
    ${o.k.length ? `<div class="keys"><span class="label">${x('Hattest du diese Punkte?','Did you cover these points?')}</span>${o.k.map((k, i) => `<label><input type="checkbox" id="k${i}"> ${esc(k)}</label>`).join('')}</div>` : ''}
    ${done ? '' : `<div class="row"><span class="label">${x('Selbsteinschätzung','Self-assessment')}</span><button class="btn ghost small" data-act="rate" data-r="0"><span class="k">1</span> ${x('Nicht gewusst','Didn\'t know')}</button><button class="btn ghost small" data-act="rate" data-r="1"><span class="k">2</span> ${x('Teilweise','Partly')}</button><button class="btn small" data-act="rate" data-r="2"><span class="k">3</span> ${x('Sicher','Confident')}</button></div>`}</div>`;
  const primary = done ? `<button class="btn" data-act="next" id="btnNext">${S.i < S.items.length - 1 && (S.lives == null || S.lives > 0) ? x('Weiter','Next') : x('Auswertung','Results')} <span class="k">↵</span></button>`
    : o.t === 'open' ? (S.revealed ? '' : `<button class="btn" data-act="reveal">${x('Musterlösung zeigen','Show model answer')} <span class="k">↵</span></button>`)
    : `<button class="btn" data-act="check" ${hasAnswer(o, S.ans) ? '' : 'disabled'} id="btnCheck">${x('Prüfen','Check')} <span class="k">↵</span></button>`;
  return `<section class="stack">
    <div class="qhead"><button class="btn ghost small" data-act="quit" aria-label="${x('Runde beenden','End round')}">✕</button><div class="qprog" aria-hidden="true">${prog}</div>${lives}
      <span class="combo">${x('Kombo','Combo')} <b>${S.combo}</b> · ×${comboMult(S.combo)}</span></div>
    <div class="panel qcard">
      <div class="spread"><span class="chip">${wireHTML(o.a)}${esc(areaName(o.a))} · ${AREA[o.a].lf}</span><span class="small muted">${esc(S.label)} · ${S.i + 1}/${S.items.length} · ${TYPE_NAME()[o.t]}</span></div>
      ${questionHead(o)}${answerHTML(o, S.ans, done)}${openPart}${fb}
      <div class="qfoot"><span class="hint">${o.t === 'in' ? x('Enter prüft · Tab wechselt das Feld','Enter checks · Tab switches fields') : x('1–9 wählen · Enter prüfen/weiter','1–9 choose · Enter check/next')}</span>${primary}</div>
    </div></section>`;
};
AFTER.quiz = () => {
  const S = session; if (!S) return;
  if (S.checked){ const b = document.getElementById('btnNext'); if (b) b.focus({preventScroll:true}); }
  else if (S.items[S.i].t === 'in' && !S.ans){ const f = document.getElementById('f0'); if (f && matchMedia('(pointer:fine)').matches) f.focus({preventScroll:true}); }
};
function refreshCheckBtn(){ const b = document.getElementById('btnCheck'); if (b && session) b.disabled = !hasAnswer(session.items[session.i], session.ans); }
function checkAnswer(forced){
  const S = session, o = S.items[S.i]; if (S.checked) return;
  if (forced == null && !hasAnswer(o, S.ans)){ toast(x('Bitte zuerst antworten.','Please answer first.')); return; }
  const sc = forced != null ? forced : grade(o, S.ans), ms = performance.now() - S.t0;
  S.combo = sc === 1 ? S.combo + 1 : sc === 0.5 ? S.combo : 0; S.maxCombo = Math.max(S.maxCombo, S.combo);
  st.stats.bestCombo = Math.max(st.stats.bestCombo, S.combo);
  const gain = sc ? Math.round(XP_BASE[o.t] * sc * comboMult(S.combo)) : 0;
  if (sc === 0 && S.lives != null) S.lives--;
  S.res[S.i] = {id:o.id, s:sc, xp:gain, ms}; S.xp += gain; S.checked = true;
  record(o, sc, ms, S.mode); addXp(gain); checkBadges(); save(); render();
}
function nextQuestion(){
  const S = session;
  if (S.i >= S.items.length - 1 || (S.lives != null && S.lives <= 0)) return endRound();
  S.i++; S.ans = null; S.checked = false; S.revealed = false; S.note = ''; S.t0 = performance.now(); render(); window.scrollTo(0, 0);
}
function endRound(){
  const S = session, res = S.res.filter(Boolean), c = res.reduce((s, r) => s + r.s, 0);
  let bonus = 0; if (res.length >= S.items.length && S.mode !== 'mistakes') bonus = 20 + (c === res.length && res.length >= ROUND_SIZE ? 30 : 0);
  if (bonus){ S.xp += bonus; addXp(bonus); }
  st.rounds.push({date:todayStr(), mode:S.mode, area:S.area, n:res.length, c, xp:S.xp, ms:Date.now() - S.started}); if (st.rounds.length > 200) st.rounds.shift();
  checkBadges(); save(); const done = S; session = null; view = 'roundEnd'; ctx = {r:done, bonus}; render(); window.scrollTo(0, 0);
}
VIEWS.roundEnd = () => {
  const S = ctx.r, res = S.res.filter(Boolean), c = res.reduce((s, r) => s + r.s, 0), lost = S.lives != null && S.lives <= 0 && res.length < S.items.length;
  return `<section class="stack"><div class="panel pad stack"><span class="label">${esc(S.label)}</span>
    <div class="row"><span class="big mono">${fmt(c, c % 1 ? 1 : 0, L)}/${res.length}</span><span class="muted">${lost ? x('Link down – alle Leben verbraucht.','Link down – all lives used.') : x('richtig beantwortet','answered correctly')}</span></div>
    <div class="row small muted"><span>+${S.xp} XP${ctx.bonus ? ` (${x('inkl.','incl.')} ${ctx.bonus} ${x('Bonus','bonus')})` : ''}</span><span>· ${x('beste Kombo','best combo')} ${S.maxCombo}</span><span>· Level ${levelOf(st.xp)} ${esc(rankOf(levelOf(st.xp)))}</span><span>· ${x('Tagesziel','daily goal')} ${todayDay().n}/${st.settings.goal}</span></div></div>
    <div class="panel pad">${res.map(r => `<div class="area-row"><span class="led ${r.s === 1 ? 'ok' : r.s === 0.5 ? 'warn' : 'err'}"></span><span class="small">${esc(qSnippet(r.id))}</span><span class="mono small muted">${fmt(r.ms / 1000, 0, L)} s</span></div>`).join('')}</div>
    <div class="row"><button class="btn" data-act="again">${x('Neue Runde','New round')}</button>${res.some(r => r.s === 0) ? `<button class="btn ghost" data-act="mistakes">${x('Fehler wiederholen','Repeat mistakes')}</button>` : ''}<button class="btn ghost" data-act="go" data-v="start">${x('Zur Startseite','Home')}</button></div></section>`;
};

/* ---------- Prüfungssimulation ---------- */
const fmtClock = ms => { ms = Math.max(0, ms); const m = Math.floor(ms / 60000), s = Math.floor(ms % 60000 / 1000); return `${m}:${String(s).padStart(2, '0')}`; };
const examRemaining = e => e.dur - (Date.now() - e.start);
function ihkGrade(p){ const g = p >= 92 ? [1,'sehr gut','very good'] : p >= 81 ? [2,'gut','good'] : p >= 67 ? [3,'befriedigend','satisfactory'] : p >= 50 ? [4,'ausreichend','sufficient'] : p >= 30 ? [5,'mangelhaft','poor'] : [6,'ungenügend','insufficient']; return {n:g[0], t:L === 'en' ? g[2] : g[1]}; }
function startExam(type){
  const E = EXAMS[type], sel = [];
  for (const [y, share] of Object.entries(E.years)){
    const want = Math.round(E.n * share), areas = shuffle(AREAS.filter(a => a.y === +y).map(a => a.id)), bucket = {};
    areas.forEach(a => bucket[a] = shuffle(Q.filter(q => q.a === a)));
    let openCount = 0, k = 0, got = 0;
    while (got < want && areas.some(a => bucket[a].length)){
      const a = areas[k++ % areas.length], q = bucket[a].shift(); if (!q) continue;
      if (qType(q) === 'open' && openCount >= 2) continue; if (qType(q) === 'open') openCount++;
      sel.push(q); got++;
    }
  }
  if (!sel.length) return;
  st.activeExam = {type, start:Date.now(), dur:E.min * 60000, items:shuffle(sel).map(inst), ans:[], flags:[], i:0};
  save(); view = 'exam'; render(); window.scrollTo(0, 0);
}
let examTimer = null;
VIEWS.exam = () => {
  const e = st.activeExam; if (!e) return VIEWS.pruefung();
  const o = e.items[e.i], rem = examRemaining(e);
  return `<section class="stack"><div class="spread"><div><span class="label">${x('Prüfungssimulation','Exam simulation')}</span><h2>${e.type.replace('AP', 'AP ')} · ${e.i + 1}/${e.items.length}</h2></div>
      <div class="row"><span class="timer mono ${rem < 600000 ? 'low' : ''}" id="timer" aria-live="off">${fmtClock(rem)}</span><button class="btn ghost small" data-act="submitExam">${x('Abgeben','Submit')}</button></div></div>
    <div class="qnav" aria-label="${x('Fragenübersicht','Question overview')}">${e.items.map((it, i) => `<button data-act="exGo" data-i="${i}" class="${hasAnswer(it, e.ans[i]) ? 'done' : ''} ${e.flags[i] ? 'flag' : ''}" ${i === e.i ? 'aria-current="true"' : ''}>${i + 1}</button>`).join('')}</div>
    <div class="panel qcard"><div class="spread"><span class="chip">${wireHTML(o.a)}${esc(areaName(o.a))}</span><span class="small muted">${TYPE_NAME()[o.t]}</span></div>
      ${questionHead(o)}${answerHTML(o, e.ans[e.i], false, true)}
      <div class="qfoot"><span class="hint">${x('Keine Rückmeldung bis zur Abgabe','No feedback until you submit')}</span>
        <button class="btn ghost small" data-act="exFlag" aria-pressed="${!!e.flags[e.i]}">${e.flags[e.i] ? x('Markiert','Flagged') : x('Markieren','Flag')}</button>
        <button class="btn ghost" data-act="exGo" data-i="${e.i - 1}" ${e.i ? '' : 'disabled'}>← ${x('Zurück','Back')}</button>
        ${e.i < e.items.length - 1 ? `<button class="btn" data-act="exGo" data-i="${e.i + 1}">${x('Weiter','Next')} <span class="k">↵</span></button>` : `<button class="btn" data-act="submitExam">${x('Abgeben','Submit')}</button>`}</div></div></section>`;
};
AFTER.exam = () => {
  clearInterval(examTimer);
  examTimer = setInterval(() => { const e = st.activeExam, t = document.getElementById('timer'); if (!e || view !== 'exam'){ clearInterval(examTimer); return; }
    const rem = examRemaining(e); if (t){ t.textContent = fmtClock(rem); t.classList.toggle('low', rem < 600000); } if (rem <= 0){ clearInterval(examTimer); submitExam(true); } }, 1000);
};
function submitExam(auto){
  const e = st.activeExam; if (!e) return;
  if (!auto){ const open = e.items.filter((it, i) => !hasAnswer(it, e.ans[i])).length; if (!confirm(open ? x(`${open} Fragen sind unbeantwortet. Trotzdem abgeben?`, `${open} questions are unanswered. Submit anyway?`) : x('Prüfung abgeben?','Submit the exam?'))) return; }
  clearInterval(examTimer);
  const ms = Math.min(e.dur, Date.now() - e.start), scores = e.items.map((o, i) => o.t === 'open' ? null : grade(o, e.ans[i]));
  let xpGain = 0; e.items.forEach((o, i) => { if (o.t !== 'open'){ record(o, scores[i], ms / e.items.length, 'exam'); if (scores[i]) xpGain += 5; } });
  st.lastExam = {type:e.type, date:todayStr(), ms, items:e.items, ans:e.ans, scores, rated:{}};
  st.exams.push(examSummary(st.lastExam)); st.lastExam.idx = st.exams.length - 1;
  st.activeExam = null; addXp(xpGain); checkBadges(); save();
  if (auto) toast(x('Zeit abgelaufen – die Prüfung wurde abgegeben.','Time is up – the exam was submitted.'));
  view = 'examResult'; render(); window.scrollTo(0, 0);
}
function examSummary(r){
  const by = {}; r.items.forEach((o, i) => { const b = by[o.a] || (by[o.a] = [0, 0]); b[0] += r.scores[i] || 0; b[1]++; });
  const tot = r.scores.reduce((s, v) => s + (v || 0), 0), p = Math.round(tot / r.items.length * 100);
  const weak = Object.entries(by).sort((a, b) => (a[1][0] / a[1][1]) - (b[1][0] / b[1][1]) || b[1][1] - a[1][1]).slice(0, 3).map(e => e[0]);
  return {date:r.date, type:r.type, pct:p, ms:r.ms, byArea:by, weak};
}
function yourAnswer(o, a){
  if (a == null || (Array.isArray(a) && !a.length) || a === '') return `<i class="muted">${x('keine Antwort','no answer')}</i>`;
  if (o.t === 'sc') return esc(o.opts[a].x);
  if (o.t === 'mc') return a.map(i => esc(o.opts[i].x)).join('; ');
  if (o.t === 'match') return o.left.map((l, i) => `${esc(l)} → ${esc(a[i] || '–')}`).join('<br>');
  if (o.t === 'order') return a.map((i, k) => `${k + 1}. ${esc(o.items[i])}`).join('<br>');
  if (o.t === 'in') return o.f.map((f, i) => `${esc(f.l)}: ${esc(a[i] || '–')}`).join('<br>');
  return nl2br(a);
}
VIEWS.examResult = () => {
  const r = st.lastExam; if (!r) return VIEWS.pruefung();
  const sum = examSummary(r), g = ihkGrade(sum.pct), opens = r.items.map((o, i) => [o, i]).filter(([o]) => o.t === 'open');
  return `<section class="stack"><h1>${x('Auswertung','Results')} ${r.type.replace('AP', 'AP ')}</h1>
    <div class="grid3">
      <div class="panel pad stack" style="gap:4px"><span class="label">${x('Ergebnis','Score')}</span><span class="big mono">${sum.pct} %</span><span class="small muted">${fmt(r.scores.reduce((s, v) => s + (v || 0), 0), 1, L)} / ${r.items.length} ${x('Punkte','points')}</span></div>
      <div class="panel pad stack" style="gap:4px"><span class="label">${x('Note (IHK-Schlüssel)','Grade (IHK scale)')}</span><span class="big mono">${g.n}</span><span class="small muted">${esc(g.t)} · ${sum.pct >= 50 ? x('bestanden','passed') : x('nicht bestanden','not passed')}</span></div>
      <div class="panel pad stack" style="gap:4px"><span class="label">${x('Bearbeitungszeit','Time used')}</span><span class="big mono">${fmtClock(r.ms)}</span><span class="small muted">${x('von','of')} ${EXAMS[r.type].min} min</span></div></div>
    ${opens.length ? `<div class="panel pad stack" style="border-color:var(--warn)"><span class="label">${x('Offene Fragen selbst bewerten','Rate open questions yourself')}</span>
      ${opens.map(([o, i]) => `<div class="stack" style="gap:6px;padding-block:8px;border-top:1px solid var(--line-2)"><b>${esc(o.q)}</b><div class="small"><span class="label">${x('Deine Antwort','Your answer')}</span><br>${yourAnswer(o, r.ans[i])}</div>${solutionHTML(o)}
        <div class="row">${[[0, x('Nicht gewusst','Didn\'t know')], [1, x('Teilweise','Partly')], [2, x('Sicher','Confident')]].map(([v, t]) => `<button class="btn ${r.rated[i] === v ? '' : 'ghost'} small" data-act="examRate" data-i="${i}" data-r="${v}" aria-pressed="${r.rated[i] === v}">${t}</button>`).join('')}</div></div>`).join('')}</div>` : ''}
    <div class="panel pad stack"><span class="label">${x('Nach Themengebiet','By topic')}</span><div class="scroll-x"><table class="tbl"><thead><tr><th>${x('Bereich','Topic')}</th><th class="n">${x('Punkte','Points')}</th><th style="min-width:120px"></th><th class="n">%</th></tr></thead><tbody>
      ${Object.entries(sum.byArea).sort((a, b) => b[1][0] / b[1][1] - a[1][0] / a[1][1]).map(([a, v]) => `<tr><td><span class="row" style="gap:8px;flex-wrap:nowrap">${wireHTML(a)}${esc(areaName(a))}</span></td><td class="n">${fmt(v[0], v[0] % 1 ? 1 : 0, L)}/${v[1]}</td><td><div class="hb"><i style="width:${v[0] / v[1] * 100}%"></i></div></td><td class="n">${Math.round(v[0] / v[1] * 100)}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="panel pad stack" style="border-color:var(--ink)"><span class="label">${x('Die drei schwächsten Bereiche','The three weakest topics')}</span>
      ${sum.weak.map(a => `<div class="spread"><span class="row" style="gap:8px">${wireHTML(a)}<b>${esc(areaName(a))}</b><span class="small muted">${Math.round(sum.byArea[a][0] / sum.byArea[a][1] * 100)} %</span></span><button class="btn ghost small" data-act="round" data-area="${a}">${x('Gezielt üben','Practise')}</button></div>`).join('')}</div>
    <div class="panel pad stack"><span class="label">${x('Alle Fragen','All questions')}</span>
      ${r.items.map((o, i) => { const s = r.scores[i]; return `<details style="border-top:1px solid var(--line-2);padding-block:8px"><summary class="row" style="gap:8px;cursor:pointer;flex-wrap:nowrap"><span class="led ${s == null ? '' : s === 1 ? 'ok' : s === 0.5 ? 'warn' : 'err'}"></span><span class="mono small">${i + 1}</span><span class="small">${esc(o.q)}</span></summary>
        <div class="stack" style="padding:10px 0 4px 22px">${questionHead(o)}<div class="small"><span class="label">${x('Deine Antwort','Your answer')}</span><br>${yourAnswer(o, r.ans[i])}</div>${solutionHTML(o)}${o.e ? `<p class="small"><b>${x('Warum','Why')}:</b> ${esc(o.e)}</p>` : ''}${o.n ? `<p class="small"><b>${x('Naheliegend, aber falsch','Tempting but wrong')}:</b> ${esc(o.n)}</p>` : ''}</div></details>`; }).join('')}</div>
    <div class="row"><button class="btn" data-act="go" data-v="pruefung">${x('Zur Prüfungsübersicht','Back to exams')}</button><button class="btn ghost" data-act="go" data-v="start">${x('Zur Startseite','Home')}</button></div></section>`;
};

/* ---------- Aktionen ---------- */
const ACT = {
  go: d => go(d.v),
  round: d => startRound({mode:'round', area:d.area, year:d.year}),
  roundF: () => startRound(Object.assign({mode:'round'}, ctx.f)),
  again: () => { const S = ctx.r; startRound(S.mode === 'round' ? {mode:'round', area:S.area} : {mode:S.mode}); },
  review: () => { if (!dueIds().length){ toast(x('Heute ist nichts fällig.','Nothing is due today.')); return; } startRound({mode:'review'}); },
  mistakes: d => startRound({mode:'mistakes', area:d.area}),
  exam: d => { if (confirm(x(`Simulation ${d.type.replace('AP', 'AP ')} starten? ${EXAMS[d.type].n} Fragen, ${EXAMS[d.type].min} Minuten.`, `Start ${d.type.replace('AP', 'AP ')} simulation? ${EXAMS[d.type].n} questions, ${EXAMS[d.type].min} minutes.`))) startExam(d.type); },
  resumeExam: () => { view = 'exam'; render(); },
  submitExam: () => submitExam(false),
  exGo: d => { const e = st.activeExam, i = +d.i; if (!e || i < 0 || i >= e.items.length) return; e.i = i; save(); render(); window.scrollTo(0, 0); },
  exFlag: () => { const e = st.activeExam; e.flags[e.i] = !e.flags[e.i]; save(); render(); },
  examRate: d => { const r = st.lastExam, i = +d.i, v = +d.r, first = r.rated[i] == null; r.rated[i] = v; r.scores[i] = v === 2 ? 1 : v === 1 ? 0.5 : 0;
    if (first){ record(r.items[i], r.scores[i], 60000, 'exam'); if (v) addXp(5 * v); } st.exams[r.idx] = examSummary(r); checkBadges(); save(); render(); },
  cards: d => go('karten', {f:{year:+d.year || 0, area:d.area || ''}}),
  kf: d => { ctx.f.year = +d.y; ctx.f.area = ''; buildDeck(); render(); },
  kNav: d => { ctx.i = Math.max(0, Math.min(ctx.deck.length - 1, ctx.i + +d.d)); ctx.flip = false; render(); },
  flip: () => { ctx.flip = !ctx.flip; render(); },
  tf: d => { ctx.f[d.k] = +d.val; if (d.k === 'year') ctx.f.area = ''; render(); },
  setYear: d => { st.settings.year = +d.y; save(); render(); },
  setLang: d => { st.settings.lang = d.l; pickLang(); save(); render(); if (bridge) bridge.setSettings({uiLang:d.l}); },
  setTheme: d => { st.settings.theme = d.t; applyTheme(); save(); render(); },
  setExam: d => { st.settings.examType = d.k; save(); render(); },
  exportDl: () => download(),
  exportCopy: () => { const t = exportJSON(); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast(x('Fortschritt kopiert.','Progress copied.')), () => ACT.exportShow()); },
  exportShow: () => { const b = document.getElementById('exportBox'); b.value = exportJSON(); b.hidden = false; b.focus(); b.select(); },
  importPaste: () => { const v = document.getElementById('importBox').value; if (v.trim() && importJSON(v)) render(); },
  reset: () => { if (confirm(x('Wirklich den gesamten Fortschritt löschen? Das lässt sich nicht rückgängig machen.','Really delete all progress? This cannot be undone.')) && confirm(x('Letzte Nachfrage: alles löschen?','Last chance: delete everything?'))){ const s = st.settings; st = DEFAULT(); st.settings = s; st.lastVersion = APP_VERSION; save(); toast(x('Fortschritt gelöscht.','Progress deleted.')); go('start'); } },
  delMistake: d => { delete st.mistakes[d.id]; save(); render(); },
  opt: d => { const e = examCtx(), o = e.o, i = +d.i; if (e.done) return;
    if (o.t === 'sc') e.set(i); else { const a = (e.get() || []).slice(), k = a.indexOf(i); k >= 0 ? a.splice(k, 1) : a.push(i); e.set(a.sort((p, q) => p - q)); } render(); },
  ord: d => { const e = examCtx(), o = e.o, i = +d.i; if (e.done) return; const a = (e.get() || []).slice(), k = a.indexOf(i);
    if (k >= 0) a.splice(k, 1); else { a.push(i); if (a.length === o.items.length - 1) a.push(o.items.map((_, j) => j).find(j => !a.includes(j))); } e.set(a); render(); },
  ordReset: () => { const e = examCtx(); e.set([]); render(); },
  check: () => checkAnswer(),
  next: () => nextQuestion(),
  reveal: () => { session.revealed = true; render(); },
  rate: d => checkAnswer(+d.r === 2 ? 1 : +d.r === 1 ? 0.5 : 0),
  quit: () => { if (!session.res.filter(Boolean).length || confirm(x('Runde beenden? Bisherige Antworten bleiben gespeichert.','End the round? Answers so far are kept.'))){ if (session.res.filter(Boolean).length) endRound(); else { session = null; go('start'); } } }
};
/* Zugriff auf die Antwort der aktuellen Frage – in Runde oder Prüfung */
function examCtx(){
  if (view === 'exam' && st.activeExam){ const e = st.activeExam; return {o:e.items[e.i], done:false, get:() => e.ans[e.i], set:v => { e.ans[e.i] = v; save(); }}; }
  const S = session; return {o:S.items[S.i], done:S.checked, get:() => S.ans, set:v => { S.ans = v; }};
}
const CHG = {
  tfArea: el => { ctx.f.area = el.value; render(); },
  tfType: el => { ctx.f.type = el.value; render(); },
  goal: el => { const v = Math.max(5, Math.min(200, Math.round(+el.value || 20))); st.settings.goal = v; save(); renderHeader(); },
  examDate: el => { st.settings.examDate = el.value; save(); },
  importFile: el => { const f = el.files && el.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { if (importJSON(r.result)) render(); }; r.readAsText(f); },
  fbArea: el => { ctx.area = el.value; render(); },
  kfArea: el => { ctx.f.area = el.value; buildDeck(); render(); },
  mSel: el => { const e = examCtx(), a = (e.get() || []).slice(); a[+el.dataset.i] = el.value; e.set(a); refreshCheckBtn(); if (view === 'exam') renderExamNav(); }
};
const INP = {
  inF: el => { const e = examCtx(), a = (e.get() || []).slice(); a[+el.dataset.i] = el.value; e.set(a); refreshCheckBtn(); },
  openTxt: el => { if (view === 'exam') { const e = examCtx(); e.set(el.value); } else if (session) session.note = el.value; }
};
function renderExamNav(){ const e = st.activeExam; if (!e) return; document.querySelectorAll('.qnav button').forEach((b, i) => b.classList.toggle('done', hasAnswer(e.items[i], e.ans[i]))); }

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]'); if (!el || el.disabled) return;
  if (el.tagName === 'A') ev.preventDefault();
  const fn = ACT[el.dataset.act]; if (fn) fn(el.dataset);
});
document.addEventListener('change', ev => { const el = ev.target.closest('[data-chg]'); if (el && CHG[el.dataset.chg]) CHG[el.dataset.chg](el); });
document.addEventListener('input', ev => { const el = ev.target.closest('[data-inp]'); if (el && INP[el.dataset.inp]) INP[el.dataset.inp](el); });

/* ---------- Tastatur ---------- */
document.addEventListener('keydown', ev => {
  if (ev.altKey || ev.metaKey || (ev.ctrlKey && ev.key !== 'Enter')) return;
  const tag = ev.target.tagName, typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  if (document.querySelector('dialog[open]')) return;
  if (view === 'quiz' && session){
    const S = session, o = S.items[S.i];
    if (ev.key === 'Enter'){
      if (tag === 'TEXTAREA' && !ev.ctrlKey) return;
      if (tag === 'SELECT') return;
      ev.preventDefault();
      if (S.checked) nextQuestion(); else if (o.t === 'open') { if (!S.revealed) ACT.reveal(); } else checkAnswer();
      return;
    }
    if (!typing && /^[1-9]$/.test(ev.key)){
      const n = +ev.key - 1;
      if (o.t === 'open' && S.revealed && !S.checked && n < 3){ ACT.rate({r:n}); ev.preventDefault(); }
      else if (!S.checked && (o.t === 'sc' || o.t === 'mc') && n < o.opts.length){ ACT.opt({i:n}); ev.preventDefault(); }
      else if (!S.checked && o.t === 'order' && n < o.disp.length){ ACT.ord({i:o.disp[n]}); ev.preventDefault(); }
    }
    return;
  }
  if (view === 'exam' && st.activeExam){
    const e = st.activeExam, o = e.items[e.i];
    if (ev.key === 'Enter' && tag !== 'TEXTAREA' && tag !== 'SELECT'){ ev.preventDefault(); if (e.i < e.items.length - 1) ACT.exGo({i:e.i + 1}); return; }
    if (!typing && /^[1-9]$/.test(ev.key)){ const n = +ev.key - 1;
      if ((o.t === 'sc' || o.t === 'mc') && n < o.opts.length) ACT.opt({i:n}); else if (o.t === 'order' && n < o.disp.length) ACT.ord({i:o.disp[n]}); }
    return;
  }
  if (view === 'karten' && !typing && ctx.deck){
    if (ev.key === 'ArrowRight') ACT.kNav({d:1}); else if (ev.key === 'ArrowLeft') ACT.kNav({d:-1});
    else if (ev.key === ' ' || ev.key === 'Enter'){ ev.preventDefault(); ACT.flip(); }
    return;
  }
  if (view === 'training' && ev.key === 'Enter' && !typing && tag !== 'BUTTON'){ ACT.roundF(); }
});

/* ---------- Tooltip für Diagramme ---------- */
const tip = document.getElementById('tip');
document.addEventListener('pointermove', ev => {
  const g = ev.target.closest && ev.target.closest('[data-tip]');
  if (!g){ tip.hidden = true; return; }
  tip.textContent = g.getAttribute('data-tip'); tip.hidden = false;
  tip.style.left = Math.min(innerWidth - tip.offsetWidth - 8, ev.clientX + 12) + 'px'; tip.style.top = (ev.clientY - 34) + 'px';
});

/* ---------- Start ---------- */
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (VIEWS[h] && h !== view && !['quiz','exam','examResult','roundEnd'].includes(h)) go(h); });
document.addEventListener('visibilitychange', () => { if (document.hidden) return; if (!session && view !== 'exam') renderHeader(); });
(async function boot(){
  load();
  if (bridge){
    // Version und Sprache kommen aus der Desktop-App
    try { const [info, s] = await Promise.all([bridge.getInfo(), bridge.getSettings()]); APP_VERSION = info.version; st.settings.lang = s.uiLang; } catch(e){}
  }
  pickLang(); applyTheme();
  const h = location.hash.slice(1);
  view = VIEWS[h] && !['quiz','exam','examResult','roundEnd'].includes(h) ? h : 'start';
  if (st.activeExam && examRemaining(st.activeExam) <= 0) submitExam(true);
  else if (st.activeExam) view = 'exam';
  save(); render();
})();
