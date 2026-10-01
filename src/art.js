'use strict';
// Torrente: La Saga — art: characters, items and goal buildings (all drawn with shapes)

const SKIN = '#f1c27d';
const GOLD = '#ffd700';

// ---------- Torrente ----------
function drawTorrente(p) {
  const blink = p.fary > 0 && Math.floor(game.frame / 4) % 2 === 0;
  const moving = p.onGround && Math.abs(p.vx) > 0.3;
  const leg = moving ? Math.sin(p.anim) * 4 : 0;
  const arm = moving ? -Math.sin(p.anim) * 3 : 0;
  ctx.save();
  ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y));
  ctx.scale(p.facing, 1);
  if (game.state === 'dying') { ctx.translate(0, p.h / 2); ctx.rotate(Math.PI); ctx.translate(0, -p.h / 2); }
  box(-9 + leg, 32, 8, 10, '#37474f'); box(1 - leg, 32, 8, 10, '#37474f');
  box(-10 + leg, 41, 10, 3, '#111'); box(0 - leg, 41, 10, 3, '#111');
  rrect(-12, 15, 24, 20, 5, blink ? '#ffd54f' : '#78909c');
  ell(5, 26, 9, 9, '#fafafa');
  ell(8, 29, 1, 1, '#bdbdbd');
  box(2, 16, 3, 7, '#c62828');
  if (p.shout > 0) {
    // megaphone held forward
    rrect(4, 17, 10, 6, 2, '#607d8b');
    poly([[13, 16], [24, 10], [24, 30], [13, 24]], '#f5f5f5');
    poly([[22, 11], [24, 10], [24, 30], [22, 29]], '#e53935');
  } else {
    const armY = p.onGround ? 18 : 12;
    rrect(-5 + arm, armY, 7, 13, 3, blink ? '#ffca28' : '#607d8b');
    ell(-1.5 + arm, armY + 14, 3.5, 3.5, SKIN);
  }
  ell(1, 9, 9, 9, SKIN);
  ell(3, 15, 7, 3.5, '#e9b570');
  box(-8, 0, 15, 3, '#1b1b1b'); box(-9, 2, 4, 8, '#1b1b1b');
  ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-6, 3); ctx.lineTo(8, 1); ctx.moveTo(-6, 4); ctx.lineTo(9, 3); ctx.stroke();
  box(3, 4, 6, 1.5, '#111');
  box(5, 6, 2, 3, '#111');
  ell(10, 10, 3, 2.5, '#e0a868');
  box(4, 12, 8, 2.5, '#1b1b1b');
  ctx.restore();
  if (p.fary > 0) {
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y - 5, 10, 3, 0, 0, Math.PI * 2); ctx.stroke();
  }
}

// ---------- Enemies ----------
const ENEMY_DEF = {
  perroflauta: { w: 26, h: 34, speed: 0.8, points: 100 },
  madridista: { w: 26, h: 36, speed: 1.5, points: 200, hop: 120 },
  chorizo: { w: 24, h: 32, speed: 1.1, points: 150 },
  gaviota: { w: 30, h: 18, speed: 1.4, points: 200, fly: true },
  narco: { w: 26, h: 36, speed: 1.0, points: 200 },
  rata: { w: 24, h: 14, speed: 2.0, points: 100 },
  sicario: { w: 26, h: 38, speed: 1.2, points: 250, chase: 2.2 },
  carcelero: { w: 26, h: 38, speed: 1.2, points: 200, chase: 1.8 },
  segurata: { w: 26, h: 38, speed: 1.1, points: 200 },
  periodista: { w: 24, h: 34, speed: 1.3, points: 150, hop: 90 },
};

const ENEMY_DRAW = {
  perroflauta(e, leg) {
    box(-9 + leg, 24, 8, 8, '#d7ccc8'); box(1 - leg, 24, 8, 8, '#d7ccc8');
    box(-10 + leg, 31, 9, 3, '#795548'); box(1 - leg, 31, 9, 3, '#795548');
    box(-10, 0, 4, 17, '#5d4037'); box(-7, -1, 3, 15, '#5d4037'); box(-4, 0, 3, 13, '#5d4037');
    rrect(-11, 11, 22, 15, 4, '#7cb342');
    box(-11, 15, 22, 2, '#fdd835'); box(-11, 20, 22, 2, '#e53935');
    ell(0, 6, 7, 7, SKIN);
    ell(0, 1, 7, 3, '#5d4037');
    ell(3, 11, 4, 3, '#5d4037');
    box(3, 4, 2, 2, '#111');
    ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(6, 11); ctx.lineTo(14, 18); ctx.stroke();
  },
  madridista(e, leg) {
    box(-9, 26, 18, 5, '#fff');
    box(-8 + leg, 30, 6, 3, '#fff'); box(2 - leg, 30, 6, 3, '#fff');
    box(-9 + leg, 33, 8, 3, '#111'); box(1 - leg, 33, 8, 3, '#111');
    rrect(-11, 14, 22, 13, 4, '#fafafa');
    box(-11, 14, 22, 2, '#5e35b1');
    ell(5, 19, 2, 2, GOLD);
    box(-9, 12, 18, 3, '#5e35b1');
    box(-6, 13, 4, 10, '#5e35b1'); box(-6, 17, 4, 2, '#fff');
    const wave = Math.sin(e.t * 0.2) * 2;
    rrect(6, 1 + wave, 5, 14, 2, '#fafafa');
    ell(8.5, 0 + wave, 3, 3, SKIN);
    ell(0, 7, 7, 7, SKIN);
    box(-7, 0, 14, 3, '#3e2723');
    ell(5, 10, 2.5, 2.5, '#6d1b1b');
    box(3, 4, 2, 2, '#111');
  },
  chorizo(e, leg) {
    ell(-11, 15, 7, 8, '#a1887f');
    ctx.fillStyle = '#5d4037'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('€', -11, 16);
    box(-8 + leg, 24, 7, 6, '#263238'); box(1 - leg, 24, 7, 6, '#263238');
    box(-9 + leg, 29, 8, 3, '#000'); box(1 - leg, 29, 8, 3, '#000');
    rrect(-10, 11, 20, 14, 3, '#fff');
    for (let i = 0; i < 3; i++) box(-10, 13 + i * 4, 20, 2, '#111');
    ell(0, 6, 7, 7, SKIN);
    ell(0, 2, 7, 4, '#212121'); box(-7, 1, 14, 2, '#212121');
    box(-6, 4, 13, 4, '#111');
    box(3, 5, 2, 2, '#fff');
  },
  gaviota(e) {
    const flap = Math.sin(e.t * 0.3) * 6;
    poly([[-6, 8], [6, 8], [2, -2 - flap]], '#b0bec5');
    poly([[-11, 8], [-17, 4], [-17, 13]], '#eceff1');
    ell(0, 10, 12, 6, '#fff');
    ell(10, 6, 5, 5, '#fff');
    poly([[14, 5], [20, 7], [14, 8]], '#ffb300');
    box(11, 4, 2, 2, '#111');
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(9, 2); ctx.lineTo(14, 4); ctx.stroke();
    poly([[-8, 9], [4, 9], [-2, -4 + flap]], '#90a4ae');
  },
  narco(e, leg) {
    box(-8 + leg, 27, 7, 6, '#1e3a5f'); box(1 - leg, 27, 7, 6, '#1e3a5f');
    box(-9 + leg, 33, 8, 3, '#eee'); box(1 - leg, 33, 8, 3, '#eee');
    rrect(-11, 13, 22, 15, 4, '#4e342e');
    poly([[-3, 13], [5, 13], [1, 23]], SKIN);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(1, 14, 5, 0.2, Math.PI - 0.2); ctx.stroke();
    ell(0, 7, 7, 7, SKIN);
    box(-7, 0, 14, 3, '#111'); box(-8, 2, 4, 11, '#111');
    box(0, 4, 8, 3, '#111');
    ell(-5, 10, 1.5, 1.5, GOLD);
  },
  rata(e) {
    const s = Math.sin(e.t * 0.4) * 3;
    ctx.strokeStyle = '#f48fb1'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-11, 9); ctx.quadraticCurveTo(-18, 2 + s, -24, 8); ctx.stroke();
    ell(0, 8, 12, 6, '#757575');
    ell(10, 6, 6, 5, '#757575');
    ell(8, 1, 3, 3, '#9e9e9e');
    box(11, 4, 2, 2, '#f44336');
    ell(16, 6, 1.5, 1.5, '#f48fb1');
    box(-6 + s, 12, 3, 2, '#616161'); box(4 - s, 12, 3, 2, '#616161');
  },
  sicario(e, leg) {
    box(-8 + leg, 28, 7, 7, '#212121'); box(1 - leg, 28, 7, 7, '#212121');
    box(-9 + leg, 35, 8, 3, '#000'); box(1 - leg, 35, 8, 3, '#000');
    rrect(-11, 14, 22, 15, 3, '#212121');
    poly([[-3, 14], [3, 14], [0, 22]], '#fff');
    box(-1, 15, 2, 8, '#000');
    ell(0, 8, 7, 8, SKIN);
    ell(-2, 2, 3, 1.5, 'rgba(255,255,255,0.4)');
    box(-1, 5, 9, 3, '#000');
    ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-5, 9); ctx.lineTo(-6, 15); ctx.stroke();
  },
  carcelero(e, leg) {
    box(-8 + leg, 28, 7, 7, '#1a237e'); box(1 - leg, 28, 7, 7, '#1a237e');
    box(-9 + leg, 35, 8, 3, '#000'); box(1 - leg, 35, 8, 3, '#000');
    rrect(-11, 14, 22, 15, 3, '#64b5f6');
    ell(-5, 18, 2, 2, GOLD);
    box(-11, 26, 22, 3, '#111');
    box(8, 14, 3, 15, '#111');
    ell(0, 8, 7, 7, SKIN);
    box(-8, 0, 16, 4, '#1a237e'); box(0, 3, 10, 2, '#111');
    box(3, 6, 2, 2, '#111');
    box(2, 10, 6, 2, '#3e2723');
  },
  segurata(e, leg) {
    box(-8 + leg, 28, 7, 7, '#212121'); box(1 - leg, 28, 7, 7, '#212121');
    box(-9 + leg, 35, 8, 3, '#000'); box(1 - leg, 35, 8, 3, '#000');
    rrect(-13, 13, 26, 16, 5, '#111');
    box(-9, 18, 18, 3, '#ffeb3b');
    ell(0, 7, 7, 7, '#e0ac69');
    box(-7, 0, 14, 3, '#5d4037');
    box(3, 5, 2, 2, '#111');
    ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-5, 7); ctx.quadraticCurveTo(-8, 12, -5, 14); ctx.stroke();
  },
  periodista(e, leg) {
    box(-8 + leg, 25, 7, 6, '#795548'); box(1 - leg, 25, 7, 6, '#795548');
    box(-9 + leg, 31, 8, 3, '#3e2723'); box(1 - leg, 31, 8, 3, '#3e2723');
    rrect(-10, 12, 20, 14, 3, '#8d6e63');
    box(-7, 16, 6, 4, '#fff');
    box(4, 15, 11, 3, '#8d6e63');
    box(14, 11, 3, 6, '#111');
    ell(15.5, 10, 3, 3, '#9e9e9e');
    ell(0, 7, 7, 7, SKIN);
    box(-7, 0, 14, 4, '#ff7043'); box(-8, 2, 4, 8, '#ff7043');
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(2, 5, 5, 3);
  },
};

function drawEnemy(e) {
  ctx.save();
  ctx.translate(Math.round(e.x + e.w / 2), Math.round(e.y));
  if (e.dead) {
    ctx.translate(0, e.h);
    if (e.squashed) ctx.scale(1, 0.35); else ctx.scale(1, -1);
    ctx.translate(0, -e.h);
  }
  ctx.scale(e.vx > 0 ? 1 : -1, 1);
  const leg = e.dead ? 0 : Math.sin(e.t * 0.25) * 2;
  ENEMY_DRAW[e.type](e, leg);
  ctx.restore();
}

// ---------- Colchonero (Atlético de Madrid fan) ----------
function drawFan(f) {
  const hugging = f.hugT > 0;
  const walking = !f.hugged && !hugging;
  const leg = walking ? Math.sin(f.t * 0.2) * 2 : 0;
  ctx.save();
  ctx.translate(Math.round(f.x + f.w / 2), Math.round(f.y));
  ctx.scale(f.facing, 1);
  box(-7 + leg, 29, 5, 5, '#c62828'); box(2 - leg, 29, 5, 5, '#c62828');
  box(-8 + leg, 33, 7, 3, '#111'); box(1 - leg, 33, 7, 3, '#111');
  box(-9, 24, 18, 6, '#1e3a8a');
  rrect(-10, 12, 20, 13, 4, '#fafafa');
  for (const sx of [-8, -2, 4]) box(sx, 12, 3, 13, '#d32f2f');
  ell(0, 6, 7, 7, SKIN);
  box(-7, 0, 14, 3, '#4e342e'); box(-7, 0, 3, 6, '#4e342e');
  box(3, 4, 2, 2, '#111');
  ell(4, 10, 2.5, hugging ? 1.5 : 2.2, '#6d1b1b');
  if (hugging) {
    // arms wrapped forward around Torrente, scarf round the neck
    box(-6, 11, 13, 3, '#d32f2f'); box(-1, 11, 3, 3, '#fff');
    rrect(2, 14, 16, 5, 2, '#fafafa'); ell(18, 16.5, 3, 3, SKIN);
    rrect(2, 20, 14, 5, 2, '#d32f2f'); ell(16, 22.5, 3, 3, SKIN);
    ell(0, -8 - Math.sin(game.frame * 0.3) * 2, 3, 3, '#e53935');
  } else {
    // both arms up, scarf stretched over the head
    rrect(-12, 1, 4, 13, 2, SKIN); rrect(8, 1, 4, 13, 2, SKIN);
    for (let k = 0; k < 6; k++) {
      const wave = Math.sin(f.t * 0.2 + k) * 1.5;
      box(-12 + k * 4, -5 + wave, 4, 5, k % 2 ? '#fff' : '#d32f2f');
    }
  }
  ctx.restore();
}

// ---------- La eurodiputada (Torrente 3) ----------
function drawVIP(v) {
  ctx.save();
  ctx.translate(Math.round(v.x + v.w / 2), Math.round(v.y));
  ctx.scale(v.facing, 1);
  const leg = v.moving ? Math.sin(game.frame * 0.3) * 2 : 0;
  box(-6 + leg, 30, 4, 8, SKIN); box(2 - leg, 30, 4, 8, SKIN);
  box(-7 + leg, 38, 6, 2, '#111'); box(1 - leg, 38, 6, 2, '#111');
  box(-8, 23, 16, 8, '#c62828');
  rrect(-9, 12, 18, 13, 4, '#d32f2f');
  poly([[-3, 12], [3, 12], [0, 18]], '#fff');
  for (let i = -2; i <= 2; i++) ell(i * 2, 13 + Math.abs(i) * 0.6, 1, 1, '#fff');
  ell(-9, 24, 4, 4, '#212121');
  ell(0, 5, 8, 7, '#ffd54f');
  ell(2, 8, 5.5, 6, SKIN);
  box(2, 6, 6, 2, '#111');
  box(4, 11, 3, 1.5, '#e53935');
  ctx.restore();
  if (v.hit) txt('!', v.x + v.w / 2, v.y - 18, { size: 14, align: 'center', color: '#ff5252' });
}

// ---------- El Fary: the god of this universe ----------
function drawFary(cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = '#212121';
  ctx.beginPath(); ctx.ellipse(0, 62, 46, 26, 0, Math.PI, 0); ctx.fill();
  poly([[-10, 38], [0, 56], [10, 38]], '#fff');
  box(-8, 26, 16, 14, '#e8b98a');
  ell(0, 0, 30, 36, '#e8b98a');
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.ellipse(0, -18, 32, 20, 0, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-4, -32, 24, 10, -0.2, 0, Math.PI * 2); ctx.fill();
  box(-31, -18, 7, 28, '#111'); box(24, -18, 7, 28, '#111');
  box(-17, -12, 11, 3, '#111'); box(6, -12, 11, 3, '#111');
  ell(-11, -3, 3.5, 4.5, '#111'); ell(11, -3, 3.5, 4.5, '#111');
  ell(0, 6, 5, 4, '#d9a070');
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#6d1b1b'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-16, 13); ctx.quadraticCurveTo(0, 32, 16, 13); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(0, -50, 30, 8, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function drawHolyCloud(cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  [[-50, 0, 40, 22], [0, -8, 50, 28], [50, 0, 40, 22], [0, 12, 70, 18]].forEach(([x, y, rx, ry]) => ell(x, y, rx, ry, '#fff'));
  ctx.restore();
}

function drawRays(cx, cy, r, alpha) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(game.frame * 0.01);
  ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, -18); ctx.lineTo(r, 18); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawSkyFary(cam) {
  const faryX = 620 - cam * 0.1;
  drawRays(faryX, 115, 90, 0.18);
  drawFary(faryX, 105, 0.4);
  drawHolyCloud(faryX, 137, 0.55);
}

function drawFaryGod() {
  const f = game.faryShow;
  ctx.save();
  ctx.globalAlpha = clamp(Math.min((180 - f) / 20, f / 30), 0, 1);
  drawRays(400, 130, 260, 0.35);
  drawHolyCloud(400, 205, 1.3);
  drawFary(400, 120, 0.9);
  txt('¡TORITO GUAPO!', 400, 230, { size: 18, align: 'center', color: '#ffd54f' });
  txt('EL FARY TE BENDICE: ERES INVENCIBLE', 400, 260, { size: 10, align: 'center' });
  ctx.restore();
}

// ---------- Items ----------
function drawCoin(x, y, w, h, phase, style = 'euro') {
  const sx = Math.abs(Math.cos(phase));
  const cx = x + w / 2, cy = y + h / 2;
  if (style === 'chip') {
    ell(cx, cy, (w / 2) * sx + 2, h / 2 + 1, '#b71c1c');
    if (sx > 0.5) for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + 0.4;
      box(cx + Math.cos(a) * (w / 2) * sx - 1.5, cy + Math.sin(a) * (h / 2 - 1) - 1.5, 3, 3, '#fff');
    }
    ell(cx, cy, (w / 2) * sx - 3, h / 2 - 4, '#e53935');
  } else {
    ell(cx, cy, (w / 2) * sx + 1, h / 2, '#c79100');
    ell(cx, cy, (w / 2) * sx - 1, h / 2 - 2, '#ffc107');
  }
  if (sx > 0.55) {
    ctx.fillStyle = style === 'chip' ? '#fff' : '#8d6e00';
    ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('€', cx, cy + 1);
  }
}

function drawVote(x, y) {
  const by = y + Math.sin(game.frame * 0.1 + x) * 2;
  box(x, by, 20, 14, '#fafafa');
  ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, by + 0.5, 19, 13);
  poly([[x, by], [x + 20, by], [x + 10, by + 7]], '#eceff1');
  ctx.strokeStyle = '#c62828'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + 6, by + 8); ctx.lineTo(x + 9, by + 11); ctx.lineTo(x + 15, by + 4); ctx.stroke();
}

function drawMissile(m) {
  const x = Math.round(m.x), y = Math.round(m.y);
  const flick = Math.floor(game.frame / 3) % 2;
  poly([[x + 44, y + 2], [x + 56 + flick * 6, y + 7], [x + 44, y + 12]], flick ? '#ff9800' : '#ffeb3b');
  rrect(x + 10, y, 36, 14, 4, '#9e9e9e');
  box(x + 18, y, 4, 14, '#c62828');
  poly([[x + 10, y], [x, y + 7], [x + 10, y + 14]], '#c62828');
  poly([[x + 36, y], [x + 46, y - 7], [x + 46, y]], '#616161');
  poly([[x + 36, y + 14], [x + 46, y + 21], [x + 46, y + 14]], '#616161');
}

const SLOT_SYMBOLS = ['7', '€', 'B', '♥'];
function drawSlotBlock(x, y, reels, spinning) {
  box(x, y, TILE, TILE, '#4a0000'); box(x + 2, y + 2, TILE - 4, TILE - 4, '#b71c1c');
  box(x + 3, y + 9, TILE - 6, 13, '#fff8e1');
  const sym = reels || [0, 1, 2].map(i => (Math.floor(game.frame / 6) + i * 3) % SLOT_SYMBOLS.length);
  sym.forEach((s, i) => {
    const flick = spinning ? (Math.floor(game.frame / 2) + i) % SLOT_SYMBOLS.length : s;
    ctx.fillStyle = '#b71c1c'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(SLOT_SYMBOLS[flick], x + 7 + i * 9, y + 16);
  });
  box(x + 4, y + 3, TILE - 8, 4, Math.floor(game.frame / 15) % 2 ? '#ffd54f' : '#ff6f00');
}

function drawWhisky(x, y) {
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x - 14, y - 34, 28, 34);
  box(x - 12, y - 20, 24, 18, '#d9822b');
  box(x - 8, y - 22, 8, 7, 'rgba(255,255,255,0.75)'); box(x + 1, y - 18, 7, 6, 'rgba(255,255,255,0.75)');
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(x - 14, y - 34, 28, 34);
  box(x - 14, y - 2, 28, 4, '#fff');
}

function drawBeer(x, y) {
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(x + 14, y - 20, 9, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  box(x - 14, y - 38, 28, 38, '#fbc02d');
  box(x - 10, y - 32, 3, 26, 'rgba(255,255,255,0.4)');
  ell(x - 8, y - 38, 8, 6, '#fff'); ell(x + 2, y - 41, 9, 7, '#fff'); ell(x + 10, y - 37, 7, 6, '#fff');
  ctx.lineWidth = 2; ctx.strokeRect(x - 14, y - 38, 28, 38);
}

function drawDrinkRow(n, y, drawFn) {
  const gap = 60, x0 = 400 - ((n - 1) * gap) / 2;
  for (let i = 0; i < n; i++) drawFn(x0 + i * gap, y - Math.abs(Math.sin(game.frame * 0.08 + i * 0.6)) * 10);
}

// ---------- Scenery shared by several levels ----------
function drawPalm(x) {
  ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(x, GROUND_Y); ctx.quadraticCurveTo(x + 22, 330, x + 8, 262); ctx.stroke();
  for (const a of [-2.8, -2.2, -1.5, -0.8, -0.2, 0.4]) {
    ctx.save(); ctx.translate(x + 8, 262); ctx.rotate(a);
    ell(28, 0, 30, 7, '#2e7d32');
    ctx.restore();
  }
  ell(x + 4, 268, 5, 5, '#5d4037'); ell(x + 13, 269, 5, 5, '#5d4037');
}

function drawParasol(x) {
  box(x + 10, GROUND_Y - 6, 50, 6, '#29b6f6');
  box(x + 22, GROUND_Y - 6, 8, 6, '#fff'); box(x + 42, GROUND_Y - 6, 8, 6, '#fff');
  ctx.strokeStyle = '#eee'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, GROUND_Y); ctx.lineTo(x + 6, 345); ctx.stroke();
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? '#fff' : '#e53935';
    ctx.beginPath(); ctx.moveTo(x + 6, 345);
    ctx.ellipse(x + 6, 345, 42, 24, 0, Math.PI + i * Math.PI / 6, Math.PI + (i + 1) * Math.PI / 6);
    ctx.closePath(); ctx.fill();
  }
}

function drawLamp(x) {
  box(x - 2, 300, 5, GROUND_Y - 300, '#37474f');
  box(x - 2, 296, 26, 4, '#37474f');
  poly([[x + 14, 300], [x + 30, 300], [x + 26, 310], [x + 18, 310]], '#263238');
  ell(x + 22, 311, 6, 3, '#fff59d');
}

function drawBench(x) {
  box(x, GROUND_Y - 18, 50, 5, '#6d4c41'); box(x, GROUND_Y - 30, 50, 5, '#6d4c41');
  box(x + 4, GROUND_Y - 13, 4, 13, '#333'); box(x + 42, GROUND_Y - 13, 4, 13, '#333');
}

function drawPoster(x, text, color) {
  box(x, 300, 60, 76, '#fff');
  box(x + 3, 303, 54, 44, color);
  ell(x + 30, 322, 10, 11, SKIN);
  box(x + 20, 311, 20, 4, '#1b1b1b');
  box(x + 25, 327, 12, 2, '#1b1b1b');
  txt(text, x + 30, 352, { size: 7, align: 'center', color: '#111', shadow: false });
  txt('TORRENTE', x + 30, 363, { size: 6, align: 'center', color: color, shadow: false });
}

// ---------- Goal: flag + bar ----------
function drawFlag() {
  box(GOAL_X - 8, GROUND_Y - 16, 20, 16, '#757575');
  box(GOAL_X, 96, 4, GROUND_Y - 112, '#cfd8dc');
  ell(GOAL_X + 2, 92, 6, 6, GOLD);
  const fy = 100 + game.flagY;
  box(GOAL_X + 4, fy, 44, 8, '#c60b1e');
  box(GOAL_X + 4, fy + 8, 44, 14, '#ffc400');
  box(GOAL_X + 4, fy + 22, 44, 8, '#c60b1e');
}

function drawBarBack(goal) {
  const X = BAR_X;
  if (goal.style === 'palace') {
    box(X - 30, 250, 252, 166, '#eceff1');
    poly([[X - 40, 252], [X + 96, 200], [X + 232, 252]], '#cfd8dc');
    for (let i = 0; i < 6; i++) box(X - 20 + i * 44, 262, 12, 154, '#fafafa');
  } else {
    box(X, 300, 8, 116, '#6d4c41'); box(X + 184, 300, 8, 116, '#6d4c41');
  }
  box(X + 4, 318, 184, 98, goal.wall || '#a1887f');
  box(X + 20, 342, 150, 4, '#5d4037');
  const colors = ['#2e7d32', '#6d4c41', '#c62828', '#f9a825', '#4e342e'];
  for (let i = 0; i < 10; i++) {
    box(X + 26 + i * 15, 322, 8, 20, colors[i % colors.length]);
    box(X + 28 + i * 15, 316, 4, 6, colors[i % colors.length]);
  }
  if (goal.style === 'straw') {
    poly([[X - 30, 305], [X + 222, 305], [X + 170, 250], [X + 22, 250]], '#d4a64a');
    ctx.strokeStyle = '#a67c2e'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 14; i++) { ctx.moveTo(X - 26 + i * 18, 305); ctx.lineTo(X + 24 + i * 11, 252); }
    ctx.stroke();
  } else if (goal.style === 'awning') {
    box(X - 10, 262, 212, 40, goal.roof || '#5d4037');
    for (let i = 0; i < 12; i++) {
      poly([[X - 10 + i * 18, 302], [X + 8 + i * 18, 302], [X - 1 + i * 18, 314]], i % 2 ? '#fff' : goal.stripe || '#2e7d32');
      box(X - 10 + i * 18, 290, 18, 12, i % 2 ? '#fff' : goal.stripe || '#2e7d32');
    }
  }
  const signY = goal.style === 'palace' ? 226 : 266;
  box(X + 26, signY, 140, 24, goal.signBg || '#fff8e1');
  txt(goal.sign, X + 96, signY + 7, { size: goal.sign.length > 11 ? 8 : 10, align: 'center', color: goal.signColor || '#d84315', shadow: false });
}

function drawBarFront() {
  const X = BAR_X;
  box(X - 6, 396, 204, 20, '#8d6e63');
  box(X - 10, 390, 212, 8, '#5d4037');
  box(X + 150, 374, 6, 16, '#bdbdbd'); box(X + 146, 370, 14, 5, '#9e9e9e');
}
