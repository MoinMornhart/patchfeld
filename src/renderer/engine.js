/* Patchfeld – Aufgaben-Engine: Sprache, Instanziierung, Bewertung und Darstellung der Katalogfragen.
   Wird vom Mentor-Arbeitsbereich (app.js), vom Prüfungstrainer (trainer.js) und im Hauptprozess
   (src/main/catalog.js, per vm) genutzt. Setzt catalog.js voraus. */
let L = 'de';
const x = (de, en) => L === 'en' ? en : de;
/* ---------- Hilfen ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const areaName = a => AREA[a] ? AREA[a][L] : a;
const wireHTML = (a, cls='') => { const ar = AREA[a]; return `<span class="wire wc-${ar.w}${ar.s?' s':''} ${cls}" aria-hidden="true"></span>`; };
const wireLabel = a => { const ar = AREA[a]; return (ar.s ? x('weiß-','white-') : '') + WIRE_NAME[L][ar.w]; };
const QI = Object.fromEntries(Q.map(q => [q.id, q]));
const qType = q => q.gen ? 'in' : q.t;
const TYPE_NAME = () => ({sc:x('Single Choice','Single choice'), mc:x('Mehrfachauswahl','Multiple choice'), in:x('Rechnen/Eingabe','Calculation/input'), match:x('Zuordnung','Matching'), order:x('Reihenfolge','Ordering'), open:x('Offene Frage','Open question')});

/* ---------- Frage instanziieren ---------- */
function inst(q){
  const d = q.gen ? GEN[q.gen](L) : Object.assign({}, q[L] || q.de);
  const t = q.gen ? d.t : q.t;
  const o = {id:q.id, a:q.a, t, s:d.s, q:d.q, code:d.code || q.code || '', tb:d.tb || null, e:d.e || '', n:d.n || ''};
  if (t === 'sc' || t === 'mc'){
    const c = q.gen ? d.c : q.c, cs = Array.isArray(c) ? c : [c];
    o.opts = shuffle(d.o.map((txt, i) => ({x:txt, ok:cs.includes(i)})));
  } else if (t === 'match'){
    const pairs = shuffle(d.p);
    o.left = pairs.map(p => p[0]); o.sol = pairs.map(p => p[1]); o.right = shuffle(o.sol);
  } else if (t === 'order'){
    o.items = d.o.slice(); let idx;
    do { idx = shuffle(d.o.map((_, i) => i)); } while (d.o.length > 1 && idx.every((v, i) => v === i));
    o.disp = idx;
  } else if (t === 'in'){
    o.f = q.gen ? d.f : q.f.map((f, i) => Object.assign({}, f, {l:(d.l || [])[i] || '', u:(d.u && d.u[i]) || f.u || ''}));
  } else if (t === 'open'){ o.m = d.m; o.k = d.k || []; }
  return o;
}

/* ---------- Bewertung ---------- */
const normTxt = s => String(s ?? '').trim().replace(/\s+/g,'').replace(/^\//,'').toLowerCase();
function parseNum(s){
  s = String(s ?? '').trim().replace(/[\s€%]/g,'').replace(/[a-z]+$/i,'');
  if (!s) return NaN;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s) && (L !== 'en' || s.includes(','))) s = s.replace(/\./g,'').replace(',','.');   // 1.234,5
  else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s) && (L === 'en' || s.includes('.'))) s = s.replace(/,/g,'');              // 1,234.5
  else if (s.includes(',') && !s.includes('.')) s = s.replace(',','.');                                                     // 3,75
  return Number(s);
}
function fieldOk(f, val){
  if (typeof f.v === 'number'){ const n = parseNum(val); return !isNaN(n) && Math.abs(n - f.v) <= (f.tol || 0) + 1e-9; }
  const a = normTxt(val), b = normTxt(f.v);
  return a === b || (/^\d+$/.test(a) && a.replace(/^0+(?=\d)/,'') === b);
}
function grade(o, ans){
  switch (o.t){
    case 'sc': return ans != null && o.opts[ans].ok ? 1 : 0;
    case 'mc': { const sel = ans || []; return o.opts.every((op, i) => op.ok === sel.includes(i)) ? 1 : 0; }
    case 'match': return ans && o.left.every((_, i) => ans[i] === o.sol[i]) ? 1 : 0;
    case 'order': return ans && ans.length === o.items.length && ans.every((v, i) => v === i) ? 1 : 0;
    case 'in': return o.f.every((f, i) => fieldOk(f, (ans || [])[i])) ? 1 : 0;
    case 'open': return ans === 2 ? 1 : ans === 1 ? 0.5 : 0;
  }
  return 0;
}
function hasAnswer(o, ans){
  switch (o.t){
    case 'sc': return ans != null;
    case 'mc': return !!(ans && ans.length);
    case 'match': return !!(ans && o.left.every((_, i) => ans[i]));
    case 'order': return !!(ans && ans.length === o.items.length);
    case 'in': return !!(ans && ans.some(v => String(v ?? '').trim()));
    case 'open': return typeof ans === 'string' ? !!ans.trim() : ans != null;
  }
  return false;
}

const nl2br = s => esc(s).replace(/\n/g, '<br>');
function questionHead(o){
  return `${o.s ? `<p class="sit">${nl2br(o.s)}</p>` : ''}
    ${o.tb ? `<div class="qtable"><table><thead><tr>${o.tb.h.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${o.tb.r.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}
    ${o.code ? `<pre class="code">${esc(o.code)}</pre>` : ''}
    <p class="qtext">${esc(o.q)}</p>`;
}
function fmtVal(f){ return typeof f.v === 'number' ? fmt(f.v, (String(f.v).split('.')[1] || '').length, L) : f.v; }
function previewBody(o){
  if (o.t === 'sc' || o.t === 'mc') return `<ul class="small">${o.opts.map(op => `<li>${esc(op.x)}</li>`).join('')}</ul>`;
  if (o.t === 'match') return `<ul class="small">${o.left.map(l => `<li>${esc(l)} → ?</li>`).join('')}</ul>`;
  if (o.t === 'order') return `<ul class="small">${o.disp.map(i => `<li>${esc(o.items[i])}</li>`).join('')}</ul>`;
  if (o.t === 'in') return `<p class="small muted">${o.f.map(f => esc(f.l)).join(' · ')}</p>`;
  return '';
}
function solutionHTML(o){
  if (o.t === 'sc' || o.t === 'mc') return `<div><b>${x('Lösung','Answer')}:</b><ul>${o.opts.filter(op => op.ok).map(op => `<li>${esc(op.x)}</li>`).join('')}</ul></div>`;
  if (o.t === 'match') return `<div><b>${x('Lösung','Answer')}:</b><ul>${o.left.map((l, i) => `<li>${esc(l)} → <b>${esc(o.sol[i])}</b></li>`).join('')}</ul></div>`;
  if (o.t === 'order') return `<div><b>${x('Richtige Reihenfolge','Correct order')}:</b><ol>${o.items.map(it => `<li>${esc(it)}</li>`).join('')}</ol></div>`;
  if (o.t === 'in') return `<div><b>${x('Lösung','Answer')}:</b><ul>${o.f.map(f => `<li>${esc(f.l)}: <b class="mono">${f.u === '/' ? '/' : ''}${esc(fmtVal(f))}</b> ${f.u && f.u !== '/' ? esc(f.u) : ''}</li>`).join('')}</ul></div>`;
  if (o.t === 'open') return `<div class="stack" style="gap:6px"><b>${x('Musterlösung','Model answer')}:</b><div class="model">${esc(o.m)}</div></div>`;
  return '';
}
function answerHTML(o, ans, done, exam){
  const kk = i => `<span class="kk">${i + 1}</span>`;
  if (o.t === 'sc' || o.t === 'mc'){
    const sel = o.t === 'sc' ? (ans == null ? [] : [ans]) : (ans || []);
    return `${o.t === 'mc' ? `<p class="small muted">${x('Mehrere Antworten können richtig sein.','Several answers may be correct.')}</p>` : ''}<div class="opts" role="${o.t === 'sc' ? 'radiogroup' : 'group'}">${o.opts.map((op, i) => {
      const on = sel.includes(i), cls = done ? (op.ok && on ? 'right' : on ? 'wrong' : op.ok ? 'missed' : '') : '';
      return `<button class="opt ${cls}" data-act="opt" data-i="${i}" aria-pressed="${on}" ${done ? 'disabled' : ''}>${kk(i)}<span>${esc(op.x)}</span></button>`; }).join('')}</div>`;
  }
  if (o.t === 'match'){
    const a = ans || [];
    return `<div>${o.left.map((l, i) => { const ok = a[i] === o.sol[i];
      return `<div class="mrow ${done ? (ok ? 'right' : 'wrong') : ''}"><label for="m${i}">${esc(l)}</label><select id="m${i}" data-chg="mSel" data-i="${i}" ${done ? 'disabled' : ''}><option value="">${x('– zuordnen –','– choose –')}</option>${o.right.map(r => `<option ${a[i] === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select>${done && !ok ? `<span class="sol">✓ ${esc(o.sol[i])}</span>` : ''}</div>`; }).join('')}</div>`;
  }
  if (o.t === 'order'){
    const a = ans || [];
    return `<p class="small muted">${x('Tippe die Schritte in der richtigen Reihenfolge an (Tasten 1–9). Erneut tippen entfernt einen Schritt.','Tap the steps in the correct order (keys 1–9). Tap again to remove a step.')}</p>
      <div class="opts">${o.disp.map((it, k) => { const pos = a.indexOf(it), cls = done ? (pos === it ? 'right' : 'wrong') : '';
        return `<button class="opt ${cls}" data-act="ord" data-i="${it}" aria-pressed="${pos >= 0}" ${done ? 'disabled' : ''}><span class="kk">${pos >= 0 ? `<b class="ordn">${pos + 1}</b>` : k + 1}</span><span>${esc(o.items[it])}${done && pos !== it ? ` <span class="small" style="color:var(--ok)">→ ${x('Platz','position')} ${it + 1}</span>` : ''}</span></button>`; }).join('')}</div>
      ${done ? '' : `<div class="row"><button class="btn ghost small" data-act="ordReset" ${a.length ? '' : 'disabled'}>${x('Zurücksetzen','Reset')}</button></div>`}`;
  }
  if (o.t === 'in'){
    const a = ans || [];
    return `<div class="infields">${o.f.map((f, i) => { const ok = fieldOk(f, a[i]);
      return `<div class="field ${done ? (ok ? 'right' : 'wrong') : ''}"><label class="label" for="f${i}">${esc(f.l)}</label><div class="inwrap">${f.u === '/' ? '<span class="u">/</span>' : ''}<input type="text" id="f${i}" data-inp="inF" data-i="${i}" value="${esc(a[i] || '')}" inputmode="${typeof f.v === 'number' ? 'decimal' : 'text'}" autocomplete="off" spellcheck="false" ${done ? 'disabled' : ''}>${f.u && f.u !== '/' ? `<span class="u">${esc(f.u)}</span>` : ''}</div>${done && !ok ? `<span class="small" style="color:var(--ok)">✓ ${esc(fmtVal(f))} ${f.u && f.u !== '/' ? esc(f.u) : ''}</span>` : ''}</div>`; }).join('')}</div>
      <p class="small muted">${x('Dezimalzahlen mit Komma oder Punkt, IP-Adressen in Punktschreibweise.','Decimals with comma or point, IP addresses in dotted notation.')}</p>`;
  }
  if (o.t === 'open'){
    const note = exam ? (ans || '') : (typeof session !== 'undefined' && session && session.note) || '';
    return `<div class="field"><label class="label" for="openTxt">${x('Deine Antwort – Stichworte reichen','Your answer – keywords are enough')}</label><textarea id="openTxt" data-inp="openTxt" ${done ? 'readonly' : ''}>${esc(note)}</textarea></div>`;
  }
  return '';
}
