/**
 * Game screen — full-screen play area, swipe gestures, score, retry.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withTiming, runOnJS, useSharedValue } from 'react-native-reanimated';
import type { GameRunnerAPI, GameRunnerState } from '../engine/GameRunner';
import type { GameConfig } from '../core/types';
import { DeathParticles } from './DeathParticles';

const THREAT_COLORS = ['#ff3366', '#ffaa00', '#aa66ff'] as const;
const JUMP_OFFSET_Y = -20;
const LANE_ANIM_DURATION = 120;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_MIN = 40;

const REVIVE_COST = 50;

interface GameScreenProps {
  gameRunner: GameRunnerAPI;
  state: GameRunnerState;
  config: GameConfig;
  coins?: number;
  onNavigateShop?: () => void;
  onNavigateMissions?: () => void;
  onNavigateLeaderboard?: () => void;
  onReviveWithCoins?: () => boolean;
  onReviveWithAd?: () => Promise<boolean>;
}

function resolveSwipe(dx: number, dy: number): 'left' | 'right' | 'up' | 'down' {
  if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  if (Math.abs(dy) >= SWIPE_MIN) return dy > 0 ? 'down' : 'up';
  return 'left';
}

export function GameScreen({
  gameRunner,
  state,
  config,
  coins = 0,
  onNavigateShop,
  onNavigateMissions,
  onNavigateLeaderboard,
  onReviveWithCoins,
  onReviveWithAd,
}: GameScreenProps) {
  const [revivingAd, setRevivingAd] = React.useState(false);
  const [particleBurst, setParticleBurst] = React.useState<{ x: number; y: number } | null>(null);
  const prevStatus = useRef(state.status);
  const gw = config.width || SCREEN_WIDTH;
  const gh = config.height || SCREEN_HEIGHT;
  const scaleX = SCREEN_WIDTH / gw;
  const scaleY = SCREEN_HEIGHT / gh;
  const now = Date.now();
  const isSlowMo = state.slowMoUntil > now;
  const jumpOffsetY = state.playerJumpUntil > now ? JUMP_OFFSET_Y : 0;
  const isDashing = state.playerDashUntil > now;

  const playerX = useSharedValue(state.player?.bounds?.x ?? 0);
  useEffect(() => {
    if (state.player?.bounds != null) playerX.value = state.player.bounds.x;
  }, [state.player?.bounds?.x, playerX]);
  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(playerX.value, { duration: LANE_ANIM_DURATION }) }],
  }));
  useEffect(() => {
    if (prevStatus.current === 'playing' && state.status === 'gameover' && state.player?.bounds) {
      const b = state.player.bounds;
      const originX = (SCREEN_WIDTH - gw * scaleX) / 2;
      const originY = (SCREEN_HEIGHT - gh * scaleY) / 2;
      setParticleBurst({
        x: originX + (b.x + b.width / 2) * scaleX,
        y: originY + (b.y + b.height / 2) * scaleY,
      });
    }
    prevStatus.current = state.status;
  }, [state.status, state.player?.bounds, gw, gh, scaleX, scaleY]);
  const handleSwipe = useCallback(
    (dx: number, dy: number) => {
      if (state.status !== 'playing') return;
      if (Math.hypot(dx, dy) < SWIPE_MIN) return;
      gameRunner.onSwipe(resolveSwipe(dx, dy));
    },
    [gameRunner, state.status]
  );

  useEffect(() => () => gameRunner.destroy(), [gameRunner]);

  const pan = Gesture.Pan()
    .minDistance(15)
    .onEnd((e) => {
      'worklet';
      runOnJS(handleSwipe)(e.translationX, e.translationY);
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.container}>
        <View style={styles.canvas}>
          <View
            style={[
              styles.world,
              {
                width: gw,
                height: gh,
                transform: [{ scaleX }, { scaleY }],
              },
            ]}
            collapsable={false}
          >
            {state.player && state.player.bounds && (
              <Animated.View
                style={[
                  styles.player,
                  {
                    left: 0,
                    top: state.player.bounds.y + jumpOffsetY,
                    width: state.player.bounds.width,
                    height: state.player.bounds.height,
                  },
                  playerAnimatedStyle,
                  isDashing && styles.playerDash,
                ]}
              />
            )}
            {(state.threats ?? []).map((t) =>
              t?.bounds ? (
                <View
                  key={t.id}
                  style={[
                    styles.threat,
                    {
                      left: t.bounds.x,
                      top: t.bounds.y,
                      width: t.bounds.width,
                      height: t.bounds.height,
                      backgroundColor: THREAT_COLORS[t.threatVariant ?? 0] ?? THREAT_COLORS[0],
                    },
                  ]}
                />
              ) : null
            )}
          </View>
        </View>

        {/* HUD: durante partida no bloquea toques */}
        {state.status === 'playing' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Text style={styles.score}>{state.score}</Text>
            {isSlowMo && <View style={styles.slowMoVignette} />}
          </View>
        )}

        {particleBurst && state.status === 'gameover' && (
          <DeathParticles
            visible
            center={particleBurst}
            onEnd={() => setParticleBurst(null)}
          />
        )}
        {state.status === 'gameover' && (
          <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
            <Text style={styles.score}>{state.score}</Text>
            <View style={styles.overlayContent}>
              <Text style={styles.gameOver}>GAME OVER</Text>
              <Text style={styles.finalScore}>{state.score} pts</Text>
              {onReviveWithCoins && coins >= REVIVE_COST && (
                <Pressable
                  style={({ pressed }) => [styles.reviveBtn, pressed && styles.retryPressed]}
                  onPress={() => onReviveWithCoins()}
                >
                  <Text style={styles.reviveBtnText}>Revivir ({REVIVE_COST} 🪙)</Text>
                </Pressable>
              )}
              {onReviveWithAd && (
                <Pressable
                  style={[styles.reviveBtn, styles.reviveAdBtn, revivingAd && styles.btnDisabled]}
                  onPress={async () => {
                    setRevivingAd(true);
                    await onReviveWithAd();
                    setRevivingAd(false);
                  }}
                  disabled={revivingAd}
                >
                  <Text style={styles.reviveBtnText}>{revivingAd ? '...' : 'Ver anuncio para revivir'}</Text>
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
                onPress={() => gameRunner.retry()}
              >
                <Text style={styles.retryText}>RETRY</Text>
              </Pressable>
            </View>
          </View>
        )}

        {state.status === 'idle' && (
          <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
            <View style={styles.overlayContent}>
              {(onNavigateShop != null || onNavigateMissions != null || onNavigateLeaderboard != null) && (
                <View style={styles.navRow}>
                  {onNavigateShop != null && (
                    <Pressable style={styles.navBtn} onPress={onNavigateShop}>
                      <Text style={styles.navBtnText}>🛒 Tienda</Text>
                    </Pressable>
                  )}
                  {onNavigateMissions != null && (
                    <Pressable style={styles.navBtn} onPress={onNavigateMissions}>
                      <Text style={styles.navBtnText}>📋 Misiones</Text>
                    </Pressable>
                  )}
                  {onNavigateLeaderboard != null && (
                    <Pressable style={styles.navBtn} onPress={onNavigateLeaderboard}>
                      <Text style={styles.navBtnText}>🏆 Ranking</Text>
                    </Pressable>
                  )}
                </View>
              )}
              <Text style={styles.instructions}>Swipe left or right to dodge</Text>
              <Text style={styles.instructionsSub}>Tap PLAY and avoid the red blocks</Text>
              <Pressable
                style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
                onPress={() => gameRunner.startRun()}
              >
                <Text style={styles.retryText}>PLAY</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  world: {
    position: 'absolute',
    overflow: 'hidden',
  },
  player: {
    position: 'absolute',
    backgroundColor: '#00ff88',
    borderRadius: 8,
  },
  playerDash: {
    opacity: 0.85,
    borderWidth: 2,
    borderColor: '#00ffff',
  },
  threat: {
    position: 'absolute',
    backgroundColor: '#ff3366',
    borderRadius: 6,
  },
  slowMoVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(100,50,255,0.15)',
    borderRadius: 999,
  },
  score: {
    position: 'absolute',
    top: 56,
    left: 24,
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsSub: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 28,
    textAlign: 'center',
  },
  gameOver: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 24,
  },
  navRow: { flexDirection: 'row', marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' },
  navBtn: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#00ff88', borderRadius: 10, marginHorizontal: 6 },
  navBtnText: { color: '#0a0a0f', fontSize: 16, fontWeight: '700' },
  reviveBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#1a1a2e', borderRadius: 10, marginBottom: 10 },
  reviveBtnText: { color: '#fff', fontWeight: '600' },
  reviveAdBtn: { backgroundColor: '#333' },
  btnDisabled: { opacity: 0.6 },
  retry: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: '#00ff88',
    borderRadius: 12,
  },
  retryPressed: { opacity: 0.8 },
  retryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a0a0f',
  },
});
