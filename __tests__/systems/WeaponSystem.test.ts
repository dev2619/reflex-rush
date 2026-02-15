/**
 * TDD: WeaponSystem — fire rate, spawns projectiles from fleet, moveProjectiles.
 */

import { createWeaponSystem, moveProjectiles } from '../../src/systems/WeaponSystem';
import { createPlayerShip } from '../../src/entities/PlayerShip';
import { createProjectilePool } from '../../src/entities/Projectile';
import type { GameConfig } from '../../src/core/types';
import { EntityKind } from '../../src/core/types';

const config: GameConfig = {
  width: 400,
  height: 800,
  targetFps: 60,
  spawnIntervalMs: 800,
  baseThreatSpeed: 200,
  speedIncrementPerSecond: 10,
  nearMissThresholdPx: 40,
  nearMissSlowMoScale: 0.4,
  fireRateMs: 200,
  projectileSpeedPxPerSec: 900,
};

describe('WeaponSystem', () => {
  it('tick returns empty when within fire rate', () => {
    const weapon = createWeaponSystem();
    const fleet = [createPlayerShip(config.width, config.height)];
    const pool = createProjectilePool();
    const t0 = 1000;
    const first = weapon.tick(t0, fleet, pool, config);
    expect(first.length).toBeGreaterThanOrEqual(1);
    const second = weapon.tick(t0 + 50, fleet, pool, config);
    expect(second).toHaveLength(0);
  });

  it('tick spawns projectiles after fire rate elapsed', () => {
    const weapon = createWeaponSystem();
    const fleet = [createPlayerShip(config.width, config.height)];
    const pool = createProjectilePool();
    const t0 = 1000;
    weapon.tick(t0, fleet, pool, config);
    const after = weapon.tick(t0 + 250, fleet, pool, config);
    expect(after.length).toBeGreaterThanOrEqual(1);
    expect(after[0].kind).toBe(EntityKind.Projectile);
    expect(after[0].velocity?.y).toBeLessThan(0);
  });

  it('reset allows immediate fire again', () => {
    const weapon = createWeaponSystem();
    const fleet = [createPlayerShip(config.width, config.height)];
    const pool = createProjectilePool();
    weapon.tick(1000, fleet, pool, config);
    weapon.reset();
    const spawned = weapon.tick(1000, fleet, pool, config);
    expect(spawned.length).toBeGreaterThanOrEqual(1);
  });

  it('moveProjectiles advances position and returns toRelease for off-screen', () => {
    const fleet = [createPlayerShip(config.width, config.height)];
    const pool = createProjectilePool();
    const p = pool.acquire(
      fleet[0].id,
      fleet[0].bounds,
      1,
      config.width,
      config.height
    );
    p!.velocity = { x: 0, y: -900 };
    const initialY = p!.bounds.y;
    const { toRelease } = moveProjectiles([p!], 0.5, config.height);
    expect(p!.bounds.y).toBeLessThan(initialY);
    expect(p!.bounds.y).toBe(initialY - 450);
    const { toRelease: offScreen } = moveProjectiles(
      [p!],
      2,
      config.height
    );
    expect(offScreen).toContain(p!.id);
  });
});
