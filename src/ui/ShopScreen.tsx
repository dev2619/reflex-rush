/**
 * Pantalla tienda: skins y trails por monedas, equipar.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '../context/GameContext';
import { SHOP_CATALOG } from '../config/ShopCatalog';

export function ShopScreen() {
  const router = useRouter();
  const { economy, meta } = useGame();
  const [coins, setCoins] = useState(economy.getCoins());
  const [refreshed, setRefreshed] = useState(0);

  useEffect(() => {
    setCoins(economy.getCoins());
  }, [economy, refreshed]);

  const skins = SHOP_CATALOG.filter((i) => i.type === 'skin');
  const trails = SHOP_CATALOG.filter((i) => i.type === 'trail');

  function handleBuy(item: typeof SHOP_CATALOG[0]) {
    if (item.price > coins) return;
    if (item.type === 'skin') {
      if (!economy.spendCoins(item.price)) return;
      meta.unlockSkin(item.id);
      meta.setEquippedSkin(item.id);
    } else {
      if (!economy.spendCoins(item.price)) return;
      meta.unlockTrail(item.id);
      meta.setEquippedTrail(item.id);
    }
    economy.save();
    meta.save();
    setCoins(economy.getCoins());
    setRefreshed((r) => r + 1);
  }

  function handleEquip(item: typeof SHOP_CATALOG[0]) {
    if (item.type === 'skin') meta.setEquippedSkin(item.id);
    else meta.setEquippedTrail(item.id);
    meta.save();
    setRefreshed((r) => r + 1);
  }

  function isUnlocked(item: typeof SHOP_CATALOG[0]) {
    return item.type === 'skin'
      ? meta.getUnlockedSkins().includes(item.id)
      : meta.getUnlockedTrails().includes(item.id);
  }

  function isEquipped(item: typeof SHOP_CATALOG[0]) {
    return item.type === 'skin'
      ? meta.getEquippedSkin() === item.id
      : meta.getEquippedTrail() === item.id;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Atrás</Text>
        </Pressable>
        <Text style={styles.coins}>🪙 {coins}</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Skins</Text>
        {skins.map((item) => {
          const unlocked = isUnlocked(item);
          const equipped = isEquipped(item);
          return (
            <View key={item.id} style={styles.row}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.rowRight}>
                {!unlocked ? (
                  <Pressable
                    style={[styles.btn, item.price > coins && styles.btnDisabled]}
                    onPress={() => handleBuy(item)}
                    disabled={item.price > coins}
                  >
                    <Text style={styles.btnText}>{item.price} 🪙</Text>
                  </Pressable>
                ) : equipped ? (
                  <Text style={styles.equipped}>Equipado</Text>
                ) : (
                  <Pressable style={styles.btn} onPress={() => handleEquip(item)}>
                    <Text style={styles.btnText}>Equipar</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
        <Text style={styles.sectionTitle}>Estelas</Text>
        {trails.map((item) => {
          const unlocked = isUnlocked(item);
          const equipped = isEquipped(item);
          return (
            <View key={item.id} style={styles.row}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.rowRight}>
                {!unlocked ? (
                  <Pressable
                    style={[styles.btn, item.price > coins && styles.btnDisabled]}
                    onPress={() => handleBuy(item)}
                    disabled={item.price > coins}
                  >
                    <Text style={styles.btnText}>{item.price} 🪙</Text>
                  </Pressable>
                ) : equipped ? (
                  <Text style={styles.equipped}>Equipado</Text>
                ) : (
                  <Pressable style={styles.btn} onPress={() => handleEquip(item)}>
                    <Text style={styles.btnText}>Equipar</Text>
                  </Pressable>
                )}
              </View>
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  itemName: { color: '#fff', fontSize: 16 },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  btn: { backgroundColor: '#00ff88', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#0a0a0f', fontWeight: '600' },
  equipped: { color: '#00ff88', fontSize: 14 },
});
