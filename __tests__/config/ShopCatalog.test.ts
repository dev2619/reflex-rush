/**
 * TDD: ShopCatalog — ítems con tipo y precio.
 */

import { SHOP_CATALOG } from '../../src/config/ShopCatalog';

describe('ShopCatalog', () => {
  it('has skins and trails', () => {
    const skins = SHOP_CATALOG.filter((i) => i.type === 'skin');
    const trails = SHOP_CATALOG.filter((i) => i.type === 'trail');
    expect(skins.length).toBeGreaterThan(0);
    expect(trails.length).toBeGreaterThan(0);
  });

  it('default skin has price 0', () => {
    const defaultSkin = SHOP_CATALOG.find((i) => i.id === 'default' && i.type === 'skin');
    expect(defaultSkin).toBeDefined();
    expect(defaultSkin!.price).toBe(0);
  });

  it('every item has id, name, type, price', () => {
    for (const item of SHOP_CATALOG) {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(['skin', 'trail']).toContain(item.type);
      expect(typeof item.price).toBe('number');
      expect(item.price).toBeGreaterThanOrEqual(0);
    }
  });
});
