/* ==========================================================================
 * render.js - copies the simulation state onto the DOM, once per frame.
 *
 * This is the ONLY per-frame DOM work, and it is cheap on purpose:
 *   - moving sprites are positioned with `transform` (compositor only,
 *     no layout and no repaint)
 *   - a style/class is written only when its value actually changed
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;
  const { G } = Pac;

  Pac.render = function render() {
    const T = G.T;
    const pac = Pac.pac;

    // Pac-Man: position + rotation
    const ps = 'translate3d(' + (pac.x * T).toFixed(2) + 'px,' + (pac.y * T).toFixed(2) + 'px,0) rotate(' + pac.dir.ang + 'deg)';
    if (ps !== pac.last) { pac.el.style.transform = ps; pac.last = ps; }

    // mouth chomps only while actually moving
    const mv = G.phase === 'playing' && !G.paused && (pac.dx !== 0 || pac.dy !== 0);
    if (mv !== pac.moving) { pac.moving = mv; pac.el.classList.toggle('moving', mv); }

    // ghosts: position, colour state, eye direction
    for (const g of Pac.ghosts.list) {
      const s = 'translate3d(' + (g.x * T).toFixed(2) + 'px,' + (g.y * T).toFixed(2) + 'px,0)';
      if (s !== g.last) { g.el.style.transform = s; g.last = s; }

      const cls = g.state === 'eaten' ? 'eaten' : g.fright ? (G.frightT < 2 ? 'fright blink' : 'fright') : '';
      if (cls !== g.cls) { g.cls = cls; g.el.className = 'sprite ghost ' + g.name + (cls ? ' ' + cls : ''); }

      if (g.face !== g.faceShown) { g.faceShown = g.face; g.el.dataset.d = g.face; }
    }
  };
})();