'use strict';
// Torrente: La Saga — game state, per-film gimmicks, update and rendering

let levelIndex = 0, level = LEVELS[0];
let entities = [], fans = [], coins = [], votes = [], decos = [], searchlights = [], player = null;
let particles = [], popups = [], coinPops = [], bumps = new Map();
let missiles = [], shockwaves = [], slots = new Map(), vip = null, trail = [];

const game = {
  state: 'title', selected: 0, lives: 3, euros: 0, levelEuros: 0, score: 0, time: 300, timeTick: 0,
  frame: 0, camX: 0, deathT: 0, deathMsg: '', faryShow: 0, flagY: 0, win: null, reward: null,
  introT: 0, rewardAt: 0, votes: 0, votesTotal: 0, shoutCD: 0, alarm: 0, alarmCD: 0,
  missileT: 0, missileWarn: null,
};

function makeEnemy(type, tx, ty) {
  const d = ENEMY_DEF[type];
  return {
    type, ...d, x: tx * TILE + 2, y: d.fly ? ty * TILE : GROUND_Y - d.h, baseY: ty * TILE,
    vx: -d.speed, vy: 0, t: Math.floor(Math.random() * 120),
    active: false, dead: false, squashed: false, deadT: 0, onGround: false, remove: false,
  };
}

// Rojiblancos: friendly Atlético fans. Touch one and Torrente hugs him for points and a chant.
const FAN_CHANTS = [
  '¡EL CHOLO ES EL MEJOR!', '¡VIVAN LOS COLCHONEROS!', '¡AÚPA ATLETI!', '¡PARTIDO A PARTIDO!',
  '¡NUNCA DEJES DE CREER!', '¡ATLETI, ATLETI, ATLÉTICO DE MADRID!', '¡CORAJE Y CORAZÓN!',
  '¡EL ATLETI ES UN SENTIMIENTO!', '¡SOMOS DEL MANZANARES, COÑO!', '¡ROJIBLANCOS HASTA LA MUERTE!',
];
const FAN_POINTS = 500, HUG_FRAMES = 50, BUBBLE_FRAMES = 170;
let lastChant = -1;

function makeFan(tx) {
  return {
    x: tx * TILE, y: GROUND_Y - 36, w: 22, h: 36, homeX: tx * TILE, vx: 0.4, vy: 0, onGround: false,
    facing: -1, t: Math.floor(Math.random() * 120), hugged: false, hugT: 0, bubble: null,
  };
}

function makePlayer() {
  return {
    x: 3 * TILE, y: GROUND_Y - 44, w: 26, h: 44, vx: 0, vy: 0,
    onGround: false, facing: 1, anim: 0, fary: 0, coyote: 0, buffer: 0, shout: 0, hug: 0,
  };
}

const votePct = () => (game.votesTotal ? Math.round((game.votes / game.votesTotal) * 100) : 0);

// ---------- Flow ----------
function newGame(i) {
  game.lives = 3; game.euros = 0; game.score = 0;
  loadLevel(i);
  startLevel();
}
function loadLevel(i) { levelIndex = i; level = LEVELS[i]; }
function startLevel() {
  buildLevel(level);
  player = makePlayer();
  Object.assign(game, {
    time: 300, timeTick: 0, camX: 0, faryShow: 0, flagY: 0, win: null, levelEuros: 0, votes: 0,
    shoutCD: 0, alarm: 0, alarmCD: 0, missileT: 0, missileWarn: null, deathMsg: '', introT: 0, state: 'intro',
  });
  particles = []; popups = []; coinPops = []; bumps = new Map();
  missiles = []; shockwaves = []; slots = new Map(); trail = [];
  vip = level.gimmick === 'escort' ? { x: player.x - 30, y: GROUND_Y - 40, w: 22, h: 40, facing: 1, moving: false, hit: false } : null;
  const blocks = grid.reduce((n, row) => n + row.filter(t => t === T.QUESTION).length, 0);
  game.votesTotal = level.gimmick === 'votes' ? votes.length + 3 * blocks : 0;
  showShoutButton(level.gimmick === 'votes');
}
function nextLevel() {
  if (levelIndex < LEVELS.length - 1) { loadLevel(levelIndex + 1); startLevel(); }
  else { game.state = 'ending'; showShoutButton(false); }
}

function popup(x, y, text, color = '#fff') { popups.push({ x, y, text, color, life: 45 }); }

function addEuros(n) {
  const before = Math.floor(game.euros / 50);
  game.euros = Math.max(0, game.euros + n);
  game.levelEuros = Math.max(0, game.levelEuros + n);
  if (n <= 0) return;
  game.score += 50 * n;
  if (Math.floor(game.euros / 50) > before) {
    game.lives++;
    popup(player.x, player.y - 20, '1UP', '#76ff03');
    sfx.oneUp();
  }
}

function hitBlock(tx, ty) {
  const t = grid[ty][tx];
  const cx = tx * TILE, cy = ty * TILE;
  if (t === T.QUESTION) {
    grid[ty][tx] = T.USED;
    bumps.set(`${tx},${ty}`, 10);
    if (level.gimmick === 'slots') {
      slots.set(`${tx},${ty}`, { t: 45, x: cx, y: cy, reels: null });
    } else {
      coinPops.push({ x: cx + 8, y: cy - 24, vy: -8, life: 30 });
      addEuros(1);
      sfx.coin();
      if (level.gimmick === 'votes') { game.votes += 3; popup(cx - 8, cy - 40, '+3 VOTOS', '#90caf9'); }
    }
  } else if (t === T.FARY) {
    grid[ty][tx] = T.USED;
    bumps.set(`${tx},${ty}`, 10);
    player.fary = 600;
    game.faryShow = 180;
    game.score += 1000;
    sfx.fary();
  } else if (t === T.CRATE) {
    grid[ty][tx] = T.EMPTY;
    const color = level.theme.tiles.crate[1];
    for (let i = 0; i < 4; i++) {
      particles.push({ x: cx + 8 + (i % 2) * 16, y: cy + 8 + (i > 1 ? 16 : 0), vx: (i % 2 ? 2 : -2), vy: i > 1 ? -6 : -9, life: 60, color, size: 10 });
    }
    game.score += 50;
    sfx.brk();
  } else {
    sfx.bump();
  }
  for (const e of entities) {
    if (!e.dead && e.active && Math.abs(e.y + e.h - cy) < 4 && e.x + e.w > cx && e.x < cx + TILE) killEnemy(e, 'flip');
  }
}

function killEnemy(e, mode) {
  e.dead = true;
  e.squashed = mode === 'squash' && !e.fly;
  e.deadT = 0;
  if (!e.squashed) e.vy = -6;
  game.score += e.points;
  popup(e.x, e.y - 10, String(e.points));
  sfx.stomp();
}

function killPlayer(msg = '') {
  if (game.state !== 'play') return;
  game.state = 'dying';
  game.deathT = 0;
  game.deathMsg = msg;
  player.vy = -10;
  player.fary = 0;
  sfx.die();
}

function startWin() {
  const p = player;
  game.state = 'win';
  game.win = { phase: 'slide', t: 0 };
  const heightBonus = Math.max(100, Math.round((GROUND_Y - p.y) / TILE) * 400);
  game.score += heightBonus;
  popup(GOAL_X + 10, p.y, String(heightBonus), '#ffd54f');
  p.x = GOAL_X - p.w + 2; p.vx = 0; p.vy = 0; p.facing = 1;
  sfx.win();
}

// ---------- Per-film gimmicks ----------
function followVIP() {
  const p = player, last = trail[trail.length - 1];
  const nx = p.x + p.w / 2 - vip.w / 2, ny = p.y + p.h - vip.h;
  if (!last || Math.abs(last.x - nx) + Math.abs(last.y - ny) > 0.5) trail.push({ x: nx, y: ny, facing: p.facing });
  vip.moving = false;
  if (trail.length > 36) {
    const t = trail.shift();
    vip.moving = Math.abs(t.x - vip.x) > 0.2;
    vip.x = t.x; vip.y = t.y; vip.facing = t.facing;
  }
}

function triggerAlarm() {
  game.alarm = 150; game.alarmCD = 360;
  sfx.siren();
  popup(player.x - 10, player.y - 24, '¡ALARMA!', '#ff5252');
  for (const side of [1, -1]) {
    const e = makeEnemy('carcelero', 0, 12);
    e.x = side > 0 ? game.camX + VIEW_W + 10 : Math.max(0, game.camX - 40);
    e.y = 60;
    e.vx = -side * e.chase;
    e.active = true;
    entities.push(e);
  }
}

function resolveSlot(s) {
  const r = Math.random();
  let prize;
  if (r < 0.12) { s.reels = [0, 0, 0]; prize = 15; popup(s.x - 16, s.y - 30, '¡JACKPOT! +15€', '#ffd54f'); sfx.jackpot(); }
  else if (r < 0.35) { s.reels = [1, 1, 1]; prize = 5; popup(s.x - 8, s.y - 30, '+5€', '#ffd54f'); sfx.coin(); }
  else if (r < 0.85) { s.reels = [2, 0, 1]; prize = 1; popup(s.x, s.y - 30, '+1€', '#ffd54f'); sfx.coin(); }
  else { s.reels = [3, 2, 0]; prize = -3; popup(s.x - 30, s.y - 30, 'LA BANCA GANA -3€', '#ff5252'); sfx.lose(); }
  addEuros(prize);
  for (let i = 0; i < Math.min(prize, 6); i++) coinPops.push({ x: s.x + 8 + (i - 2) * 6, y: s.y - 24, vy: -8 - i, life: 30 });
}

const GIMMICK_UPDATE = {
  missiles(p) {
    if (p.x > 15 * TILE && p.x < GOAL_X - 500) game.missileT++;
    if (!game.missileWarn && game.missileT >= 300) {
      game.missileT = 0;
      game.missileWarn = { t: 60, y: clamp(p.y + p.h - 22, 80, GROUND_Y - 16) };
      sfx.warn();
    }
    if (game.missileWarn && --game.missileWarn.t <= 0) {
      missiles.push({ x: game.camX + VIEW_W + 20, y: game.missileWarn.y, w: 46, h: 14, vx: -6, vy: 0, dead: false });
      game.missileWarn = null;
      sfx.missile();
    }
    for (const m of missiles) {
      if (m.dead) { m.vy += 0.5; m.y += m.vy; continue; }
      m.x += m.vx;
      if (!overlap(p, m)) continue;
      if (p.fary > 0 || (p.vy > 0 && p.y + p.h - m.y < 14)) {
        m.dead = true; m.vy = -3;
        if (p.fary <= 0) p.vy = jumpHeld() ? -11 : -7;
        game.score += 300; popup(m.x, m.y - 10, '300'); sfx.stomp();
      } else if (p.hug === 0) killPlayer('¡TE HA DADO EL MISIL!');
    }
    missiles = missiles.filter(m => m.x > game.camX - 120 && m.y < VIEW_H + 40);
  },
  escort(p) {
    followVIP();
    for (const e of entities) {
      if (e.dead || !e.active || !overlap(vip, e)) continue;
      if (p.fary > 0) killEnemy(e, 'flip');
      else { vip.hit = true; killPlayer('¡HAN TOCADO A LA EURODIPUTADA!'); return; }
    }
  },
  searchlight(p) {
    if (game.alarmCD > 0) game.alarmCD--;
    if (game.alarm > 0) game.alarm--;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    for (const s of searchlights) {
      s.a = Math.PI / 2 + Math.sin(game.frame * s.speed + s.phase) * s.amp;
      const dx = cx - s.x, dy = cy - s.y;
      s.spot = Math.hypot(dx, dy) < s.len && Math.abs(Math.atan2(dy, dx) - s.a) < s.hw;
      if (s.spot && game.alarmCD === 0) triggerAlarm();
    }
  },
  slots() {
    for (const s of slots.values()) {
      if (s.t <= 0) continue;
      s.t--;
      if (s.t % 3 === 0) sfx.slotTick();
      if (s.t === 0) resolveSlot(s);
    }
  },
  votes(p) {
    if (shoutPressed() && game.shoutCD === 0) {
      game.shoutCD = 150; p.shout = 24;
      shockwaves.push({ x: p.x + p.w / 2, y: p.y + p.h / 2, r: 10, life: 24 });
      popup(p.x - 20, p.y - 26, '¡VOTADME!', '#ffd54f');
      sfx.shout();
    }
    for (const sw of shockwaves) {
      sw.r += 7; sw.life--;
      for (const e of entities) {
        if (e.dead || !e.active) continue;
        if (Math.hypot(e.x + e.w / 2 - sw.x, e.y + e.h / 2 - sw.y) < Math.min(sw.r, 170)) killEnemy(e, 'flip');
      }
    }
    shockwaves = shockwaves.filter(sw => sw.life > 0);
  },
};

// ---------- Update ----------
function update() {
  game.frame++;
  if (pressed.KeyM) toggleMusic();
  setMusic(desiredTrack());
  switch (game.state) {
    case 'title':
      if (menuLeft()) game.selected = (game.selected + LEVELS.length - 1) % LEVELS.length;
      if (menuRight()) game.selected = (game.selected + 1) % LEVELS.length;
      if (enterPressed()) newGame(game.selected);
      break;
    case 'intro':
      game.introT++;
      if (game.introT > 200 || (game.introT > 20 && (enterPressed() || jumpPressed()))) game.state = 'play';
      break;
    case 'play':
      if (pressed.KeyP) { game.state = 'pause'; break; }
      updatePlay(); updateFx(); break;
    case 'pause': if (pressed.KeyP) game.state = 'play'; break;
    case 'dying': updateDying(); updateFx(); break;
    case 'win': updateWin(); updateFx(); break;
    case 'reward':
      if (game.frame - game.rewardAt > 30 && (pressed.Enter || pressed.NumpadEnter)) nextLevel();
      break;
    case 'gameover':
    case 'ending':
      if (pressed.Enter || pressed.NumpadEnter) { game.state = 'title'; showShoutButton(false); }
      break;
  }
  for (const k in pressed) delete pressed[k];
}

function desiredTrack() {
  switch (game.state) {
    case 'title': case 'intro': return 'beach';
    case 'play': return player.fary > 0 ? 'fary' : 'beach';
    case 'reward': case 'ending': return 'fary';
    default: return null;
  }
}

function updatePlayer(p) {
  const hugging = p.hug > 0;
  if (hugging) p.hug--;
  const accel = p.onGround ? 0.35 : 0.25;
  const max = runHeld() ? 5 : 3.2;
  const goLeft = !hugging && left(), goRight = !hugging && right();
  if (goLeft && !goRight) { p.vx -= accel; p.facing = -1; }
  else if (goRight && !goLeft) { p.vx += accel; p.facing = 1; }
  else { p.vx *= p.onGround ? 0.8 : 0.95; if (Math.abs(p.vx) < 0.05) p.vx = 0; }
  p.vx = clamp(p.vx, -max, max);

  // Coyote time + jump buffering for forgiving controls
  p.coyote = p.onGround ? 6 : p.coyote - 1;
  p.buffer = jumpPressed() && !hugging ? 6 : p.buffer - 1;
  if (p.buffer > 0 && p.coyote > 0) {
    p.vy = -11 - Math.abs(p.vx) * 0.3;
    p.buffer = 0; p.coyote = 0;
    sfx.jump();
  }
  const g = (jumpHeld() && p.vy < 0) ? 0.38 : 0.85;
  p.vy = Math.min(p.vy + g, 12);

  moveX(p);
  moveY(p, true);
  p.anim += Math.abs(p.vx) * 0.15;
  if (p.shout > 0) p.shout--;
  if (p.y > VIEW_H + 40) killPlayer();
}

function updateEnemies(p) {
  for (const e of entities) {
    if (!e.active) {
      if (e.x < game.camX + VIEW_W + 64) e.active = true; else continue;
    }
    if (e.dead) {
      e.deadT++;
      if (e.squashed) { if (e.deadT > 30) e.remove = true; }
      else { e.vy += 0.5; e.y += e.vy; if (e.y > VIEW_H + 60) e.remove = true; }
      continue;
    }
    e.t++;
    if (e.fly) {
      e.x += e.vx;
      e.y = e.baseY + Math.sin(e.t * 0.05) * 40;
    } else {
      if (e.hop && e.onGround && e.t % e.hop === 0) e.vy = -7;
      if (e.chase && e.onGround && e.t % 20 === 0) {
        const dx = p.x - e.x;
        e.vx = Math.abs(dx) < 300 ? Math.sign(dx) * e.chase : Math.sign(e.vx || -1) * e.speed;
      }
      e.vy = Math.min(e.vy + 0.5, 10);
      e.hitWall = false;
      const vx = e.vx;
      moveX(e);
      if (e.hitWall) e.vx = -vx;
      moveY(e, false);
      if (e.y > VIEW_H + 100) e.remove = true;
    }
    if (e.x < game.camX - 300) e.remove = true;

    if (game.state === 'play' && p.hug === 0 && overlap(p, e)) {
      if (p.fary > 0) killEnemy(e, 'flip');
      else if (p.vy > 0 && p.y + p.h - e.y < 18) {
        killEnemy(e, 'squash');
        p.y = e.y - p.h;
        p.vy = jumpHeld() ? -11 : -7;
      } else killPlayer();
    }
  }
  entities = entities.filter(e => !e.remove);
}

function updateFans(p) {
  for (const f of fans) {
    if (f.bubble && --f.bubble.t <= 0) f.bubble = null;
    if (f.x < game.camX - 200 || f.x > game.camX + VIEW_W + 200) continue;
    f.t++;
    if (f.hugT > 0) { f.hugT--; continue; }
    if (f.hugged) {
      // Celebrating: hops on the spot, always facing Torrente
      f.facing = p.x > f.x ? 1 : -1;
      if (f.onGround && f.t % 40 === 0) f.vy = -5;
    } else {
      // Strolls around his spot waving the scarf
      if (Math.abs(f.x - f.homeX) > 24) f.vx = f.x > f.homeX ? -0.4 : 0.4;
      f.hitWall = false;
      moveX(f);
      if (f.hitWall) f.vx = -f.vx || 0.4;
      f.facing = f.vx > 0 ? 1 : -1;
    }
    f.vy = Math.min(f.vy + 0.5, 10);
    moveY(f, false);
    if (!f.hugged && p.hug === 0 && game.state === 'play' && overlap(p, f)) hugFan(p, f);
  }
}

function hugFan(p, f) {
  const side = f.x + f.w / 2 > p.x + p.w / 2 ? 1 : -1;
  f.hugged = true; f.hugT = HUG_FRAMES; f.facing = -side; f.vx = 0;
  f.x = side > 0 ? p.x + p.w - 8 : p.x - f.w + 8;
  p.hug = HUG_FRAMES; p.facing = side; p.vx = 0;
  let i;
  do { i = Math.floor(Math.random() * FAN_CHANTS.length); } while (i === lastChant && FAN_CHANTS.length > 1);
  lastChant = i;
  f.bubble = { text: FAN_CHANTS[i], x: (p.x + p.w / 2 + f.x + f.w / 2) / 2, y: Math.min(p.y, f.y) - 12, t: BUBBLE_FRAMES };
  game.score += FAN_POINTS;
  popup(side > 0 ? f.x + f.w + 4 : f.x - 40, p.y + 8, '+' + FAN_POINTS, '#ff8a80');
  for (let k = 0; k < 10; k++) {
    particles.push({ x: f.bubble.x, y: p.y + 10, vx: (Math.random() - 0.5) * 5, vy: -4 - Math.random() * 4, life: 40, color: k % 2 ? '#fff' : '#e53935', size: 5 });
  }
  sfx.hug();
}

function updatePlay() {
  const p = player;
  updatePlayer(p);
  updateEnemies(p);
  updateFans(p);
  for (const c of coins) {
    if (!c.taken && overlap(p, c)) { c.taken = true; addEuros(1); sfx.coin(); }
  }
  for (const v of votes) {
    if (!v.taken && overlap(p, v)) { v.taken = true; game.votes++; game.score += 100; sfx.vote(); }
  }
  const gimmick = GIMMICK_UPDATE[level.gimmick];
  if (gimmick && game.state === 'play') gimmick(p);
  game.camX = clamp(p.x - VIEW_W * 0.4, 0, LEVEL_W * TILE - VIEW_W);
  if (++game.timeTick >= 30) {
    game.timeTick = 0;
    game.time--;
    if (game.time <= 0) killPlayer('¡SE ACABÓ EL TIEMPO!');
  }
  if (p.fary > 0) p.fary--;
  if (game.shoutCD > 0) game.shoutCD--;
  if (game.state === 'play' && p.x + p.w >= GOAL_X) startWin();
}

function updateDying() {
  const p = player;
  game.deathT++;
  if (game.deathT > 30) { p.vy += 0.5; p.y += p.vy; }
  if (game.deathT > 150) {
    game.lives--;
    if (game.lives > 0) startLevel();
    else { game.state = 'gameover'; showShoutButton(false); }
  }
}

function updateWin() {
  const p = player, w = game.win;
  w.t++;
  game.flagY = Math.min(game.flagY + 4, 280);
  if (w.phase === 'slide') {
    p.y += 4;
    if (p.y + p.h >= GROUND_Y) { p.y = GROUND_Y - p.h; p.x = GOAL_X + 6; w.phase = 'walk'; }
  } else if (w.phase === 'walk') {
    p.vx = 2; p.x += p.vx; p.anim += 0.3; p.onGround = true;
    if (p.x >= BAR_X + 90) { p.vx = 0; w.phase = 'bonus'; }
  } else if (w.phase === 'bonus') {
    if (game.time > 0) {
      const d = Math.min(2, game.time);
      game.time -= d; game.score += d * 10;
      if (game.frame % 4 === 0) tone(1200, 0.03, { vol: 0.03 });
    } else { w.phase = 'cheers'; w.t = 0; }
  } else if (w.phase === 'cheers' && w.t > 90) {
    game.reward = {
      whisky: clamp(1 + Math.floor(game.levelEuros / 10), 1, 10),
      beer: clamp(2 + Math.floor(game.levelEuros / 5), 2, 10),
    };
    game.state = 'reward';
    game.rewardAt = game.frame;
  }
  if (vip) followVIP();
  game.camX = clamp(p.x - VIEW_W * 0.4, 0, LEVEL_W * TILE - VIEW_W);
}

function updateFx() {
  if (game.faryShow > 0) game.faryShow--;
  for (const [k, t] of bumps) { if (t <= 1) bumps.delete(k); else bumps.set(k, t - 1); }
  for (const pt of particles) { pt.vy += 0.4; pt.x += pt.vx; pt.y += pt.vy; pt.life--; }
  particles = particles.filter(pt => pt.life > 0);
  for (const c of coinPops) { c.vy += 0.5; c.y += c.vy; c.life--; }
  coinPops = coinPops.filter(c => c.life > 0);
  for (const pu of popups) { pu.y -= 0.8; pu.life--; }
  popups = popups.filter(pu => pu.life > 0);
}

// ---------- Drawing: world ----------
function drawTile(t, x, y, tx, ty) {
  const P = level.theme.tiles;
  const h = hash(tx, ty);
  switch (t) {
    case T.SAND:
      box(x, y, TILE, TILE, P.top); box(x, y, TILE, 5, P.topLight);
      box(x + h % 26, y + 10 + (h >> 5) % 16, 3, 3, P.speck);
      box(x + (h >> 9) % 26, y + 10 + (h >> 13) % 16, 2, 2, P.speck);
      break;
    case T.DIRT:
      box(x, y, TILE, TILE, P.fill);
      box(x + h % 26, y + (h >> 5) % 26, 4, 3, P.fillSpeck);
      break;
    case T.CRATE:
      box(x, y, TILE, TILE, P.crate[0]); box(x + 2, y + 2, TILE - 4, TILE - 4, P.crate[1]);
      box(x + 2, y + 10, TILE - 4, 2, P.crate[2]); box(x + 2, y + 20, TILE - 4, 2, P.crate[2]);
      break;
    case T.QUESTION: {
      if (level.gimmick === 'slots') { drawSlotBlock(x, y, null, false); break; }
      box(x, y, TILE, TILE, '#8d6e00'); box(x + 2, y + 2, TILE - 4, TILE - 4, '#f7b500');
      const glow = Math.floor(game.frame / 20) % 3 === 0 ? '#fff3c4' : '#fff';
      txt('?', x + 16, y + 8, { size: 16, align: 'center', color: glow, shadow: false });
      break;
    }
    case T.FARY:
      box(x, y, TILE, TILE, '#4a148c'); box(x + 2, y + 2, TILE - 4, TILE - 4, '#8e24aa');
      ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x + 16, y + 8, 8, 2.5, 0, 0, Math.PI * 2); ctx.stroke();
      txt('F', x + 16, y + 12, { size: 12, align: 'center', color: GOLD, shadow: false });
      break;
    case T.USED:
      box(x, y, TILE, TILE, '#5d4037'); box(x + 2, y + 2, TILE - 4, TILE - 4, '#8d6e63');
      break;
    case T.STONE:
      box(x, y, TILE, TILE, P.stone[0]); box(x + 2, y + 2, TILE - 4, TILE - 4, P.stone[1]);
      box(x + 2, y + 2, TILE - 4, 3, P.stone[2]);
      break;
  }
}

function drawTiles(cam) {
  const x0 = Math.max(0, Math.floor(cam / TILE)), x1 = Math.min(LEVEL_W - 1, x0 + Math.ceil(VIEW_W / TILE) + 1);
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const t = grid[ty][tx];
      if (!t) continue;
      const key = `${tx},${ty}`;
      const b = bumps.get(key);
      const off = b ? -Math.sin((b / 10) * Math.PI) * 8 : 0;
      const s = slots.get(key);
      if (s) drawSlotBlock(tx * TILE, ty * TILE + off, s.reels, s.t > 0);
      else drawTile(t, tx * TILE, ty * TILE + off, tx, ty);
    }
  }
}

function drawSearchlights(cam) {
  for (const s of searchlights) {
    if (s.x < cam - 400 || s.x > cam + VIEW_W + 400) continue;
    box(s.x - 10, s.y, 20, GROUND_Y - s.y, '#455a64');
    box(s.x - 20, s.y - 22, 40, 22, '#37474f');
    poly([[s.x - 26, s.y - 22], [s.x + 26, s.y - 22], [s.x, s.y - 40]], '#263238');
    const a1 = s.a - s.hw, a2 = s.a + s.hw;
    poly([[s.x, s.y], [s.x + Math.cos(a1) * s.len, s.y + Math.sin(a1) * s.len], [s.x + Math.cos(a2) * s.len, s.y + Math.sin(a2) * s.len]],
      s.spot ? 'rgba(255, 82, 82, 0.35)' : 'rgba(255, 249, 196, 0.28)');
    ell(s.x, s.y, 7, 7, '#fff9c4');
  }
}

let darkCanvas = null;
function drawDarkness(cam) {
  if (!darkCanvas) { darkCanvas = document.createElement('canvas'); darkCanvas.width = VIEW_W; darkCanvas.height = VIEW_H; }
  const d = darkCanvas.getContext('2d');
  d.globalCompositeOperation = 'source-over';
  d.clearRect(0, 0, VIEW_W, VIEW_H);
  d.fillStyle = 'rgba(4, 6, 20, 0.93)';
  d.fillRect(0, 0, VIEW_W, VIEW_H);
  d.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r) => {
    const g = d.createRadialGradient(x, y, r * 0.25, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = g; d.beginPath(); d.arc(x, y, r, 0, Math.PI * 2); d.fill();
  };
  const p = player;
  const flicker = Math.sin(game.frame * 0.3) * 4;
  hole(p.x + p.w / 2 - cam, p.y + p.h / 2, (p.fary > 0 ? 280 : 140) + flicker);
  for (const dd of decos) {
    if (dd.type !== 'lamp') continue;
    const lx = dd.x + 22 - cam;
    if (lx > -150 && lx < VIEW_W + 150) hole(lx, 370, 130);
  }
  hole(BAR_X + 96 - cam, 340, 200);
  hole(620 - cam * 0.1, 110, 70);
  ctx.drawImage(darkCanvas, 0, 0);
  for (const dd of decos) {
    if (dd.type !== 'lamp') continue;
    const lx = dd.x + 22 - cam;
    if (lx > -100 && lx < VIEW_W + 100) poly([[lx - 5, 312], [lx + 5, 312], [lx + 60, GROUND_Y], [lx - 60, GROUND_Y]], 'rgba(255, 236, 150, 0.10)');
  }
}

function drawWorld() {
  const cam = Math.round(game.camX);
  level.theme.background(cam);
  ctx.save();
  ctx.translate(-cam, 0);
  for (const d of decos) {
    if (d.x < cam - 140 || d.x > cam + VIEW_W + 140) continue;
    DECO_DRAW[d.type](d);
  }
  if (level.gimmick === 'searchlight') drawSearchlights(cam);
  drawBarBack(level.goal);
  drawFlag();
  drawTiles(cam);
  const phase = game.frame * 0.08, style = level.theme.coinStyle;
  for (const c of coins) if (!c.taken && c.x > cam - 32 && c.x < cam + VIEW_W) drawCoin(c.x, c.y, c.w, c.h, phase, style);
  for (const v of votes) if (!v.taken && v.x > cam - 32 && v.x < cam + VIEW_W) drawVote(v.x, v.y);
  for (const c of coinPops) drawCoin(c.x, c.y, 16, 20, phase * 3, style);
  for (const e of entities) if (e.active) drawEnemy(e);
  for (const f of fans) if (f.x > cam - 60 && f.x < cam + VIEW_W + 60) drawFan(f);
  if (vip) drawVIP(vip);
  drawTorrente(player);
  drawBarFront();
  for (const m of missiles) drawMissile(m);
  for (const sw of shockwaves) {
    ctx.strokeStyle = `rgba(255, 213, 79, ${sw.life / 24})`; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(sw.x, sw.y, Math.min(sw.r, 170), 0, Math.PI * 2); ctx.stroke();
  }
  for (const pt of particles) box(pt.x, pt.y, pt.size, pt.size, pt.color);
  for (const pu of popups) txt(pu.text, pu.x, pu.y, { size: 10, color: pu.color });
  ctx.restore();

  if (level.gimmick === 'dark') drawDarkness(cam);
  for (const f of fans) if (f.bubble) drawBubble(f.bubble, cam);
  if (game.alarm > 0 && Math.floor(game.frame / 10) % 2 === 0) box(0, 0, VIEW_W, VIEW_H, 'rgba(255, 0, 0, 0.15)');
  if (game.missileWarn && Math.floor(game.frame / 6) % 2 === 0) {
    const y = game.missileWarn.y;
    poly([[VIEW_W - 12, y - 14], [VIEW_W - 44, y + 7], [VIEW_W - 12, y + 28]], '#ff1744');
    txt('!', VIEW_W - 27, y, { size: 14, align: 'center' });
  }
  if (game.faryShow > 0) drawFaryGod();
}

// Comic speech bubble with a tail pointing down between Torrente and the fan
function drawBubble(b, cam) {
  const size = 8, lineH = 12, maxChars = 18;
  const lines = [];
  for (const word of plainCaps(b.text).split(' ')) {
    const lastLine = lines[lines.length - 1];
    if (lastLine && (lastLine + ' ' + word).length <= maxChars) lines[lines.length - 1] = lastLine + ' ' + word;
    else lines.push(word);
  }
  ctx.font = `${size}px "Press Start 2P", monospace`;
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 16, h = lines.length * lineH + 12;
  const tipX = b.x - cam, tipY = b.y;
  const x = clamp(tipX - w / 2, 4, VIEW_W - w - 4), y = Math.max(78, tipY - h - 12);
  const pop = Math.min(1, (BUBBLE_FRAMES - b.t) / 8), alpha = Math.min(1, b.t / 20);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(tipX, tipY); ctx.scale(pop, pop); ctx.translate(-tipX, -tipY);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill(); ctx.stroke();
  const tx = clamp(tipX, x + 12, x + w - 12);
  ctx.beginPath(); ctx.moveTo(tx - 7, y + h - 1); ctx.lineTo(tipX, tipY); ctx.lineTo(tx + 7, y + h - 1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(tx - 7, y + h); ctx.lineTo(tipX, tipY); ctx.lineTo(tx + 7, y + h); ctx.stroke();
  lines.forEach((l, i) => txt(l, x + w / 2, y + 7 + i * lineH, { size, align: 'center', color: i % 2 ? '#1e3a8a' : '#c62828', shadow: false }));
  ctx.restore();
}

function hudInfo() {
  switch (level.gimmick) {
    case 'escort': return 'ESCOLTA: QUE NADIE TOQUE A LA EURODIPUTADA';
    case 'searchlight': return game.alarm > 0 ? '¡ALARMA! ¡VIENEN LOS CARCELEROS!' : 'ESQUIVA LOS FOCOS DE VIGILANCIA';
    case 'slots': return 'GOLPEA LAS TRAGAPERRAS: 777 = JACKPOT';
    case 'missiles': return game.missileWarn ? '¡MISIL ENTRANTE! ¡SALTA!' : null;
    case 'votes': return `VOTOS ${game.votes}/${game.votesTotal} (${votePct()}%)   MEGÁFONO: ${game.shoutCD === 0 ? 'LISTO' : '...'} [${isTouch ? 'MITIN' : 'C'}]`;
    default: return null;
  }
}

function drawHUD() {
  const pad = (n, l) => String(n).padStart(l, '0');
  box(0, 0, VIEW_W, 54, 'rgba(0, 0, 0, 0.3)');
  txt('TORRENTE', 16, 12); txt(pad(game.score, 6), 16, 32);
  drawCoin(190, 28, 14, 18, 0, level.theme.coinStyle);
  txt('EUROS', 190, 12); txt('x' + pad(game.euros, 2), 208, 32);
  txt(level.place, 330, 12); txt(`PELI ${level.num}`, 330, 32);
  txt('VIDAS', 530, 12); txt('x' + game.lives, 530, 32);
  txt('TIEMPO', 680, 12); txt(String(Math.max(0, game.time)), 680, 32);
  const info = hudInfo();
  if (info) {
    box(0, 54, VIEW_W, 20, 'rgba(0, 0, 0, 0.3)');
    txt(info, 16, 60, { size: 8, color: game.alarm > 0 || game.missileWarn ? '#ff8a80' : '#ffd54f' });
  }
  if (level.anaglyph) {
    txt('3D', VIEW_W - 44, 58, { size: 12, color: 'rgba(255,0,0,0.8)', shadow: false });
    txt('3D', VIEW_W - 40, 58, { size: 12, color: 'rgba(0,255,255,0.8)', shadow: false });
  }
}

// ---------- Screens ----------
const blinkOn = () => Math.floor(game.frame / 30) % 2 === 0;
const tapOr = (touchText, keyText) => (isTouch ? touchText : keyText);

function drawCast(types, y) {
  types.forEach((type, i) => {
    const d = ENEMY_DEF[type], x = 400 + (i - (types.length - 1) / 2) * 110;
    drawEnemy({ ...d, type, x: x - d.w / 2, y: y - d.h, vx: -1, t: game.frame, dead: false });
  });
}

function drawTitle() {
  const lv = LEVELS[game.selected];
  lv.theme.background(Math.floor(game.frame * 1.5) % 4000);
  box(0, 0, VIEW_W, VIEW_H, 'rgba(0,0,0,0.45)');
  drawRays(400, 85, 300, 0.22);
  drawHolyCloud(400, 150, 1.1);
  drawFary(400, 80, 0.7);
  txt('TORRENTE', 400, 172, { size: 44, align: 'center', color: '#ffd54f' });
  txt('LA SAGA COMPLETA', 400, 224, { size: 12, align: 'center' });
  box(60, 248, 680, 96, 'rgba(0,0,0,0.5)');
  txt('◀', 80, 284, { size: 20, color: '#ffd54f' });
  txt('▶', 720, 284, { size: 20, align: 'right', color: '#ffd54f' });
  txt(`PELÍCULA ${lv.num} DE ${LEVELS.length} · ${lv.year}`, 400, 258, { size: 10, align: 'center', color: '#ffd54f' });
  txt(lv.film, 400, 280, { size: lv.film.length > 20 ? 14 : 18, align: 'center' });
  txt(lv.tagline, 400, 312, { size: 8, align: 'center', color: '#b3e5fc' });
  txt(lv.place, 400, 328, { size: 8, align: 'center', color: '#bdbdbd' });
  drawCast(lv.cast, 392);
  txt(tapOr('◀ ▶ ELIGE PELÍCULA · SALTAR · CORRER · MITIN', '◀ ▶ MOVER  ESPACIO SALTAR  SHIFT CORRER  C MEGÁFONO  P PAUSA  M MÚSICA'), 400, 404, { size: 8, align: 'center' });
  txt('EL FARY VELA POR TI DESDE EL CIELO', 400, 422, { size: 8, align: 'center', color: '#ffd54f' });
  if (blinkOn()) txt(tapOr('TOCA PARA EMPEZAR', 'ENTER PARA EMPEZAR'), 400, 446, { size: 14, align: 'center' });
}

function drawIntro() {
  box(0, 0, VIEW_W, VIEW_H, '#000');
  txt(`PELÍCULA ${level.num} · ${level.year}`, 400, 80, { size: 12, align: 'center', color: '#ffd54f' });
  const size = level.film.length > 20 ? 18 : 22;
  if (level.anaglyph) {
    txt(level.film, 396, 124, { size, align: 'center', color: 'rgba(255,0,0,0.85)', shadow: false });
    txt(level.film, 404, 124, { size, align: 'center', color: 'rgba(0,255,255,0.85)', shadow: false });
    txt('¡AHORA EN 3D!', 400, 162, { size: 12, align: 'center', color: '#ff5252' });
  } else {
    txt(level.film, 400, 124, { size, align: 'center' });
  }
  txt(level.place, 400, 196, { size: 12, align: 'center', color: '#bdbdbd' });
  drawTorrente({ x: 350, y: 236, w: 26, h: 44, facing: 1, onGround: true, vx: 0, anim: 0, fary: 0, shout: 0 });
  txt(`x ${game.lives}`, 400, 252, { size: 16 });
  level.hint.forEach((line, i) => txt(line, 400, 318 + i * 22, { size: 10, align: 'center', color: '#b3e5fc' }));
  if (game.introT > 20 && blinkOn()) txt(tapOr('TOCA PARA EMPEZAR', 'ENTER PARA EMPEZAR'), 400, 420, { size: 12, align: 'center' });
}

function drawReward() {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, '#ff7043'); g.addColorStop(0.6, '#8e24aa'); g.addColorStop(1, '#311b92');
  box(0, 0, VIEW_W, VIEW_H, g);
  drawRays(400, 240, 500, 0.12);
  const presidente = level.gimmick === 'votes';
  const title = presidente ? (votePct() >= 50 ? '¡TORRENTE PRESIDENTE!' : '¡GOBIERNO EN FUNCIONES!') : '¡PELÍCULA SUPERADA!';
  txt(title, 400, 26, { size: title.length > 18 ? 22 : 26, align: 'center', color: '#ffd54f' });
  txt(presidente ? `VOTOS: ${votePct()}% · CELEBRACIÓN EN ${level.goal.at}:` : `TORRENTE SE LO HA GANADO EN ${level.goal.at}:`, 400, 70, { size: 10, align: 'center' });
  const r = game.reward;
  drawDrinkRow(r.whisky, 170, drawWhisky);
  txt(`${r.whisky} WHISKY${r.whisky > 1 ? 'S' : ''}`, 400, 186, { size: 14, align: 'center', color: '#ffcc80' });
  drawDrinkRow(r.beer, 290, drawBeer);
  txt(`${r.beer} CERVEZAS`, 400, 306, { size: 14, align: 'center', color: '#fff59d' });
  txt(`EUROS EN ESTA PELI: ${game.levelEuros}    PUNTOS: ${game.score}`, 400, 352, { size: 10, align: 'center' });
  txt('"¡Esto es vida, coño!"', 400, 382, { size: 10, align: 'center', color: '#ffd54f' });
  const next = levelIndex < LEVELS.length - 1 ? 'SIGUIENTE PELÍCULA' : 'FIN DE LA SAGA';
  if (blinkOn()) txt(tapOr(`TOCA: ${next}`, `ENTER: ${next}`), 400, 430, { size: 12, align: 'center' });
}

function drawEnding() {
  skyGradient('#1a237e', '#ff7043');
  drawRays(400, 150, 500, 0.25);
  drawHolyCloud(400, 230, 1.5);
  drawFary(400, 140, 1.1);
  txt('FIN DE LA SAGA', 400, 290, { size: 26, align: 'center', color: '#ffd54f' });
  txt('EL FARY SE SIENTE ORGULLOSO DE TI', 400, 336, { size: 10, align: 'center' });
  txt(`PUNTOS TOTALES: ${game.score}    EUROS: ${game.euros}`, 400, 362, { size: 10, align: 'center' });
  txt('TORRENTE VOLVERÁ...', 400, 392, { size: 12, align: 'center', color: '#ff8a80' });
  if (blinkOn()) txt(tapOr('TOCA PARA VOLVER AL INICIO', 'ENTER PARA VOLVER AL INICIO'), 400, 436, { size: 10, align: 'center' });
}

function drawGameOver() {
  box(0, 0, VIEW_W, VIEW_H, 'rgba(0,0,0,0.7)');
  txt('GAME OVER', 400, 170, { size: 36, align: 'center', color: '#ef5350' });
  txt('EL FARY TE ESPERA EN EL CIELO...', 400, 240, { size: 12, align: 'center', color: '#ffd54f' });
  txt(`PUNTOS: ${game.score}`, 400, 280, { size: 12, align: 'center' });
  if (blinkOn()) txt(tapOr('TOCA PARA CONTINUAR', 'ENTER PARA CONTINUAR'), 400, 350, { size: 12, align: 'center' });
}

function draw() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  switch (game.state) {
    case 'title': drawTitle(); return;
    case 'intro': drawIntro(); return;
    case 'reward': drawReward(); return;
    case 'ending': drawEnding(); return;
  }
  drawWorld();
  drawHUD();
  if (game.state === 'dying' && game.deathMsg) txt(game.deathMsg, 400, 200, { size: 14, align: 'center', color: '#ff8a80' });
  if (game.state === 'pause') {
    box(0, 0, VIEW_W, VIEW_H, 'rgba(0,0,0,0.5)');
    txt('PAUSA', 400, 220, { size: 28, align: 'center' });
  }
  if (game.state === 'gameover') drawGameOver();
}

// ---------- Main loop (fixed 60 Hz timestep) ----------
const STEP = 1000 / 60;
let last = 0, acc = 0;
function loop(ts) {
  requestAnimationFrame(loop); // schedule first so one bad frame can't freeze the game
  if (!last) last = ts;
  acc += Math.min(ts - last, 250);
  last = ts;
  while (acc >= STEP) { update(); acc -= STEP; }
  draw();
}
buildLevel(level);
player = makePlayer();
if (!music.enabled) { const b = document.getElementById('mute'); if (b && b.classList) b.classList.add('on'); }
requestAnimationFrame(loop);
