// The Gilded Vault — input. Keyboard movement (WASD + arrows), Shift to
// sneak, E / Space to grab, R to restart, M to mute. Mouse click sets a
// walk-to target on the floor; the thief walks there until a key is pressed.

export function createInput(canvas) {
  const keys = new Set();
  const input = { keys, target: null, grabPressed: false, restartPressed: false, mutePressed: false, startPressed: false };

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase());
    if (e.key === 'e' || e.key === ' ') input.grabPressed = true;
    if (e.key === 'r' || e.key === 'R') input.restartPressed = true;
    if (e.key === 'm' || e.key === 'M') input.mutePressed = true;
    if (e.key === 'Enter') input.startPressed = true;
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 960;
    const y = ((e.clientY - rect.top) / rect.height) * 600;
    input.target = { x, y };
    input.startPressed = true;
  });

  return input;
}

export function moveVector(keys) {
  let x = 0;
  let y = 0;
  if (keys.has('a') || keys.has('arrowleft')) x -= 1;
  if (keys.has('d') || keys.has('arrowright')) x += 1;
  if (keys.has('w') || keys.has('arrowup')) y -= 1;
  if (keys.has('s') || keys.has('arrowdown')) y += 1;
  if (x !== 0 && y !== 0) {
    x *= Math.SQRT1_2;
    y *= Math.SQRT1_2;
  }
  return { x, y };
}
