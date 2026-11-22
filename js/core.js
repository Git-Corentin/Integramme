/* =========================================================================
   Integramme — moteur logique
   Modèle de grille, phrases en français, règles de déduction (niveaux 1 à 5),
   solveur expliqué, recherche exhaustive et descriptions en mots.
   Fonctionne dans la page comme dans un Web Worker (aucune dépendance).
   ========================================================================= */
(function (G) {
  'use strict';

  /* ---------------------------------------------------------------------
     Format d'un puzzle
     {
       title, intro, entity: 'personne',
       cats: [{ name, kind: 'name'|'attr'|'ord',
                items: [{ label, txt?, g?: 'f'|'m', v?: number }],
                tpl: { pred, neg, ref, refG, lt, gt, dlt, dgt, dist },
                k: { one, many } | { time: true } }],
       clues: [{ t:'is'|'not', a, b } | { t:'either', a, b, c }
               | { t:'pair', a, b, c, d } | { t:'lt', a, b, o, s }
               | { t:'diff', a, b, o, k, s } | { t:'dist', a, b, o, k }
               | { t:'alldiff', l:[...] }],
       sol?: [[...]]   // sol[c][e] = index de l'élément de la catégorie c pour l'entité e
     }
     Les éléments sont désignés par un index global g = c * N + i.
     --------------------------------------------------------------------- */

  function compile(p) {
    const K = p.cats.length, N = p.cats[0].items.length, M = K * N;
    const vals = p.cats.map(c => c.kind === 'ord' ? c.items.map(it => +it.v) : null);
    const P = { p, K, N, M, vals, ent: p.entity || 'personne' };
    P.atoms = [];
    (p.clues || []).forEach((cl, ci) => partsOf(P, cl).forEach(a => P.atoms.push({ cl: a, ci })));
    return P;
  }

  // Un indice peut regrouper plusieurs contraintes (« atomes »)
  function partsOf(P, cl) {
    const list = cl.t === 'multi' ? (cl.parts || []) : [cl];
    const out = [];
    list.forEach(a => {
      if (a.t === 'multi') out.push(...partsOf(P, a));
      else if (a.t === 'gender') out.push(genderAtom(P, a));
      else out.push(a);
    });
    return out;
  }
  // « X est une femme » = X n'est aucun des prénoms masculins
  function genderAtom(P, a) {
    const l = [];
    P.p.cats.forEach((c, ci) => { if (c.kind === 'name') c.items.forEach((it, i) => { if ((it.g || 'm') !== a.g) l.push(ci * P.N + i); }); });
    return { t: 'none', a: a.a, l, fromGender: a.g };
  }

  const catOf = (P, g) => (g / P.N) | 0;
  const idxOf = (P, g) => g % P.N;
  const itemOf = (P, g) => P.p.cats[catOf(P, g)].items[idxOf(P, g)];
  const labelOf = (P, g) => itemOf(P, g).label;

  /* ============================ Phrases ============================== */

  function fill(t, o) { return String(t || '').replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? o[k] : '')); }

  function fr(s) {
    s = s.replace(/(^|[\s(«])de le\b/g, '$1du').replace(/(^|[\s(«])de les\b/g, '$1des')
         .replace(/(^|[\s(«])à le\b/g, '$1au').replace(/(^|[\s(«])à les\b/g, '$1aux')
         .replace(/(^|[\s(«])(qu|d|l|n|j|s)e\s+(?=[aeiouyéèêëàâîïôûAEIOUYÉÈÊÀÂÎÏÔÛH])/g, '$1$2’')
         .replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function fmtK(cat, k) {
    const u = cat.k || {};
    if (u.time) {
      const h = Math.floor(k / 60), m = k % 60;
      if (!h) return k + (k > 1 ? ' minutes' : ' minute');
      if (!m) return h + (h > 1 ? ' heures' : ' heure');
      return h + ' h ' + String(m).padStart(2, '0');
    }
    const n = Math.abs(k) >= 10000 || (u.one === '€' && Math.abs(k) >= 1000) ? String(k).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') : String(k);
    if (u.one) return n + ' ' + (k === 1 ? u.one : (u.many || u.one + 's'));
    return n;
  }

  function txtOf(P, g) { const it = itemOf(P, g); return it.txt || it.label; }
  function genderOf(P, g) {
    const c = P.p.cats[catOf(P, g)];
    if (c.kind === 'name') return itemOf(P, g).g || 'm';
    return (c.tpl && c.tpl.refG) || 'f';
  }
  function refOf(P, g) {
    const c = P.p.cats[catOf(P, g)];
    if (c.kind === 'name') return itemOf(P, g).label;
    return fill(c.tpl.ref, { x: txtOf(P, g) });
  }
  function predOf(P, g, gen, neg) {
    const c = P.p.cats[catOf(P, g)];
    const t = neg ? c.tpl.neg : c.tpl.pred;
    const it = itemOf(P, g);
    return fill(t, { x: txtOf(P, g), xn: it.txtNeg || txtOf(P, g), e: gen === 'f' ? 'e' : '' });
  }
  const isName = (P, g) => P.p.cats[catOf(P, g)].kind === 'name';
  const NUM = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit'];

  // préposition répétée dans les énumérations (« à Lyon ou à Nice »)
  function prepOf(t) {
    const before = (String(t).split('{x}')[0].trim().split(/\s+/).pop() || '').toLowerCase();
    return ['à', 'au', 'aux', 'de', 'du', 'des', 'dans', 'pour', 'sur', 'depuis', 'en', 'avec', 'chez'].includes(before) ? before + ' ' : '';
  }
  // liste d'éléments d'une même catégorie dans un prédicat : « habite à Lyon, à Nice ou à Paris »
  function predList(P, l, gen, neg, sep) {
    const c = P.p.cats[catOf(P, l[0])];
    if (neg && l.length > 1) {
      // « n'habite ni à Lyon ni à Nice », « n'avait ni la corde ni la canne »
      const m = c.tpl.neg.match(/^(.*?)\bpas\s+((?:à|au|aux|de|du|des|dans|pour|sur|depuis|en|avec|chez)\s+)?\{xn?\}(.*)$/);
      if (m) {
        const mid = m[2] || '';
        return fill(m[1] + l.map(g => 'ni ' + mid + txtOf(P, g)).join(' ') + m[3], { e: gen === 'f' ? 'e' : '' });
      }
    }
    const t = neg ? c.tpl.neg : c.tpl.pred, prep = prepOf(t);
    const xs = l.slice().sort((x, y) => P.vals[catOf(P, x)] ? P.vals[catOf(P, x)][idxOf(P, x)] - P.vals[catOf(P, y)][idxOf(P, y)] : 0)
      .map((g, i) => (i ? prep : '') + (neg ? (itemOf(P, g).txtNeg || txtOf(P, g)) : txtOf(P, g)));
    const x = xs.length > 1 ? xs.slice(0, -1).join(', ') + sep + xs[xs.length - 1] : xs[0];
    return fill(t, { x, xn: x, e: gen === 'f' ? 'e' : '' });
  }
  function joinAnd(list) { return list.length > 1 ? list.slice(0, -1).join(', ') + ' et ' + list[list.length - 1] : list[0] || ''; }
  // Partie « prédicat » d'une contrainte portant sur un sujet donné (pour fusionner les indices)
  function predicateFor(P, part, subj) {
    const g = genderOf(P, subj);
    const other = (x, y) => x === subj ? y : y === subj ? x : null;
    if (part.t === 'is' || part.t === 'not') { const o = other(part.a, part.b); if (o == null) return null; return predOf(P, o, g, part.t === 'not'); }
    if (part.t === 'gender' && part.a === subj) return 'est ' + (part.g === 'f' ? 'une femme' : 'un homme');
    if ((part.t === 'none' || part.t === 'oneof') && part.a === subj) {
      const sameCat = part.l.every(x => catOf(P, x) === catOf(P, part.l[0]));
      if (part.t === 'oneof' && sameCat) return predList(P, part.l, g, false, ' ou ');
      if (part.t === 'none' && sameCat) return predList(P, part.l, g, true, ' ni ');
      if (part.t === 'none') return joinAnd(part.l.map(x => predOf(P, x, g, true)));
    }
    return null;
  }

  function clueText(P, cl) {
    if (cl.text && String(cl.text).trim()) return String(cl.text).trim();
    let a = cl.a, b = cl.b;
    switch (cl.t) {
      case 'multi': {
        const parts = cl.parts || [];
        // sujet commun ?
        const cand = new Set();
        parts.forEach(x => ['a', 'b'].forEach(k => { if (x[k] != null) cand.add(x[k]); }));
        let best = null;
        for (const sj of cand) {
          const preds = parts.map(x => predicateFor(P, x, sj));
          if (preds.every(Boolean) && (!best || (isName(P, sj) && !isName(P, best.sj)))) best = { sj, preds };
        }
        if (best) return fr(refOf(P, best.sj) + ' ' + joinAnd(best.preds) + '.');
        return parts.map(x => clueText(P, x)).join(' ');
      }
      case 'gender': return fr(refOf(P, a) + ' est ' + (cl.g === 'f' ? 'une femme' : 'un homme') + '.');
      case 'none': case 'oneof': {
        if (cl.t === 'oneof' && !isName(P, a) && cl.l.every(x => isName(P, x)))
          return fr(cl.l.map(x => refOf(P, x)).join(cl.l.length > 2 ? ', ' : ' ou ').replace(/, ([^,]*)$/, ' ou $1') + ' ' + predOf(P, a, 'm') + '.');
        const p = predicateFor(P, cl, a);
        if (p) return fr(refOf(P, a) + ' ' + p + '.');
        return fr(refOf(P, a) + ' correspond à l’un de ces éléments : ' + cl.l.map(x => labelOf(P, x)).join(', ') + '.');
      }
      case 'cond':
        return fr('Si ' + refOf(P, a) + ' ' + predOf(P, b, genderOf(P, a)) + ', alors ' + refOf(P, cl.c) + ' ' + predOf(P, cl.d, genderOf(P, cl.c)) + '.');
      case 'is': case 'not': {
        if (isName(P, b) && !isName(P, a)) { const t = a; a = b; b = t; }
        return fr(refOf(P, a) + ' ' + predOf(P, b, genderOf(P, a), cl.t === 'not') + '.');
      }
      case 'either': {
        const g = genderOf(P, a), same = catOf(P, cl.b) === catOf(P, cl.c);
        if (same && isName(P, cl.b) && !isName(P, a)) return fr(refOf(P, cl.b) + ' ou ' + refOf(P, cl.c) + ' ' + predOf(P, a, 'm') + '.');
        if (same) return fr(refOf(P, a) + ' ' + predList(P, [cl.b, cl.c], g, false, ' ou ') + '.');
        return fr(refOf(P, a) + ' ' + predOf(P, cl.b, g) + ' ou ' + predOf(P, cl.c, g) + ', mais pas les deux.');
      }
      case 'pair': {
        const g = (genderOf(P, a) === 'f' && genderOf(P, b) === 'f') ? 'f' : 'm';
        const e = g === 'f' ? 'e' : '';
        return fr('Parmi ' + refOf(P, a) + ' et ' + refOf(P, b) + ", l’un" + e + ' ' + predOf(P, cl.c, g) + ' et l’autre ' + predOf(P, cl.d, g) + '.');
      }
      case 'lt': {
        const t = P.p.cats[cl.o].tpl;
        if (cl.s) return fr(fill(t.gt, { a: refOf(P, b), b: refOf(P, a), e: genderOf(P, b) === 'f' ? 'e' : '' }) + '.');
        return fr(fill(t.lt, { a: refOf(P, a), b: refOf(P, b), e: genderOf(P, a) === 'f' ? 'e' : '' }) + '.');
      }
      case 'diff': {
        const c = P.p.cats[cl.o], t = c.tpl, k = fmtK(c, cl.k);
        if (cl.s) return fr(fill(t.dgt, { a: refOf(P, b), b: refOf(P, a), k, e: genderOf(P, b) === 'f' ? 'e' : '' }) + '.');
        return fr(fill(t.dlt, { a: refOf(P, a), b: refOf(P, b), k, e: genderOf(P, a) === 'f' ? 'e' : '' }) + '.');
      }
      case 'dist': {
        const c = P.p.cats[cl.o], k = fmtK(c, cl.k);
        const p = (genderOf(P, a) === 'f' && genderOf(P, b) === 'f') ? 'es' : 's';
        return fr(fill(c.tpl.dist, { a: refOf(P, a), b: refOf(P, b), k, p, e: p === 'es' ? 'e' : '' }) + '.');
      }
      case 'alldiff': {
        const r = cl.l.map(g => refOf(P, g));
        const last = r.pop();
        const allF = cl.l.every(g => genderOf(P, g) === 'f');
        return fr(r.join(', ') + ' et ' + last + ' sont ' + (NUM[cl.l.length] || cl.l.length) + ' ' + P.ent + 's différent' + (P.ent === 'personne' || allF ? 'es' : 's') + '.');
      }
    }
    return '?';
  }

  /* ============================ État ================================= */
  // Matrice M×M symétrique : 0 inconnu, 1 oui (●), -1 non (✕).

  class State {
    constructor(P, m) { this.P = P; this.m = m || new Int8Array(P.M * P.M); this.bad = null; }
    clone() { const s = new State(this.P, this.m.slice()); s.bad = this.bad; return s; }
    get(a, b) {
      if (a === b) return 1;
      const N = this.P.N;
      if (((a / N) | 0) === ((b / N) | 0)) return -1;
      return this.m[a * this.P.M + b];
    }
    set(a, b, v) {
      if (this.bad) return false;
      if (a === b) { if (v < 0) this.bad = { k: 'self', a, b }; return false; }
      const N = this.P.N, M = this.P.M;
      if (((a / N) | 0) === ((b / N) | 0)) { if (v > 0) this.bad = { k: 'conflict', a, b }; return false; }
      const cur = this.m[a * M + b];
      if (cur === v) return false;
      if (cur !== 0) { this.bad = { k: 'conflict', a, b }; return false; }
      this.m[a * M + b] = v; this.m[b * M + a] = v;
      return true;
    }
  }

  function cands(S, x, c) {
    const P = S.P, N = P.N, M = P.M;
    if (((x / N) | 0) === c) return [x];
    const out = [];
    for (let i = 0; i < N; i++) { const y = c * N + i; if (S.m[x * M + y] !== -1) out.push(y); }
    return out;
  }
  function candCount(S, x, c) {
    const P = S.P, N = P.N, M = P.M;
    if (((x / N) | 0) === c) return 1;
    let n = 0;
    for (let i = 0; i < N; i++) if (S.m[x * M + c * N + i] !== -1) n++;
    return n;
  }
  function checkEmpty(S) {
    if (S.bad) return;
    const P = S.P;
    for (let x = 0; x < P.M; x++) {
      const cx = (x / P.N) | 0;
      for (let c = 0; c < P.K; c++) {
        if (c === cx) continue;
        if (candCount(S, x, c) === 0) { S.bad = { k: 'empty', x, c }; return; }
      }
    }
  }
  function isSolved(S) {
    const P = S.P, N = P.N, M = P.M;
    for (let a = 0; a < M; a++) {
      const ca = (a / N) | 0;
      for (let b = (ca + 1) * N; b < M; b++) if (S.m[a * M + b] === 0) return false;
    }
    return true;
  }
  function unknownCount(S) {
    const P = S.P, N = P.N, M = P.M; let n = 0;
    for (let a = 0; a < M; a++) { const ca = (a / N) | 0; for (let b = (ca + 1) * N; b < M; b++) if (S.m[a * M + b] === 0) n++; }
    return n;
  }
  function applyStep(S, st) {
    for (const [a, b, v] of st.ch) { S.set(a, b, v); if (S.bad) return; }
    checkEmpty(S);
  }

  /* ========================= Règles ================================== */

  function clueDirect(P, cl) {
    const out = [];
    const diffCat = (x, y) => catOf(P, x) !== catOf(P, y);
    switch (cl.t) {
      case 'is': out.push([cl.a, cl.b, 1]); break;
      case 'not': out.push([cl.a, cl.b, -1]); break;
      case 'alldiff':
        for (let i = 0; i < cl.l.length; i++) for (let j = i + 1; j < cl.l.length; j++)
          if (diffCat(cl.l[i], cl.l[j])) out.push([cl.l[i], cl.l[j], -1]);
        break;
      case 'either': if (diffCat(cl.b, cl.c)) out.push([cl.b, cl.c, -1]); break;
      case 'pair':
        if (diffCat(cl.a, cl.b)) out.push([cl.a, cl.b, -1]);
        if (diffCat(cl.c, cl.d)) out.push([cl.c, cl.d, -1]);
        break;
      case 'lt': case 'diff': case 'dist':
        if (diffCat(cl.a, cl.b)) out.push([cl.a, cl.b, -1]);
        break;
      case 'none':
        cl.l.forEach(g => { if (diffCat(cl.a, g)) out.push([cl.a, g, -1]); });
        break;
      case 'oneof': {
        const c = catOf(P, cl.l[0]);
        if (cl.l.every(g => catOf(P, g) === c) && c !== catOf(P, cl.a))
          for (let i = 0; i < P.N; i++) { const y = c * P.N + i; if (!cl.l.includes(y)) out.push([cl.a, y, -1]); }
        break;
      }
    }
    return out;
  }

  function cmpOk(cl, x, y) { // x = valeur de a, y = valeur de b
    if (cl.t === 'lt') return x < y;
    if (cl.t === 'diff') return y - x === cl.k;
    return Math.abs(y - x) === cl.k;
  }

  const R = {};

  // Niveau 1 — lecture directe des indices
  R.clue = function (S, emit) {
    const P = S.P, cl = P.atoms;
    for (let i = 0; i < cl.length; i++) {
      const imp = clueDirect(P, cl[i].cl).filter(([a, b, v]) => S.get(a, b) !== v);
      if (imp.length && emit({ r: 'clue', lv: 1, ci: P.atoms[i].ci, ai: i, ch: imp })) return true;
    }
    return false;
  };

  // Niveau 1 — un ● exclut le reste de la ligne et de la colonne
  R.elim = function (S, emit) {
    const P = S.P, N = P.N, M = P.M, m = S.m;
    for (let a = 0; a < M; a++) {
      const ca = (a / N) | 0;
      for (let b = (ca + 1) * N; b < M; b++) {
        if (m[a * M + b] !== 1) continue;
        const cb = (b / N) | 0, ch = [];
        for (let i = 0; i < N; i++) {
          const a2 = ca * N + i; if (a2 !== a && m[a2 * M + b] !== -1) ch.push([a2, b, -1]);
          const b2 = cb * N + i; if (b2 !== b && m[a * M + b2] !== -1) ch.push([a, b2, -1]);
        }
        if (ch.length && emit({ r: 'elim', lv: 1, a, b, ch })) return true;
      }
    }
    return false;
  };

  // Niveau 1 — il ne reste qu'une case possible
  R.single = function (S, emit) {
    const P = S.P, N = P.N, M = P.M;
    for (let x = 0; x < M; x++) {
      const cx = (x / N) | 0;
      for (let c = 0; c < P.K; c++) {
        if (c === cx) continue;
        let n = 0, y = -1;
        for (let i = 0; i < N; i++) { const z = c * N + i; if (S.m[x * M + z] !== -1) { n++; y = z; } }
        if (n === 0) { S.bad = { k: 'empty', x, c }; return true; }
        if (n === 1 && S.m[x * M + y] === 0 && emit({ r: 'single', lv: 1, x, c, y, ch: [[x, y, 1]] })) return true;
      }
    }
    return false;
  };

  // Niveau 2 — transitivité : a = b, donc a hérite de tout ce que l'on sait de b
  R.trans = function (S, emit) {
    const P = S.P, N = P.N, M = P.M, m = S.m;
    for (let a = 0; a < M; a++) {
      const ca = (a / N) | 0;
      for (let b = (ca + 1) * N; b < M; b++) {
        if (m[a * M + b] !== 1) continue;
        const cb = (b / N) | 0, ch = [];
        for (let c = 0; c < M; c++) {
          const cc = (c / N) | 0; if (cc === ca || cc === cb) continue;
          const va = m[a * M + c], vb = m[b * M + c];
          if (vb !== 0 && va !== vb) ch.push([a, c, vb]);
          else if (va !== 0 && vb === 0) ch.push([b, c, va]);
        }
        if (ch.length && emit({ r: 'trans', lv: 2, a, b, ch })) return true;
      }
    }
    return false;
  };

  // Niveau 2 — logique propre à chaque indice (soit/soit, l'un/l'autre, comparaisons)
  R.clue2 = function (S, emit) {
    const P = S.P, clues = P.atoms;
    for (let i = 0; i < clues.length; i++) {
      const cl = clues[i].cl;
      if (cl.t === 'cond') {
        // Si a = b alors c = d (et sa contraposée)
        const p1 = S.get(cl.a, cl.b), q1 = S.get(cl.c, cl.d);
        let ch = null, why = null;
        if (p1 === 1 && q1 !== 1) { ch = [[cl.c, cl.d, 1]]; why = 'mp'; }
        else if (q1 === -1 && p1 !== -1) { ch = [[cl.a, cl.b, -1]]; why = 'mt'; }
        if (ch && emit({ r: 'cond', lv: 2, ci: P.atoms[i].ci, ai: i, why, ch })) return true;
      } else if (cl.t === 'either') {
        const gb = S.get(cl.a, cl.b), gc = S.get(cl.a, cl.c);
        let ch = null, why = null;
        if (gb === -1 && gc !== 1) { ch = [[cl.a, cl.c, 1]]; why = 'bNo'; }
        else if (gc === -1 && gb !== 1) { ch = [[cl.a, cl.b, 1]]; why = 'cNo'; }
        else if (gb === 1 && gc !== -1) { ch = [[cl.a, cl.c, -1]]; why = 'bYes'; }
        else if (gc === 1 && gb !== -1) { ch = [[cl.a, cl.b, -1]]; why = 'cYes'; }
        if (ch && emit({ r: 'either', lv: 2, ci: P.atoms[i].ci, ai: i, why, ch })) return true;
      } else if (cl.t === 'pair') {
        const { a, b, c, d } = cl;
        const evA = S.get(a, c) === 1 || S.get(b, d) === 1 || S.get(a, d) === -1 || S.get(b, c) === -1;
        const evB = S.get(a, d) === 1 || S.get(b, c) === 1 || S.get(a, c) === -1 || S.get(b, d) === -1;
        let want = null;
        if (evA) want = [[a, c, 1], [b, d, 1], [a, d, -1], [b, c, -1]];
        else if (evB) want = [[a, d, 1], [b, c, 1], [a, c, -1], [b, d, -1]];
        if (want) {
          const ch = want.filter(([x, y, v]) => S.get(x, y) !== v);
          if (ch.length && emit({ r: 'pair', lv: 2, ci: P.atoms[i].ci, ai: i, cfg: evA ? 'A' : 'B', ch })) return true;
        }
      } else if (cl.t === 'lt' || cl.t === 'diff' || cl.t === 'dist') {
        const o = cl.o, V = P.vals[o];
        const va = cands(S, cl.a, o).map(g => idxOf(P, g)), vb = cands(S, cl.b, o).map(g => idxOf(P, g));
        const ra = va.filter(i => !vb.some(j => j !== i && cmpOk(cl, V[i], V[j])));
        const rb = vb.filter(j => !va.some(i => i !== j && cmpOk(cl, V[i], V[j])));
        if (ra.length || rb.length) {
          const ch = ra.map(i => [cl.a, o * P.N + i, -1]).concat(rb.map(j => [cl.b, o * P.N + j, -1]));
          if (emit({ r: 'cmp', lv: 2, ci: P.atoms[i].ci, ai: i, va, vb, ra, rb, ch })) return true;
        }
      }
    }
    return false;
  };

  // Niveau 3 — élimination croisée : a et c n'ont aucun candidat commun dans une 3e catégorie
  R.cross = function (S, emit) {
    const P = S.P, N = P.N, M = P.M, K = P.K, m = S.m;
    for (let a = 0; a < M; a++) {
      const ca = (a / N) | 0;
      for (let c = (ca + 1) * N; c < M; c++) {
        if (m[a * M + c] !== 0) continue;
        const cc = (c / N) | 0;
        for (let B = 0; B < K; B++) {
          if (B === ca || B === cc) continue;
          let ok = false;
          for (let i = 0; i < N && !ok; i++) { const b = B * N + i; if (m[a * M + b] !== -1 && m[b * M + c] !== -1) ok = true; }
          if (!ok) {
            const ca1 = cands(S, a, B), cc1 = cands(S, c, B);
            // on présente le côté qui a le moins de candidats (explication plus simple)
            const st = ca1.length <= cc1.length
              ? { r: 'cross', lv: 3, x: a, y: c, B, cs: ca1, ch: [[a, c, -1]] }
              : { r: 'cross', lv: 3, x: c, y: a, B, cs: cc1, ch: [[a, c, -1]] };
            if (emit(st)) return true;
            break;
          }
        }
      }
    }
    return false;
  };

  // Niveau 3 — conséquences indirectes des indices « soit/soit » et « l'un/l'autre »
  R.clue3 = function (S, emit) {
    const P = S.P, clues = P.atoms, M = P.M;
    for (let i = 0; i < clues.length; i++) {
      const cl = clues[i].cl;
      let groups = null;
      if (cl.t === 'either') groups = [[cl.a, cl.b, cl.c]];
      else if (cl.t === 'pair') groups = [[cl.a, cl.c, cl.d], [cl.b, cl.c, cl.d], [cl.c, cl.a, cl.b], [cl.d, cl.a, cl.b]];
      if (!groups) continue;
      const ch = [], items = [];
      for (const [x, o1, o2] of groups) {
        const cx = catOf(P, x);
        for (let w = 0; w < M; w++) {
          if (catOf(P, w) === cx || S.get(x, w) !== 0) continue;
          if (S.get(w, o1) === -1 && S.get(w, o2) === -1) {
            if (!ch.some(([p, q]) => (p === x && q === w) || (p === w && q === x))) { ch.push([x, w, -1]); items.push({ x, o: [o1, o2], w }); }
          }
        }
      }
      if (ch.length && emit({ r: 'clue3', lv: 3, ci: P.atoms[i].ci, ai: i, items, ch })) return true;
    }
    return false;
  };

  // Niveau 3 — sous-ensembles (paires, triplets « réservés »)
  R.subset = function (S, emit) {
    const P = S.P, N = P.N, K = P.K;
    for (let A = 0; A < K; A++) for (let B = 0; B < K; B++) {
      if (A === B) continue;
      const rows = [];
      for (let i = 0; i < N; i++) { const x = A * N + i, cs = cands(S, x, B); if (cs.length >= 2) rows.push({ x, cs }); }
      const n = rows.length;
      if (n < 3) continue;
      for (let mask = 1; mask < (1 << n); mask++) {
        let k = 0; for (let t = mask; t; t &= t - 1) k++;
        if (k < 2 || k > n - 1) continue;
        const U = new Set(), Sx = [];
        rows.forEach((r, j) => { if (mask & (1 << j)) { Sx.push(r.x); r.cs.forEach(y => U.add(y)); } });
        if (U.size !== k) continue;
        const ch = [];
        for (let i = 0; i < N; i++) {
          const x = A * N + i; if (Sx.includes(x)) continue;
          for (const y of U) if (S.get(x, y) !== -1) ch.push([x, y, -1]);
        }
        if (ch.length && emit({ r: 'subset', lv: 3, A, B, S: Sx, U: [...U].sort((p, q) => p - q), ch })) return true;
      }
    }
    return false;
  };

  /* -------- Propagation rapide (sans texte) et pas-à-pas ---------------- */

  const BASIC = [
    { id: 'clue', lv: 1, fn: R.clue }, { id: 'elim', lv: 1, fn: R.elim }, { id: 'single', lv: 1, fn: R.single },
    { id: 'trans', lv: 2, fn: R.trans }, { id: 'clue2', lv: 2, fn: R.clue2 },
    { id: 'cross', lv: 3, fn: R.cross }, { id: 'clue3', lv: 3, fn: R.clue3 }, { id: 'subset', lv: 3, fn: R.subset },
  ];

  function propagate(S, maxLv, cap) {
    maxLv = maxLv || 3; cap = cap || Infinity;
    const rules = BASIC.filter(r => r.lv <= maxLv);
    let n = 0, progress = true;
    while (progress && !S.bad && n < cap) {
      progress = false;
      for (const r of rules) {
        r.fn(S, st => { applyStep(S, st); n++; progress = true; return !!S.bad || n >= cap; });
        if (S.bad || n >= cap) return n;
        if (progress) break;
      }
    }
    return n;
  }

  // Niveau 4 — raisonnement par l'absurde (hypothèse → contradiction)
  R.hypo = function (S, emit) {
    const P = S.P, N = P.N, M = P.M;
    const groups = {};
    for (let a = 0; a < M; a++) {
      const ca = (a / N) | 0;
      for (let b = (ca + 1) * N; b < M; b++) {
        if (S.m[a * M + b] !== 0) continue;
        const k = Math.min(candCount(S, a, (b / N) | 0), candCount(S, b, ca));
        (groups[k] = groups[k] || []).push([a, b]);
      }
    }
    let best = null, bestN = Infinity;
    for (const k of Object.keys(groups).map(Number).sort((x, y) => x - y)) {
      for (const [a, b] of groups[k]) {
        const T = S.clone(); T.set(a, b, 1); checkEmpty(T);
        const n = T.bad ? 0 : propagate(T, 3, bestN);
        if (T.bad && n < bestN) { best = [a, b]; bestN = n; if (n <= 3) break; }
      }
      if (best) break;
    }
    if (best) return emit({ r: 'hypo', lv: 4, a: best[0], b: best[1], n: bestN, ch: [[best[0], best[1], -1]] });
    return false;
  };

  // Niveau 4 — disjonction de cas : deux options, mêmes conséquences
  R.disj = function (S, emit) {
    const P = S.P, N = P.N, M = P.M, K = P.K;
    let best = null;
    for (let x = 0; x < M; x++) {
      const cx = (x / N) | 0;
      for (let c = cx + 1; c < K; c++) {
        const cs = cands(S, x, c);
        if (cs.length !== 2) continue;
        const T1 = S.clone(); T1.set(x, cs[0], 1); propagate(T1, 3);
        const T2 = S.clone(); T2.set(x, cs[1], 1); propagate(T2, 3);
        if (T1.bad || T2.bad) continue;
        const ch = [];
        for (let a = 0; a < M; a++) {
          const ca = (a / N) | 0;
          for (let b = (ca + 1) * N; b < M; b++) {
            const i = a * M + b;
            if (S.m[i] === 0 && T1.m[i] !== 0 && T1.m[i] === T2.m[i]) ch.push([a, b, T1.m[i]]);
          }
        }
        if (ch.length && (!best || ch.length > best.ch.length)) best = { r: 'disj', lv: 4, x, c, ys: cs, ch };
      }
    }
    if (best) {
      // on garde la conclusion la plus « parlante » en priorité (● d'abord)
      best.ch.sort((p, q) => q[2] - p[2]);
      return emit(best);
    }
    return false;
  };

  // Niveau 5 — recherche exhaustive (dernier recours)
  R.brute = function (S, emit) {
    const sols = search(S.clone(), 2);
    if (sols.length !== 1) return false;
    const T = sols[0], P = S.P, N = P.N, M = P.M, ch = [];
    for (let a = 0; a < M; a++) { const ca = (a / N) | 0; for (let b = (ca + 1) * N; b < M; b++) if (S.m[a * M + b] === 0) ch.push([a, b, T.m[a * M + b]]); }
    return ch.length ? emit({ r: 'brute', lv: 5, ch }) : false;
  };

  const ALL = BASIC.concat([
    { id: 'hypo', lv: 4, fn: R.hypo }, { id: 'disj', lv: 4, fn: R.disj }, { id: 'brute', lv: 5, fn: R.brute },
  ]);

  function nextStep(S, maxLv) {
    maxLv = maxLv || 5;
    if (S.bad) return null;
    for (const r of ALL) {
      if (r.lv > maxLv) break;
      let found = null;
      r.fn(S, st => { found = st; return true; });
      if (found) return found;
      if (S.bad) return null;
    }
    return null;
  }

  // Chaîne de déductions détaillée (pour expliquer une hypothèse)
  function chain(S, maxLv, cap) {
    cap = cap || 120;
    const steps = [];
    while (!S.bad && steps.length < cap) {
      const st = nextStep(S, maxLv || 3);
      if (!st) break;
      applyStep(S, st); steps.push(st);
    }
    return { steps, bad: S.bad };
  }

  const ckey = (P, a, b) => a < b ? a * P.M + b : b * P.M + a;

  // Cellules dont dépend une étape (pour ne garder que les étapes utiles)
  function reasonCells(P, st) {
    const out = [], N = P.N;
    const add = (a, b) => { if (a !== b && catOf(P, a) !== catOf(P, b)) out.push(ckey(P, a, b)); };
    const row = (x, c) => { for (let i = 0; i < N; i++) add(x, c * N + i); };
    const cl = st.ai != null ? P.atoms[st.ai].cl : null;
    switch (st.r) {
      case 'cond': add(cl.a, cl.b); add(cl.c, cl.d); break;
      case 'elim': add(st.a, st.b); break;
      case 'single': row(st.x, st.c); break;
      case 'trans': add(st.a, st.b); st.ch.forEach(([x, c]) => add(x === st.a ? st.b : st.a, c)); break;
      case 'either': add(cl.a, cl.b); add(cl.a, cl.c); break;
      case 'pair': add(cl.a, cl.c); add(cl.a, cl.d); add(cl.b, cl.c); add(cl.b, cl.d); break;
      case 'cmp': row(cl.a, cl.o); row(cl.b, cl.o); break;
      case 'cross': for (let i = 0; i < N; i++) { const b = st.B * N + i; add(st.x, b); add(b, st.y); } break;
      case 'clue3': st.items.forEach(it => { add(it.w, it.o[0]); add(it.w, it.o[1]); }); break;
      case 'subset': st.S.forEach(x => row(x, st.B)); break;
    }
    return out;
  }

  function prune(P, steps, targets, forcedLast) {
    const need = new Set(targets), keep = [];
    let list = steps;
    if (forcedLast && steps.length) {
      const last = steps[steps.length - 1];
      keep.push(last);
      reasonCells(P, last).forEach(k => need.add(k));
      list = steps.slice(0, -1);
    }
    for (let i = list.length - 1; i >= 0; i--) {
      const st = list[i];
      const hit = st.ch.filter(([a, b]) => need.has(ckey(P, a, b)));
      if (!hit.length) continue;
      keep.unshift(Object.assign({}, st, { ch: hit }));
      hit.forEach(([a, b]) => need.delete(ckey(P, a, b)));
      reasonCells(P, st).forEach(k => need.add(k));
    }
    return keep;
  }

  function badCells(P, bad) {
    if (!bad) return [];
    if (bad.k === 'empty') { const r = []; for (let i = 0; i < P.N; i++) { const y = bad.c * P.N + i; if (y !== bad.x) r.push(ckey(P, bad.x, y)); } return r; }
    if (bad.k === 'conflict' && bad.a !== bad.b && catOf(P, bad.a) !== catOf(P, bad.b)) return [ckey(P, bad.a, bad.b)];
    return [];
  }

  function enrich(S, st) {
    const P = S.P;
    if (st.r === 'hypo') {
      const T = S.clone(); T.set(st.a, st.b, 1); checkEmpty(T);
      const c = T.bad ? { steps: [], bad: T.bad } : chain(T, 3, 400);
      st.bad = c.bad;
      st.full = c.steps.length;
      st.chain = prune(P, c.steps, badCells(P, c.bad), c.bad && c.bad.k === 'conflict');
    } else if (st.r === 'disj') {
      const targets = st.ch.map(([a, b]) => ckey(P, a, b));
      st.branches = st.ys.map(y => {
        const T = S.clone(); T.set(st.x, y, 1);
        const need = new Set(targets), steps = [];
        while (!T.bad && need.size && steps.length < 400) {
          const s2 = nextStep(T, 3); if (!s2) break;
          applyStep(T, s2); steps.push(s2);
          s2.ch.forEach(([a, b]) => need.delete(ckey(P, a, b)));
        }
        return prune(P, steps, targets, false);
      });
    }
    return st;
  }

  /* ========================= Vérification ============================ */

  function solutionOf(S) {
    const P = S.P, N = P.N, K = P.K;
    const sol = [];
    for (let c = 0; c < K; c++) {
      sol.push([]);
      for (let e = 0; e < N; e++) {
        if (c === 0) { sol[0].push(e); continue; }
        let f = -1, n = 0;
        for (let i = 0; i < N; i++) if (S.get(e, c * N + i) === 1) { f = i; n++; }
        if (n !== 1) return null;
        sol[c].push(f);
      }
    }
    return sol;
  }

  function entityMap(P, sol) { // g -> entité
    const ent = new Array(P.M);
    for (let c = 0; c < P.K; c++) for (let e = 0; e < P.N; e++) ent[c * P.N + sol[c][e]] = e;
    return ent;
  }

  function evalClue(P, cl, sol, ent) {
    ent = ent || entityMap(P, sol);
    const E = g => ent[g];
    const val = (g, o) => P.vals[o][sol[o][E(g)]];
    switch (cl.t) {
      case 'multi': return cl.parts.every(x => evalClue(P, x, sol, ent));
      case 'gender': return evalClue(P, genderAtom(P, cl), sol, ent);
      case 'none': return cl.l.every(g => E(g) !== E(cl.a));
      case 'oneof': return cl.l.some(g => E(g) === E(cl.a));
      case 'cond': return E(cl.a) !== E(cl.b) || E(cl.c) === E(cl.d);
      case 'is': return E(cl.a) === E(cl.b);
      case 'not': return E(cl.a) !== E(cl.b);
      case 'alldiff': return new Set(cl.l.map(E)).size === cl.l.length;
      case 'either': return (E(cl.a) === E(cl.b)) !== (E(cl.a) === E(cl.c));
      case 'pair': return E(cl.a) !== E(cl.b) && E(cl.c) !== E(cl.d) &&
        ((E(cl.a) === E(cl.c) && E(cl.b) === E(cl.d)) || (E(cl.a) === E(cl.d) && E(cl.b) === E(cl.c)));
      case 'lt': return E(cl.a) !== E(cl.b) && val(cl.a, cl.o) < val(cl.b, cl.o);
      case 'diff': return E(cl.a) !== E(cl.b) && val(cl.b, cl.o) - val(cl.a, cl.o) === cl.k;
      case 'dist': return E(cl.a) !== E(cl.b) && Math.abs(val(cl.b, cl.o) - val(cl.a, cl.o)) === cl.k;
    }
    return false;
  }

  function verify(S) {
    const P = S.P;
    const sol = solutionOf(S); if (!sol) return false;
    for (let c = 1; c < P.K; c++) if (new Set(sol[c]).size !== P.N) return false;
    const ent = entityMap(P, sol);
    for (let a = 0; a < P.M; a++) for (let b = a + 1; b < P.M; b++) {
      if (catOf(P, a) === catOf(P, b)) continue;
      if ((S.get(a, b) === 1) !== (ent[a] === ent[b])) return false;
    }
    return P.p.clues.every(cl => evalClue(P, cl, sol, ent));
  }

  function stateFromSol(P, sol) {
    const S = new State(P), ent = entityMap(P, sol);
    for (let a = 0; a < P.M; a++) for (let b = 0; b < P.M; b++)
      if (catOf(P, a) !== catOf(P, b)) S.m[a * P.M + b] = ent[a] === ent[b] ? 1 : -1;
    return S;
  }

  /* ===================== Recherche exhaustive ======================== */

  function search(S0, limit, maxLv, budget) {
    limit = limit || 2; maxLv = maxLv || 2;
    const out = []; let nodes = 0; const max = budget || 200000;
    (function rec(S) {
      if (out.length >= limit || nodes > max) return;
      nodes++;
      propagate(S, maxLv);
      if (S.bad) return;
      if (isSolved(S)) { if (verify(S)) out.push(S); return; }
      const P = S.P, N = P.N;
      let bx = -1, bc = -1, bn = 99;
      for (let x = 0; x < N && bn > 2; x++) for (let c = 1; c < P.K; c++) { // branche sur la catégorie clé
        const n = candCount(S, x, c); if (n > 1 && n < bn) { bn = n; bx = x; bc = c; }
      }
      if (bx < 0) { // peu probable : on branche sur n'importe quelle case
        for (let x = 0; x < P.M && bx < 0; x++) for (let c = 0; c < P.K; c++) {
          if (c === catOf(P, x)) continue; if (candCount(S, x, c) > 1) { bx = x; bc = c; break; }
        }
        if (bx < 0) return;
      }
      for (const y of cands(S, bx, bc)) {
        const T = S.clone(); T.set(bx, y, 1); rec(T);
        if (out.length >= limit) return;
      }
    })(S0);
    out.nodes = nodes; out.aborted = nodes > max;
    return out;
  }

  function countSolutions(p, limit) {
    const P = compile(p);
    const r = search(new State(P), limit || 2);
    return { count: r.length, sols: r.map(solutionOf), aborted: r.aborted };
  }

  /* ===================== Solveur expliqué ============================ */

  const WEIGHT = [0, 1, 3, 8, 25, 60];

  function solveExplained(p, opts) {
    opts = opts || {};
    const P = compile(p), S = new State(P), steps = [];
    const maxLv = opts.maxLv || 5;
    const t0 = Date.now(), maxTime = opts.maxTime || 20000;
    while (!isSolved(S) && !S.bad) {
      if (Date.now() - t0 > maxTime) break;
      const st = nextStep(S, maxLv);
      if (!st) break;
      if (opts.explain !== false) enrich(S, st);
      applyStep(S, st); steps.push(st);
    }
    const solved = isSolved(S) && !S.bad && verify(S);
    const counts = [0, 0, 0, 0, 0, 0];
    steps.forEach(s => counts[s.lv]++);
    const maxUsed = steps.reduce((m, s) => Math.max(m, s.lv), 0);
    const score = steps.reduce((t, s) => t + WEIGHT[s.lv], 0);
    return { steps, solved, counts, maxLv: maxUsed, score, sol: solved ? solutionOf(S) : null, bad: S.bad };
  }

  // Note de difficulté 1..5 à partir de l'analyse
  function rate(res, P) {
    if (!res.solved) return 0;
    const c = res.counts;
    if (c[5]) return 5;
    if (c[4] >= 2 || (c[4] >= 1 && c[3] >= 6)) return 5;
    if (c[4] >= 1 || c[3] >= 5) return 4;
    if (c[3] >= 1) return 3;
    if (c[2] >= 1) return 2;
    return 1;
  }

  /* ======================== Descriptions ============================= */

  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  function chip(P, g) { return '<span class="chip c' + catOf(P, g) + '">' + esc(labelOf(P, g)) + '</span>'; }
  function rel(P, a, b, v) {
    return '<span class="rel">' + chip(P, a) + '<b class="' + (v > 0 ? 'eq' : 'ne') + '">' + (v > 0 ? '=' : '≠') + '</b>' + chip(P, b) + '</span>';
  }
  function list(P, gs, sep) {
    sep = sep || ' ou ';
    const c = gs.map(g => chip(P, g));
    if (c.length <= 1) return c.join('');
    return c.slice(0, -1).join(', ') + sep + c[c.length - 1];
  }
  function catName(P, c) { return esc(P.p.cats[c].name); }
  function valList(P, o, idx) { return idx.map(i => chip(P, o * P.N + i)).join(' '); }
  function changes(P, ch, max) {
    max = max || 99;
    const yes = ch.filter(x => x[2] > 0), no = ch.filter(x => x[2] < 0);
    const all = yes.concat(no);
    const shown = all.slice(0, max).map(([a, b, v]) => rel(P, a, b, v)).join(' ');
    return shown + (all.length > max ? ' <span class="more">+' + (all.length - max) + '</span>' : '');
  }
  function badText(P, bad) {
    if (!bad) return 'blocage';
    if (bad.k === 'empty') return 'il ne reste plus aucune possibilité dans « ' + catName(P, bad.c) + ' » pour ' + chip(P, bad.x);
    if (bad.k === 'conflict') return chip(P, bad.a) + ' et ' + chip(P, bad.b) + ' devraient être à la fois associés et dissociés';
    return 'incohérence';
  }

  const TITLES = {
    clue: 'Lecture d’un indice', elim: 'Exclusion ligne / colonne', single: 'Dernière possibilité',
    trans: 'Transitivité', either: '« Soit… soit… »', cond: '« Si… alors… »', pair: '« L’un… l’autre… »', cmp: 'Comparaison',
    cross: 'Élimination croisée', clue3: 'Déduction indirecte', subset: 'Sous-ensemble réservé',
    hypo: 'Raisonnement par l’absurde', disj: 'Disjonction de cas', brute: 'Recherche exhaustive',
  };
  const LEVEL_NAMES = ['', 'Évident', 'Simple', 'Avancé', 'Expert', 'Exhaustif'];

  function shortOf(P, st) {
    let t = TITLES[st.r];
    if (st.ci != null) t += ' (indice ' + (st.ci + 1) + ')';
    return '<span class="st-name">' + t + '</span> <span class="arrow">⇒</span> ' + changes(P, st.ch, 3);
  }

  function describe(p, st) {
    const P = p.cats ? compile(p) : p;
    const E = P.ent;
    const q = st.ci != null ? '<blockquote>« ' + esc(clueText(P, P.p.clues[st.ci])) + ' »</blockquote>' : '';
    let h = '';
    switch (st.r) {
      case 'clue': {
        const cl = P.atoms[st.ai].cl;
        const why = {
          is: 'L’indice affirme directement que ces deux éléments désignent la même ' + E + '.',
          not: 'L’indice affirme directement que ces deux éléments ne désignent pas la même ' + E + '.',
          alldiff: 'Tous les éléments cités désignent des ' + E + 's différentes : chaque croisement entre eux est barré.',
          either: '« Soit… soit… » est exclusif : si les deux options désignaient la même ' + E + ', les deux affirmations seraient vraies à la fois. Elles concernent donc deux ' + E + 's différentes.',
          pair: 'Deux ' + E + 's différentes sont citées, et les deux caractéristiques appartiennent forcément à deux ' + E + 's différentes.',
          lt: 'Une comparaison met forcément en jeu deux ' + E + 's différentes.',
          diff: 'Un écart non nul met forcément en jeu deux ' + E + 's différentes.',
          dist: 'Un écart non nul met forcément en jeu deux ' + E + 's différentes.',
          none: cl.fromGender ? 'L’indice révèle le genre : ' + (cl.fromGender === 'f' ? 'c’est une femme' : 'c’est un homme') + '. Tous les prénoms ' + (cl.fromGender === 'f' ? 'masculins' : 'féminins') + ' sont donc exclus.'
            : 'L’indice exclut directement chacun des éléments cités.',
          oneof: 'L’indice limite les possibilités à quelques options : toutes les autres sont exclues.',
        }[cl.t];
        const multi = P.p.clues[st.ci].t === 'multi';
        h = q + (multi ? '<p class="why">Cet indice combine plusieurs informations ; on en exploite une ici.</p>' : '') + '<p>' + why + '</p>';
        break;
      }
      case 'elim':
        h = '<p>On sait que ' + rel(P, st.a, st.b, 1) + '. Chaque élément n’a qu’un seul partenaire par catégorie : on barre le reste de la ligne et de la colonne.</p>';
        break;
      case 'single':
        h = '<p>Pour ' + chip(P, st.x) + ', toutes les options de « ' + catName(P, st.c) + ' » sont barrées, sauf ' + chip(P, st.y) + '. C’est donc forcément elle.</p>';
        break;
      case 'trans': {
        const items = st.ch.map(([x, c, v]) => {
          const src = x === st.a ? st.b : st.a;
          return '<li>' + rel(P, x, c, v) + ' <span class="why">car ' + rel(P, src, c, v) + '</span></li>';
        }).join('');
        h = '<p>' + chip(P, st.a) + ' et ' + chip(P, st.b) + ' désignent la même ' + E + ' : tout ce que l’on sait de l’un vaut pour l’autre.</p><ul class="why-list">' + items + '</ul>';
        break;
      }
      case 'cond': {
        const cl = P.atoms[st.ai].cl;
        if (st.why === 'mp') h = q + '<p>La condition est remplie : ' + rel(P, cl.a, cl.b, 1) + '. La conséquence s’applique donc : ' + rel(P, cl.c, cl.d, 1) + '.</p>';
        else h = q + '<p>On sait que ' + rel(P, cl.c, cl.d, -1) + ' : la conséquence est fausse. Par contraposée, la condition l’est aussi : ' + rel(P, cl.a, cl.b, -1) + '.</p>';
        break;
      }
      case 'either': {
        const cl = P.atoms[st.ai].cl;
        if (st.why === 'bNo' || st.why === 'cNo') {
          const no = st.why === 'bNo' ? cl.b : cl.c, yes = st.why === 'bNo' ? cl.c : cl.b;
          h = q + '<p>L’une des deux options est vraie. Or ' + rel(P, cl.a, no, -1) + ' est déjà établi : il reste forcément ' + rel(P, cl.a, yes, 1) + '.</p>';
        } else {
          const yes = st.why === 'bYes' ? cl.b : cl.c, no = st.why === 'bYes' ? cl.c : cl.b;
          h = q + '<p>On sait que ' + rel(P, cl.a, yes, 1) + '. Comme « soit… soit… » exclut que les deux soient vraies, on a ' + rel(P, cl.a, no, -1) + '.</p>';
        }
        break;
      }
      case 'pair': {
        const cl = P.atoms[st.ai].cl;
        const [x1, y1, x2, y2] = st.cfg === 'A' ? [cl.a, cl.c, cl.b, cl.d] : [cl.a, cl.d, cl.b, cl.c];
        h = q + '<p>Il n’y a que deux répartitions possibles. Les informations déjà connues éliminent l’une d’elles ; il reste : ' + rel(P, x1, y1, 1) + ' et ' + rel(P, x2, y2, 1) + '.</p>';
        break;
      }
      case 'cmp': {
        const cl = P.atoms[st.ai].cl, o = cl.o, c = P.p.cats[o];
        const A = chip(P, cl.a), B = chip(P, cl.b);
        let rule;
        if (cl.t === 'lt') rule = 'La valeur de ' + A + ' est strictement inférieure à celle de ' + B + ' (« ' + esc(c.name) + ' »). ' + A + ' ne peut donc pas atteindre la plus grande valeur encore possible pour ' + B + ', et ' + B + ' ne peut pas descendre à la plus petite valeur encore possible pour ' + A + '.';
        else if (cl.t === 'diff') rule = B + ' a exactement ' + esc(fmtK(c, cl.k)) + ' de plus que ' + A + '. On ne garde que les valeurs qui ont un « partenaire » à cet écart, dans le bon sens.';
        else rule = 'L’écart entre ' + A + ' et ' + B + ' vaut exactement ' + esc(fmtK(c, cl.k)) + ', dans un sens ou dans l’autre. On ne garde que les valeurs qui ont un partenaire à cet écart.';
        h = q + '<p>' + rule + '</p><div class="vals"><div><span>Possibles pour ' + A + '</span>' + valList(P, o, st.va) + '</div><div><span>Possibles pour ' + B + '</span>' + valList(P, o, st.vb) + '</div></div>';
        if (st.ra.length) h += '<p>' + A + ' ne peut donc pas être ' + list(P, st.ra.map(i => o * P.N + i)) + '.</p>';
        if (st.rb.length) h += '<p>' + B + ' ne peut donc pas être ' + list(P, st.rb.map(i => o * P.N + i)) + '.</p>';
        break;
      }
      case 'cross': {
        const one = st.cs.length === 1;
        h = '<p>Dans « ' + catName(P, st.B) + ' », ' + chip(P, st.x) + ' ne peut correspondre qu’à ' + list(P, st.cs) + '. Or ' +
          (one ? 'cet élément n’est pas compatible' : 'aucun de ces éléments n’est compatible') + ' avec ' + chip(P, st.y) +
          '. Donc ' + rel(P, st.x, st.y, -1) + '.</p>';
        break;
      }
      case 'clue3': {
        const groups = [];
        st.items.forEach(it => { let g = groups.find(x => x.x === it.x); if (!g) groups.push(g = { x: it.x, o: it.o, w: [] }); g.w.push(it.w); });
        const items = groups.map(g => '<li>' + chip(P, g.x) + ' est forcément ' + chip(P, g.o[0]) + ' ou ' + chip(P, g.o[1]) + ' ; or ' + list(P, g.w, ' et ') +
          (g.w.length > 1 ? ' ne sont compatibles' : ' n’est compatible') + ' avec aucun des deux. Donc ' + g.w.map(w => rel(P, g.x, w, -1)).join(' ') + '.</li>').join('');
        h = q + '<p>L’indice limite les possibilités à deux options. Tout élément incompatible avec les deux options est exclu.</p><ul class="why-list">' + items + '</ul>';
        break;
      }
      case 'subset': {
        const k = st.S.length, word = ['', '', 'deux', 'trois', 'quatre', 'cinq'][k];
        h = '<p>' + list(P, st.S, ' et ') + ' n’ont, à eux ' + word + ', que ' + list(P, st.U, ' et ') + ' comme possibilités dans « ' + catName(P, st.B) + ' ». ' +
          'Ces ' + word + ' options leur sont donc « réservées » : aucun autre élément de « ' + catName(P, st.A) + ' » ne peut les prendre.</p>';
        break;
      }
      case 'hypo': {
        const ch = (st.chain || []).map(s => '<li>' + shortOf(P, s) + '</li>').join('');
        h = '<p>Les déductions directes sont épuisées. On teste une hypothèse : <b>supposons que</b> ' + rel(P, st.a, st.b, 1) + '.</p>' +
          (ch ? '<ol class="chain">' + ch + '</ol>' : '') +
          '<p class="contra">⚡ Contradiction : ' + badText(P, st.bad) + '.</p>' +
          '<p>L’hypothèse était donc fausse : ' + rel(P, st.a, st.b, -1) + '.</p>';
        break;
      }
      case 'disj': {
        const br = (st.branches || [[], []]).map((b, i) =>
          '<div class="branch"><h5>Cas ' + (i + 1) + ' : ' + rel(P, st.x, st.ys[i], 1) + '</h5><ol class="chain">' + b.map(s => '<li>' + shortOf(P, s) + '</li>').join('') + '</ol></div>').join('');
        h = '<p>' + chip(P, st.x) + ' ne peut correspondre qu’à ' + list(P, st.ys) + ' dans « ' + catName(P, catOf(P, st.ys[0])) + ' ». On examine les deux cas séparément :</p>' +
          '<div class="branches">' + br + '</div><p>Dans <b>les deux cas</b> on aboutit aux mêmes conclusions : elles sont donc certaines.</p>';
        break;
      }
      case 'brute':
        h = '<p>Aucune des techniques de raisonnement ne permet d’avancer. Une exploration systématique de toutes les combinaisons montre que la solution est unique : elle est complétée directement.</p>';
        break;
    }
    return {
      title: TITLES[st.r] + (st.ci != null && st.r !== 'clue' ? ' — indice ' + (st.ci + 1) : st.r === 'clue' ? ' ' + (st.ci + 1) : ''),
      level: st.lv, levelName: LEVEL_NAMES[st.lv],
      html: h, changes: changes(P, st.ch, 12),
    };
  }

  // Cases servant de « raison » à une étape (pour les surligner)
  function focusOf(P, st) {
    const f = [];
    switch (st.r) {
      case 'elim': f.push([st.a, st.b]); break;
      case 'trans': st.ch.forEach(([x, c]) => { const s = x === st.a ? st.b : st.a; f.push([s, c]); }); f.push([st.a, st.b]); break;
      case 'cross': st.cs.forEach(b => { f.push([st.x, b]); f.push([b, st.y]); }); break;
      case 'subset': st.S.forEach(x => st.U.forEach(u => f.push([x, u]))); break;
      case 'single': for (let i = 0; i < P.N; i++) { const z = st.c * P.N + i; if (z !== st.y) f.push([st.x, z]); } break;
      case 'clue3': st.items.forEach(it => { f.push([it.w, it.o[0]]); f.push([it.w, it.o[1]]); }); break;
    }
    return f.filter(([a, b]) => a !== b && catOf(P, a) !== catOf(P, b));
  }

  /* ============================ Export =============================== */

  G.Core = {
    compile, State, cands, candCount, checkEmpty, isSolved, unknownCount, applyStep,
    propagate, nextStep, enrich, chain, search, countSolutions, solveExplained, rate,
    verify, solutionOf, stateFromSol, evalClue, entityMap,
    clueText, fmtK, fr, fill, describe, shortOf, focusOf, catOf, idxOf, labelOf,
    TITLES, LEVEL_NAMES,
  };
})(typeof self !== 'undefined' ? self : this);
