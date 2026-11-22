/* Integramme — calculs lourds hors du fil principal */
importScripts('core.js', 'themes.js', 'generator.js');

self.onmessage = function (ev) {
  const { id, cmd } = ev.data;
  const reply = (data) => self.postMessage(Object.assign({ id }, data));
  try {
    if (cmd === 'generate') {
      const opts = Object.assign({}, ev.data.opts, { onProgress: (pr) => reply({ progress: pr }) });
      reply({ result: Gen.generate(opts) });
    } else if (cmd === 'explain') {
      reply({ result: Core.solveExplained(ev.data.puzzle) });
    } else if (cmd === 'analyze') {
      const p = ev.data.puzzle;
      const c = Core.countSolutions(p, 2);
      let ex = null;
      if (c.count === 1) { ex = Core.solveExplained(p); ex.rating = Core.rate(ex); }
      reply({ result: { count: c.count, sols: c.sols, aborted: c.aborted, explain: ex } });
    } else if (cmd === 'hint') {
      const P = Core.compile(ev.data.puzzle);
      const S = new Core.State(P, Int8Array.from(ev.data.m));
      Core.checkEmpty(S);
      const st = S.bad ? null : Core.nextStep(S, 5);
      if (st) Core.enrich(S, st);
      reply({ result: st, bad: S.bad });
    }
  } catch (e) {
    reply({ error: String(e && e.stack || e) });
  }
};
