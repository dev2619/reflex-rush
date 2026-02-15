/**
 * Entity — minimal ECS-style entity (id + kind + bounds + optional data).
 * Space shooter: hp, shield, projectiles, powerups, coins.
 */

import type { Bounds } from '../core/types';
import type { DestructibleVariant, PowerupType, WeaponPattern } from '../core/types';
import { EntityKind } from '../core/types';

export interface Entity {
  id: string;
  kind: EntityKind;
  bounds: Bounds;
  velocity?: { x: number; y: number };
  /** For threats: lane index 0..PLAYER_LANE_COUNT-1 */
  lane?: number;
  /** Optional: skin/trail id for rendering */
  skinId?: string;
  /** Optional: time-to-live for particles */
  ttlMs?: number;
  /** Threat variant: 0=normal, 1=fast, 2=wide (colores/formas en UI) */
  threatVariant?: number;
  /** Destructibles: current HP */
  hp?: number;
  /** Destructibles: max HP (for bar) */
  maxHp?: number;
  /** Destructible variant: meteor, block, enemy */
  destructibleVariant?: DestructibleVariant;
  /** Ships: shield active (1 hit) */
  shieldActive?: boolean;
  /** Powerups: type */
  powerupType?: PowerupType;
  /** Projectiles: owner ship id */
  ownerId?: string;
  /** Projectiles: damage per hit */
  damage?: number;
  /** Coin value shown (e.g. +1, +5) */
  coinValue?: number;
  /** Drone formation index (0 = leader) */
  fleetIndex?: number;
  /** Enemy: time until next shot */
  nextShotAt?: number;
  /** Hit flash until timestamp */
  hitFlashUntil?: number;
  /** Weapon pattern for player fleet */
  weaponPattern?: WeaponPattern;
  /** Proyectil enemigo (no usa pool) */
  fromEnemy?: boolean;
}

let nextId = 0;
export function nextEntityId(): string {
  return `e_${++nextId}`;
}

export function createEntity(
  kind: EntityKind,
  bounds: Bounds,
  opts: Partial<Pick<Entity,
    'velocity' | 'lane' | 'skinId' | 'ttlMs' | 'threatVariant' |
    'hp' | 'maxHp' | 'destructibleVariant' | 'shieldActive' | 'powerupType' |
    'ownerId' | 'damage' | 'coinValue' | 'fleetIndex' | 'nextShotAt' | 'hitFlashUntil' | 'weaponPattern' | 'fromEnemy'
  >> = {}
): Entity {
  return {
    id: nextEntityId(),
    kind,
    bounds: { ...bounds },
    ...opts,
  };
}
