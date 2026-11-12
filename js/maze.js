
/* ==========================================================================
 * maze.js - builds the static part of the board: walls, door, dots, pellets.
 * These elements are created once and never moved, so they cost nothing
 * per frame. Also sizes the board to the window (fit) and precomputes the
 * "distance to the ghost house" table used by eaten ghosts.
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;
  const { cfg, dom, G } = Pac;
  const { MAP, ROWS, COLS, DIR_LIST, HOME } = cfg;

  // ---- distance (in tiles) from every cell to the ghost house, by BFS ----
  const homeDist = Array.from({ length: ROWS }, () => new Array(COLS).fill(-1));
  (function buildHomeDist() {
    const q = [[HOME.c, HOME.r]];
    homeDist[HOME.r][HOME.c] = 0;
    for (let i = 0; i < q.length; i++) {
      const [c, r] = q[i];
      for (const d of DIR_LIST) {
        const nc = c + d.x, nr = r + d.y;
        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
        if (MAP[nr][nc] === '#' || homeDist[nr][nc] !== -1) continue;
        homeDist[nr][nc] = homeDist[r][c] + 1;
        q.push([nc, nr]);
      }
    }
  })();

  // ---- walls: each wall tile only draws the borders that face open space ----
  function buildWalls() {
    const T = G.T;
    dom.walls.textContent = '';
    const frag = document.createDocumentFragment();
    const bw = Math.max(2, Math.round(T / 12));     // border width
    const rad = Math.round(T * 0.34);               // rounded outer corners

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const ch = MAP[r][c];
        if (ch === '#') {
          const up = r > 0 && !Pac.isWall(c, r - 1);
          const dn = r < ROWS - 1 && !Pac.isWall(c, r + 1);
          const lf = c > 0 && !Pac.isWall(c - 1, r);
          const rt = c < COLS - 1 && !Pac.isWall(c + 1, r);
          const d = document.createElement('div');
          d.className = 'wall';
          const s = d.style;
          s.left = c * T + 'px'; s.top = r * T + 'px'; s.width = T + 'px'; s.height = T + 'px';
          s.borderWidth = `${up ? bw : 0}px ${rt ? bw : 0}px ${dn ? bw : 0}px ${lf ? bw : 0}px`;
          s.borderRadius = `${up && lf ? rad : 0}px ${up && rt ? rad : 0}px ${dn && rt ? rad : 0}px ${dn && lf ? rad : 0}px`;
          frag.appendChild(d);
        } else if (ch === '-') {
          const d = document.createElement('div');
          d.className = 'door';
          const s = d.style;
          s.left = c * T + 'px'; s.top = (r * T + T * 0.4) + 'px';
          s.width = T + 'px'; s.height = Math.max(2, T * 0.18) + 'px';
          frag.appendChild(d);
        }
      }
    }
    dom.walls.appendChild(frag);
  }

  // ---- dots and pellets. reset=true starts a fresh level; false keeps eaten state ----
  function buildDots(reset) {
    const T = G.T;
    if (reset) {
      G.dots = []; G.dotsLeft = 0;
      for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
          const ch = MAP[r][c];
          const v = ch === '.' ? 1 : ch === 'o' ? 2 : 0;
          if (v) G.dotsLeft++;
          row.push(v);
        }
        G.dots.push(row);
      }
    }
    dom.dots.textContent = ''; dom.pellets.textContent = '';
    const fDots = document.createDocumentFragment(), fPellets = document.createDocumentFragment();
    G.dotEls = [];
    for (let r = 0; r < ROWS; r++) {
      G.dotEls[r] = new Array(COLS).fill(null);
      for (let c = 0; c < COLS; c++) {
        const v = G.dots[r][c];
        if (!v) continue;
        const d = document.createElement('i');
        const size = v === 1 ? Math.max(3, T * 0.16) : T * 0.5;
        d.className = v === 1 ? 'dot' : 'pellet';
        d.style.width = d.style.height = size + 'px';
        d.style.left = (c * T + (T - size) / 2) + 'px';
        d.style.top = (r * T + (T - size) / 2) + 'px';
        (v === 1 ? fDots : fPellets).appendChild(d);
        G.dotEls[r][c] = d;
      }
    }
    dom.dots.appendChild(fDots); dom.pellets.appendChild(fPellets);
  }

  // ---- pick a tile size that fits the window, rebuild if it changed ----
  function fit() {
    const hudH = dom.hud.offsetHeight + dom.help.offsetHeight + 46;
    const nt = Math.max(12, Math.min(36, Math.floor(Math.min((window.innerWidth - 24) / COLS, (window.innerHeight - hudH) / ROWS))));
    if (G.built && nt === G.T) return;
    G.T = nt;
    document.documentElement.style.setProperty('--t', G.T + 'px');
    buildWalls();
    buildDots(!G.built);
    Pac.pac.last = '';                                  // force sprites to re-position
    for (const g of Pac.ghosts.list) g.last = '';
    G.built = true;
  }

  let fitQueued = false;
  window.addEventListener('resize', () => {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(() => { fitQueued = false; fit(); });
  });

  Pac.maze = { homeDist, buildWalls, buildDots, fit };
})();