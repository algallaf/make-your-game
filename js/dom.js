/* ==========================================================================
 * dom.js - looks up every element once, so the game never queries the DOM
 * while running.
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;
  const $ = (id) => document.getElementById(id);

  Pac.dom = {
    hud: $('hud'), help: $('help'),
    score: $('score'), timer: $('timer'), lives: $('lives'), level: $('level'), fps: $('fps'),
    board: $('board'), walls: $('walls'), dots: $('dots'), pellets: $('pellets'),
    actors: $('actors'), msg: $('msg'),
    start: $('start'), pause: $('pause'), over: $('over'), overInfo: $('overInfo'),
    btnContinue: $('btnContinue'), btnRestart: $('btnRestart'),
    debug: $('debug'),
  };
})();