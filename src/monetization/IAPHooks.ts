/**
 * IAP hooks — remove ads, starter pack, skins, coin packs. Mock for dev.
 */

export type ProductId =
  | 'remove_ads'
  | 'starter_pack'
  | 'skin_premium_1'
  | 'coins_small'
  | 'coins_medium'
  | 'coins_large';

export interface IAPHooksAPI {
  getProducts: () => Promise<{ id: ProductId; price: string; title: string }[]>;
  purchase: (productId: ProductId) => Promise<boolean>;
  restore: () => Promise<void>;
  hasPurchased: (productId: ProductId) => boolean;
}

export function createIAPHooks(): IAPHooksAPI {
  const purchased = new Set<ProductId>();

  return {
    async getProducts() {
      return [];
    },
    async purchase(productId: ProductId) {
      if (__DEV__) {
        purchased.add(productId);
        return true;
      }
      return false;
    },
    async restore() {},
    hasPurchased(productId: ProductId) {
      return purchased.has(productId);
    },
  };
}
