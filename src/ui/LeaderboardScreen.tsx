/**
 * Pantalla leaderboard: lista desde BackendAdapter (mock o real).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '../context/GameContext';

export function LeaderboardScreen() {
  const router = useRouter();
  const { backend } = useGame();
  const [entries, setEntries] = useState<{ rank: number; score: number; displayName: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.getLeaderboard(20).then((list) => {
      setEntries(list.map((e) => ({ rank: e.rank, score: e.score, displayName: e.displayName })));
      setLoading(false);
    });
  }, [backend]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Atrás</Text>
        </Pressable>
        <Text style={styles.title}>Ranking</Text>
      </View>
      {loading ? (
        <Text style={styles.placeholder}>Cargando...</Text>
      ) : entries.length === 0 ? (
        <Text style={styles.placeholder}>Aún no hay puntuaciones. ¡Sé el primero!</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => `${item.rank}-${item.displayName}`}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>#{item.rank}</Text>
              <Text style={styles.name}>{item.displayName}</Text>
              <Text style={styles.score}>{item.score}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 },
  backBtn: { padding: 8, marginRight: 8 },
  backText: { color: '#00ff88', fontSize: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  listContent: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  rank: { color: '#888', width: 40 },
  name: { flex: 1, color: '#fff', fontSize: 16 },
  score: { color: '#00ff88', fontWeight: '700' },
  placeholder: { color: '#666', textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
});
