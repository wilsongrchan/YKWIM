# 字字珠璣 (YKWIM Chinese Version)

The Chinese edition: same shell as the English game (rooms over PeerJS, lobby, themes, score bars), different rules. Own `game.js` and `index.html`; served at `/YKWIM/zh/`.

- **Name:** 字字珠璣, with a small "YKWIM Chinese Version" under it. The logo characters use Mochiy Pop One (the chunky round cousin of the English Lilita One); Latin letters (the grades YKWIM, KWIM...) stay in Lilita One.
- **Rules:** a clue is written in Chinese characters only: no sound-only clues, no symbols or punctuation. A clue-giver's characters cost 15, 30, 60, 120 (each double the one before) and the count restarts for the next clue-giver. Costs are held back and only paid if the team gets the word (refunded otherwise). A character is banned if any reading of it has the same sound (initial + final, any tone) as a syllable of the keyword. The next clue-giver sees the *sounds* of earlier clues (no tone, no order), the guesser sees the characters. See the in-game 玩法說明 (the numbers come from `game.js`, so they can't drift).
- **Terms:** 提示人 (clue-giver), 提示字 (clue), 猜謎人 (guesser), 謎底 (keyword).
- **Pinyin:** shown with tone marks (xióng), typed as marks, numbers or zhuyin (`parseReading`); `pinyinOf` prints marks, `pinyinNum` the number form.
- **Storage / rooms:** peer IDs and localStorage keys use the `ykwimzh-` prefix so Chinese and English never collide (same origin).
- **Keyword bank:** edit the word lists in `tools/gen-bank.js`, then `npm i pinyin-pro@3.27.0 opencc-js && node tools/gen-bank.js`. That rewrites the bank and the syllable list inside `game.js` (readings from pinyin-pro, `FIX` for overrides, simplified forms from opencc). Bump the `?v=` on the `game.js` script tag afterwards.
- **pinyin-pro in the browser** (jsDelivr, pinned) looks up how each typed character is read, for the sound ban and for what the next clue-giver sees. If it fails to load the game still works, but typed characters go unchecked and later clue-givers see no sounds.
- **Interpretations to confirm in playtests:** a later clue-giver sees earlier readings sorted, without tone or order (the draft only says "no tone"); a Pass swaps to one new shared keyword; wrong guesses cost 5 (setting); grades use cutoffs of 75/200/300/425 points per 5 words (`RATING_CUTS`, worked out from the 15/30/60/120 prices and simulated teams), still to be checked in real play.
- Icons are shared from the parent folder.
