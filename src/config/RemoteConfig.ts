/**
 * Remote config layer — feature flags and balance variables. Fetches from BackendAdapter when provided.
 */

import type { GameConfig } from '../core/types';
import { DEFAULT_CONFIG } from '../core/constants';
import type { BackendAdapter } from '../services/BackendAdapter';

export interface RemoteConfigAPI {
  getGameConfig: () => GameConfig;
  getFlag: (key: string) => boolean;
  getNumber: (key: string, fallback: number) => number;
  refresh: () => Promise<void>;
}

const CONFIG_KEYS: (keyof GameConfig)[] = [
  'width', 'height', 'targetFps', 'spawnIntervalMs', 'baseThreatSpeed',
  'speedIncrementPerSecond', 'nearMissThresholdPx', 'nearMissSlowMoScale',
];

export function createRemoteConfig(backend?: BackendAdapter | null): RemoteConfigAPI {
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
      if (!backend) return;
      try {
        const remote = await backend.getRemoteConfig();
        for (const [key, value] of Object.entries(remote)) {
          if (typeof value === 'boolean') flags[key] = value;
          else if (typeof value === 'number') numbers[key] = value;
        }
        const cfg = config as Record<string, number>;
        for (const k of CONFIG_KEYS) {
          const v = remote[k as string];
          if (typeof v === 'number' && Number.isFinite(v)) cfg[k] = v;
        }
      } catch {
        // keep current config/flags on error
      }
    },
  };
}
