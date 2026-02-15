/**
 * TDD: MissionService — recordRun, recordScore, claimReward.
 */

import { createMissionService } from '../../src/services/MissionService';

describe('MissionService', () => {
  it('getMissions returns definitions', () => {
    const missions = createMissionService();
    const list = missions.getMissions();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('id');
    expect(list[0]).toHaveProperty('title');
    expect(list[0]).toHaveProperty('target');
    expect(list[0]).toHaveProperty('rewardCoins');
  });

  it('getProgress returns current progress', () => {
    const missions = createMissionService();
    const progress = missions.getProgress();
    expect(progress.length).toBe(missions.getMissions().length);
    expect(progress[0]).toHaveProperty('current');
    expect(progress[0]).toHaveProperty('completed');
    expect(progress[0]).toHaveProperty('claimed');
  });

  it('recordRun increments play missions', () => {
    const missions = createMissionService();
    missions.recordRun();
    missions.recordRun();
    missions.recordRun();
    const progress = missions.getProgress();
    const play3 = progress.find((p) => p.id === 'play_3');
    expect(play3).toBeDefined();
    expect(play3!.current).toBe(3);
    expect(play3!.completed).toBe(true);
  });

  it('recordScore updates score missions', () => {
    const missions = createMissionService();
    missions.recordScore(150);
    const progress = missions.getProgress();
    const score100 = progress.find((p) => p.id === 'score_100');
    expect(score100).toBeDefined();
    expect(score100!.current).toBe(150);
    expect(score100!.completed).toBe(true);
  });

  it('claimReward returns coins when completed and not claimed', () => {
    const missions = createMissionService();
    missions.recordRun();
    missions.recordRun();
    missions.recordRun();
    const coins = missions.claimReward('play_3');
    expect(coins).toBe(20);
  });

  it('claimReward returns null when already claimed', () => {
    const missions = createMissionService();
    missions.recordRun();
    missions.recordRun();
    missions.recordRun();
    missions.claimReward('play_3');
    expect(missions.claimReward('play_3')).toBeNull();
  });
});
