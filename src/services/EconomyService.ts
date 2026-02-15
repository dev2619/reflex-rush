/**
 * Economy service — coins, persist (async storage), spend/earn.
 */

export interface EconomyServiceAPI {
  getCoins: () => number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  load: () => Promise<void>;
  save: () => Promise<void>;
}

const STORAGE_KEY = 'reflex_rush_coins';

export function createEconomyService(): EconomyServiceAPI {
  let coins = 0;

  return {
    getCoins: () => coins,
    addCoins(amount: number) {
      coins = Math.max(0, coins + amount);
    },
    spendCoins(amount: number) {
      if (coins < amount) return false;
      coins -= amount;
      return true;
    },
    async load() {
      try {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw != null) coins = parseInt(raw, 10) || 0;
      } catch {
        coins = 0;
      }
    },
    async save() {
      try {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem(STORAGE_KEY, String(coins));
      } catch {
        // ignore
      }
    },
  };
}
