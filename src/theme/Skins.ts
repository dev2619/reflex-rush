/**
 * Skins y texturas — paletas de colores + gradientes por skin.
 * Cada skin define colores base y variantes claras/oscuras para gradientes (sensación de volumen).
 */

export type SkinId = 'default' | 'military' | 'fire' | 'ice' | 'toxic';

export interface SkinColors {
  bg: string;
  star: string;
  ship: string;
  shipDark: string;
  shipCockpit: string;
  shipCockpitHighlight: string;
  laser: string;
  laserEnd: string;
  meteor: string;
  meteorLight: string;
  block: string;
  blockDark: string;
  enemy: string;
  enemyLight: string;
  coin: string;
  coinHighlight: string;
  powerupShip: string;
  powerupShipLight: string;
  powerupShield: string;
  powerupShieldLight: string;
  powerupWeapon: string;
  powerupWeaponLight: string;
  powerupMagnet: string;
  powerupMagnetLight: string;
  shieldBubble: string;
  enemyProjectile: string;
  enemyProjectileLight: string;
  text: string;
  textDim: string;
}

export interface SkinDef {
  id: SkinId;
  label: string;
  colors: SkinColors;
}

const SKINS: Record<SkinId, SkinDef> = {
  default: {
    id: 'default',
    label: 'Neon',
    colors: {
      bg: '#050510',
      star: '#a0c0ff',
      ship: '#00e5ff',
      shipDark: '#0088aa',
      shipCockpit: '#88eeff',
      shipCockpitHighlight: '#ccffff',
      laser: '#00ffff',
      laserEnd: '#0088cc',
      meteor: '#ff6644',
      meteorLight: '#ffaa88',
      block: '#ffaa22',
      blockDark: '#cc7700',
      enemy: '#ff3366',
      enemyLight: '#ff88aa',
      coin: '#ffdd00',
      coinHighlight: '#fff0aa',
      powerupShip: '#00ff88',
      powerupShipLight: '#88ffcc',
      powerupShield: '#0088ff',
      powerupShieldLight: '#66bbff',
      powerupWeapon: '#ff00aa',
      powerupWeaponLight: '#ff66cc',
      powerupMagnet: '#aa00ff',
      powerupMagnetLight: '#cc66ff',
      shieldBubble: 'rgba(0,136,255,0.35)',
      enemyProjectile: '#ff4444',
      enemyProjectileLight: '#ff8888',
      text: '#ffffff',
      textDim: '#8899aa',
    },
  },
  military: {
    id: 'military',
    label: 'Militar',
    colors: {
      bg: '#0a0e0a',
      star: '#6a8a6a',
      ship: '#7cb87c',
      shipDark: '#2d5a2d',
      shipCockpit: '#a8d4a8',
      shipCockpitHighlight: '#d0f0d0',
      laser: '#90ee90',
      laserEnd: '#2d5a2d',
      meteor: '#8b7355',
      meteorLight: '#c4a574',
      block: '#6b6b6b',
      blockDark: '#3d3d3d',
      enemy: '#b22222',
      enemyLight: '#dc5c5c',
      coin: '#daa520',
      coinHighlight: '#f0d878',
      powerupShip: '#228b22',
      powerupShipLight: '#5cb85c',
      powerupShield: '#4682b4',
      powerupShieldLight: '#7eb8e8',
      powerupWeapon: '#8b4513',
      powerupWeaponLight: '#c4723a',
      powerupMagnet: '#4b0082',
      powerupMagnetLight: '#7b4cb8',
      shieldBubble: 'rgba(70,130,180,0.4)',
      enemyProjectile: '#b22222',
      enemyProjectileLight: '#dc5c5c',
      text: '#e0e0e0',
      textDim: '#8a9a8a',
    },
  },
  fire: {
    id: 'fire',
    label: 'Fuego',
    colors: {
      bg: '#1a0805',
      star: '#ffaa66',
      ship: '#ff6600',
      shipDark: '#cc3300',
      shipCockpit: '#ffaa44',
      shipCockpitHighlight: '#ffdd88',
      laser: '#ff8800',
      laserEnd: '#ff2200',
      meteor: '#ff4400',
      meteorLight: '#ff8844',
      block: '#cc6600',
      blockDark: '#994400',
      enemy: '#ff0066',
      enemyLight: '#ff5599',
      coin: '#ffcc00',
      coinHighlight: '#ffee88',
      powerupShip: '#00cc66',
      powerupShipLight: '#44ee99',
      powerupShield: '#0088ff',
      powerupShieldLight: '#55aaff',
      powerupWeapon: '#ff00aa',
      powerupWeaponLight: '#ff55cc',
      powerupMagnet: '#8800ff',
      powerupMagnetLight: '#aa66ff',
      shieldBubble: 'rgba(255,100,0,0.35)',
      enemyProjectile: '#ff2222',
      enemyProjectileLight: '#ff6666',
      text: '#fff0e0',
      textDim: '#aa9988',
    },
  },
  ice: {
    id: 'ice',
    label: 'Hielo',
    colors: {
      bg: '#050a12',
      star: '#aaccff',
      ship: '#88ccff',
      shipDark: '#4488cc',
      shipCockpit: '#bbddff',
      shipCockpitHighlight: '#eef5ff',
      laser: '#aaddff',
      laserEnd: '#4488cc',
      meteor: '#6688aa',
      meteorLight: '#99aacc',
      block: '#5599bb',
      blockDark: '#336688',
      enemy: '#cc6688',
      enemyLight: '#ee99aa',
      coin: '#88ddff',
      coinHighlight: '#cceeff',
      powerupShip: '#00aacc',
      powerupShipLight: '#66ddff',
      powerupShield: '#4488ff',
      powerupShieldLight: '#88aaff',
      powerupWeapon: '#aa44ff',
      powerupWeaponLight: '#cc88ff',
      powerupMagnet: '#8844ff',
      powerupMagnetLight: '#aa88ff',
      shieldBubble: 'rgba(68,136,255,0.35)',
      enemyProjectile: '#cc6688',
      enemyProjectileLight: '#ee99aa',
      text: '#e8f0ff',
      textDim: '#8899aa',
    },
  },
  toxic: {
    id: 'toxic',
    label: 'Tóxico',
    colors: {
      bg: '#051005',
      star: '#88ff88',
      ship: '#00ff66',
      shipDark: '#00aa44',
      shipCockpit: '#66ff99',
      shipCockpitHighlight: '#aaffcc',
      laser: '#00ff88',
      laserEnd: '#00cc55',
      meteor: '#88ff00',
      meteorLight: '#bbff66',
      block: '#44aa22',
      blockDark: '#226611',
      enemy: '#ff00aa',
      enemyLight: '#ff66cc',
      coin: '#ccff00',
      coinHighlight: '#eeff88',
      powerupShip: '#00ffaa',
      powerupShipLight: '#66ffcc',
      powerupShield: '#00aaff',
      powerupShieldLight: '#66ccff',
      powerupWeapon: '#ff6600',
      powerupWeaponLight: '#ffaa66',
      powerupMagnet: '#aa00ff',
      powerupMagnetLight: '#cc66ff',
      shieldBubble: 'rgba(0,255,136,0.35)',
      enemyProjectile: '#ff00aa',
      enemyProjectileLight: '#ff66cc',
      text: '#ddffdd',
      textDim: '#88aa88',
    },
  },
};

export function getSkinTheme(skinId: string): SkinColors {
  const id = (skinId in SKINS ? skinId : 'default') as SkinId;
  return SKINS[id].colors;
}

export function getSkinLabel(skinId: string): string {
  const id = (skinId in SKINS ? skinId : 'default') as SkinId;
  return SKINS[id].label;
}

export function getAllSkins(): SkinDef[] {
  return Object.values(SKINS);
}

export function getDefaultSkinId(): SkinId {
  return 'default';
}
