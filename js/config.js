/* ==========================================================================
 * config.js - the maze layout and every tunable number in one place.
 * Everything else in the game reads from Pac.cfg.
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = (window.Pac = window.Pac || {});

  // Legend:  # wall   . dot   o power pellet   - ghost door   P pac start   G ghost house
  const MAP = [
    '###################',
    '#........#........#',
    '#o##.###.#.###.##o#',
    '#.................#',
    '#.##.#.#####.#.##.#',
    '#....#...#...#....#',
    '####.###.#.###.####',
    '####.#.......#.####',
    '####.#.##-##.#.####',
    '.....  #GGG#  .....',   // row 9 = tunnel row (open on both sides)
    '####.#.#####.#.####',
    '####.#.......#.####',
    '####.###.#.###.####',
    '#........#........#',
    '#.##.###.#.###.##.#',
    '#o.#.....P.....#.o#',
    '##.#.#.#####.#.#.##',
    '#....#...#...#....#',
    '#.######.#.######.#',
    '#.................#',
    '###################',
  ];

  const ROWS = MAP.length;
  const COLS = MAP[0].length;

  // Directions. `ang` is the rotation applied to Pac-Man's sprite.
  const DIRS = {
    up:    { x: 0,  y: -1, k: 'u', ang: -90 },
    left:  { x: -1, y: 0,  k: 'l', ang: 180 },
    down:  { x: 0,  y: 1,  k: 'd', ang: 90 },
    right: { x: 1,  y: 0,  k: 'r', ang: 0 },
  };
  // Tie-break order when a ghost sees two equally good options (like the arcade).
  const DIR_LIST = [DIRS.up, DIRS.left, DIRS.down, DIRS.right];

  Pac.cfg = {
    MAP, ROWS, COLS, DIRS, DIR_LIST,

    TUNNEL_ROW: 9,
    EXIT: { c: 9, r: 7 },     // tile just above the ghost-house door
    HOME: { c: 9, r: 9 },     // centre of the ghost house

    // Simulation
    STEP: 1 / 120,            // longest simulation sub-step (seconds)
    MAX_DT: 0.1,              // never simulate more than this per frame (tab was throttled)

    // Speeds, in tiles per second
    PAC_SPEED: 8.0,
    GHOST_SPEED: 7.2,
    FRIGHT_SPEED: 4.2,
    EATEN_SPEED: 15,

    START_LIVES: 3,
    EXTRA_LIFE_AT: 10000,

    // Ghost behaviour schedule: [mode, seconds]
    MODES: [['scatter', 7], ['chase', 20], ['scatter', 7], ['chase', 20], ['scatter', 5], ['chase', Infinity]],

    // Performance meter
    DROP_MS: 25,              // a frame longer than this counts as dropped (> 1.5 vsyncs at 60 Hz)
  };

  // Map helpers. Columns -1 and COLS exist only on the tunnel row.
  Pac.cellAt = (c, r) => {
    if (c < 0 || c >= COLS) return (r === Pac.cfg.TUNNEL_ROW && (c === -1 || c === COLS)) ? ' ' : '#';
    if (r < 0 || r >= ROWS) return '#';
    return MAP[r][c];
  };
  Pac.isWall = (c, r) => Pac.cellAt(c, r) === '#';
})();