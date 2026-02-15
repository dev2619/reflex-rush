/**
 * Global game constants. Overridable by Remote Config.
 * Space Swipe Shooter defaults.
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
  playerMoveSpeedPxPerSec: 520,
  playerLerpFactor: 12,
  fireRateMs: 420,
  projectileSpeedPxPerSec: 900,
  coinMagnetRadiusPx: 120,
  maxParticles: 80,
};
/** Multiplicador de velocidad de disparo con powerup (1 = normal, mayor = dispara más rápido) */
export const FIRE_RATE_MULT_UPGRADE = 1.85;
/** Enemigos: intervalo entre disparos (ms) */
export const ENEMY_SHOOT_INTERVAL_MIN_MS = 1800;
export const ENEMY_SHOOT_INTERVAL_MAX_MS = 3200;
/** Velocidad de las balas enemigas (lentas) */
export const ENEMY_PROJECTILE_SPEED_PX_PER_SEC = 140;

export const SWIPE_THRESHOLD_PX = 50;
export const PLAYER_LANE_COUNT = 3;
export const LANE_WIDTH_RATIO = 1 / PLAYER_LANE_COUNT;

export const COINS_PER_SECOND = 1;
export const COINS_PER_NEAR_MISS = 2;
export const REVIVE_COST_COINS = 50;

/** Space shooter */
export const SHIP_WIDTH_RATIO = 0.08;
export const SHIP_HEIGHT_RATIO = 0.06;
export const PROJECTILE_WIDTH_RATIO = 0.015;
export const PROJECTILE_HEIGHT_RATIO = 0.04;
export const FLEET_FORMATION_OFFSET_Y = 0.04;
export const FLEET_FORMATION_SPACING_X = 0.06;
export const HIT_STOP_MS = 28;
export const SCREEN_SHAKE_AMOUNT = 4;
export const COINS_PER_METEOR = 1;
export const COINS_PER_BLOCK = 2;
export const COINS_PER_ENEMY = 5;
export const POWERUP_DROP_CHANCE = 0.12;
export const SHIELD_DURATION_MS = 0;
export const MAGNET_UPGRADE_MULT = 1.8;
