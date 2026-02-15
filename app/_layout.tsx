import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { GameProvider } from '../src/context/GameContext';
import { ConsentScreen } from '../src/ui/ConsentScreen';
import { getConsentService } from '../src/services/ConsentService';
import type { ConsentState } from '../src/services/ConsentService';

export default function RootLayout() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getConsentService().then((s) => s.getConsent().then(setConsent)).finally(() => setLoaded(true));
  }, []);

  const refreshConsent = useCallback(async () => {
    const s = await getConsentService();
    const c = await s.getConsent();
    setConsent(c);
  }, []);

  const handleAccept = useCallback(async () => {
    const s = await getConsentService();
    await s.setConsent({ analytics: true, ads: true, attAccepted: true });
    await refreshConsent();
  }, [refreshConsent]);

  const handleReject = useCallback(async () => {
    const s = await getConsentService();
    await s.setConsent({ analytics: false, ads: false, attAccepted: false });
    await refreshConsent();
  }, [refreshConsent]);

  if (!loaded) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#00ff88" />
          <Text style={styles.loadingText}>Cargando…</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  if (consent == null) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="light" />
        <ConsentScreen onAccept={handleAccept} onReject={handleReject} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <GameProvider consent={consent}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </GameProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#aaa', marginTop: 12 },
});
