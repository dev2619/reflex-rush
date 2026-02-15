/**
 * TDD: SpawnManager — tick genera amenazas según intervalo y dificultad.
 */

import { createSpawnManager } from '../../src/systems/SpawnManager';
import type { GameConfig } from '../../src/core/types';
import { EntityKind } from '../../src/core/types';

const config: GameConfig = {
  width: 400,
  height: 800,
  targetFps: 60,
  spawnIntervalMs: 500,
  baseThreatSpeed: 200,
  speedIncrementPerSecond: 10,
  nearMissThresholdPx: 40,
  nearMissSlowMoScale: 0.4,
};

describe('SpawnManager', () => {
  it('returns empty array for small delta', () => {
    const spawn = createSpawnManager(config);
    const entities = spawn.tick(100, 0, config.width, config.height);
    expect(entities).toHaveLength(0);
  });

  it('spawns threat when delta exceeds spawnIntervalMs', () => {
    const spawn = createSpawnManager(config);
    const entities = spawn.tick(600, 0, config.width, config.height);
    expect(entities.length).toBeGreaterThanOrEqual(1);
    expect(entities[0].kind).toBe(EntityKind.Threat);
    expect(entities[0].velocity).toBeDefined();
    expect(entities[0].lane).toBeGreaterThanOrEqual(0);
    expect(entities[0].lane).toBeLessThan(3);
  });

  it('reset clears internal state', () => {
    const spawn = createSpawnManager(config);
    spawn.tick(600, 0, config.width, config.height);
    spawn.reset();
    const after = spawn.tick(100, 0, config.width, config.height);
    expect(after).toHaveLength(0);
  });

  it('does not hang when spawnIntervalMs is 0 (guarded to min 1)', () => {
    const zeroIntervalConfig = { ...config, spawnIntervalMs: 0 };
    const spawn = createSpawnManager(zeroIntervalConfig);
    const entities = spawn.tick(100, 0, config.width, config.height);
    expect(entities.length).toBeLessThanOrEqual(100);
  });
});
