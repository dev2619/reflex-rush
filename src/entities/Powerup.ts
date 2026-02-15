/**
 * Powerup entity — extra ship, shield, weapon upgrade, magnet.
 */

import type { Bounds } from '../core/types';
import type { PowerupType } from '../core/types';
import { EntityKind } from '../core/types';
import { createEntity, type Entity } from './Entity';

const SIZE = 0.06;

export function createPowerup(
  gameWidth: number,
  gameHeight: number,
  x: number,
  y: number,
  powerupType: PowerupType
): Entity {
  const s = gameWidth * SIZE;
  return createEntity(EntityKind.Powerup, { x, y, width: s, height: s }, {
    velocity: { x: 0, y: 40 },
    powerupType,
  });
}
