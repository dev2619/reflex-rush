/**
 * Feedback system — haptics, sound, visual triggers.
 */

import type { SoundServiceAPI } from '../services/SoundService';

export type FeedbackEvent =
  | 'swipe'
  | 'near_miss'
  | 'death'
  | 'revive'
  | 'score_tick'
  | 'retry'
  | 'shoot'
  | 'hit'
  | 'destroy'
  | 'coin'
  | 'powerup'
  | 'shield_break'
  | 'ship_lost';

export interface FeedbackSystemAPI {
  trigger: (event: FeedbackEvent) => void;
}

type HapticsLike = { impactAsync?: (style?: string) => Promise<void> } | null;
let haptics: HapticsLike = null;
let soundService: SoundServiceAPI | null = null;

async function loadHaptics() {
  if (haptics) return;
  try {
    const mod = await import('expo-haptics');
    haptics = mod as HapticsLike;
  } catch {
    haptics = { impactAsync: undefined };
  }
}

function getSound(): SoundServiceAPI | null {
  if (!soundService) {
    try {
      const { createSoundService } = require('../services/SoundService');
      soundService = createSoundService();
    } catch {
      soundService = null;
    }
  }
  return soundService;
}

export function createFeedbackSystem(): FeedbackSystemAPI {
  return {
    trigger(event: FeedbackEvent) {
      loadHaptics()
        .then(() => {
          switch (event) {
            case 'swipe':
              haptics?.impactAsync?.('light')?.catch(() => {});
              getSound()?.playSwipe();
              break;
            case 'near_miss':
              haptics?.impactAsync?.('medium')?.catch(() => {});
              getSound()?.playNearMiss();
              break;
            case 'death':
              haptics?.impactAsync?.('heavy')?.catch(() => {});
              getSound()?.playDeath();
              break;
            case 'revive':
            case 'retry':
              haptics?.impactAsync?.('medium')?.catch(() => {});
              break;
            case 'shoot':
              haptics?.impactAsync?.('light')?.catch(() => {});
              getSound()?.playShoot?.();
              break;
            case 'hit':
              getSound()?.playHit?.();
              break;
            case 'destroy':
              haptics?.impactAsync?.('medium')?.catch(() => {});
              getSound()?.playDestroy?.();
              break;
            case 'coin':
              getSound()?.playCoin?.();
              break;
            case 'powerup':
              getSound()?.playPowerup?.();
              break;
            case 'shield_break':
              getSound()?.playShieldBreak?.();
              break;
            case 'ship_lost':
              haptics?.impactAsync?.('heavy')?.catch(() => {});
              break;
            default:
              break;
          }
        })
        .catch(() => {});
    },
  };
}
