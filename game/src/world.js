// The Gilded Vault — level layout, guards, cameras, collision and detection.
// One museum gallery, 960x600. The thief starts by the service door (bottom
// left), the Star gem sits in a glass case in the vault alcove (top right),
// and the exit is the green door on the bottom wall. Guards walk fixed
// patrol routes; wall cameras sweep fixed arcs. Nothing here is random: the
// same layout loads every time, so a screenshot can be reproduced exactly.

export const ROOM = { w: 960, h: 600 };

export function buildWorld() {
  return {
    // Solid rectangles the thief and guards cannot cross.
    walls: [
      { x: 0, y: 0, w: 960, h: 18 },      // north wall
      { x: 0, y: 582, w: 960, h: 18 },   // south wall
      { x: 0, y: 0, w: 18, h: 600 },     // west wall
      { x: 942, y: 0, w: 18, h: 600 },   // east wall
      { x: 300, y: 0, w: 26, h: 170 },   // gallery divider, north
      { x: 300, y: 250, w: 26, h: 150 }, // gallery divider, south (gap = doorway)
      { x: 620, y: 120, w: 26, h: 200 }, // vault partition
      { x: 620, y: 400, w: 26, h: 182 }, // vault partition, lower (gap = vault door)
      { x: 120, y: 300, w: 110, h: 34 }, // display plinth A
      { x: 430, y: 420, w: 120, h: 34 }, // display plinth B
      { x: 700, y: 430, w: 130, h: 34 }, // display plinth C
      { x: 120, y: 90, w: 110, h: 34 },  // display plinth D
    ],
    // Decorative floor props that do not block movement.
    rugs: [
      { x: 60, y: 440, w: 180, h: 110, color: '#3a1530' },
      { x: 360, y: 60, w: 200, h: 120, color: '#1c2a3a' },
      { x: 680, y: 60, w: 200, h: 110, color: '#33261a' },
    ],
    paintings: [
      { x: 40, y: 22, w: 70, h: 46, hue: '#c96f2e' },
      { x: 150, y: 22, w: 70, h: 46, hue: '#2e7f6f' },
      { x: 700, y: 22, w: 70, h: 46, hue: '#7f2e5a' },
      { x: 810, y: 22, w: 70, h: 46, hue: '#4a6fc9' },
      { x: 40, y: 532, w: 70, h: 46, hue: '#8a7a2e' },
    ],
    star: { x: 880, y: 80, r: 16, taken: false },
    starCase: { x: 838, y: 44, w: 84, h: 72 },
    exit: { x: 60, y: 560, w: 120, h: 22 },
    start: { x: 90, y: 500 },
    guards: [
      {
        name: 'Rook', x: 200, y: 180, r: 13, speed: 52, dir: 0,
        route: [{ x: 200, y: 180 }, { x: 200, y: 480 }, { x: 200, y: 180 }],
        leg: 0, viewRange: 185, viewHalf: 0.62,
      },
      {
        name: 'Bishop', x: 470, y: 120, r: 13, speed: 46, dir: 0,
        route: [{ x: 470, y: 120 }, { x: 470, y: 470 }, { x: 470, y: 120 }],
        leg: 0, viewRange: 175, viewHalf: 0.58,
      },
      {
        name: 'Warden', x: 760, y: 300, r: 13, speed: 58, dir: 0,
        route: [{ x: 760, y: 300 }, { x: 880, y: 300 }, { x: 760, y: 300 }],
        leg: 0, viewRange: 190, viewHalf: 0.6,
      },
    ],
    cameras: [
      { name: 'Cam 1', x: 330, y: 30, base: Math.PI / 2, sweep: 0.9, period: 5.2, phase: 0, range: 210, half: 0.5 },
      { name: 'Cam 2', x: 650, y: 590, base: -Math.PI / 2, sweep: 1.0, period: 6.4, phase: 1.7, range: 200, half: 0.5 },
      { name: 'Cam 3', x: 930, y: 330, base: Math.PI, sweep: 0.8, period: 4.6, phase: 3.1, range: 200, half: 0.48 },
    ],
  };
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function circleHitsWalls(world, x, y, r) {
  const box = { x: x - r, y: y - r, w: 2 * r, h: 2 * r };
  for (const w of world.walls) if (rectsOverlap(box, w)) return true;
  return false;
}

// Segment (x1,y1)-(x2,y2) blocked by any wall? Sampled, cheap and exact
// enough for a 960x600 room: a wall between eye and thief breaks the sight.
export function sightBlocked(world, x1, y1, x2, y2) {
  const steps = 24;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    for (const w of world.walls) {
      if (px >= w.x && px <= w.x + w.w && py >= w.y && py <= w.y + w.h) return true;
    }
  }
  return false;
}

export function guardSees(world, guard, px, py, sneaking) {
  const dx = px - guard.x;
  const dy = py - guard.y;
  const dist = Math.hypot(dx, dy);
  const range = sneaking ? guard.viewRange * 0.72 : guard.viewRange;
  if (dist > range) return false;
  let ang = Math.atan2(dy, dx) - guard.dir;
  while (ang > Math.PI) ang -= 2 * Math.PI;
  while (ang < -Math.PI) ang += 2 * Math.PI;
  if (Math.abs(ang) > guard.viewHalf) return false;
  return !sightBlocked(world, guard.x, guard.y, px, py);
}

export function cameraSees(world, cam, t, px, py, sneaking) {
  const dir = cam.base + cam.sweep * Math.sin((2 * Math.PI * t) / cam.period + cam.phase);
  const dx = px - cam.x;
  const dy = py - cam.y;
  const dist = Math.hypot(dx, dy);
  const range = sneaking ? cam.range * 0.72 : cam.range;
  if (dist > range) return false;
  let ang = Math.atan2(dy, dx) - dir;
  while (ang > Math.PI) ang -= 2 * Math.PI;
  while (ang < -Math.PI) ang += 2 * Math.PI;
  if (Math.abs(ang) > cam.half) return false;
  return !sightBlocked(world, cam.x, cam.y, px, py);
}

export function cameraDirection(cam, t) {
  return cam.base + cam.sweep * Math.sin((2 * Math.PI * t) / cam.period + cam.phase);
}

export function moveGuard(world, guard, dt) {
  const target = guard.route[(guard.leg + 1) % guard.route.length];
  const dx = target.x - guard.x;
  const dy = target.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) {
    guard.leg = (guard.leg + 1) % guard.route.length;
    return;
  }
  guard.dir = Math.atan2(dy, dx);
  const step = Math.min(dist, guard.speed * dt);
  guard.x += (dx / dist) * step;
  guard.y += (dy / dist) * step;
}
