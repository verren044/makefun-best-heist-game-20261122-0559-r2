// The Gilded Vault — game loop and rules. States: title → play → win /
// busted / timeout, R restarts from any end screen. The alarm rises while
// any guard or camera sees the thief (faster for a guard, slower for a
// camera, slower still while sneaking) and drains when unseen. At 100 the
// gallery locks down. Grab the Star (E / Space, within reach), then reach
// the green EXIT door before the 120-second clock runs out.

import { buildWorld, circleHitsWalls, guardSees, cameraSees, moveGuard } from './world.js';
import { drawGame } from './render.js';
import { createInput, moveVector } from './input.js';
import { createAudio } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);

const audio = createAudio();
const input = createInput(canvas);

let world;
let thief;
let state;        // 'title' | 'play' | 'win' | 'busted' | 'timeout'
let alarm;        // 0..100
let timeLeft;     // seconds
let bustedBy;     // text shown on the BUSTED screen
let t;            // seconds since load, drives camera sweeps + star twinkle
let stepClock;

function reset() {
  world = buildWorld();
  thief = { x: world.start.x, y: world.start.y, r: 12, sneaking: false, target: null };
  state = 'title';
  alarm = 0;
  timeLeft = 120;
  bustedBy = '';
  t = 0;
  stepClock = 0;
}

reset();

function tryGrab() {
  if (state !== 'play' || world.star.taken) return;
  const d = Math.hypot(thief.x - world.star.x, thief.y - world.star.y);
  if (d < 46) {
    world.star.taken = true;
    audio.grab();
  }
}

function bust(cause) {
  state = 'busted';
  bustedBy = cause;
  audio.stopAlarm();
  audio.busted();
}

function update(dt) {
  t += dt;
  if (state === 'title') {
    if (input.startPressed || input.grabPressed) {
      state = 'play';
      audio.unlock();
    }
    input.startPressed = false;
    input.grabPressed = false;
    return;
  }
  if (state !== 'play') {
    if (input.restartPressed) reset();
    input.restartPressed = false;
    return;
  }

  // Movement: keys win over a click target; Shift sneaks.
  const vec = moveVector(input.keys);
  thief.sneaking = input.keys.has('shift');
  const speed = thief.sneaking ? 95 : 175;
  let mx = vec.x;
  let my = vec.y;
  if (mx === 0 && my === 0 && thief.target) {
    const dx = thief.target.x - thief.x;
    const dy = thief.target.y - thief.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) {
      thief.target = null;
    } else {
      mx = dx / dist;
      my = dy / dist;
    }
  } else if (mx !== 0 || my !== 0) {
    thief.target = null;
  }
  const nx = thief.x + mx * speed * dt;
  const ny = thief.y + my * speed * dt;
  if (!circleHitsWalls(world, nx, thief.y, thief.r)) thief.x = nx;
  if (!circleHitsWalls(world, thief.x, ny, thief.r)) thief.y = ny;
  thief.x = Math.max(18 + thief.r, Math.min(942 - thief.r, thief.x));
  thief.y = Math.max(18 + thief.r, Math.min(582 - thief.r, thief.y));
  if ((mx !== 0 || my !== 0) && t - stepClock > 0.34) {
    stepClock = t;
    audio.step();
  }

  for (const g of world.guards) moveGuard(world, g, dt);

  // Detection: guards and cameras, sneaking shrinks every cone.
  let seenBy = null;
  let rate = 0;
  for (const g of world.guards) {
    if (guardSees(world, g, thief.x, thief.y, thief.sneaking)) {
      seenBy = 'Guard ' + g.name + ' spotted you in the open.';
      rate = Math.max(rate, thief.sneaking ? 22 : 42);
    }
  }
  for (const cam of world.cameras) {
    if (cameraSees(world, cam, t, thief.x, thief.y, thief.sneaking)) {
      if (!seenBy) seenBy = cam.name + ' caught you on camera.';
      rate = Math.max(rate, thief.sneaking ? 14 : 26);
    }
  }
  if (rate > 0) {
    alarm = Math.min(100, alarm + rate * dt);
    if (alarm > 55) audio.startAlarm();
  } else {
    alarm = Math.max(0, alarm - 9 * dt);
    if (alarm < 40) audio.stopAlarm();
  }
  if (alarm >= 100) {
    bust('LOCKDOWN — the alarm hit 100%. The gallery sealed itself.');
    return;
  }
  if (seenBy && alarm >= 100) return;

  // Grab + win.
  if (input.grabPressed) tryGrab();
  input.grabPressed = false;
  if (world.star.taken) {
    const ex = world.exit;
    if (thief.x > ex.x && thief.x < ex.x + ex.w && thief.y + thief.r >= ex.y) {
      state = 'win';
      audio.stopAlarm();
      audio.win();
      return;
    }
  }

  // Clock.
  timeLeft -= dt;
  if (timeLeft <= 0) {
    timeLeft = 0;
    state = 'timeout';
    audio.stopAlarm();
    audio.busted();
  }
  if (input.restartPressed) reset();
  input.restartPressed = false;
  if (input.mutePressed) { audio.toggleMute(); input.mutePressed = false; }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  drawGame(ctx, { world, thief, alarm, timeLeft, state, bustedBy, t });
  requestAnimationFrame(frame);
}

// Screenshot presets (?shot=start|play|vault|busted) freeze the game in a
// staged state so the maker's screenshots are real renders of this code.
applyShot(params, { get state() { return state; }, setState(v) { state = v; }, world, thief, setAlarm(v) { alarm = v; }, setTime(v) { timeLeft = v; }, setBusted(v) { bustedBy = v; }, setT(v) { t = v; } });

requestAnimationFrame(frame);
