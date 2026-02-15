/**
 * Eventos temporales / temporadas — skins limitadas, bonus, ventana activa.
 */

const KEY_ACTIVE = '@reflex_rush/active_event';

export interface GameEvent {
  id: string;
  name: string;
  endTime: number; // Unix ms
  coinMultiplier?: number; // e.g. 1.5
  limitedSkinIds?: string[];
}

export interface EventServiceAPI {
  getActiveEvent: () => Promise<GameEvent | null>;
  setActiveEvent: (event: GameEvent | null) => Promise<void>;
  isEventActive: (event: GameEvent) => boolean;
}

export function createEventService(): EventServiceAPI {
  return {
    async getActiveEvent() {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const raw = await AsyncStorage.getItem(KEY_ACTIVE);
        if (!raw) return null;
        const e = JSON.parse(raw) as GameEvent;
        return this.isEventActive(e) ? e : null;
      } catch {
        return null;
      }
    },
    async setActiveEvent(event: GameEvent | null) {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      if (event == null) await AsyncStorage.removeItem(KEY_ACTIVE);
      else await AsyncStorage.setItem(KEY_ACTIVE, JSON.stringify(event));
    },
    isEventActive(event: GameEvent) {
      return Date.now() < event.endTime;
    },
  };
}
