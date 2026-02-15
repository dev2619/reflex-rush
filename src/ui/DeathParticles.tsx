/**
 * Partículas simples en muerte o near-miss.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { LayoutRectangle } from 'react-native';

const COUNT = 12;
const DURATION = 400;

interface DeathParticlesProps {
  visible: boolean;
  center: { x: number; y: number };
  color?: string;
  onEnd?: () => void;
}

export function DeathParticles({ visible, center, color = '#ff3366', onEnd }: DeathParticlesProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!visible) return;
    opacity.value = 1;
    scale.value = 1;
    opacity.value = withTiming(0, { duration: DURATION }, (finished) => {
      if (finished && onEnd) runOnJS(onEnd)();
    });
    scale.value = withSequence(
      withTiming(1.5, { duration: DURATION / 2 }),
      withTiming(0, { duration: DURATION / 2 })
    );
  }, [visible, center.x, center.y]);

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {Array.from({ length: COUNT }).map((_, i) => {
        const angle = (i / COUNT) * Math.PI * 2;
        const dist = 30 + (i % 5) * 8;
        const x = center.x + Math.cos(angle) * dist;
        const y = center.y + Math.sin(angle) * dist;
        return (
          <ParticleDot
            key={i}
            x={x}
            y={y}
            color={color}
            opacity={opacity}
            scale={scale}
          />
        );
      })}
    </View>
  );
}

function ParticleDot({
  x,
  y,
  color,
  opacity,
  scale,
}: {
  x: number;
  y: number;
  color: string;
  opacity: SharedValue<number>;
  scale: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: x - 4,
    top: y - 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  return <Animated.View style={style} />;
}
