// YKWIM bots: computer players that play a whole match through the same intents a real phone sends, using only what each
// seat is allowed to see (view(id)). Time is virtual, so a match can run in real time, sped up, or instantly.
// Used by bots.html (watch them play) and by node (run many matches for statistics).
(function (root) {
  const Y = typeof module !== 'undefined' && module.exports ? require('./game.js') : root.YKWIM;

  // ---------- virtual clock ----------
  function makeClock() {
    let t = 1e9, id = 0, q = [];
    return {
      now: () => t,
      setTimeout: (fn, ms) => { const h = { id: ++id, t: t + ms, fn }; q.push(h); return h; },
      clearTimeout: h => { const i = q.indexOf(h); if (i >= 0) q.splice(i, 1); },
      advance(ms) {
        const end = t + ms;
        for (;;) {
          q.sort((a, b) => a.t - b.t || a.id - b.id);
          if (!q.length || q[0].t > end) break;
          const h = q.shift(); t = Math.max(t, h.t); h.fn();
        }
        t = end;
      }
    };
  }

  // ---------- personalities ----------
  // Thrifty givers squeeze words and avoid long ones; Lavish givers happily pay for the most telling clue. A guesser's skill is the chance they know a given word.
  const STYLES = {
    Thrifty:  { fear: 0.030 },   // fear: how much one point of cost weighs against how telling a clue is
    Balanced: { fear: 0.015 },
    Lavish:   { fear: 0.005 }
  };
  const FREQ = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';   // common to rare: rarer letters narrow the answer down more
  const PHANTOMS = 30;   // other words a guesser could just as easily think of when nothing in the clues points anywhere
  const COORD = 0.8;   // chance clue-giver 2 correctly works out which association clue-giver 1 typed
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
    const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };
  const vocab = Y.TIERS.flatMap((_, i) => Y.tierWords(i + 1));

  const CUES = typeof module !== 'undefined' && module.exports ? require('./bots-clues.js') : root.YKWIM_CUES;
  const VOWELS = 'AEIOU';
  // A person squeezes a word to save letters: TRANSPARENT -> TRNSPRNT (keep the first letter, drop the vowels) or just its first four letters.
  const skeleton = w => w[0] + [...w.slice(1)].filter(c => !VOWELS.includes(c)).join('');
  // Every way a bot could type one association: { text, rank (how telling the association is), kind }
  function variants(word) {
    const out = [];
    (CUES[word] || []).forEach((cue, rank) => {
      out.push({ text: cue, rank, kind: 'full', q: 1 });
      const sk = skeleton(cue); if (sk !== cue && sk.length >= 3) out.push({ text: sk, rank, kind: 'squeezed', q: 0.85 });
      if (cue.length > 5) out.push({ text: cue.slice(0, 4), rank, kind: 'short', q: 0.75 });
    });
    return out;
  }
  const lettersOf = t => [...t].filter(c => /[A-Z]/.test(c));
  // how strongly a typed clue token points at a cue
  function strength(token, cue) {
    if (token === cue) return 1;
    const sk = skeleton(cue);
    if (token === sk) return 0.9;
    if (token.length >= 3 && cue.startsWith(token)) return 0.7;
    if (token.length >= 3 && sk.startsWith(token)) return 0.6;
    return 0;
  }
  // plain fallback when no association can be typed without a banned letter: letters out of the keyword itself
  function spellingHint(word, banned, n, exclude = []) {
    const pool = [...new Set(Y.norm(word).toUpperCase())].filter(c => !banned.includes(c) && !exclude.includes(c));
    const scored = pool.map(c => [FREQ.indexOf(c) + rand(0, 7), c]).sort((x, y) => y[0] - x[0]).slice(0, n).map(x => x[1]);
    return [...Y.norm(word).toUpperCase()].filter((c, i, arr) => scored.includes(c) && arr.indexOf(c) === i).join('');
  }
  const consonantsBanned = (word, count) => {
    const n = Y.norm(word);
    return n.length >= 4 ? [...new Set([...n].filter(c => !'aeiou'.includes(c)).slice(0, count))].map(c => c.toUpperCase()) : [];
  };

  // ---------- one match ----------
  // opts: { styles: ['Balanced', 'Thrifty'], skills: [0.8, 0.8], teamSize, settings: {...}, onEvent, pause: ms between words }
  function createMatch(opts = {}) {
    const clock = makeClock();
    const styles = opts.styles || ['Balanced', 'Balanced'], skills = opts.skills || [0.8, 0.8];
    const teamSize = opts.teamSize || 3, pause = opts.pause ?? 4000;
    const onEvent = opts.onEvent || (() => {});
    const g = Y.createGame({ now: clock.now, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout, onChange: () => queueMicrotaskSafe(plan) });
    // change notifications can arrive while the game is mid-update; do the bots' thinking right after, not inside it
    let dirty = false;
    function queueMicrotaskSafe(fn) { if (!dirty) { dirty = true; clock.setTimeout(() => { dirty = false; fn(); }, 0); } }

    const names = [['Ada', 'Bo', 'Cy'], ['Dee', 'Eli', 'Fay']];
    const ids = [['host', 'a2', 'a3'], ['b1', 'b2', 'b3']];
    const nameOf = {};
    ids.forEach((t, ti) => t.forEach((id, i) => { nameOf[id] = names[ti][i]; g.addPlayer(id, names[ti][i], id); }));
    g.handle('host', { type: 'teamName', team: 0, name: 'Gold' }); g.handle('host', { type: 'teamName', team: 1, name: 'Blue' });
    if (teamSize === 2) g.handle('host', { type: 'settings', key: 'teamSize', value: 2 });
    for (const [k, v] of Object.entries(opts.settings || {})) g.handle('host', { type: 'settings', key: k, value: v });
    ids.forEach((t, ti) => t.slice(0, teamSize).forEach((id, si) => g.handle(id, { type: 'sit', team: ti, seat: si })));
    const G = g.state;
    const teamOfId = id => ids[0].includes(id) ? 0 : 1;

    // ---- what happened (for the log and for statistics) ----
    const seen = { phase: '', round: -1, clues: [0, 0], log: [0, 0], stage: ['', ''], spent: [0, 0] };
    const ev = e => onEvent({ t: clock.now(), ...e });
    function observe() {
      if (G.phase === 'lobby') return;
      if (G.phase === 'round' && seen.round !== G.round) {
        seen.round = G.round; seen.clues = [0, 0]; seen.log = [0, 0]; seen.stage = ['', '']; seen.spent = [0, 0];
        ev({ type: 'round', n: G.round, word: G.card.word, cat: G.card.cat, level: G.level, levelName: Y.TIERS[G.level - 1].name,
          banned: consonantsBanned(G.card.word, G.settings.banCount), reward: G.settings.reward, longBonus: G.longBonus, scores: [...G.scores] });
      }
      if (!G.teams[0] || seen.round !== G.round) return;
      [0, 1].forEach(t => {
        const T = G.teams[t];
        while (seen.clues[t] < T.clues.length) {
          const i = seen.clues[t]++, text = T.clues[i], letters = (text.match(/[A-Z]/g) || []).length;
          ev({ type: 'clue', team: t, idx: i, text, letters, kind: noteKind[`${G.round}:${t}:${i}`] || 'none', symbols: text.length - letters, cost: T.spent - seen.spent[t], by: nameOf[ids[t][(G.round + (teamSize === 2 ? 0 : i)) % teamSize]] });
          seen.spent[t] = T.spent;
        }
        while (seen.log[t] < T.log.length) { const l = T.log[seen.log[t]++]; ev({ type: 'guess', team: t, text: l.text, ok: l.ok, cost: l.cost || 0 }); }
        if (T.stage !== seen.stage[t]) {
          seen.stage[t] = T.stage;
          if (T.stage === 'done') ev({ type: 'done', team: t, result: T.result, earned: T.earned, breakdown: T.breakdown, spent: T.spent });
        }
      });
      if (G.phase !== seen.phase) {
        seen.phase = G.phase;
        if (G.phase === 'roundEnd') ev({ type: 'roundEnd', n: G.round, scores: [...G.scores] });
        if (G.phase === 'over') ev({ type: 'over', n: G.round, winner: G.winner, scores: [...G.scores], bankrupt: G.bankrupt });
      }
    }

    // ---- the bots ----
    const noteKind = {};          // how each clue was made: full, squeezed, short, spelling, none
    const pending = new Map();   // bot id -> key of the action already scheduled
    function schedule(id, key, ms, fn) {
      if (pending.get(id) === key) return;
      pending.set(id, key);
      clock.setTimeout(() => { if (pending.get(id) === key) { fn(); } }, ms);
    }
    function plan() {
      observe();
      if (G.phase === 'lobby') { if (!pending.get('host-start')) { pending.set('host-start', 1); g.handle('host', { type: 'start' }); } return; }
      if (G.phase === 'roundEnd') { schedule('host', 'next' + G.round, pause, () => g.handle('host', { type: 'next' })); return; }
      if (G.phase !== 'round') return;
      Object.keys(nameOf).forEach(id => {
        if (!ids[teamOfId(id)].slice(0, teamSize).includes(id)) return;
        const v = g.view(id), mt = v.myTeam, tv = v.round.teams[mt], S = STYLES[styles[mt]];
        const tag = `${G.round}:`;
        if (v.myRoles.includes('giver1') && tv.stage === 'giver1') schedule(id, tag + 'g1', rand(5, 14) * 1000, () => writeClue(id, mt, 0));
        else if (v.myRoles.includes('giver2') && tv.stage === 'giver2') schedule(id, tag + 'g2', rand(5, 14) * 1000, () => writeClue(id, mt, 1));
        else if (v.myRoles.includes('guesser') && tv.stage === 'guess') {
          if (tv.awaitReady) schedule(id, tag + 'ready', rand(1, 2.5) * 1000, () => g.handle(id, { type: 'guessReady' }));
          else if (tv.clues) schedule(id, tag + 'guess' + tv.log.length, rand(2, 5) * 1000 + 700 * Math.log2(1 + candidates(v, mt).length), () => guessNow(id, mt));
        }
      });
    }
    function writeClue(id, mt, idx) {
      const v = g.view(id), S = STYLES[styles[mt]], word = v.round.word, banned = v.round.banned, key = Y.norm(word);
      const seen = idx ? (v.round.usedLetters || '').split(' ').filter(Boolean).join('') : '';   // letters giver 1 used (a string like 'ENTS')
      const all = variants(word.toLowerCase());
      let opts = all.filter(o => !lettersOf(o.text).some(c => banned.includes(c)) && !Y.norm(o.text).includes(key));
      if (idx && seen) {
        // Clue-giver 2 can see which letters were used. They never retype them, work out which association giver 1 meant (usually)
        // and steer to a different one, and prefer clues that bring in new letters.
        const same = lettersOf(seen).sort().join('');
        opts = opts.filter(o => lettersOf(o.text).sort().join('') !== same);
        const mine = all.find(o => lettersOf(o.text).sort().join('') === same);
        if (mine && Math.random() < COORD) opts = opts.filter(o => o.rank !== mine.rank);
        opts = opts.filter(o => lettersOf(o.text).some(c => !seen.includes(c)) || lettersOf(o.text).length > seen.length);
        opts.forEach(o => { o.fresh = lettersOf(o.text).filter(c => !seen.includes(c)).length / Math.max(1, lettersOf(o.text).length); });
      }
      const paid = i => lettersOf(i).length;
      const best = opts.map(o => ({ o, v: o.q * (1 - 0.1 * o.rank) * (idx ? 0.6 + 0.4 * (o.fresh ?? 1) : 1) - S.fear * (Y.costOf(paid(o.text), 0)) + rand(0, 0.08) })).sort((x, y) => y.v - x.v)[0];
      let text = best ? best.o.text : '', kind = best ? best.o.kind : 'none';
      if (!best) { text = spellingHint(word, banned, 2, seen.split('')); kind = text ? 'spelling' : 'none'; }
      noteKind[`${G.round}:${mt}:${idx}`] = kind;
      const r = g.handle(id, { type: 'clue', text });
      if (r.error) g.handle(id, { type: 'clue', text: '' });
    }
    function scoreFor(e, tokens, mt) {
      const cues = CUES[e.word] || [];
      return tokens.reduce((sum, tok) => {
        let best = 0;
        for (const c of cues) {
          let st = strength(tok, c);
          if (st && hash(tok + c + e.word + mt) > skills[mt] + 0.1) st *= 0.4;   // half-remembered association
          best = Math.max(best, st);
        }
        return sum + best;
      }, 0);
    }
    function candidates(v, mt) {
      const tv = v.round.teams[mt], clueLetters = new Set(lettersOf((tv.clues || []).join('')));
      const tried = new Set((tv.log || []).map(l => l.text)), shape = JSON.stringify(v.round.blanks), skill = skills[mt];
      return vocab.filter(e => e.cat === v.round.cat && JSON.stringify([...e.word].map(ch => /[a-z]/i.test(ch) ? 1 : 0)) === shape)
        .map(e => ({ ...e, key: Y.norm(e.word).toUpperCase() }))
        .filter(e => !tried.has(e.key) && hash(e.key + mt) < skill)                                 // words this team has heard of
        .filter(e => !consonantsBanned(e.word, v.settings.banCount).some(c => clueLetters.has(c)));   // the banned letters can't be in a clue
    }
    function guessNow(id, mt) {
      const v = g.view(id), tv = v.round.teams[mt];
      if (tv.stage !== 'guess') return;
      const tokens = tv.clues.filter(Boolean).map(c => c.replace(/[^A-Z]/g, '')).filter(Boolean);
      const c = candidates(v, mt).map(e => ({ e, s: scoreFor(e, tokens, mt) + Math.random() * 0.15 })).sort((a, b) => b.s - a.s);
      if (!c.length || (tv.log || []).length >= 3) { g.handle(id, { type: 'giveup' }); return; }
      // With no clue pointing anywhere, a person is picking from every word they know, not just this short list:
      // the chance the right one comes to mind is small. Model that as a pool of PHANTOMS other words.
      const noLead = c[0].s < 0.6, real = c.length;
      if (noLead && Math.random() > real / (real + PHANTOMS)) {
        const other = vocab.filter(e => e.cat === v.round.cat && Y.norm(e.word).toUpperCase() !== c[0].e.key);
        g.handle(id, { type: 'guess', text: Y.norm(other[Math.floor(Math.random() * other.length)].word).toUpperCase() + 'S' });
        return;
      }
      g.handle(id, { type: 'guess', text: c[0].e.key });
    }

    plan();
    return {
      g, clock, nameOf, styles, skills,
      // advance virtual time; returns true once the match is over
      step(ms) { clock.advance(ms); observe(); return G.phase === 'over'; },
      get over() { return G.phase === 'over'; }
    };
  }

  // run a whole match instantly and return its events
  function runMatch(opts = {}) {
    const events = [], m = createMatch({ ...opts, onEvent: e => events.push(e) });
    for (let i = 0; i < 20000 && !m.step(1000); i++);
    return { events, over: m.over, rounds: m.g.state.round + 1, scores: [...m.g.state.scores], winner: m.g.state.winner };
  }

  const api = { createMatch, runMatch, STYLES, makeClock };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.YKWIM_BOTS = api;
})(typeof window !== 'undefined' ? window : globalThis);
