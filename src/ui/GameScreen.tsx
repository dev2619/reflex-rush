/**
 * Game screen — Space Swipe Shooter. Free 2D swipe, fleet, projectiles, destructibles, powerups, HUD.
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
import Animated, {
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useSharedValue,
} from 'react-native-reanimated';
import type { GameRunnerAPI, GameRunnerState } from '../engine/GameRunner';
import type { GameConfig } from '../core/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_MIN = 35;

// Space theme — neon sci-fi
const COLORS = {
  bg: '#050510',
  bgStar: 'rgba(120,160,255,0.4)',
  star: '#a0c0ff',
  ship: '#00e5ff',
  shipGlow: 'rgba(0,229,255,0.5)',
  laser: '#00ffff',
  laserTrail: 'rgba(0,255,255,0.4)',
  meteor: '#ff6644',
  block: '#ffaa22',
  enemy: '#ff3366',
  coin: '#ffdd00',
  powerupShip: '#00ff88',
  powerupShield: '#0088ff',
  powerupWeapon: '#ff00aa',
  powerupMagnet: '#aa00ff',
  shieldBubble: 'rgba(0,136,255,0.35)',
  text: '#ffffff',
  textDim: '#8899aa',
};

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
  const [screenShake, setScreenShake] = React.useState(0);
  const gw = config.width || SCREEN_WIDTH;
  const gh = config.height || SCREEN_HEIGHT;
  const scaleX = SCREEN_WIDTH / gw;
  const scaleY = SCREEN_HEIGHT / gh;
  const now = Date.now();
  const isHitStop = state.hitStopUntil > now;

  const shakeX = useSharedValue(0);
  useEffect(() => {
    if (isHitStop) {
      shakeX.value = withTiming(4, { duration: 20 }, () => {
        shakeX.value = withTiming(0, { duration: 30 });
      });
    }
  }, [isHitStop, shakeX]);

  const worldAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value * (Math.random() > 0.5 ? 1 : -1) }],
  }));

  const handleSwipe = useCallback(
    (dx: number, dy: number) => {
      if (state.status !== 'playing') return;
      if (Math.hypot(dx, dy) < SWIPE_MIN) return;
      gameRunner.onSwipeDelta(dx, dy);
    },
    [gameRunner, state.status]
  );

  useEffect(() => () => gameRunner.destroy(), [gameRunner]);

  const pan = Gesture.Pan()
    .minDistance(12)
    .onEnd((e) => {
      'worklet';
      runOnJS(handleSwipe)(e.translationX, e.translationY);
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.container}>
        {/* Space background + parallax stars */}
        <View style={[styles.canvas, StyleSheet.absoluteFill]}>
          <View style={[styles.spaceBg, { width: gw, height: gh }]}>
            {[...Array(40)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.star,
                  {
                    left: (i * 17 + (i % 3) * 31) % (gw - 4),
                    top: (i * 23 + (i % 5) * 19) % (gh - 4),
                    width: (i % 3) + 2,
                    height: (i % 3) + 2,
                    borderRadius: (i % 3) + 1,
                    opacity: 0.4 + (i % 4) * 0.15,
                  },
                ]}
              />
            ))}
          </View>

          <Animated.View
            style={[
              styles.world,
              {
                width: gw,
                height: gh,
                transform: [{ scaleX }, { scaleY }],
              },
              worldAnimatedStyle,
            ]}
            collapsable={false}
          >
            {/* Projectiles */}
            {state.projectiles.map((p) =>
              p?.bounds ? (
                <View
                  key={p.id}
                  style={[
                    styles.projectile,
                    {
                      left: p.bounds.x,
                      top: p.bounds.y,
                      width: p.bounds.width,
                      height: p.bounds.height,
                      backgroundColor: COLORS.laser,
                    },
                  ]}
                />
              ) : null
            )}

            {/* Destructibles */}
            {state.destructibles.map((d) => {
              if (!d.bounds) return null;
              const variant = d.destructibleVariant ?? 'meteor';
              const color =
                variant === 'meteor'
                  ? COLORS.meteor
                  : variant === 'block'
                    ? COLORS.block
                    : COLORS.enemy;
              const flash = d.hitFlashUntil && d.hitFlashUntil > now;
              return (
                <View
                  key={d.id}
                  style={[
                    styles.destructible,
                    {
                      left: d.bounds.x,
                      top: d.bounds.y,
                      width: d.bounds.width,
                      height: d.bounds.height,
                      backgroundColor: color,
                      borderWidth: flash ? 3 : 0,
                      borderColor: '#fff',
                    },
                  ]}
                />
              );
            })}

            {/* Powerups */}
            {state.powerups.map((pu) => {
              if (!pu.bounds) return null;
              const t = pu.powerupType ?? 'extra_ship';
              const color =
                t === 'extra_ship'
                  ? COLORS.powerupShip
                  : t === 'shield'
                    ? COLORS.powerupShield
                    : t === 'weapon_upgrade'
                      ? COLORS.powerupWeapon
                      : COLORS.powerupMagnet;
              return (
                <View
                  key={pu.id}
                  style={[
                    styles.powerup,
                    {
                      left: pu.bounds.x,
                      top: pu.bounds.y,
                      width: pu.bounds.width,
                      height: pu.bounds.height,
                      backgroundColor: color,
                      borderRadius: pu.bounds.width / 2,
                    },
                  ]}
                />
              );
            })}

            {/* Coins */}
            {state.coins.map((c) =>
              c?.bounds ? (
                <View
                  key={c.id}
                  style={[
                    styles.coin,
                    {
                      left: c.bounds.x,
                      top: c.bounds.y,
                      width: c.bounds.width,
                      height: c.bounds.height,
                      borderRadius: c.bounds.width / 2,
                      backgroundColor: COLORS.coin,
                    },
                  ]}
                />
              ) : null
            )}

            {/* Fleet: ships with shield bubble */}
            {state.fleet.map((ship) => (
              <View key={ship.id} style={styles.shipWrap}>
                {ship.shieldActive && (
                  <View
                    style={[
                      styles.shieldBubble,
                      {
                        left: ship.bounds.x - ship.bounds.width * 0.4,
                        top: ship.bounds.y - ship.bounds.height * 0.4,
                        width: ship.bounds.width * 1.8,
                        height: ship.bounds.height * 1.8,
                        borderRadius: ship.bounds.width * 0.9,
                        borderColor: COLORS.shieldBubble,
                      },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.ship,
                    {
                      left: ship.bounds.x,
                      top: ship.bounds.y,
                      width: 0,
                      height: 0,
                      borderLeftWidth: ship.bounds.width / 2,
                      borderRightWidth: ship.bounds.width / 2,
                      borderTopWidth: ship.bounds.height,
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderTopColor: COLORS.ship,
                    },
                  ]}
                />
              </View>
            ))}

            {/* Floating +N texts */}
            {state.floatTexts
              .filter((f) => f.until > now)
              .map((f, i) => (
                <Text
                  key={`ft-${i}-${f.until}`}
                  style={[
                    styles.floatText,
                    {
                      left: f.x - 20,
                      top: f.y - 12,
                      color: COLORS.coin,
                    },
                  ]}
                >
                  +{f.value}
                </Text>
              ))}
          </Animated.View>
        </View>

        {/* HUD */}
        {state.status === 'playing' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <View style={styles.hudTop} pointerEvents="none">
              <Text style={styles.coinsHud}>🪙 {coins}</Text>
              <Text style={styles.shipsHud}>🚀 {state.fleet.length}</Text>
              <Text style={styles.scoreHud}>{state.score}</Text>
            </View>
            <View style={styles.hudBottom} pointerEvents="box-none">
              <Pressable
                style={({ pressed }) => [styles.pauseBtn, pressed && styles.pauseBtnPressed]}
                onPress={() => {}}
              >
                <Text style={styles.pauseBtnText}>⏸</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Game over overlay */}
        {state.status === 'gameover' && (
          <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
            <Text style={styles.gameOverTitle}>GAME OVER</Text>
            <Text style={styles.finalScore}>{state.score} pts</Text>
            <Text style={styles.coinsEarned}>+{state.coinsThisRun} 🪙</Text>
            {onReviveWithCoins && coins >= 50 && (
              <Pressable
                style={({ pressed }) => [styles.reviveBtn, pressed && styles.retryPressed]}
                onPress={() => onReviveWithCoins()}
              >
                <Text style={styles.reviveBtnText}>Revivir (50 🪙)</Text>
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
                <Text style={styles.reviveBtnText}>
                  {revivingAd ? '...' : 'Ver anuncio para revivir'}
                </Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
              onPress={() => gameRunner.retry()}
            >
              <Text style={styles.retryText}>RETRY</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.menuBtn, pressed && styles.retryPressed]}
              onPress={() => gameRunner.goToMenu()}
            >
              <Text style={styles.menuBtnText}>Menú principal</Text>
            </Pressable>
          </View>
        )}

        {/* Idle / menu */}
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
              <Text style={styles.instructions}>Swipe to move • Survive • Collect coins</Text>
              <Text style={styles.instructionsSub}>Destroy meteors & enemies. Get more ships.</Text>
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
  container: { flex: 1, backgroundColor: COLORS.bg },
  canvas: { alignItems: 'center', justifyContent: 'center' },
  spaceBg: {
    position: 'absolute',
    backgroundColor: COLORS.bg,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    backgroundColor: COLORS.star,
  },
  world: {
    position: 'absolute',
    overflow: 'hidden',
    left: 0,
    top: 0,
  },
  projectile: {
    position: 'absolute',
    borderRadius: 2,
  },
  destructible: {
    position: 'absolute',
    borderRadius: 6,
  },
  powerup: {
    position: 'absolute',
  },
  coin: {
    position: 'absolute',
  },
  shipWrap: { position: 'absolute' },
  shieldBubble: {
    position: 'absolute',
    borderWidth: 2,
  },
  ship: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
  },
  floatText: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '800',
  },
  hudTop: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coinsHud: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  shipsHud: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  scoreHud: { fontSize: 24, fontWeight: '800', color: COLORS.ship },
  hudBottom: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  pauseBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtnPressed: { opacity: 0.8 },
  pauseBtnText: { fontSize: 22, color: COLORS.text },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: { alignItems: 'center', justifyContent: 'center' },
  instructions: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsSub: {
    fontSize: 14,
    color: COLORS.textDim,
    marginBottom: 24,
    textAlign: 'center',
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  finalScore: { fontSize: 20, color: COLORS.ship, marginBottom: 4 },
  coinsEarned: { fontSize: 16, color: COLORS.coin, marginBottom: 20 },
  navRow: {
    flexDirection: 'row',
    marginBottom: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  navBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.ship,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  navBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: '700' },
  reviveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    marginBottom: 10,
  },
  reviveBtnText: { color: COLORS.text, fontWeight: '600' },
  reviveAdBtn: { backgroundColor: 'rgba(255,255,255,0.1)' },
  btnDisabled: { opacity: 0.6 },
  retry: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: COLORS.ship,
    borderRadius: 12,
    marginBottom: 10,
  },
  retryPressed: { opacity: 0.8 },
  retryText: { fontSize: 18, fontWeight: '700', color: COLORS.bg },
  menuBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.textDim,
  },
  menuBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.textDim },
});
