/* ==========================================================================
 * pacman.js - the player: movement, turning, eating dots.
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;
  const { cfg, dom, G } = Pac;
  const { DIRS, COLS, ROWS } = cfg;

  const pac = {
    el: document.getElementById('pac'),
    x: 9, y: 15,            // position in tiles (centres are integers)
    dx: 0, dy: 0,           // current movement direction
    dir: DIRS.left,         // last facing (drives sprite rotation + ghost targeting)
    last: '',               // last transform string written (skip identical writes)
    moving: false,          // drives the mouth animation class
  };

  // Pac-Man cannot walk through walls or the ghost door.
  function can(c, r) {
    const ch = Pac.cellAt(c, r);
    return ch !== '#' && ch !== '-';
  }

  // Called when Pac-Man is exactly on a tile centre.
  function choose(p) {
    const want = Pac.input.heldDir();
    if (!want) { p.dx = 0; p.dy = 0; return; }              // key released -> stop on this tile
    if (can(p.x + want.x, p.y + want.y)) {
      p.dx = want.x; p.dy = want.y; p.dir = want;           // turn (or keep going) as requested
    } else if ((p.dx || p.dy) && !can(p.x + p.dx, p.y + p.dy)) {
      p.dx = 0; p.dy = 0;                                   // blocked by a wall
    }
  }

  const speedBoost = () => Math.min(1.15, 1 + (G.level - 1) * 0.03);

  function update(h) {
    // U-turns are allowed anywhere along a corridor, not just on centres.
    const want = Pac.input.heldDir();
    if (want && (pac.dx || pac.dy) && want.x === -pac.dx && want.y === -pac.dy) {
      pac.dx = want.x; pac.dy = want.y; pac.dir = want;
    }
    Pac.advance(pac, cfg.PAC_SPEED * speedBoost() * h, choose);
  }

  function eatDot() {
    const c = Math.round(pac.x), r = Math.round(pac.y);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;   // inside the tunnel
    const v = G.dots[r][c];
    if (!v) return;
    G.dots[r][c] = 0;
    G.dotEls[r][c].classList.add('eaten');
    G.dotsLeft--;
    if (v === 1) Pac.hud.setScore(G.score + 10);
    else { Pac.hud.setScore(G.score + 50); Pac.ghosts.frighten(); }
  }

  function reset() {
    pac.x = 9; pac.y = 15; pac.dx = 0; pac.dy = 0; pac.dir = DIRS.left; pac.last = '';
  }

  pac.update = update;
  pac.eatDot = eatDot;
  pac.reset = reset;
  Pac.pac = pac;
})();