/* ==========================================================================
 * perf.js - built-in performance meter.
 *
 * Measures every frame, and every 500 ms publishes:
 *   fps            frames per second
 *   avgFrameMs     average time between frames (16.7 ms = 60 FPS)
 *   worstFrameMs   longest gap in the window (spikes = jank)
 *   avgWorkMs      time our JS (update + render) took per frame
 *   droppedFrames  total frames longer than cfg.DROP_MS
 * Shown in the HUD (FPS) and, with the F key, in a debug panel.
 * Also available as window.__perf for automated tests.
 * ======================================================================== */
(() => {
  'use strict';
  const Pac = window.Pac;
  const { cfg, dom, G } = Pac;

  const perf = {
    fps: 0, avgFrameMs: 0, worstFrameMs: 0, avgWorkMs: 0, worstWorkMs: 0,
    totalFrames: 0, droppedFrames: 0,
  };

  let frames = 0, sum = 0, max = 0, work = 0, workMax = 0, windowStart = 0;

  // First frame (or first frame after a hidden tab): start a fresh window.
  perf.start = (t) => { windowStart = t; frames = 0; sum = 0; max = 0; work = 0; workMax = 0; };

  // Record the gap since the previous frame.
  perf.frame = (dtMs) => {
    frames++; sum += dtMs;
    if (dtMs > max) max = dtMs;
    if (dtMs > cfg.DROP_MS) perf.droppedFrames++;
    perf.totalFrames++;
  };

  // Record how long our own code took this frame; publish every 500 ms.
  perf.end = (t, workMs) => {
    work += workMs;
    if (workMs > workMax) workMax = workMs;
    if (t - windowStart < 500 || frames === 0) return;

    perf.fps = frames * 1000 / sum;
    perf.avgFrameMs = sum / frames;
    perf.worstFrameMs = max;
    perf.avgWorkMs = work / frames;
    perf.worstWorkMs = workMax;
    dom.fps.textContent = Math.round(perf.fps);

    if (!dom.debug.classList.contains('hidden')) {
      dom.debug.textContent =
        'FPS             ' + perf.fps.toFixed(1) + '\n' +
        'frame avg/max   ' + perf.avgFrameMs.toFixed(2) + ' / ' + perf.worstFrameMs.toFixed(1) + ' ms\n' +
        'JS work avg/max ' + perf.avgWorkMs.toFixed(3) + ' / ' + perf.worstWorkMs.toFixed(2) + ' ms\n' +
        'dropped (>' + cfg.DROP_MS + 'ms) ' + perf.droppedFrames + ' of ' + perf.totalFrames + '\n' +
        'phase           ' + G.phase + (G.paused ? ' (paused)' : '');
    }
    perf.start(t);
  };

  Pac.perf = perf;
  window.__perf = perf;
})();