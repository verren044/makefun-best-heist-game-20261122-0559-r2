// The Gilded Vault — screenshot presets. ?shot= stages one frozen moment
// of the real game so the maker's screenshots are genuine renders:
//   start  — title screen over the gallery
//   play   — mid-heist: thief crossing the room, cones sweeping, Star in case
//   vault  — Star taken, alarm high, thief running for the exit
//   busted — BUSTED screen naming the guard who caught the thief
// Positions are fixed, so every render of the same preset is identical.

export function applyShot(params, game) {
  const shot = params.get('shot');
  if (!shot) return;
  const w = game.world;
  const thief = game.thief;
  if (shot === 'start') {
    game.setState('title');
    game.setT(1.2);
  } else if (shot === 'play') {
    game.setState('play');
    game.setT(2.4);
    thief.x = 430;
    thief.y = 300;
    thief.target = null;
    w.guards[0].x = 200; w.guards[0].y = 320; w.guards[0].dir = Math.PI / 2;
    w.guards[1].x = 470; w.guards[1].y = 260; w.guards[1].dir = -Math.PI / 2;
    w.guards[2].x = 800; w.guards[2].y = 300; w.guards[2].dir = Math.PI;
    game.setAlarm(18);
    game.setTime(96);
  } else if (shot === 'vault') {
    game.setState('play');
    game.setT(4.8);
    w.star.taken = true;
    thief.x = 700;
    thief.y = 480;
    thief.target = { x: 120, y: 560 };
    w.guards[0].x = 200; w.guards[0].y = 420; w.guards[0].dir = 0;
    w.guards[1].x = 470; w.guards[1].y = 380; w.guards[1].dir = Math.PI / 2;
    w.guards[2].x = 820; w.guards[2].y = 330; w.guards[2].dir = -Math.PI / 2;
    game.setAlarm(72);
    game.setTime(41);
  } else if (shot === 'busted') {
    game.setState('busted');
    game.setT(3.1);
    thief.x = 430;
    thief.y = 300;
    thief.target = null;
    w.guards[1].x = 470; w.guards[1].y = 260; w.guards[1].dir = -Math.PI / 2;
    game.setAlarm(100);
    game.setTime(58);
    game.setBusted('Guard Bishop spotted you in the open.');
  }
}
