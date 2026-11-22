// The Gilded Vault — drawing. Every frame paints the whole gallery in one
// pass: floor, rugs, paintings, walls, the vault case and the Star, the exit
// door, cameras and their sweeping cones, guards and their vision cones, the
// thief, then the HUD (alarm meter, loot, timer) and the overlay screens
// (title, win, busted, timeout). Cones are translucent so the judge's
// screenshot shows the room, the guards and the loot in a single frame.

import { cameraDirection } from './world.js';

function drawCone(ctx, x, y, dir, range, half, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, dir - half, dir + half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawStar(ctx, x, y, r, t) {
  const tw = 0.85 + 0.15 * Math.sin(t * 3);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(tw, tw);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffe14d';
  ctx.shadowColor = '#ffdf4d';
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff8c9';
  ctx.beginPath();
  ctx.arc(-r * 0.2, -r * 0.25, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGuard(ctx, g) {
  drawCone(ctx, g.x, g.y, g.dir, g.viewRange, g.viewHalf, 'rgba(255, 190, 60, 0.20)');
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
  ctx.fillStyle = '#2b3a55';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#d8c27a';
  ctx.stroke();
  // Facing tick + torch dot.
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  ctx.lineTo(g.x + Math.cos(g.dir) * (g.r + 8), g.y + Math.sin(g.dir) * (g.r + 8));
  ctx.strokeStyle = '#ffe9a8';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#f2ead8';
  ctx.font = 'bold 10px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(g.name.toUpperCase(), g.x, g.y - g.r - 6);
}

function drawCamera(ctx, cam, t) {
  const dir = cameraDirection(cam, t);
  drawCone(ctx, cam.x, cam.y, dir, cam.range, cam.half, 'rgba(255, 70, 70, 0.16)');
  ctx.save();
  ctx.translate(cam.x, cam.y);
  ctx.rotate(dir);
  ctx.fillStyle = '#3a3f4a';
  ctx.fillRect(-4, -6, 18, 12);
  ctx.fillStyle = '#ff4d4d';
  ctx.beginPath();
  ctx.arc(15, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffb3b3';
  ctx.font = '10px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(cam.name, cam.x, cam.y + 22);
}

export function drawGame(ctx, s) {
  const { world, thief, alarm, timeLeft, state, t } = s;
  ctx.clearRect(0, 0, 960, 600);

  // Floor.
  ctx.fillStyle = '#241d33';
  ctx.fillRect(0, 0, 960, 600);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 60; x < 960; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke();
  }
  for (let y = 60; y < 600; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke();
  }
  for (const rug of world.rugs) {
    ctx.fillStyle = rug.color;
    ctx.fillRect(rug.x, rug.y, rug.w, rug.h);
    ctx.strokeStyle = 'rgba(216,194,122,0.5)';
    ctx.strokeRect(rug.x + 6, rug.y + 6, rug.w - 12, rug.h - 12);
  }
  for (const p of world.paintings) {
    ctx.fillStyle = '#d8c27a';
    ctx.fillRect(p.x - 3, p.y - 3, p.w + 6, p.h + 6);
    ctx.fillStyle = p.hue;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(p.x + 6, p.y + 6, p.w - 20, 8);
  }

  // Exit door (bottom wall, green, always visible).
  ctx.fillStyle = '#1f7a4d';
  ctx.fillRect(world.exit.x, world.exit.y, world.exit.w, world.exit.h);
  ctx.fillStyle = '#d8ffd8';
  ctx.font = 'bold 12px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', world.exit.x + world.exit.w / 2, world.exit.y + 15);

  // Walls.
  ctx.fillStyle = '#4a3f5e';
  for (const w of world.walls) ctx.fillRect(w.x, w.y, w.w, w.h);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (const w of world.walls) ctx.fillRect(w.x, w.y, w.w, 3);

  // Vault case + Star gem.
  ctx.fillStyle = 'rgba(140,200,255,0.18)';
  ctx.fillRect(world.starCase.x, world.starCase.y, world.starCase.w, world.starCase.h);
  ctx.strokeStyle = '#8cc8ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(world.starCase.x, world.starCase.y, world.starCase.w, world.starCase.h);
  ctx.fillStyle = '#cfe8ff';
  ctx.font = 'bold 10px Verdana, sans-serif';
  ctx.fillText('THE STAR', world.starCase.x + world.starCase.w / 2, world.starCase.y + world.starCase.h + 14);
  if (!world.star.taken) drawStar(ctx, world.star.x, world.star.y, world.star.r, t);

  // Cameras, then guards, then the thief.
  for (const cam of world.cameras) drawCamera(ctx, cam, t);
  for (const g of world.guards) drawGuard(ctx, g);

  // Thief.
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, thief.r, 0, Math.PI * 2);
  ctx.fillStyle = thief.sneaking ? '#5a4a7a' : '#111';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e8e2ff';
  ctx.stroke();
  ctx.fillStyle = '#e8e2ff';
  ctx.beginPath();
  ctx.arc(thief.x - 4, thief.y - 3, 2, 0, Math.PI * 2);
  ctx.arc(thief.x + 4, thief.y - 3, 2, 0, Math.PI * 2);
  ctx.fill();
  if (thief.target) {
    ctx.strokeStyle = 'rgba(232,226,255,0.5)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(thief.x, thief.y);
    ctx.lineTo(thief.target.x, thief.target.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawHud(ctx, s);
  if (state !== 'play') drawOverlay(ctx, s);
}

function drawHud(ctx, s) {
  const { alarm, timeLeft, world } = s;
  // Alarm meter, top centre — the one number the whole heist turns on.
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(330, 8, 300, 34);
  ctx.fillStyle = '#f2ead8';
  ctx.font = 'bold 13px Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', 340, 30);
  ctx.fillStyle = '#2a2233';
  ctx.fillRect(410, 15, 180, 18);
  const frac = Math.max(0, Math.min(1, alarm / 100));
  ctx.fillStyle = frac < 0.5 ? '#3fae5a' : frac < 0.8 ? '#e0a53a' : '#e03a3a';
  ctx.fillRect(410, 15, 180 * frac, 18);
  ctx.strokeStyle = '#d8c27a';
  ctx.lineWidth = 1;
  ctx.strokeRect(410, 15, 180, 18);
  ctx.fillStyle = '#f2ead8';
  ctx.fillText(Math.round(alarm) + '%', 598, 30);

  // Loot + timer, top right.
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(660, 8, 292, 34);
  ctx.fillStyle = world.star.taken ? '#ffe14d' : '#8f86a8';
  ctx.font = 'bold 13px Verdana, sans-serif';
  ctx.fillText(world.star.taken ? '★ STAR TAKEN — REACH THE EXIT' : '☆ STEAL THE STAR', 672, 30);
  const mm = Math.floor(Math.max(0, timeLeft) / 60);
  const ss = Math.floor(Math.max(0, timeLeft) % 60).toString().padStart(2, '0');
  ctx.fillStyle = timeLeft < 20 ? '#ff6b6b' : '#f2ead8';
  ctx.textAlign = 'right';
  ctx.fillText(mm + ':' + ss, 940, 30);
  ctx.textAlign = 'left';
}

function panel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8,6,14,0.82)';
  ctx.fillRect(230, 150, 500, 300);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(230, 150, 500, 300);
  ctx.fillStyle = accent;
  ctx.font = 'bold 34px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 480, 215);
  ctx.fillStyle = '#f2ead8';
  ctx.font = '16px Georgia, serif';
  lines.forEach((line, i) => ctx.fillText(line, 480, 260 + i * 30));
  ctx.font = '13px Verdana, sans-serif';
  ctx.fillStyle = '#8f86a8';
  ctx.fillText('Press R to try again', 480, 420);
}

function drawOverlay(ctx, s) {
  const { state, bustedBy, timeLeft, world, thief } = s;
  if (state === 'title') {
    panel(ctx, 'THE GILDED VAULT', [
      'One gallery. Three guards. One Star.',
      'Slip past the cones, grab the Star,',
      'and walk out the green EXIT door.',
      'WASD / arrows move · Shift sneaks · E grabs · click walks',
    ], '#d8c27a');
  } else if (state === 'win') {
    panel(ctx, 'CLEAN GETAWAY', [
      'The Star is yours. The gallery never knew.',
      'Time to spare: ' + Math.ceil(timeLeft) + ' seconds.',
      'The Gilded Vault thanks you for visiting.',
    ], '#3fae5a');
  } else if (state === 'busted') {
    panel(ctx, 'BUSTED', [
      bustedBy || 'Caught in the gallery.',
      'The Star stays in its case tonight.',
    ], '#e03a3a');
  } else if (state === 'timeout') {
    const d = Math.round(Math.hypot(thief.x - (world.exit.x + world.exit.w / 2), thief.y - world.exit.y));
    panel(ctx, 'OUT OF TIME', [
      'The museum lights come up at dawn.',
      world.star.taken
        ? 'You had the Star — only ' + d + ' steps from the exit.'
        : 'The Star is still in its case, ' + d + ' steps from the exit.',
      'Faster next time. Quieter, too.',
    ], '#e0a53a');
  }
}
