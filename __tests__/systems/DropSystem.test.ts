/**
 * TDD: DropSystem — dropFromDestructible returns coins and optionally powerup.
 */

import { dropFromDestructible } from '../../src/systems/DropSystem';
import { createMeteor, createBlock, createEnemyShip } from '../../src/entities/Destructible';
import { EntityKind } from '../../src/core/types';
import { COINS_PER_METEOR, COINS_PER_BLOCK, COINS_PER_ENEMY } from '../../src/core/constants';

const W = 400;
const H = 800;

describe('DropSystem', () => {
  it('meteor drop returns one coin with COINS_PER_METEOR value', () => {
    const meteor = createMeteor(W, H, 100, 200);
    meteor.bounds = { x: 100, y: 300, width: 30, height: 25 };
    const { coins } = dropFromDestructible(meteor, W, H);
    expect(coins).toHaveLength(1);
    expect(coins[0].kind).toBe(EntityKind.Coin);
    expect(coins[0].coinValue).toBe(COINS_PER_METEOR);
    expect(coins[0].bounds.width).toBeGreaterThan(0);
    expect(coins[0].bounds.height).toBeGreaterThan(0);
  });

  it('block drop returns one coin with COINS_PER_BLOCK value', () => {
    const block = createBlock(W, H, 150, 180);
    block.bounds = { x: 150, y: 400, width: 40, height: 30 };
    const { coins } = dropFromDestructible(block, W, H);
    expect(coins).toHaveLength(1);
    expect(coins[0].coinValue).toBe(COINS_PER_BLOCK);
  });

  it('enemy drop returns one coin with COINS_PER_ENEMY value', () => {
    const enemy = createEnemyShip(W, H, 200, 160);
    enemy.bounds = { x: 200, y: 100, width: 35, height: 28 };
    const { coins } = dropFromDestructible(enemy, W, H);
    expect(coins).toHaveLength(1);
    expect(coins[0].coinValue).toBe(COINS_PER_ENEMY);
  });

  it('powerup is either null or Powerup entity', () => {
    const meteor = createMeteor(W, H, 100, 200);
    meteor.bounds = { x: 100, y: 300, width: 30, height: 25 };
    for (let i = 0; i < 30; i++) {
      const { powerup } = dropFromDestructible(meteor, W, H);
      if (powerup) {
        expect(powerup.kind).toBe(EntityKind.Powerup);
        expect(['extra_ship', 'shield', 'weapon_upgrade', 'magnet']).toContain(powerup.powerupType);
        break;
      }
    }
  });
});
