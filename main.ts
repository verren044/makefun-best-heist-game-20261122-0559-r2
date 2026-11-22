// The Gilded Vault — a one-room museum heist for make.fun
// best-heist-game-20261122-0559 (Node 22, standard library only).
// The game is this directory's game/ folder, plain static files a desktop
// browser loads offline (game/index.html and its ES modules, no library and
// no network request). This program hands it in: it copies game/ and
// screenshots/ from beside this file to /output and writes
// /output/dossier.json with the vendored make.fun library.
//
// Serve it locally with `node serve.mjs`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Clear only the CONTENTS of the output dir, never the dir itself: the
// grader runs as an unprivileged user on a read-only filesystem, and
// deleting /output itself fails with EPERM.
mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}

cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
// Rev-note: after the dossier is written, print the handover summary so a
// local run shows exactly what the grader will receive (game files, shots,
// dossier bytes) without opening the output dir by hand.
import { readdirSync as listDir, statSync } from 'node:fs';

function countFiles(dir) {
  let n = 0;
  for (const e of listDir(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? countFiles(join(dir, e.name)) : 1;
  }
  return n;
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(
  `gilded-vault handed in: ${countFiles(join(out, 'game'))} game files, ` +
  `${listDir(join(out, 'screenshots')).length} screenshots, ` +
  `dossier ${statSync(join(out, 'dossier.json')).size} bytes -> ${out}`,
);
