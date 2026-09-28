'use strict';
// Torrente: La Saga — core: constants, input, audio, helpers, tiles, physics

const TILE = 32, VIEW_W = 800, VIEW_H = 480, ROWS = 15, LEVEL_W = 210;
const GROUND_Y = 13 * TILE;
const GOAL_X = 195 * TILE + 14;
const BAR_X = 199 * TILE;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// ---------- Input ----------
const keys = {};
const pressed = {};
window.addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
  if (!keys[e.code]) pressed[e.code] = true;
  keys[e.code] = true;
  initAudio();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
const left = () => keys.ArrowLeft || keys.KeyA;
const right = () => keys.ArrowRight || keys.KeyD;
const jumpHeld = () => keys.Space || keys.ArrowUp || keys.KeyW || keys.KeyZ;
const jumpPressed = () => pressed.Space || pressed.ArrowUp || pressed.KeyW || pressed.KeyZ;
const runHeld = () => keys.ShiftLeft || keys.ShiftRight || keys.KeyX;
const shoutPressed = () => pressed.KeyC || pressed.KeyK;
const enterPressed = () => pressed.Enter || pressed.NumpadEnter || pressed.Space;
const menuLeft = () => pressed.ArrowLeft || pressed.KeyA;
const menuRight = () => pressed.ArrowRight || pressed.KeyD;

// ---------- Touch controls (buttons in index.html feed the same keys map) ----------
let isTouch = false;
function setVirtualKey(code, down) {
  if (down && !keys[code]) pressed[code] = true;
  keys[code] = down;
}
function enableTouch() {
  const ui = document.getElementById('touch');
  if (isTouch || !ui || !ui.querySelectorAll) return;
  isTouch = true;
  ui.hidden = false;
  for (const btn of ui.querySelectorAll('button')) {
    const code = btn.dataset.key;
    if (btn.hasAttribute('data-toggle')) {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault(); initAudio();
        keys[code] = !keys[code];
        btn.classList.toggle('on', keys[code]);
      });
      continue;
    }
    const press = e => { e.preventDefault(); initAudio(); setVirtualKey(code, true); btn.classList.add('held'); };
    const release = () => { setVirtualKey(code, false); btn.classList.remove('held'); };
    btn.addEventListener('pointerdown', e => {
      // Drop implicit touch capture so the thumb can slide between ◀ and ▶
      try { btn.releasePointerCapture(e.pointerId); } catch (err) { /* not captured */ }
      press(e);
    });
    btn.addEventListener('pointerenter', e => { if (e.pointerType === 'touch' || e.buttons) press(e); });
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  }
}
function showShoutButton(visible) {
  const b = document.getElementById('shout');
  if (b) b.hidden = !visible;
}
if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) enableTouch();
window.addEventListener('touchstart', enableTouch, { once: true, passive: true });
canvas.addEventListener('pointerdown', () => {
  initAudio();
  if (['title', 'intro', 'reward', 'gameover', 'ending'].includes(game.state)) pressed.Enter = true;
});

// ---------- Audio (tiny WebAudio synth) ----------
let actx = null;
function initAudio() {
  if (!actx) {
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; }
  }
  if (actx && actx.state === 'suspended') actx.resume();
  if (music.audio && music.audio.paused) playCustom();
}
function tone(freq, dur, { type = 'square', vol = 0.06, to = null, delay = 0 } = {}) {
  if (!actx) return;
  const t = actx.currentTime + delay;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(actx.destination);
  o.start(t); o.stop(t + dur);
}
const seq = (notes, step, opts) => notes.forEach((f, i) => tone(f, step * 1.2, { ...opts, delay: i * step }));
const sfx = {
  jump: () => tone(260, 0.18, { to: 620 }),
  coin: () => { tone(988, 0.08); tone(1319, 0.25, { delay: 0.08 }); },
  vote: () => { tone(784, 0.07, { type: 'triangle' }); tone(1175, 0.2, { type: 'triangle', delay: 0.07 }); },
  stomp: () => tone(180, 0.12, { type: 'triangle', to: 60, vol: 0.12 }),
  bump: () => tone(120, 0.08, { type: 'triangle', vol: 0.1 }),
  brk: () => tone(90, 0.15, { type: 'sawtooth', to: 40, vol: 0.08 }),
  die: () => seq([660, 520, 420, 300, 200], 0.15, { type: 'triangle', vol: 0.1 }),
  fary: () => seq([523, 659, 784, 1047, 784, 1047, 1319], 0.12, { vol: 0.07 }),
  win: () => seq([523, 523, 659, 784, 659, 784, 1047], 0.16, { vol: 0.07 }),
  oneUp: () => seq([660, 784, 1319, 1047, 1175, 1568], 0.08, { vol: 0.06 }),
  siren: () => { for (let i = 0; i < 3; i++) { tone(600, 0.25, { type: 'sawtooth', to: 900, vol: 0.05, delay: i * 0.5 }); tone(900, 0.25, { type: 'sawtooth', to: 600, vol: 0.05, delay: i * 0.5 + 0.25 }); } },
  warn: () => seq([880, 0.001, 880], 0.12, { vol: 0.05 }),
  missile: () => tone(400, 0.6, { type: 'sawtooth', to: 120, vol: 0.05 }),
  slotTick: () => tone(1500, 0.02, { vol: 0.02 }),
  jackpot: () => seq([784, 988, 1175, 1568, 1175, 1568, 2093], 0.07, { vol: 0.06 }),
  lose: () => seq([400, 300, 200], 0.15, { type: 'sawtooth', vol: 0.05 }),
  shout: () => { tone(220, 0.35, { type: 'sawtooth', to: 110, vol: 0.09 }); tone(330, 0.35, { type: 'square', to: 160, vol: 0.05 }); },
};

// ---------- Background music (original tune, Andalusian cadence Am-G-F-E) ----------
function noteFreq(n) {
  const m = /^([A-G])(#|b)?(\d)$/.exec(n);
  const semis = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return 440 * Math.pow(2, ((+m[3] + 1) * 12 + semis - 69) / 12);
}
const parseNotes = str => str.trim().split(/\s+/).map(t => (t === '-' ? null : noteFreq(t)));

const BEACH_BASS = 'A2 - E3 - A2 - E3 -  G2 - D3 - G2 - D3 -  F2 - C3 - F2 - C3 -  E2 - B2 - E2 - G#2 -';
const CHORD_ARPS = ['A4 C5 E5 A5 E5 C5 A4 C5', 'G4 B4 D5 G5 D5 B4 G4 B4', 'F4 A4 C5 F5 C5 A4 F4 A4', 'E4 G#4 B4 E5 B4 G#4 E4 G#4'];
const TRACKS = {
  beach: {
    bpm: 132,
    lead: parseNotes(`
      A4 - C5 E5 - D5 C5 B4   B4 - D5 G5 - F5 E5 D5   C5 - F5 A5 - G5 F5 E5   F5 E5 D5 C5 B4 - G#4 -
      E5 - E5 A5 - E5 C5 A4   D5 - D5 G5 - D5 B4 G4   C5 D5 E5 F5 E5 D5 C5 A4   B4 C5 B4 G#4 E4 - - -`),
    bass: parseNotes(BEACH_BASS + ' ' + BEACH_BASS),
  },
  fary: {
    bpm: 176,
    lead: parseNotes(CHORD_ARPS.join(' ')),
    bass: parseNotes(BEACH_BASS),
  },
};

const music = { enabled: true, track: null, step: 0, next: 0, gain: null, noiseBuf: null, audio: null };
try { music.enabled = localStorage.getItem('torrente.music') !== 'off'; } catch (e) { /* storage unavailable */ }

function musicVoice(freq, t, dur, type, vol) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(music.gain);
  o.start(t); o.stop(t + dur + 0.02);
}
function musicNoise(t, dur, vol, freq) {
  if (!music.noiseBuf) {
    music.noiseBuf = actx.createBuffer(1, actx.sampleRate * 0.2, actx.sampleRate);
    const d = music.noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
  src.buffer = music.noiseBuf;
  f.type = 'highpass'; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(music.gain);
  src.start(t); src.stop(t + dur);
}

// Optional user-supplied songs (see assets/music.js); the synth tracks are the fallback
const customAudio = {};
function customTrack(name) {
  const cfg = window.TORRENTE_MUSIC || {};
  const src = { beach: cfg.play, fary: cfg.fary }[name];
  if (!src || typeof Audio === 'undefined') return null;
  if (!customAudio[src]) {
    const a = new Audio(src);
    a.loop = true;
    a.volume = cfg.volume ?? 0.6;
    a.addEventListener('error', () => console.warn(`Música: no se pudo cargar "${src}", uso la música sintetizada`));
    customAudio[src] = a;
  }
  return customAudio[src].error ? null : customAudio[src];
}
function playCustom() {
  if (music.audio && music.enabled && actx) music.audio.play().catch(() => { /* waits for a user gesture */ });
}
function setMusic(name) {
  if (music.track === name) return;
  const next = customTrack(name);
  if (music.audio && music.audio !== next) music.audio.pause();
  music.audio = next;
  music.track = name;
  music.step = 0;
  if (actx) music.next = actx.currentTime + 0.05;
  playCustom();
}
function toggleMusic() {
  music.enabled = !music.enabled;
  if (music.audio) { if (music.enabled) playCustom(); else music.audio.pause(); }
  try { localStorage.setItem('torrente.music', music.enabled ? 'on' : 'off'); } catch (e) { /* ignore */ }
  const btn = document.getElementById('mute');
  if (btn && btn.classList) btn.classList.toggle('on', !music.enabled);
}

function musicTick() {
  if (!actx || !music.enabled || !music.track || music.audio) return;
  if (!music.gain) { music.gain = actx.createGain(); music.gain.gain.value = 0.5; music.gain.connect(actx.destination); }
  const tr = TRACKS[music.track];
  const stepDur = 60 / tr.bpm / 2;
  if (music.next < actx.currentTime) music.next = actx.currentTime + 0.02;
  while (music.next < actx.currentTime + 0.12) {
    const t = music.next, s = music.step;
    const lead = tr.lead[s % tr.lead.length], bass = tr.bass[s % tr.bass.length];
    if (lead) musicVoice(lead, t, stepDur * 1.6, 'square', 0.035);
    if (bass) musicVoice(bass, t, stepDur * 1.8, 'triangle', 0.12);
    if (s % 8 === 0 || s % 8 === 4) musicVoice(110, t, 0.12, 'sine', 0.15);   // kick
    if (s % 8 === 3 || s % 8 === 6) musicNoise(t, 0.08, 0.06, 1500);         // palmas
    if (s % 2 === 1) musicNoise(t, 0.03, 0.025, 7000);                       // hi-hat
    music.step++;
    music.next += stepDur;
  }
}
setInterval(musicTick, 25);

// ---------- Drawing helpers ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function box(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function ell(x, y, rx, ry, color) {
  if (rx <= 0 || ry <= 0) return; // canvas throws on negative radii (e.g. a coin seen edge-on)
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
function rrect(x, y, w, h, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
function poly(points, color) {
  ctx.fillStyle = color; ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath(); ctx.fill();
}
// The pixel font has no accented capitals, so strip those accents (lowercase text is left alone)
const plainCaps = s => String(s).replace(/[ÁÉÍÓÚ]/g, c => 'AEIOU'['ÁÉÍÓÚ'.indexOf(c)]);
function txt(s, x, y, { color = '#fff', size = 12, align = 'left', shadow = true } = {}) {
  s = plainCaps(s);
  ctx.font = `${size}px "Press Start 2P", monospace`;
  ctx.textAlign = align; ctx.textBaseline = 'top';
  if (shadow) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillText(s, x + 2, y + 2); }
  ctx.fillStyle = color; ctx.fillText(s, x, y);
}
const hash = (a, b) => (((a * 73856093) ^ (b * 19349663)) >>> 0);
const wrap = (v, m) => ((v % m) + m) % m;

// ---------- Tiles & physics ----------
const T = { EMPTY: 0, SAND: 1, DIRT: 2, CRATE: 3, QUESTION: 4, USED: 5, FARY: 6, STONE: 7 };
let grid = [];

function tileAt(tx, ty) {
  if (tx < 0 || tx >= LEVEL_W) return T.STONE;
  if (ty < 0 || ty >= ROWS) return T.EMPTY;
  return grid[ty][tx];
}
const isSolid = (tx, ty) => tileAt(tx, ty) !== T.EMPTY;

function moveX(o) {
  o.x += o.vx;
  const top = Math.floor(o.y / TILE), bot = Math.floor((o.y + o.h - 0.001) / TILE);
  if (o.vx > 0) {
    const tx = Math.floor((o.x + o.w - 0.001) / TILE);
    for (let ty = top; ty <= bot; ty++) if (isSolid(tx, ty)) { o.x = tx * TILE - o.w; o.vx = 0; o.hitWall = true; break; }
  } else if (o.vx < 0) {
    const tx = Math.floor(o.x / TILE);
    for (let ty = top; ty <= bot; ty++) if (isSolid(tx, ty)) { o.x = (tx + 1) * TILE; o.vx = 0; o.hitWall = true; break; }
  }
}
function moveY(o, isPlayer) {
  o.y += o.vy;
  o.onGround = false;
  const l = Math.floor(o.x / TILE), r = Math.floor((o.x + o.w - 0.001) / TILE);
  if (o.vy > 0) {
    const ty = Math.floor((o.y + o.h) / TILE);
    for (let tx = l; tx <= r; tx++) if (isSolid(tx, ty)) { o.y = ty * TILE - o.h; o.vy = 0; o.onGround = true; break; }
  } else if (o.vy < 0) {
    const ty = Math.floor(o.y / TILE);
    let best = null, bestD = Infinity;
    const cx = o.x + o.w / 2;
    for (let tx = l; tx <= r; tx++) {
      if (!isSolid(tx, ty)) continue;
      const d = Math.abs((tx + 0.5) * TILE - cx);
      if (d < bestD) { bestD = d; best = tx; }
    }
    if (best !== null) {
      o.y = (ty + 1) * TILE; o.vy = 0;
      if (isPlayer) hitBlock(best, ty);
    }
  }
}
