/**
 * Spawn manager — procedural threat spawning by time and difficulty.
 */

import type { Entity } from '../entities/Entity';
import { createThreat, pickRandomLane } from '../entities/Threat';
import type { GameConfig } from '../core/types';

export interface SpawnManagerAPI {
  tick: (deltaMs: number, runElapsedMs: number, gameWidth: number, gameHeight: number) => Entity[];
  reset: () => void;
}

export function createSpawnManager(config: GameConfig): SpawnManagerAPI {
  let nextSpawnAt = 0;

  function speedForElapsed(elapsedMs: number): number {
    const sec = elapsedMs / 1000;
    return config.baseThreatSpeed + config.speedIncrementPerSecond * sec;
  }

  function tick(
    deltaMs: number,
    runElapsedMs: number,
    gameWidth: number,
    gameHeight: number
  ): Entity[] {
    const intervalMs = Math.max(1, config.spawnIntervalMs);
    nextSpawnAt += deltaMs;
    const spawned: Entity[] = [];
    while (nextSpawnAt >= intervalMs) {
      nextSpawnAt -= intervalMs;
      const lane = pickRandomLane();
      const speed = speedForElapsed(runElapsedMs);
      spawned.push(createThreat(gameWidth, gameHeight, lane, speed));
    }
    return spawned;
  }

  function reset() {
    // Primer obstáculo en el primer tick; luego cada spawnIntervalMs
    nextSpawnAt = Math.max(1, config.spawnIntervalMs);
  }

  return { tick, reset };
}
