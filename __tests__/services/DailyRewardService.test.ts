/**
 * TDD: DailyRewardService — racha, canClaimToday, claim.
 */

import { createDailyRewardService } from '../../src/services/DailyRewardService';

describe('DailyRewardService', () => {
  it('canClaimToday is true initially', () => {
    const daily = createDailyRewardService();
    expect(daily.canClaimToday()).toBe(true);
  });

  it('getStreak starts at 0', () => {
    const daily = createDailyRewardService();
    expect(daily.getStreak()).toBe(0);
  });

  it('claim returns coins and dayIndex', () => {
    const daily = createDailyRewardService();
    const result = daily.claim();
    expect(result).not.toBeNull();
    expect(result!.coins).toBeGreaterThan(0);
    expect(result!.dayIndex).toBeGreaterThanOrEqual(0);
  });

  it('second claim same day returns null', () => {
    const daily = createDailyRewardService();
    daily.claim();
    expect(daily.claim()).toBeNull();
  });

  it('canClaimToday is false after claim', () => {
    const daily = createDailyRewardService();
    daily.claim();
    expect(daily.canClaimToday()).toBe(false);
  });
});
