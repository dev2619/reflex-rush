/**
 * Score system — time-based score, coins, near-miss bonus.
 */

export interface ScoreSystemAPI {
  getScore: () => number;
  getCoinsThisRun: () => number;
  addTimeScore: (deltaMs: number) => void;
  addNearMissBonus: () => void;
  reset: () => void;
}

export function createScoreSystem(): ScoreSystemAPI {
  let score = 0;
  let coinsThisRun = 0;
  const POINTS_PER_SECOND = 10;
  const NEAR_MISS_POINTS = 25;

  return {
    getScore: () => score,
    getCoinsThisRun: () => coinsThisRun,
    addTimeScore(deltaMs: number) {
      score += (deltaMs / 1000) * POINTS_PER_SECOND;
    },
    addNearMissBonus() {
      score += NEAR_MISS_POINTS;
      coinsThisRun += 2;
    },
    reset() {
      score = 0;
      coinsThisRun = 0;
    },
  };
}
