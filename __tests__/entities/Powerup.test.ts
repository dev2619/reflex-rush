/**
 * TDD: Powerup — createPowerup returns Powerup entity with powerupType.
 */

import { createPowerup } from '../../src/entities/Powerup';
import { EntityKind } from '../../src/core/types';
import type { PowerupType } from '../../src/core/types';

const W = 400;
const H = 800;
const types: PowerupType[] = ['extra_ship', 'shield', 'weapon_upgrade', 'magnet'];

describe('Powerup', () => {
  types.forEach((powerupType) => {
    it(`createPowerup with ${powerupType} has correct kind and type`, () => {
      const p = createPowerup(W, H, 50, 100, powerupType);
      expect(p.kind).toBe(EntityKind.Powerup);
      expect(p.powerupType).toBe(powerupType);
      expect(p.bounds.x).toBe(50);
      expect(p.bounds.y).toBe(100);
      expect(p.bounds.width).toBeGreaterThan(0);
    });
  });
});
