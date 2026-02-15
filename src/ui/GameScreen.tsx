/**
 * Game screen — full-screen play area, swipe gestures, score, retry.
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { GameRunnerAPI, GameRunnerState } from '../engine/GameRunner';
import type { GameConfig } from '../core/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_MIN = 40;

interface GameScreenProps {
  gameRunner: GameRunnerAPI;
  state: GameRunnerState;
  config: GameConfig;
}

function resolveSwipe(dx: number, dy: number): 'left' | 'right' | 'up' | 'down' {
  if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  if (Math.abs(dy) >= SWIPE_MIN) return dy > 0 ? 'down' : 'up';
  return 'left';
}

export function GameScreen({ gameRunner, state, config }: GameScreenProps) {
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
      handleSwipe(e.translationX, e.translationY);
    });

  const gw = config.width || SCREEN_WIDTH;
  const gh = config.height || SCREEN_HEIGHT;
  const scaleX = SCREEN_WIDTH / gw;
  const scaleY = SCREEN_HEIGHT / gh;

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
              <View
                style={[
                  styles.player,
                  {
                    left: state.player.bounds.x,
                    top: state.player.bounds.y,
                    width: state.player.bounds.width,
                    height: state.player.bounds.height,
                  },
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
          </View>
        )}

        {state.status === 'gameover' && (
          <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
            <Text style={styles.score}>{state.score}</Text>
            <View style={styles.overlayContent}>
              <Text style={styles.gameOver}>GAME OVER</Text>
              <Text style={styles.finalScore}>{state.score} pts</Text>
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
  threat: {
    position: 'absolute',
    backgroundColor: '#ff3366',
    borderRadius: 6,
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
