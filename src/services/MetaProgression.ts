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
}

const DEFAULT_SKIN: SkinId = 'default';
const DEFAULT_TRAIL: TrailId = 'none';

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
  };
}
