/* =========================================================================
   Integramme — générateur d'enquêtes à niveaux de difficulté
   ========================================================================= */
(function (G) {
  'use strict';
  const C = G.Core, T = G.Themes;

  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  function shuffle(r, a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function wpick(r, w) { let t = 0; for (const k in w) t += w[k]; let x = r() * t; for (const k in w) { x -= w[k]; if (x <= 0) return k; } return Object.keys(w)[0]; }

  const LEVELS = [
    null,
    { name: 'Facile', desc: 'Lecture directe et exclusions', K: 3, N: 4, ord: [0, 1],
      w: { is: 3, not: 5, either: 1, lt: 1.5, alldiff: 0.6, sup: 1, gwrap: 1.5 } },
    { name: 'Moyen', desc: 'Transitivité et comparaisons', K: 4, N: 4, ord: [1, 1],
      w: { is: 1.2, not: 3.5, either: 2, lt: 2, diff: 1, alldiff: 1, pair: 1, oneof: 0.8, none: 1, next: 1, sup: 1, gender: 0.5, gwrap: 2, frame: 1 } },
    { name: 'Difficile', desc: 'Éliminations croisées, sous-ensembles', K: 4, N: 5, ord: [1, 2],
      w: { is: 0.6, not: 2.5, either: 2.5, lt: 2.5, diff: 2, dist: 1, alldiff: 1, pair: 2, oneof: 0.8, none: 1, cond: 0.8, next: 1.2, sup: 0.8, gender: 0.6, gwrap: 2.5, frame: 2 } },
    { name: 'Expert', desc: 'Longues chaînes, parfois une hypothèse', K: 5, N: 5, ord: [1, 2],
      w: { is: 0.4, not: 2, either: 3, lt: 2.5, diff: 2.5, dist: 1.5, alldiff: 1, pair: 2.5, oneof: 0.8, none: 1, cond: 1.2, next: 1.2, sup: 0.6, gender: 0.6, gwrap: 3, frame: 2.5 } },
    { name: 'Extrême', desc: 'Raisonnements par l’absurde nécessaires', K: 5, N: 5, ord: [1, 2],
      w: { is: 0.2, not: 1.5, either: 3, lt: 2.5, diff: 3, dist: 2, alldiff: 1, pair: 3, oneof: 0.8, none: 1, cond: 1.5, next: 1.2, sup: 0.5, gender: 0.6, gwrap: 3, frame: 3 } },
  ];

  /* ---------- construction des catégories à partir d'un thème ---------- */
  function buildCats(r, theme, K, N, ordRange) {
    const nameCat = theme.cats[0];
    const others = theme.cats.slice(1);
    const ords = shuffle(r, others.filter(c => c.kind === 'ord'));
    const attrs = shuffle(r, others.filter(c => c.kind !== 'ord'));
    // univers « genrés » : la catégorie de métiers/disciplines est toujours présente
    attrs.sort((x, y) => (y.pool[0].rf ? 1 : 0) - (x.pool[0].rf ? 1 : 0));
    let nOrd = ordRange[0] + Math.floor(r() * (ordRange[1] - ordRange[0] + 1));
    nOrd = Math.min(nOrd, ords.length, K - 1);
    if (attrs.length < K - 1 - nOrd) nOrd = K - 1 - attrs.length;
    const chosen = shuffle(r, ords.slice(0, nOrd).concat(attrs.slice(0, K - 1 - nOrd)));
    const cats = [nameCat].concat(chosen).map(c => {
      let items;
      if (c.kind === 'name') {
        // prénoms aux initiales différentes, mélange de genres
        const pool = shuffle(r, c.pool), used = new Set(); items = [];
        for (const it of pool) { if (items.length >= N) break; if (used.has(it.label[0])) continue; used.add(it.label[0]); items.push(it); }
        // au moins deux femmes et deux hommes (pour les indices de genre)
        for (const gg of ['f', 'm']) {
          while (items.filter(x => x.g === gg).length < Math.min(2, Math.floor(N / 2))) {
            const add = pool.find(x => x.g === gg && !items.includes(x) && !items.some(y => y.label[0] === x.label[0] && y.g === gg));
            const ix = items.findIndex((x, i) => x.g !== gg && items.filter(y => y.g !== gg).length > Math.ceil(N / 2) - 1);
            if (!add || ix < 0) break;
            items[ix] = add;
          }
        }
      } else if (c.kind === 'ord') {
        const start = Math.floor(r() * (c.pool.length - N + 1));
        let sel = c.pool.slice(start, start + N);
        // parfois des valeurs non consécutives (écarts plus intéressants)
        if (c.pool.length >= N + 2 && r() < 0.35) {
          const idx = shuffle(r, c.pool.map((_, i) => i)).slice(0, N).sort((a, b) => a - b);
          sel = idx.map(i => c.pool[i]);
        }
        items = sel;
      } else items = shuffle(r, c.pool).slice(0, N);
      const out = { name: c.name, kind: c.kind, items: items.map(x => Object.assign({}, x)), tpl: c.tpl };
      if (c.k) out.k = c.k;
      return out;
    });
    return cats;
  }

  /* ---------------------- indices candidats (vrais) ---------------------- */
  function candidateClue(r, P, sol, ent, type) {
    const { K, N } = P;
    const g = (c, e) => c * N + sol[c][e];
    const ordCats = P.p.cats.map((c, i) => c.kind === 'ord' ? i : -1).filter(i => i >= 0);
    const anyCat = (excl) => { const cs = []; for (let c = 0; c < K; c++) if (!excl.includes(c)) cs.push(c); return cs.length ? pick(r, cs) : -1; };
    const e1 = Math.floor(r() * N); let e2 = Math.floor(r() * (N - 1)); if (e2 >= e1) e2++;
    switch (type) {
      case 'is': { const c1 = anyCat([]), c2 = anyCat([c1]); return { t: 'is', a: g(c1, e1), b: g(c2, e1) }; }
      case 'not': { const c1 = anyCat([]), c2 = anyCat([c1]); return { t: 'not', a: g(c1, e1), b: g(c2, e2) }; }
      case 'either': {
        const ca = anyCat([]), cb = anyCat([ca]), cc = r() < 0.4 ? cb : anyCat([ca]);
        const y = g(cb, e1), z = g(cc, e2);
        return r() < 0.5 ? { t: 'either', a: g(ca, e1), b: y, c: z } : { t: 'either', a: g(ca, e1), b: z, c: y };
      }
      case 'pair': {
        const cx = anyCat([]), cy = r() < 0.6 ? cx : anyCat([]);
        const cz = anyCat([cx, cy]); if (cz < 0) return null;
        const cw = r() < 0.5 ? cz : anyCat([cx, cy]); if (cw < 0) return null;
        let c = g(cz, e1), d = g(cw, e2);
        if (r() < 0.5) { const t = c; c = d; d = t; }
        return { t: 'pair', a: g(cx, e1), b: g(cy, e2), c, d };
      }
      case 'lt': case 'diff': case 'dist': {
        if (!ordCats.length) return null;
        const o = pick(r, ordCats), V = P.vals[o];
        let lo = e1, hi = e2;
        if (V[sol[o][lo]] > V[sol[o][hi]]) { const t = lo; lo = hi; hi = t; }
        const ca = anyCat([o]), cb = anyCat([o]);
        const a = g(ca, lo), b = g(cb, hi), k = V[sol[o][hi]] - V[sol[o][lo]];
        if (type === 'lt') return { t: 'lt', a, b, o, s: r() < 0.5 ? 1 : 0 };
        if (type === 'diff') return { t: 'diff', a, b, o, k, s: r() < 0.5 ? 1 : 0 };
        return r() < 0.5 ? { t: 'dist', a, b, o, k } : { t: 'dist', a: b, b: a, o, k };
      }
      case 'oneof': case 'none': {
        const ca = anyCat([]), cb = anyCat([ca]);
        const others = shuffle(r, [...Array(N).keys()].filter(e => e !== e1));
        const l = type === 'oneof' ? [g(cb, e1), g(cb, others[0])].concat(N > 4 && r() < 0.5 ? [g(cb, others[1])] : [])
          : [g(cb, others[0]), g(cb, others[1])];
        return { t: type, a: g(ca, e1), l: shuffle(r, l) };
      }
      case 'cond': {
        // condition fausse : n'apporte de l'information que par contraposée
        const ca = anyCat([]), cb = anyCat([ca]), cc = anyCat([]), cd = anyCat([cc]);
        const e3 = Math.floor(r() * N);
        let e4 = r() < 0.5 ? e3 : Math.floor(r() * N);
        return { t: 'cond', a: g(ca, e1), b: g(cb, e2), c: g(cc, e3), d: g(cd, e4) };
      }
      case 'next': {
        const os = ordCats.filter(o => P.p.cats[o].tpl.nlt); if (!os.length) return null;
        const o = pick(r, os), R = P.ranks[o];
        const byRank = []; for (let e = 0; e < N; e++) byRank[R[sol[o][e]]] = e;
        const i = Math.floor(r() * (N - 1));
        const lo = byRank[i], hi = byRank[i + 1];
        return { t: 'next', a: g(anyCat([o]), lo), b: g(anyCat([o]), hi), o, s: r() < 0.5 ? 1 : 0 };
      }
      case 'sup': {
        const os = ordCats.filter(o => P.p.cats[o].tpl.min); if (!os.length) return null;
        const o = pick(r, os), V = P.vals[o];
        const want = r() < 0.5 ? Math.min(...V) : Math.max(...V);
        let e = 0; for (let x = 0; x < N; x++) if (V[sol[o][x]] === want) e = x;
        return { t: 'is', a: g(anyCat([o]), e), b: g(o, e), sup: 1 };
      }
      case 'gender': {
        const c = anyCat([0]); if (c < 0) return null;
        return { t: 'gender', a: g(c, e1), g: P.p.cats[0].items[sol[0][e1]].g || 'm' };
      }
      case 'gwrap': {
        const gc = P.p.cats.findIndex(c => c.items[0] && c.items[0].rf);
        if (gc < 0) return null;
        for (let tries = 0; tries < 8; tries++) {
          const bt = pick(r, ['is', 'not', 'not', 'lt', 'diff', 'next', 'either', 'pair', 'none', 'oneof', 'frame']);
          const base = candidateClue(r, P, sol, ent, bt);
          if (!base || base.t === 'multi' && bt !== 'frame') continue;
          const top = base.t === 'multi' ? base.parts[0] : base;
          const pos = ['a', 'b'].filter(k => top[k] != null && C.catOf(P, top[k]) === gc);
          if (!pos.length) continue;
          const x = top[pos[0]];
          const gg = P.p.cats[0].items[sol[0][ent[x]]].g || 'm';
          const parts = (base.t === 'multi' ? base.parts : [base]).concat([{ t: 'gender', a: x, g: gg }]);
          return { t: 'multi', parts };
        }
        return null;
      }
      case 'frame': {
        // encadrement : « X a quitté la soirée 15 min avant Y, mais après Z »
        if (!ordCats.length || N < 3) return null;
        const o = pick(r, ordCats), V = P.vals[o], R = P.ranks[o], t = P.p.cats[o].tpl;
        const es = shuffle(r, [...Array(N).keys()]).slice(0, 3).sort((x, y) => V[sol[o][x]] - V[sol[o][y]]);
        const [lo, mid, hi] = es;
        const X = g(r() < 0.5 ? 0 : anyCat([o]), mid);
        const cmp = (a1, b1, ea, eb) => {
          const k = V[sol[o][eb]] - V[sol[o][ea]], adj = R[sol[o][eb]] - R[sol[o][ea]] === 1;
          const opts = ['lt', 'diff', 'diff']; if (adj && t.nlt) opts.push('next', 'next');
          const ty = pick(r, opts);
          return ty === 'diff' ? { t: 'diff', a: a1, b: b1, o, k } : { t: ty, a: a1, b: b1, o };
        };
        const p1 = cmp(X, g(anyCat([o]), hi), mid, hi), p2 = cmp(g(anyCat([o]), lo), X, lo, mid);
        if (p1.b === X || p2.a === X) return null;
        return { t: 'multi', parts: r() < 0.5 ? [p1, p2] : [p2, p1] };
      }
      case 'alldiff': {
        const n = Math.min(N, 3 + Math.floor(r() * 2));
        const es = shuffle(r, [...Array(N).keys()]).slice(0, n);
        const l = es.map(e => g(Math.floor(r() * K), e));
        if (new Set(l.map(x => C.catOf(P, x))).size < 2) return null;
        return { t: 'alldiff', l };
      }
    }
    return null;
  }

  function clueKey(cl) {
    const s = (x, y) => x < y ? x + ',' + y : y + ',' + x;
    switch (cl.t) {
      case 'is': case 'not': return cl.t + s(cl.a, cl.b);
      case 'either': return 'e' + cl.a + ':' + s(cl.b, cl.c);
      case 'pair': return 'p' + s(cl.a, cl.b) + ':' + s(cl.c, cl.d);
      case 'lt': return 'l' + cl.a + ',' + cl.b + ',' + cl.o;
      case 'diff': return 'd' + cl.a + ',' + cl.b + ',' + cl.o;
      case 'dist': return 'D' + s(cl.a, cl.b) + ',' + cl.o;
      case 'alldiff': return 'A' + cl.l.slice().sort((x, y) => x - y).join(',');
      case 'oneof': case 'none': return cl.t + cl.a + ':' + cl.l.slice().sort((x, y) => x - y).join(',');
      case 'cond': return 'c' + s(cl.a, cl.b) + ':' + s(cl.c, cl.d);
      case 'next': return 'n' + cl.a + ',' + cl.b + ',' + cl.o;
      case 'gender': return 'g' + cl.a;
      case 'multi': return 'M' + cl.parts.map(clueKey).join('|');
    }
  }

  // Indices sans intérêt (déjà évidents) : on les écarte
  function trivial(P, cl) {
    if (cl.t === 'is' || cl.t === 'not') return false;
    if (cl.t === 'pair') return cl.a === cl.b || cl.c === cl.d;
    if (cl.t === 'either') return cl.b === cl.c;
    if (cl.t === 'cond') return (cl.a === cl.c && cl.b === cl.d) || (cl.a === cl.d && cl.b === cl.c);
    return false;
  }

  function quality(p, res, level) {
    const n = p.clues.length, types = new Set(p.clues.map(c => c.t)).size;
    const nots = p.clues.filter(c => c.t === 'not').length / n;
    const disj = res.steps.filter(s => s.r === 'disj').length;
    let q = types * 1.5 - nots * 4 - n * 0.15;
    if (level >= 4) q += res.counts[4] * 2 + res.counts[3] * 0.2 + disj;
    if (level <= 2) q -= res.counts[3] * 3;
    return q;
  }

  // Fusionne quelques indices simples portant sur le même élément (« Alice a le chat et n'habite pas à Lyon. »)
  let NN = 4; // nombre d'éléments par catégorie (pour comparer les catégories)
  function overlapCat(x, y, common) {
    // deux contraintes « liste » (ni/ni, l'un de) sur la même catégorie que l'autre : redondant
    const lc = c => (c.t === 'none' || c.t === 'oneof') ? Math.floor(c.l[0] / NN) : (c.t === 'is' || c.t === 'not') ? Math.floor((common.includes(c.a) ? c.b : c.a) / NN) : -1;
    const a = lc(x), b = lc(y);
    return a >= 0 && a === b && (['none', 'oneof'].includes(x.t) || ['none', 'oneof'].includes(y.t));
  }
  function mergeClues(r, clues, max) {
    const simple = c => ['is', 'not', 'gender', 'lt', 'diff', 'next'].includes(c.t) || ((c.t === 'none' || c.t === 'oneof') && c.l.length <= 3);
    const subj = c => ['is', 'not', 'lt', 'diff', 'next'].includes(c.t) ? [c.a, c.b] : [c.a];
    let out = clues.slice(), n = 0;
    for (let i = 0; i < out.length && n < max; i++) {
      if (!simple(out[i]) || r() < 0.35) continue;
      for (let j = i + 1; j < out.length; j++) {
        if (!simple(out[j])) continue;
        if (!subj(out[i]).some(x => subj(out[j]).includes(x))) continue;
        // pas de chevauchement (« 2 000, 2 500 ou 3 000 € et pas 2 000 € »)
        const items = c => [c.a, c.b, c.c, c.d].concat(c.l || []).filter(x => x != null);
        const common = subj(out[i]).filter(x => subj(out[j]).includes(x));
        if (items(out[i]).filter(x => !common.includes(x)).some(x => items(out[j]).includes(x))) continue;
        if (overlapCat(out[i], out[j], common)) continue;
        out[i] = { t: 'multi', parts: [out[i], out[j]] };
        out.splice(j, 1); n++;
        break;
      }
    }
    return out;
  }

  // Indices « à deux options » dont la mauvaise option est directement contredite par un autre indice
  // (ex. « Fanny part au Mexique ou au Canada » + « Margot ou Fanny part en Islande ») : à éviter
  function linked(p) {
    const P = C.compile(p), ent = C.entityMap(P, p.sol);
    const direct = new Map();
    P.atoms.forEach(at => C.direct(P, at.cl).forEach(([a, b, v]) => { if (v < 0) { const k = Math.min(a, b) + ',' + Math.max(a, b); if (!direct.has(k)) direct.set(k, new Set()); direct.get(k).add(at.ci); } }));
    let n = 0;
    P.atoms.forEach(at => {
      const cl = at.cl; let decoys = [];
      if (cl.t === 'either') decoys = [ent[cl.a] === ent[cl.b] ? [cl.a, cl.c] : [cl.a, cl.b]];
      else if (cl.t === 'oneof' && cl.l.length === 2) decoys = cl.l.filter(x => ent[x] !== ent[cl.a]).map(x => [cl.a, x]);
      decoys.forEach(([a, b]) => { const s = direct.get(Math.min(a, b) + ',' + Math.max(a, b)); if (s && [...s].some(ci => ci !== at.ci)) n++; });
    });
    return n;
  }

  function unique(p) { return C.countSolutions(p, 2).count === 1; }

  /* --------------------------- une tentative --------------------------- */
  function attempt(r, theme, L, K, N) {
    const cats = buildCats(r, theme, K, N, L.ord);
    const p = { title: theme.name, entity: 'personne', theme: theme.id, cats, clues: [] };
    const P = C.compile(p);
    const sol = [[...Array(N).keys()]];
    for (let c = 1; c < K; c++) sol.push(shuffle(r, [...Array(N).keys()]));
    const ent = C.entityMap(P, sol);
    p.sol = sol;

    // réserve d'indices vrais
    const pool = [], seen = new Set();
    let tries = 0;
    while (pool.length < 140 && tries++ < 2000) {
      const type = wpick(r, L.w);
      const cl = candidateClue(r, P, sol, ent, type);
      if (!cl || trivial(P, cl)) continue;
      const key = clueKey(cl); if (seen.has(key)) continue;
      if (!C.evalClue(P, cl, sol, ent)) continue;
      seen.add(key); pool.push(cl);
    }

    // ajout jusqu'à l'unicité
    const clues = [];
    let i = 0;
    const start = Math.max(3, Math.round(K * N * 0.45));
    while (i < pool.length && clues.length < start) clues.push(pool[i++]);
    p.clues = clues;
    while (!unique(p)) {
      if (i >= pool.length) return null;
      clues.push(pool[i++]);
    }

    // réduction : on retire tout indice superflu (directs d'abord pour les niveaux durs)
    const order = shuffle(r, clues.map((_, j) => j));
    const dirW = { is: 3, not: 1 };
    order.sort((x, y) => (dirW[clues[y].t] || 0) - (dirW[clues[x].t] || 0));
    const keep = clues.slice();
    for (const j of order) {
      const cl = clues[j];
      const idx = keep.indexOf(cl);
      keep.splice(idx, 1);
      p.clues = keep;
      if (!unique(p)) keep.splice(idx, 0, cl);
    }
    p.clues = keep;
    return p;
  }

  function finalize(p, theme, level, seed, res) {
    const n = p.cats[0].items.length;
    const NUM = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit'];
    const story = theme.story.replace('{n}', NUM[n] || n);
    const catNames = p.cats.slice(1).map(c => c.name.toLowerCase());
    const last = catNames.pop();
    p.intro = story + ' Pour chaque ' + p.cats[0].name.toLowerCase() + ', retrouvez : ' + (catNames.length ? catNames.join(', ') + ' et ' : '') + last + '.';
    p.level = level;
    p.rating = res ? C.rate(res) : level;
    p.seed = seed;
    p.id = theme.id + '-' + level + '-' + seed.toString(36);
    p.title = theme.name;
    // mélange l'ordre des indices pour ne pas trahir l'ordre de résolution
    return p;
  }

  /**
   * opts: { theme: id|'random', level: 1..5, size: {K,N}|null, seed, budgetMs, onProgress }
   */
  function generate(opts) {
    opts = opts || {};
    const level = Math.max(1, Math.min(5, opts.level || 2));
    const seed = (opts.seed != null ? opts.seed : Math.floor(Math.random() * 2 ** 31)) >>> 0;
    const r = rng(seed);
    const theme = (opts.theme && opts.theme !== 'random') ? T.THEMES.find(t => t.id === opts.theme) : pick(r, T.THEMES);
    const L = LEVELS[level];
    const K = (opts.size && opts.size.K) || L.K, N = (opts.size && opts.size.N) || L.N;
    const maxAttempts = opts.attempts || (level >= 5 ? 60 : level >= 4 ? 40 : 25);
    const t0 = Date.now(), budget = opts.budgetMs || (level >= 5 ? 25000 : level >= 4 ? 15000 : 8000);
    let best = null, bestD = 99, bestQ = -1e9, found = 0;
    const want = level >= 4 ? 5 : 3, minMs = opts.quick ? 0 : 1200;
    for (let a = 0; a < maxAttempts; a++) {
      if (opts.onProgress) opts.onProgress({ attempt: a + 1, max: maxAttempts });
      const p = attempt(r, theme, L, K, N);
      if (!p) continue;
      const res = C.solveExplained(p, { explain: false, maxLv: 4, maxTime: 6000 });
      if (!res.solved) continue; // exige une résolution par raisonnement
      const rating = C.rate(res);
      p.rating = rating;
      const lo = level === 1 ? 1 : level, d = rating < lo ? lo - rating : rating > level ? rating - level + 0.5 : 0;
      const q = quality(p, res, level) - 2 * linked(p);
      if (d < bestD || (d === bestD && q > bestQ)) { best = p; bestD = d; bestQ = q; }
      if (d === 0) found++;
      const el = Date.now() - t0;
      if (found >= want) break;
      if (!opts.attempts && ((found && el > minMs * 2) || (el > budget && best))) break;
    }
    if (!best) return null;
    best.clues = shuffle(r, best.clues);
    NN = N;
    if (level >= 2) best.clues = mergeClues(r, best.clues, level >= 4 ? 3 : 2);
    return finalize(best, theme, level, seed, C.solveExplained(best, { explain: false, maxLv: 4 }));
  }

  G.Gen = { generate, LEVELS, rng };
})(typeof self !== 'undefined' ? self : this);
