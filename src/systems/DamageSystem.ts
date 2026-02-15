/**
 * Damage system — projectile vs destructible, ship vs obstacle (lose ship or shield).
 */

import type { Entity } from '../entities/Entity';
import { EntityKind } from '../core/types';
import { intersectAABB } from '../engine/CollisionSystem';
import { isDestructible } from '../entities/Destructible';

export interface HitResult {
  hitDestructible: { entity: Entity; damage: number }[];
  hitShips: Entity[];
  projectilesToRelease: string[];
}

export function applyProjectileHits(
  projectiles: Entity[],
  destructibles: Entity[]
): HitResult {
  const hitDestructible: { entity: Entity; damage: number }[] = [];
  const projectilesToRelease: string[] = [];

  for (const p of projectiles) {
    if (p.kind !== EntityKind.Projectile) continue;
    for (const d of destructibles) {
      if (!isDestructible(d) || (d.hp ?? 0) <= 0) continue;
      if (intersectAABB(p.bounds, d.bounds)) {
        hitDestructible.push({ entity: d, damage: p.damage ?? 1 });
        projectilesToRelease.push(p.id);
        break;
      }
    }
  }

  return {
    hitDestructible,
    hitShips: [],
    projectilesToRelease,
  };
}

export function applyDamageToDestructible(e: Entity, damage: number): boolean {
  const hp = (e.hp ?? 0) - damage;
  e.hp = Math.max(0, hp);
  e.hitFlashUntil = Date.now() + 80;
  return e.hp <= 0;
}

export function findShipCollision(
  ship: Entity,
  obstacles: Entity[]
): Entity | null {
  for (const o of obstacles) {
    if (o.kind === EntityKind.Meteor || o.kind === EntityKind.Block || o.kind === EntityKind.EnemyShip) {
      if (intersectAABB(ship.bounds, o.bounds)) return o;
    }
  }
  return null;
}
