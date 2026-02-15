/**
 * Sonidos cortos: swipe, near-miss, game over, shoot, hit, destroy, coin, powerup. Usa expo-av; si no hay assets, no-op.
 */

const SOUND_URIS: Record<string, string> = {
  swipe: 'https://assets.mixkit.co/active_storage/sfx/2562-pop.mp3',
  near_miss: 'https://assets.mixkit.co/active_storage/sfx/2570-swoosh.mp3',
  death: 'https://assets.mixkit.co/active_storage/sfx/2568-game-over.mp3',
  shoot: 'https://assets.mixkit.co/active_storage/sfx/2572-laser.mp3',
  hit: 'https://assets.mixkit.co/active_storage/sfx/2564-impact.mp3',
  destroy: 'https://assets.mixkit.co/active_storage/sfx/2574-explosion.mp3',
  coin: 'https://assets.mixkit.co/active_storage/sfx/2566-coin.mp3',
  powerup: 'https://assets.mixkit.co/active_storage/sfx/2576-ascend.mp3',
  shield_break: 'https://assets.mixkit.co/active_storage/sfx/2560-glass.mp3',
};

let audioLoaded = false;

export interface SoundServiceAPI {
  playSwipe: () => void;
  playNearMiss: () => void;
  playDeath: () => void;
  playShoot: () => void;
  playHit: () => void;
  playDestroy: () => void;
  playCoin: () => void;
  playPowerup: () => void;
  playShieldBreak: () => void;
}

export function createSoundService(): SoundServiceAPI {
  async function play(uri: string) {
    try {
      const { Audio } = await import('expo-av');
      if (!audioLoaded) {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          playThroughEarpieceAndroid: false,
        } as Parameters<typeof Audio.setAudioModeAsync>[0]);
        audioLoaded = true;
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s) => {
        const status = s as { isLoaded?: boolean; didJustFinishAndNotReset?: boolean };
        if (status.isLoaded && status.didJustFinishAndNotReset) sound.unloadAsync().catch(() => {});
      });
    } catch {
      // no-op si falla (red, permisos, etc.)
    }
  }

  return {
    playSwipe: () => play(SOUND_URIS.swipe),
    playNearMiss: () => play(SOUND_URIS.near_miss),
    playDeath: () => play(SOUND_URIS.death),
    playShoot: () => play(SOUND_URIS.shoot),
    playHit: () => play(SOUND_URIS.hit),
    playDestroy: () => play(SOUND_URIS.destroy),
    playCoin: () => play(SOUND_URIS.coin),
    playPowerup: () => play(SOUND_URIS.powerup),
    playShieldBreak: () => play(SOUND_URIS.shield_break),
  };
}
