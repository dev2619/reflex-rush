/**
 * Adapter Firebase — Remote Config + Leaderboards. Sustituir mock cuando tengas proyecto Firebase.
 * Requiere: npm install firebase (y configurar google-services.json / GoogleService-Info.plist).
 */

import type { BackendAdapter, LeaderboardEntry } from './BackendAdapter';

export function createFirebaseAdapter(_options?: { projectId?: string }): BackendAdapter {
  return {
    async getLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
      // TODO: Firebase Firestore o Realtime Database
      // const db = getFirestore(); ...
      return [];
    },
    async submitScore(score: number): Promise<void> {
      // TODO: guardar en Firestore / Auth UID
    },
    async getRemoteConfig(): Promise<Record<string, string | number | boolean>> {
      // TODO: import { getRemoteConfig, getValue } from 'firebase/remote-config';
      return {};
    },
  };
}
