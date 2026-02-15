/**
 * Game loop — fixed deltaTime tick, drives all systems.
 */

export type TickCallback = (deltaMs: number) => void;

export interface GameLoopAPI {
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
  subscribe: (cb: TickCallback) => () => void;
}

const TARGET_FPS = 60;
const DELTA_MS = 1000 / TARGET_FPS;

export function createGameLoop(): GameLoopAPI {
  let rafId: number | null = null;
  const subscribers = new Set<TickCallback>();
  let lastTime = 0;
  let running = false;

  function tick(now: number) {
    if (!running) return;
    const delta = Math.min(now - lastTime, DELTA_MS * 3); // clamp for tab background
    lastTime = now;
    subscribers.forEach((cb) => cb(delta));
    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    isRunning: () => running,
    subscribe(cb: TickCallback) {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
  };
}
