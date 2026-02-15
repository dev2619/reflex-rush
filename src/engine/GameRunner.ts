/**
 * Game runner — wires loop, entities, spawn, collision, score, feedback. Single source of truth for run state.
 */

import type { Entity } from '../entities/Entity';
import { EntityKind } from '../core/types';
import { createPlayer, movePlayerToLane } from '../entities/Player';
import { createGameLoop } from './GameLoop';
import { intersectAABB, distanceBetween } from './CollisionSystem';
import { createSpawnManager } from '../systems/SpawnManager';
import { createScoreSystem } from '../systems/ScoreSystem';
import { createFeedbackSystem } from '../systems/FeedbackSystem';
import type { SwipeDirection } from '../core/types';
import type { GameConfig } from '../core/types';
import { PLAYER_LANE_COUNT } from '../core/constants';

export type GameRunnerState = {
  status: 'idle' | 'playing' | 'gameover';
  player: Entity | null;
  threats: Entity[];
  score: number;
  coinsThisRun: number;
  deathReason: string | null;
  slowMoUntil: number;
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
  onSwipe: (direction: SwipeDirection) => void;
  destroy: () => void;
}

export function createGameRunner(
  config: GameConfig,
  callbacks: GameRunnerCallbacks
): GameRunnerAPI {
  const loop = createGameLoop();
  const spawn = createSpawnManager(config);
  const score = createScoreSystem();
  const feedback = createFeedbackSystem();

  let state: GameRunnerState = {
    status: 'idle',
    player: null,
    threats: [],
    score: 0,
    coinsThisRun: 0,
    deathReason: null,
    slowMoUntil: 0,
  };

  let runStartTime = 0;
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
    const w = Math.max(1, config.width);
    const h = Math.max(1, config.height);
    spawn.reset();
    score.reset();
    state = {
      status: 'playing',
      player: createPlayer(w, h),
      threats: [],
      score: 0,
      coinsThisRun: 0,
      deathReason: null,
      slowMoUntil: 0,
    };
    runStartTime = Date.now();
    loop.start();
    notify();
  }

  const unsub = loop.subscribe((deltaMs: number) => {
    if (state.status !== 'playing' || !state.player) return;

    const now = Date.now();
    const runElapsed = Math.max(0, now - runStartTime);
    const isSlowMo = state.slowMoUntil > now;
    const scale = Math.max(0, Math.min(1, config.nearMissSlowMoScale ?? 0.4));
    const effectiveDelta = Math.max(0, isSlowMo ? deltaMs * scale : deltaMs);

    // Spawn
    const w = Math.max(1, config.width);
    const h = Math.max(1, config.height);
    const newThreats = spawn.tick(effectiveDelta, runElapsed, w, h);
    state.threats.push(...newThreats);

    // Move threats
    const playerBounds = state.player.bounds;
    const toRemove: string[] = [];
    let nearMissThisFrame = false;

    for (const t of state.threats) {
      if (!t.bounds) {
        toRemove.push(t.id);
        continue;
      }
      if (t.velocity) {
        t.bounds.x += t.velocity.x * (effectiveDelta / 1000);
        t.bounds.y += t.velocity.y * (effectiveDelta / 1000);
      }
      if (t.bounds.y > h) {
        toRemove.push(t.id);
        continue;
      }
      const dist = distanceBetween(t.bounds, playerBounds);
      if (intersectAABB(t.bounds, playerBounds)) {
        kill('collision');
        return;
      }
      if (dist < (config.nearMissThresholdPx ?? 40) && dist > 0) {
        nearMissThisFrame = true;
      }
    }

    if (nearMissThisFrame) {
      score.addNearMissBonus();
      feedback.trigger('near_miss');
      state.slowMoUntil = now + 150;
    }

    state.threats = state.threats.filter((t) => !toRemove.includes(t.id));
    score.addTimeScore(effectiveDelta);
    state.score = Math.floor(score.getScore());
    state.coinsThisRun = score.getCoinsThisRun();
    notify();
  });

  return {
    getState: () => ({ ...state }),
    startRun,
    retry() {
      callbacks.onRetry?.();
      feedback.trigger('retry');
      startRun();
    },
    onSwipe(direction: SwipeDirection) {
      if (state.status !== 'playing' || !state.player) return;
      feedback.trigger('swipe');
      const gameWidth = Math.max(1, config.width);
      let lane = state.player.lane ?? 1;
      if (direction === 'left') lane = Math.max(0, lane - 1);
      else if (direction === 'right') lane = Math.min(PLAYER_LANE_COUNT - 1, lane + 1);
      else if (direction === 'up' || direction === 'down') {
        lane = direction === 'up' ? Math.max(0, lane - 1) : Math.min(PLAYER_LANE_COUNT - 1, lane + 1);
      }
      state.player.lane = lane;
      state.player.bounds = movePlayerToLane(state.player.bounds, lane, gameWidth);
      notify();
    },
    destroy() {
      unsub();
      loop.stop();
    },
  };
}
