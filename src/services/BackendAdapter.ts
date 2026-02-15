/**
 * Backend abstraction — leaderboards, remote config, live events. Implement Firebase/Mock.
 */

export interface LeaderboardEntry {
  rank: number;
  score: number;
  displayName: string;
  userId?: string;
}

export interface BackendAdapter {
  getLeaderboard: (limit: number) => Promise<LeaderboardEntry[]>;
  submitScore: (score: number) => Promise<void>;
  getRemoteConfig: () => Promise<Record<string, string | number | boolean>>;
}

export const mockBackendAdapter: BackendAdapter = {
  async getLeaderboard() {
    return [];
  },
  async submitScore() {},
  async getRemoteConfig() {
    return {};
  },
};
