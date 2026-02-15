/**
 * TDD: Coin — createCoin returns Coin entity with value.
 */

import { createCoin } from '../../src/entities/Coin';
import { EntityKind } from '../../src/core/types';

const W = 400;
const H = 800;

describe('Coin', () => {
  it('returns entity with kind Coin and coinValue', () => {
    const c = createCoin(W, H, 100, 200, 5);
    expect(c.kind).toBe(EntityKind.Coin);
    expect(c.coinValue).toBe(5);
    expect(c.bounds.x).toBe(100);
    expect(c.bounds.y).toBe(200);
    expect(c.bounds.width).toBeGreaterThan(0);
    expect(c.bounds.height).toBeGreaterThan(0);
  });
});
