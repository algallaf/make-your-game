/* ==========================================================================
 * movement.js - grid movement shared by Pac-Man and the ghosts.
 *
 * Entities live on the tile grid with tile CENTRES at integer coordinates
 * (x = 3, y = 5 is the middle of column 3, row 5). They glide smoothly
 * between centres. Whenever an entity is exactly on a centre, `choose(e)`
 * is called so it can pick a new direction (e.dx / e.dy).
 *
 * The distance moved per call can be several tiles' worth of time; the loop
 * handles crossing centres in the middle of a step, so nothing is skipped.
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;
  const COLS = Pac.cfg.COLS;

  Pac.advance = function advance(e, dist, choose) {
    let guard = 0;
    while (dist > 1e-9 && guard++ < 8) {
      if (Number.isInteger(e.x) && Number.isInteger(e.y)) {
        choose(e);
        if (!e.dx && !e.dy) return;            // chose to stand still
      }

      // distance to the next tile centre in the direction of travel
      let tx = e.x, ty = e.y, d;
      if (e.dx) {
        tx = e.dx > 0 ? Math.floor(e.x) + 1 : Math.ceil(e.x) - 1;
        d = Math.abs(tx - e.x);
      } else {
        ty = e.dy > 0 ? Math.floor(e.y) + 1 : Math.ceil(e.y) - 1;
        d = Math.abs(ty - e.y);
      }

      if (dist >= d - 1e-9) {                  // reach the centre exactly (no float drift)
        e.x = tx; e.y = ty; dist -= d;
        // tunnel wrap: columns -1 and COLS are the same off-screen spot
        if (e.x <= -1) e.x = COLS; else if (e.x >= COLS) e.x = -1;
      } else {                                 // stop part-way between centres
        e.x += e.dx * dist; e.y += e.dy * dist; dist = 0;
      }
    }
  };
})();