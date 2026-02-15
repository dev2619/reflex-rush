/**
 * Daily rewards + streak. Persiste última reclamación.
 */

const STORAGE_KEYS = {
  lastClaimDate: 'reflex_rush_last_claim_date',
  streak: 'reflex_rush_streak',
};

const COINS_BY_DAY = [10, 15, 20, 25, 30, 40, 100]; // día 7 bonus

export interface DailyRewardAPI {
  getStreak: () => number;
  getLastClaimDate: () => string | null;
  canClaimToday: () => boolean;
  claim: () => { coins: number; dayIndex: number } | null;
  load: () => Promise<void>;
}

export function createDailyRewardService(): DailyRewardAPI {
  let lastClaimDate: string | null = null;
  let streak = 0;

  function todayKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  async function save() {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      if (lastClaimDate) await AsyncStorage.setItem(STORAGE_KEYS.lastClaimDate, lastClaimDate);
      await AsyncStorage.setItem(STORAGE_KEYS.streak, String(streak));
    } catch {}
  }

  return {
    getStreak: () => streak,
    getLastClaimDate: () => lastClaimDate,
    canClaimToday() {
      return lastClaimDate !== todayKey();
    },
    claim() {
      const today = todayKey();
      if (lastClaimDate === today) return null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
      if (lastClaimDate === yesterdayKey) streak += 1;
      else if (lastClaimDate !== today) streak = 1;
      lastClaimDate = today;
      const dayIndex = Math.min(streak - 1, 6);
      const coins = COINS_BY_DAY[dayIndex] ?? COINS_BY_DAY[6];
      save();
      return { coins, dayIndex };
    },
    async load() {
      try {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        lastClaimDate = await AsyncStorage.getItem(STORAGE_KEYS.lastClaimDate);
        const s = await AsyncStorage.getItem(STORAGE_KEYS.streak);
        if (s != null) streak = parseInt(s, 10) || 0;
      } catch {
        lastClaimDate = null;
        streak = 0;
      }
    },
  };
}
