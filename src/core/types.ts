/**
 * Core game types — shared across engine, entities, systems.
 * Space Swipe Shooter: player/drone ships, destructibles, projectiles, powerups.
 */

export type Vec2 = { x: number; y: number };

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export enum EntityKind {
  Player = 'player',
  Threat = 'threat',
  Pickup = 'pickup',
  Particle = 'particle',
  /** Space shooter */
  PlayerShip = 'player_ship',
  DroneShip = 'drone_ship',
  EnemyShip = 'enemy_ship',
  Meteor = 'meteor',
  Block = 'block',
  Projectile = 'projectile',
  EnemyProjectile = 'enemy_projectile',
  Powerup = 'powerup',
  Coin = 'coin',
}

/** Destructible obstacle variant */
export type DestructibleVariant = 'meteor' | 'block' | 'enemy';

/** Powerup type */
export type PowerupType = 'extra_ship' | 'shield' | 'weapon_upgrade' | 'magnet';

/** Weapon pattern for upgrade */
export type WeaponPattern = 'single' | 'double' | 'spread';

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameState {
  status: 'idle' | 'playing' | 'paused' | 'gameover';
  score: number;
  runStartTime: number;
  deathReason: DeathReason | null;
}

export type DeathReason =
  | 'collision'
  | 'out_of_bounds'
  | 'timeout'
  | 'unknown';

export interface GameConfig {
  width: number;
  height: number;
  targetFps: number;
  spawnIntervalMs: number;
  baseThreatSpeed: number;
  speedIncrementPerSecond: number;
  nearMissThresholdPx: number;
  nearMissSlowMoScale: number;
  /** Space shooter: free movement */
  playerMoveSpeedPxPerSec?: number;
  playerLerpFactor?: number;
  fireRateMs?: number;
  projectileSpeedPxPerSec?: number;
  coinMagnetRadiusPx?: number;
  maxParticles?: number;
}
