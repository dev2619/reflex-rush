/**
 * Proyectil enemigo — disparado por naves enemigas hacia el jugador. Lento, no usa pool.
 */

import { EntityKind } from '../core/types';
import { createEntity, type Entity } from './Entity';
import { ENEMY_PROJECTILE_SPEED_PX_PER_SEC } from '../core/constants';

const SIZE_W_RATIO = 0.02;
const SIZE_H_RATIO = 0.025;

export function createEnemyProjectile(
  gameWidth: number,
  gameHeight: number,
  fromX: number,
  fromY: number
): Entity {
  const w = gameWidth * SIZE_W_RATIO;
  const h = gameHeight * SIZE_H_RATIO;
  return createEntity(EntityKind.EnemyProjectile, {
    x: fromX - w / 2,
    y: fromY,
    width: w,
    height: h,
  }, {
    velocity: { x: 0, y: ENEMY_PROJECTILE_SPEED_PX_PER_SEC },
    fromEnemy: true,
  });
}
