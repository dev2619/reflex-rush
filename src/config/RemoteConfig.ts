/**
 * Remote config layer — feature flags and balance variables. Replace with Firebase/etc.
 */

import type { GameConfig } from '../core/types';
import { DEFAULT_CONFIG } from '../core/constants';

export interface RemoteConfigAPI {
  getGameConfig: () => GameConfig;
  getFlag: (key: string) => boolean;
  getNumber: (key: string, fallback: number) => number;
  refresh: () => Promise<void>;
}

export function createRemoteConfig(): RemoteConfigAPI {
  let config: GameConfig = { ...DEFAULT_CONFIG };
  const flags: Record<string, boolean> = {};
  const numbers: Record<string, number> = {};

  return {
    getGameConfig: () => ({ ...config }),
    getFlag(key: string) {
      return flags[key] ?? false;
    },
    getNumber(key: string, fallback: number) {
      return numbers[key] ?? fallback;
    },
    async refresh() {
      // TODO: fetch from backend; for now no-op
    },
  };
}
