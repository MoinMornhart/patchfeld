/* Minimal, safe Markdown renderer for mentor messages.
   All text is HTML-escaped first; only a small set of formats is produced.
   Works in the browser (window.PF_MD) and in Node (module.exports) for tests. */
(function (root) {
  'use strict';

  // Marks protected inline-code spans while the rest of a line is formatted.
  const MARK = '\u0000';
  const MARK_RE = /\u0000(\d+)\u0000/g;

  function esc(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inline(text) {
    // Protect inline code first so its content is never formatted.
    const codes = [];
    let out = String(text).replace(/`([^`\n]+)`/g, (_, code) => {
      codes.push(code);
      return `${MARK}${codes.length - 1}${MARK}`;
    });
    out = esc(out);
    out = out.replace(/\*\*(?=\S)([^*\n]*?\S)\*\*/g, '<strong>$1</strong>');
    // Single-star emphasis needs non-space inside, so "2 * 3 * 4" stays math.
    out = out.replace(/(^|[^*\w])\*(?=\S)([^*\n]*?\S)\*(?!\*)/g, '$1<em>$2</em>');
    out = out.replace(
      /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>',
    );
    out = out.replace(MARK_RE, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
    return out;
  }

  const RE = {
    heading: /^(#{1,4})\s+(.*)$/,
    hr: /^\s*(-{3,}|\*{3,})\s*$/,
    table: /^\s*\|/,
    quote: /^\s*>/,
    ul: /^\s*[-*+]\s+/,
    ol: /^\s*\d+[.)]\s+/,
  };

  function isBlockStart(line) {
    return RE.heading.test(line) || RE.hr.test(line) || RE.table.test(line) ||
      RE.quote.test(line) || RE.ul.test(line) || RE.ol.test(line);
  }

  function splitRow(row) {
    return row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
  }

  function table(rows) {
    const cells = rows.map(splitRow);
    const isSeparator = (r) => r.length > 0 && r.every((c) => /^:?-{2,}:?$/.test(c));
    let head = null;
    let body = cells;
    if (cells.length > 1 && isSeparator(cells[1])) {
      head = cells[0];
      body = cells.slice(2);
    }
    body = body.filter((r) => !isSeparator(r));
    let html = '<div class="table-wrap"><table>';
    if (head) html += '<thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead>';
    html += '<tbody>' + body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody>';
    return html + '</table></div>';
  }

  function renderBlocks(text) {
    const lines = text.split('\n');
    let html = '';
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      let m;
      if (/^\s*$/.test(line)) {
        i += 1;
      } else if ((m = RE.heading.exec(line))) {
        const level = Math.min(m[1].length + 2, 6);
        html += `<h${level}>${inline(m[2])}</h${level}>`;
        i += 1;
      } else if (RE.hr.test(line)) {
        html += '<hr>';
        i += 1;
      } else if (RE.table.test(line)) {
        const rows = [];
        while (i < lines.length && RE.table.test(lines[i])) rows.push(lines[i++]);
        html += table(rows);
      } else if (RE.quote.test(line)) {
        const quoted = [];
        while (i < lines.length && RE.quote.test(lines[i])) quoted.push(lines[i++].replace(/^\s*>\s?/, ''));
        html += `<blockquote>${renderBlocks(quoted.join('\n'))}</blockquote>`;
      } else if (RE.ul.test(line)) {
        const items = [];
        while (i < lines.length && RE.ul.test(lines[i])) items.push(lines[i++].replace(RE.ul, ''));
        html += '<ul>' + items.map((x) => `<li>${inline(x)}</li>`).join('') + '</ul>';
      } else if (RE.ol.test(line)) {
        const start = parseInt(line, 10) || 1;
        const items = [];
        while (i < lines.length && RE.ol.test(lines[i])) items.push(lines[i++].replace(RE.ol, ''));
        html += `<ol start="${start}">` + items.map((x) => `<li>${inline(x)}</li>`).join('') + '</ol>';
      } else {
        const para = [];
        while (i < lines.length && !/^\s*$/.test(lines[i]) && (para.length === 0 || !isBlockStart(lines[i]))) {
          para.push(lines[i++]);
        }
        html += '<p>' + para.map(inline).join('<br>') + '</p>';
      }
    }
    return html;
  }

  function codeBlock(lang, code, opts) {
    const label = esc(opts.toEditorLabel || 'Editor');
    return '<div class="code-block"><div class="code-head">' +
      `<span>${esc(lang || 'code')}</span>` +
      `<button type="button" class="to-editor">${label}</button></div>` +
      `<pre><code>${esc(code)}</code></pre></div>`;
  }

  function render(markdown, opts) {
    const options = opts || {};
    let src = String(markdown || '').replace(/\r\n/g, '\n');
    // While streaming a fence may still be open – close it so the code renders.
    const fences = (src.match(/^[ \t]*```/gm) || []).length;
    if (fences % 2 === 1) src += '\n```';
    const re = /^[ \t]*```([\w#+.-]*)[^\n]*\n([\s\S]*?)^[ \t]*```[ \t]*$/gm;
    let html = '';
    let last = 0;
    let m;
    while ((m = re.exec(src))) {
      html += renderBlocks(src.slice(last, m.index));
      html += codeBlock(m[1], m[2].replace(/\n$/, ''), options);
      last = re.lastIndex;
    }
    html += renderBlocks(src.slice(last));
    return html;
  }

  const api = { render, escape: esc };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PF_MD = api;
})(typeof self !== 'undefined' ? self : this);
