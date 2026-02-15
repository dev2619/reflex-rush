/**
 * Meta progression — skins, trails, effects. Cosmetic only, no pay-to-win.
 */

export type SkinId = string;
export type TrailId = string;
export type EffectId = string;

export interface MetaProgressionAPI {
  getEquippedSkin: () => SkinId;
  getEquippedTrail: () => TrailId;
  setEquippedSkin: (id: SkinId) => void;
  setEquippedTrail: (id: TrailId) => void;
  getUnlockedSkins: () => SkinId[];
  getUnlockedTrails: () => TrailId[];
  unlockSkin: (id: SkinId) => boolean;
  unlockTrail: (id: TrailId) => boolean;
  load: () => Promise<void>;
  save: () => Promise<void>;
}

const DEFAULT_SKIN: SkinId = 'default';
const DEFAULT_TRAIL: TrailId = 'none';
const STORAGE_KEY = 'reflex_rush_meta';

export function createMetaProgression(): MetaProgressionAPI {
  let equippedSkin: SkinId = DEFAULT_SKIN;
  let equippedTrail: TrailId = DEFAULT_TRAIL;
  const unlockedSkins = new Set<SkinId>([DEFAULT_SKIN]);
  const unlockedTrails = new Set<TrailId>([DEFAULT_TRAIL]);

  return {
    getEquippedSkin: () => equippedSkin,
    getEquippedTrail: () => equippedTrail,
    setEquippedSkin: (id) => {
      if (unlockedSkins.has(id)) equippedSkin = id;
    },
    setEquippedTrail: (id) => {
      if (unlockedTrails.has(id)) equippedTrail = id;
    },
    getUnlockedSkins: () => Array.from(unlockedSkins),
    getUnlockedTrails: () => Array.from(unlockedTrails),
    unlockSkin: (id) => {
      unlockedSkins.add(id);
      return true;
    },
    unlockTrail: (id) => {
      unlockedTrails.add(id);
      return true;
    },
    async load() {
      try {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.equippedSkin) equippedSkin = data.equippedSkin;
          if (data.equippedTrail) equippedTrail = data.equippedTrail;
          if (Array.isArray(data.unlockedSkins)) data.unlockedSkins.forEach((id: string) => unlockedSkins.add(id));
          if (Array.isArray(data.unlockedTrails)) data.unlockedTrails.forEach((id: string) => unlockedTrails.add(id));
        }
      } catch {}
    },
    async save() {
      try {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          equippedSkin,
          equippedTrail,
          unlockedSkins: Array.from(unlockedSkins),
          unlockedTrails: Array.from(unlockedTrails),
        }));
      } catch {}
    },
  };
}
