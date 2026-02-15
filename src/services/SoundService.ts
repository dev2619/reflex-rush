/**
 * Sonidos cortos: swipe, near-miss, game over. Usa expo-av; si no hay assets, no-op.
 */

const SOUND_URIS: Record<string, string> = {
  swipe: 'https://assets.mixkit.co/active_storage/sfx/2562-pop.mp3',
  near_miss: 'https://assets.mixkit.co/active_storage/sfx/2570-swoosh.mp3',
  death: 'https://assets.mixkit.co/active_storage/sfx/2568-game-over.mp3',
};

let audioLoaded = false;

export interface SoundServiceAPI {
  playSwipe: () => void;
  playNearMiss: () => void;
  playDeath: () => void;
}

export function createSoundService(): SoundServiceAPI {
  async function play(uri: string) {
    try {
      const { Audio } = await import('expo-av');
      if (!audioLoaded) {
        await Audio.setAudioModeAsync({ playsInSilentMode: true, staysActiveInBackground: false, shouldDuck: true, playThroughEarpieceAndroid: false });
        audioLoaded = true;
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinishAndNotReset) sound.unloadAsync().catch(() => {});
      });
    } catch {
      // no-op si falla (red, permisos, etc.)
    }
  }

  return {
    playSwipe: () => play(SOUND_URIS.swipe),
    playNearMiss: () => play(SOUND_URIS.near_miss),
    playDeath: () => play(SOUND_URIS.death),
  };
}
