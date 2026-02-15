/**
 * Coin entity — flies toward player with magnet. Object pool optional for perf.
 */

import type { Bounds } from '../core/types';
import { EntityKind } from '../core/types';
import { createEntity, type Entity } from './Entity';

const COIN_SIZE = 0.03;

export function createCoin(
  gameWidth: number,
  gameHeight: number,
  x: number,
  y: number,
  value: number
): Entity {
  const s = gameWidth * COIN_SIZE;
  return createEntity(EntityKind.Coin, { x, y, width: s, height: s }, {
    velocity: { x: 0, y: 0 },
    coinValue: value,
  });
}
