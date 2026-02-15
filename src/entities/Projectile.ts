/**
 * Projectile entity — player/drone bullets. Use object pool.
 */

import type { Bounds } from '../core/types';
import { EntityKind } from '../core/types';
import { createEntity, type Entity } from './Entity';
import { PROJECTILE_WIDTH_RATIO, PROJECTILE_HEIGHT_RATIO } from '../core/constants';

const POOL_SIZE = 60;

export interface ProjectilePool {
  acquire: (ownerId: string, from: Bounds, damage: number, gameWidth: number, gameHeight: number) => Entity | null;
  release: (id: string) => void;
  getActive: () => Entity[];
}

function createOne(): Entity {
  return createEntity(EntityKind.Projectile, { x: 0, y: 0, width: 4, height: 12 }, {
    velocity: { x: 0, y: -1 },
    damage: 1,
  });
}

export function createProjectilePool(): ProjectilePool {
  const pool: Entity[] = [];
  const active = new Map<string, Entity>();
  for (let i = 0; i < POOL_SIZE; i++) {
    pool.push(createOne());
  }

  return {
    acquire(
      ownerId: string,
      from: Bounds,
      damage: number,
      gameWidth: number,
      gameHeight: number
    ): Entity | null {
      let e = pool.pop();
      if (!e) return null;
      const w = gameWidth * PROJECTILE_WIDTH_RATIO;
      const h = gameHeight * PROJECTILE_HEIGHT_RATIO;
      e.bounds = {
        x: from.x + from.width / 2 - w / 2,
        y: from.y,
        width: w,
        height: h,
      };
      e.velocity = { x: 0, y: -1 };
      e.ownerId = ownerId;
      e.damage = damage;
      active.set(e.id, e);
      return e;
    },

    release(id: string) {
      const e = active.get(id);
      if (e) {
        active.delete(id);
        pool.push(e);
      }
    },

    getActive(): Entity[] {
      return Array.from(active.values());
    },
  };
}
