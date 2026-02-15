/**
 * Weapon system — auto fire from all ships, fire rate, patterns. Uses projectile pool.
 */

import type { Entity } from '../entities/Entity';
import type { ProjectilePool } from '../entities/Projectile';
import type { GameConfig } from '../core/types';
import { EntityKind } from '../core/types';

const FIRE_RATE_MS = 180;
const PROJECTILE_SPEED_PX_PER_SEC = 900;

export interface WeaponSystemState {
  lastFireAt: number;
}

export function createWeaponSystem() {
  const state: WeaponSystemState = { lastFireAt: 0 };

  return {
    reset() {
      state.lastFireAt = 0;
    },

    tick(
      now: number,
      fleet: Entity[],
      pool: ProjectilePool,
      config: GameConfig
    ): Entity[] {
      const fireRate = config.fireRateMs ?? FIRE_RATE_MS;
      if (now - state.lastFireAt < fireRate) return [];
      state.lastFireAt = now;

      const ships = fleet.filter(
        (e) => e.kind === EntityKind.PlayerShip || e.kind === EntityKind.DroneShip
      );
      const gameWidth = config.width;
      const gameHeight = config.height;
      const speedPxPerSec = config.projectileSpeedPxPerSec ?? PROJECTILE_SPEED_PX_PER_SEC;
      const spawned: Entity[] = [];

      for (const ship of ships) {
        const pattern = ship.weaponPattern ?? 'single';
        const from = ship.bounds;
        const damage = 1;

        if (pattern === 'single') {
          const p = pool.acquire(ship.id, from, damage, gameWidth, gameHeight);
          if (p) {
            p.velocity = { x: 0, y: -speedPxPerSec };
            spawned.push(p);
          }
        } else if (pattern === 'double') {
          const offsetX = from.width * 0.25;
          for (const sign of [-1, 1]) {
            const b = { ...from, x: from.x + from.width / 2 + sign * offsetX - from.width / 4, width: from.width / 2 };
            const p = pool.acquire(ship.id, b, damage, gameWidth, gameHeight);
            if (p) {
              p.velocity = { x: 0, y: -speedPxPerSec };
              spawned.push(p);
            }
          }
        } else if (pattern === 'spread') {
          const spreadPxPerSec = speedPxPerSec * 0.3;
          const angles = [-spreadPxPerSec, 0, spreadPxPerSec];
          for (const vx of angles) {
            const p = pool.acquire(ship.id, from, damage, gameWidth, gameHeight);
            if (p) {
              p.velocity = { x: vx, y: -speedPxPerSec };
              spawned.push(p);
            }
          }
        }
      }

      return spawned;
    },
  };
}

export function moveProjectiles(
  projectiles: Entity[],
  deltaSec: number,
  gameHeight: number
): { projectiles: Entity[]; toRelease: string[] } {
  const toRelease: string[] = [];
  for (const p of projectiles) {
    if (!p.velocity) continue;
    p.bounds.x += p.velocity.x * deltaSec;
    p.bounds.y += p.velocity.y * deltaSec;
    if (p.bounds.y + p.bounds.height < -20 || p.bounds.y > gameHeight + 20) {
      toRelease.push(p.id);
    }
  }
  return {
    projectiles,
    toRelease,
  };
}
