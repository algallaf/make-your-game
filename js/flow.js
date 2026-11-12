/* ==========================================================================
 * flow.js - the game's rules and phases: start, ready, playing, dying,
 * level clear, game over, plus pause/restart and the pause menu.
 * `update(dt)` is called once per animation frame while not paused.
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;
  const { cfg, dom, G, hud } = Pac;

  const READY_TIME = 2, DYING_TIME = 1.3, CLEAR_TIME = 1.8;

  // ---------------------------------------------------------- setup helpers
  function resetActors() {
    Pac.pac.reset();
    Pac.ghosts.reset();
    G.frightT = 0; G.combo = 0;
    G.mode = cfg.MODES[0][0]; G.modeIdx = 0; G.modeT = cfg.MODES[0][1];
    dom.board.classList.remove('dying', 'clear');
    dom.walls.classList.remove('flash');
  }

  function startReady() {
    G.phase = 'ready';
    G.readyT = READY_TIME;
    hud.showMsg('READY!');
  }

  // Starts a brand-new game (also used by the pause menu's Restart).
  function restartGame() {
    G.score = 0; G.lives = cfg.START_LIVES; G.level = 1; G.time = 0;
    G.extraLifeGiven = false; G.lastSec = -1;
    G.paused = false;
    document.body.classList.remove('paused');
    dom.pause.classList.add('hidden'); dom.over.classList.add('hidden'); dom.start.classList.add('hidden');
    dom.score.textContent = '0';
    hud.setLevel(); hud.setLives(); hud.setTimer();
    Pac.maze.buildDots(true);
    resetActors();
    startReady();
  }

  // ----------------------------------------------------------- phase changes
  function loseLife() {
    G.phase = 'dying';
    G.dyingT = DYING_TIME;
    dom.board.classList.add('dying');
  }

  function levelClear() {
    G.phase = 'clear';
    G.clearT = CLEAR_TIME;
    dom.board.classList.add('clear');
    dom.walls.classList.add('flash');
  }

  function gameOver() {
    G.phase = 'over';
    hud.hideMsg();
    dom.overInfo.textContent = 'Score ' + G.score + '  ·  Time ' + hud.fmtTime(Math.floor(G.time)) + '  ·  Level ' + G.level;
    dom.over.classList.remove('hidden');
  }

  // --------------------------------------------------------- one sim sub-step
  function simStep(h) {
    Pac.ghosts.updateModes(h);
    Pac.pac.update(h);
    Pac.pac.eatDot();
    if (G.dotsLeft <= 0) { levelClear(); return; }
    Pac.ghosts.update(h);
    if (Pac.ghosts.checkCollisions()) loseLife();
  }

  // ------------------------------------------------------------ per frame
  function update(dt) {
    switch (G.phase) {
      case 'playing': {
        G.time += dt;
        hud.setTimer();
        // Split the frame into small fixed-size sub-steps: speed never depends on
        // the display's refresh rate and fast sprites can't skip through each other.
        const n = Math.max(1, Math.ceil(dt / cfg.STEP));
        const h = dt / n;
        for (let i = 0; i < n && G.phase === 'playing'; i++) simStep(h);
        break;
      }
      case 'ready':
        G.readyT -= dt;
        if (G.readyT <= 0) { G.phase = 'playing'; hud.hideMsg(); }
        break;
      case 'dying':
        G.dyingT -= dt;
        if (G.dyingT <= 0) {
          G.lives--;
          hud.setLives();
          if (G.lives <= 0) gameOver();
          else { resetActors(); startReady(); }
        }
        break;
      case 'clear':
        G.clearT -= dt;
        if (G.clearT <= 0) {
          G.level++;
          hud.setLevel();
          Pac.maze.buildDots(true);
          resetActors();
          startReady();
        }
        break;
    }
  }

  // ------------------------------------------------------------- pause menu
  let sel = 0;                                  // 0 = Continue, 1 = Restart

  function renderMenu() {
    dom.btnContinue.classList.toggle('sel', sel === 0);
    dom.btnRestart.classList.toggle('sel', sel === 1);
  }

  function setPaused(p) {
    if (G.phase === 'start' || G.phase === 'over') return;
    G.paused = p;
    dom.pause.classList.toggle('hidden', !p);
    document.body.classList.toggle('paused', p);   // freezes CSS animations too
    if (p) { sel = 0; renderMenu(); }
  }

  function menuMove() { sel = sel === 0 ? 1 : 0; renderMenu(); }
  function menuSelect(i) { sel = i; renderMenu(); }
  function menuActivate() { if (sel === 0) setPaused(false); else restartGame(); }

  Pac.flow = { update, resetActors, restartGame, setPaused, menuMove, menuSelect, menuActivate };
})();