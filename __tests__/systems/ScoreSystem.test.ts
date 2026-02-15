/**
 * TDD: ScoreSystem — tiempo, near-miss, reset.
 */

import { createScoreSystem } from '../../src/systems/ScoreSystem';

describe('ScoreSystem', () => {
  it('starts at 0 score and 0 coins', () => {
    const score = createScoreSystem();
    expect(score.getScore()).toBe(0);
    expect(score.getCoinsThisRun()).toBe(0);
  });

  it('addTimeScore increases score by time', () => {
    const score = createScoreSystem();
    score.addTimeScore(1000);
    expect(score.getScore()).toBeGreaterThan(0);
    score.addTimeScore(1000);
    expect(score.getScore()).toBeGreaterThan(10);
  });

  it('addNearMissBonus adds points and coins', () => {
    const score = createScoreSystem();
    score.addNearMissBonus();
    expect(score.getScore()).toBe(25);
    expect(score.getCoinsThisRun()).toBe(2);
    score.addNearMissBonus();
    expect(score.getCoinsThisRun()).toBe(4);
  });

  it('reset zeros score and coins', () => {
    const score = createScoreSystem();
    score.addTimeScore(5000);
    score.addNearMissBonus();
    score.reset();
    expect(score.getScore()).toBe(0);
    expect(score.getCoinsThisRun()).toBe(0);
  });
});
