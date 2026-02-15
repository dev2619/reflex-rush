/**
 * Misiones simples: progreso y recompensas en monedas.
 */

export type MissionId = string;

export interface MissionDef {
  id: MissionId;
  title: string;
  target: number;
  rewardCoins: number;
}

export interface MissionProgress {
  id: MissionId;
  current: number;
  completed: boolean;
  claimed: boolean;
}

const STORAGE_KEY = 'reflex_rush_mission_progress';

const DEFAULT_MISSIONS: MissionDef[] = [
  { id: 'play_3', title: 'Juega 3 partidas', target: 3, rewardCoins: 20 },
  { id: 'score_100', title: 'Consigue 100 puntos', target: 100, rewardCoins: 30 },
  { id: 'play_5', title: 'Juega 5 partidas', target: 5, rewardCoins: 40 },
  { id: 'score_250', title: 'Consigue 250 puntos', target: 250, rewardCoins: 50 },
];

export interface MissionServiceAPI {
  getMissions: () => MissionDef[];
  getProgress: () => MissionProgress[];
  recordRun: () => void;
  recordScore: (score: number) => void;
  claimReward: (missionId: MissionId) => number | null;
  load: () => Promise<void>;
  save: () => Promise<void>;
}

export function createMissionService(): MissionServiceAPI {
  let progress: Record<MissionId, { current: number; claimed: boolean }> = {};

  function getProgress(): MissionProgress[] {
    return DEFAULT_MISSIONS.map((def) => {
      const p = progress[def.id] ?? { current: 0, claimed: false };
      const completed = p.current >= def.target;
      return {
        id: def.id,
        current: p.current,
        completed,
        claimed: p.claimed,
      };
    });
  }

  return {
    getMissions: () => [...DEFAULT_MISSIONS],
    getProgress,
    recordRun() {
      for (const def of DEFAULT_MISSIONS) {
        if (def.id.startsWith('play_')) {
          const p = progress[def.id] ?? { current: 0, claimed: false };
          p.current = (p.current ?? 0) + 1;
          progress[def.id] = p;
        }
      }
    },
    recordScore(score: number) {
      for (const def of DEFAULT_MISSIONS) {
        if (def.id.startsWith('score_')) {
          const p = progress[def.id] ?? { current: 0, claimed: false };
          if (p.current < score) p.current = score;
          progress[def.id] = p;
        }
      }
    },
    claimReward(missionId: MissionId): number | null {
      const def = DEFAULT_MISSIONS.find((m) => m.id === missionId);
      if (!def) return null;
      const p = progress[def.id] ?? { current: 0, claimed: false };
      if (p.current < def.target || p.claimed) return null;
      p.claimed = true;
      progress[def.id] = p;
      return def.rewardCoins;
    },
    async load() {
      try {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) progress = JSON.parse(raw);
      } catch {
        progress = {};
      }
    },
    async save() {
      try {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch {}
    },
  };
}
