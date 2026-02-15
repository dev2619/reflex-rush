/**
 * Space spawn manager — meteors, blocks, enemy ships. Procedural by time.
 */

import type { Entity } from '../entities/Entity';
import { createMeteor, createBlock, createEnemyShip } from '../entities/Destructible';
import type { GameConfig } from '../core/types';

export interface SpaceSpawnManagerAPI {
  tick: (deltaMs: number, runElapsedMs: number, gameWidth: number, gameHeight: number) => Entity[];
  reset: () => void;
}

export function createSpaceSpawnManager(config: GameConfig): SpaceSpawnManagerAPI {
  let nextSpawnAt = 0;
  const baseInterval = config.spawnIntervalMs ?? 800;

  function speedForElapsed(elapsedMs: number): number {
    const sec = elapsedMs / 1000;
    return (config.baseThreatSpeed ?? 280) + (config.speedIncrementPerSecond ?? 15) * sec;
  }

  function tick(
    deltaMs: number,
    runElapsedMs: number,
    gameWidth: number,
    gameHeight: number
  ): Entity[] {
    nextSpawnAt += deltaMs;
    const interval = Math.max(200, baseInterval - Math.floor(runElapsedMs / 8000));
    const spawned: Entity[] = [];

    while (nextSpawnAt >= interval) {
      nextSpawnAt -= interval;
      const speed = speedForElapsed(runElapsedMs);
      const r = Math.random();
      const x = gameWidth * (0.15 + Math.random() * 0.7);
      if (r < 0.5) {
        spawned.push(createMeteor(gameWidth, gameHeight, x, speed));
      } else if (r < 0.85) {
        spawned.push(createBlock(gameWidth, gameHeight, x, speed));
      } else {
        spawned.push(createEnemyShip(gameWidth, gameHeight, x, speed * 0.85));
      }
    }

    return spawned;
  }

  function reset() {
    nextSpawnAt = baseInterval;
  }

  return { tick, reset };
}
