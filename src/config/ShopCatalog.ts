/**
 * Catálogo tienda: skins y trails con precio en monedas.
 */

export interface ShopItem {
  id: string;
  name: string;
  type: 'skin' | 'trail';
  price: number;
}

export const SHOP_CATALOG: ShopItem[] = [
  { id: 'default', name: 'Neón', type: 'skin', price: 0 },
  { id: 'military', name: 'Militar', type: 'skin', price: 120 },
  { id: 'fire', name: 'Fuego', type: 'skin', price: 200 },
  { id: 'ice', name: 'Hielo', type: 'skin', price: 150 },
  { id: 'toxic', name: 'Tóxico', type: 'skin', price: 180 },
  { id: 'none', name: 'Sin estela', type: 'trail', price: 0 },
  { id: 'trail_blue', name: 'Estela azul', type: 'trail', price: 80 },
  { id: 'trail_rainbow', name: 'Arcoíris', type: 'trail', price: 250 },
];
