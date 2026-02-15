/**
 * Ads hooks — rewarded and interstitial. Implement with expo-ads-admob or similar; mock for dev.
 */

export interface AdsHooksAPI {
  showRewarded: () => Promise<boolean>;
  showInterstitial: () => Promise<void>;
  isRewardedReady: () => boolean;
  isInterstitialReady: () => boolean;
}

export function createAdsHooks(): AdsHooksAPI {
  return {
    async showRewarded() {
      // TODO: integrate AdMob / Meta Audience Network
      if (__DEV__) return true;
      return false;
    },
    async showInterstitial() {
      // TODO: integrate
    },
    isRewardedReady() {
      return __DEV__;
    },
    isInterstitialReady() {
      return false;
    },
  };
}
