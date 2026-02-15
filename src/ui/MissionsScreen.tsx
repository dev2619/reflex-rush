/**
 * Pantalla misiones: lista, progreso, reclamar recompensa.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useGame } from '../context/GameContext';

export function MissionsScreen() {
  const router = useRouter();
  const { missions, economy, daily } = useGame();
  const [progress, setProgress] = useState(missions.getProgress());
  const [coins, setCoins] = useState(economy.getCoins());
  const [streak, setStreak] = useState(daily.getStreak());
  const [canClaimDaily, setCanClaimDaily] = useState(daily.canClaimToday());

  const refresh = useCallback(() => {
    setProgress(missions.getProgress());
    setCoins(economy.getCoins());
    setStreak(daily.getStreak());
    setCanClaimDaily(daily.canClaimToday());
  }, [missions, economy, daily]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  function handleClaimMission(missionId: string) {
    const reward = missions.claimReward(missionId);
    if (reward != null) {
      economy.addCoins(reward);
      economy.save();
      missions.save();
      refresh();
    }
  }

  function handleClaimDaily() {
    const result = daily.claim();
    if (result) {
      economy.addCoins(result.coins);
      economy.save();
      refresh();
    }
  }

  const missionDefs = missions.getMissions();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Atrás</Text>
        </Pressable>
        <Text style={styles.coins}>🪙 {coins}</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Recompensa diaria</Text>
        <View style={styles.dailyCard}>
          <Text style={styles.streakText}>Racha: {streak} días</Text>
          {canClaimDaily ? (
            <Pressable style={styles.claimBtn} onPress={handleClaimDaily}>
              <Text style={styles.claimBtnText}>Reclamar hoy</Text>
            </Pressable>
          ) : (
            <Text style={styles.claimedText}>Ya reclamado hoy</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Misiones</Text>
        {missionDefs.map((def) => {
          const p = progress.find((x) => x.id === def.id) ?? { current: 0, completed: false, claimed: false };
          const canClaim = p.completed && !p.claimed;
          return (
            <View key={def.id} style={styles.missionRow}>
              <View>
                <Text style={styles.missionTitle}>{def.title}</Text>
                <Text style={styles.missionProgress}>
                  {Math.min(p.current, def.target)} / {def.target} · {def.rewardCoins} 🪙
                </Text>
              </View>
              {canClaim ? (
                <Pressable style={styles.claimBtn} onPress={() => handleClaimMission(def.id)}>
                  <Text style={styles.claimBtnText}>Reclamar</Text>
                </Pressable>
              ) : p.claimed ? (
                <Text style={styles.claimedText}>Hecho</Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 },
  backBtn: { padding: 8 },
  backText: { color: '#00ff88', fontSize: 16 },
  coins: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: '#aaa', fontSize: 14, marginBottom: 12, marginTop: 8 },
  dailyCard: { backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, marginBottom: 8 },
  streakText: { color: '#fff', fontSize: 16, marginBottom: 8 },
  claimBtn: { backgroundColor: '#00ff88', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, alignSelf: 'flex-start' },
  claimBtnText: { color: '#0a0a0f', fontWeight: '700' },
  claimedText: { color: '#00ff88', fontSize: 14 },
  missionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  missionTitle: { color: '#fff', fontSize: 16 },
  missionProgress: { color: '#888', fontSize: 12, marginTop: 4 },
});
