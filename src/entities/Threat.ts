/**
 * Threat entity — obstacles that move toward player.
 */

import type { Bounds } from '../core/types';
import { EntityKind } from '../core/types';
import { createEntity, type Entity } from './Entity';
import { PLAYER_LANE_COUNT, LANE_WIDTH_RATIO } from '../core/constants';

export const THREAT_WIDTH_RATIO = 0.22;
export const THREAT_HEIGHT_RATIO = 0.1;

export function createThreat(
  gameWidth: number,
  gameHeight: number,
  lane: number,
  speedY: number
): Entity {
  const w = gameWidth * THREAT_WIDTH_RATIO;
  const h = gameHeight * THREAT_HEIGHT_RATIO;
  const t = (lane + 0.5) * LANE_WIDTH_RATIO;
  const x = t * gameWidth - w / 2;
  const y = -h;
  return createEntity(EntityKind.Threat, { x, y, width: w, height: h }, {
    velocity: { x: 0, y: speedY },
    lane,
  });
}

export function pickRandomLane(): number {
  return Math.floor(Math.random() * PLAYER_LANE_COUNT);
}
