/**
 * Global game constants. Overridable by Remote Config.
 */

import type { GameConfig } from './types';

export const DEFAULT_CONFIG: GameConfig = {
  width: 0, // set at runtime from Dimensions
  height: 0,
  targetFps: 60,
  spawnIntervalMs: 800,
  baseThreatSpeed: 280,
  speedIncrementPerSecond: 15,
  nearMissThresholdPx: 40,
  nearMissSlowMoScale: 0.4,
};

export const SWIPE_THRESHOLD_PX = 50;
export const PLAYER_LANE_COUNT = 3;
export const LANE_WIDTH_RATIO = 1 / PLAYER_LANE_COUNT;

export const COINS_PER_SECOND = 1;
export const COINS_PER_NEAR_MISS = 2;
export const REVIVE_COST_COINS = 50;
