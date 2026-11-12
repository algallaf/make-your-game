/* ==========================================================================
 * state.js - the one shared object that describes the current game.
 * Other files read and write Pac.G; nothing else is global.
 *
 * phase:  start -> ready -> playing -> dying -> ready ...   (lose a life)
 *                              |-> clear -> ready ...       (next level)
 *                              '-> over                     (no lives left)
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;

  Pac.G = {
    // game flow
    phase: 'start',
    paused: false,
    readyT: 0, dyingT: 0, clearT: 0,      // countdowns for the short phases

    // score board
    score: 0,
    lives: Pac.cfg.START_LIVES,
    level: 1,
    time: 0,                              // seconds of actual play (excludes pauses)
    extraLifeGiven: false,
    lastSec: -1,                          // last whole second written to the HUD

    // ghost behaviour
    mode: Pac.cfg.MODES[0][0],
    modeIdx: 0,
    modeT: Pac.cfg.MODES[0][1],
    frightT: 0,                           // seconds of frightened time left
    combo: 0,                             // ghosts eaten with the current pellet

    // board
    T: 28,                                // tile size in px (changes with window size)
    built: false,
    dots: [],                             // dots[r][c]: 0 none, 1 dot, 2 power pellet
    dotEls: [],                           // matching DOM elements
    dotsLeft: 0,
  };
})();