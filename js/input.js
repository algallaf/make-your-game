/* ==========================================================================
 * input.js - keyboard only.
 *
 * Movement keys are tracked as a "held" list: pressing adds, releasing
 * removes. The game reads the most recently pressed key that is still held,
 * so holding a key keeps Pac-Man moving, releasing stops him, and no key
 * repeat / spamming is needed.
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;
  const { dom, G, cfg } = Pac;

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  };
  const held = [];
  const heldDir = () => (held.length ? cfg.DIRS[held[held.length - 1]] : null);

  window.addEventListener('keydown', (e) => {
    const dn = KEYMAP[e.code];
    if (dn) {
      e.preventDefault();                                    // no page scrolling
      if (G.paused) {                                        // arrows navigate the pause menu
        if (!e.repeat && (dn === 'up' || dn === 'down')) Pac.flow.menuMove();
        return;
      }
      if (!held.includes(dn)) held.push(dn);
      return;
    }

    switch (e.code) {
      case 'Escape':
      case 'KeyP':
        e.preventDefault();
        if (!e.repeat) Pac.flow.setPaused(!G.paused);
        break;
      case 'Enter':
      case 'Space':
        e.preventDefault();
        if (e.repeat) break;
        if (G.paused) Pac.flow.menuActivate();
        else if (G.phase === 'start' || G.phase === 'over') Pac.flow.restartGame();
        break;
      case 'KeyF':                                           // performance panel
        if (!e.repeat) dom.debug.classList.toggle('hidden');
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    const dn = KEYMAP[e.code];
    if (!dn) return;
    const i = held.indexOf(dn);
    if (i !== -1) held.splice(i, 1);
  });

  // Pause menu buttons also work with the mouse.
  dom.btnContinue.addEventListener('click', () => Pac.flow.setPaused(false));
  dom.btnRestart.addEventListener('click', () => Pac.flow.restartGame());
  dom.btnContinue.addEventListener('mouseenter', () => Pac.flow.menuSelect(0));
  dom.btnRestart.addEventListener('mouseenter', () => Pac.flow.menuSelect(1));

  Pac.input = { held, heldDir };
})();