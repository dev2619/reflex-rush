/**
 * Analytics layer — events for providers (Firebase, Mixpanel, etc.). Replace provider without touching core.
 */

export type AnalyticsEvent =
  | 'session_start'
  | 'retention_day'
  | 'run_start'
  | 'run_end'
  | 'death_reason'
  | 'retry'
  | 'ad_watch'
  | 'purchase';

export interface AnalyticsPayload {
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsProvider {
  logEvent: (event: AnalyticsEvent, payload?: AnalyticsPayload) => void;
}

let provider: AnalyticsProvider | null = null;

export function setAnalyticsProvider(p: AnalyticsProvider | null) {
  provider = p;
}

export function logEvent(event: AnalyticsEvent, payload?: AnalyticsPayload) {
  provider?.logEvent(event, payload);
}

export const mockProvider: AnalyticsProvider = {
  logEvent(event, payload) {
    if (__DEV__) console.log('[Analytics]', event, payload);
  },
};
