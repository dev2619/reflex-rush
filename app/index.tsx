/**
 * Entry — single game screen, runner lifecycle, economy, analytics.
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { GameScreen } from '../src/ui/GameScreen';
import { createGameRunner } from '../src/engine/GameRunner';
import { DEFAULT_CONFIG } from '../src/core/constants';
import { createEconomyService } from '../src/services/EconomyService';
import { setAnalyticsProvider, logEvent, mockProvider } from '../src/analytics/AnalyticsLayer';
import type { GameRunnerState } from '../src/engine/GameRunner';

const { width, height } = Dimensions.get('window');
const config = {
  ...DEFAULT_CONFIG,
  width: Math.max(1, width || 400),
  height: Math.max(1, height || 800),
};

export default function Home() {
  const [state, setState] = useState<GameRunnerState>({
    status: 'idle',
    player: null,
    threats: [],
    score: 0,
    coinsThisRun: 0,
    deathReason: null,
    slowMoUntil: 0,
  });

  const economy = useMemo(() => createEconomyService(), []);

  useEffect(() => {
    setAnalyticsProvider(mockProvider);
    economy.load();
    logEvent('session_start');
  }, [economy]);

  const onStateChange = useCallback(
    (s: GameRunnerState) => {
      setState(s);
      if (s.status === 'gameover') {
        if (s.coinsThisRun > 0) economy.addCoins(s.coinsThisRun);
        economy.save();
        logEvent('run_end', { score: s.score, death_reason: s.deathReason ?? 'unknown' });
      }
      if (s.status === 'playing' && s.player) {
        logEvent('run_start');
      }
    },
    [economy]
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

  return (
    <GameScreen gameRunner={gameRunner} state={state} config={config} />
  );
}
