/**
 * Destructible obstacles — meteor, block, enemy ship. HP + variant.
 */

import type { Bounds } from '../core/types';
import type { DestructibleVariant } from '../core/types';
import { EntityKind } from '../core/types';
import { createEntity, type Entity } from './Entity';

const SIZE_RATIO_W = 0.1;
const SIZE_RATIO_H = 0.08;

export function createMeteor(
  gameWidth: number,
  gameHeight: number,
  x: number,
  speedY: number
): Entity {
  const w = gameWidth * SIZE_RATIO_W * (0.9 + Math.random() * 0.3);
  const h = gameHeight * SIZE_RATIO_H;
  return createEntity(EntityKind.Meteor, { x, y: -h, width: w, height: h }, {
    velocity: { x: 0, y: speedY },
    hp: 1,
    maxHp: 1,
    destructibleVariant: 'meteor',
  });
}

export function createBlock(
  gameWidth: number,
  gameHeight: number,
  x: number,
  speedY: number
): Entity {
  const w = gameWidth * SIZE_RATIO_W * 1.2;
  const h = gameHeight * SIZE_RATIO_H * 1.1;
  return createEntity(EntityKind.Block, { x, y: -h, width: w, height: h }, {
    velocity: { x: 0, y: speedY },
    hp: 2,
    maxHp: 2,
    destructibleVariant: 'block',
  });
}

export function createEnemyShip(
  gameWidth: number,
  gameHeight: number,
  x: number,
  speedY: number
): Entity {
  const w = gameWidth * SIZE_RATIO_W;
  const h = gameHeight * SIZE_RATIO_H * 1.2;
  return createEntity(EntityKind.EnemyShip, { x, y: -h, width: w, height: h }, {
    velocity: { x: 0, y: speedY },
    hp: 3,
    maxHp: 3,
    destructibleVariant: 'enemy',
    nextShotAt: 0,
  });
}

export function isDestructible(e: Entity): boolean {
  return e.kind === EntityKind.Meteor || e.kind === EntityKind.Block || e.kind === EntityKind.EnemyShip;
}
