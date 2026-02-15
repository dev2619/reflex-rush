/**
 * Consentimiento (GDPR/ATT) — guardado en AsyncStorage; condicionar ads a consent.
 */

const KEY = '@reflex_rush/consent';

export type ConsentState = {
  analytics: boolean;
  ads: boolean;
  attAccepted: boolean;
  timestamp: number;
};

export interface ConsentServiceAPI {
  getConsent: () => Promise<ConsentState | null>;
  setConsent: (state: Partial<ConsentState>) => Promise<void>;
  hasDecided: () => Promise<boolean>;
}

export async function getConsentService(): Promise<ConsentServiceAPI> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const api: ConsentServiceAPI = {
    async getConsent() {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ConsentState;
      } catch {
        return null;
      }
    },
    async setConsent(partial: Partial<ConsentState>) {
      const current = await api.getConsent();
      const next: ConsentState = {
        analytics: partial.analytics ?? current?.analytics ?? false,
        ads: partial.ads ?? current?.ads ?? false,
        attAccepted: partial.attAccepted ?? current?.attAccepted ?? false,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    },
    async hasDecided() {
      const c = await api.getConsent();
      return c != null && (c.timestamp ?? 0) > 0;
    },
  };
  return api;
}
