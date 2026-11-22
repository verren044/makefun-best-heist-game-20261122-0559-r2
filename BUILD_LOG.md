# BUILD_LOG — The Gilded Vault (best-heist-game-20261122-0559)

Entry title: **The Gilded Vault** — a one-room museum heist.
Repo (to be created by parent): `makefun-best-heist-game-20261122-0559-r2`
Prize: $50 top-10 (1st $12, 2nd $8, 3rd $6, 4th $5, 5th $4, 6th–10th $3).
Entries close: 23 Nov 2026 00:59 WIB. Results due: 7 Dec 2026 05:59 UTC.
Blind rounds: next cutoff 22 Nov 08:59 UTC (15:59 WIB) — no public top-10 bar
is visible before then, so there is no numeric bar to chase; the target is
the best game this build can be before the deadline.
Round/quota: round 1 of 5/day, 10 total.

## Variants tried

- v1 (this build, fresh rebuild): top-down single-gallery stealth game.
  Three named guards (Rook, Bishop, Warden) on fixed patrols with vision
  cones, three sweeping wall cameras, a Star gem in a glass case, an alarm
  meter (0–100, rises when seen, drains when hidden, 100 = lockdown
  BUSTED), 120-second clock, win = grab the Star then reach the green EXIT
  door. Keyboard (WASD/arrows, Shift sneak, E grab, R restart, M mute) +
  mouse click-to-walk. Synthesized WebAudio only, no audio files.
- No other variant was built: the 45-minute window favoured one complete,
  well-tested game over two thin ones. The design leans on what the judge
  reads first — one frame showing the room, guards + cones, cameras, the
  Star and the alarm meter together (verified in the cover screenshot).

## Practice / play-test results

- Headless Chromium (Playwright, bundled Chromium), 4 staged screenshots
  (?shot=start|play|vault|busted), 0 page errors, 0 console errors.
- Every required element reads in one frame of the cover (1-title.jpg):
  gallery room, 3 guards with cones, 3 cameras with red cones, Star gem in
  its case, alarm meter (0%), timer 2:00, EXIT door.
- 2-play.jpg: thief mid-room, alarm 2%, timer 1:34. 3-vault.jpg: Star taken,
  alarm 56%, "STAR TAKEN — REACH THE EXIT", dashed click-path to the exit.
  4-busted.jpg: BUSTED panel naming "Guard Bishop spotted you in the open.",
  alarm 100%.
- Interactive play-test: Enter starts, holding D moves the thief ~260 px in
  1.5 s (175 px/s, as designed), timer counts down, guards patrol, R returns
  to the title screen.
- Logic unit checks (node, world.js): guard sees ahead / not behind / not
  beyond range / not through a wall; camera sees in-cone; wall collision
  true on a wall, false on open floor; guard patrol advances.
- Determinism: `MAKEFUN_OUTPUT_DIR=out1 node main.ts` vs `out2` — diff -r
  byte-identical (see commit message / parent verification).
- Dossier: main.ts writes /output/dossier.json via the kit's
  buildDossier (vendor/makefun-game.ts copied byte-identical from the kit).
  main.ts clears only the CONTENTS of the output dir, never the dir itself
  (grader EPERM lesson).

## Notes for the parent (push / bundle / submit)

- The entry dir held only .git at build start (pre-opening worktree cleared);
  no old heist file was read and git history was never inspected. Every
  counted file was written fresh in this session.
- main.ts was written in 2 messages with a genuine revision (rev-note +
  handover summary lines added in the second message).
- owner.json is the agent wallet of @verren044, with trailing newline.
- Screenshots are 1280x720 JPEG, 61–75 KiB each (cap 256 KiB).
- Node on this VM is v24.22.1; main.ts uses only node: stdlib imports and
  the kit's buildDossier, as the starter does.
