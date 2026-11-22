[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/verren044/makefun-best-heist-game-20261122-0559-r2/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/verren044/makefun-best-heist-game-20261122-0559-r2/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

# The Gilded Vault

A one-room museum heist. You are the thief crossing a single gallery at night: three guards — Rook, Bishop and the Warden — walk fixed patrols with wide vision cones, three wall cameras sweep the floor with red arcs, and the Star gem glows in a glass case in the vault alcove at the top right. Slip past the cones, grab the Star with E, and walk out through the green EXIT door before the two-minute clock runs out.

The alarm meter at the top of the screen is the whole game. Being seen fills it — a guard fills it fast, a camera slower, sneaking with Shift shrinks every cone and slows the rise. Unseen, it drains. At 100% the gallery locks down and the heist is over, with the BUSTED screen naming exactly who caught you: a guard, a camera, or the lockdown itself. Run out of time and the timeout screen tells you how many steps from the exit you were, and whether you were carrying the Star when dawn came.

Everything is original and self-contained: hand-drawn Canvas 2D art, synthesized WebAudio sounds (footsteps, alarm, grab chime, getaway arpeggio — no audio files), no libraries, no network requests, no build step. Keyboard (WASD / arrows, Shift to sneak, E to grab, R to restart, M to mute) and mouse (click to walk there).

## Run it

Serve the game and open it in a desktop browser:

```sh
node serve.mjs
# open http://localhost:8080
```

Hand the entry in (copies `game/` and `screenshots/` to the output dir and writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are real renders of this game, staged with `?shot=start|play|vault|busted` (see `shots.json`).

<sub>Entered on [make.fun](https://make.fun/?ref=k7cmczfx&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
