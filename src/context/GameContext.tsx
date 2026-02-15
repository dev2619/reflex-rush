/**
 * Contexto global: economía, meta, daily, misiones, consent, backend, eventos, lootbox.
 */

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { createEconomyService } from '../services/EconomyService';
import { createMetaProgression } from '../services/MetaProgression';
import { createDailyRewardService } from '../services/DailyRewardService';
import { createMissionService } from '../services/MissionService';
import { createLootboxService } from '../services/LootboxService';
import { createEventService } from '../services/EventService';
import { createIAPHooks } from '../monetization/IAPHooks';
import { createRemoteConfig } from '../config/RemoteConfig';
import { mockBackendAdapter } from '../services/BackendAdapter';
import type { RemoteConfigAPI } from '../config/RemoteConfig';
import type { EconomyServiceAPI } from '../services/EconomyService';
import type { MetaProgressionAPI } from '../services/MetaProgression';
import type { DailyRewardAPI } from '../services/DailyRewardService';
import type { MissionServiceAPI } from '../services/MissionService';
import type { LootboxServiceAPI } from '../services/LootboxService';
import type { EventServiceAPI } from '../services/EventService';
import type { IAPHooksAPI } from '../monetization/IAPHooks';
import type { BackendAdapter } from '../services/BackendAdapter';
import type { ConsentState } from '../services/ConsentService';

const LOGIN_BONUS_COINS = 10;
const LOGIN_KEY = '@reflex_rush/last_login_date';

interface GameContextValue {
  economy: EconomyServiceAPI;
  meta: MetaProgressionAPI;
  daily: DailyRewardAPI;
  missions: MissionServiceAPI;
  lootbox: LootboxServiceAPI;
  events: EventServiceAPI;
  backend: BackendAdapter;
  iap: IAPHooksAPI;
  remoteConfig: RemoteConfigAPI;
  consent: ConsentState | null;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({
  children,
  consent = null,
}: {
  children: React.ReactNode;
  consent?: ConsentState | null;
}) {
  const value = useMemo(() => ({
    economy: createEconomyService(),
    meta: createMetaProgression(),
    daily: createDailyRewardService(),
    missions: createMissionService(),
    lootbox: createLootboxService(),
    events: createEventService(),
    backend: mockBackendAdapter,
    iap: createIAPHooks(),
    remoteConfig: createRemoteConfig(mockBackendAdapter),
    consent,
  }), [consent]);

  useEffect(() => {
    value.economy.load();
    value.meta.load();
    value.daily.load();
    value.missions.load();
    value.remoteConfig.refresh();
  }, [value]);

  useEffect(() => {
    const today = new Date().toDateString();
    import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) =>
      AsyncStorage.getItem(LOGIN_KEY).then((last) => {
        if (last !== today) {
          value.economy.addCoins(LOGIN_BONUS_COINS);
          value.economy.save();
          AsyncStorage.setItem(LOGIN_KEY, today);
        }
      })
    );
  }, [value.economy]);

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
