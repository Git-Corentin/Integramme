/* =========================================================================
   Integramme — application (interface)
   ========================================================================= */
(function () {
  'use strict';
  const C = window.Core, T = window.Themes, Gen = window.Gen;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  /* ------------------------------ Icônes -------------------------------- */
  const P_ = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7M17.5 14v7"/>',
    sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    wand: '<path d="M15 4V2M15 10V8M11 6h2M17 6h2M18.4 8.4l1.4 1.4M18.4 3.6l1.4-1.4"/><path d="M3 21l11-11 1.5 1.5L4.5 22.5z"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20v3H6.5"/><path d="M9 7h7M9 11h5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    checkc: '<circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.7 2.7L16 9.8"/>',
    dots: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    cross: '<path d="M7 7l10 10M17 7L7 17"/>',
    dot: '<circle cx="12" cy="12" r="5.5" fill="currentColor"/>',
    cycle: '<path d="M7 7l4 4M11 7l-4 4"/><circle cx="16.5" cy="16.5" r="3" fill="currentColor"/><path d="M20 8a8 8 0 0 0-8-6M4 16a8 8 0 0 0 8 6" opacity=".55"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5"/><path d="M5 3h14"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
    up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
    left: '<path d="M15 18l-6-6 6-6"/>', right: '<path d="M9 18l6-6-6-6"/>',
    zin: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>',
    zout: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    install: '<path d="M12 3v11M7.5 9.5L12 14l4.5-4.5"/><rect x="3" y="16" width="18" height="5" rx="2"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16.5v.5"/>',
    xc: '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    note: '<path d="M4 4h16v12l-4 4H4z"/><path d="M8 9h8M8 13h5"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  };
  const ic = (n, cls) => '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P_[n] || '') + '</svg>';
  $$('[data-ic]').forEach(e => { e.outerHTML = ic(e.dataset.ic); });

  /* ----------------------------- Stockage -------------------------------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ig.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ig.' + k, JSON.stringify(v)); } catch (e) { /* quota */ } },
  };
  const settings = Object.assign({ autoX: true, tool: 'cycle', zoom: 1, cross: true, keyOnly: false }, store.get('settings', {}));
  const saveSettings = () => store.set('settings', settings);

  /* ----------------------------- Moteur (worker) ------------------------- */
  const Engine = (function () {
    let w = null, seq = 0;
    const pend = new Map();
    function local(cmd, data, onProgress) {
      return new Promise((resolve, reject) => setTimeout(() => {
        try {
          if (cmd === 'generate') resolve(Gen.generate(Object.assign({}, data.opts, { onProgress })));
          else if (cmd === 'explain') resolve(C.solveExplained(data.puzzle));
          else if (cmd === 'analyze') {
            const c = C.countSolutions(data.puzzle, 2); let ex = null;
            if (c.count === 1) { ex = C.solveExplained(data.puzzle); ex.rating = C.rate(ex); }
            resolve({ count: c.count, sols: c.sols, explain: ex });
          } else if (cmd === 'hint') {
            const P = C.compile(data.puzzle), S = new C.State(P, Int8Array.from(data.m)); C.checkEmpty(S);
            const st = S.bad ? null : C.nextStep(S, 5); if (st) C.enrich(S, st); resolve(st);
          }
        } catch (e) { reject(e); }
      }, 20));
    }
    try {
      if (location.protocol !== 'file:') {
        w = new Worker('js/worker.js');
        w.onmessage = (e) => {
          const p = pend.get(e.data.id); if (!p) return;
          if (e.data.progress) { if (p.onProgress) p.onProgress(e.data.progress); return; }
          pend.delete(e.data.id);
          if (e.data.error) p.reject(new Error(e.data.error)); else p.resolve(e.data.result);
        };
        w.onerror = () => { w = null; pend.forEach(p => local(p.cmd, p.data, p.onProgress).then(p.resolve, p.reject)); pend.clear(); };
      }
    } catch (e) { w = null; }
    return {
      call(cmd, data, onProgress) {
        if (!w) return local(cmd, data, onProgress);
        return new Promise((resolve, reject) => {
          const id = ++seq; pend.set(id, { resolve, reject, onProgress, cmd, data });
          w.postMessage(Object.assign({ id, cmd }, data));
        });
      },
    };
  })();

  /* ----------------------------- Utilitaires ----------------------------- */
  function toast(msg, ms) {
    const old = $('.toast'); if (old) old.remove();
    const t = h('<div class="toast" role="status">' + msg + '</div>');
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms || 2600);
  }
  const fmtTime = s => { s = Math.floor(s); const m = Math.floor(s / 60), r = s % 60; return (m >= 60 ? Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0') : m) + ':' + String(r).padStart(2, '0'); };
  const LV = Gen.LEVELS;
  const lvBadge = (lv, label) => '<span class="badge lv-badge lv-' + lv + '">' + dots(lv) + ' ' + esc(label || (LV[lv] ? LV[lv].name : '')) + '</span>';
  const dots = (n) => '<span class="dots">' + [1, 2, 3, 4, 5].map(i => '<i class="' + (i <= n ? 'on' : '') + '"></i>').join('') + '</span>';
  const themeOf = id => T.THEMES.find(t => t.id === id);
  function download(name, text) {
    const s = sheet('<textarea class="inp" readonly style="min-height:220px">' + esc(text) + '</textarea>', { title: 'Exporter',
      foot: '<button class="btn" data-copy>' + ic('copy') + 'Copier</button><button class="btn primary" data-dl>' + ic('download') + 'Télécharger</button>' });
    s.el.querySelector('[data-copy]').onclick = async () => { try { await navigator.clipboard.writeText(text); toast('Copié'); } catch (e) { s.el.querySelector('textarea').select(); toast('Sélectionné : copiez-le'); } };
    s.el.querySelector('[data-dl]').onclick = () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    };
  }

  // Partage : JSON compressé (deflate) encodé en base64url
  const b64u = {
    enc(bytes) { let s = ''; bytes.forEach(b => s += String.fromCharCode(b)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
    dec(str) { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; const s = atob(str); return Uint8Array.from(s, c => c.charCodeAt(0)); },
  };
  async function encodePuzzle(p) {
    const q = { title: p.title, intro: p.intro, entity: p.entity, theme: p.theme, level: p.level, rating: p.rating, cats: p.cats, clues: p.clues, sol: p.sol };
    const bytes = new TextEncoder().encode(JSON.stringify(q));
    if (window.CompressionStream) {
      const cs = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      return 'z' + b64u.enc(new Uint8Array(await new Response(cs).arrayBuffer()));
    }
    return 'j' + b64u.enc(bytes);
  }
  async function decodePuzzle(s) {
    const bytes = b64u.dec(s.slice(1));
    let txt;
    if (s[0] === 'z') {
      const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      txt = await new Response(ds).text();
    } else txt = new TextDecoder().decode(bytes);
    return JSON.parse(txt);
  }
  async function sharePuzzle(p) {
    const code = await encodePuzzle(p);
    const url = location.href.split('#')[0] + '#/jouer?p=' + code;
    if (navigator.share) {
      try { await navigator.share({ title: 'Integramme — ' + (p.title || 'enquête'), text: 'Saurez-vous résoudre cette enquête ?', url }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); toast('Lien copié dans le presse-papiers'); }
    catch (e) { showLink(url); }
  }

  function validatePuzzle(p) {
    if (!p || !Array.isArray(p.cats) || p.cats.length < 2) throw new Error('Il faut au moins deux catégories.');
    const N = p.cats[0].items.length;
    if (N < 2) throw new Error('Il faut au moins deux éléments par catégorie.');
    p.cats.forEach(c => { if (c.items.length !== N) throw new Error('Toutes les catégories doivent avoir le même nombre d’éléments.'); if (!c.tpl) c.tpl = Object.assign({}, T.PRESETS.generic.tpl); });
    if (!Array.isArray(p.clues)) p.clues = [];
    return p;
  }

  /* =========================== Vue de grille ============================ */
  class GridView {
    constructor(P, opts) {
      this.P = P; this.opts = opts || {};
      this.el = document.createElement('div');
      this.el.className = 'lgrid' + (this.opts.readonly ? ' ro' : '');
      this.cells = new Map(); this.rowEls = new Map(); this.colEls = new Map();
      this.hl = [];
      this.build();
    }
    key(a, b) { return a < b ? a * this.P.M + b : b * this.P.M + a; }
    build() {
      const { K, N, p } = this.P, el = this.el;
      const colCats = []; for (let c = 1; c < K; c++) colCats.push(c);
      const rowCats = [0]; for (let c = K - 1; c >= 2; c--) rowCats.push(c);
      this.colCats = colCats; this.rowCats = rowCats;
      this.tracks(6); this._gap = 6;
      const frag = document.createDocumentFragment();
      const add = (cls, html, r1, c1, r2, c2, attrs) => {
        const d = document.createElement('div'); d.className = cls; if (html != null) d.innerHTML = html;
        d.style.gridArea = r1 + ' / ' + c1 + ' / ' + (r2 || r1 + 1) + ' / ' + (c2 || c1 + 1);
        if (attrs) for (const k in attrs) d.setAttribute(k, attrs[k]);
        frag.appendChild(d); return d;
      };
      add('corner', this.opts.legend || '', 1, 1, 3, 3);
      colCats.forEach((c, j) => {
        const c0 = 3 + j * (N + 1);
        add('cath c' + c, esc(p.cats[c].name), 1, c0, 2, c0 + N);
        for (let i = 0; i < N; i++) {
          const g = c * N + i;
          const d = add('ith', esc(p.cats[c].items[i].label), 2, c0 + i, 3, null, { title: p.cats[c].items[i].label });
          this.colEls.set(g, d);
        }
      });
      rowCats.forEach((rc, r) => {
        const r0 = 3 + r * (N + 1);
        add('catv c' + rc, esc(p.cats[rc].name), r0, 1, r0 + N, 2);
        for (let i = 0; i < N; i++) {
          const a = rc * N + i;
          const d = add('itv', esc(p.cats[rc].items[i].label), r0 + i, 2, null, null, { title: p.cats[rc].items[i].label });
          this.rowEls.set(a, d);
          colCats.forEach((cc, j) => {
            if (!(rc === 0 || cc < rc)) return;
            const c0 = 3 + j * (N + 1);
            for (let k = 0; k < N; k++) {
              const b = cc * N + k;
              const cell = add('cell' + (i % 2 ? ' alt' : ''), null, r0 + i, c0 + k, null, null, { 'data-a': a, 'data-b': b });
              cell._r = r0 + i; cell._c = c0 + k;
              this.cells.set(this.key(a, b), cell);
            }
          });
        }
      });
      el.appendChild(frag);
      this.byRow = new Map(); this.byCol = new Map();
      this.cells.forEach(cell => {
        const a = +cell.dataset.a, b = +cell.dataset.b;
        (this.byRow.get(a) || this.byRow.set(a, []).get(a)).push(cell);
        (this.byCol.get(b) || this.byCol.set(b, []).get(b)).push(cell);
      });
      if (!this.opts.readonly) this.bindHover();
    }
    bindHover() {
      let cur = null;
      const clear = () => { $$('.hx', this.el).forEach(e => e.classList.remove('hx')); cur = null; };
      this.el.addEventListener('pointerover', (e) => {
        if (!settings.cross || e.pointerType === 'touch') return;
        const cell = e.target.closest('.cell'); if (!cell || cell === cur) return;
        clear(); cur = cell;
        const a = +cell.dataset.a, b = +cell.dataset.b;
        (this.byRow.get(a) || []).forEach(c => { if (c !== cell) c.classList.add('hx'); });
        (this.byCol.get(b) || []).forEach(c => { if (c !== cell) c.classList.add('hx'); });
        const ra = this.rowEls.get(a), cb = this.colEls.get(b);
        if (ra) ra.classList.add('hx'); if (cb) cb.classList.add('hx');
      });
      this.el.addEventListener('pointerleave', clear);
    }
    tracks(gap) {
      const { K, N } = this.P, cols = ['auto', 'auto'], rows = ['auto', 'auto'];
      for (let j = 0; j < K - 1; j++) { for (let i = 0; i < N; i++) { cols.push('auto'); rows.push('auto'); } if (j < K - 2) { cols.push(gap + 'px'); rows.push(gap + 'px'); } }
      this.el.style.gridTemplateColumns = cols.join(' ');
      this.el.style.gridTemplateRows = rows.join(' ');
    }
    // Ajuste la taille des cases à l'espace disponible (largeur ET hauteur)
    fit(container, zoom, maxH) {
      const { K, N } = this.P;
      const W = Math.max(200, (container.clientWidth || 600) - 4);
      const H = maxH != null ? Math.max(160, maxH) : (container.clientHeight > 50 ? container.clientHeight - 4 : 99999);
      const ctx = (GridView._ctx = GridView._ctx || document.createElement('canvas').getContext('2d'));
      ctx.font = '550 13px Inter, system-ui, sans-serif';
      let rw = 0, cw = 0;
      this.rowEls.forEach(e => { rw = Math.max(rw, ctx.measureText(e.textContent).width); });
      this.colEls.forEach(e => { cw = Math.max(cw, ctx.measureText(e.textContent).width); });
      const cols = (K - 1) * N, nG = K - 2;
      const geo = cs => {
        const small = cs < 24;
        const fs = Math.max(cs < 13 ? 8.5 : 9.5, Math.min(13, cs * 0.5 + 1));
        const catw = small ? 18 : 26, gap = small ? 3 : 6;
        const lw = Math.min(rw * fs / 13 + (small ? 7 : 12), cs < 14 ? 58 : small ? 74 : 124);
        const hh = Math.min(cw * fs / 13 + (small ? 8 : 12), small ? 72 : 112);
        const cathh = small ? 20 : 30;
        return { cs, fs, catw, gap, lw, hh, cathh, small,
          w: catw + lw + cols * (cs + 2) + nG * gap + 2, h: cathh + hh + cols * (cs + 2) + nG * gap + 2 };
      };
      let g = null;
      for (let cs = 46; cs >= 9; cs--) { const t = geo(cs); if (t.w <= W && t.h <= H) { g = t; break; } }
      if (!g) g = geo(9);
      if (zoom && zoom !== 1) g = geo(Math.max(10, Math.round(g.cs * zoom)));
      const st = this.el.style;
      st.setProperty('--cs', g.cs + 'px'); st.setProperty('--fs', g.fs.toFixed(1) + 'px'); st.setProperty('--catw', g.catw + 'px');
      st.setProperty('--lw', Math.round(g.lw) + 'px'); st.setProperty('--hh', Math.round(g.hh) + 'px'); st.setProperty('--cathh', g.cathh + 'px');
      this.el.classList.toggle('small', g.small);
      if (this._gap !== g.gap) { this._gap = g.gap; this.tracks(g.gap); }
      this.cs = g.cs;
      return g.cs;
    }
    update(marks, auto) {
      const M = this.P.M;
      this.cells.forEach((cell, k) => {
        const a = +cell.dataset.a, b = +cell.dataset.b, v = marks[a * M + b];
        const au = auto && v === -1 && auto[k] >= 0;
        const cls = v === 1 ? 'y' : v === -1 ? 'n' : '';
        if (cell._v !== cls + au) {
          cell.classList.toggle('y', v === 1); cell.classList.toggle('n', v === -1); cell.classList.toggle('auto', !!au);
          cell._v = cls + au;
        }
      });
    }
    highlight(changes, focus) {
      this.hl.forEach(c => c.classList.remove('hl-ch', 'hl-fo')); this.hl = [];
      (focus || []).forEach(([a, b]) => { const c = this.cells.get(this.key(a, b)); if (c) { c.classList.add('hl-fo'); this.hl.push(c); } });
      (changes || []).forEach(([a, b]) => { const c = this.cells.get(this.key(a, b)); if (c) { c.classList.add('hl-ch'); this.hl.push(c); } });
      const first = this.hl[this.hl.length - 1];
      if (first && this.opts.scrollIntoView !== false) first.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
    flash(list) {
      list.forEach(([a, b]) => { const c = this.cells.get(this.key(a, b)); if (c) { c.classList.remove('err'); void c.offsetWidth; c.classList.add('err'); setTimeout(() => c.classList.remove('err'), 2400); } });
    }
  }

  /* ============================= Partie ================================= */
  let game = null;       // partie en cours
  let gridView = null;
  let timerId = null;
  const explainCache = new Map();

  function newGame(p) {
    validatePuzzle(p);
    const P = C.compile(p);
    return {
      id: p.id || ('perso-' + Date.now().toString(36)), p, P,
      marks: new Int8Array(P.M * P.M), auto: new Int32Array(P.M * P.M).fill(-1),
      done: [], elapsed: 0, finished: false, hints: 0, checks: 0, created: Date.now(), undo: [], redo: [],
    };
  }
  function serialize(g) {
    return { id: g.id, p: g.p, marks: Array.from(g.marks), auto: Array.from(g.auto), done: g.done, elapsed: g.elapsed,
      finished: g.finished, hints: g.hints, checks: g.checks, created: g.created, notes: g.notes || '', updated: Date.now() };
  }
  function deserialize(o) {
    const g = newGame(o.p);
    Object.assign(g, { id: o.id, done: o.done || [], elapsed: o.elapsed || 0, finished: !!o.finished, hints: o.hints || 0, checks: o.checks || 0, created: o.created || Date.now(), notes: o.notes || '' });
    if (o.marks && o.marks.length === g.marks.length) g.marks = Int8Array.from(o.marks);
    if (o.auto && o.auto.length === g.auto.length) g.auto = Int32Array.from(o.auto);
    return g;
  }
  let saveT = null;
  function saveGame(now) {
    if (!game) return;
    clearTimeout(saveT);
    const doSave = () => {
      const games = store.get('games', {});
      games[game.id] = serialize(game);
      const ids = Object.keys(games).sort((a, b) => (games[b].updated || 0) - (games[a].updated || 0));
      ids.slice(15).forEach(id => delete games[id]);
      store.set('games', games); store.set('current', game.id);
    };
    if (now) doSave(); else saveT = setTimeout(doSave, 350);
  }
  function loadCurrent() {
    const id = store.get('current', null); if (!id) return null;
    const o = store.get('games', {})[id];
    try { return o ? deserialize(o) : null; } catch (e) { return null; }
  }
  async function ensureSolution(g) {
    if (g.p.sol) return g.p.sol;
    const res = await Engine.call('analyze', { puzzle: g.p });
    if (res.count >= 1) { g.p.sol = res.sols[0]; if (res.explain) explainCache.set(g.id, res.explain); }
    g.solCount = res.count;
    return g.p.sol;
  }
  function solState(g) {
    if (!g.p.sol) return null;
    if (!g._solS) g._solS = C.stateFromSol(g.P, g.p.sol).m;
    return g._solS;
  }
  function wrongCells(g) {
    const S = solState(g); if (!S) return [];
    const P = g.P, out = [];
    for (let a = 0; a < P.M; a++) for (let b = a + 1; b < P.M; b++) {
      const v = g.marks[a * P.M + b];
      if (v && v !== S[a * P.M + b]) out.push([a, b]);
    }
    return out;
  }
  function isWon(g) {
    const S = solState(g); if (!S) return false;
    const P = g.P;
    for (let a = 0; a < P.M; a++) for (let b = a + 1; b < P.M; b++) {
      if (C.catOf(P, a) === C.catOf(P, b)) continue;
      const s = S[a * P.M + b], v = g.marks[a * P.M + b];
      if (s === 1 && v !== 1) return false;
      if (v && v !== s) return false;
    }
    return true;
  }
  function progressOf(g) {
    const P = g.P; let n = 0, t = 0;
    for (let a = 0; a < P.M; a++) for (let b = (C.catOf(P, a) + 1) * P.N; b < P.M; b++) { t++; if (g.marks[a * P.M + b]) n++; }
    return t ? n / t : 0;
  }

  // ---- modification des cases (avec annulation et exclusion automatique)
  function setMark(g, a, b, v, rec, allowAuto) {
    const P = g.P, M = P.M, k = a < b ? a * M + b : b * M + a;
    const old = g.marks[a * M + b], oldAuto = g.auto[k];
    if (old === v && !(v === -1 && oldAuto >= 0 && !allowAuto)) return;
    const put = (x, y, val, au) => {
      const kk = x < y ? x * M + y : y * M + x;
      rec.push([kk, g.marks[x * M + y], g.auto[kk], val, au]);
      g.marks[x * M + y] = val; g.marks[y * M + x] = val; g.auto[kk] = au;
    };
    // retirer un ● : on retire aussi les ✕ automatiques qu'il avait posés
    if (old === 1 && v !== 1) {
      for (let i = 0; i < M * M; i++) if (g.auto[i] === k) { const x = Math.floor(i / M), y = i % M; if (g.marks[x * M + y] === -1) put(x, y, 0, -1); }
    }
    put(a, b, v, -1);
    if (v === 1 && settings.autoX && allowAuto !== false) {
      const N = P.N, ca = C.catOf(P, a), cb = C.catOf(P, b);
      for (let i = 0; i < N; i++) {
        const a2 = ca * N + i, b2 = cb * N + i;
        if (a2 !== a && g.marks[a2 * M + b] === 0) put(a2, b, -1, k);
        if (b2 !== b && g.marks[a * M + b2] === 0) put(a, b2, -1, k);
      }
    }
  }
  function commit(rec) {
    if (!rec.length) return;
    game.undo.push(rec); if (game.undo.length > 300) game.undo.shift();
    game.redo = [];
    afterChange();
  }
  function applyRec(rec, back) {
    const M = game.P.M;
    const list = back ? rec.slice().reverse() : rec;
    list.forEach(([k, ov, oa, nv, na]) => {
      const a = Math.floor(k / M), b = k % M, v = back ? ov : nv, au = back ? oa : na;
      game.marks[a * M + b] = v; game.marks[b * M + a] = v; game.auto[k] = au;
    });
  }
  function undo() { const r = game && game.undo.pop(); if (!r) return; applyRec(r, true); game.redo.push(r); afterChange(); }
  function redo() { const r = game && game.redo.pop(); if (!r) return; applyRec(r, false); game.undo.push(r); afterChange(); }

  function afterChange() {
    if (!game) return;
    if (gridView) gridView.update(game.marks, game.auto);
    Sel.refresh();
    updatePlayChrome();
    saveGame();
    if (!game.finished && game.p.sol && isWon(game)) onWin();
  }

  function updatePlayChrome() {
    const pr = $('#prog i'); if (pr) pr.style.width = Math.round(progressOf(game) * 100) + '%';
    $$('[data-act="undo"]').forEach(u => { u.disabled = !game.undo.length; });
    $$('[data-act="redo"]').forEach(r => { r.disabled = !game.redo.length; });
    renderRecap();
  }

  /* ----------------------------- Vue Jouer ------------------------------ */
  function viewPlay(main, query) {
    if (query.p) {
      decodePuzzle(query.p).then(p => {
        p.id = 'partage-' + (p.seed != null ? p.seed : hash(JSON.stringify(p.clues)));
        const games = store.get('games', {});
        game = games[p.id] ? deserialize(games[p.id]) : newGame(p);
        saveGame(true);
        history.replaceState(null, '', '#/jouer');
        render();
      }).catch(() => { toast('Lien d’enquête invalide'); location.hash = '#/creer'; });
      main.innerHTML = loadingHTML('Ouverture de l’enquête…');
      return;
    }
    if (!game) game = loadCurrent();
    if (!game) { viewCreate(main, {}, true); return; }
    renderPlay(main);
  }
  const hash = s => { let x = 5381; for (let i = 0; i < s.length; i++) x = (x * 33 + s.charCodeAt(i)) >>> 0; return x.toString(36); };

  const TOOL_IC = { cycle: 'cycle', no: 'cross', yes: 'dot' };
  const TOOL_LB = { cycle: 'Auto', no: 'Croix', yes: 'Point' };
  const isMobile = () => matchMedia('(max-width: 999px)').matches;

  function toolbarHTML(mobile) {
    const b = (act, icn, label, title, cls) => `<button class="tool ${cls || ''}" data-act="${act}" title="${title}">${ic(icn)}<span>${label}</span></button>`;
    return (mobile ? b('mode', TOOL_IC[settings.tool], TOOL_LB[settings.tool], 'Outil : touchez pour changer (Auto → ✕ → ●)', 'mode') : '') +
      b('undo', 'undo', 'Annuler', 'Annuler (Ctrl+Z)') + b('redo', 'redo', 'Rétablir', 'Rétablir (Ctrl+Y)') +
      b('hint', 'bulb', 'Indice', 'Indice (H)', 'hint') + b('check', 'checkc', 'Vérifier', 'Vérifier la grille') +
      b('sol', 'eye', 'Solution', 'Solution expliquée') + b('menu', 'dots', 'Plus', 'Plus d’options');
  }

  function renderPlay(main) {
    const g = game, p = g.p, th = themeOf(p.theme);
    main.classList.add('has-playbar');
    const tools = settings.tool, lv = p.rating || p.level;
    const tab = settings.ptab || 'clues';
    main.innerHTML = `
      <div class="playwrap">
        <div class="phead">
          <div class="ttl">
            <div class="eyebrow">${th ? th.icon + ' ' : ''}Enquête${p.seed != null ? ' n°' + esc(String(p.seed).slice(-5)) : ''}</div>
            <h1>${esc(p.title || 'Enquête')}</h1>
          </div>
          <div class="meta">
            ${lv ? lvBadge(lv, LV[lv] && LV[lv].name) : ''}
            <span class="badge hide-xs">${p.cats.length} × ${p.cats[0].items.length}</span>
            <span class="badge"><span class="timer" id="timer">${fmtTime(g.elapsed)}</span></span>
          </div>
          <div class="progress" id="prog" title="Progression"><i style="width:0"></i></div>
        </div>
        <div class="pmain">
          <section class="card gridpane">
            <div class="grid-tools">
              <div class="seg" id="toolSeg" role="radiogroup" aria-label="Outil">
                <button data-t="cycle" class="${tools === 'cycle' ? 'on' : ''}" title="Alterner vide → ✕ → ● (clic droit / appui long = ●)">${ic('cycle')}<span>Auto</span></button>
                <button data-t="no" class="${tools === 'no' ? 'on' : ''}" title="Poser des ✕ (glisser pour en poser plusieurs)">${ic('cross')}</button>
                <button data-t="yes" class="${tools === 'yes' ? 'on' : ''}" title="Poser des ●">${ic('dot')}</button>
              </div>
              <div class="zoom">
                <button class="icon-btn" data-z="-" title="Réduire">${ic('zout')}</button>
                <button class="icon-btn zfit ${settings.zoom === 1 ? 'hidden' : ''}" data-z="0" title="Ajuster à l’écran">${ic('fit')}</button>
                <button class="icon-btn" data-z="+" title="Agrandir">${ic('zin')}</button>
              </div>
              <div class="sp"></div>
              <div class="toolbar desk">${toolbarHTML(false)}</div>
            </div>
            <div class="grid-fit" id="gscroll"></div>
          </section>
          <aside class="card sidepane" id="sidepane">
            <div class="ptabs" role="tablist">
              <button data-tab="clues" class="${tab === 'clues' ? 'on' : ''}">Indices <span class="badge" id="clueCount"></span></button>
              <button data-tab="notes" class="${tab === 'notes' ? 'on' : ''}">Notes<span class="dot-mark ${g.notes ? '' : 'hidden'}" id="notesDot"></span></button>
              <button data-tab="recap" class="${tab === 'recap' ? 'on' : ''}">Récap</button>
            </div>
            <div class="pbody">
              <div class="pane ${tab === 'clues' ? '' : 'hidden'}" data-pane="clues">
                ${p.intro ? `<details class="story" ${isMobile() ? '' : 'open'}><summary>L’affaire</summary><div>${esc(p.intro)}</div></details>` : ''}
                <ol class="clues" id="clues">
                  ${p.clues.map((cl, i) => `<li data-i="${i}" class="${g.done.includes(i) ? 'done' : ''}"><span>${esc(C.clueText(g.P, cl))}</span></li>`).join('')}
                </ol>
                <div class="pane-hint">Touchez un indice pour le barrer une fois exploité.</div>
              </div>
              <div class="pane notes-pane ${tab === 'notes' ? '' : 'hidden'}" data-pane="notes"></div>
              <div class="pane ${tab === 'recap' ? '' : 'hidden'}" data-pane="recap"><div class="recap" id="recap"></div></div>
            </div>
          </aside>
        </div>
        <div class="toolbar playbar mob">${toolbarHTML(true)}</div>
      </div>`;

    gridView = new GridView(g.P, { legend: '<div class="legend">✕ exclu<br>● associé</div>' });
    const fitEl = $('#gscroll');
    fitEl.appendChild(gridView.el);
    gridView.update(g.marks, g.auto);
    gridView.el.classList.toggle('paint', settings.tool !== 'cycle');
    bindGrid(gridView);
    Notes.mount($('[data-pane="notes"]', main));
    const refit = () => {
      if (!gridView || !document.body.contains(gridView.el)) return;
      let maxH;
      if (isMobile()) {
        const wrap = $('.playwrap', main);
        if (wrap.classList.contains('free')) maxH = innerHeight * 0.75;
        else {
          const used = $('.phead', main).offsetHeight + $('.playbar.mob', main).offsetHeight + 12 * 3 + 16 + ($('.grid-tools', main).offsetHeight || 0);
          maxH = wrap.clientHeight - used - Math.min(165, wrap.clientHeight * 0.22);
        }
      }
      gridView.fit(fitEl, settings.zoom, maxH);
      $$('.zfit', main).forEach(b => b.classList.toggle('hidden', settings.zoom === 1));
    };
    playRefit = refit;
    requestAnimationFrame(refit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
    if (playRO) playRO.disconnect();
    playRO = new ResizeObserver(() => refit()); playRO.observe($('.playwrap', main));
    window.onresize = refit;
    updatePlayChrome();
    updateClueCount();

    $('#toolSeg').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      setTool(b.dataset.t);
    });
    main.querySelectorAll('[data-z]').forEach(b => b.onclick = () => zoomBy(b.dataset.z));
    $('#clues').addEventListener('click', e => {
      const li = e.target.closest('li'); if (!li) return;
      const i = +li.dataset.i, k = g.done.indexOf(i);
      if (k >= 0) g.done.splice(k, 1); else g.done.push(i);
      li.classList.toggle('done'); updateClueCount(); saveGame();
    });
    $('.ptabs', main).addEventListener('click', e => {
      const b = e.target.closest('[data-tab]'); if (!b) return;
      settings.ptab = b.dataset.tab; saveSettings();
      $$('.ptabs [data-tab]', main).forEach(x => x.classList.toggle('on', x === b));
      $$('.pbody .pane', main).forEach(x => x.classList.toggle('hidden', x.dataset.pane !== b.dataset.tab));
      if (b.dataset.tab === 'recap') renderRecap();
    });
    main.onclick = e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'undo') undo(); else if (a === 'redo') redo();
      else if (a === 'hint') showHint(); else if (a === 'check') checkGrid();
      else if (a === 'sol') openSolution(); else if (a === 'menu') openMenu();
      else if (a === 'mode') setTool({ cycle: 'no', no: 'yes', yes: 'cycle' }[settings.tool]);
    };
    startTimer();
    ensureSolution(g).then(() => { if (!g.p.sol) toast('Attention : cette enquête n’a pas de solution unique.'); });
  }
  let playRefit = null, playRO = null;
  function zoomBy(z) {
    if (z === '0') settings.zoom = 1;
    else settings.zoom = Math.max(0.7, Math.min(2.2, +(settings.zoom + (z === '+' ? 0.15 : -0.15)).toFixed(2)));
    saveSettings(); if (playRefit) playRefit();
  }
  function setTool(t) {
    settings.tool = t; saveSettings();
    $$('#toolSeg button').forEach(x => x.classList.toggle('on', x.dataset.t === t));
    $$('[data-act="mode"]').forEach(b => { b.innerHTML = ic(TOOL_IC[t]) + '<span>' + TOOL_LB[t] + '</span>'; });
    if (gridView) gridView.el.classList.toggle('paint', t !== 'cycle');
  }
  function updateClueCount() { const el = $('#clueCount'); if (el) el.textContent = game.done.length + '/' + game.p.clues.length; }

  function renderRecap() {
    const el = $('#recap'); if (!el || !game || el.closest('.hidden')) return;
    const P = game.P, p = game.p, N = P.N;
    let html = '<table><thead><tr>' + p.cats.map((c, i) => '<th><span class="chip c' + i + '" style="font-size:11px">' + esc(c.name) + '</span></th>').join('') + '</tr></thead><tbody>';
    for (let e = 0; e < N; e++) {
      html += '<tr><td><b>' + esc(p.cats[0].items[e].label) + '</b></td>';
      for (let c = 1; c < P.K; c++) {
        let f = -1;
        for (let i = 0; i < N; i++) if (game.marks[e * P.M + c * N + i] === 1) f = i;
        html += f >= 0 ? '<td>' + esc(p.cats[c].items[f].label) + '</td>' : '<td class="empty">·</td>';
      }
      html += '</tr>';
    }
    el.innerHTML = html + '</tbody></table><div class="pane-hint">Le récapitulatif se remplit avec les ● posés dans la grille.</div>';
  }

  /* ------------------------------ Notes ---------------------------------- */
  const Notes = (function () {
    const SYMS = ['<', '>', '=', '≠', '≤', '≥', '⇒', '⇔', '∨', '∧', '¬', '●', '✕', '?', '±', '→'];
    const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    let ta, sugg, prev, vocab = [];
    function buildVocab() {
      const p = game.p; vocab = [];
      p.cats.forEach((c, ci) => {
        vocab.push({ t: c.name, c: ci, cat: true });
        c.items.forEach(it => vocab.push({ t: it.label, c: ci }));
      });
    }
    function currentWord() {
      const pos = ta.selectionStart, before = ta.value.slice(0, pos);
      const m = before.match(/[\p{L}\p{N}'’\-/]+$/u);
      return m ? { w: m[0], start: pos - m[0].length, end: pos } : { w: '', start: pos, end: pos };
    }
    function insert(text, replace) {
      const v = ta.value, s0 = replace ? replace.start : ta.selectionStart, s1 = replace ? replace.end : ta.selectionEnd;
      const after = v.slice(s1);
      const pad = text.length > 1 && !/^\s/.test(after) ? ' ' : '';
      ta.value = v.slice(0, s0) + text + pad + after;
      const caret = s0 + text.length + pad.length;
      ta.setSelectionRange(caret, caret);
      onInput();
    }
    function renderSugg() {
      const cw = currentWord(), w = norm(cw.w);
      if (!w) { sugg.innerHTML = '<span class="muted">Tapez le début d’un nom pour l’insérer · symboles ci-dessus</span>'; return; }
      const res = vocab.filter(v => { const n = norm(v.t); return n.startsWith(w) || n.split(/[\s'’\-]+/).some(x => x.startsWith(w)); })
        .filter(v => norm(v.t) !== w).slice(0, 10);
      sugg.innerHTML = res.length ? res.map((v, i) => `<button class="chip c${v.c} ${v.cat ? 'catchip' : ''}" data-i="${vocab.indexOf(v)}">${esc(v.t)}</button>`).join('') : '<span class="muted">Aucune correspondance</span>';
    }
    function onInput() {
      game.notes = ta.value; saveGame();
      const dot = $('#notesDot'); if (dot) dot.classList.toggle('hidden', !game.notes);
      renderSugg();
    }
    function renderPreview() {
      let html = esc(game.notes || '');
      const labels = vocab.filter(v => !v.cat).sort((a, b) => b.t.length - a.t.length);
      if (labels.length) {
        const re = new RegExp('(?<![\\p{L}])(' + labels.map(v => esc(v.t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\p{L}])', 'gu');
        html = html.replace(re, m => { const v = labels.find(x => esc(x.t) === m); return '<span class="chip c' + v.c + '">' + m + '</span>'; });
      }
      prev.innerHTML = html ? html.replace(/\n/g, '<br>') : '<span class="muted">Aucune note.</span>';
    }
    function mount(el) {
      buildVocab();
      el.innerHTML = `<div class="sym">${SYMS.map(s => `<button data-s="${esc(s)}">${esc(s)}</button>`).join('')}<button class="prevbtn" data-prev title="Aperçu coloré">${ic('eye')}</button></div>
        <div class="sugg"></div>
        <textarea class="notes-ta" spellcheck="false" placeholder="Vos déductions et hypothèses… Ex. : Alice < chat ⇒ Alice ≠ 35 ans"></textarea>
        <div class="notes-prev hidden"></div>`;
      ta = $('.notes-ta', el); sugg = $('.sugg', el); prev = $('.notes-prev', el);
      ta.value = game.notes || '';
      ta.addEventListener('input', onInput);
      ta.addEventListener('keyup', renderSugg); ta.addEventListener('click', renderSugg);
      // garder le clavier ouvert : pointerdown + preventDefault
      $('.sym', el).addEventListener('pointerdown', e => {
        const b = e.target.closest('button'); if (!b) return; e.preventDefault();
        if (b.dataset.prev != null) { const on = prev.classList.toggle('hidden'); ta.classList.toggle('hidden', !on); if (!on) renderPreview(); b.classList.toggle('on', !on); return; }
        if (ta.classList.contains('hidden')) return;
        insert(b.dataset.s); ta.focus();
      });
      sugg.addEventListener('pointerdown', e => {
        const b = e.target.closest('button'); if (!b) return; e.preventDefault();
        insert(vocab[+b.dataset.i].t, currentWord()); ta.focus();
      });
      // sur téléphone : le panneau de notes flotte au-dessus du clavier
      const pane = $('#sidepane');
      const vv = window.visualViewport;
      const place = () => {
        if (!pane.classList.contains('floating') || !vv) return;
        const kb = Math.max(0, innerHeight - vv.height - vv.offsetTop);
        pane.style.bottom = kb + 'px';
        pane.style.height = Math.min(vv.height * 0.5, 360) + 'px';
      };
      ta.addEventListener('focus', () => { if (isMobile() && matchMedia('(pointer: coarse)').matches) { pane.classList.add('floating'); place(); } renderSugg(); });
      ta.addEventListener('blur', () => { pane.classList.remove('floating'); pane.style.bottom = ''; pane.style.height = ''; });
      if (vv) { vv.addEventListener('resize', place); vv.addEventListener('scroll', place); }
      renderSugg();
    }
    return { mount };
  })();

  function bindGrid(gv) {
    const el = gv.el;
    let drag = null, press = null;
    const valFor = (cur, tool) => tool === 'no' ? (cur === -1 ? 0 : -1) : tool === 'yes' ? (cur === 1 ? 0 : 1) : (cur === 0 ? -1 : cur === -1 ? 1 : 0);
    const cellAt = (x, y) => { const t = document.elementFromPoint(x, y); return t && t.closest ? t.closest('.cell') : null; };
    const apply = (cell, v, rec) => { setMark(game, +cell.dataset.a, +cell.dataset.b, v, rec); };
    el.addEventListener('contextmenu', e => {
      const cell = e.target.closest('.cell'); if (!cell) return;
      e.preventDefault();
      const cur = game.marks[+cell.dataset.a * game.P.M + +cell.dataset.b];
      const rec = []; apply(cell, cur === 1 ? 0 : 1, rec); commit(rec);
    });
    // Mode précision (écran tactile + petites cases) : un toucher sélectionne, un second applique
    const precise = (e) => e.pointerType !== 'mouse' && settings.precision !== false && (gv.cs || 30) < 24;
    el.addEventListener('pointerdown', e => {
      const cell = e.target.closest('.cell'); if (!cell || e.button === 2) return;
      hideHint(false);
      const cur = game.marks[+cell.dataset.a * game.P.M + +cell.dataset.b];
      const tool = settings.tool;
      if (precise(e)) {
        press = { cell, x: e.clientX, y: e.clientY, cur, long: false, precise: true };
        press.timer = setTimeout(() => {
          if (!press) return;
          press.long = true; Sel.select(gv, press.cell);
          const rec = []; apply(press.cell, press.cur === 1 ? 0 : 1, rec); commit(rec);
          if (navigator.vibrate) navigator.vibrate(18);
        }, 450);
        return;
      }
      if (e.pointerType !== 'mouse' && tool === 'cycle') {
        // tactile en mode auto : appui court = alterner, appui long = ●
        press = { cell, x: e.clientX, y: e.clientY, cur, long: false };
        press.timer = setTimeout(() => {
          if (!press) return;
          press.long = true;
          const rec = []; apply(press.cell, press.cur === 1 ? 0 : 1, rec); commit(rec);
          if (navigator.vibrate) navigator.vibrate(18);
        }, 430);
        return;
      }
      e.preventDefault();
      const v = valFor(cur, tool);
      drag = { v, rec: [], seen: new Set([cell]) };
      apply(cell, v, drag.rec); gv.update(game.marks, game.auto);
      try { el.setPointerCapture(e.pointerId); } catch (_) { }
    });
    el.addEventListener('pointermove', e => {
      if (press) { if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) { clearTimeout(press.timer); press = null; } return; }
      if (!drag) return;
      const cell = cellAt(e.clientX, e.clientY);
      if (cell && !drag.seen.has(cell)) {
        drag.seen.add(cell);
        const cur = game.marks[+cell.dataset.a * game.P.M + +cell.dataset.b];
        if (drag.v === 0 || cur === 0 || (drag.v === 1)) { apply(cell, drag.v, drag.rec); gv.update(game.marks, game.auto); }
      }
    });
    const end = () => {
      if (press) {
        clearTimeout(press.timer);
        if (!press.long) {
          if (press.precise && Sel.cell !== press.cell) Sel.select(gv, press.cell);
          else { const rec = []; apply(press.cell, valFor(press.cur, press.precise ? settings.tool : 'cycle'), rec); commit(rec); if (press.precise) Sel.refresh(); }
        }
        press = null;
      }
      if (drag) { commit(drag.rec); drag = null; }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', () => { if (press) clearTimeout(press.timer); press = null; if (drag) { commit(drag.rec); drag = null; } });
  }

  // Barre de sélection (mode précision)
  const Sel = {
    cell: null, bar: null, gv: null,
    select(gv, cell) {
      this.gv = gv; this.clear(true); this.cell = cell;
      cell.classList.add('sel');
      const a = +cell.dataset.a, b = +cell.dataset.b;
      (gv.byRow.get(a) || []).forEach(c => c !== cell && c.classList.add('hx'));
      (gv.byCol.get(b) || []).forEach(c => c !== cell && c.classList.add('hx'));
      [gv.rowEls.get(a), gv.colEls.get(b)].forEach(x => x && x.classList.add('hx'));
      if (!this.bar) {
        this.bar = h(`<div class="selbar" role="toolbar" aria-label="Case sélectionnée">
          <div class="pair"></div>
          <div class="acts"><button data-v="-1" class="sv-n" aria-label="Croix">✕</button><button data-v="1" class="sv-y" aria-label="Point">●</button><button data-v="0" aria-label="Effacer">⌫</button>
          <span class="arr"><button data-m="l" aria-label="Gauche">${ic('left')}</button><button data-m="u" aria-label="Haut">${ic('up')}</button><button data-m="d" aria-label="Bas">${ic('down')}</button><button data-m="r" aria-label="Droite">${ic('right')}</button></span>
          <button data-x aria-label="Fermer">${ic('x')}</button></div></div>`);
        document.body.appendChild(this.bar);
        this.bar.addEventListener('click', e => {
          const btn = e.target.closest('button'); if (!btn || !this.cell) return;
          if (btn.dataset.x != null) return this.clear();
          if (btn.dataset.v != null) { const rec = []; setMark(game, +this.cell.dataset.a, +this.cell.dataset.b, +btn.dataset.v, rec); commit(rec); this.refresh(); return; }
          if (btn.dataset.m) this.move(btn.dataset.m);
        });
      }
      this.refresh();
    },
    refresh() {
      if (!this.cell || !this.bar) return;
      const P = game.P, a = +this.cell.dataset.a, b = +this.cell.dataset.b, v = game.marks[a * P.M + b];
      this.bar.querySelector('.pair').innerHTML = `<span class="chip c${C.catOf(P, a)}">${esc(C.labelOf(P, a))}</span><span class="x">×</span><span class="chip c${C.catOf(P, b)}">${esc(C.labelOf(P, b))}</span><span class="st ${v === 1 ? 'y' : v === -1 ? 'n' : ''}">${v === 1 ? '●' : v === -1 ? '✕' : '—'}</span>`;
    },
    move(d) {
      const c = this.cell, gv = this.gv;
      const dr = d === 'u' ? -1 : d === 'd' ? 1 : 0, dc = d === 'l' ? -1 : d === 'r' ? 1 : 0;
      const all = Array.from(gv.cells.values());
      let best = null, bd = 1e9;
      all.forEach(x => {
        const r = x._r - c._r, k = x._c - c._c;
        if ((dr && Math.sign(r) !== dr) || (dc && Math.sign(k) !== dc)) return;
        if (dr && k !== 0) return; if (dc && r !== 0) return;
        const dist = Math.abs(r) + Math.abs(k); if (dist && dist < bd) { bd = dist; best = x; }
      });
      if (best) this.select(gv, best);
    },
    clear(keepBar) {
      if (this.cell) { this.cell.classList.remove('sel'); }
      if (this.gv) $$('.hx', this.gv.el).forEach(e => e.classList.remove('hx'));
      this.cell = null;
      if (!keepBar && this.bar) { this.bar.remove(); this.bar = null; }
    },
  };

  function startTimer() {
    clearInterval(timerId);
    let last = Date.now();
    timerId = setInterval(() => {
      const now = Date.now(), dt = (now - last) / 1000; last = now;
      if (!game || game.finished || document.hidden || !$('#timer')) return;
      game.elapsed += Math.min(dt, 2);
      $('#timer').textContent = fmtTime(game.elapsed);
      if (Math.floor(game.elapsed) % 10 === 0) saveGame();
    }, 1000);
  }

  /* ----------------------------- Indice ---------------------------------- */
  let hintEl = null;
  function hideHint(clearHl) {
    if (hintEl) { hintEl.remove(); hintEl = null; }
    if (clearHl !== false && gridView) gridView.highlight([], []);
    $$('#clues li.hl').forEach(li => li.classList.remove('hl'));
  }
  async function showHint() {
    if (!game) return;
    hideHint();
    await ensureSolution(game);
    const wrong = wrongCells(game);
    if (wrong.length) {
      hintEl = h(`<div class="hintcard" role="dialog" aria-label="Indice">
        <div class="hc-head">${ic('alert')}<h4>Une erreur s’est glissée</h4><button class="icon-btn" data-x>${ic('x')}</button></div>
        <div class="hc-body expl"><p>Votre grille contient <b>${wrong.length}</b> marque${wrong.length > 1 ? 's' : ''} incompatible${wrong.length > 1 ? 's' : ''} avec la solution. Un indice fiable n’est possible qu’à partir d’une grille juste.</p></div>
        <div class="hc-foot"><button class="btn sm" data-show>Les montrer</button><button class="btn sm primary" data-fix>Les effacer</button></div></div>`);
      document.body.appendChild(hintEl);
      hintEl.querySelector('[data-x]').onclick = () => hideHint();
      hintEl.querySelector('[data-show]').onclick = () => gridView.flash(wrong);
      hintEl.querySelector('[data-fix]').onclick = () => { const rec = []; wrong.forEach(([a, b]) => setMark(game, a, b, 0, rec, false)); commit(rec); hideHint(); toast('Erreurs effacées'); };
      return;
    }
    const st = await Engine.call('hint', { puzzle: game.p, m: Array.from(game.marks) });
    if (!st) { toast(isWon(game) ? 'La grille est complète !' : 'Aucune déduction trouvée.'); return; }
    game.hints++; saveGame();
    const d = C.describe(game.P, st);
    const teaser = {
      clue: 'Relisez attentivement l’indice surligné : il donne une information directe.',
      elim: 'Un ● est posé : regardez sa ligne et sa colonne.',
      single: 'Une ligne ou une colonne n’a plus qu’une seule case libre.',
      trans: 'Deux éléments sont déjà associés : comparez ce que vous savez de chacun.',
      either: 'Un indice « soit… soit… » peut maintenant être tranché.',
      pair: 'Un indice « l’un… l’autre… » peut maintenant être tranché.',
      cmp: 'Une comparaison réduit les valeurs possibles.',
      cross: 'Passez par une troisième catégorie : deux éléments n’y ont aucun partenaire commun.',
      clue3: 'Un indice à deux options exclut tout ce qui n’est compatible avec aucune des deux.',
      cond: 'Un indice « si… alors… » peut maintenant servir (pensez à la contraposée).',
      subset: 'Quelques éléments se partagent exactement autant d’options qu’ils sont nombreux.',
      hypo: 'Il faut tester une hypothèse et chercher la contradiction.',
      disj: 'Envisagez les deux seules possibilités d’une case : elles mènent à la même conclusion.',
      brute: 'Ici, seule une exploration systématique permet d’avancer.',
    }[st.r];
    hintEl = h(`<div class="hintcard" role="dialog" aria-label="Indice">
      <div class="hc-head"><span class="badge lv-badge lv-${Math.min(5, st.lv + (st.lv >= 3 ? 1 : 0))}">${esc(d.levelName)}</span><h4>${esc(d.title)}</h4><button class="icon-btn" data-x aria-label="Fermer">${ic('x')}</button></div>
      <div class="hc-body expl"><p data-teaser>${teaser}</p><div data-full class="hidden">${d.html}<div class="chg">${d.changes}</div></div></div>
      <div class="hc-foot"><button class="btn sm" data-more>${ic('eye')}Expliquer</button><button class="btn sm primary" data-apply>${ic('check')}Appliquer</button></div></div>`);
    document.body.appendChild(hintEl);
    gridView.highlight([], C.focusOf(game.P, st));
    if (st.ci != null) { const li = $('#clues li[data-i="' + st.ci + '"]'); if (li) { li.classList.add('hl'); li.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } }
    hintEl.querySelector('[data-x]').onclick = () => hideHint();
    hintEl.querySelector('[data-more]').onclick = (e) => {
      hintEl.querySelector('[data-full]').classList.remove('hidden');
      hintEl.querySelector('[data-teaser]').classList.add('hidden');
      e.currentTarget.remove();
      gridView.highlight(st.ch, C.focusOf(game.P, st));
    };
    hintEl.querySelector('[data-apply]').onclick = () => {
      const rec = []; st.ch.forEach(([a, b, v]) => setMark(game, a, b, v, rec, false)); commit(rec);
      hideHint(false);
      gridView.highlight(st.ch, []);
      setTimeout(() => gridView && gridView.highlight([], []), 1600);
    };
  }

  async function checkGrid() {
    await ensureSolution(game);
    if (!game.p.sol) { toast('Pas de solution unique : vérification impossible'); return; }
    const wrong = wrongCells(game);
    game.checks++;
    if (!wrong.length) toast(progressOf(game) > 0 ? '✓ Aucune erreur pour l’instant' : 'Grille vide : à vous de jouer !');
    else { gridView.flash(wrong); toast(wrong.length + ' erreur' + (wrong.length > 1 ? 's' : '') + ' — annulez ou utilisez « Indice » pour les effacer', 3500); }
  }

  /* ----------------------------- Victoire -------------------------------- */
  function onWin() {
    game.finished = true; saveGame(true);
    hideHint();
    const stats = store.get('stats', { solved: 0, byLevel: {} });
    stats.solved++; const lv = game.p.rating || game.p.level || 0;
    const bl = stats.byLevel[lv] = stats.byLevel[lv] || { n: 0, best: null };
    bl.n++; if (!game.hints && (bl.best == null || game.elapsed < bl.best)) bl.best = Math.round(game.elapsed);
    store.set('stats', stats);
    confetti();
    const s = sheet(`<div class="win"><div class="big">🕵️</div><h2>Affaire résolue !</h2>
        <div style="color:var(--muted)">${esc(game.p.title || '')}</div>
        <div class="stats"><div><b>${fmtTime(game.elapsed)}</b><span>Temps</span></div><div><b>${game.hints}</b><span>Indices</span></div><div><b>${stats.solved}</b><span>Résolues</span></div></div></div>`,
      { center: true, foot: `<button class="btn" data-sol>${ic('eye')}Solution expliquée</button><button class="btn primary" data-new>${ic('sparkles')}Nouvelle enquête</button>` });
    s.el.querySelector('[data-sol]').onclick = () => { s.close(); openSolution(); };
    s.el.querySelector('[data-new]').onclick = () => { s.close(); generateAndPlay({ level: game.p.level || 2, theme: 'random' }); };
  }
  function confetti() {
    const cv = document.createElement('canvas'); cv.className = 'confetti'; document.body.appendChild(cv);
    const ctx = cv.getContext('2d'), W = cv.width = innerWidth * devicePixelRatio, H = cv.height = innerHeight * devicePixelRatio;
    const cols = ['#3d4fd1', '#e0703f', '#17875f', '#b4436b', '#f2c94c', '#6b3fd4'];
    const parts = Array.from({ length: 160 }, () => ({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 26, vy: -Math.random() * 30 - 8, r: Math.random() * 8 + 5, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6, va: (Math.random() - .5) * .3 }));
    let t = 0;
    (function tick() {
      ctx.clearRect(0, 0, W, H); t++;
      parts.forEach(p => { p.vy += .9; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
      if (t < 150) requestAnimationFrame(tick); else cv.remove();
    })();
  }

  /* ----------------------------- Feuilles -------------------------------- */
  function sheet(body, opts) {
    opts = opts || {};
    const scrim = h('<div class="scrim"></div>');
    const el = h(`<div class="sheet ${opts.center ? 'center' : ''}" role="dialog" aria-modal="true">
      ${opts.center ? '' : '<div class="grabber"></div>'}
      ${opts.title ? `<div class="sheet-head"><h3>${opts.title}</h3><button class="icon-btn" data-close aria-label="Fermer">${ic('x')}</button></div>` : ''}
      <div class="sheet-body">${body}</div>${opts.foot ? `<div class="sheet-foot">${opts.foot}</div>` : ''}</div>`);
    const close = () => { scrim.remove(); el.remove(); document.removeEventListener('keydown', onKey); if (opts.onClose) opts.onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    scrim.onclick = close;
    document.body.append(scrim, el);
    document.addEventListener('keydown', onKey);
    const cb = el.querySelector('[data-close]'); if (cb) cb.onclick = close;
    return { el, close };
  }

  function askConfirm(msg, ok, danger) {
    return new Promise(resolve => {
      let done = false;
      const s = sheet('<p style="margin:6px 0 0;font-size:16px">' + msg + '</p>', { center: true,
        foot: '<button class="btn" data-no>Annuler</button><button class="btn ' + (danger ? 'dark' : 'primary') + '" data-ok>' + (ok || 'Confirmer') + '</button>',
        onClose: () => { if (!done) resolve(false); } });
      s.el.querySelector('[data-no]').onclick = () => s.close();
      s.el.querySelector('[data-ok]').onclick = () => { done = true; s.close(); resolve(true); };
    });
  }
  function showLink(url) {
    const s = sheet('<p style="margin-top:0;color:var(--ink-2)">Copiez ce lien pour partager l’enquête :</p><textarea class="inp" readonly style="min-height:90px">' + esc(url) + '</textarea>', { title: 'Lien de partage', foot: '<button class="btn primary" data-copy>' + ic('copy') + 'Copier</button>' });
    const ta = s.el.querySelector('textarea'); ta.focus(); ta.select();
    s.el.querySelector('[data-copy]').onclick = async () => { ta.select(); try { await navigator.clipboard.writeText(url); toast('Lien copié'); s.close(); } catch (e) { document.execCommand && document.execCommand('copy'); toast('Lien sélectionné : copiez-le'); } };
  }

  function openMenu() {
    const s = sheet(`<div class="menu-list">
        <button data-a="sol">${ic('eye')}<span>Solution expliquée<small>Toutes les déductions, pas à pas</small></span></button>
        <button data-a="restart">${ic('refresh')}<span>Recommencer<small>Effacer la grille</small></span></button>
        <button data-a="share">${ic('share')}<span>Partager cette enquête<small>Lien à envoyer</small></span></button>
        <button data-a="edit">${ic('wand')}<span>Ouvrir dans le solveur<small>Modifier les indices, analyser</small></span></button>
        <button data-a="export">${ic('download')}<span>Exporter (JSON)</span></button>
      </div>
      <div class="switch"><span>Taille de la grille<small>Par défaut, elle s’ajuste à l’écran</small></span><span class="btn-row" style="flex-wrap:nowrap"><button class="btn sm" data-zm="-">${ic('zout')}</button><button class="btn sm" data-zm="0">Ajuster</button><button class="btn sm" data-zm="+">${ic('zin')}</button></span></div>
      <div style="margin-top:4px">
        <label class="switch"><span>Exclusion automatique<small>Poser un ● barre le reste de sa ligne et de sa colonne</small></span><input type="checkbox" class="tg" data-s="autoX" ${settings.autoX ? 'checked' : ''}></label>
        <label class="switch"><span>Mode précision<small>Sur écran tactile, quand les cases sont petites : un toucher sélectionne la case, une barre permet de la remplir</small></span><input type="checkbox" class="tg" data-s="precision" ${settings.precision !== false ? 'checked' : ''}></label>
        <label class="switch"><span>Croix de repérage<small>Surligner la ligne et la colonne survolées (souris)</small></span><input type="checkbox" class="tg" data-s="cross" ${settings.cross ? 'checked' : ''}></label>
      </div>
      <div style="font-size:12.5px;color:var(--muted);margin-top:10px">Raccourcis : <span class="kbd">Ctrl Z</span> annuler · <span class="kbd">Ctrl Y</span> rétablir · <span class="kbd">H</span> indice · clic droit = ●</div>`,
      { title: 'Options de la partie' });
    s.el.addEventListener('click', e => {
      const z = e.target.closest('[data-zm]'); if (z) { zoomBy(z.dataset.zm); return; }
      const b = e.target.closest('button[data-a]'); if (!b) return;
      const a = b.dataset.a; s.close();
      if (a === 'sol') openSolution();
      if (a === 'restart') askConfirm('Effacer toute la grille et recommencer ?', 'Recommencer', true).then(ok => { if (ok) { const rec = []; for (let i = 0; i < game.P.M; i++) for (let j = i + 1; j < game.P.M; j++) if (game.marks[i * game.P.M + j]) setMark(game, i, j, 0, rec, false); commit(rec); game.done = []; game.finished = false; game.elapsed = 0; renderPlay($('#view')); } });
      if (a === 'share') sharePuzzle(game.p);
      if (a === 'edit') { Editor.load(game.p); location.hash = '#/editeur'; }
      if (a === 'export') download((game.p.id || 'integramme') + '.json', JSON.stringify(stripPuzzle(game.p), null, 1));
    });
    s.el.querySelectorAll('[data-s]').forEach(inp => inp.onchange = () => { settings[inp.dataset.s] = inp.checked; saveSettings(); });
  }
  const stripPuzzle = p => ({ title: p.title, intro: p.intro, entity: p.entity, theme: p.theme, level: p.level, rating: p.rating, cats: p.cats, clues: p.clues, sol: p.sol });

  /* ----------------------- Visionneuse de solution ----------------------- */
  async function openSolution(p, preRes, gid) {
    p = p || game.p; gid = gid || (game && game.p === p ? game.id : 'x');
    let res = preRes || explainCache.get(gid);
    const ov = h(`<div class="viewer"><div class="viewer-head"><button class="icon-btn" data-close aria-label="Fermer">${ic('x')}</button><h3>Solution expliquée</h3></div><div class="viewer-main">${loadingHTML('Le détective réfléchit…')}</div></div>`);
    document.body.appendChild(ov);
    const close = () => { ov.remove(); document.removeEventListener('keydown', onKey); };
    ov.querySelector('[data-close]').onclick = close;
    let onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    if (!res || !res.steps || (res.steps.some(s => s.r === 'hypo' && !s.chain))) {
      res = await Engine.call('explain', { puzzle: p });
      explainCache.set(gid, res);
    }
    if (!document.body.contains(ov)) return;
    const P = C.compile(p), steps = res.steps;
    // instantanés
    const snaps = [new Int8Array(P.M * P.M)];
    steps.forEach(st => { const m = snaps[snaps.length - 1].slice(); st.ch.forEach(([a, b, v]) => { m[a * P.M + b] = v; m[b * P.M + a] = v; }); snaps.push(m); });
    const main = ov.querySelector('.viewer-main');
    const counts = res.counts || [];
    const lvNames = ['', 'évidentes', 'simples', 'avancées', 'expertes', 'exhaustives'];
    main.innerHTML = `<div class="viewer-grid" id="vg"></div>
      <div class="viewer-side">
        <div class="vsummary">${res.solved ? '<span class="badge" style="background:var(--yes-soft);color:var(--yes)">Résolu en ' + steps.length + ' étapes</span>' : '<span class="badge" style="background:var(--no-soft);color:var(--no)">Résolution incomplète</span>'}
          ${[1, 2, 3, 4, 5].filter(l => counts[l]).map(l => '<span class="badge lv-badge lv-' + Math.min(5, l + (l >= 3 ? 1 : 0)) + '">' + counts[l] + ' ' + lvNames[l] + '</span>').join('')}
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-left:auto"><input type="checkbox" class="tg" id="keyOnly" ${settings.keyOnly ? 'checked' : ''}> Étapes clés</label></div>
        <div class="vstep" id="vstep"></div>
        <div class="vlist" id="vlist"></div>
        <div class="vnav"><button class="btn sm" id="vfirst" title="Début">${ic('left')}${ic('left')}</button><button class="btn sm" id="vprev">${ic('left')}Préc.</button><span class="count" id="vcount"></span><button class="btn sm mob-only" id="vlistBtn" title="Liste des étapes">${ic('list')}</button><button class="btn sm primary" id="vnext">Suiv.${ic('right')}</button><button class="btn sm" id="vlast" title="Fin">${ic('right')}${ic('right')}</button></div>
      </div>`;
    const gv = new GridView(P, { readonly: true, legend: '' });
    const vg = $('#vg', main); vg.appendChild(gv.el);
    const fitV = () => gv.fit(vg, innerWidth < 960 ? 0.92 : 1); fitV();
    const ro = new ResizeObserver(fitV); ro.observe(vg);
    let idx = -1;
    const visible = () => steps.map((s, i) => i).filter(i => !settings.keyOnly || steps[i].lv >= 2 || i === steps.length - 1);
    const lvCls = l => 'lv-' + Math.min(5, l + (l >= 3 ? 1 : 0));
    function renderList() {
      const vis = visible();
      $('#vlist', main).innerHTML = vis.map(i => {
        const d = C.TITLES[steps[i].r] + (steps[i].ci != null ? ' · indice ' + (steps[i].ci + 1) : '');
        return `<button data-i="${i}" class="${i === idx ? 'on' : ''}"><span class="n">${i + 1}</span><i class="lvdot ${lvCls(steps[i].lv)}"></i><span class="t">${esc(d)}</span></button>`;
      }).join('');
    }
    function show(i) {
      idx = i;
      if (i < 0) {
        gv.update(snaps[0]); gv.highlight([], []);
        $('#vstep', main).innerHTML = `<div class="expl"><h4>Point de départ</h4><p>La grille est vide. Le solveur applique toujours la technique la plus simple disponible : les étapes « évidentes » d’abord, puis les déductions plus élaborées seulement quand c’est nécessaire.</p>
          <p>Activez <b>Étapes clés</b> pour masquer les exclusions mécaniques et ne garder que les raisonnements intéressants.</p>
          ${p.clues.map((cl, j) => '<div style="font-size:13.5px;margin:4px 0"><b>' + (j + 1) + '.</b> ' + esc(C.clueText(P, cl)) + '</div>').join('')}</div>`;
      } else {
        const st = steps[i], d = C.describe(P, st);
        gv.update(snaps[i + 1]); gv.highlight(st.ch, C.focusOf(P, st));
        $('#vstep', main).innerHTML = `<div class="expl"><span class="badge lv-badge ${lvCls(st.lv)}">${esc(d.levelName)}</span><h4>${esc(d.title)}</h4>${d.html}<div class="chg"><div class="eyebrow" style="margin-bottom:4px">Conséquences</div>${d.changes}</div></div>`;
      }
      $('#vcount', main).textContent = (i + 1) + ' / ' + steps.length;
      $$('#vlist button', main).forEach(b => b.classList.toggle('on', +b.dataset.i === i));
      const on = $('#vlist button.on', main); if (on) on.scrollIntoView({ block: 'nearest' });
    }
    const go = (dir) => {
      const vis = visible();
      if (dir > 0) { const n = vis.find(i => i > idx); show(n != null ? n : idx); }
      else { const pv = vis.filter(i => i < idx).pop(); show(pv != null ? pv : -1); }
    };
    $('#vnext', main).onclick = () => go(1);
    $('#vprev', main).onclick = () => go(-1);
    $('#vfirst', main).onclick = () => show(-1);
    $('#vlast', main).onclick = () => show(steps.length - 1);
    $('#vlist', main).onclick = e => { const b = e.target.closest('button'); if (b) { show(+b.dataset.i); ov.classList.remove('show-list'); } };
    $('#vlistBtn', main).onclick = () => { ov.classList.toggle('show-list'); const on = $('#vlist button.on', main); if (on) on.scrollIntoView({ block: 'center' }); };
    $('#keyOnly', main).onchange = e => { settings.keyOnly = e.target.checked; saveSettings(); renderList(); };
    const prevKey = onKey;
    onKey = (e) => { prevKey(e); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    document.removeEventListener('keydown', prevKey); document.addEventListener('keydown', onKey);
    renderList(); show(-1);
  }

  /* ----------------------------- Création -------------------------------- */
  const LOAD_MSGS = ['On interroge les témoins…', 'On recoupe les alibis…', 'On vérifie l’unicité de la solution…', 'On efface les indices superflus…', 'On mesure la difficulté…', 'On aiguise la loupe…'];
  function loadingHTML(msg) { return `<div class="loading"><div class="spin">${Array.from({ length: 9 }, (_, i) => '<i style="animation-delay:' + ((i * 0.37) % 1.2).toFixed(2) + 's"></i>').join('')}</div><div class="msg" id="loadMsg">${msg || ''}</div></div>`; }

  async function generateAndPlay(opts) {
    const main = $('#view');
    location.hash !== '#/creer' && history.replaceState(null, '', '#/creer');
    main.classList.remove('has-playbar');
    main.innerHTML = loadingHTML(LOAD_MSGS[0]);
    let k = 0; const it = setInterval(() => { const m = $('#loadMsg'); if (m) m.textContent = LOAD_MSGS[++k % LOAD_MSGS.length]; }, 900);
    try {
      const p = await Engine.call('generate', { opts });
      clearInterval(it);
      if (!p) throw new Error('échec');
      if (opts.daily) { p.id = 'jour-' + opts.daily; p.title = 'Enquête du jour'; }
      const games = store.get('games', {});
      game = games[p.id] ? deserialize(games[p.id]) : newGame(p);
      saveGame(true);
      location.hash = '#/jouer';
      if (currentRoute() === 'jouer') render();
    } catch (e) {
      clearInterval(it); console.error(e);
      toast('La génération a échoué, réessayez.'); render();
    }
  }

  function dailyInfo() {
    const d = new Date();
    const key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const lv = [5, 2, 2, 3, 3, 4, 4][d.getDay()];
    return { key, lv, d };
  }

  function viewCreate(main, query, welcome) {
    main.classList.remove('has-playbar');
    const sel = Object.assign({ level: 2, theme: 'random', size: null }, store.get('createSel', {}));
    const di = dailyInfo();
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const games = store.get('games', {});
    const hist = Object.values(games).sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(0, 8);
    const SIZES = [null, [3, 4], [4, 4], [4, 5], [5, 5], [4, 6], [5, 6], [6, 6]];
    main.innerHTML = `
      ${welcome ? `<section class="hero">
        <svg class="art" viewBox="0 0 64 64"><use href="#logo"/></svg>
        <div class="eyebrow" style="color:rgba(255,255,255,.75)">Grilles logiques · enquêtes</div>
        <h1>Chaque indice compte. Aucun n’est de trop.</h1>
        <p>Générez des integrammes du plus facile au plus retors, résolvez-les avec des indices qui expliquent <em>pourquoi</em>, et apprenez toutes les techniques — jusqu’au raisonnement par l’absurde.</p>
        <div class="btn-row"><button class="btn big light" id="quick">${ic('play')}Jouer maintenant</button><a class="btn big glass" href="#/methode">${ic('book')}Apprendre la méthode</a></div>
      </section>` : `<div class="section-title" style="margin-top:4px"><h2 style="font-size:30px">Nouvelle enquête</h2></div>`}

      <div class="card daily" style="margin-top:18px">
        <div class="cal"><small>${months[di.d.getMonth()]}</small><b>${di.d.getDate()}</b></div>
        <div class="tx"><b>Enquête du jour</b><div>La même pour tout le monde aujourd’hui · ${LV[di.lv].name}</div></div>
        <button class="btn primary" id="daily">${games['jour-' + di.key] && games['jour-' + di.key].finished ? ic('check') + 'Résolue' : ic('play') + 'Jouer'}</button>
      </div>

      <div class="section-title"><h2>Difficulté</h2><span class="sub">les techniques nécessaires</span></div>
      <div class="levels" id="levels">
        ${[1, 2, 3, 4, 5].map(l => `<button class="lvl lv-${l} ${sel.level === l ? 'on' : ''}" data-l="${l}"><span class="dots">${dots(l).replace('<span class="dots">', '').replace('</span>', '')}</span><b>${LV[l].name}</b><span class="d">${LV[l].desc}</span><span class="sz">${LV[l].K} catégories × ${LV[l].N}</span></button>`).join('')}
      </div>

      <div class="section-title"><h2>Univers</h2></div>
      <div class="themes" id="themes">
        <button class="theme ${sel.theme === 'random' ? 'on' : ''}" data-t="random" style="--th:220"><span class="ic">🎲</span><b>Surprise</b></button>
        ${T.THEMES.map(t => `<button class="theme ${sel.theme === t.id ? 'on' : ''}" data-t="${t.id}" style="--th:${t.hue}"><span class="ic">${t.icon}</span><b>${esc(t.name)}</b></button>`).join('')}
      </div>

      <div class="section-title"><h2>Taille</h2><span class="sub">catégories × éléments</span></div>
      <div class="sizes" id="sizes">
        ${SIZES.map(s => `<button data-s="${s ? s.join('x') : ''}" class="${(!s && !sel.size) || (s && sel.size && sel.size.K === s[0] && sel.size.N === s[1]) ? 'on' : ''}">${s ? s[0] + ' × ' + s[1] : 'Selon le niveau'}</button>`).join('')}
      </div>

      <div class="gen-cta"><button class="btn big primary" id="gen">${ic('sparkles')}Générer l’enquête</button><span class="note">Solution unique garantie, résoluble par le raisonnement.</span></div>

      ${hist.length ? `<div class="section-title"><h2>Mes enquêtes</h2></div><div class="history">${hist.map(o => {
        const th = themeOf(o.p.theme);
        return `<button class="hist" data-id="${esc(o.id)}"><span class="ic">${th ? th.icon : '🧩'}</span><span class="tx"><b>${esc(o.p.title || 'Enquête')}</b><span>${o.p.cats.length}×${o.p.cats[0].items.length} · ${LV[o.p.rating || o.p.level] ? LV[o.p.rating || o.p.level].name : 'Perso'} · ${fmtTime(o.elapsed || 0)}</span></span><span class="st ${o.finished ? 'ok' : ''}">${o.finished ? '✓ Résolue' : 'En cours'}</span></button>`;
      }).join('')}</div>` : ''}
      <footer class="foot">Integramme · fonctionne hors ligne une fois installé</footer>`;
    const saveSel = () => store.set('createSel', sel);
    $('#levels').onclick = e => { const b = e.target.closest('.lvl'); if (!b) return; sel.level = +b.dataset.l; $$('#levels .lvl').forEach(x => x.classList.toggle('on', x === b)); saveSel(); };
    $('#themes').onclick = e => { const b = e.target.closest('.theme'); if (!b) return; sel.theme = b.dataset.t; $$('#themes .theme').forEach(x => x.classList.toggle('on', x === b)); saveSel(); };
    $('#sizes').onclick = e => { const b = e.target.closest('button'); if (!b) return; const s = b.dataset.s; sel.size = s ? { K: +s.split('x')[0], N: +s.split('x')[1] } : null; $$('#sizes button').forEach(x => x.classList.toggle('on', x === b)); saveSel(); };
    $('#gen').onclick = () => generateAndPlay({ level: sel.level, theme: sel.theme, size: sel.size });
    $('#daily').onclick = () => {
      const g = games['jour-' + di.key];
      if (g) { game = deserialize(g); saveGame(true); location.hash = '#/jouer'; return; }
      generateAndPlay({ level: di.lv, theme: 'random', seed: di.key, attempts: di.lv >= 4 ? 40 : 25, daily: di.key });
    };
    const q = $('#quick'); if (q) q.onclick = () => generateAndPlay({ level: sel.level, theme: sel.theme, size: sel.size });
    main.querySelectorAll('.hist').forEach(b => b.onclick = () => { game = deserialize(games[b.dataset.id]); saveGame(true); location.hash = '#/jouer'; });
  }

  /* ============================== Éditeur =============================== */
  const Editor = (function () {
    const CLUE_TYPES = {
      is: { label: 'A est B (affirmation)', slots: ['A', 'B'] },
      not: { label: 'A n’est pas B (négation)', slots: ['A', 'B'] },
      gender: { label: 'A est une femme / un homme', slots: ['A'], g: true },
      none: { label: 'A n’est ni B, ni C… (exclusions)', slots: ['A', 'B', 'C?', 'D?', 'E?'], list: true },
      oneof: { label: 'A est B, C ou D (une seule catégorie)', slots: ['A', 'B', 'C', 'D?', 'E?'], list: true },
      either: { label: 'A est B ou C, mais pas les deux', slots: ['A', 'B', 'C'] },
      pair: { label: 'Parmi A et B, l’un est C, l’autre D', slots: ['A', 'B', 'C', 'D'] },
      cond: { label: 'Si A est B, alors C est D', slots: ['A', 'B', 'C', 'D'] },
      lt: { label: 'A a une valeur plus petite que B', slots: ['A', 'B'], ord: true },
      diff: { label: 'A a exactement k de moins que B', slots: ['A', 'B'], ord: true, k: true },
      dist: { label: 'A et B ont exactement k d’écart', slots: ['A', 'B'], ord: true, k: true },
      alldiff: { label: 'Tous différents (2 à 5 éléments)', slots: ['1', '2', '3?', '4?', '5?'], list: true, nolead: true },
    };
    let ed = store.get('editor', null);
    const normEd = () => { if (ed) ed.clues = (ed.clues || []).map(c => c.parts ? c : { parts: [c] }); };
    let lastAnalysis = null;
    function blank() {
      return {
        title: 'Mon integramme', intro: '', N: 4,
        cats: [
          { name: 'Prénom', preset: 'name', items: [{ label: 'Alice', g: 'f' }, { label: 'Bruno', g: 'm' }, { label: 'Chloé', g: 'f' }, { label: 'David', g: 'm' }] },
          { name: 'Ville', preset: 'lieu', items: ['Lyon', 'Nantes', 'Paris', 'Rennes'].map(label => ({ label })) },
          { name: 'Âge', preset: 'age', items: [20, 25, 30, 35].map(v => ({ v })) },
        ],
        clues: [],
      };
    }
    if (!ed) ed = blank();
    normEd();
    const save = () => store.set('editor', ed);
    const fmtVal = (preset, v) => {
      const pr = T.PRESETS[preset];
      if (!pr || pr.kind !== 'ord') return String(v);
      if (pr.time) return T.hhmm(v);
      if (pr.ordinal) return T.ordinal(v);
      return v + (pr.unit || '');
    };
    const ordLabel = (c, it, v) => ((T.PRESETS[c.preset] || {}).custom && it.label) ? it.label : fmtVal(c.preset, v);
    const parseVal = (preset, s) => {
      const pr = T.PRESETS[preset];
      if (pr && pr.time) { const m = String(s).match(/(\d{1,2})\s*[h:]\s*(\d{0,2})/i); if (m) return +m[1] * 60 + (+m[2] || 0); return NaN; }
      return parseFloat(String(s).replace(',', '.'));
    };
    function build(e) {
      e = e || ed;
      const N = e.N;
      const cats = e.cats.map(c => {
        const pr = T.PRESETS[c.preset] || T.PRESETS.generic;
        const items = c.items.slice(0, N).map((it, i) => {
          if (pr.kind === 'ord') { const v = isFinite(it.v) ? +it.v : i + 1; const o = { v, label: ordLabel(c, it, v) }; if (it.txt && pr.custom) o.txt = it.txt; return o; }
          const label = (it.label || '').trim() || ('?' + (i + 1));
          if (pr.kind === 'name') return { label, g: it.g || 'm' };
          const o = { label, txt: it.txt || label }; if (it.txtNeg) o.txtNeg = it.txtNeg; return o;
        });
        const o = { name: c.name || 'Catégorie', kind: pr.kind, items, tpl: Object.assign({}, pr.tpl) };
        if (pr.k) o.k = pr.k;
        return o;
      });
      const g = (r) => r[0] * N + r[1];
      const conv = cl => {
        const o = { t: cl.t };
        ['a', 'b', 'c', 'd'].forEach(k => { if (cl[k]) o[k] = g(cl[k]); });
        if (cl.l) o.l = cl.l.map(g);
        if (cl.o != null) o.o = cl.o; if (cl.k != null) o.k = +cl.k; if (cl.s) o.s = 1; if (cl.g) o.g = cl.g;
        return o;
      };
      const clues = e.clues.map(c => {
        const parts = (c.parts || [c]).map(conv);
        const o = parts.length === 1 ? parts[0] : { t: 'multi', parts };
        if (c.text && c.text.trim()) o.text = c.text.trim();
        return o;
      });
      return { title: e.title, intro: e.intro, entity: 'personne', cats, clues };
    }
    function clueValid(c, e) {
      const parts = c.parts || [c];
      if (!parts.length) return 'indice vide';
      for (const p of parts) { const err = partValid(p, e); if (err) return err; }
      return null;
    }
    function partValid(cl, e) {
      e = e || ed;
      const refs = ['a', 'b', 'c', 'd'].filter(k => cl[k]).map(k => cl[k]).concat(cl.l || []);
      if (refs.some(r => r[0] >= e.cats.length || r[1] >= e.N)) return 'référence invalide';
      const cat = r => r[0];
      const t = cl.t;
      if ((t === 'is' || t === 'not') && cat(cl.a) === cat(cl.b)) return 'A et B doivent être de catégories différentes';
      if (t === 'either' && (cat(cl.a) === cat(cl.b) || cat(cl.a) === cat(cl.c))) return 'B et C doivent être d’une autre catégorie que A';
      if (t === 'either' && cl.b[0] === cl.c[0] && cl.b[1] === cl.c[1]) return 'B et C doivent être différents';
      if (t === 'pair' && [cl.c, cl.d].some(z => z[0] === cat(cl.a) || z[0] === cat(cl.b))) return 'C et D doivent être d’autres catégories que A et B';
      if (t === 'pair' && cl.a.join() === cl.b.join()) return 'A et B doivent être différents';
      if ((t === 'lt' || t === 'diff' || t === 'dist')) {
        if (cl.o == null || !e.cats[cl.o] || (T.PRESETS[e.cats[cl.o].preset] || {}).kind !== 'ord') return 'choisissez une catégorie numérique';
        if (cl.a.join() === cl.b.join()) return 'A et B doivent être différents';
        if (t !== 'lt' && !(+cl.k > 0)) return 'l’écart k doit être positif';
      }
      if (t === 'alldiff' && (!cl.l || cl.l.length < 2)) return 'au moins deux éléments';
      if ((t === 'none' || t === 'oneof') && (!cl.l || !cl.l.length)) return 'choisissez au moins un élément';
      if ((t === 'none' || t === 'oneof') && cl.l.some(r => r[0] === cat(cl.a))) return 'les éléments doivent être d’une autre catégorie que A';
      if (t === 'oneof' && cl.l.some(r => r[0] !== cl.l[0][0])) return 'les options doivent être de la même catégorie';
      if (t === 'cond' && (cat(cl.a) === cat(cl.b) || cat(cl.c) === cat(cl.d))) return 'A/B et C/D doivent être de catégories différentes';
      if (t === 'gender' && !e.cats.some(c => (T.PRESETS[c.preset] || {}).kind === 'name')) return 'il faut une catégorie de prénoms (avec genres)';
      return null;
    }
    function load(p) {
      p = JSON.parse(JSON.stringify(p));
      const N = p.cats[0].items.length;
      const presetOf = c => {
        if (c.kind === 'name') return 'name';
        const found = Object.keys(T.PRESETS).find(k => T.PRESETS[k].kind === c.kind && T.PRESETS[k].tpl.pred === c.tpl.pred);
        if (found) return found;
        return '__custom' + Math.random().toString(36).slice(2, 7);
      };
      ed = {
        title: p.title || 'Integramme', intro: p.intro || '', N,
        cats: p.cats.map(c => {
          let preset = presetOf(c);
          if (preset.startsWith('__custom')) { T.PRESETS[preset] = { label: 'Personnalisé (' + c.name + ')', kind: c.kind, tpl: c.tpl, k: c.k, custom: true }; }
          return { name: c.name, preset, items: c.items.map(it => c.kind === 'ord' ? { v: it.v, label: it.label, txt: it.txt } : { label: it.label, txt: it.txt, txtNeg: it.txtNeg, g: it.g }), customTpl: T.PRESETS[preset].custom ? { kind: c.kind, tpl: c.tpl, k: c.k } : undefined };
        }),
        clues: p.clues.map(cl => {
          const r = g => [Math.floor(g / N), g % N];
          const conv = x => {
            const o = { t: x.t };
            ['a', 'b', 'c', 'd'].forEach(k => { if (x[k] != null) o[k] = r(x[k]); });
            if (x.l) o.l = x.l.map(r); if (x.o != null) o.o = x.o; if (x.k != null) o.k = x.k; if (x.s) o.s = 1; if (x.g) o.g = x.g;
            return o;
          };
          const out = { parts: (cl.t === 'multi' ? cl.parts : [cl]).map(conv) };
          if (cl.text) out.text = cl.text;
          return out;
        }),
      };
      // les valeurs ordonnées affichées avec un libellé personnalisé
      ed.cats.forEach(c => { if (c.customTpl) T.PRESETS[c.preset] = Object.assign({ label: 'Personnalisé (' + c.name + ')', custom: true }, c.customTpl); });
      lastAnalysis = null; editIdx = null; draft = { parts: [{ t: 'is' }], text: '', custom: false };
      save();
    }
    function restoreCustom() { ed.cats.forEach(c => { if (c.customTpl && !T.PRESETS[c.preset]) T.PRESETS[c.preset] = Object.assign({ label: 'Personnalisé (' + c.name + ')', custom: true }, c.customTpl); }); }

    function itemOptions(sel, filter) {
      return ed.cats.map((c, ci) => `<optgroup label="${esc(c.name)}">${c.items.slice(0, ed.N).map((it, i) => {
        if (filter && !filter(ci)) return '';
        const lab = (T.PRESETS[c.preset] || {}).kind === 'ord' ? ordLabel(c, it, it.v) : (it.label || '?');
        const v = ci + ',' + i;
        return `<option value="${v}" ${sel && sel.join() === v ? 'selected' : ''}>${esc(lab)}</option>`;
      }).join('')}</optgroup>`).join('');
    }

    function render(main) {
      restoreCustom();
      main.classList.remove('has-playbar');
      const presetOpts = (cur) => Object.keys(T.PRESETS).map(k => `<option value="${k}" ${k === cur ? 'selected' : ''}>${esc(T.PRESETS[k].label)}</option>`).join('');
      main.innerHTML = `
        <div class="section-title" style="margin-top:4px;flex-wrap:wrap"><h2 style="font-size:30px;flex:1">Solveur &amp; éditeur</h2>
          <div class="btn-row">
            <button class="btn sm" id="edNew">${ic('plus')}Nouveau</button>
            <button class="btn sm" id="edImport">${ic('upload')}Importer</button>
            <button class="btn sm" id="edExport">${ic('download')}Exporter</button>
          </div></div>
        <p style="color:var(--ink-2);margin:0 0 16px;max-width:70ch">Saisissez un integramme (d’un magazine, d’un ami, ou de votre invention) : le solveur vérifie qu’il a une solution unique, mesure sa difficulté et l’explique étape par étape.</p>
        <div class="ed-grid">
          <div class="stack">
            <div class="card card-pad stack">
              <div class="field"><label>Titre</label><input class="inp" id="edTitle" value="${esc(ed.title)}"></div>
              <div class="field"><label>Introduction (facultatif)</label><input class="inp" id="edIntro" value="${esc(ed.intro)}" placeholder="Le contexte de l’enquête…"></div>
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                <span class="lbl">Éléments par catégorie</span>
                <div class="seg" id="edN">${[3, 4, 5, 6, 7].map(n => `<button data-n="${n}" class="${ed.N === n ? 'on' : ''}">${n}</button>`).join('')}</div>
              </div>
            </div>
            <div class="stack" id="edCats">
              ${ed.cats.map((c, ci) => {
                const pr = T.PRESETS[c.preset] || T.PRESETS.generic;
                return `<div class="cat-card" data-ci="${ci}">
                  <div class="top">
                    <div class="field"><label>Catégorie ${ci + 1}${ci === 0 ? ' (clé)' : ''}</label><input class="inp" data-f="name" value="${esc(c.name)}"></div>
                    <div class="field"><label>Type de phrase</label><select class="inp" data-f="preset">${presetOpts(c.preset)}</select></div>
                    <button class="icon-btn" data-del title="Supprimer la catégorie" ${ed.cats.length <= 2 ? 'disabled' : ''}>${ic('trash')}</button>
                  </div>
                  <div class="items-ed">
                    ${Array.from({ length: ed.N }, (_, i) => {
                      const it = c.items[i] || {};
                      if (pr.kind === 'ord') return `<div class="it"><input class="inp" data-i="${i}" data-f="v" value="${it.v != null ? esc(pr.time ? T.hhmm(it.v) : it.v) : ''}" placeholder="${pr.time ? '18h30' : 'valeur'}" inputmode="${pr.time ? 'text' : 'decimal'}"></div>`;
                      return `<div class="it"><input class="inp" data-i="${i}" data-f="label" value="${esc(it.label || '')}" placeholder="élément ${i + 1}">${pr.kind === 'name' ? `<button class="g-tog" data-i="${i}" data-g title="Genre (accords)">${(it.g || 'm') === 'f' ? 'F' : 'M'}</button>` : ''}</div>`;
                    }).join('')}
                  </div>
                </div>`;
              }).join('')}
            </div>
            <button class="btn" id="edAddCat" ${ed.cats.length >= 6 ? 'disabled' : ''}>${ic('plus')}Ajouter une catégorie</button>
          </div>
          <div class="stack">
            <div class="card card-pad stack">
              <h3 style="margin:0">Indices <span class="badge">${ed.clues.length}</span></h3>
              <div class="stack" id="edClues" style="gap:6px">${clueListHTML()}</div>
              <div class="builder" id="builder"></div>
            </div>
            <div class="card card-pad">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><h3 style="margin:0;flex:1">Analyse</h3><button class="btn primary" id="edAnalyze">${ic('wand')}Analyser</button></div>
              <div id="edResult" class="analysis"><div style="color:var(--muted);font-size:14px">Lancez l’analyse pour vérifier l’unicité de la solution et obtenir l’explication complète.</div></div>
            </div>
          </div>
        </div>`;
      bind(main);
      renderBuilder();
      if (lastAnalysis) showAnalysis(lastAnalysis);
    }
    function clueListHTML() {
      if (!ed.clues.length) return '<div style="color:var(--muted);font-size:14px">Aucun indice pour l’instant.</div>';
      let p; try { p = build(); } catch (e) { return ''; }
      const P = C.compile(p);
      return ed.clues.map((cl, i) => {
        const err = clueValid(cl);
        let txt; try { txt = err ? '⚠ ' + err : C.clueText(P, p.clues[i]); } catch (e) { txt = '⚠ indice invalide'; }
        const tags = (cl.parts.length > 1 ? `<span class="tag">${cl.parts.length} contraintes</span>` : '') + (cl.text ? '<span class="tag">texte perso</span>' : '');
        return `<div class="clue-ed ${editIdx === i ? 'editing' : ''}" data-i="${i}"><span class="n">${i + 1}</span><span class="tx" title="Modifier" style="${err ? 'color:var(--no)' : ''}">${esc(txt)}${tags ? '<span class="tags">' + tags + '</span>' : ''}</span><span class="acts"><button data-edit title="Modifier">${ic('edit')}</button><button data-up title="Monter">${ic('up')}</button><button data-down title="Descendre">${ic('down')}</button><button data-rm title="Supprimer">${ic('trash')}</button></span></div>`;
      }).join('');
    }
    let draft = { parts: [{ t: 'is' }], text: '', custom: false }, editIdx = null;
    const slotKeysOf = t => {
      const ty = CLUE_TYPES[t];
      if (t === 'alldiff') return ['l0', 'l1', 'l2', 'l3', 'l4'];
      if (ty.list) return ['a', 'l0', 'l1', 'l2', 'l3'];
      return ['a', 'b', 'c', 'd'].slice(0, ty.slots.length);
    };
    function partHTML(pt, j, n) {
      const ty = CLUE_TYPES[pt.t];
      const ordCats = ed.cats.map((c, i) => ((T.PRESETS[c.preset] || {}).kind === 'ord' ? i : -1)).filter(i => i >= 0);
      if (ty.ord && (pt.o == null || !ordCats.includes(pt.o))) pt.o = ordCats[0];
      const keys = slotKeysOf(pt.t);
      return `<div class="part" data-j="${j}">
        <div class="row"><select class="inp" data-f="t">${Object.keys(CLUE_TYPES).map(k => `<option value="${k}" ${k === pt.t ? 'selected' : ''}>${esc(CLUE_TYPES[k].label)}</option>`).join('')}</select>
          ${n > 1 ? `<button class="icon-btn" data-rmpart title="Retirer cette contrainte" style="flex:0 0 auto">${ic('trash')}</button>` : ''}</div>
        ${ty.ord ? `<div class="row"><select class="inp" data-f="o">${ordCats.length ? ordCats.map(i => `<option value="${i}" ${pt.o === i ? 'selected' : ''}>Selon « ${esc(ed.cats[i].name)} »</option>`).join('') : '<option value="">Aucune catégorie numérique</option>'}</select>
          ${ty.k ? `<input class="inp" data-f="k" type="number" min="1" step="any" placeholder="écart k" value="${pt.k != null ? pt.k : ''}">` : ''}
          ${pt.t !== 'dist' ? `<label class="chk"><input type="checkbox" data-f="s" ${pt.s ? 'checked' : ''}> formulation inversée</label>` : ''}</div>` : ''}
        <div class="row">${keys.map((k, i) => {
          const lab = ty.slots[i];
          const cur = k[0] === 'l' ? (pt.l || [])[+k[1]] : pt[k];
          return `<select class="inp" data-slot="${k}"><option value="">${esc(lab.replace('?', '') + (lab.endsWith('?') ? ' (facultatif)' : ''))}</option>${itemOptions(cur, ty.ord ? (ci) => ci !== pt.o : null)}</select>`;
        }).join('')}</div>
        ${ty.g ? `<div class="row"><select class="inp" data-f="g"><option value="f" ${pt.g !== 'm' ? 'selected' : ''}>est une femme (exclut les prénoms masculins)</option><option value="m" ${pt.g === 'm' ? 'selected' : ''}>est un homme (exclut les prénoms féminins)</option></select></div>` : ''}
      </div>`;
    }
    function autoText(clue) {
      try { const tmp = JSON.parse(JSON.stringify(ed)); tmp.clues = [{ parts: clue.parts }]; const p = build(tmp); return C.clueText(C.compile(p), p.clues[0]); }
      catch (e) { return ''; }
    }
    function renderBuilder() {
      const b = $('#builder'); if (!b) return;
      const n = draft.parts.length;
      b.classList.toggle('editing', editIdx != null);
      b.innerHTML = `
        <div class="lbl">${editIdx != null ? 'Modifier l’indice n°' + (editIdx + 1) : 'Nouvel indice'}</div>
        ${draft.parts.map((pt, j) => partHTML(pt, j, n)).join('<div class="and">et</div>')}
        <button class="btn sm ghost" data-addpart style="justify-self:start">${ic('plus')}Ajouter une contrainte à cet indice</button>
        <div class="field"><label>Texte de l’indice <span class="tag ${draft.custom ? 'on' : ''}">${draft.custom ? 'personnalisé' : 'automatique'}</span></label>
          <textarea class="inp txt" data-text rows="2" placeholder="Texte affiché aux joueurs">${esc(draft.custom ? draft.text : '')}</textarea>
          <div class="txt-foot"><span>Rédigez-le comme vous voulez : seul le texte est montré, le solveur utilise les contraintes ci-dessus.</span>${draft.custom ? '<button class="linkbtn" data-autotext>Revenir au texte automatique</button>' : ''}</div></div>
        <div class="b-err" data-err></div>
        <div class="row" style="justify-content:flex-end">${editIdx != null ? '<button class="btn" data-cancel style="flex:0 0 auto">Annuler</button>' : ''}<button class="btn primary" data-save style="flex:0 0 auto">${editIdx != null ? ic('check') + 'Enregistrer' : ic('plus') + 'Ajouter'}</button></div>`;
      const ta = $('[data-text]', b);
      const read = () => {
        draft.parts = $$('.part', b).map((el, j) => {
          const old = draft.parts[j] || {};
          const t = $('[data-f="t"]', el).value;
          if (t !== old.t) return { t };
          const d = { t };
          slotKeysOf(t).forEach(k => {
            const v = $('[data-slot="' + k + '"]', el).value; if (!v) return;
            const r = v.split(',').map(Number);
            if (k[0] === 'l') (d.l = d.l || []).push(r); else d[k] = r;
          });
          const o = $('[data-f="o"]', el); if (o) d.o = o.value === '' ? null : +o.value;
          const k = $('[data-f="k"]', el); if (k) d.k = k.value === '' ? null : +k.value;
          const sx = $('[data-f="s"]', el); if (sx && sx.checked) d.s = 1;
          const g = $('[data-f="g"]', el); if (g) d.g = g.value;
          return d;
        });
      };
      const validate = () => {
        const errEl = $('[data-err]', b), sv = $('[data-save]', b);
        const missing = draft.parts.some(pt => {
          const keys = slotKeysOf(pt.t);
          if (pt.t === 'alldiff') return !pt.l || pt.l.length < 2;
          return keys.filter(k => k[0] !== 'l').some(k => !pt[k]) || (CLUE_TYPES[pt.t].list && !(pt.l && pt.l.length)) || (pt.t === 'oneof' && (!pt.l || pt.l.length < 2));
        });
        const err = missing ? 'Choisissez les éléments…' : clueValid({ parts: draft.parts });
        errEl.textContent = err ? (missing ? err : '⚠ ' + err) : (draft.custom ? 'Texte personnalisé : vérifiez qu’il dit bien la même chose que les contraintes.' : '');
        errEl.classList.toggle('bad', !!err && !missing);
        sv.disabled = !!err;
        if (!draft.custom) ta.placeholder = err ? 'Le texte apparaîtra ici…' : autoText(draft);
        if (!draft.custom) ta.value = err ? '' : autoText(draft);
      };
      b.onchange = e => {
        if (e.target.matches('[data-text]')) return;
        const typeChanged = e.target.matches('[data-f="t"]');
        read();
        if (typeChanged) renderBuilder(); else validate();
      };
      b.oninput = e => {
        if (e.target.matches('[data-text]')) { draft.custom = true; draft.text = e.target.value; const tag = $('.field .tag', b); if (tag) { tag.textContent = 'personnalisé'; tag.classList.add('on'); } return; }
        if (e.target.matches('[data-f="k"]')) { read(); validate(); }
      };
      b.onclick = e => {
        if (e.target.closest('[data-addpart]')) { read(); draft.parts.push({ t: 'gender', a: draft.parts[0] && draft.parts[0].a, g: 'f' }); renderBuilder(); }
        else if (e.target.closest('[data-rmpart]')) { read(); draft.parts.splice(+e.target.closest('.part').dataset.j, 1); renderBuilder(); }
        else if (e.target.closest('[data-autotext]')) { draft.custom = false; draft.text = ''; renderBuilder(); }
        else if (e.target.closest('[data-cancel]')) { editIdx = null; draft = { parts: [{ t: draft.parts[0].t }], text: '', custom: false }; refreshClues(); renderBuilder(); }
        else if (e.target.closest('[data-save]')) {
          read();
          const clue = { parts: JSON.parse(JSON.stringify(draft.parts)) };
          if (draft.custom && draft.text.trim()) clue.text = draft.text.trim();
          if (editIdx != null) ed.clues[editIdx] = clue; else ed.clues.push(clue);
          const wasEdit = editIdx != null;
          editIdx = null; save(); lastAnalysis = null;
          draft = { parts: [{ t: clue.parts[0].t }], text: '', custom: false };
          refreshClues(); renderBuilder();
          toast(wasEdit ? 'Indice modifié' : 'Indice ajouté');
        }
      };
      validate();
    }
    function editClue(i) {
      const c = ed.clues[i];
      editIdx = i;
      draft = { parts: JSON.parse(JSON.stringify(c.parts)), text: c.text || '', custom: !!c.text };
      refreshClues(); renderBuilder();
      const b = $('#builder'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function refreshClues() {
      const el = $('#edClues'); if (el) el.innerHTML = clueListHTML();
      const badge = el && el.parentElement.querySelector('h3 .badge'); if (badge) badge.textContent = ed.clues.length;
    }
    function bind(main) {
      $('#edTitle').oninput = e => { ed.title = e.target.value; save(); };
      $('#edIntro').oninput = e => { ed.intro = e.target.value; save(); };
      $('#edN').onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        ed.N = +b.dataset.n;
        ed.cats.forEach(c => { while (c.items.length < ed.N) c.items.push((T.PRESETS[c.preset] || {}).kind === 'ord' ? { v: (c.items.length ? (+c.items[c.items.length - 1].v || 0) + 1 : 1) } : { label: '' }); });
        ed.clues = ed.clues.filter(cl => !clueValid(cl)); save(); lastAnalysis = null; render(main);
      };
      $('#edCats').addEventListener('input', e => {
        const card = e.target.closest('.cat-card'); if (!card) return;
        const c = ed.cats[+card.dataset.ci], f = e.target.dataset.f;
        if (f === 'name') c.name = e.target.value;
        if (f === 'label') { const i = +e.target.dataset.i; c.items[i] = Object.assign(c.items[i] || {}, { label: e.target.value, txt: undefined, txtNeg: undefined }); }
        if (f === 'v') { const i = +e.target.dataset.i; const v = parseVal(c.preset, e.target.value); c.items[i] = { v: isFinite(v) ? v : undefined }; }
        save(); lastAnalysis = null; refreshClues(); renderBuilderLight();
      });
      $('#edCats').addEventListener('change', e => {
        const card = e.target.closest('.cat-card'); if (!card) return;
        if (e.target.dataset.f === 'preset') {
          const c = ed.cats[+card.dataset.ci], old = T.PRESETS[c.preset] || {}, nw = T.PRESETS[e.target.value];
          c.preset = e.target.value; delete c.customTpl;
          if ((old.kind === 'ord') !== (nw.kind === 'ord')) c.items = Array.from({ length: ed.N }, (_, i) => nw.kind === 'ord' ? { v: nw.time ? 18 * 60 + 30 * i : i + 1 } : { label: '' });
          if (nw.kind === 'name') c.items.forEach(it => { it.g = it.g || 'm'; });
          ed.clues = ed.clues.filter(cl => !clueValid(cl));
          save(); lastAnalysis = null; render(main);
        }
      });
      $('#edCats').addEventListener('click', e => {
        const card = e.target.closest('.cat-card'); if (!card) return;
        const ci = +card.dataset.ci;
        if (e.target.closest('[data-g]')) { const i = +e.target.closest('[data-g]').dataset.i; const it = ed.cats[ci].items[i] = ed.cats[ci].items[i] || {}; it.g = it.g === 'f' ? 'm' : 'f'; e.target.closest('[data-g]').textContent = it.g === 'f' ? 'F' : 'M'; save(); refreshClues(); }
        if (e.target.closest('[data-del]')) askConfirm('Supprimer cette catégorie et les indices qui l’utilisent ?', 'Supprimer', true).then(ok => {
          if (!ok) return;
          const uses = cl => ['a', 'b', 'c', 'd'].some(k => cl[k] && cl[k][0] === ci) || (cl.l || []).some(r => r[0] === ci) || cl.o === ci;
          ed.clues = ed.clues.filter(c => !c.parts.some(uses)).map(c => Object.assign({}, c, { parts: c.parts.map(cl => {
            const sh = r => r && r[0] > ci ? [r[0] - 1, r[1]] : r;
            const o = Object.assign({}, cl); ['a', 'b', 'c', 'd'].forEach(k => { if (o[k]) o[k] = sh(o[k]); }); if (o.l) o.l = o.l.map(sh); if (o.o != null && o.o > ci) o.o--;
            return o;
          }) }));
          editIdx = null;
          ed.cats.splice(ci, 1); save(); lastAnalysis = null; render(main);
        });
      });
      $('#edAddCat').onclick = () => { ed.cats.push({ name: 'Catégorie ' + (ed.cats.length + 1), preset: 'generic', items: Array.from({ length: ed.N }, () => ({ label: '' })) }); save(); render(main); };
      $('#edClues').addEventListener('click', e => {
        const row = e.target.closest('.clue-ed'); if (!row) return;
        const i = +row.dataset.i;
        if (e.target.closest('[data-edit]') || e.target.closest('.tx')) { editClue(i); return; }
        if (e.target.closest('[data-rm]')) { ed.clues.splice(i, 1); if (editIdx === i) { editIdx = null; draft = { parts: [{ t: 'is' }], text: '', custom: false }; renderBuilder(); } else if (editIdx > i) editIdx--; }
        else if (e.target.closest('[data-up]') && i > 0) ed.clues.splice(i - 1, 0, ed.clues.splice(i, 1)[0]);
        else if (e.target.closest('[data-down]') && i < ed.clues.length - 1) ed.clues.splice(i + 1, 0, ed.clues.splice(i, 1)[0]);
        else return;
        save(); lastAnalysis = null; refreshClues();
      });
      $('#edNew').onclick = () => askConfirm('Repartir d’un integramme vierge ?', 'Nouveau').then(ok => { if (ok) { ed = blank(); ed.clues = []; editIdx = null; save(); lastAnalysis = null; render(main); } });
      $('#edExport').onclick = () => { try { download('integramme.json', JSON.stringify(build(), null, 1)); } catch (e) { toast(e.message); } };
      $('#edImport').onclick = () => {
        const s = sheet(`<p style="margin-top:0;color:var(--ink-2)">Collez un fichier JSON exporté depuis Integramme, ou choisissez un fichier.</p>
          <textarea class="inp" id="impTxt" placeholder='{"cats": [...], "clues": [...]}'></textarea>
          <input type="file" id="impFile" accept=".json,application/json" style="margin-top:10px">`,
          { title: 'Importer', foot: '<button class="btn primary" id="impGo">Importer</button>' });
        $('#impFile', s.el).onchange = e => { const f = e.target.files[0]; if (f) f.text().then(t => { $('#impTxt', s.el).value = t; }); };
        $('#impGo', s.el).onclick = () => {
          try { const p = validatePuzzle(JSON.parse($('#impTxt', s.el).value)); load(p); s.close(); render(main); toast('Integramme importé'); }
          catch (e) { toast('Import impossible : ' + e.message); }
        };
      };
      $('#edAnalyze').onclick = analyze;
    }
    function renderBuilderLight() { /* les libellés ont changé : on régénère le formulaire */ clearTimeout(renderBuilderLight.t); renderBuilderLight.t = setTimeout(renderBuilder, 400); }
    async function analyze() {
      const out = $('#edResult');
      const bad = ed.clues.map((cl, i) => clueValid(cl) ? i + 1 : 0).filter(Boolean);
      if (bad.length) { out.innerHTML = `<div class="verdict ko">${ic('xc')}Indice(s) invalide(s) : ${bad.join(', ')}</div>`; return; }
      let p; try { p = validatePuzzle(build()); } catch (e) { out.innerHTML = `<div class="verdict ko">${ic('xc')}${esc(e.message)}</div>`; return; }
      const dup = p.cats.find(c => new Set(c.items.map(i => i.label)).size !== c.items.length);
      if (dup) { out.innerHTML = `<div class="verdict ko">${ic('xc')}Deux éléments portent le même nom dans « ${esc(dup.name)} ».</div>`; return; }
      out.innerHTML = loadingHTML('Analyse en cours…');
      const res = await Engine.call('analyze', { puzzle: p });
      lastAnalysis = { p, res };
      showAnalysis(lastAnalysis);
    }
    function showAnalysis({ p, res }) {
      const out = $('#edResult'); if (!out) return;
      if (res.count === 0) { out.innerHTML = `<div class="verdict ko">${ic('xc')}<div>Aucune solution : les indices se contredisent.<div style="font-weight:500;font-size:13.5px">Vérifiez chaque indice, ou retirez le dernier ajouté.</div></div></div>`; return; }
      if (res.count > 1) {
        out.innerHTML = `<div class="verdict warn">${ic('alert')}<div>Plusieurs solutions possibles.<div style="font-weight:500;font-size:13.5px">Il manque au moins un indice. Ci-dessous, ce que le raisonnement permet déjà d’établir.</div></div></div><div class="btn-row"><button class="btn" id="edPartial">${ic('eye')}Voir les déductions possibles</button></div>`;
        $('#edPartial').onclick = async () => { const r = await Engine.call('explain', { puzzle: p }); openSolution(p, r, 'ed-partial'); };
        return;
      }
      const ex = res.explain, rating = ex.rating || C.rate(ex), counts = ex.counts;
      const max = Math.max(1, ...counts.slice(1));
      const names = ['', 'Évidentes', 'Simples', 'Avancées', 'Expertes', 'Exhaustives'];
      out.innerHTML = `<div class="verdict ok">${ic('checkc')}<div>Solution unique ✓<div style="font-weight:500;font-size:13.5px">${ex.solved && !counts[5] ? 'Entièrement résoluble par le raisonnement' : 'Nécessite une recherche exhaustive à un moment'}</div></div></div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="lbl">Difficulté estimée</span>${lvBadge(rating || 1)}<span class="badge">${ex.steps.length} étapes</span></div>
        <div class="tech-bars">${[1, 2, 3, 4, 5].map(l => `<div><span>${names[l]}</span><span class="bar"><i class="lv-${Math.min(5, l + (l >= 3 ? 1 : 0))}" style="width:${counts[l] / max * 100}%;--lh:var(--lh)"></i></span><b class="tnum">${counts[l]}</b></div>`).join('')}</div>
        <div class="btn-row"><button class="btn primary" id="edPlay">${ic('play')}Jouer</button><button class="btn" id="edSol">${ic('eye')}Solution expliquée</button><button class="btn" id="edShare">${ic('share')}Partager</button></div>`;
      $$('.tech-bars i', out).forEach(i => { const m = i.className.match(/lv-(\d)/); i.parentElement.classList.add('lv-' + m[1]); });
      const withSol = () => Object.assign({}, p, { sol: res.sols[0], rating, id: 'perso-' + hash(JSON.stringify(p.clues) + JSON.stringify(p.cats)) });
      $('#edPlay').onclick = () => { const q = withSol(); const games = store.get('games', {}); game = games[q.id] ? deserialize(games[q.id]) : newGame(q); explainCache.set(game.id, ex); saveGame(true); location.hash = '#/jouer'; };
      $('#edSol').onclick = () => openSolution(p, ex, 'ed');
      $('#edShare').onclick = () => sharePuzzle(withSol());
    }
    return { render, load, build };
  })();

  /* ============================== Routeur =============================== */
  function currentRoute() { return (location.hash.replace(/^#\/?/, '').split('?')[0]) || ''; }
  function parseQuery() { const q = location.hash.split('?')[1] || ''; const o = {}; q.split('&').forEach(kv => { if (!kv) return; const [k, v] = kv.split('='); o[k] = decodeURIComponent(v || ''); }); return o; }
  function render() {
    hideHint(); Sel.clear();
    let r = currentRoute();
    const main = $('#view');
    if (!r) { r = loadCurrent() ? 'jouer' : 'creer'; history.replaceState(null, '', '#/' + r); }
    $$('[data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === r));
    main.className = 'wrap view-enter';
    void main.offsetWidth;
    window.onresize = null;
    if (r === 'jouer') viewPlay(main, parseQuery());
    if (r !== 'jouer') main.onclick = null;
    if (r === 'jouer') { /* déjà traité */ }
    else if (r === 'creer') viewCreate(main, parseQuery(), !loadCurrent());
    else if (r === 'editeur') Editor.render(main);
    else if (r === 'methode') { main.classList.remove('has-playbar'); window.Method.render(main, { GridView, C, ic }); }
    else viewCreate(main, {}, false);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', render);

  document.addEventListener('keydown', e => {
    if (currentRoute() !== 'jouer' || !game || e.target.closest('input,textarea,select') || $('.viewer') || $('.sheet')) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    else if (e.key === 'h' || e.key === 'H') showHint();
    else if (e.key === 'Escape') hideHint();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(true); });

  /* ----------------------------- Thème & PWA ----------------------------- */
  const themeBtn = $('#themeBtn');
  const paintTheme = () => {
    const t = document.documentElement.getAttribute('data-theme');
    themeBtn.innerHTML = ic(t === 'dark' ? 'sun' : 'moon');
    const meta = document.querySelector('meta[name="theme-color"]:not([media])') || (() => { const m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); return m; })();
    meta.content = t === 'dark' ? '#0d1016' : '#f3efe7';
  };
  themeBtn.onclick = () => {
    const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t); settings.theme = t; saveSettings(); paintTheme();
  };
  paintTheme();

  let deferredPrompt = null;
  const installBtn = $('#installBtn');
  installBtn.innerHTML = ic('install');
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; installBtn.classList.remove('hidden'); });
  installBtn.onclick = async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; installBtn.classList.add('hidden'); };
  window.addEventListener('appinstalled', () => { installBtn.classList.add('hidden'); toast('Integramme est installé 🎉'); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
  }

  render();
})();
