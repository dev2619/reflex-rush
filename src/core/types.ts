/**
 * Core game types — shared across engine, entities, systems.
 */

export type Vec2 = { x: number; y: number };

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export enum EntityKind {
  Player = 'player',
  Threat = 'threat',
  Pickup = 'pickup',
  Particle = 'particle',
}

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
}
