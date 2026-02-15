/**
 * Game screen — Space Swipe Shooter. Free 2D swipe, fleet, projectiles, destructibles, powerups, HUD.
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useSharedValue,
} from 'react-native-reanimated';
import type { GameRunnerAPI, GameRunnerState } from '../engine/GameRunner';
import type { GameConfig } from '../core/types';
import { getSkinTheme } from '../theme/Skins';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_MIN = 35;

interface GameScreenProps {
  gameRunner: GameRunnerAPI;
  state: GameRunnerState;
  config: GameConfig;
  coins?: number;
  /** Skin activo (id de MetaProgression). Define paleta y sensación de textura. */
  equippedSkinId?: string;
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
  equippedSkinId = 'default',
  onNavigateShop,
  onNavigateMissions,
  onNavigateLeaderboard,
  onReviveWithCoins,
  onReviveWithAd,
}: GameScreenProps) {
  const theme = useMemo(() => getSkinTheme(equippedSkinId), [equippedSkinId]);
  const [revivingAd, setRevivingAd] = React.useState(false);
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
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Fondo espacial con gradiente + estrellas */}
        <View style={[styles.canvas, StyleSheet.absoluteFill]}>
          <LinearGradient
            colors={[theme.bg, theme.bg + 'ee', theme.bg]}
            style={[styles.spaceBg, { width: gw, height: gh }]}
          >
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
                    backgroundColor: theme.star,
                    opacity: 0.4 + (i % 4) * 0.15,
                  },
                ]}
              />
            ))}
          </LinearGradient>

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
            {/* Láser jugador (gradiente vertical = sensación de haz) */}
            {state.projectiles.map((p) =>
              p?.bounds ? (
                <LinearGradient
                  key={p.id}
                  colors={[theme.laser, theme.laserEnd]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={[
                    styles.projectile,
                    {
                      left: p.bounds.x,
                      top: p.bounds.y,
                      width: p.bounds.width,
                      height: p.bounds.height,
                    },
                  ]}
                />
              ) : null
            )}

            {/* Proyectiles enemigos (gradiente, bajan lentos) */}
            {(state.enemyProjectiles ?? []).map((ep) =>
              ep?.bounds ? (
                <LinearGradient
                  key={ep.id}
                  colors={[theme.enemyProjectileLight, theme.enemyProjectile]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={[
                    styles.projectile,
                    {
                      left: ep.bounds.x,
                      top: ep.bounds.y,
                      width: ep.bounds.width,
                      height: ep.bounds.height,
                      borderRadius: 2,
                    },
                  ]}
                />
              ) : null
            )}

            {/* Obstáculos con gradiente (volumen) + detalle interior */}
            {state.destructibles.map((d) => {
              if (!d.bounds) return null;
              const variant = d.destructibleVariant ?? 'meteor';
              const colors =
                variant === 'meteor'
                  ? [theme.meteorLight, theme.meteor]
                  : variant === 'block'
                    ? [theme.block, theme.blockDark]
                    : [theme.enemyLight, theme.enemy];
              const flash = d.hitFlashUntil && d.hitFlashUntil > now;
              const { width: dw, height: dh } = d.bounds;
              return (
                <LinearGradient
                  key={d.id}
                  colors={colors as [string, string]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={[
                    styles.destructible,
                    {
                      left: d.bounds.x,
                      top: d.bounds.y,
                      width: dw,
                      height: dh,
                      borderWidth: flash ? 3 : 1,
                      borderColor: flash ? '#fff' : 'rgba(0,0,0,0.4)',
                    },
                  ]}
                >
                  {variant === 'meteor' && (
                    <View
                      style={[
                        styles.destructibleInner,
                        {
                          width: dw * 0.5,
                          height: dh * 0.55,
                          borderRadius: dw * 0.25,
                          backgroundColor: theme.meteorLight + '99',
                          left: dw * 0.25,
                          top: dh * 0.22,
                        },
                      ]}
                    />
                  )}
                  {variant === 'block' && (
                    <View
                      style={[
                        styles.destructibleInner,
                        {
                          width: dw * 0.6,
                          height: 2,
                          backgroundColor: 'rgba(0,0,0,0.35)',
                          left: dw * 0.2,
                          top: dh * 0.45,
                        },
                      ]}
                    />
                  )}
                  {variant === 'enemy' && (
                    <View
                      style={[
                        styles.destructibleInner,
                        {
                          width: dw * 0.35,
                          height: dh * 0.4,
                          borderRadius: dw * 0.2,
                          backgroundColor: theme.enemyLight + 'dd',
                          left: dw * 0.325,
                          top: dh * 0.3,
                          borderWidth: 1,
                          borderColor: 'rgba(0,0,0,0.25)',
                        },
                      ]}
                    />
                  )}
                </LinearGradient>
              );
            })}

            {/* Powerups con gradiente y brillo */}
            {state.powerups.map((pu) => {
              if (!pu.bounds) return null;
              const t = pu.powerupType ?? 'extra_ship';
              const [c1, c2] =
                t === 'extra_ship'
                  ? [theme.powerupShipLight, theme.powerupShip]
                  : t === 'shield'
                    ? [theme.powerupShieldLight, theme.powerupShield]
                    : t === 'weapon_upgrade'
                      ? [theme.powerupWeaponLight, theme.powerupWeapon]
                      : [theme.powerupMagnetLight, theme.powerupMagnet];
              const sz = pu.bounds.width;
              return (
                <LinearGradient
                  key={pu.id}
                  colors={[c1, c2] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.powerup,
                    {
                      left: pu.bounds.x,
                      top: pu.bounds.y,
                      width: sz,
                      height: sz,
                      borderRadius: sz / 2,
                      borderWidth: 2,
                      borderColor: 'rgba(255,255,255,0.7)',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.powerupInner,
                      {
                        width: sz * 0.5,
                        height: sz * 0.5,
                        borderRadius: sz * 0.25,
                        left: sz * 0.25,
                        top: sz * 0.25,
                        backgroundColor: 'rgba(255,255,255,0.35)',
                      },
                    ]}
                  />
                </LinearGradient>
              );
            })}

            {/* Monedas con gradiente (brillo) */}
            {state.coins.map((c) =>
              c?.bounds ? (
                <LinearGradient
                  key={c.id}
                  colors={[theme.coinHighlight, theme.coin] as [string, string]}
                  start={{ x: 0.2, y: 0.2 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.coin,
                    {
                      left: c.bounds.x,
                      top: c.bounds.y,
                      width: c.bounds.width,
                      height: c.bounds.height,
                      borderRadius: c.bounds.width / 2,
                      borderWidth: 1,
                      borderColor: theme.coinHighlight + 'cc',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.coinInner,
                      {
                        width: c.bounds.width * 0.4,
                        height: c.bounds.height * 0.4,
                        borderRadius: c.bounds.width * 0.2,
                        left: c.bounds.width * 0.3,
                        top: c.bounds.height * 0.3,
                        backgroundColor: theme.coinHighlight + '99',
                      },
                    ]}
                  />
                </LinearGradient>
              ) : null
            )}

            {/* Fleet: naves con gradiente en cuerpo (triángulo) y cockpit */}
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
                        borderColor: theme.shieldBubble,
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
                      borderTopColor: theme.ship,
                    },
                  ]}
                />
                <LinearGradient
                  colors={[theme.shipCockpitHighlight, theme.shipCockpit] as [string, string]}
                  start={{ x: 0.3, y: 0 }}
                  end={{ x: 0.7, y: 1 }}
                  style={[
                    styles.shipCockpit,
                    {
                      left: ship.bounds.x + ship.bounds.width * 0.3,
                      top: ship.bounds.y + ship.bounds.height * 0.35,
                      width: ship.bounds.width * 0.4,
                      height: ship.bounds.height * 0.4,
                      borderRadius: ship.bounds.width * 0.2,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.6)',
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
                        color: theme.coin,
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
              <Text style={[styles.coinsHud, { color: theme.text }]}>🪙 {coins}</Text>
              <Text style={[styles.shipsHud, { color: theme.text }]}>🚀 {state.fleet.length}</Text>
              <Text style={[styles.scoreHud, { color: theme.ship }]}>{state.score}</Text>
            </View>
            <View style={styles.hudBottom} pointerEvents="box-none">
              <Pressable
                style={({ pressed }) => [styles.pauseBtn, pressed && styles.pauseBtnPressed]}
                onPress={() => {}}
              >
                <Text style={[styles.pauseBtnText, { color: theme.text }]}>⏸</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Game over overlay */}
        {state.status === 'gameover' && (
          <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
            <Text style={[styles.gameOverTitle, { color: theme.text }]}>GAME OVER</Text>
            <Text style={[styles.finalScore, { color: theme.ship }]}>{state.score} pts</Text>
            <Text style={[styles.coinsEarned, { color: theme.coin }]}>+{state.coinsThisRun} 🪙</Text>
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
              style={({ pressed }) => [styles.retry, { backgroundColor: theme.ship }, pressed && styles.retryPressed]}
              onPress={() => gameRunner.retry()}
            >
              <Text style={[styles.retryText, { color: theme.bg }]}>RETRY</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.menuBtn, { borderColor: theme.textDim }, pressed && styles.retryPressed]}
              onPress={() => gameRunner.goToMenu()}
            >
              <Text style={[styles.menuBtnText, { color: theme.textDim }]}>Menú principal</Text>
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
                    <Pressable style={[styles.navBtn, { backgroundColor: theme.ship }]} onPress={onNavigateShop}>
                      <Text style={[styles.navBtnText, { color: theme.bg }]}>🛒 Tienda</Text>
                    </Pressable>
                  )}
                  {onNavigateMissions != null && (
                    <Pressable style={[styles.navBtn, { backgroundColor: theme.ship }]} onPress={onNavigateMissions}>
                      <Text style={[styles.navBtnText, { color: theme.bg }]}>📋 Misiones</Text>
                    </Pressable>
                  )}
                  {onNavigateLeaderboard != null && (
                    <Pressable style={[styles.navBtn, { backgroundColor: theme.ship }]} onPress={onNavigateLeaderboard}>
                      <Text style={[styles.navBtnText, { color: theme.bg }]}>🏆 Ranking</Text>
                    </Pressable>
                  )}
                </View>
              )}
              <Text style={[styles.instructions, { color: theme.text }]}>Swipe to move • Survive • Collect coins</Text>
              <Text style={[styles.instructionsSub, { color: theme.textDim }]}>Destroy meteors & enemies. Get more ships.</Text>
              <Pressable
                style={({ pressed }) => [styles.retry, { backgroundColor: theme.ship }, pressed && styles.retryPressed]}
                onPress={() => gameRunner.startRun()}
              >
                <Text style={[styles.retryText, { color: theme.bg }]}>PLAY</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

const defaultTheme = getSkinTheme('default');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: defaultTheme.bg },
  canvas: { alignItems: 'center', justifyContent: 'center' },
  spaceBg: {
    position: 'absolute',
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
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
    overflow: 'hidden',
  },
  destructibleInner: {
    position: 'absolute',
  },
  shipCockpit: {
    position: 'absolute',
  },
  powerup: {
    position: 'absolute',
    overflow: 'hidden',
  },
  powerupInner: {
    position: 'absolute',
  },
  coin: {
    position: 'absolute',
    overflow: 'hidden',
  },
  coinInner: {
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
  coinsHud: { fontSize: 18, fontWeight: '700', color: defaultTheme.text },
  shipsHud: { fontSize: 18, fontWeight: '700', color: defaultTheme.text },
  scoreHud: { fontSize: 24, fontWeight: '800', color: defaultTheme.ship },
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
  pauseBtnText: { fontSize: 22, color: defaultTheme.text },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: { alignItems: 'center', justifyContent: 'center' },
  instructions: {
    fontSize: 18,
    fontWeight: '600',
    color: defaultTheme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsSub: {
    fontSize: 14,
    color: defaultTheme.textDim,
    marginBottom: 24,
    textAlign: 'center',
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: defaultTheme.text,
    marginBottom: 8,
  },
  finalScore: { fontSize: 20, color: defaultTheme.ship, marginBottom: 4 },
  coinsEarned: { fontSize: 16, color: defaultTheme.coin, marginBottom: 20 },
  navRow: {
    flexDirection: 'row',
    marginBottom: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  navBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: defaultTheme.ship,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  navBtnText: { color: defaultTheme.bg, fontSize: 16, fontWeight: '700' },
  reviveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    marginBottom: 10,
  },
  reviveBtnText: { color: defaultTheme.text, fontWeight: '600' },
  reviveAdBtn: { backgroundColor: 'rgba(255,255,255,0.1)' },
  btnDisabled: { opacity: 0.6 },
  retry: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: defaultTheme.ship,
    borderRadius: 12,
    marginBottom: 10,
  },
  retryPressed: { opacity: 0.8 },
  retryText: { fontSize: 18, fontWeight: '700', color: defaultTheme.bg },
  menuBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: defaultTheme.textDim,
  },
  menuBtnText: { fontSize: 16, fontWeight: '600', color: defaultTheme.textDim },
});
