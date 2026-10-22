// A bot that plays one-team (Co-op) games by itself so you can watch the screens, or run it fast to see how the grades come out.
// Local only: index.html loads it when the address has ?bot (see the end of index.html).
//   http://127.0.0.1:8000/index.html?bot              watch it play at a human pace
//   http://127.0.0.1:8000/index.html?bot&speed=0      no pauses: many games a minute, tally in the corner
//   &skill=1.2   how well the guesser reads clues (1 = typical; 0.8 = shaky, 1.3 = sharp)
//   &words=5     words a game        &size=3  team size (2 or 3 or 4)        &lang=es|fr|en  keyword language
// The bot is not a real player: the clues are the starts of other words from the same category, and the guesser just "knows" the word and succeeds with a chance that grows with the letters in the clues.
// It tests costs and grade cutoffs, not whether clues are good.
(() => {
  const q = new URLSearchParams(location.search);
  const SPEED = q.has('speed') ? +q.get('speed') : 1, SKILL = q.has('skill') ? +q.get('skill') : 1;
  const sleep = ms => new Promise(r => setTimeout(r, ms * SPEED));
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const game = YKWIM.createGame({ hostId: 'host', lang: q.get('lang') || LANG, onChange: () => onView(game.view('host')) });
  const send = m => game.handle('host', m);
  net = { code: 'BOTS', isHost: true, send };
  game.addPlayer('host', 'Bot');

  // tally of finished games, shown in the corner
  const tally = { games: 0, gained: 0, grades: {} };
  window.BOTSTATS = tally;
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:90;background:rgba(0,0,0,.72);color:#fff;font:12px/1.4 ui-monospace,monospace;padding:8px 10px;border-radius:10px;pointer-events:none;max-width:70vw';
  document.body.appendChild(box);
  const showTally = note => {
    const per5 = tally.games ? Math.round(tally.gained / tally.games / (V.settings.words || 6) * 5) : 0;
    box.innerHTML = `🤖 bot · skill ${SKILL} · ${note || ''}<br>games ${tally.games} · avg gained per 5 words ${per5}<br>` + ['YKWIM', 'KWIM', 'WIM', 'IM', 'M'].map(g => `${g} ${tally.grades[g] || 0}`).join(' · ');
  };

  const setup = () => {
    send({ type: 'settings', key: 'teams', value: 'one' });
    if (q.has('size')) send({ type: 'settings', key: 'teamSize', value: +q.get('size') });
    if (q.has('words')) send({ type: 'settings', key: 'words', value: +q.get('words') });
    if (q.get('lang')) send({ type: 'settings', key: 'lang', value: q.get('lang') });
    send({ type: 'sitAll', team: 0 });
    send({ type: 'start' });
  };

  let word = '', busy = false;
  const typeInto = async (id, text) => {   // type it letter by letter into the real box, so it can be watched
    const el = document.getElementById(id);
    if (!el || SPEED === 0) return;
    el.value = '';
    for (const c of text) { el.value += c; el.dispatchEvent(new Event('input', { bubbles: true })); await sleep(260); }
    await sleep(500);
  };
  // Clues are short stand-ins, like a person would type: the start of another word from the same category (KIWI for a fruit, TIG for a
  // big cat), not letters picked out of the keyword. Banned letters are left out, as the engine would do anyway.
  const clueFor = (k, last, banned, len, cat) => {
    const ban = banned.map(b => b.toUpperCase()), answer = YKWIM.norm(word);
    const others = (YKWIM.WORDS[V.settings.lang] || YKWIM.WORDS.en).filter(e => e.cat === cat && YKWIM.norm(e.word) !== answer).map(e => YKWIM.norm(e.word).toUpperCase());
    const want = Math.max(1, Math.min(last ? 2 + rnd(3) : 2 + rnd(2), len - 1));
    for (let tries = 0; tries < 20; tries++) {
      const src = others.length ? others[rnd(others.length)] : shuffle([...answer.toUpperCase()]).join('');
      const text = [...src].filter(c => !ban.includes(c)).slice(0, want).join('');
      if (text && !answer.includes(text.toLowerCase())) return text;
    }
    return shuffle([...answer.toUpperCase()].filter(c => !ban.includes(c))).slice(0, want).join('');
  };
  const wrongGuess = len => {
    const same = (YKWIM.WORDS[V.settings.lang] || YKWIM.WORDS.en).map(e => YKWIM.norm(e.word)).filter(w => w.length === len && w !== YKWIM.norm(word));
    return (same.length ? same[rnd(same.length)] : shuffle([...YKWIM.norm(word)]).join('')).toUpperCase();
  };

  async function step() {
    const v = V;
    if (!v) return;
    if (v.phase === 'lobby') { setup(); return; }
    if (v.phase === 'roundEnd') { await sleep(2200); send({ type: 'next' }); return; }
    if (v.phase === 'over') {
      if (v.rating && !v._counted) {
        v._counted = true; tally.games++; tally.gained += v.scores[0] - v.settings.bank;
        tally.grades[v.rating.label] = (tally.grades[v.rating.label] || 0) + 1; showTally('game over: ' + v.rating.label);
      }
      await sleep(5000); send({ type: 'toLobby' }); return;
    }
    if (v.phase !== 'round' || !v.round) return;
    const r = v.round, T = r.teams[0];
    if (r.word) word = r.word;   // only a clue-giver gets to see it
    if (/^giver\d$/.test(T.stage)) {
      const k = +T.stage.slice(5), last = k === v.settings.teamSize - 1;
      await sleep(900);
      if (r.word) word = r.word;
      const text = clueFor(k, last, r.banned || [], YKWIM.norm(word).length, r.cat);
      await typeInto('clue', text);
      send({ type: 'clue', text });
    } else if (T.stage === 'guess') {
      if (T.awaitReady) { await sleep(900); send({ type: 'guessReady' }); return; }
      const letters = (T.clues || []).join('').replace(/[^A-Za-z]/g, '').length, tries = (T.log || []).filter(g => g.ok === false).length;
      const p = Math.min(0.95, Math.max(0.05, (0.05 + 0.1 * letters) * SKILL + 0.1 * tries));
      await sleep(1500 + rnd(1500));
      const right = Math.random() < p;
      if (!right && tries >= 1) { send({ type: 'giveup' }); return; }
      const text = right ? YKWIM.norm(word).toUpperCase() : wrongGuess(YKWIM.norm(word).length);
      await typeInto('guess', text);
      send({ type: 'guess', text });
    }
  }
  (async () => {
    for (;;) {
      await sleep(SPEED === 0 ? 5 : 400);
      if (busy) continue;
      busy = true;
      try { await step(); showTally(); } catch (e) { console.error('bot', e); } finally { busy = false; }
    }
  })();
})();
