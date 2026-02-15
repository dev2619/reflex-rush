/**
 * Feedback system — haptics and visual/audio triggers (hooks for particles/sound).
 */

export type FeedbackEvent =
  | 'swipe'
  | 'near_miss'
  | 'death'
  | 'revive'
  | 'score_tick'
  | 'retry';

export interface FeedbackSystemAPI {
  trigger: (event: FeedbackEvent) => void;
}

type HapticsLike = { impactAsync?: (style?: string) => Promise<void> } | null;
let haptics: HapticsLike = null;

async function loadHaptics() {
  if (haptics) return;
  try {
    const mod = await import('expo-haptics');
    haptics = mod as HapticsLike;
  } catch {
    haptics = { impactAsync: undefined };
  }
}

export function createFeedbackSystem(): FeedbackSystemAPI {
  return {
    trigger(event: FeedbackEvent) {
      loadHaptics()
        .then(() => {
          switch (event) {
            case 'swipe':
              haptics?.impactAsync?.('light')?.catch(() => {});
              break;
            case 'near_miss':
              haptics?.impactAsync?.('medium')?.catch(() => {});
              break;
            case 'death':
              haptics?.impactAsync?.('heavy')?.catch(() => {});
              break;
            case 'revive':
            case 'retry':
              haptics?.impactAsync?.('medium')?.catch(() => {});
              break;
            default:
              break;
          }
        })
        .catch(() => {});
    },
  };
}
