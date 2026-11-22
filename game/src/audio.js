// The Gilded Vault — sound. Everything is synthesized with WebAudio:
// a soft footstep tick, a rising alarm tone, a chime when the Star is
// taken, a low sting on BUSTED, a bright arpeggio on the getaway. No audio
// files, no network. M toggles mute; audio starts on the first key or
// click, because browsers block sound before a gesture.

export function createAudio() {
  let ctx = null;
  let muted = false;
  let alarmOsc = null;
  let alarmGain = null;

  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, when = 0) {
    const ac = ensure();
    if (!ac || muted) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; if (muted) this.stopAlarm(); return muted; },
    get muted() { return muted; },
    step() { tone(180, 0.05, 'triangle', 0.05); },
    grab() {
      tone(660, 0.12, 'sine', 0.18);
      tone(990, 0.18, 'sine', 0.18, 0.09);
      tone(1320, 0.25, 'sine', 0.15, 0.18);
    },
    busted() {
      tone(220, 0.4, 'sawtooth', 0.16);
      tone(147, 0.6, 'sawtooth', 0.16, 0.15);
    },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'sine', 0.16, i * 0.11));
    },
    startAlarm() {
      const ac = ensure();
      if (!ac || muted || alarmOsc) return;
      alarmOsc = ac.createOscillator();
      alarmGain = ac.createGain();
      alarmOsc.type = 'square';
      alarmOsc.frequency.value = 880;
      alarmGain.gain.value = 0.03;
      alarmOsc.connect(alarmGain);
      alarmGain.connect(ac.destination);
      alarmOsc.start();
      const lfo = ac.createOscillator();
      const lfoGain = ac.createGain();
      lfo.frequency.value = 2.2;
      lfoGain.gain.value = 220;
      lfo.connect(lfoGain);
      lfoGain.connect(alarmOsc.frequency);
      lfo.start();
      alarmOsc._lfo = lfo;
    },
    stopAlarm() {
      if (alarmOsc) {
        try { alarmOsc.stop(); if (alarmOsc._lfo) alarmOsc._lfo.stop(); } catch { /* already stopped */ }
        alarmOsc = null;
        alarmGain = null;
      }
    },
  };
}
