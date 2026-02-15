/**
 * Entry — game screen, runner lifecycle, economy, missions, analytics, interstitial, retention, leaderboard.
 */

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { GameScreen } from '../src/ui/GameScreen';
import { createGameRunner } from '../src/engine/GameRunner';
import { DEFAULT_CONFIG, REVIVE_COST_COINS } from '../src/core/constants';
import { useGame } from '../src/context/GameContext';
import { setAnalyticsProvider, logEvent, mockProvider } from '../src/analytics/AnalyticsLayer';
import { createAdsHooks } from '../src/monetization/AdsHooks';
import type { GameRunnerState } from '../src/engine/GameRunner';

const FIRST_OPEN_KEY = '@reflex_rush/first_open_ts';
const INTERSTITIAL_EVERY_N_GAMES = 2;

const { width, height } = Dimensions.get('window');
const config = {
  ...DEFAULT_CONFIG,
  width: Math.max(1, width || 400),
  height: Math.max(1, height || 800),
};

export default function Home() {
  const router = useRouter();
  const { economy, missions, backend, consent, iap, events, meta } = useGame();
  const ads = useMemo(() => createAdsHooks(), []);
  const gamesSinceInterstitial = useRef(0);
  const canShowAds = Boolean(consent?.ads && !iap.hasPurchased('remove_ads'));

  const [state, setState] = useState<GameRunnerState>({
    status: 'idle',
    fleet: [],
    projectiles: [],
    destructibles: [],
    powerups: [],
    coins: [],
    score: 0,
    coinsThisRun: 0,
    deathReason: null,
    targetX: 0,
    targetY: 0,
    weaponPattern: 'single',
    magnetMult: 1,
    fireRateMult: 1,
    enemyProjectiles: [],
    hitStopUntil: 0,
    floatTexts: [],
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
    (async () => {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      let first = await AsyncStorage.getItem(FIRST_OPEN_KEY);
      if (!first) {
        first = String(Date.now());
        await AsyncStorage.setItem(FIRST_OPEN_KEY, first);
      }
      const firstTs = parseInt(first, 10) || Date.now();
      const day = Math.floor((Date.now() - firstTs) / 86400000);
      logEvent('retention_day', { day });
    })();
  }, []);

  const onStateChange = useCallback(
    (s: GameRunnerState) => {
      setState(s);
      if (s.status === 'gameover') {
        if (s.coinsThisRun > 0) {
          events.getActiveEvent().then((event) => {
            const mult = event?.coinMultiplier ?? 1;
            economy.addCoins(Math.round(s.coinsThisRun * mult));
            economy.save();
            setCoins(economy.getCoins());
          }).catch(() => {
            economy.addCoins(s.coinsThisRun);
            economy.save();
            setCoins(economy.getCoins());
          });
        } else {
          economy.save();
          setCoins(economy.getCoins());
        }
        missions.recordRun();
        missions.recordScore(s.score);
        missions.save();
        logEvent('run_end', { score: s.score, death_reason: s.deathReason ?? 'unknown' });
        backend.submitScore(s.score).catch(() => {});
        gamesSinceInterstitial.current += 1;
        if (canShowAds && gamesSinceInterstitial.current >= INTERSTITIAL_EVERY_N_GAMES) {
          gamesSinceInterstitial.current = 0;
          ads.showInterstitial().catch(() => {});
        }
      }
      if (s.status === 'playing' && s.fleet?.length) {
        logEvent('run_start');
      }
    },
    [economy, missions, backend, canShowAds, ads, events]
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
    if (ok) {
      logEvent('ad_watch');
      gameRunner.startRun();
    }
    return ok;
  }, [ads, gameRunner]);

  return (
    <GameScreen
      gameRunner={gameRunner}
      state={state}
      config={config}
      coins={coins}
      equippedSkinId={meta.getEquippedSkin()}
      onNavigateShop={() => router.push('/shop')}
      onNavigateMissions={() => router.push('/missions')}
      onNavigateLeaderboard={() => router.push('/leaderboard')}
      onReviveWithCoins={onReviveWithCoins}
      onReviveWithAd={canShowAds ? onReviveWithAd : undefined}
    />
  );
}
