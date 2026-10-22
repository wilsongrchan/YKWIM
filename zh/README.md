# YKWIM 中文版

The Chinese edition: same shell as the English game (rooms over PeerJS, lobby, themes, score bars), different rules. Own `game.js` and `index.html`; served at `/YKWIM/zh/`.

- **Rules:** sound is free, the written character costs +10, the guesser puts the meaning together. See the in-game 玩法說明 (the numbers come from `game.js`, so they can't drift).
- **Storage / rooms:** peer IDs and localStorage keys use the `ykwimzh-` prefix so Chinese and English never collide (same origin).
- **Keyword bank:** edit the word lists in `tools/gen-bank.js`, then `npm i pinyin-pro@3.27.0 opencc-js && node tools/gen-bank.js`. That rewrites the bank and the syllable list inside `game.js` (readings from pinyin-pro, `FIX` for overrides, simplified forms from opencc). Bump the `?v=` on the `game.js` script tag afterwards.
- **pinyin-pro in the browser** (jsDelivr, pinned) is only used to check that a bought character really reads the way the clue-giver said, and to fill the reading in. If it fails to load the game still works; bought characters just go unchecked.
- **Interpretations to confirm in playtests:** a later clue-giver sees earlier readings sorted, without tone or order (the draft only says "no tone"); a Pass swaps to one new shared keyword; wrong guesses cost 5 (setting); grades use cutoffs of 200/325/425/500 points per 5 words (`RATING_CUTS`), which are a first guess.
- Icons are shared from the parent folder.
