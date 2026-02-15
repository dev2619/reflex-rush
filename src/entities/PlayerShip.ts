/**
 * Player ship entity — free 2D position, no lanes.
 */

import type { Bounds } from '../core/types';
import { EntityKind } from '../core/types';
import type { WeaponPattern } from '../core/types';
import { createEntity, type Entity } from './Entity';
import { SHIP_WIDTH_RATIO, SHIP_HEIGHT_RATIO } from '../core/constants';

export function createPlayerShip(
  gameWidth: number,
  gameHeight: number,
  opts: { fleetIndex?: number; weaponPattern?: WeaponPattern } = {}
): Entity {
  const w = gameWidth * SHIP_WIDTH_RATIO;
  const h = gameHeight * SHIP_HEIGHT_RATIO;
  const x = gameWidth / 2 - w / 2;
  const y = gameHeight * 0.78 - h / 2;
  return createEntity(EntityKind.PlayerShip, { x, y, width: w, height: h }, {
    fleetIndex: opts.fleetIndex ?? 0,
    shieldActive: false,
    weaponPattern: opts.weaponPattern ?? 'single',
    ...opts,
  });
}

export function createDroneShip(
  gameWidth: number,
  gameHeight: number,
  fleetIndex: number,
  leaderBounds: Bounds
): Entity {
  const w = gameWidth * SHIP_WIDTH_RATIO;
  const h = gameHeight * SHIP_HEIGHT_RATIO;
  const offsetY = gameHeight * 0.04;
  const spacingX = gameWidth * 0.06;
  const col = fleetIndex;
  const dx = (col - 0.5) * spacingX;
  const x = leaderBounds.x + leaderBounds.width / 2 - w / 2 + dx;
  const y = leaderBounds.y + leaderBounds.height + offsetY;
  return createEntity(EntityKind.DroneShip, { x, y, width: w, height: h }, {
    fleetIndex,
    shieldActive: false,
    weaponPattern: 'single',
  });
}

export function clampShipToBounds(
  bounds: Bounds,
  gameWidth: number,
  gameHeight: number
): Bounds {
  return {
    ...bounds,
    x: Math.max(0, Math.min(gameWidth - bounds.width, bounds.x)),
    y: Math.max(0, Math.min(gameHeight - bounds.height, bounds.y)),
  };
}
