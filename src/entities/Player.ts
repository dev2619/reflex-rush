/**
 * Player entity — lane position, bounds, state.
 */

import type { Bounds } from '../core/types';
import { EntityKind } from '../core/types';
import { createEntity, type Entity } from './Entity';
import { PLAYER_LANE_COUNT, LANE_WIDTH_RATIO } from '../core/constants';

export const PLAYER_WIDTH_RATIO = 0.2;
export const PLAYER_HEIGHT_RATIO = 0.12;

export function createPlayer(gameWidth: number, gameHeight: number): Entity {
  const w = gameWidth * PLAYER_WIDTH_RATIO;
  const h = gameHeight * PLAYER_HEIGHT_RATIO;
  const lane = 1; // center
  const x = laneToX(lane, gameWidth) - w / 2;
  const y = gameHeight * 0.75 - h / 2;
  return createEntity(EntityKind.Player, { x, y, width: w, height: h }, { lane });
}

export function laneToX(lane: number, gameWidth: number): number {
  const t = (lane + 0.5) * LANE_WIDTH_RATIO;
  return t * gameWidth;
}

export function xToLane(x: number, gameWidth: number): number {
  const t = x / gameWidth;
  return Math.max(0, Math.min(PLAYER_LANE_COUNT - 1, Math.floor(t / LANE_WIDTH_RATIO)));
}

export function movePlayerToLane(
  bounds: Bounds,
  targetLane: number,
  gameWidth: number
): Bounds {
  const centerX = laneToX(targetLane, gameWidth) - bounds.width / 2;
  return { ...bounds, x: centerX };
}
