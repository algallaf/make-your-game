/* ==========================================================================
 * hud.js - score board (score, timer, lives, level) and on-board messages.
 * Text is written only when a value changes, to keep DOM work minimal.
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;
  const { dom, G, cfg } = Pac;

  function fmtTime(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function setLives() {
    dom.lives.textContent = '●'.repeat(Math.max(0, G.lives));
    dom.lives.classList.toggle('low', G.lives <= 1);
  }

  function setScore(v) {
    G.score = v;
    dom.score.textContent = G.score;
    if (!G.extraLifeGiven && G.score >= cfg.EXTRA_LIFE_AT) {
      G.extraLifeGiven = true;
      G.lives++;
      setLives();
    }
  }

  // Called every simulated frame, but only touches the DOM once per second.
  function setTimer() {
    const s = Math.floor(G.time);
    if (s !== G.lastSec) { G.lastSec = s; dom.timer.textContent = fmtTime(s); }
  }

  function setLevel() { dom.level.textContent = G.level; }

  function showMsg(text) { dom.msg.textContent = text; dom.msg.classList.remove('hidden'); }
  function hideMsg() { dom.msg.classList.add('hidden'); }

  // Floating "200" text when a ghost is eaten. Animated by CSS (opacity/transform).
  function popup(text, x, y) {
    const p = document.createElement('div');
    p.className = 'pop';
    p.textContent = text;
    p.style.left = (x * G.T) + 'px';
    p.style.top = (y * G.T) + 'px';
    dom.board.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
    setTimeout(() => p.remove(), 1200);      // safety net
  }

  Pac.hud = { fmtTime, setLives, setScore, setTimer, setLevel, showMsg, hideMsg, popup };
})();