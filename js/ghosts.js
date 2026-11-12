/* ==========================================================================
 * ghosts.js - the four ghosts and their behaviour.
 *
 * Ghost `state`:
 *   house  waiting inside the ghost house for its release timer
 *   leave  walking out through the door
 *   roam   normal play: scatter to a corner or chase Pac-Man, depending on G.mode
 *   eaten  only the eyes remain; rushes back to the house along the shortest path
 * `fright` is a separate flag (blue, slow, random wandering).
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;
  const { cfg, dom, G } = Pac;
  const { DIR_LIST, EXIT, HOME, TUNNEL_ROW, COLS, ROWS } = cfg;

  function make(id, name, corner) {
    const el = document.createElement('div');
    el.className = 'sprite ghost ' + name;
    el.innerHTML =
      '<div class="shape body"></div><div class="shape flash"></div>' +
      '<div class="eyes"><i class="eye"><b></b></i><i class="eye"><b></b></i></div>';
    dom.actors.appendChild(el);
    return { id, name, el, corner, x: 9, y: 9, dx: 0, dy: 0, face: 'l',
             state: 'house', fright: false, wait: 0, last: '', cls: '', faceShown: '' };
  }

  const list = [
    make(0, 'blinky', [18, -1]),   // corner = scatter target (may be off-board)
    make(1, 'pinky',  [0, -1]),
    make(2, 'inky',   [18, 22]),
    make(3, 'clyde',  [0, 22]),
  ];

  // Where each ghost starts and how long it waits (seconds) before leaving.
  const STARTS = [
    { x: 9,  y: 7, state: 'roam',  wait: 0 },
    { x: 9,  y: 9, state: 'house', wait: 0.8 },
    { x: 8,  y: 9, state: 'house', wait: 3.5 },
    { x: 10, y: 9, state: 'house', wait: 6.5 },
  ];

  function reset() {
    list.forEach((g, i) => {
      const s = STARTS[i];
      g.x = s.x; g.y = s.y; g.state = s.state;
      g.wait = Math.max(0.3, s.wait - (G.level - 1) * 0.3);   // later levels release faster
      g.dx = i === 0 ? -1 : 0; g.dy = 0;
      g.face = 'l'; g.fright = false; g.last = '';
    });
  }

  // Power pellet: everyone turns blue and reverses.
  function frighten() {
    G.frightT = Math.max(2.5, 7 - (G.level - 1) * 0.8);
    G.combo = 0;
    for (const g of list) {
      if (g.state === 'eaten') continue;
      if (!g.fright && g.state === 'roam') { g.dx = -g.dx; g.dy = -g.dy; }
      g.fright = true;
    }
  }

  // The door is only passable for ghosts that are leaving or going home.
  function can(g, c, r) {
    const ch = Pac.cellAt(c, r);
    if (ch === '#') return false;
    if (ch === '-') return g.state === 'leave' || g.state === 'eaten';
    return true;
  }

  // Tile a roaming ghost is steering toward (each ghost has its own personality).
  function target(g) {
    if (G.mode === 'scatter') return g.corner;
    const pac = Pac.pac;
    const px = Math.round(pac.x), py = Math.round(pac.y), d = pac.dir;
    switch (g.id) {
      case 0: return [px, py];                                   // Blinky: straight at Pac-Man
      case 1: return [px + d.x * 4, py + d.y * 4];               // Pinky: 4 tiles ahead
      case 2: {                                                  // Inky: mirror of Blinky around 2 tiles ahead
        const b = list[0];
        return [2 * (px + d.x * 2) - Math.round(b.x), 2 * (py + d.y * 2) - Math.round(b.y)];
      }
      default: {                                                 // Clyde: chases when far, shy when close
        const dx = g.x - pac.x, dy = g.y - pac.y;
        return dx * dx + dy * dy > 64 ? [px, py] : g.corner;
      }
    }
  }

  // Called when a ghost is exactly on a tile centre: pick the next direction.
  function choose(g) {
    const x = g.x, y = g.y;
    if (g.state === 'leave' && x === EXIT.c && y === EXIT.r) g.state = 'roam';
    if (g.state === 'eaten' && x === HOME.c && y === HOME.r) { g.state = 'leave'; g.fright = false; }

    const mayReverse = g.state === 'leave' || g.state === 'eaten';
    const moving = g.dx !== 0 || g.dy !== 0;
    let tgt = null;
    if (g.state === 'leave') tgt = [EXIT.c, EXIT.r];
    else if (g.state !== 'eaten' && !g.fright) tgt = target(g);

    let best = null, bestScore = Infinity;
    for (const d of DIR_LIST) {
      if (!mayReverse && moving && g.dx === -d.x && g.dy === -d.y) continue;   // no U-turns
      const nx = x + d.x, ny = y + d.y;
      if (!can(g, nx, ny)) continue;

      let sc;
      if (g.state === 'eaten') {
        const hd = (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) ? Pac.maze.homeDist[ny][nx] : -1;
        sc = hd < 0 ? 9999 : hd;                       // follow the BFS table home
      } else if (tgt) {
        const ex = nx - tgt[0], ey = ny - tgt[1];
        sc = ex * ex + ey * ey;                        // closest to the target tile
      } else {
        sc = Math.random();                            // frightened: wander randomly
      }
      if (sc < bestScore) { bestScore = sc; best = d; }
    }

    if (!best) {                                       // dead end: turn around
      if (moving && can(g, x - g.dx, y - g.dy)) { g.dx = -g.dx; g.dy = -g.dy; }
      else { g.dx = 0; g.dy = 0; }
    } else {
      g.dx = best.x; g.dy = best.y;
    }
    if (g.dx || g.dy) g.face = g.dx > 0 ? 'r' : g.dx < 0 ? 'l' : g.dy > 0 ? 'd' : 'u';
  }

  function speed(g) {
    if (g.state === 'eaten') return cfg.EATEN_SPEED;
    let s = cfg.GHOST_SPEED * Math.min(1.18, 1 + (G.level - 1) * 0.04);
    if (g.fright) s = cfg.FRIGHT_SPEED;
    else if (g.y === TUNNEL_ROW && (g.x < 3.5 || g.x > 15.5)) s *= 0.55;   // slow in the tunnel
    return s;
  }

  function update(h) {
    for (const g of list) {
      if (g.state === 'house') {
        g.wait -= h;
        if (g.wait <= 0) g.state = 'leave';
        continue;
      }
      Pac.advance(g, speed(g) * h, choose);
    }
  }

  function eat(g) {
    G.combo++;
    const pts = 200 * Math.pow(2, Math.min(G.combo, 4) - 1);     // 200, 400, 800, 1600
    Pac.hud.setScore(G.score + pts);
    Pac.hud.popup(pts, g.x, g.y);
    g.state = 'eaten';
    g.fright = false;
  }

  // Returns true if Pac-Man was caught by a (non-frightened) ghost.
  function checkCollisions() {
    const pac = Pac.pac;
    for (const g of list) {
      if (g.state === 'eaten') continue;
      const dx = g.x - pac.x, dy = g.y - pac.y;
      if (dx * dx + dy * dy < 0.36) {                            // closer than 0.6 tile
        if (g.fright) eat(g);
        else return true;
      }
    }
    return false;
  }

  // Counts down frightened time, then advances the scatter/chase schedule.
  function updateModes(h) {
    if (G.frightT > 0) {
      G.frightT -= h;
      if (G.frightT <= 0) { G.frightT = 0; for (const g of list) g.fright = false; }
      return;                                                    // schedule is paused while frightened
    }
    G.modeT -= h;
    if (G.modeT <= 0 && G.modeIdx < cfg.MODES.length - 1) {
      G.modeIdx++;
      G.modeT = cfg.MODES[G.modeIdx][1];
      G.mode = cfg.MODES[G.modeIdx][0];
      for (const g of list) if (g.state === 'roam') { g.dx = -g.dx; g.dy = -g.dy; }   // ghosts reverse on a switch
    }
  }

  Pac.ghosts = { list, reset, frighten, update, updateModes, checkCollisions };
})();