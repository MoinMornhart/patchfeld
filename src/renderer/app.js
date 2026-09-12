'use strict';

/* Patchfeld – main window: courses, mentor chat, work area with tasks, learning profile.
   catalog.js and engine.js (loaded before) provide the question catalog and the task widgets;
   engine.js owns the global language variable L. */
(function () {
  const api = window.patchfeld;
  const I18N = window.PF_I18N;
  const MD = window.PF_MD;

  const state = {
    info: null,
    settings: null,
    lang: 'de',
    courses: [],
    currentId: null,
    data: null, // { transcript, profile, exercise, answer, taskAnswer, day, busy }
    busy: false,
    stream: null,
    updateStatus: null,
    saveTimer: null,
  };

  const $ = (selector) => document.querySelector(selector);
  const t = (key, vars) => I18N.t(state.lang, key, vars);
  const md = (text) => MD.render(text, { toEditorLabel: t('to_editor') });
  const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));
  const course = () => state.courses.find((c) => c.id === state.currentId) || null;
  const cname = (c) => (c ? c.name[state.lang] || c.name.de : '');

  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (value == null || value === false) continue;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'html') node.innerHTML = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children.flat()) if (child != null) node.append(child);
    return node;
  }

  // ---------- language ----------

  function applyI18n() {
    document.documentElement.lang = state.lang;
    L = state.lang; // language of the task engine (engine.js)
    document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach((node) => { node.placeholder = t(node.dataset.i18nPh); });
    $('#lang-toggle').textContent = state.lang === 'de' ? 'EN' : 'DE';
    renderCommandChips();
  }

  async function setLang(lang) {
    if (lang === state.lang) return;
    state.lang = lang;
    await saveSetting({ uiLang: lang });
    applyI18n();
    if (!$('#home').hidden) renderHome();
    else if (state.data) {
      $('#course-name').textContent = cname(course());
      renderCourseHeader();
      renderMessages();
      renderExercise();
      renderProfile();
    }
  }

  // ---------- home ----------

  function showView(name) {
    $('#home').hidden = name !== 'home';
    $('#course').hidden = name !== 'course';
  }

  function renderHome() {
    const grid = $('#course-grid');
    grid.replaceChildren();
    state.courses.forEach((c, index) => {
      const p = c.profile;
      const status = c.day === 0
        ? t('course_new')
        : [t('course_day', { n: c.day }), p ? t('course_level', { n: p.level }) : null].filter(Boolean).join(' · ');
      grid.append(el('button', { class: 'course-tile', type: 'button', style: `--accent:${c.color}`, onclick: () => openCourse(c.id) },
        el('span', { class: 'tile-num', text: String(index + 1).padStart(2, '0') }),
        el('span', { class: 'tile-name', text: cname(c) }),
        el('span', { class: 'tile-exam', text: c.exam }),
        el('span', { class: 'tile-desc', text: t(`course_desc_${c.id}`) }),
        el('span', { class: 'tile-status', text: status }),
        el('span', { class: 'progress' }, el('span', { class: 'progress-bar', style: `width:${clamp(p && p.progress_percent)}%` })),
        el('span', { class: 'tile-action', text: c.day === 0 ? t('course_start') : t('course_open') })));
    });
    renderTrainerStats();
  }

  // Reads the exam trainer's progress (same origin, localStorage) for the summary on the home page.
  function trainerSummary() {
    let st = null;
    try { st = JSON.parse(localStorage.getItem('patchfeld.v1') || 'null'); } catch { st = null; }
    const day = (d) => { const z = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; };
    const today = day(new Date());
    if (!st) return { due: 0, today: 0, goal: 20, streak: 0 };
    const due = Object.values(st.cards || {}).filter((c) => c.b > 0 && c.due <= today).length;
    const days = st.days || {};
    const d = new Date();
    if (!(days[today] && days[today].met)) d.setDate(d.getDate() - 1);
    let streak = 0;
    while (days[day(d)] && days[day(d)].met) { streak += 1; d.setDate(d.getDate() - 1); }
    return { due, today: (days[today] || {}).n || 0, goal: (st.settings || {}).goal || 20, streak };
  }

  function renderTrainerStats() {
    const s = trainerSummary();
    const stat = (label, value) => el('div', { class: 'stat' }, el('span', { class: 'muted', text: label }), el('strong', { text: String(value) }));
    $('#trainer-stats').replaceChildren(
      stat(t('trainer_due'), s.due),
      stat(t('trainer_today'), `${s.today}/${s.goal}`),
      stat(t('trainer_streak'), s.streak));
  }

  async function goHome() {
    state.courses = await api.listCourses();
    renderHome();
    showView('home');
  }

  // ---------- course ----------

  async function openCourse(id) {
    state.currentId = id;
    state.stream = null;
    state.data = await api.getCourse(id);
    const c = course();
    const view = $('#course');
    view.style.setProperty('--accent', c.color);
    view.style.setProperty('--accent-ink', c.ink);
    $('#course-name').textContent = cname(c);
    renderCourseHeader();
    renderMessages();
    renderExercise();
    renderProfile();
    showView('course');
    setBusy(Boolean(state.data.busy));
    $('#composer-input').focus();
  }

  function renderCourseHeader() {
    const d = state.data;
    const parts = [];
    if (d.profile) parts.push(t('course_level', { n: d.profile.level }));
    parts.push(d.day ? t('course_day', { n: d.day }) : t('course_new'));
    $('#course-badge').textContent = parts.join(' · ');
    $('#new-day').hidden = d.day === 0;
  }

  // ---------- chat ----------

  function scrollDown(force) {
    const box = $('#messages');
    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 160;
    if (force || nearBottom) box.scrollTop = box.scrollHeight;
  }

  function bubble(role, text) {
    return el('div', { class: `msg ${role}` }, el('div', { class: 'md', html: md(text) }));
  }

  function toolChip(name, title) {
    if (name === 'set_exercise') return el('div', { class: 'chip-line', text: `📝 ${t('chip_exercise', { title: title || '' })}` });
    if (name === 'load_exam_task') return el('div', { class: 'chip-line', text: `🗂️ ${t('chip_task', { title: title || '' })}` });
    if (name === 'update_learning_profile') return el('div', { class: 'chip-line', text: `💾 ${t('chip_profile')}` });
    return null;
  }

  function dayDivider(text) {
    return el('div', { class: 'day-divider' }, el('span', { text: String(text).replace(/^\[|\]$/g, '') }));
  }

  function startPanel() {
    const first = state.data.day === 0;
    return el('div', { class: 'start-panel' },
      el('h3', { text: t('start_title') }),
      el('p', { class: 'muted', text: first ? t('start_text_first') : t('start_text_next') }),
      el('button', {
        class: 'primary',
        type: 'button',
        text: first ? t('start_first') : t('start_next', { n: state.data.day + 1 }),
        onclick: () => startDay(),
      }));
  }

  function renderMessages() {
    const box = $('#messages');
    box.replaceChildren();
    state.stream = null;
    for (const item of state.data.transcript) {
      if (item.type === 'day') box.append(dayDivider(item.text));
      else if (item.type === 'user') box.append(bubble('user', item.text));
      else if (item.type === 'mentor') box.append(bubble('mentor', item.text));
      else if (item.type === 'tool') {
        const chip = toolChip(item.name, item.title);
        if (chip) box.append(chip);
      }
    }
    if (!state.data.transcript.length) box.append(startPanel());
    if (state.busy) showThinking();
    scrollDown(true);
  }

  function showThinking() {
    removeThinking();
    $('#messages').append(el('div', { class: 'msg mentor thinking', id: 'thinking', text: t('mentor_thinking') }));
    scrollDown();
  }

  function removeThinking() {
    const node = document.getElementById('thinking');
    if (node) node.remove();
  }

  function appendLive(node) {
    removeThinking();
    $('#messages').append(node);
    if (state.busy) showThinking();
    scrollDown();
  }

  function ensureStreamBubble() {
    if (!state.stream) {
      removeThinking();
      const body = el('div', { class: 'md' });
      const node = el('div', { class: 'msg mentor' }, body);
      $('#messages').append(node);
      state.stream = { node, body, text: '', scheduled: false };
    }
    return state.stream;
  }

  function showError(error) {
    const code = error && error.code;
    let text;
    if (code === 'auth') text = t('err_auth');
    else if (code === 'limit') text = t('err_limit');
    else if (code === 'busy') text = t('err_busy');
    else text = t('err_generic', { msg: (error && error.message) || '?' });
    const box = el('div', { class: 'msg error' }, el('div', { text }));
    if (code === 'auth') box.append(el('button', { type: 'button', text: t('open_settings'), onclick: openSettings }));
    $('#messages').append(box);
    scrollDown(true);
  }

  function setBusy(busy) {
    state.busy = busy;
    for (const selector of ['#send-btn', '#submit-btn', '#new-day']) $(selector).disabled = busy;
    document.querySelectorAll('#command-chips button, .start-panel button').forEach((b) => { b.disabled = busy; });
    if (!busy) removeThinking();
  }

  async function runMentor(call) {
    const id = state.currentId;
    setBusy(true);
    showThinking();
    let res;
    try {
      res = await call();
    } catch (err) {
      res = { ok: false, error: { code: 'generic', message: err.message } };
    }
    setBusy(false);
    state.courses = await api.listCourses();
    if (id !== state.currentId || $('#course').hidden) {
      if (!$('#home').hidden) renderHome();
      return res;
    }
    // Re-render from the saved state so the chat always matches what was stored.
    state.data = await api.getCourse(id);
    renderCourseHeader();
    renderMessages();
    renderExercise();
    renderProfile();
    if (!res.ok) showError(res.error);
    return res;
  }

  async function sendToMentor(text) {
    const clean = String(text || '').trim();
    if (!clean || state.busy) return;
    const box = $('#messages');
    const panel = box.querySelector('.start-panel');
    if (panel) panel.remove();
    box.append(bubble('user', clean));
    scrollDown(true);
    const id = state.currentId;
    await runMentor(() => api.send(id, clean));
  }

  async function startDay() {
    if (state.busy) return;
    if (state.data.transcript.length && !window.confirm(t('new_day_confirm'))) return;
    const id = state.currentId;
    $('#messages').replaceChildren();
    await runMentor(() => api.startDay(id));
  }

  function renderCommandChips() {
    const box = $('#command-chips');
    box.replaceChildren();
    for (const cmd of t('cmd_list').split(' ')) {
      box.append(el('button', { type: 'button', text: cmd, disabled: state.busy, onclick: () => sendToMentor(cmd) }));
    }
  }

  // ---------- work area: tasks, answers, checking ----------

  const exercise = () => state.data && state.data.exercise;
  const catalogTask = () => (exercise() && exercise().kind === 'catalog' ? exercise().task : null);
  const taskAnswer = () => state.data.taskAnswer || { ans: null, score: null };

  function saveAnswerSoon() {
    clearTimeout(state.saveTimer);
    const id = state.currentId;
    const answer = state.data.answer || '';
    const ta = state.data.taskAnswer;
    state.saveTimer = setTimeout(() => api.saveAnswer(id, answer, ta), 400);
  }

  function renderExercise() {
    const ex = exercise();
    const task = catalogTask();
    const title = $('#exercise-title');
    const body = $('#exercise-body');
    const area = $('#task-area');
    const answer = $('#answer');
    title.textContent = ex ? ex.title : '';
    title.hidden = !ex;
    $('#exercise-kind').textContent = ex ? `· ${t(ex.kind === 'catalog' ? 'kind_catalog' : 'kind_free')}` : '';
    if (!ex) body.replaceChildren(el('p', { class: 'muted', text: t('exercise_none') }));
    else if (task) body.innerHTML = questionHead(task);
    else body.innerHTML = md(ex.instructions || '');

    const open = task && task.t === 'open';
    area.hidden = !task || open;
    answer.hidden = Boolean(task) && !open;
    answer.value = state.data.answer || '';
    $('#check-btn').hidden = !task || open;
    $('#answer-hint').textContent = !ex ? '' : task ? t(open ? 'hint_open' : 'hint_catalog') : t('hint_free');
    if (task && !open) renderTaskArea();
    renderResult();
  }

  function renderTaskArea() {
    const task = catalogTask();
    if (!task) return;
    const ta = taskAnswer();
    $('#task-area').innerHTML = answerHTML(task, ta.ans, ta.score != null, true);
  }

  function renderResult() {
    const out = $('#result');
    const ex = exercise();
    const task = catalogTask();
    $('#check-status').textContent = '';
    if (!ex) { out.replaceChildren(el('span', { class: 'muted', text: t('result_empty') })); return; }
    if (!task) { out.replaceChildren(el('span', { class: 'muted', text: t('result_free') })); return; }
    if (task.t === 'open') { out.replaceChildren(el('span', { class: 'muted', text: t('result_open') })); return; }
    const ta = taskAnswer();
    if (ta.score == null) { out.replaceChildren(el('span', { class: 'muted', text: t('result_empty') })); return; }
    const ok = ta.score === 1;
    out.replaceChildren(...[
      el('div', { class: `verdict ${ok ? 'ok' : 'bad'}`, text: ok ? `✅ ${t('verdict_ok')}` : `❌ ${t('verdict_bad')}` }),
      ok ? null : el('div', { html: solutionHTML(task) }),
      task.e ? el('p', {}, el('strong', { text: `${t('why')}: ` }), task.e) : null,
      task.n ? el('p', {}, el('strong', { text: `${t('tempting')}: ` }), task.n) : null,
    ].filter(Boolean));
    $('#check-status').textContent = t('checked');
  }

  function setTaskAns(ans) {
    state.data.taskAnswer = { ans, score: null };
    saveAnswerSoon();
  }

  function onTaskAction(act, index) {
    const task = catalogTask();
    if (!task || taskAnswer().score != null) return;
    const cur = taskAnswer().ans;
    if (act === 'opt') {
      if (task.t === 'sc') setTaskAns(index);
      else {
        const a = (cur || []).slice();
        const k = a.indexOf(index);
        if (k >= 0) a.splice(k, 1); else a.push(index);
        setTaskAns(a.sort((p, q) => p - q));
      }
    } else if (act === 'ord') {
      const a = (cur || []).slice();
      const k = a.indexOf(index);
      if (k >= 0) a.splice(k, 1);
      else {
        a.push(index);
        if (a.length === task.items.length - 1) a.push(task.items.map((_, j) => j).find((j) => !a.includes(j)));
      }
      setTaskAns(a);
    } else if (act === 'ordReset') {
      setTaskAns([]);
    }
    renderTaskArea();
    renderResult();
  }

  function checkTask() {
    const task = catalogTask();
    if (!task || task.t === 'open') return null;
    const ta = taskAnswer();
    if (ta.score != null) return ta.score;
    if (!hasAnswer(task, ta.ans)) {
      $('#check-status').textContent = t('need_answer');
      return null;
    }
    state.data.taskAnswer = { ans: ta.ans, score: grade(task, ta.ans) };
    saveAnswerSoon();
    renderTaskArea();
    renderResult();
    return state.data.taskAnswer.score;
  }

  function summarizeAnswer(task, a) {
    if (a == null || (Array.isArray(a) && !a.length)) return t('submit_empty');
    if (task.t === 'sc') return task.opts[a].x;
    if (task.t === 'mc') return a.map((i) => `- ${task.opts[i].x}`).join('\n');
    if (task.t === 'match') return task.left.map((l, i) => `- ${l} → ${a[i] || '–'}`).join('\n');
    if (task.t === 'order') return a.map((i, k) => `${k + 1}. ${task.items[i]}`).join('\n');
    if (task.t === 'in') return task.f.map((f, i) => `- ${f.l}: ${a[i] || '–'}${f.u && f.u !== '/' ? ` ${f.u}` : ''}`).join('\n');
    return String(a);
  }

  async function submitAnswer() {
    if (state.busy) return;
    const ex = exercise();
    const task = catalogTask();
    let text;
    if (task && task.t !== 'open') {
      const score = checkTask();
      if (score == null) return;
      text = [t('submit_intro', { title: ex.title }), '', summarizeAnswer(task, taskAnswer().ans), '',
        score === 1 ? t('submit_result_ok') : t('submit_result_bad')].join('\n');
    } else {
      const answer = ($('#answer').value || '').trim();
      if (!answer) { $('#check-status').textContent = t('need_answer'); return; }
      text = [t('submit_intro', { title: ex ? ex.title : '–' }), '', answer].join('\n');
    }
    await sendToMentor(text);
  }

  // ---------- profile ----------

  function renderProfile() {
    const pane = $('#profile-pane');
    pane.replaceChildren(el('h3', { text: t('p_title') }));
    const p = state.data && state.data.profile;
    if (!p) {
      pane.append(el('p', { class: 'muted', text: t('p_empty') }));
      return;
    }
    const stat = (label, value) => el('div', { class: 'stat' }, el('span', { class: 'muted', text: label }), el('strong', { text: String(value) }));
    const section = (label, ...content) => [el('h4', { text: label }), ...content];
    const tags = (items, kind) => el('div', { class: 'tags' }, items.map((x) => el('span', { class: `tag ${kind}`, text: x })));
    pane.append(
      el('div', { class: 'stats' },
        stat(t('p_level'), p.level),
        stat(t('p_day'), state.data.day),
        stat(t('p_streak'), p.streak),
        stat(t('p_progress'), `${clamp(p.progress_percent)}%`)),
      el('span', { class: 'progress' }, el('span', { class: 'progress-bar', style: `width:${clamp(p.progress_percent)}%` })),
    );
    if (p.phase) pane.append(...section(t('p_phase'), el('p', { text: p.phase })));
    if (p.goals) pane.append(...section(t('p_goals'), el('p', { class: 'muted', text: p.goals })));
    if (p.mastered && p.mastered.length) pane.append(...section(t('p_mastered'), tags(p.mastered, 'good')));
    if (p.shaky && p.shaky.length) pane.append(...section(t('p_shaky'), tags(p.shaky, 'warn')));
    if (p.open && p.open.length) pane.append(...section(t('p_open'), tags(p.open, 'bad')));
    if (p.mistakes && p.mistakes.length) {
      pane.append(...section(t('p_mistakes'), el('ul', { class: 'plain-list' }, p.mistakes.map((m) => el('li', {},
        el('strong', { text: m.topic }),
        el('div', { class: 'muted small', text: `${t('p_reviews', { n: m.clean_reviews })} · ${t('p_next_review', { when: m.next_review })}` }))))));
    }
    if (p.projects && p.projects.length) {
      pane.append(...section(t('p_projects'), el('ul', { class: 'plain-list' }, p.projects.map((x) => el('li', { text: `L${x.level} · ${x.name} – ${x.rating}` })))));
    }
    if (p.glossary && p.glossary.length) {
      pane.append(...section(t('p_glossary'), el('dl', { class: 'glossary' }, p.glossary.flatMap((g) => [el('dt', { text: g.term }), el('dd', { text: g.meaning })]))));
    }
    if (p.recommendation) pane.append(...section(t('p_reco'), el('p', { text: p.recommendation })));
  }

  function toggleProfile() {
    const pane = $('#profile-pane');
    pane.hidden = !pane.hidden;
    $('#course').classList.toggle('with-profile', !pane.hidden);
  }

  // ---------- settings & updates ----------

  function openSettings() {
    renderSettings();
    const dialog = $('#settings-dialog');
    if (!dialog.open) dialog.showModal();
  }

  function renderSettings() {
    const s = state.settings;
    $('#model-select').value = s.model || '';
    $('#effort-select').value = s.effort;
    $('#lang-select').value = state.lang;
    $('#key-status').textContent = s.hasApiKey ? t('api_key_stored') : t('api_key_none');
    $('#remove-key').hidden = !s.hasApiKey;
    $('#settings-version').textContent = t('version_label', { v: state.info.version });
    $('#danger-zone').hidden = !state.currentId || $('#course').hidden;
    renderUpdateStatus();
  }

  async function saveSetting(patch) {
    const result = await api.setSettings(patch);
    state.settings = result;
    if (result.error) window.alert(result.error);
    if ($('#settings-dialog').open) renderSettings();
  }

  function renderUpdateStatus() {
    const u = state.updateStatus;
    const banner = $('#update-banner');
    const install = $('#update-install');
    let message = '';
    banner.hidden = true;
    install.hidden = true;
    if (u) {
      switch (u.status) {
        case 'checking': message = t('update_checking'); break;
        case 'available': message = t('update_available', { v: u.version }); banner.hidden = false; break;
        case 'downloading': message = t('update_progress', { p: Math.round(u.percent || 0) }); banner.hidden = false; break;
        case 'ready': message = t('update_ready', { v: u.version }); banner.hidden = false; install.hidden = false; break;
        case 'none': message = t('update_none'); break;
        case 'dev': message = t('update_dev'); break;
        case 'error': message = t('update_error', { msg: u.message }); break;
        default: break;
      }
    }
    $('#update-text').textContent = message;
    $('#update-status').textContent = message;
  }

  // ---------- wiring ----------

  function bindEvents() {
    $('#back-home').addEventListener('click', goHome);
    $('#new-day').addEventListener('click', () => startDay());
    $('#toggle-profile').addEventListener('click', toggleProfile);

    $('#composer').addEventListener('submit', (event) => {
      event.preventDefault();
      if (state.busy) return;
      const input = $('#composer-input');
      const text = input.value;
      input.value = '';
      sendToMentor(text);
    });
    $('#composer-input').addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        $('#composer').requestSubmit();
      }
    });

    const answer = $('#answer');
    answer.addEventListener('input', () => { state.data.answer = answer.value; saveAnswerSoon(); });
    answer.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); submitAnswer(); }
    });
    $('#check-btn').addEventListener('click', () => checkTask());
    $('#submit-btn').addEventListener('click', () => submitAnswer());

    // Widgets of catalog tasks (buttons, selects, input fields rendered by engine.js).
    const area = $('#task-area');
    area.addEventListener('click', (event) => {
      const button = event.target.closest('[data-act]');
      if (button && !button.disabled) onTaskAction(button.dataset.act, Number(button.dataset.i));
    });
    area.addEventListener('change', (event) => {
      const select = event.target.closest('[data-chg="mSel"]');
      if (!select) return;
      const a = (taskAnswer().ans || []).slice();
      a[Number(select.dataset.i)] = select.value;
      setTaskAns(a);
    });
    area.addEventListener('input', (event) => {
      const input = event.target.closest('[data-inp="inF"]');
      if (!input) return;
      const a = (taskAnswer().ans || []).slice();
      a[Number(input.dataset.i)] = input.value;
      setTaskAns(a);
    });
    document.addEventListener('keydown', (event) => {
      if ($('#course').hidden || $('#settings-dialog').open) return;
      const task = catalogTask();
      if (!task) return;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && event.target.id !== 'composer-input') {
        event.preventDefault();
        if (taskAnswer().score == null) checkTask(); else submitAnswer();
      } else if (!typing && !event.ctrlKey && !event.altKey && /^[1-9]$/.test(event.key)) {
        const n = Number(event.key) - 1;
        if ((task.t === 'sc' || task.t === 'mc') && n < task.opts.length) onTaskAction('opt', n);
        else if (task.t === 'order' && n < task.disp.length) onTaskAction('ord', task.disp[n]);
      }
    });

    // "To answer" buttons inside rendered code blocks (chat and task text).
    document.addEventListener('click', (event) => {
      const button = event.target.closest('.to-editor');
      if (!button) return;
      const code = button.closest('.code-block').querySelector('code').textContent;
      const input = $('#answer');
      if (input.hidden) return;
      if (input.value.trim() && input.value !== code && !window.confirm(t('confirm_replace'))) return;
      input.value = code;
      input.dispatchEvent(new Event('input'));
    });

    $('#lang-toggle').addEventListener('click', () => setLang(state.lang === 'de' ? 'en' : 'de'));
    $('#open-settings').addEventListener('click', openSettings);
    $('#model-select').addEventListener('change', (e) => saveSetting({ model: e.target.value }));
    $('#effort-select').addEventListener('change', (e) => saveSetting({ effort: e.target.value }));
    $('#lang-select').addEventListener('change', (e) => setLang(e.target.value));
    $('#save-key').addEventListener('click', async () => {
      const input = $('#api-key');
      const key = input.value.trim();
      if (!key) return;
      input.value = '';
      await saveSetting({ apiKey: key });
    });
    $('#remove-key').addEventListener('click', () => saveSetting({ apiKey: '' }));
    $('#check-updates').addEventListener('click', async () => {
      state.updateStatus = { status: 'checking' };
      renderUpdateStatus();
      const result = await api.checkUpdates();
      if (result.status === 'dev' || result.status === 'error') {
        state.updateStatus = result;
        renderUpdateStatus();
      }
    });
    $('#update-install').addEventListener('click', () => api.installUpdate());
    $('#reset-course').addEventListener('click', async () => {
      const c = course();
      if (!c || !window.confirm(t('reset_confirm', { name: cname(c) }))) return;
      await api.resetCourse(c.id);
      $('#settings-dialog').close();
      state.courses = await api.listCourses();
      await openCourse(c.id);
    });

    api.onDelta(({ courseId, delta }) => {
      if (courseId !== state.currentId) return;
      const s = ensureStreamBubble();
      s.text += delta;
      if (!s.scheduled) {
        s.scheduled = true;
        requestAnimationFrame(() => {
          s.scheduled = false;
          s.body.innerHTML = md(s.text);
          scrollDown();
        });
      }
    });
    api.onSegment(({ courseId }) => {
      if (courseId !== state.currentId) return;
      state.stream = null;
      if (state.busy) showThinking();
    });
    api.onProfile(({ courseId, profile }) => {
      if (courseId !== state.currentId) return;
      state.data.profile = profile;
      renderProfile();
      renderCourseHeader();
      appendLive(toolChip('update_learning_profile'));
    });
    api.onExercise(({ courseId, exercise: ex }) => {
      if (courseId !== state.currentId) return;
      state.data.exercise = ex;
      state.data.answer = ex.kind === 'free' ? ex.answer_template || '' : '';
      state.data.taskAnswer = null;
      renderExercise();
      appendLive(toolChip(ex.kind === 'catalog' ? 'load_exam_task' : 'set_exercise', ex.title));
    });
    api.onUpdate((status) => {
      state.updateStatus = status;
      renderUpdateStatus();
    });
    window.addEventListener('focus', () => { if (!$('#home').hidden) renderTrainerStats(); });
  }

  async function init() {
    state.info = await api.getInfo();
    state.settings = await api.getSettings();
    state.lang = state.settings.uiLang;
    state.courses = await api.listCourses();
    $('#app-version').textContent = `v${state.info.version}`;
    bindEvents();
    applyI18n();
    renderHome();
    showView('home');
    if (state.info.selftest) await selftest();
  }

  // ---------- selftest (npm run selftest) ----------

  // The answer that must be graded as correct for a task instance.
  function correctAnswer(task) {
    switch (task.t) {
      case 'sc': return task.opts.findIndex((o) => o.ok);
      case 'mc': return task.opts.map((o, i) => (o.ok ? i : -1)).filter((i) => i >= 0);
      case 'match': return task.sol.slice();
      case 'order': return task.items.map((_, i) => i);
      case 'in': return task.f.map((f) => (typeof f.v === 'number' ? fmt(f.v, (String(f.v).split('.')[1] || '').length, L) : String(f.v)));
      default: return 2;
    }
  }

  async function selftest() {
    const results = [];
    const check = async (name, fn) => {
      try {
        results.push({ name, ok: true, detail: await fn() });
      } catch (err) {
        results.push({ name, ok: false, detail: String(err && err.message ? err.message : err) });
      }
    };
    const expect = (condition, message) => { if (!condition) throw new Error(message); };

    await check('i18n', () => { const text = $('#home-title').textContent; expect(text.length > 0, 'empty title'); return text; });
    await check('five course tiles', () => { const n = document.querySelectorAll('.course-tile').length; expect(n === 5, `tiles: ${n}`); return n; });
    await check('markdown escapes html', () => { const h = MD.render('<img src=x onerror=alert(1)>'); expect(!h.includes('<img'), h); return 'ok'; });
    await check('catalog loaded', () => { expect(Q.length >= 360, `questions: ${Q.length}`); expect(AREAS.length === 18, 'areas'); return Q.length; });
    for (const lang of ['de', 'en']) {
      await check(`every task grades its own solution (${lang})`, () => {
        L = lang;
        let n = 0;
        for (const q of Q) {
          for (let k = 0; k < (q.gen ? 5 : 1); k += 1) {
            const task = inst(q);
            expect(answerHTML(task, null, false, true).length > 0 || task.t === 'open', `render ${q.id}`);
            if (task.t === 'open') continue;
            expect(grade(task, correctAnswer(task)) === 1, `${q.id} (${lang}) not graded correct`);
            if (task.t === 'sc') expect(grade(task, task.opts.findIndex((o) => !o.ok)) === 0, `${q.id} wrong option graded correct`);
            n += 1;
          }
        }
        L = state.lang;
        return n;
      });
    }
    await check('trainer page', async () => { const r = await fetch('trainer.html'); expect(r.ok, `status ${r.status}`); const j = await fetch('trainer.js'); expect(j.ok, 'trainer.js'); return 'ok'; });
    await check('open course', async () => { await openCourse('lj1'); expect(!$('#course').hidden, 'course hidden'); expect(document.querySelector('.start-panel'), 'no start panel'); return 'ok'; });
    await check('work area with catalog task', () => {
      L = state.lang;
      const task = inst(Q.find((q) => q.t === 'sc'));
      state.data.exercise = { kind: 'catalog', title: 'Test', task };
      state.data.taskAnswer = null;
      renderExercise();
      onTaskAction('opt', task.opts.findIndex((o) => o.ok));
      expect(checkTask() === 1, 'check failed');
      expect($('#result').textContent.includes(t('verdict_ok')), 'no verdict');
      return 'ok';
    });

    api.selftestResult({ ok: results.every((r) => r.ok), results });
  }

  init().catch((err) => {
    document.body.prepend(el('pre', { class: 'fatal', text: String(err && err.stack ? err.stack : err) }));
    if (api && api.selftestResult) api.selftestResult({ ok: false, results: [{ name: 'init', ok: false, detail: String(err) }] });
  });
})();
