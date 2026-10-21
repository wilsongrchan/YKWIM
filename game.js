// YKWIM game rules. Authoritative: runs in the host's browser (and in node for tests).
// Clients send intents via handle(); every peer gets its own filtered view() so hidden info
// (the keyword, the clues) only reaches the people allowed to see it.
(function (root) {
  const DATA = {
    en: {
      Animals: 'zebra dolphin penguin kangaroo giraffe octopus eagle rabbit spider elephant monkey parrot',
      Food: 'pizza cheese waffle noodle cookie pumpkin lemon honey yogurt ketchup apple orange',
      Places: 'island jungle desert glacier volcano library harbor castle forest valley lighthouse mountain',
      Objects: 'umbrella mirror candle scissors compass wallet helmet camera clock ladder kettle blanket',
      Nature: 'ocean river rainbow thunder eclipse iceberg feather marble shadow cactus',
      Fantasy: 'dragon wizard unicorn vampire pirate robot snowman rocket'
    },
    fr: {
      Animaux: 'zèbre dauphin manchot kangourou girafe pieuvre aigle lapin araignée éléphant singe perroquet',
      Nourriture: 'pizza fromage gaufre nouille biscuit citrouille citron miel yaourt ketchup pomme orange',
      Lieux: 'île jungle désert glacier volcan bibliothèque port château forêt vallée phare montagne',
      Objets: 'parapluie miroir bougie ciseaux boussole portefeuille casque caméra horloge échelle bouilloire couverture',
      Nature: 'océan rivière tonnerre éclipse iceberg plume marbre ombre cactus',
      Fantastique: 'dragon sorcier licorne vampire pirate robot fusée'
    }
  };
  const SYMBOL_COST = 5;             // every symbol costs a flat 5, and doesn't move the letter price up
  const DEFAULT_SETTINGS = { lang: 'en', banCount: 3, teamSize: 3, mode: 'score', target: 500, words: 10, pot: 120, writeSecs: 30, penalty: 5, firstBonus: 20, speedSecs: 15, sequential: false };
  const START_COST = 10, STEP = 2;   // nth letter a clue-giver types costs START + STEP * (n - 1)
  const FINAL_MS = 10000;            // once one team guesses it, the other team has this long
  const GRACE_MS = 1500;             // host waits this long past a writing deadline for the client's auto-submit
  const ROLES = ['giver1', 'giver2', 'guesser'];
  const STAGE_ROLE = { giver1: 'giver1', giver2: 'giver2', guess: 'guesser' };

  const SYMBOLS = '.,?!@#$%&*+-=/()~^:;\'_';   // allowed in clues at a flat cost each
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  // A clue is capital letters plus free symbols; anything else is dropped.
  const cleanClue = raw => [...String(raw).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()]
    .filter(c => /[A-Z]/.test(c) || SYMBOLS.includes(c)).join('').slice(0, 30);
  const letterCount = s => (String(s).match(/[A-Za-z]/g) || []).length;
  const costOf = (n, used) => { let c = 0; for (let i = 0; i < n; i++) c += START_COST + STEP * (used + i); return c; };

  function createGame(opts = {}) {
    const now = opts.now || Date.now;
    const setT = opts.setTimeout || setTimeout, clearT = opts.clearTimeout || clearTimeout;
    const onChange = opts.onChange || (() => {});
    const hostId = opts.hostId || 'host';

    const G = {
      phase: 'lobby',                         // lobby | round | roundEnd | over
      settings: { ...DEFAULT_SETTINGS },
      players: {},                            // id -> { name, token, connected }
      seats: [[null, null, null], [null, null, null]],
      names: ['Team Gold', 'Team Blue'],
      scores: [0, 0], round: 0, deck: [], card: null, teams: [null, null], firstCorrect: null, winner: null
    };
    const change = () => onChange();

    // ---------- helpers ----------
    const teamOf = id => G.seats.findIndex(t => t.includes(id));
    // Teams of 3: giver 1, giver 2 and the guesser are three different seats. Teams of 2: one clue-giver (one clue) and a guesser.
    // Either way the seats rotate every round.
    const seatIdx = (t, role) => G.settings.teamSize === 2 ? (G.round + (role === 'guesser' ? 1 : 0)) % 2 : (G.round + ROLES.indexOf(role)) % 3;
    const holder = (t, role) => G.seats[t][seatIdx(t, role)];
    // A device normally sits on one team. In pass-and-play it holds both; then the team whose turn it is is "its" team.
    const actTeam = id => {
      const ts = [0, 1].filter(t => G.seats[t].includes(id));
      if (ts.length < 2) return ts.length ? ts[0] : -1;
      const live = G.teams[0] && ts.find(t => !['done', 'waiting'].includes(G.teams[t].stage));
      return live === undefined ? ts[0] : live;
    };
    const rolesOf = (id, t = actTeam(id)) => t < 0 ? [] : ROLES.filter(r => holder(t, r) === id);
    const pot = t => Math.max(0, G.settings.pot - G.teams[t].spent);
    function seatName(t, seatIdx) {
      const id = G.seats[t][seatIdx]; if (!id || !G.players[id]) return `Seat ${seatIdx + 1}`;
      const mine = G.seats[t].map((s, i) => s === id ? i : -1).filter(i => i >= 0);
      return mine.length > 1 ? `${G.players[id].name} (${mine.indexOf(seatIdx) + 1})` : G.players[id].name;
    }
    const roleName = (t, role) => seatName(t, seatIdx(t, role));
    const banned = () => { const n = norm(G.card.word); return n.length >= 4 ? [...new Set([...n].filter(c => !'aeiou'.includes(c)).slice(0, G.settings.banCount))] : []; };
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

    // ---------- players & lobby ----------
    function addPlayer(id, name, token) {
      name = String(name || '').trim().slice(0, 14) || 'Player';
      const old = Object.keys(G.players).find(k => k !== id && token && G.players[k].token === token);
      if (old) { // returning player: take over their old seats
        delete G.players[old];
        G.seats = G.seats.map(t => t.map(s => s === old ? id : s));
      }
      G.players[id] = { name, token, connected: true };
      change();
    }
    function disconnect(id) {
      if (!G.players[id]) return;
      if (G.phase === 'lobby') { G.seats = G.seats.map(t => t.map(s => s === id ? null : s)); delete G.players[id]; }
      else G.players[id].connected = false;
      change();
    }
    function vacate(id, exceptTeam) { G.seats = G.seats.map((t, i) => i === exceptTeam ? t : t.map(s => s === id ? null : s)); }

    // ---------- round flow ----------
    function newTeamState() {
      return { stage: 'giver1', deadline: null, timer: null, clues: [], spent: 0, used: 0, log: [], result: null, earned: 0, breakdown: null, guessDeadline: null, guessStart: null };
    }
    function arm(t, ms, fn) { const T = G.teams[t]; clearT(T.timer); T.timer = setT(fn, ms); }

    function startRound() {
      if (!G.deck.length) G.deck = shuffle(Object.entries(DATA[G.settings.lang])
        .flatMap(([cat, ws]) => ws.split(' ').map(word => ({ cat, word }))));
      G.card = G.deck.pop(); G.firstCorrect = null; G.phase = 'round';
      G.teams = [newTeamState(), newTeamState()];
      if (G.settings.sequential) { // pass-and-play: teams take turns, alternating who goes first
        const first = G.round % 2;
        G.teams[1 - first].stage = 'waiting';
        beginWriting(first, 'giver1');
      } else [0, 1].forEach(t => beginWriting(t, 'giver1'));
    }
    function beginWriting(t, stage) {
      const T = G.teams[t], ms = G.settings.writeSecs * 1000;
      T.stage = stage; T.used = 0; T.deadline = now() + ms;
      arm(t, ms + GRACE_MS, () => { if (T.stage === stage) submitClue(t, '', true); }); // client's own auto-submit normally wins
    }
    function submitClue(t, raw, auto) {
      const T = G.teams[t];
      let text = cleanClue(raw);
      const ban = banned(), answer = norm(G.card.word);
      if (!auto) {
        if (norm(text).includes(answer)) return { error: "You can't type the keyword itself!" };
        const bad = [...ban].filter(c => text.toLowerCase().includes(c));
        if (bad.length) return { error: `Banned letters: ${bad.join(', ').toUpperCase()}` };
      } else {
        text = [...text].filter(c => !ban.includes(c.toLowerCase())).join('');
        if (norm(text).includes(answer)) text = '';
      }
      const n = letterCount(text), sym = text.length - n;
      T.spent += costOf(n, T.used) + sym * SYMBOL_COST; T.used += n; T.clues.push(text);
      clearT(T.timer); T.deadline = null;
      if (pot(t) === 0) finishTeam(t, 'out', 0);
      else if (T.stage === 'giver1' && G.settings.teamSize === 3) beginWriting(t, 'giver2');   // teams of two: a single clue
      else enterGuess(t);
      change();
      return {};
    }
    function enterGuess(t) {
      const T = G.teams[t]; T.stage = 'guess'; T.guessStart = now();
      if (G.firstCorrect !== null && G.firstCorrect !== t) startFinal(t);
    }
    function startFinal(t) {
      const T = G.teams[t]; T.guessDeadline = now() + FINAL_MS;
      arm(t, FINAL_MS, () => { if (T.stage === 'guess') { finishTeam(t, 'timeout', 0); change(); } });
    }
    function finishTeam(t, result, earned) {
      const T = G.teams[t]; clearT(T.timer);
      T.stage = 'done'; T.result = result; T.earned = earned; T.deadline = T.guessDeadline = null;
      const o = G.teams[1 - t];
      if (G.settings.sequential && o.stage === 'waiting') beginWriting(1 - t, 'giver1');
      if (G.teams[0].stage === 'done' && G.teams[1].stage === 'done') endRound();
    }
    function endRound() {
      [0, 1].forEach(t => G.scores[t] += G.teams[t].earned);
      const [a, b] = G.scores, s = G.settings;
      // "score" mode: first to the target. "words" mode: after a fixed number of words. A tie plays on (sudden death).
      const finished = s.mode === 'words' ? G.round + 1 >= s.words : (a >= s.target || b >= s.target);
      if (finished && a !== b) { G.phase = 'over'; G.winner = a > b ? 0 : 1; }
      else G.phase = 'roundEnd';
    }
    function guess(t, raw) {
      const T = G.teams[t], text = norm(raw).toUpperCase().slice(0, 24);
      if (!text) return {};
      if (text.toLowerCase() === norm(G.card.word)) {
        T.log.push({ text, ok: true });
        // Score = what's left of the pot (after letter costs and wrong guesses) + first-to-guess bonus + quick-guess bonus.
        // (no first-to-guess bonus or 10s limit in pass-and-play: the teams don't play at the same time)
        const s = G.settings, first = G.firstCorrect === null && !s.sequential;
        // Quick bonus counts down: speedSecs points at the start, 1 fewer for every full second since the clues appeared.
        const quick = Math.max(0, s.speedSecs - Math.floor((now() - T.guessStart) / 1000));
        T.breakdown = { base: pot(t), first: first ? s.firstBonus : 0, speed: quick };
        finishTeam(t, 'correct', T.breakdown.base + T.breakdown.first + T.breakdown.speed);
        if (first) {
          G.firstCorrect = t;
          const o = 1 - t; if (G.teams[o].stage === 'guess') startFinal(o);
        }
      } else {
        T.spent += G.settings.penalty; T.log.push({ text, ok: false, cost: G.settings.penalty });
        if (pot(t) === 0) finishTeam(t, 'out', 0);
      }
      change();
      return {};
    }

    // ---------- intents ----------
    function handle(id, m) {
      if (!G.players[id]) return { error: 'Not in this room.' };
      const isHost = id === hostId;
      switch (m.type) {
        case 'sit': {
          if (G.phase !== 'lobby') return { error: 'Game already started.' };
          const { team, seat } = m;
          if (![0, 1].includes(team) || !(Number.isInteger(seat) && seat >= 0 && seat < G.settings.teamSize)) return {};
          const cur = G.seats[team][seat]; if (cur && cur !== id) return { error: 'Seat taken.' };
          vacate(id, team); G.seats[team][seat] = id; G.settings.sequential = false; change(); return {};
        }
        case 'sitAll': { // one device plays a whole team
          if (G.phase !== 'lobby') return { error: 'Game already started.' };
          const { team } = m; if (![0, 1].includes(team)) return {};
          if (G.seats[team].some(s => s && s !== id)) return { error: 'Some seats on that team are taken.' };
          vacate(id, team); G.seats[team] = Array(G.settings.teamSize).fill(id); G.settings.sequential = false; change(); return {};
        }
        case 'stand': if (G.phase === 'lobby') { vacate(id, -1); G.settings.sequential = false; change(); } return {};
        case 'passAndPlay': { // everyone shares the host's device; teams take turns
          if (!isHost || G.phase !== 'lobby') return {};
          G.seats = [0, 1].map(() => Array(G.settings.teamSize).fill(id)); G.settings.sequential = true; change(); return {};
        }
        case 'settings': {
          if (!isHost || G.phase !== 'lobby') return {};
          const s = G.settings, n = Number(m.value);
          if (m.key === 'lang' && DATA[m.value]) s.lang = m.value;
          else if (m.key === 'mode' && ['score', 'words'].includes(m.value)) s.mode = m.value;
          else if (m.key === 'banCount' && [2, 3, 4].includes(n)) s.banCount = n;
          else if (m.key === 'teamSize' && [2, 3].includes(n)) {
            s.teamSize = n; // seats beyond the new size are dropped
            G.seats = G.seats.map(t => Array.from({ length: n }, (_, i) => t[i] || null));
          }
          else if (m.key === 'target' && n >= 50 && n <= 2000) s.target = n;
          else if (m.key === 'words' && n >= 1 && n <= 50) s.words = n;
          else if (m.key === 'pot' && n >= 40 && n <= 300) s.pot = n;
          else if (m.key === 'writeSecs' && n >= 10 && n <= 120) s.writeSecs = n;
          else if (m.key === 'penalty' && n >= 0 && n <= 20) s.penalty = n;
          else if (m.key === 'firstBonus' && n >= 0 && n <= 100) s.firstBonus = n;
          else if (m.key === 'speedSecs' && n >= 0 && n <= 30) s.speedSecs = n;
          change(); return {};
        }
        case 'resetSettings': { // back to the defaults (pass-and-play stays on if it was chosen)
          if (!isHost || G.phase !== 'lobby') return {};
          const keep = G.settings.sequential;
          G.settings = { ...DEFAULT_SETTINGS, sequential: keep };
          G.seats = G.seats.map(t => Array.from({ length: G.settings.teamSize }, (_, i) => t[i] || null));
          change(); return {};
        }
        case 'teamName': {
          if (!isHost || G.phase !== 'lobby' || ![0, 1].includes(m.team)) return {};
          G.names[m.team] = String(m.name || '').trim().slice(0, 16) || `Team ${m.team + 1}`; change(); return {};
        }
        case 'start': {
          if (!isHost || G.phase !== 'lobby') return {};
          if (G.seats.some(t => t.some(s => !s))) return { error: 'Fill all 6 seats first.' };
          G.scores = [0, 0]; G.round = 0; G.deck = []; G.winner = null; startRound(); change(); return {};
        }
        case 'next': {
          if (!isHost || G.phase !== 'roundEnd') return {};
          G.round++; startRound(); change(); return {};
        }
        case 'toLobby': {
          if (!isHost || !['over', 'roundEnd', 'round'].includes(G.phase)) return {};
          (G.teams || []).forEach(T => T && clearT(T.timer));
          G.phase = 'lobby'; G.card = null; change(); return {};
        }
        case 'skip': { // host ends a stuck word
          if (!isHost || G.phase !== 'round') return {};
          [0, 1].forEach(t => { if (G.teams[t].stage !== 'done') finishTeam(t, 'skipped', 0); });
          change(); return {};
        }
        case 'clue': {
          if (G.phase !== 'round') return {};
          const t = actTeam(id); if (t < 0) return {};
          const T = G.teams[t];
          if (!['giver1', 'giver2'].includes(T.stage) || !rolesOf(id).includes(STAGE_ROLE[T.stage])) return {};
          return submitClue(t, m.text, !!m.auto);
        }
        case 'guess': {
          if (G.phase !== 'round') return {};
          const t = actTeam(id); if (t < 0 || G.teams[t].stage !== 'guess' || !rolesOf(id).includes('guesser')) return {};
          return guess(t, m.text);
        }
        case 'giveup': {
          if (G.phase !== 'round') return {};
          const t = actTeam(id); if (t < 0 || G.teams[t].stage !== 'guess' || !rolesOf(id).includes('guesser')) return {};
          finishTeam(t, 'gaveup', 0); change(); return {};
        }
      }
      return {};
    }

    // ---------- per-peer view ----------
    function view(id) {
      const reveal = G.phase === 'roundEnd' || G.phase === 'over';
      const v = {
        phase: G.phase, me: id, isHost: id === hostId, hostId, settings: G.settings, names: G.names, scores: G.scores,
        winner: G.winner, costs: { start: START_COST, step: STEP, symbol: SYMBOL_COST },
        players: Object.entries(G.players).map(([pid, p]) => ({ id: pid, name: p.name, connected: p.connected })),
        seats: G.seats.map((t, ti) => t.map((s, si) => s ? { id: s, name: seatName(ti, si) } : null)),
        myTeam: actTeam(id) < 0 ? null : actTeam(id),
        sharedDevice: actTeam(id) >= 0 && G.seats[actTeam(id)].filter(s => s === id).length > 1   // one device, several people
      };
      if (G.phase === 'lobby' || !G.card) return v;

      const mt = v.myTeam, roles = rolesOf(id);
      v.myRoles = roles; v.round = {
        n: G.round, cat: G.card.cat, blanks: [...G.card.word].map(ch => /\p{L}/u.test(ch) ? 1 : 0),
        teams: [0, 1].map(t => {
          const T = G.teams[t], mine = t === mt;
          const rem = T.deadline ? T.deadline - now() : T.guessDeadline ? T.guessDeadline - now() : null;
          const tv = { stage: T.stage, result: T.result, earned: T.earned, breakdown: T.breakdown, remaining: rem === null ? null : Math.max(0, rem) };
          if (mine || reveal) tv.clues = (T.stage === 'guess' || T.stage === 'done' || reveal) ? T.clues : null;
          if (mine || reveal) tv.log = T.log;
          if (mine) {
            tv.pot = pot(t); tv.used = T.used;
            if (T.stage === 'guess') tv.speedLeft = Math.max(0, T.guessStart + G.settings.speedSecs * 1000 - now());
          }
          return tv;
        }),
        roleNames: mt === null ? null : Object.fromEntries(ROLES.map(r => [r, roleName(mt, r)]))
      };
      const isGiver = roles.includes('giver1') || roles.includes('giver2');
      if (reveal || (G.phase === 'round' && isGiver)) { v.round.word = G.card.word; }
      if (G.phase === 'round' && isGiver) v.round.banned = banned().map(c => c.toUpperCase());
      if (mt !== null && G.phase === 'round' && roles.includes('giver2') && G.teams[mt].stage === 'giver2' && seatIdx(mt, 'giver1') !== seatIdx(mt, 'giver2'))
        v.round.usedLetters = [...G.teams[mt].clues[0]].filter(c => /[A-Z]/.test(c)).sort().join(' ');
      return v;
    }

    return { addPlayer, disconnect, handle, view, state: G };
  }

  const api = { createGame, norm, costOf, SYMBOLS, SYMBOL_COST, START_COST, STEP, FINAL_MS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.YKWIM = api;
})(typeof window !== 'undefined' ? window : globalThis);
