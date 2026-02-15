/**
 * Lootboxes cosméticas — gastar monedas, recompensa aleatoria (skin/trail id).
 */

import type { ShopItem } from '../config/ShopCatalog';

const COST_COINS = 30;
const FALLBACK_IDS = ['default', 'neon', 'fire', 'ice', 'none', 'trail_blue', 'trail_rainbow'];

export interface LootboxResult {
  success: boolean;
  reward?: string; // cosmetic id
  cost: number;
}

export interface LootboxServiceAPI {
  openCost: () => number;
  open: (currentCoins: number, items: ShopItem[]) => LootboxResult;
}

export function createLootboxService(): LootboxServiceAPI {
  return {
    openCost: () => COST_COINS,
    open(currentCoins: number, items: ShopItem[]) {
      if (currentCoins < COST_COINS) return { success: false, cost: COST_COINS };
      const pool = items.length > 0 ? items.map((i) => i.id) : FALLBACK_IDS;
      const reward = pool[Math.floor(Math.random() * pool.length)];
      return { success: true, reward, cost: COST_COINS };
    },
  };
}
