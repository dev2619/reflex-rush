/**
 * Entry — game screen, runner lifecycle, economy, missions, analytics.
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { GameScreen } from '../src/ui/GameScreen';
import { createGameRunner } from '../src/engine/GameRunner';
import { DEFAULT_CONFIG, REVIVE_COST_COINS } from '../src/core/constants';
import { useGame } from '../src/context/GameContext';
import { setAnalyticsProvider, logEvent, mockProvider } from '../src/analytics/AnalyticsLayer';
import { createAdsHooks } from '../src/monetization/AdsHooks';
import type { GameRunnerState } from '../src/engine/GameRunner';

const { width, height } = Dimensions.get('window');
const config = {
  ...DEFAULT_CONFIG,
  width: Math.max(1, width || 400),
  height: Math.max(1, height || 800),
};

export default function Home() {
  const router = useRouter();
  const { economy, missions } = useGame();
  const ads = useMemo(() => createAdsHooks(), []);

  const [state, setState] = useState<GameRunnerState>({
    status: 'idle',
    player: null,
    threats: [],
    score: 0,
    coinsThisRun: 0,
    deathReason: null,
    slowMoUntil: 0,
  });
  const [coins, setCoins] = useState(economy.getCoins());

  useFocusEffect(
    useCallback(() => {
      setCoins(economy.getCoins());
    }, [economy])
  );

  useEffect(() => {
    setAnalyticsProvider(mockProvider);
    logEvent('session_start');
  }, []);

  const onStateChange = useCallback(
    (s: GameRunnerState) => {
      setState(s);
      if (s.status === 'gameover') {
        if (s.coinsThisRun > 0) economy.addCoins(s.coinsThisRun);
        economy.save();
        setCoins(economy.getCoins());
        missions.recordRun();
        missions.recordScore(s.score);
        missions.save();
        logEvent('run_end', { score: s.score, death_reason: s.deathReason ?? 'unknown' });
      }
      if (s.status === 'playing' && s.player) {
        logEvent('run_start');
      }
    },
    [economy, missions]
  );

  const gameRunner = useMemo(
    () =>
      createGameRunner(config, {
        onStateChange,
        onDeath: (reason) => logEvent('death_reason', { reason }),
        onRetry: () => logEvent('retry'),
      }),
    [onStateChange]
  );

  const onReviveWithCoins = useCallback(() => {
    if (economy.getCoins() < REVIVE_COST_COINS) return false;
    economy.spendCoins(REVIVE_COST_COINS);
    economy.save();
    gameRunner.startRun();
    return true;
  }, [economy, gameRunner]);

  const onReviveWithAd = useCallback(async () => {
    const ok = await ads.showRewarded();
    if (ok) gameRunner.startRun();
    return ok;
  }, [ads, gameRunner]);

  return (
    <GameScreen
      gameRunner={gameRunner}
      state={state}
      config={config}
      coins={coins}
      onNavigateShop={() => router.push('/shop')}
      onNavigateMissions={() => router.push('/missions')}
      onNavigateLeaderboard={() => router.push('/leaderboard')}
      onReviveWithCoins={onReviveWithCoins}
      onReviveWithAd={onReviveWithAd}
    />
  );
}
