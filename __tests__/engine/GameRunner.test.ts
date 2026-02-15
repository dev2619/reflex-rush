/**
 * TDD: GameRunner — Space Swipe Shooter. Retry, state (fleet, destructibles), onSwipeDelta.
 */

import { createGameRunner } from '../../src/engine/GameRunner';
import type { GameRunnerState } from '../../src/engine/GameRunner';
import type { GameConfig } from '../../src/core/types';
import { EntityKind } from '../../src/core/types';

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
    expect(state.fleet).toHaveLength(0);
    expect(state.score).toBe(0);
    api.destroy();
  });

  it('startRun sets status to playing and creates fleet with one ship', () => {
    const onStateChange = jest.fn();
    const api = createGameRunner(config, { onStateChange });
    api.startRun();
    const state = api.getState();
    expect(state.status).toBe('playing');
    expect(state.fleet).toHaveLength(1);
    expect(state.fleet[0]?.kind).toBe(EntityKind.PlayerShip);
    expect(state.destructibles).toHaveLength(0);
    expect(onStateChange).toHaveBeenCalled();
    api.destroy();
  });

  it('retry calls startRun and leaves status playing', () => {
    const onStateChange = jest.fn();
    const onRetry = jest.fn();
    const api = createGameRunner(config, { onStateChange, onRetry });
    api.startRun();
    expect(api.getState().status).toBe('playing');
    api.retry();
    expect(onRetry).toHaveBeenCalled();
    const state = api.getState();
    expect(state.status).toBe('playing');
    expect(state.fleet).toHaveLength(1);
    api.destroy();
  });

  it('onSwipeDelta updates target position when playing', () => {
    const api = createGameRunner(config, { onStateChange: () => {} });
    api.startRun();
    const before = api.getState().targetX;
    api.onSwipeDelta(-60, 0);
    const after = api.getState().targetX;
    expect(after).toBeLessThan(before);
    api.destroy();
  });

  it('destroy stops loop and unsubscribes', () => {
    const api = createGameRunner(config, { onStateChange: () => {} });
    api.startRun();
    api.destroy();
    const state = api.getState();
    expect(state.status).toBe('playing');
  });

  it('goToMenu from gameover sets status to idle', () => {
    const onStateChange = jest.fn();
    const api = createGameRunner(config, { onStateChange });
    api.startRun();
    expect(api.getState().status).toBe('playing');
    api.goToMenu();
    const stateIdle = api.getState();
    expect(stateIdle.status).toBe('idle');
    expect(stateIdle.fleet).toHaveLength(0);
    expect(stateIdle.destructibles).toEqual([]);
    api.destroy();
  });

  it('onSwipeDelta when idle does nothing (no crash)', () => {
    const api = createGameRunner(config, { onStateChange: () => {} });
    expect(api.getState().status).toBe('idle');
    api.onSwipeDelta(50, 50);
    expect(api.getState().status).toBe('idle');
    expect(api.getState().fleet).toHaveLength(0);
    api.destroy();
  });

  it('getState returns object with all expected keys', () => {
    const api = createGameRunner(config, { onStateChange: () => {} });
    const state = api.getState();
    expect(state).toHaveProperty('status');
    expect(state).toHaveProperty('fleet');
    expect(state).toHaveProperty('projectiles');
    expect(state).toHaveProperty('destructibles');
    expect(state).toHaveProperty('powerups');
    expect(state).toHaveProperty('coins');
    expect(state).toHaveProperty('score');
    expect(state).toHaveProperty('coinsThisRun');
    expect(state).toHaveProperty('deathReason');
    expect(state).toHaveProperty('targetX');
    expect(state).toHaveProperty('targetY');
    expect(state).toHaveProperty('weaponPattern');
    expect(state).toHaveProperty('floatTexts');
    expect(Array.isArray(state.fleet)).toBe(true);
    expect(Array.isArray(state.destructibles)).toBe(true);
    api.destroy();
  });

  it('startRun with zero dimensions uses guarded min size (no NaN, no crash)', () => {
    const zeroConfig = { ...config, width: 0, height: 0 };
    const api = createGameRunner(zeroConfig, { onStateChange: () => {} });
    api.startRun();
    const state = api.getState();
    expect(state.status).toBe('playing');
    expect(state.fleet.length).toBeGreaterThanOrEqual(1);
    const ship = state.fleet[0];
    expect(ship).toBeDefined();
    expect(Number.isFinite(ship!.bounds.x)).toBe(true);
    expect(Number.isFinite(ship!.bounds.width)).toBe(true);
    expect(ship!.bounds.width).toBeGreaterThan(0);
    expect(ship!.bounds.height).toBeGreaterThan(0);
    api.destroy();
  });

  it('startRun initializes projectiles, coins, powerups, floatTexts as empty', () => {
    const api = createGameRunner(config, { onStateChange: () => {} });
    api.startRun();
    const state = api.getState();
    expect(state.projectiles).toEqual([]);
    expect(state.coins).toEqual([]);
    expect(state.powerups).toEqual([]);
    expect(state.floatTexts).toEqual([]);
    expect(state.weaponPattern).toBe('single');
    expect(state.magnetMult).toBe(1);
    api.destroy();
  });

  it('onSwipeDelta clamps target to screen bounds', () => {
    const api = createGameRunner(config, { onStateChange: () => {} });
    api.startRun();
    const ship = api.getState().fleet[0];
    const maxX = config.width - ship!.bounds.width;
    api.onSwipeDelta(99999, 0);
    expect(api.getState().targetX).toBeLessThanOrEqual(maxX);
    expect(api.getState().targetX).toBeGreaterThanOrEqual(0);
    api.onSwipeDelta(-99999, 0);
    expect(api.getState().targetX).toBeGreaterThanOrEqual(0);
    api.destroy();
  });

  it('onDeath callback is invoked when game over', () => {
    const onDeath = jest.fn();
    const api = createGameRunner(config, { onStateChange: () => {}, onDeath });
    api.startRun();
    expect(onDeath).not.toHaveBeenCalled();
    api.goToMenu();
    expect(onDeath).not.toHaveBeenCalled();
    api.startRun();
    api.goToMenu();
    expect(onDeath).not.toHaveBeenCalled();
    api.destroy();
  });
});
