'use strict';
// Torrente: La Saga — one level per film: themes (backgrounds, tiles, scenery) and layouts

// ---------- Background building blocks ----------
function skyGradient(top, bottom, h = VIEW_H) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top); g.addColorStop(1, bottom);
  box(0, 0, VIEW_W, h, g);
}
function drawSun(cam, y = 80) {
  const x = 680 - cam * 0.03;
  ell(x, y, 46, 46, 'rgba(255, 236, 130, 0.35)');
  ell(x, y, 34, 34, '#ffe066');
}
function drawClouds(cam) {
  [[100, 60], [420, 110], [760, 50], [1100, 95], [1400, 70]].forEach(([x, y]) => {
    const sx = wrap(x - cam * 0.2, 1600) - 200;
    ell(sx, y, 40, 16, '#fff'); ell(sx + 30, y - 8, 30, 16, '#fff'); ell(sx + 55, y, 30, 13, '#fff');
  });
}
function drawStars(cam) {
  for (let i = 0; i < 70; i++) {
    const x = wrap((hash(i, 7) % 2000) - cam * 0.05, 2000) - 600;
    const y = hash(i, 3) % 260;
    const big = Math.sin(game.frame * 0.05 + i) > 0.3;
    box(x, y, big ? 2 : 1, big ? 2 : 1, '#fff');
  }
}
function drawSkyline(cam, factor, baseY, color, windowColor, seed, lit) {
  for (let i = 0; i < 24; i++) {
    const w = 50 + hash(i, seed) % 70, h = 80 + hash(i, seed + 1) % 160;
    const x = wrap(i * 75 - cam * factor, 1800) - 200;
    if (x > VIEW_W || x + w < 0) continue;
    box(x, baseY - h, w, h, color);
    if (!windowColor) continue;
    for (let r = 0; 10 + r * 16 < h - 10; r++) {
      for (let c = 0; 6 + c * 12 < w - 8; c++) {
        if (hash(i * 97 + c, r + seed) % 100 < lit * 100) box(x + 6 + c * 12, baseY - h + 10 + r * 16, 6, 8, windowColor);
      }
    }
  }
}

// ---------- Scenery (decorations placed in the world) ----------
function drawFlagPole(x, drawCloth) {
  box(x, 290, 3, GROUND_Y - 290, '#9e9e9e');
  ell(x + 1.5, 288, 3, 3, GOLD);
  const wave = Math.sin(game.frame * 0.08 + x) * 2;
  ctx.save(); ctx.translate(x + 3, 294 + wave * 0.3); drawCloth(); ctx.restore();
}
const DECO_DRAW = {
  palm: d => drawPalm(d.x),
  parasol: d => drawParasol(d.x),
  lamp: d => drawLamp(d.x),
  bench: d => drawBench(d.x),
  poster: d => drawPoster(d.x, d.text, d.color),
  euflag: d => drawFlagPole(d.x, () => {
    box(0, 0, 36, 24, '#1e3a8a');
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      box(18 + Math.cos(a) * 8 - 1, 12 + Math.sin(a) * 8 - 1, 2, 2, '#ffd600');
    }
  }),
  esflag: d => drawFlagPole(d.x, () => {
    box(0, 0, 36, 6, '#c60b1e'); box(0, 6, 36, 12, '#ffc400'); box(0, 18, 36, 6, '#c60b1e');
  }),
  cell: d => {
    box(d.x, 330, 44, 50, '#37474f');
    for (let i = 0; i < 5; i++) box(d.x + 4 + i * 9, 330, 3, 50, '#90a4ae');
  },
};

// ---------- Themes ----------
const THEMES = {
  madrid: {
    tiles: {
      top: '#8a8a8a', topLight: '#b0b0b0', speck: '#6d6d6d', fill: '#3a3a3a', fillSpeck: '#4a4a4a',
      crate: ['#6d4c41', '#c8a27a', '#a1887f'], stone: ['#5d2e1f', '#8d4a32', '#a65d40'],
    },
    background(cam) {
      skyGradient('#0b1026', '#2a2f5a', 340);
      drawStars(cam);
      const mx = 640 - cam * 0.02;
      ell(mx, 70, 26, 26, '#fffde7'); ell(mx - 8, 64, 5, 5, '#e0dcc0'); ell(mx + 7, 78, 4, 4, '#e0dcc0');
      drawSkyFary(cam);
      drawSkyline(cam, 0.15, 340, '#1c2340', '#ffd54f', 11, 0.25);
      drawSkyline(cam, 0.35, 390, '#11162b', '#ffb300', 23, 0.35);
      box(0, 388, VIEW_W, VIEW_H - 388, '#11162b');
    },
  },
  marbella: {
    tiles: {
      top: '#f4d58d', topLight: '#ffe7a8', speck: '#d9b765', fill: '#e0b86a', fillSpeck: '#c49a4c',
      crate: ['#6d4c41', '#b5793a', '#8d5a2b'], stone: ['#616161', '#9e9e9e', '#bdbdbd'],
    },
    background(cam) {
      skyGradient('#3fa9f5', '#c8ecff', 290);
      drawSun(cam);
      drawSkyFary(cam);
      drawClouds(cam);
      const sea = ctx.createLinearGradient(0, 280, 0, VIEW_H);
      sea.addColorStop(0, '#29b6f6'); sea.addColorStop(1, '#0d47a1');
      box(0, 280, VIEW_W, VIEW_H - 280, sea);
      box(0, 280, VIEW_W, 2, '#e1f5fe');
      const bx = wrap(1500 - cam * 0.3, 2400) - 200;
      poly([[bx - 30, 286], [bx + 30, 286], [bx + 20, 296], [bx - 20, 296]], '#fff');
      poly([[bx, 240], [bx, 284], [bx + 26, 284]], '#fff');
      poly([[bx - 2, 250], [bx - 2, 284], [bx - 22, 284]], '#ef5350');
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
      for (let r = 0; r < 6; r++) {
        const y = 300 + r * 30;
        const off = (game.frame * 0.4 + cam * (0.3 + r * 0.05) + r * 17) % 60;
        ctx.beginPath();
        for (let x = -off; x < VIEW_W; x += 60) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - 5, x + 20, y); }
        ctx.stroke();
      }
    },
  },
  protector: {
    tiles: {
      top: '#d7ccc8', topLight: '#efebe9', speck: '#a1887f', fill: '#8d7b70', fillSpeck: '#7a6a60',
      crate: ['#5d4037', '#a1887f', '#795548'], stone: ['#9e9e9e', '#e0e0e0', '#f5f5f5'],
    },
    background(cam) {
      skyGradient('#64b5f6', '#e3f2fd', 380);
      drawSun(cam);
      drawSkyFary(cam);
      drawClouds(cam);
      drawSkyline(cam, 0.25, 380, '#d7ccc8', '#8d6e63', 5, 1);
      for (let i = 0; i < 10; i++) {
        const x = wrap(i * 220 - cam * 0.5, 2200) - 200;
        box(x, 330, 8, 60, '#5d4037');
        ell(x + 4, 320, 30, 26, '#388e3c'); ell(x - 10, 332, 18, 14, '#43a047');
      }
      box(0, 380, VIEW_W, VIEW_H - 380, '#bcaaa4');
    },
  },
  carcel: {
    tiles: {
      top: '#757575', topLight: '#9e9e9e', speck: '#616161', fill: '#546e7a', fillSpeck: '#455a64',
      crate: ['#263238', '#78909c', '#546e7a'], stone: ['#424242', '#616161', '#757575'],
    },
    background(cam) {
      skyGradient('#1c2530', '#ff8a65', 300);
      drawSkyFary(cam);
      const mx = wrap(-cam * 0.1, 1600);
      for (let k = -1; k < 2; k++) poly([[mx + k * 1600 - 100, 300], [mx + k * 1600 + 250, 160], [mx + k * 1600 + 600, 300], [mx + k * 1600 + 900, 190], [mx + k * 1600 + 1300, 300]], '#263238');
      box(0, 250, VIEW_W, VIEW_H - 250, '#607d8b');
      ctx.strokeStyle = '#546e7a'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 250; y < VIEW_H; y += 20) {
        ctx.moveTo(0, y); ctx.lineTo(VIEW_W, y);
        const off = wrap(-cam * 0.5 + (y % 40 ? 20 : 0), 40);
        for (let x = off; x < VIEW_W; x += 40) { ctx.moveTo(x, y); ctx.lineTo(x, y + 20); }
      }
      ctx.stroke();
      ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 2;
      ctx.beginPath();
      const zoff = wrap(-cam * 0.5, 16);
      for (let x = zoff - 16; x < VIEW_W; x += 16) { ctx.moveTo(x, 246); ctx.lineTo(x + 8, 238); ctx.lineTo(x + 16, 246); }
      ctx.stroke();
      box(0, 246, VIEW_W, 4, '#455a64');
    },
  },
  eurovegas: {
    coinStyle: 'chip',
    tiles: {
      top: '#c62828', topLight: '#ffd54f', speck: '#8e0000', fill: '#4a148c', fillSpeck: '#38006b',
      crate: ['#4a148c', '#ab47bc', '#8e24aa'], stone: ['#b8860b', '#ffd54f', '#fff59d'],
    },
    background(cam) {
      skyGradient('#12002b', '#4a148c', 400);
      drawStars(cam);
      drawSkyFary(cam);
      const sx = wrap(260 - cam * 0.1, 1400) - 300;
      ctx.save();
      ctx.shadowColor = '#ff4081'; ctx.shadowBlur = 16;
      [...'EUROVEGAS'].forEach((ch, i) => {
        const on = (Math.floor(game.frame / 8) + i) % 12 !== 0;
        txt(ch, sx + i * 30, 190, { size: 26, color: on ? (i % 2 ? '#ff4081' : '#40c4ff') : '#3a0040', shadow: false });
      });
      ctx.restore();
      for (let i = 0; i < 20; i++) {
        const w = 60 + hash(i, 41) % 60, h = 100 + hash(i, 42) % 150;
        const x = wrap(i * 90 - cam * 0.3, 1800) - 200;
        if (x > VIEW_W || x + w < 0) continue;
        box(x, 400 - h, w, h, '#1a0a2e');
        const hue = (i * 47 + game.frame * 2) % 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`; ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, 402 - h, w - 4, h - 4);
        for (let r = 0; r < 4; r++) box(x + 8, 420 - h + r * 22, w - 16, 3, `hsla(${(hue + 120) % 360}, 100%, 60%, 0.6)`);
      }
      box(0, 398, VIEW_W, VIEW_H - 398, '#1a0a2e');
    },
  },
  presidente: {
    tiles: {
      top: '#b0bec5', topLight: '#cfd8dc', speck: '#90a4ae', fill: '#78909c', fillSpeck: '#607d8b',
      crate: ['#8d6e63', '#d7ccc8', '#a1887f'], stone: ['#c62828', '#e53935', '#ef9a9a'],
    },
    background(cam) {
      skyGradient('#81d4fa', '#e1f5fe', 400);
      drawSun(cam);
      drawSkyFary(cam);
      drawClouds(cam);
      const bx = wrap(200 - cam * 0.2, 1400) - 300;
      box(bx, 240, 420, 150, '#eceff1');
      poly([[bx - 10, 242], [bx + 210, 180], [bx + 430, 242]], '#cfd8dc');
      for (let i = 0; i < 8; i++) box(bx + 16 + i * 52, 250, 16, 140, '#fafafa');
      box(bx + 200, 150, 3, 32, '#9e9e9e');
      box(bx + 203, 150, 30, 6, '#c60b1e'); box(bx + 203, 156, 30, 8, '#ffc400'); box(bx + 203, 164, 30, 6, '#c60b1e');
      const colors = ['#ef5350', '#ffca28', '#66bb6a', '#42a5f5', '#8d6e63', '#ab47bc'];
      for (let i = 0; i < 60; i++) {
        const x = wrap(i * 28 - cam * 0.6, 1680) - 40;
        const bob = Math.sin(game.frame * 0.15 + i) * 2;
        box(x - 10, 396 + bob, 20, 30, colors[i % colors.length]);
        ell(x, 388 + bob, 8, 8, SKIN);
        if (i % 5 === 0) { box(x + 8, 350 + bob, 2, 40, '#795548'); box(x - 6, 340 + bob, 30, 16, '#fff'); }
      }
      box(0, 410, VIEW_W, VIEW_H - 410, '#455a64');
    },
  },
};

// ---------- Level builder ----------
function buildLevel(lv) {
  grid = Array.from({ length: ROWS }, () => new Array(LEVEL_W).fill(T.EMPTY));
  entities = []; coins = []; votes = []; decos = []; searchlights = [];
  const set = (x, y, t) => { grid[y][x] = t; };
  const L = {
    ground(a, b) { for (let x = a; x <= b; x++) { set(x, 13, T.SAND); set(x, 14, T.DIRT); } },
    row(x, y, str) {
      [...str].forEach((c, i) => {
        const t = { '#': T.CRATE, '?': T.QUESTION, F: T.FARY, S: T.STONE }[c];
        if (t) set(x + i, y, t);
      });
    },
    pillar(x, h) { for (let j = 0; j < h; j++) { set(x, 12 - j, T.STONE); set(x + 1, 12 - j, T.STONE); } },
    stairs(x, h, up = true) {
      for (let i = 0; i < h; i++) {
        const height = up ? i + 1 : h - i;
        for (let j = 0; j < height; j++) set(x + i, 12 - j, T.STONE);
      }
    },
    coin(x, y) { coins.push({ x: x * TILE + 8, y: y * TILE + 6, w: 16, h: 20, taken: false }); },
    coinRow(x, y, n) { for (let i = 0; i < n; i++) L.coin(x + i, y); },
    arc(x, y) { L.coin(x, y + 1); L.coin(x + 1, y); L.coin(x + 2, y + 1); },
    vote(x, y) { votes.push({ x: x * TILE + 6, y: y * TILE + 8, w: 20, h: 14, taken: false }); },
    voteRow(x, y, n) { for (let i = 0; i < n; i++) L.vote(x + i, y); },
    enemy(type, x, y = 12) { entities.push(makeEnemy(type, x, y)); },
    deco(type, xs, extra = {}) { xs.forEach(x => decos.push({ type, x: x * TILE, ...extra })); },
    searchlight(x, amp = 0.6, speed = 0.02, phase = 0) {
      searchlights.push({ x: x * TILE + 16, y: 104, amp, speed, phase, len: 360, hw: 0.13, a: Math.PI / 2, spot: false });
    },
    finale() { L.ground(176, LEVEL_W - 1); L.stairs(180, 8, true); },
  };
  lv.build(L);
}

// ---------- The six films ----------
const LEVELS = [
  {
    num: 1, year: 1998, film: 'EL BRAZO TONTO DE LA LEY', place: 'MADRID',
    tagline: 'NOCHE EN EL BARRIO: SOLO VES LO QUE ALUMBRAS',
    hint: ['ES DE NOCHE EN EL BARRIO.', 'LAS FAROLAS Y TU MECHERO TE ALUMBRAN.'],
    gimmick: 'dark', theme: THEMES.madrid, cast: ['narco', 'rata', 'chorizo', 'madridista'],
    goal: { sign: 'BAR', style: 'awning', stripe: '#2e7d32', at: 'EL BAR DEL BARRIO' },
    build(L) {
      L.ground(0, 55); L.ground(59, 100); L.ground(103, 140); L.ground(144, 179);
      L.row(10, 9, '?'); L.row(16, 9, '#?#'); L.row(17, 5, 'F'); L.coinRow(22, 10, 3);
      L.enemy('chorizo', 20); L.pillar(28, 2); L.enemy('rata', 33); L.pillar(38, 3);
      L.enemy('narco', 44); L.coinRow(46, 9, 4); L.row(50, 9, '#?##');
      L.arc(56, 8);
      L.enemy('madridista', 66); L.row(70, 9, '?#?'); L.row(71, 5, '?'); L.enemy('rata', 76);
      L.enemy('narco', 82); L.pillar(86, 3); L.enemy('chorizo', 92); L.coinRow(94, 8, 4);
      L.coin(101, 9); L.coin(102, 8);
      L.stairs(108, 4, true); L.stairs(112, 4, false);
      L.enemy('madridista', 120); L.enemy('narco', 126); L.row(128, 9, '#F#'); L.enemy('rata', 134);
      L.stairs(137, 4, true); L.arc(141, 7);
      L.enemy('chorizo', 150); L.enemy('madridista', 156); L.row(160, 9, '?#?'); L.coinRow(159, 5, 5);
      L.enemy('narco', 165); L.enemy('rata', 170);
      L.finale();
      L.deco('lamp', [6, 20, 34, 48, 62, 78, 94, 110, 124, 150, 166, 178]);
      L.deco('bench', [13, 70, 131]);
      L.deco('poster', [40, 98, 160], { text: 'SE BUSCA', color: '#795548' });
    },
  },
  {
    num: 2, year: 2001, film: 'MISIÓN EN MARBELLA', place: 'MARBELLA',
    tagline: 'EL VILLANO LANZA MISILES: ¡SALTA O PÍSALOS!',
    hint: ['EL MALO QUIERE VOLAR MARBELLA.', 'CUANDO VEAS LA ALERTA, SALTA EL MISIL.'],
    gimmick: 'missiles', theme: THEMES.marbella, cast: ['perroflauta', 'madridista', 'chorizo', 'gaviota'],
    goal: { sign: 'CHIRINGUITO', style: 'straw', at: 'EL CHIRINGUITO' },
    build(L) {
      L.ground(0, 68); L.ground(72, 110); L.ground(114, 150); L.ground(154, 179);
      L.row(12, 9, '?'); L.row(18, 9, '#?#F#'); L.row(20, 5, '?'); L.coinRow(25, 10, 3);
      L.pillar(30, 2); L.pillar(40, 3); L.pillar(50, 4);
      L.enemy('perroflauta', 22); L.enemy('perroflauta', 35); L.enemy('madridista', 45);
      L.enemy('chorizo', 57); L.enemy('gaviota', 62, 7);
      L.arc(69, 8);
      L.row(78, 9, '#?#?#'); L.row(80, 5, '###?####'); L.coinRow(81, 4, 6);
      L.enemy('madridista', 84); L.enemy('perroflauta', 90); L.enemy('perroflauta', 92); L.enemy('gaviota', 96, 6);
      L.row(100, 9, '?'); L.row(104, 9, '?'); L.row(108, 9, '?'); L.row(104, 5, 'F');
      L.arc(111, 8);
      L.stairs(118, 4, true); L.stairs(124, 4, false);
      L.enemy('chorizo', 129); L.enemy('madridista', 133); L.enemy('madridista', 136);
      L.row(138, 9, '#??#'); L.enemy('perroflauta', 144);
      L.stairs(147, 4, true); L.arc(151, 7);
      L.coinRow(164, 9, 6);
      L.enemy('gaviota', 162, 8); L.enemy('chorizo', 166); L.enemy('madridista', 169); L.enemy('perroflauta', 173);
      L.enemy('madridista', 177);
      L.finale();
      L.deco('palm', [5, 27, 60, 95, 125, 158, 175]);
      L.deco('parasol', [9, 38, 76, 102, 132, 166]);
    },
  },
  {
    num: 3, year: 2005, film: 'EL PROTECTOR', place: 'MADRID CENTRO',
    tagline: 'ESCOLTA: QUE NADIE TOQUE A LA EURODIPUTADA',
    hint: ['ERES EL GUARDAESPALDAS DE LA EURODIPUTADA.', 'ELLA TE SIGUE: SI LA TOCAN, PIERDES.'],
    gimmick: 'escort', theme: THEMES.protector, cast: ['sicario', 'periodista', 'chorizo', 'madridista'],
    goal: { sign: 'TABERNA', style: 'awning', stripe: '#c62828', roof: '#4e342e', at: 'LA TABERNA' },
    build(L) {
      L.ground(0, 80); L.ground(84, 130); L.ground(133, 179);
      L.row(12, 9, '?#?'); L.coinRow(18, 10, 3);
      L.enemy('chorizo', 24); L.pillar(30, 2); L.enemy('periodista', 38);
      L.row(44, 9, '#?#?#'); L.coinRow(45, 5, 3); L.enemy('sicario', 52);
      L.pillar(58, 3); L.row(64, 9, '?F?'); L.enemy('madridista', 70); L.enemy('chorizo', 76);
      L.arc(81, 8);
      L.enemy('sicario', 92); L.stairs(96, 3, true); L.stairs(99, 3, false);
      L.enemy('periodista', 106); L.row(112, 9, '#?#'); L.enemy('sicario', 118);
      L.coinRow(118, 10, 4); L.pillar(122, 2);
      L.coin(131, 9); L.coin(132, 8);
      L.enemy('chorizo', 140); L.enemy('madridista', 146); L.row(150, 9, '?#?#?');
      L.enemy('periodista', 156); L.enemy('sicario', 164); L.coinRow(166, 9, 4); L.enemy('chorizo', 172);
      L.finale();
      L.deco('lamp', [8, 40, 72, 104, 140, 170]);
      L.deco('bench', [20, 90, 158]);
      L.deco('euflag', [4, 34, 66, 115, 150]);
    },
  },
  {
    num: 4, year: 2011, film: 'LETHAL CRISIS', place: 'LA CÁRCEL', anaglyph: true,
    tagline: 'FUGA DE LA CÁRCEL: ESQUIVA LOS FOCOS',
    hint: ['TORRENTE SE FUGA DE LA CÁRCEL.', 'SI UN FOCO TE PILLA, SALEN LOS CARCELEROS.'],
    gimmick: 'searchlight', theme: THEMES.carcel, cast: ['carcelero', 'rata', 'chorizo', 'narco'],
    goal: { sign: 'BAR LA FUGA', style: 'awning', stripe: '#f57f17', roof: '#37474f', at: 'EL BAR LA FUGA' },
    build(L) {
      L.ground(0, 40); L.ground(44, 90); L.ground(94, 135); L.ground(139, 179);
      L.row(10, 9, '?#?'); L.enemy('chorizo', 22); L.pillar(26, 2);
      L.row(30, 8, '####'); L.coinRow(30, 7, 4); L.enemy('rata', 34); L.row(36, 5, '##?#');
      L.arc(41, 8);
      L.row(50, 9, '#F#'); L.enemy('carcelero', 58); L.enemy('rata', 64); L.pillar(68, 3);
      L.row(72, 9, '?##?'); L.coinRow(73, 5, 2); L.enemy('narco', 80); L.enemy('carcelero', 86);
      L.arc(91, 8);
      L.stairs(98, 4, true); L.row(104, 8, '####'); L.coinRow(104, 7, 4); L.enemy('rata', 108);
      L.enemy('carcelero', 112); L.pillar(118, 4); L.enemy('chorizo', 124); L.row(127, 9, '?#?');
      L.stairs(132, 4, true); L.arc(136, 7);
      L.enemy('carcelero', 146); L.enemy('rata', 152); L.row(156, 9, '#?#?#'); L.coinRow(157, 5, 3);
      L.enemy('narco', 162); L.enemy('rata', 168);
      L.finale();
      L.searchlight(18, 0.55, 0.02, 0); L.searchlight(48, 0.6, 0.025, 1);
      L.searchlight(78, 0.5, 0.03, 2); L.searchlight(110, 0.6, 0.022, 3);
      L.searchlight(144, 0.55, 0.028, 4); L.searchlight(170, 0.5, 0.03, 5);
      L.deco('cell', [6, 60, 100, 150]);
    },
  },
  {
    num: 5, year: 2014, film: 'OPERACIÓN EUROVEGAS', place: 'EUROVEGAS',
    tagline: 'TRAGAPERRAS: ¿JACKPOT O LA BANCA GANA?',
    hint: ['EL GOLPE AL CASINO.', 'LOS BLOQUES SON TRAGAPERRAS: 777 = JACKPOT.'],
    gimmick: 'slots', theme: THEMES.eurovegas, cast: ['segurata', 'chorizo', 'madridista', 'narco'],
    goal: { sign: 'CASINO BAR', style: 'awning', stripe: '#ab47bc', roof: '#1a0a2e', signBg: '#1a0a2e', signColor: '#ff4081', at: 'EL BAR DEL CASINO' },
    build(L) {
      L.ground(0, 50); L.ground(54, 95); L.ground(99, 140); L.ground(144, 179);
      L.row(10, 9, '?'); L.row(15, 9, '#???#'); L.row(17, 5, '?');
      L.enemy('segurata', 25); L.pillar(30, 2); L.coinRow(32, 10, 4); L.enemy('chorizo', 38);
      L.row(42, 9, '?F?'); L.enemy('segurata', 46);
      L.arc(51, 8);
      L.row(58, 9, '??'); L.row(62, 5, '???'); L.enemy('madridista', 64); L.enemy('segurata', 72);
      L.pillar(76, 3); L.row(80, 9, '#?#?#'); L.enemy('chorizo', 86); L.enemy('narco', 90);
      L.arc(96, 8);
      L.stairs(103, 4, true); L.stairs(107, 4, false);
      L.row(114, 9, '???'); L.row(115, 5, '?'); L.enemy('segurata', 120); L.enemy('madridista', 126);
      L.pillar(130, 2); L.row(133, 9, '#?#');
      L.stairs(137, 4, true); L.arc(141, 7);
      L.enemy('segurata', 150); L.row(154, 9, '?#?#?'); L.enemy('chorizo', 160); L.enemy('madridista', 166);
      L.coinRow(168, 9, 5); L.enemy('segurata', 172);
      L.finale();
      L.deco('palm', [4, 36, 68, 112, 146, 176]);
    },
  },
  {
    num: 6, year: 2026, film: 'TORRENTE PRESIDENTE', place: 'ELECCIONES',
    tagline: 'ELECCIONES: RECOGE VOTOS Y USA EL MEGÁFONO',
    hint: ['TORRENTE SE PRESENTA A LAS ELECCIONES.', 'RECOGE VOTOS. MEGÁFONO: TECLA C / BOTÓN MITIN.'],
    gimmick: 'votes', theme: THEMES.presidente, cast: ['periodista', 'perroflauta', 'madridista', 'chorizo'],
    goal: { sign: 'LA MONCLOA', style: 'palace', wall: '#bcaaa4', signColor: '#1a237e', at: 'LA MONCLOA' },
    build(L) {
      L.ground(0, 60); L.ground(63, 110); L.ground(114, 150); L.ground(153, 179);
      L.voteRow(8, 10, 5); L.row(14, 9, '?'); L.enemy('periodista', 20);
      L.enemy('perroflauta', 24); L.enemy('perroflauta', 27);
      L.voteRow(30, 8, 3); L.pillar(34, 2); L.row(40, 9, '#?F?#'); L.voteRow(41, 5, 3);
      L.enemy('madridista', 46); L.enemy('periodista', 50); L.enemy('perroflauta', 54);
      L.vote(61, 9); L.vote(62, 9);
      L.enemy('perroflauta', 68); L.enemy('perroflauta', 70); L.enemy('perroflauta', 72);
      L.row(76, 9, '?#?'); L.voteRow(76, 5, 3); L.pillar(84, 3);
      L.enemy('madridista', 90); L.enemy('periodista', 94);
      L.stairs(98, 4, true); L.stairs(102, 4, false); L.voteRow(99, 7, 6); L.enemy('chorizo', 108);
      L.vote(111, 9); L.vote(112, 8); L.vote(113, 9);
      L.enemy('periodista', 118); L.enemy('perroflauta', 122); L.enemy('perroflauta', 124);
      L.row(128, 9, '#??#'); L.voteRow(129, 5, 2); L.enemy('madridista', 134); L.pillar(138, 2);
      L.enemy('periodista', 144); L.stairs(147, 4, true); L.vote(151, 7); L.vote(152, 7);
      L.enemy('perroflauta', 158); L.enemy('perroflauta', 160); L.enemy('madridista', 164);
      L.voteRow(160, 9, 6); L.enemy('periodista', 170); L.enemy('perroflauta', 174);
      L.coinRow(18, 10, 2); L.coinRow(86, 10, 3); L.coinRow(140, 10, 3);
      L.finale();
      L.deco('poster', [5, 22, 44, 66, 88, 120, 142, 166], { text: 'VOTA', color: '#1565c0' });
      L.deco('esflag', [12, 56, 100, 132, 176]);
    },
  },
];
