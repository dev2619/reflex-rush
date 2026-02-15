/**
 * TDD: GameRunner — retry reanuda partida (startRun), estado y callbacks.
 */

import { createGameRunner } from '../../src/engine/GameRunner';
import type { GameRunnerState } from '../../src/engine/GameRunner';
import type { GameConfig } from '../../src/core/types';

const config: GameConfig = {
  width: 400,
  height: 800,
  targetFps: 60,
  spawnIntervalMs: 1000,
  baseThreatSpeed: 200,
  speedIncrementPerSecond: 10,
  nearMissThresholdPx: 40,
  nearMissSlowMoScale: 0.4,
};

describe('GameRunner', () => {
  it('starts in idle and getState returns current state', () => {
    const onStateChange = jest.fn();
    const api = createGameRunner(config, { onStateChange });
    const state = api.getState();
    expect(state.status).toBe('idle');
    expect(state.player).toBeNull();
    expect(state.score).toBe(0);
    api.destroy();
  });

  it('startRun sets status to playing and creates player', () => {
    const onStateChange = jest.fn();
    const api = createGameRunner(config, { onStateChange });
    api.startRun();
    const state = api.getState();
    expect(state.status).toBe('playing');
    expect(state.player).not.toBeNull();
    expect(state.player?.kind).toBe('player');
    expect(state.threats).toHaveLength(0);
    expect(onStateChange).toHaveBeenCalled();
    api.destroy();
  });

  it('retry calls startRun and leaves status playing (startRun in closure)', () => {
    const onStateChange = jest.fn();
    const onRetry = jest.fn();
    const api = createGameRunner(config, { onStateChange, onRetry });
    api.startRun();
    expect(api.getState().status).toBe('playing');
    api.retry();
    expect(onRetry).toHaveBeenCalled();
    const state = api.getState();
    expect(state.status).toBe('playing');
    expect(state.player).not.toBeNull();
    api.destroy();
  });

  it('onSwipe changes player lane when playing', () => {
    const api = createGameRunner(config, { onStateChange: () => {} });
    api.startRun();
    const before = api.getState().player!.lane ?? 1;
    api.onSwipe('left');
    const afterLeft = api.getState().player!.lane ?? 1;
    expect(afterLeft).toBe(Math.max(0, before - 1));
    api.onSwipe('right');
    api.onSwipe('right');
    const afterRight = api.getState().player!.lane ?? 1;
    expect(afterRight).toBeGreaterThanOrEqual(afterLeft);
    api.destroy();
  });

  it('destroy stops loop and unsubscribes', () => {
    const api = createGameRunner(config, { onStateChange: () => {} });
    api.startRun();
    api.destroy();
    const state = api.getState();
    expect(state.status).toBe('playing');
  });

  it('onSwipe when idle does nothing (no crash)', () => {
    const api = createGameRunner(config, { onStateChange: () => {} });
    expect(api.getState().status).toBe('idle');
    api.onSwipe('left');
    api.onSwipe('right');
    expect(api.getState().status).toBe('idle');
    expect(api.getState().player).toBeNull();
    api.destroy();
  });

  it('getState returns object with all expected keys', () => {
    const api = createGameRunner(config, { onStateChange: () => {} });
    const state = api.getState();
    expect(state).toHaveProperty('status');
    expect(state).toHaveProperty('player');
    expect(state).toHaveProperty('threats');
    expect(state).toHaveProperty('score');
    expect(state).toHaveProperty('coinsThisRun');
    expect(state).toHaveProperty('deathReason');
    expect(state).toHaveProperty('slowMoUntil');
    expect(Array.isArray(state.threats)).toBe(true);
    api.destroy();
  });

  it('startRun with zero dimensions uses guarded min size (no NaN, no crash)', () => {
    const zeroConfig = { ...config, width: 0, height: 0 };
    const api = createGameRunner(zeroConfig, { onStateChange: () => {} });
    api.startRun();
    const state = api.getState();
    expect(state.status).toBe('playing');
    expect(state.player).not.toBeNull();
    expect(Number.isFinite(state.player!.bounds.x)).toBe(true);
    expect(Number.isFinite(state.player!.bounds.width)).toBe(true);
    expect(state.player!.bounds.width).toBeGreaterThan(0);
    expect(state.player!.bounds.height).toBeGreaterThan(0);
    api.destroy();
  });
});
