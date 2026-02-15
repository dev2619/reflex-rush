/**
 * Contexto global: economía, meta, daily, misiones. Una sola instancia.
 */

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { createEconomyService } from '../services/EconomyService';
import { createMetaProgression } from '../services/MetaProgression';
import { createDailyRewardService } from '../services/DailyRewardService';
import { createMissionService } from '../services/MissionService';
import type { EconomyServiceAPI } from '../services/EconomyService';
import type { MetaProgressionAPI } from '../services/MetaProgression';
import type { DailyRewardAPI } from '../services/DailyRewardService';
import type { MissionServiceAPI } from '../services/MissionService';

interface GameContextValue {
  economy: EconomyServiceAPI;
  meta: MetaProgressionAPI;
  daily: DailyRewardAPI;
  missions: MissionServiceAPI;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({
    economy: createEconomyService(),
    meta: createMetaProgression(),
    daily: createDailyRewardService(),
    missions: createMissionService(),
  }), []);

  useEffect(() => {
    value.economy.load();
    value.meta.load();
    value.daily.load();
    value.missions.load();
  }, [value]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
