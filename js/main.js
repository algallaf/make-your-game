/* ==========================================================================
 * main.js - boots the game and runs the requestAnimationFrame loop.
 *
 * The loop NEVER stops, even when paused: pausing only skips update(), so
 * the frame cadence stays steady and there are no frame drops on resume.
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;
  const { cfg, G } = Pac;

  let lastT = 0;

  function frame(t) {
    requestAnimationFrame(frame);                 // schedule the next frame first
    const w0 = performance.now();

    if (!lastT) { lastT = t; Pac.perf.start(t); Pac.render(); return; }
    const dtMs = t - lastT;
    lastT = t;
    Pac.perf.frame(dtMs);

    const dt = Math.min(dtMs / 1000, cfg.MAX_DT);   // clamp: don't fast-forward after a stall
    if (!G.paused) Pac.flow.update(dt);
    Pac.render();

    Pac.perf.end(t, performance.now() - w0);
  }

  // Pause automatically when the player leaves the tab/window.
  function autoPause() {
    held_clear();
    if (G.phase !== 'start' && G.phase !== 'over') Pac.flow.setPaused(true);
  }
  function held_clear() { Pac.input.held.length = 0; }
  window.addEventListener('blur', autoPause);
  document.addEventListener('visibilitychange', () => {
    lastT = 0;                                    // ignore the long gap while hidden
    if (document.hidden) autoPause();
  });

  // ---- boot ----
  Pac.maze.fit();
  Pac.hud.setLives();
  Pac.flow.resetActors();
  Pac.render();
  requestAnimationFrame(frame);

  // Read-only hook used by the automated tests; harmless in the browser.
  window.__pac = {
    get state() { return G.phase; }, get score() { return G.score; }, get lives() { return G.lives; },
    get dotsLeft() { return G.dotsLeft; }, pac: Pac.pac, ghosts: Pac.ghosts.list, MAP: cfg.MAP,
  };
})();