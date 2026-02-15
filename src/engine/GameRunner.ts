/**
 * Game runner — Space Swipe Shooter. Fleet, free 2D movement, projectiles, destructibles, powerups, coins.
 */

import type { Entity } from '../entities/Entity';
import { EntityKind } from '../core/types';
import { createPlayerShip, createDroneShip, clampShipToBounds } from '../entities/PlayerShip';
import { createProjectilePool } from '../entities/Projectile';
import { createGameLoop } from './GameLoop';
import { createSpaceSpawnManager } from '../systems/SpaceSpawnManager';
import { createWeaponSystem, moveProjectiles } from '../systems/WeaponSystem';
import { updateFleetFormation, getFleetShips } from '../systems/FleetSystem';
import {
  applyProjectileHits,
  applyDamageToDestructible,
  findShipCollision,
} from '../systems/DamageSystem';
import { dropFromDestructible } from '../systems/DropSystem';
import { createScoreSystem } from '../systems/ScoreSystem';
import { createFeedbackSystem } from '../systems/FeedbackSystem';
import { intersectAABB } from './CollisionSystem';
import type { GameConfig } from '../core/types';
import type { WeaponPattern } from '../core/types';
import {
  HIT_STOP_MS,
  COINS_PER_METEOR,
  COINS_PER_BLOCK,
  COINS_PER_ENEMY,
  MAGNET_UPGRADE_MULT,
} from '../core/constants';

export type GameRunnerState = {
  status: 'idle' | 'playing' | 'gameover';
  fleet: Entity[];
  projectiles: Entity[];
  destructibles: Entity[];
  powerups: Entity[];
  coins: Entity[];
  score: number;
  coinsThisRun: number;
  deathReason: string | null;
  /** Free 2D movement target (leader) */
  targetX: number;
  targetY: number;
  /** Weapon pattern for whole fleet */
  weaponPattern: WeaponPattern;
  /** Magnet radius multiplier (powerup) */
  magnetMult: number;
  /** Hit stop / screen shake until */
  hitStopUntil: number;
  /** Floating +N text to show */
  floatTexts: { x: number; y: number; value: number; until: number }[];
};

export type GameRunnerCallbacks = {
  onStateChange: (state: GameRunnerState) => void;
  onDeath?: (reason: string) => void;
  onRetry?: () => void;
};

export interface GameRunnerAPI {
  getState: () => GameRunnerState;
  startRun: () => void;
  retry: () => void;
  goToMenu: () => void;
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onSwipeDelta: (dx: number, dy: number) => void;
  destroy: () => void;
}

export function createGameRunner(
  config: GameConfig,
  callbacks: GameRunnerCallbacks
): GameRunnerAPI {
  const loop = createGameLoop();
  const spawn = createSpaceSpawnManager(config);
  const score = createScoreSystem();
  const feedback = createFeedbackSystem();
  const projectilePool = createProjectilePool();
  const weaponSystem = createWeaponSystem();

  let state: GameRunnerState = {
    status: 'idle',
    fleet: [],
    projectiles: [],
    destructibles: [],
    powerups: [],
    coins: [],
    score: 0,
    coinsThisRun: 0,
    deathReason: null,
    targetX: 0,
    targetY: 0,
    weaponPattern: 'single',
    magnetMult: 1,
    hitStopUntil: 0,
    floatTexts: [],
  };

  const notify = () => callbacks.onStateChange({ ...state });

  function kill(reason: string) {
    if (state.status !== 'playing') return;
    state.status = 'gameover';
    state.deathReason = reason;
    feedback.trigger('death');
    callbacks.onDeath?.(reason);
    loop.stop();
    notify();
  }

  function startRun() {
    runStartTime.current = 0;
    const w = Math.max(1, config.width);
    const h = Math.max(1, config.height);
    spawn.reset();
    score.reset();
    weaponSystem.reset();

    const leader = createPlayerShip(w, h, { fleetIndex: 0, weaponPattern: 'single' });
    state = {
      status: 'playing',
      fleet: [leader],
      projectiles: [],
      destructibles: [],
      powerups: [],
      coins: [],
      score: 0,
      coinsThisRun: 0,
      deathReason: null,
      targetX: leader.bounds.x,
      targetY: leader.bounds.y,
      weaponPattern: 'single',
      magnetMult: 1,
      hitStopUntil: 0,
      floatTexts: [],
    };
    loop.start();
    notify();
  }

  const runStartTime = { current: 0 };

  const unsub = loop.subscribe((deltaMs: number) => {
    if (state.status !== 'playing' || state.fleet.length === 0) return;

    const now = Date.now();
    runStartTime.current = runStartTime.current || now;
    const runElapsed = Math.max(0, now - runStartTime.current);
    const hitStop = state.hitStopUntil > now;
    const effectiveDeltaMs = hitStop ? 0 : Math.min(deltaMs, 50);
    const deltaSec = effectiveDeltaMs / 1000;
    const w = Math.max(1, config.width);
    const h = Math.max(1, config.height);
    const lerpFactor = (config.playerLerpFactor ?? 12) * deltaSec;

    const leader = state.fleet[0];
    if (!leader) return;

    // ——— Movement: lerp leader toward target, clamp ———
    const targetX = Math.max(0, Math.min(w - leader.bounds.width, state.targetX));
    const targetY = Math.max(0, Math.min(h - leader.bounds.height, state.targetY));
    state.targetX = targetX;
    state.targetY = targetY;
    leader.bounds.x += (targetX - leader.bounds.x) * Math.min(1, lerpFactor);
    leader.bounds.y += (targetY - leader.bounds.y) * Math.min(1, lerpFactor);
    leader.bounds = clampShipToBounds(leader.bounds, w, h);
    updateFleetFormation(state.fleet, leader.bounds, w, h);

    // ——— Spawn obstacles ———
    const newObstacles = spawn.tick(effectiveDeltaMs, runElapsed, w, h);
    state.destructibles.push(...newObstacles);

    // ——— Auto fire ———
    const fleetShips = getFleetShips(state.fleet);
    for (const s of fleetShips) s.weaponPattern = state.weaponPattern;
    const newProjectiles = weaponSystem.tick(now, state.fleet, projectilePool, config);
    state.projectiles.push(...newProjectiles);
    if (newProjectiles.length > 0) feedback.trigger('shoot');

    // ——— Move projectiles ———
    const { toRelease: projectilesToRelease } = moveProjectiles(
      state.projectiles,
      deltaSec,
      h
    );
    for (const id of projectilesToRelease) projectilePool.release(id);
    state.projectiles = state.projectiles.filter((p) => !projectilesToRelease.includes(p.id));

    // ——— Projectile vs destructible ———
    const hitResult = applyProjectileHits(state.projectiles, state.destructibles);
    for (const id of hitResult.projectilesToRelease) projectilePool.release(id);
    state.projectiles = state.projectiles.filter(
      (p) => !hitResult.projectilesToRelease.includes(p.id)
    );

    const toRemoveDestructible: string[] = [];
    for (const { entity: d, damage } of hitResult.hitDestructible) {
      const dead = applyDamageToDestructible(d, damage);
      feedback.trigger('hit');
      if (dead) {
        toRemoveDestructible.push(d.id);
        const { coins: newCoins, powerup } = dropFromDestructible(d, w, h);
        state.coins.push(...newCoins);
        if (powerup) state.powerups.push(powerup);
        const coinVal =
          d.kind === EntityKind.Meteor
            ? COINS_PER_METEOR
            : d.kind === EntityKind.Block
              ? COINS_PER_BLOCK
              : COINS_PER_ENEMY;
        state.floatTexts.push({
          x: d.bounds.x + d.bounds.width / 2,
          y: d.bounds.y,
          value: coinVal,
          until: now + 600,
        });
        feedback.trigger('destroy');
      }
    }

    state.destructibles = state.destructibles.filter(
      (d) => !toRemoveDestructible.includes(d.id)
    );

    // ——— Move destructibles, powerups, coins ———
    for (const d of state.destructibles) {
      if (d.velocity) {
        d.bounds.x += d.velocity.x * deltaSec;
        d.bounds.y += d.velocity.y * deltaSec;
      }
    }
    state.destructibles = state.destructibles.filter((d) => d.bounds.y < h + 100);

    for (const p of state.powerups) {
      if (p.velocity) {
        p.bounds.x += p.velocity.x * deltaSec;
        p.bounds.y += p.velocity.y * deltaSec;
      }
    }
    state.powerups = state.powerups.filter((pu) => pu.bounds.y < h + 50);

    const magnetRadius = (config.coinMagnetRadiusPx ?? 120) * state.magnetMult;
    const shipCenterX = leader.bounds.x + leader.bounds.width / 2;
    const shipCenterY = leader.bounds.y + leader.bounds.height / 2;
    for (const c of state.coins) {
      const coinCenterX = c.bounds.x + c.bounds.width / 2;
      const coinCenterY = c.bounds.y + c.bounds.height / 2;
      const dx = shipCenterX - coinCenterX;
      const dy = shipCenterY - coinCenterY;
      const dist = Math.hypot(dx, dy);
      if (dist < magnetRadius && dist > 0) {
        const pull = (1 - dist / magnetRadius) * 400 * deltaSec;
        c.bounds.x += (dx / dist) * pull;
        c.bounds.y += (dy / dist) * pull;
      } else if (c.velocity) {
        c.bounds.x += c.velocity.x * deltaSec;
        c.bounds.y += c.velocity.y * deltaSec;
      }
    }

    // ——— Coin collect ———
    const toRemoveCoin: string[] = [];
    for (const c of state.coins) {
      if (intersectAABB(c.bounds, leader.bounds)) {
        toRemoveCoin.push(c.id);
        state.coinsThisRun += c.coinValue ?? 1;
        feedback.trigger('coin');
      }
    }
    state.coins = state.coins.filter((c) => !toRemoveCoin.includes(c.id));
    state.coins = state.coins.filter((c) => c.bounds.y < h + 30);

    // ——— Powerup collect ———
    const toRemovePowerup: string[] = [];
    for (const pu of state.powerups) {
      if (intersectAABB(pu.bounds, leader.bounds)) {
        toRemovePowerup.push(pu.id);
        if (pu.powerupType === 'extra_ship') {
          const newDrone = createDroneShip(w, h, state.fleet.length, leader.bounds);
          state.fleet.push(newDrone);
        } else if (pu.powerupType === 'shield') {
          for (const s of state.fleet) s.shieldActive = true;
        } else if (pu.powerupType === 'weapon_upgrade') {
          state.weaponPattern =
            state.weaponPattern === 'single'
              ? 'double'
              : state.weaponPattern === 'double'
                ? 'spread'
                : 'spread';
        } else if (pu.powerupType === 'magnet') {
          state.magnetMult = MAGNET_UPGRADE_MULT;
        }
        feedback.trigger('powerup');
      }
    }
    state.powerups = state.powerups.filter((p) => !toRemovePowerup.includes(p.id));

    // ——— Ship vs obstacle: lose ship or shield ———
    const obstacles = state.destructibles;
    const toRemoveShip: string[] = [];
    for (const ship of state.fleet) {
      const coll = findShipCollision(ship, obstacles);
      if (coll) {
        if (ship.shieldActive) {
          ship.shieldActive = false;
          feedback.trigger('shield_break');
          state.hitStopUntil = now + HIT_STOP_MS;
        } else {
          toRemoveShip.push(ship.id);
          state.hitStopUntil = now + HIT_STOP_MS;
          feedback.trigger('ship_lost');
        }
      }
    }
    state.fleet = state.fleet.filter((s) => !toRemoveShip.includes(s.id));

    if (state.fleet.length === 0) {
      kill('fleet_destroyed');
      return;
    }

    // ——— Score, float texts ———
    score.addTimeScore(effectiveDeltaMs);
    state.score = Math.floor(score.getScore());
    state.floatTexts = state.floatTexts.filter((f) => f.until > now);
    notify();
  });

  function goToMenu() {
    loop.stop();
    state = {
      status: 'idle',
      fleet: [],
      projectiles: [],
      destructibles: [],
      powerups: [],
      coins: [],
      score: 0,
      coinsThisRun: 0,
      deathReason: null,
      targetX: 0,
      targetY: 0,
      weaponPattern: 'single',
      magnetMult: 1,
      hitStopUntil: 0,
      floatTexts: [],
    };
    notify();
  }

  return {
    getState: () => ({ ...state }),
    startRun,
    retry() {
      callbacks.onRetry?.();
      feedback.trigger('retry');
      runStartTime.current = 0;
      startRun();
    },
    goToMenu,
    onSwipe(_direction: 'left' | 'right' | 'up' | 'down') {
      // Legacy; movement is via onSwipeDelta
    },
    onSwipeDelta(dx: number, dy: number) {
      if (state.status !== 'playing' || state.fleet.length === 0) return;
      feedback.trigger('swipe');
      const sens = 1.2;
      state.targetX += dx * sens;
      state.targetY += dy * sens;
      const w = config.width;
      const h = config.height;
      const leader = state.fleet[0];
      if (leader) {
        state.targetX = Math.max(0, Math.min(w - leader.bounds.width, state.targetX));
        state.targetY = Math.max(0, Math.min(h - leader.bounds.height, state.targetY));
      }
      notify();
    },
    destroy() {
      unsub();
      loop.stop();
    },
  };
}
