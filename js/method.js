/* =========================================================================
   Integramme — section « Méthode » : mathématiques et sémantique, illustrées
   ========================================================================= */
(function () {
  'use strict';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const chip = (t, c) => '<span class="chip c' + c + '">' + esc(t) + '</span>';
  const P = ['Alice', 'Bruno', 'Chloé', 'David'], V = ['Lyon', 'Nice', 'Paris', 'Rennes'], A = ['20 ans', '25 ans', '30 ans', '35 ans'], N = ['Chat', 'Chien', 'Lapin', 'Perroquet'];
  const al = chip('Alice', 0), br = chip('Bruno', 0), ch = chip('Chloé', 0), da = chip('David', 0);

  /* ------------------------- mini-grilles ------------------------------ */
  // spec : { title, rows, cols, rc, cc, before:{'r,c':'y'|'n'}, after:{...}, focus:['r,c'], dimRows:[r] }
  function miniGrid(g, phase) {
    const cols = g.cols.length;
    let html = '<div class="mg-wrap">' + (g.title ? '<div class="ttl">' + g.title + '</div>' : '') +
      '<div class="mg" style="grid-template-columns:auto repeat(' + cols + ', var(--s))">';
    html += '<div class="t">' + (g.cc ? '' : '') + '</div>' + g.cols.map(c => '<div class="h col">' + esc(c) + '</div>').join('');
    g.rows.forEach((r, i) => {
      html += '<div class="h row">' + esc(r) + '</div>';
      for (let j = 0; j < cols; j++) {
        const k = i + ',' + j;
        const b = (g.before || {})[k], a = (g.after || {})[k];
        let v = b || '', cls = '';
        if (phase === 'after' && a) { v = a; if (!b) cls = ' new'; }
        if ((g.focus || []).includes(k)) cls += ' fo';
        if ((g.dim || []).includes(k)) cls += ' dim';
        html += '<div class="c ' + v + cls + '"></div>';
      }
    });
    return html + '</div></div>';
  }
  function numberLine(d, phase) {
    return '<div class="nline">' + d.rows.map(r => '<div class="row"><span>' + r.name + '</span><div class="vals">' +
      d.values.map((v, i) => {
        let cls = (r.off || []).includes(i) ? ' off' : '';
        if (phase === 'after' && (r.cut || []).includes(i)) cls = ' cut';
        return '<span class="v' + cls + '">' + esc(v) + '</span>';
      }).join('') + '</div></div>').join('') + '</div>';
  }
  function flow(items) {
    return '<div class="flow">' + items.map(it => it === '→' ? '<span class="ar">→</span>' : it === '⇒' ? '<span class="ar">⇒</span>' :
      '<span class="b ' + (it.k || '') + '">' + it.t + '</span>').join('') + '</div>';
  }

  // Démo animée avant / après
  let demoId = 0;
  const demos = {};
  function demo(spec) {
    const id = 'd' + (++demoId);
    demos[id] = spec;
    const anim = spec.grids || spec.line;
    return '<div class="demo" data-demo="' + id + '"><div class="stage">' + stage(spec, 'before') + '</div>' +
      (anim ? '<div class="ctrl"><div class="seg"><button data-ph="before" class="on">Avant</button><button data-ph="after">Après</button></div></div>' : '') +
      '<div class="cap">' + (spec.cap ? (anim ? spec.cap[0] : spec.cap) : '') + '</div></div>';
  }
  function stage(spec, ph) {
    if (spec.grids) return spec.grids.map(g => miniGrid(g, ph)).join('');
    if (spec.line) return numberLine(spec.line, ph);
    if (spec.flow) return spec.flow.map(f => flow(f)).join('<div style="height:6px;width:100%"></div>');
    if (spec.html) return spec.html;
    return '';
  }
  function bindDemos(root) {
    const setPh = (el, ph) => {
      const spec = demos[el.dataset.demo]; if (!spec) return;
      el.querySelector('.stage').innerHTML = stage(spec, ph);
      el.querySelectorAll('[data-ph]').forEach(b => b.classList.toggle('on', b.dataset.ph === ph));
      if (spec.cap && Array.isArray(spec.cap)) el.querySelector('.cap').innerHTML = spec.cap[ph === 'after' ? 1 : 0];
    };
    root.querySelectorAll('.demo').forEach(el => {
      el.addEventListener('click', e => { const b = e.target.closest('[data-ph]'); if (b) setPh(el, b.dataset.ph); });
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(ents => ents.forEach(en => {
        if (en.isIntersecting) { io.unobserve(en.target); setTimeout(() => setPh(en.target, 'after'), 900); }
      }), { threshold: 0.6 });
      root.querySelectorAll('.demo').forEach(el => { if (el.querySelector('[data-ph]')) io.observe(el); });
    }
  }

  const fill = (n, m, v) => { const o = {}; for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) o[i + ',' + j] = v; return o; };
  const row = (r, n, v, except) => { const o = {}; for (let j = 0; j < n; j++) if (j !== except) o[r + ',' + j] = v; return o; };
  const col = (c, n, v, except) => { const o = {}; for (let i = 0; i < n; i++) if (i !== except) o[i + ',' + c] = v; return o; };
  const merge = (...xs) => Object.assign({}, ...xs);

  /* ------------------------------ Contenu ------------------------------ */
  const SECTIONS = [
    {
      id: 'bases', title: 'Les bases',
      lead: 'Un integramme associe des personnes à des caractéristiques (ville, âge, animal…). Chaque caractéristique appartient à exactement une personne : c’est une correspondance « un pour un ». Tout le jeu consiste à reconstituer ces correspondances à partir d’indices.',
      cards: [
        { t: 'Lire la grille', p: 'Chaque petit carré croise deux catégories. Une case répond à une question : « Alice habite-t-elle à Nice ? ». On y note <b>●</b> pour oui, <b>✕</b> pour non. La grille en escalier contient tous les croisements possibles, une seule fois.',
          demo: { grids: [{ rows: P.slice(0, 3), cols: V.slice(0, 3), before: { '0,1': 'n', '2,0': 'n' }, after: { '1,2': 'y' } }], cap: ['Deux ✕ déjà connus.', 'On ajoute un ● : Bruno habite à Paris.'] },
          tip: 'Dans chaque sous-grille complète : <b>exactement un ●</b> par ligne et par colonne, tout le reste est ✕.' },
        { t: 'Pourquoi ✕ compte autant que ●', p: 'Débutants et experts diffèrent surtout sur ce point : on progresse beaucoup plus souvent par <b>élimination</b> que par affirmation. Un ● n’est souvent que la conséquence d’une ligne remplie de ✕.',
          tip: 'Notez scrupuleusement chaque ✕, même « évident ». Les déductions avancées reposent sur eux.' },
        { t: 'Le récapitulatif', p: 'Sous la grille, le tableau récapitulatif affiche ce que vous avez établi pour chaque personne. Il aide à garder une vue d’ensemble et à repérer les catégories qui avancent peu.' },
      ],
    },
    {
      id: 'maths', title: 'La mécanique logique',
      lead: 'Voici, de la plus simple à la plus subtile, les règles « mathématiques » qu’applique le solveur. Chaque illustration montre l’état avant et après la déduction (les cases nouvelles sont surlignées en orange, les cases qui servent de justification en bleu).',
      cards: [
        { n: 1, t: 'Exclusion ligne / colonne', p: 'Dès qu’un ● est posé, toutes les autres cases de sa ligne et de sa colonne (dans la même sous-grille) deviennent ✕ : Alice n’a qu’une ville, Nice n’a qu’un habitant.',
          demo: { grids: [{ rows: P, cols: V, before: { '1,2': 'y' }, after: merge(row(1, 4, 'n', 2), col(2, 4, 'n', 1)), focus: ['1,2'] }], cap: ['Bruno habite à Paris.', 'Personne d’autre n’habite à Paris, et Bruno n’habite nulle part ailleurs.'] },
          logic: 'x = y  ⇒  x ≠ y′ (∀ y′ ≠ y)  et  x′ ≠ y (∀ x′ ≠ x)' },
        { n: 2, t: 'Dernière possibilité', p: 'Si une ligne (ou une colonne) ne contient plus qu’une seule case libre, c’est forcément elle : on pose le ●.',
          demo: { grids: [{ rows: P, cols: V, before: row(3, 4, 'n', 1), after: { '3,1': 'y' }, focus: ['3,0', '3,2', '3,3'] }], cap: ['David n’habite ni à Lyon, ni à Paris, ni à Rennes.', 'Il habite donc à Nice.'] },
          tip: 'Pensez à vérifier les <b>colonnes</b> autant que les lignes : c’est l’oubli le plus fréquent.' },
        { n: 3, t: 'Transitivité (= et =)', p: 'Si deux éléments désignent la même personne, ils partagent tout. Alice possède le chat ; le propriétaire du chat a 30 ans ; donc Alice a 30 ans.',
          demo: { grids: [
            { title: 'Prénom × Animal', rows: P.slice(0, 3), cols: N.slice(0, 3), before: { '0,0': 'y' }, focus: ['0,0'] },
            { title: 'Âge × Animal', rows: A.slice(0, 3), cols: N.slice(0, 3), before: { '2,0': 'y' }, focus: ['2,0'] },
            { title: 'Prénom × Âge', rows: P.slice(0, 3), cols: A.slice(0, 3), before: {}, after: { '0,2': 'y' } },
          ], cap: ['Alice = chat, et chat = 30 ans…', '… donc Alice = 30 ans.'] },
          logic: 'a = b  et  b = c  ⇒  a = c' },
        { n: 4, t: 'Transitivité (= et ≠)', p: 'Version négative, beaucoup plus fréquente : Alice possède le chat, et le propriétaire du chat n’habite pas à Nice. Donc Alice n’habite pas à Nice.',
          demo: { grids: [
            { title: 'Prénom × Animal', rows: P.slice(0, 3), cols: N.slice(0, 3), before: { '0,0': 'y' }, focus: ['0,0'] },
            { title: 'Ville × Animal', rows: V.slice(0, 3), cols: N.slice(0, 3), before: { '1,0': 'n' }, focus: ['1,0'] },
            { title: 'Prénom × Ville', rows: P.slice(0, 3), cols: V.slice(0, 3), before: {}, after: { '0,1': 'n' } },
          ], cap: ['Alice = chat, chat ≠ Nice…', '… donc Alice ≠ Nice.'] },
          logic: 'a = b  et  b ≠ c  ⇒  a ≠ c',
          tip: 'Réflexe : chaque fois que vous posez un ●, recopiez dans l’autre sous-grille tout ce que vous savez déjà (● et ✕) sur chacun des deux éléments.' },
        { n: 5, t: 'Élimination croisée', p: 'Plus subtil : sans connaître l’âge d’Alice, on sait qu’elle a 20 ou 25 ans. Si <b>aucune</b> de ces deux personnes n’habite à Lyon, Alice ne peut pas habiter à Lyon. On raisonne « à travers » une troisième catégorie.',
          demo: { grids: [
            { title: 'Prénom × Âge', rows: P.slice(0, 3), cols: A, before: { '0,2': 'n', '0,3': 'n' }, focus: ['0,0', '0,1'] },
            { title: 'Ville × Âge', rows: V.slice(0, 3), cols: A, before: { '0,0': 'n', '0,1': 'n' }, focus: ['0,0', '0,1'] },
            { title: 'Prénom × Ville', rows: P.slice(0, 3), cols: V.slice(0, 3), before: {}, after: { '0,0': 'n' } },
          ], cap: ['Alice : 20 ou 25 ans. Lyon : ni 20 ni 25 ans.', 'Aucun âge commun possible : Alice ≠ Lyon.'] },
          logic: '∀ b ∈ B : ¬(a ~ b ∧ b ~ c)  ⇒  a ≠ c',
          tip: 'Cherchez cette situation quand une personne n’a plus que deux ou trois possibilités dans une catégorie.' },
        { n: 6, t: 'Sous-ensembles réservés (paires, triplets)', p: 'Si Alice et Bruno ne peuvent habiter qu’à Lyon ou à Nice, ces deux villes leur sont « réservées » : elles seront prises par eux deux, dans un ordre encore inconnu. Chloé et David ne peuvent donc y habiter. Cela marche avec trois personnes et trois options, etc.',
          demo: { grids: [{ rows: P, cols: V, before: { '0,2': 'n', '0,3': 'n', '1,2': 'n', '1,3': 'n' }, after: { '2,0': 'n', '2,1': 'n', '3,0': 'n', '3,1': 'n' }, focus: ['0,0', '0,1', '1,0', '1,1'] }], cap: ['Alice et Bruno : seulement Lyon ou Nice.', 'Lyon et Nice sont pris par eux : barrés pour Chloé et David.'] },
          logic: '|S| = k  et  candidats(S) = U avec |U| = k  ⇒  U interdit hors de S',
          trap: 'À l’inverse, si trois personnes n’ont que deux villes possibles à elles trois, c’est une contradiction : l’hypothèse en cours est fausse (principe des tiroirs).' },
        { n: 7, t: 'Bornes d’une comparaison', p: '« Alice est plus jeune que Bruno. » Alice ne peut pas avoir l’âge maximum encore possible pour Bruno, et Bruno ne peut pas avoir l’âge minimum encore possible pour Alice. Et bien sûr, Alice ≠ Bruno.',
          demo: { line: { values: A, rows: [{ name: 'Alice', cut: [3] }, { name: 'Bruno', cut: [0] }] }, cap: ['Alice < Bruno, tous les âges encore possibles.', 'Alice ne peut pas avoir 35 ans, Bruno ne peut pas avoir 20 ans.'] },
          logic: 'v(a) < v(b)  ⇒  v(a) < max v(b)  et  v(b) > min v(a)',
          tip: 'Ces bornes se resserrent au fil du jeu : revenez sur chaque comparaison quand l’une des deux personnes perd des possibilités.' },
        { n: 8, t: 'Écart exact', p: '« Bruno a 10 ans de plus qu’Alice. » On ne garde, pour chacun, que les valeurs qui ont un « partenaire » à exactement 10 ans d’écart dans le bon sens.',
          demo: { line: { values: A, rows: [{ name: 'Alice', cut: [2, 3] }, { name: 'Bruno', cut: [0, 1] }] }, cap: ['v(Bruno) = v(Alice) + 10.', 'Alice : 20 ou 25 ans. Bruno : 30 ou 35 ans.'] },
          logic: 'v(b) − v(a) = k' },
        { n: 9, t: 'Écart sans direction', p: '« Alice et Bruno ont 15 ans d’écart » ne dit pas qui est le plus âgé. Une valeur reste possible si elle a un partenaire à 15 ans, au-dessus <i>ou</i> en dessous.',
          demo: { line: { values: A, rows: [{ name: 'Alice', cut: [1, 2] }, { name: 'Bruno', cut: [1, 2] }] }, cap: ['|v(Alice) − v(Bruno)| = 15.', 'Seuls 20 et 35 ans ont un partenaire à 15 ans : ils se partagent ces deux âges.'] },
          logic: '|v(a) − v(b)| = k' },
      ],
    },
    {
      id: 'semantique', title: 'La sémantique des indices',
      lead: 'Les énigmes se gagnent souvent à la lecture. Chaque formulation française se traduit en contraintes logiques précises — certaines explicites, d’autres cachées. Voici comment décoder les tournures que vous rencontrerez.',
      cards: [
        { t: 'Affirmation directe', ex: '« Alice habite à Lyon. »', logic: 'Alice = Lyon', p: 'Un ● immédiat, suivi de toutes ses exclusions et transitivités.' },
        { t: 'Négation', ex: '« La personne qui a le chat n’a pas 30 ans. »', logic: 'chat ≠ 30 ans', p: 'Un ✕ immédiat. Attention : le sujet n’est pas forcément un prénom ! Ici on barre la case chat × 30 ans, pas une case de prénom.' },
        { t: 'Négation implicite', ex: '« Alice a déjeuné avec le propriétaire du chien. »', logic: 'Alice ≠ chien', p: 'Deux éléments qui interagissent (dîner avec, écrire à, être voisin de, arriver avant…) désignent deux personnes différentes. C’est l’information la plus souvent oubliée.',
          trap: 'Seul cas où cela ne s’applique pas : les tournures réflexives explicites (« Alice s’est offert le chien »).' },
        { t: 'Énumération distincte', ex: '« Alice, le pianiste et la personne de Lyon sont trois personnes différentes. »', logic: 'Alice ≠ pianiste ≠ Lyon ≠ Alice', p: 'Chaque paire citée donne un ✕. Une énumération de quatre éléments distincts dans un integramme à quatre personnes couvre <i>tout le monde</i> : très puissant.' },
        { t: 'Comparatif', ex: '« Bruno est plus âgé que la personne de Nice. »', logic: 'v(Bruno) > v(Nice)  ⇒  Bruno ≠ Nice', p: 'Deux informations : les deux sont différents, et des bornes (Bruno n’est pas le plus jeune, la personne de Nice n’est pas la plus âgée).' },
        { t: 'Superlatif', ex: '« Le plus jeune n’a pas de chat. »', logic: 'min(âge) ≠ chat', p: '« Le plus jeune » désigne la plus petite valeur de la catégorie : c’est un élément précis (20 ans), pas une comparaison. « Ni le plus jeune ni le plus âgé » = ni 20 ni 35 ans.' },
        { t: 'Écart précis', ex: '« Chloé est arrivée 30 minutes après David. »', logic: 'v(Chloé) = v(David) + 30', p: 'Contrainte forte : avec des valeurs régulières, elle ne laisse souvent que deux ou trois couples possibles. Notez-les à part.',
          trap: '« Deux fois plus âgé » n’est pas « deux ans de plus ». Et « juste après » veut dire « valeur suivante » — à ne pas confondre avec « après ».' },
        { t: 'Voisinage', ex: '« Le chat vit juste au-dessus du chien. »', logic: 'v(chat) = v(chien) + 1 étage', p: '« Juste » / « immédiatement » transforme un comparatif en écart exact d’un cran. « À côté de » = écart d’un cran, sans direction. « Entre X et Y » = deux comparaisons.' },
        { t: '« Soit… soit… » (ou exclusif)', ex: '« Alice habite à Lyon ou a le chat, mais pas les deux. »', logic: '(Alice = Lyon) ⊕ (Alice = chat)', p: 'Exactement une des deux affirmations est vraie. Conséquence cachée : Lyon et le chat appartiennent à deux personnes différentes (sinon les deux seraient vraies en même temps).',
          html: '<table class="truth"><tr><th>Alice = Lyon</th><th>Alice = chat</th><th>Indice</th></tr><tr><td class="t1">vrai</td><td class="t1">vrai</td><td class="t0">✕</td></tr><tr class="ok"><td class="t1">vrai</td><td class="t0">faux</td><td class="t1">✓</td></tr><tr class="ok"><td class="t0">faux</td><td class="t1">vrai</td><td class="t1">✓</td></tr><tr><td class="t0">faux</td><td class="t0">faux</td><td class="t0">✕</td></tr></table>' },
        { t: '« Ou » inclusif', ex: '« Alice habite à Lyon ou a le chat (voire les deux). »', logic: '(Alice = Lyon) ∨ (Alice = chat)', p: 'Plus rare. Seule certitude : on ne peut pas avoir les deux fausses. Si l’une est fausse, l’autre est vraie ; mais si l’une est vraie, on ne sait rien de l’autre.',
          trap: 'En français courant, « ou » est ambigu. Dans un integramme bien rédigé, l’exclusif est signalé par « soit… soit » ou « mais pas les deux ».' },
        { t: '« Ni… ni… »', ex: '« Bruno n’habite ni à Lyon ni à Nice. »', logic: 'Bruno ≠ Lyon  ∧  Bruno ≠ Nice', p: 'Simplement deux négations.' },
        { t: '« Parmi X et Y, l’un… l’autre… »', ex: '« Parmi Alice et Bruno, l’un a le chat et l’autre a 30 ans. »', logic: '{Alice, Bruno} ↔ {chat, 30 ans}', p: 'Quatre informations : Alice ≠ Bruno (évident), chat ≠ 30 ans, le chat appartient à Alice ou à Bruno, et 30 ans aussi. Dès qu’une des quatre cases est connue, les trois autres suivent.',
          demo: { grids: [{ title: 'Les deux répartitions possibles', rows: ['Alice', 'Bruno'], cols: ['Chat', '30 ans'], before: { '0,0': 'y', '1,1': 'y', '0,1': 'n', '1,0': 'n' } }, { title: 'ou', rows: ['Alice', 'Bruno'], cols: ['Chat', '30 ans'], before: { '0,1': 'y', '1,0': 'y', '0,0': 'n', '1,1': 'n' } }] } },
        { t: 'Conditionnel', ex: '« Si Alice habite à Lyon, alors Bruno a le chien. »', logic: 'A ⇒ B  ≡  ¬B ⇒ ¬A', p: 'Ne dit rien si Alice n’habite pas à Lyon ! Mais sa contraposée est précieuse : si l’on découvre que Bruno n’a pas le chien, alors Alice n’habite pas à Lyon.',
          trap: 'Erreur classique : conclure « Alice n’habite pas à Lyon, donc Bruno n’a pas le chien ». C’est faux.',
          html: '<table class="truth"><tr><th>Alice = Lyon</th><th>Bruno = chien</th><th>Indice</th></tr><tr class="ok"><td class="t1">vrai</td><td class="t1">vrai</td><td class="t1">✓</td></tr><tr><td class="t1">vrai</td><td class="t0">faux</td><td class="t0">✕</td></tr><tr class="ok"><td class="t0">faux</td><td class="t1">vrai</td><td class="t1">✓</td></tr><tr class="ok"><td class="t0">faux</td><td class="t0">faux</td><td class="t1">✓</td></tr></table>' },
        { t: 'Indices composés', ex: '« La chanteuse a un chat. »', logic: 'chanteuse = chat  ∧  chanteuse ∉ {prénoms masculins}', p: 'Une seule phrase cache souvent plusieurs informations : ici une association (chanteuse = chat) <i>et</i> un genre (« la chanteuse » est une femme, donc aucun prénom masculin). De même « Alice, qui n’est pas pilote, a le chat » = deux contraintes. Décomposez chaque phrase avant de remplir la grille.',
          tip: 'Dans le solveur, un indice peut regrouper plusieurs contraintes (bouton « Ajouter une contrainte à cet indice »), et vous pouvez rédiger son texte librement.' },
        { t: '« Seul », « ne… que »', ex: '« Seule Chloé est plus âgée que la personne de Nice. »', logic: 'Nice = 2ᵉ plus âgée  et  Chloé = plus âgée', p: 'Les quantificateurs cachés donnent des positions exactes : si une seule personne dépasse la personne de Nice, celle-ci est en avant-dernière position, et Chloé est tout en haut.' },
        { t: 'Indices grammaticaux', ex: '« Elle est arrivée avant le dentiste. »', logic: 'sujet féminin', p: 'Les accords, « Mme », « son mari », « elle » sont des informations à part entière : ils excluent les personnes du mauvais genre.',
          trap: 'Inversement, « la personne qui… » est toujours féminin grammaticalement, quel que soit le genre réel.' },
      ],
    },
    {
      id: 'avance', title: 'Manœuvres avancées',
      lead: 'Dans les integrammes difficiles, les règles directes s’épuisent. Il faut alors changer de posture : raisonner sur des hypothèses, ou faire dialoguer plusieurs indices. Ce sont les « manœuvres » qui distinguent les niveaux Expert et Extrême.',
      cards: [
        { t: 'Raisonnement par l’absurde', p: 'On suppose qu’une case est un ●, puis on enchaîne les déductions habituelles. Si l’on aboutit à une impossibilité (une ligne entièrement barrée, ou une case qui devrait être à la fois ● et ✕), l’hypothèse était fausse : la case est un ✕.',
          demo: { flow: [[{ t: 'Supposons : Alice = Lyon', k: 'hyp' }, '→', { t: 'Indice 3 ⇒ Bruno = 25 ans' }, '→', { t: 'Indice 5 ⇒ Chloé > 25 ans' }, '→', { t: 'Chloé n’a plus aucun âge possible', k: 'bad' }, '⇒', { t: 'Alice ≠ Lyon', k: 'ok' }]] },
          tip: '<b>Bien choisir sa case :</b> testez une ligne qui n’a plus que deux possibilités. Si l’une mène à une contradiction, l’autre est le ● — vous gagnez un ● d’un coup.',
          trap: 'Gardez la trace de ce qui découle de l’hypothèse (crayon, autre couleur) : tout doit être effacé ensuite, seule la conclusion reste.' },
        { t: 'Disjonction de cas', p: 'Variante très élégante : Alice n’a plus que deux villes possibles. On déroule les deux scénarios. Aucun ne mène à une contradiction, mais <b>tous deux</b> aboutissent à la même conséquence (par exemple « David n’a pas le chien »). Cette conséquence est donc certaine.',
          demo: { flow: [[{ t: 'Cas 1 : Alice = Lyon', k: 'hyp' }, '→', { t: '…' }, '→', { t: 'David ≠ chien' }], [{ t: 'Cas 2 : Alice = Nice', k: 'hyp' }, '→', { t: '…' }, '→', { t: 'David ≠ chien' }], [{ t: 'Dans les deux cas : David ≠ chien', k: 'ok' }]] },
          tip: 'Particulièrement utile quand un indice « soit… soit… » ou « l’un… l’autre… » laisse deux branches équilibrées.' },
        { t: 'Exploiter un indice à deux options', p: '« Alice est soit à Lyon, soit propriétaire du chat. » Tant que l’on ne sait pas laquelle est vraie, on sait au moins qu’Alice est « Lyon ou chat ». Tout ce qui est incompatible à la fois avec Lyon et avec le chat est donc incompatible avec Alice.',
          demo: { grids: [
            { title: 'Âge × Ville', rows: A.slice(0, 3), cols: ['Lyon'], before: { '2,0': 'n' }, focus: ['2,0'] },
            { title: 'Âge × Animal', rows: A.slice(0, 3), cols: ['Chat'], before: { '2,0': 'n' }, focus: ['2,0'] },
            { title: 'Prénom × Âge', rows: ['Alice'], cols: A.slice(0, 3), before: {}, after: { '0,2': 'n' } },
          ], cap: ['Ni Lyon ni le chat n’ont 30 ans…', '… donc Alice (qui est l’un ou l’autre) n’a pas 30 ans.'] } },
        { t: 'Chaînes de comparaisons', p: 'A < B et B < C : A est inférieur à deux personnes, il ne peut donc occuper aucune des deux valeurs les plus hautes. Inversement, C ne peut occuper aucune des deux plus basses. Les chaînes longues fixent parfois tout un ordre.',
          demo: { line: { values: A, rows: [{ name: 'A', cut: [2, 3] }, { name: 'B', cut: [0, 3] }, { name: 'C', cut: [0, 1] }] }, cap: ['A < B < C, sur quatre valeurs.', 'A : 20 ou 25. B : 25 ou 30. C : 30 ou 35.'] } },
        { t: 'Compter (principe des tiroirs)', p: 'Quand plusieurs personnes se partagent un petit nombre d’options, comptez. Trois personnes pour trois âges : chaque âge sera pris. Trois personnes pour deux options : impossible, quelque chose cloche. C’est le moteur des sous-ensembles réservés et de beaucoup de contradictions.' },
        { t: 'Et si rien ne marche ?', p: 'Une grille bien construite se résout toujours par raisonnement. Si le solveur doit recourir à la « recherche exhaustive », c’est que l’integramme exige une imbrication d’hypothèses très profonde : il reste juste (solution unique), mais devient plus une affaire de patience que d’astuce. Le générateur de l’application ne produit jamais de telles grilles.' },
      ],
    },
    {
      id: 'strategie', title: 'Méthode pas à pas',
      lead: 'Une routine qui fonctionne pour toutes les grilles, de la plus facile à la plus extrême.',
      strategy: [
        ['Une première lecture complète', 'Relevez les indices directs (● et ✕) et posez-les. Barrez mentalement les négations implicites : « avec », « avant », « plus que » impliquent deux personnes différentes.'],
        ['Systématiser après chaque ●', 'Exclusion de la ligne et de la colonne, puis transitivité : recopiez tout ce que l’on sait d’un élément vers son partenaire.'],
        ['Balayer les lignes et colonnes', 'Cherchez les cases « dernière possibilité », dans toutes les sous-grilles, y compris celles qui ne contiennent pas de prénoms.'],
        ['Revenir sur les comparaisons', 'À chaque progression, resserrez les bornes des indices « plus que » et des écarts : ils deviennent plus puissants au fil du jeu.'],
        ['Passer par une troisième catégorie', 'Quand une personne n’a plus que deux ou trois options, vérifiez si celles-ci excluent quelque chose ailleurs (élimination croisée, indices à deux options).'],
        ['Chercher les sous-ensembles', 'Deux lignes identiques avec deux options, trois lignes avec trois options : ces options sont réservées.'],
        ['En dernier recours : l’hypothèse', 'Choisissez une ligne à deux options, testez l’une, déroulez jusqu’à la contradiction ou jusqu’à une conclusion commune aux deux cas.'],
      ],
      levels: true,
    },
  ];

  function render(main, ctx) {
    demoId = 0;
    const ic = ctx.ic;
    let html = '<div class="narrow">' +
      '<div class="m-hero"><div class="eyebrow">Méthode</div><h1>Comprendre les integrammes</h1>' +
      '<p>Tout ce qu’il faut savoir pour résoudre n’importe quelle grille : la mécanique logique d’un côté, la lecture fine des indices de l’autre, puis les manœuvres réservées aux grilles extrêmes. Les illustrations s’animent quand vous les faites défiler.</p></div>' +
      '<nav class="toc" id="toc">' + SECTIONS.map(s => '<a href="#m-' + s.id + '" data-id="' + s.id + '">' + s.title + '</a>').join('') + '</nav>';
    SECTIONS.forEach(s => {
      html += '<section class="m-section" id="m-' + s.id + '"><h2>' + s.title + '</h2><p class="lead">' + s.lead + '</p>';
      if (s.cards) {
        html += '<div class="m-cards">' + s.cards.map(c =>
          '<article class="card m-card"><h3>' + (c.n ? '<span class="num">' + c.n + '</span>' : '') + esc(c.t) + '</h3>' +
          (c.ex ? '<div class="ex">' + esc(c.ex) + '</div>' : '') +
          (c.logic ? '<div class="logic">' + esc(c.logic) + '</div>' : '') +
          (c.p ? '<p>' + c.p + '</p>' : '') +
          (c.demo ? demo(c.demo) : '') +
          (c.html ? '<div class="demo">' + c.html + '</div>' : '') +
          (c.tip ? '<div class="tip">' + c.tip + '</div>' : '') +
          (c.trap ? '<div class="trap"><b>Piège · </b>' + c.trap + '</div>' : '') +
          '</article>').join('') + '</div>';
      }
      if (s.strategy) html += '<ol class="strategy">' + s.strategy.map(([b, t]) => '<li><div><b>' + b + '</b><span>' + t + '</span></div></li>').join('') + '</ol>';
      if (s.levels) {
        html += '<div class="card card-pad" style="margin-top:16px"><h3>Ce que demande chaque niveau</h3><div class="recap"><table><thead><tr><th>Niveau</th><th>Taille</th><th>Techniques nécessaires</th></tr></thead><tbody>' +
          [['Facile', '3 × 4', 'Lecture directe, exclusions, dernière possibilité, transitivité'],
           ['Moyen', '4 × 4', '+ comparaisons, « soit… soit », « l’un… l’autre »'],
           ['Difficile', '4 × 5', '+ élimination croisée, sous-ensembles, indices à deux options'],
           ['Expert', '5 × 5', 'Nombreuses déductions avancées, parfois une hypothèse'],
           ['Extrême', '5 × 5', 'Plusieurs raisonnements par l’absurde ou disjonctions de cas']]
            .map((r, i) => '<tr><td><span class="badge lv-badge lv-' + (i + 1) + '">' + r[0] + '</span></td><td>' + r[1] + '</td><td style="white-space:normal">' + r[2] + '</td></tr>').join('') +
          '</tbody></table></div></div>';
      }
      html += '</section>';
    });
    html += '<div class="card card-pad" style="margin-top:34px;text-align:center"><h3>Prêt à mettre tout ça en pratique ?</h3><p style="color:var(--ink-2)">Le bouton <b>Indice</b> d’une partie vous montre toujours la technique la plus simple disponible, avec son explication.</p><a class="btn primary big" href="#/creer">' + ic('sparkles') + 'Créer une enquête</a></div></div>';
    main.innerHTML = html;
    bindDemos(main);
    // sommaire actif
    const toc = main.querySelector('#toc');
    toc.addEventListener('click', e => {
      const a = e.target.closest('a'); if (!a) return; e.preventDefault();
      document.getElementById('m-' + a.dataset.id).scrollIntoView({ behavior: 'smooth' });
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(ents => ents.forEach(en => {
        if (en.isIntersecting) toc.querySelectorAll('a').forEach(a => { const on = 'm-' + a.dataset.id === en.target.id; a.classList.toggle('on', on); if (on) toc.scrollTo({ left: a.offsetLeft - 24, behavior: 'smooth' }); });
      }), { rootMargin: '-40% 0px -55% 0px' });
      main.querySelectorAll('.m-section').forEach(s => io.observe(s));
    }
  }

  window.Method = { render };
})();
