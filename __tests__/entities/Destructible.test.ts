/**
 * TDD: Destructible — createMeteor, createBlock, createEnemyShip, isDestructible.
 */

import {
  createMeteor,
  createBlock,
  createEnemyShip,
  isDestructible,
} from '../../src/entities/Destructible';
import { EntityKind } from '../../src/core/types';
import { createPlayerShip } from '../../src/entities/PlayerShip';

const W = 400;
const H = 800;

describe('Destructible', () => {
  it('createMeteor returns entity with 1 HP and velocity', () => {
    const e = createMeteor(W, H, 100, 200);
    expect(e.kind).toBe(EntityKind.Meteor);
    expect(e.hp).toBe(1);
    expect(e.maxHp).toBe(1);
    expect(e.destructibleVariant).toBe('meteor');
    expect(e.velocity).toEqual({ x: 0, y: 200 });
    expect(e.bounds.y).toBeLessThanOrEqual(0);
  });

  it('createBlock returns entity with 2 HP', () => {
    const e = createBlock(W, H, 150, 180);
    expect(e.kind).toBe(EntityKind.Block);
    expect(e.hp).toBe(2);
    expect(e.maxHp).toBe(2);
    expect(e.destructibleVariant).toBe('block');
  });

  it('createEnemyShip returns entity with 3 HP', () => {
    const e = createEnemyShip(W, H, 200, 160);
    expect(e.kind).toBe(EntityKind.EnemyShip);
    expect(e.hp).toBe(3);
    expect(e.maxHp).toBe(3);
    expect(e.destructibleVariant).toBe('enemy');
  });

  describe('isDestructible', () => {
    it('returns true for Meteor, Block, EnemyShip', () => {
      expect(isDestructible(createMeteor(W, H, 0, 100))).toBe(true);
      expect(isDestructible(createBlock(W, H, 0, 100))).toBe(true);
      expect(isDestructible(createEnemyShip(W, H, 0, 100))).toBe(true);
    });

    it('returns false for PlayerShip', () => {
      expect(isDestructible(createPlayerShip(W, H))).toBe(false);
    });
  });
});
