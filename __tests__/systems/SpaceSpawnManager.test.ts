/**
 * TDD: SpaceSpawnManager — tick spawns meteors/blocks/enemies, reset, speed scaling.
 */

import { createSpaceSpawnManager } from '../../src/systems/SpaceSpawnManager';
import type { GameConfig } from '../../src/core/types';
import { EntityKind } from '../../src/core/types';

const config: GameConfig = {
  width: 400,
  height: 800,
  targetFps: 60,
  spawnIntervalMs: 500,
  baseThreatSpeed: 200,
  speedIncrementPerSecond: 15,
  nearMissThresholdPx: 40,
  nearMissSlowMoScale: 0.4,
};

describe('SpaceSpawnManager', () => {
  it('returns empty for delta smaller than interval', () => {
    const spawn = createSpaceSpawnManager(config);
    const entities = spawn.tick(100, 0, config.width, config.height);
    expect(entities).toHaveLength(0);
  });

  it('spawns at least one entity when delta exceeds interval', () => {
    const spawn = createSpaceSpawnManager(config);
    const entities = spawn.tick(600, 0, config.width, config.height);
    expect(entities.length).toBeGreaterThanOrEqual(1);
    const kinds = [EntityKind.Meteor, EntityKind.Block, EntityKind.EnemyShip];
    expect(kinds).toContain(entities[0].kind);
    expect(entities[0].velocity).toBeDefined();
    expect(entities[0].bounds.y).toBeLessThanOrEqual(0);
  });

  it('reset allows first tick after reset to spawn', () => {
    const spawn = createSpaceSpawnManager(config);
    spawn.tick(600, 0, config.width, config.height);
    spawn.reset();
    const after = spawn.tick(600, 0, config.width, config.height);
    expect(after.length).toBeGreaterThanOrEqual(1);
  });

  it('spawned entities have hp and destructible variant', () => {
    const spawn = createSpaceSpawnManager(config);
    const entities = spawn.tick(1000, 5000, config.width, config.height);
    expect(entities.length).toBeGreaterThanOrEqual(1);
    const e = entities[0];
    expect(e.hp).toBeGreaterThanOrEqual(1);
    expect(e.maxHp).toBeDefined();
    expect(['meteor', 'block', 'enemy']).toContain(e.destructibleVariant);
  });
});
