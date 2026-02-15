/**
 * TDD: DamageSystem — applyProjectileHits, applyDamageToDestructible, findShipCollision.
 */

import {
  applyProjectileHits,
  applyDamageToDestructible,
  findShipCollision,
} from '../../src/systems/DamageSystem';
import { createEntity } from '../../src/entities/Entity';
import { createMeteor, createBlock } from '../../src/entities/Destructible';
import { createPlayerShip } from '../../src/entities/PlayerShip';
import { EntityKind } from '../../src/core/types';
import type { Bounds } from '../../src/core/types';

const W = 400;
const H = 800;

describe('DamageSystem', () => {
  describe('applyProjectileHits', () => {
    it('returns empty when no projectiles or no overlap', () => {
      const meteor = createMeteor(W, H, 0, 100);
      meteor.bounds = { x: 100, y: 100, width: 30, height: 30 };
      const proj = createEntity(EntityKind.Projectile, { x: 0, y: 0, width: 5, height: 10 });
      proj.bounds = { x: 200, y: 200, width: 5, height: 10 };
      const result = applyProjectileHits([proj], [meteor]);
      expect(result.hitDestructible).toHaveLength(0);
      expect(result.projectilesToRelease).toHaveLength(0);
    });

    it('registers hit and projectile to release when overlapping', () => {
      const meteor = createMeteor(W, H, 0, 100);
      meteor.bounds = { x: 100, y: 100, width: 30, height: 30 };
      const proj = createEntity(EntityKind.Projectile, { x: 0, y: 0, width: 5, height: 10 });
      proj.bounds = { x: 110, y: 105, width: 5, height: 10 };
      const result = applyProjectileHits([proj], [meteor]);
      expect(result.hitDestructible).toHaveLength(1);
      expect(result.hitDestructible[0].entity).toBe(meteor);
      expect(result.hitDestructible[0].damage).toBe(1);
      expect(result.projectilesToRelease).toContain(proj.id);
    });

    it('ignores destructibles with hp <= 0', () => {
      const meteor = createMeteor(W, H, 0, 100);
      meteor.bounds = { x: 100, y: 100, width: 30, height: 30 };
      meteor.hp = 0;
      const proj = createEntity(EntityKind.Projectile, { x: 110, y: 105, width: 5, height: 10 });
      const result = applyProjectileHits([proj], [meteor]);
      expect(result.hitDestructible).toHaveLength(0);
    });
  });

  describe('applyDamageToDestructible', () => {
    it('reduces hp and returns false when hp > 0', () => {
      const block = createBlock(W, H, 0, 100);
      expect(block.hp).toBe(2);
      const dead = applyDamageToDestructible(block, 1);
      expect(block.hp).toBe(1);
      expect(dead).toBe(false);
    });

    it('sets hp to 0 and returns true when damage >= hp', () => {
      const meteor = createMeteor(W, H, 0, 100);
      const dead = applyDamageToDestructible(meteor, 1);
      expect(meteor.hp).toBe(0);
      expect(dead).toBe(true);
    });

    it('sets hitFlashUntil', () => {
      const meteor = createMeteor(W, H, 0, 100);
      const before = Date.now();
      applyDamageToDestructible(meteor, 1);
      expect(meteor.hitFlashUntil).toBeGreaterThanOrEqual(before);
    });
  });

  describe('findShipCollision', () => {
    it('returns null when no overlap', () => {
      const ship = createPlayerShip(W, H);
      ship.bounds = { x: 100, y: 500, width: 20, height: 15 };
      const meteor = createMeteor(W, H, 0, 100);
      meteor.bounds = { x: 200, y: 200, width: 30, height: 30 };
      expect(findShipCollision(ship, [meteor])).toBeNull();
    });

    it('returns obstacle when overlapping', () => {
      const ship = createPlayerShip(W, H);
      ship.bounds = { x: 100, y: 500, width: 20, height: 15 };
      const meteor = createMeteor(W, H, 0, 100);
      meteor.bounds = { x: 105, y: 505, width: 30, height: 30 };
      expect(findShipCollision(ship, [meteor])).toBe(meteor);
    });
  });
});
