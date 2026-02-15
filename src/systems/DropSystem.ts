/**
 * Drop system — spawn coins and powerups on destructible death.
 */

import type { Entity } from '../entities/Entity';
import { createCoin } from '../entities/Coin';
import { createPowerup } from '../entities/Powerup';
import type { PowerupType } from '../core/types';
import { EntityKind } from '../core/types';
import {
  COINS_PER_METEOR,
  COINS_PER_BLOCK,
  COINS_PER_ENEMY,
  POWERUP_DROP_CHANCE,
} from '../core/constants';

export function dropFromDestructible(
  e: Entity,
  gameWidth: number,
  gameHeight: number
): { coins: Entity[]; powerup: Entity | null } {
  const cx = e.bounds.x + e.bounds.width / 2;
  const cy = e.bounds.y + e.bounds.height / 2;
  const coins: Entity[] = [];
  let value = 0;
  if (e.kind === EntityKind.Meteor) value = COINS_PER_METEOR;
  else if (e.kind === EntityKind.Block) value = COINS_PER_BLOCK;
  else if (e.kind === EntityKind.EnemyShip) value = COINS_PER_ENEMY;

  if (value > 0) {
    coins.push(createCoin(gameWidth, gameHeight, cx, cy, value));
  }

  let powerup: Entity | null = null;
  if (Math.random() < POWERUP_DROP_CHANCE) {
    const types: PowerupType[] = ['extra_ship', 'shield', 'weapon_upgrade', 'magnet'];
    const t = types[Math.floor(Math.random() * types.length)];
    powerup = createPowerup(gameWidth, gameHeight, cx, cy, t);
  }

  return { coins, powerup };
}
