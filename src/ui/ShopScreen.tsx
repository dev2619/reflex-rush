/**
 * Pantalla tienda: skins y trails por monedas, equipar.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '../context/GameContext';
import { SHOP_CATALOG } from '../config/ShopCatalog';
import { logEvent } from '../analytics/AnalyticsLayer';
import type { GameEvent } from '../services/EventService';

export function ShopScreen() {
  const router = useRouter();
  const { economy, meta, lootbox, iap, events } = useGame();
  const [coins, setCoins] = useState(economy.getCoins());
  const [refreshed, setRefreshed] = useState(0);
  const [lootboxMessage, setLootboxMessage] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

  useEffect(() => {
    setCoins(economy.getCoins());
  }, [economy, refreshed]);

  useEffect(() => {
    events.getActiveEvent().then(setActiveEvent).catch(() => setActiveEvent(null));
  }, [events, refreshed]);

  const coinMultiplier = activeEvent?.coinMultiplier ?? 1;
  const limitedIds = activeEvent?.limitedSkinIds ?? [];
  const skinsCatalog = SHOP_CATALOG.filter((i) => i.type === 'skin');
  const trailsCatalog = SHOP_CATALOG.filter((i) => i.type === 'trail');
  const skins = limitedIds.length > 0
    ? skinsCatalog.filter((s) => limitedIds.includes(s.id)).concat(skinsCatalog.filter((s) => !limitedIds.includes(s.id)))
    : skinsCatalog;
  const trails = trailsCatalog;

  function handleBuy(item: typeof SHOP_CATALOG[0]) {
    const price = item.price;
    if (price > coins) return;
    if (item.type === 'skin') {
      if (!economy.spendCoins(price)) return;
      meta.unlockSkin(item.id);
      meta.setEquippedSkin(item.id);
    } else {
      if (!economy.spendCoins(price)) return;
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

  function isEventLimited(item: { id: string }) {
    return limitedIds.length > 0 && limitedIds.includes(item.id);
  }

  function isEquipped(item: typeof SHOP_CATALOG[0]) {
    return item.type === 'skin'
      ? meta.getEquippedSkin() === item.id
      : meta.getEquippedTrail() === item.id;
  }

  async function handleRemoveAds() {
    const ok = await iap.purchase('remove_ads');
    if (ok) {
      logEvent('purchase', { productId: 'remove_ads' });
      setRefreshed((r) => r + 1);
    }
  }

  function handleLootbox() {
    const result = lootbox.open(coins, SHOP_CATALOG);
    if (!result.success || !result.reward) {
      setLootboxMessage(`Necesitas ${result.cost} 🪙`);
      return;
    }
    if (!economy.spendCoins(result.cost)) return;
    const item = SHOP_CATALOG.find((i) => i.id === result.reward);
    if (item) {
      if (item.type === 'skin') {
        meta.unlockSkin(item.id);
        meta.setEquippedSkin(item.id);
      } else {
        meta.unlockTrail(item.id);
        meta.setEquippedTrail(item.id);
      }
      meta.save();
    }
    economy.save();
    setCoins(economy.getCoins());
    setRefreshed((r) => r + 1);
    setLootboxMessage(`¡Has obtenido: ${item?.name ?? result.reward}!`);
    setTimeout(() => setLootboxMessage(null), 2500);
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
        {coinMultiplier > 1 && activeEvent && (
          <View style={styles.eventBanner}>
            <Text style={styles.eventBannerText}>Evento: {activeEvent.name} — x{coinMultiplier} monedas en partidas</Text>
          </View>
        )}
        {!iap.hasPurchased('remove_ads') && (
          <>
            <Text style={styles.sectionTitle}>Compras</Text>
            <View style={styles.row}>
              <Text style={styles.itemName}>Quitar anuncios</Text>
              <Pressable style={styles.btn} onPress={handleRemoveAds}>
                <Text style={styles.btnText}>Comprar</Text>
              </Pressable>
            </View>
          </>
        )}
        {iap.hasPurchased('remove_ads') && (
          <Text style={styles.eventBannerText}>Anuncios desactivados</Text>
        )}
        <Text style={styles.sectionTitle}>Lootbox</Text>
        <View style={styles.row}>
          <Text style={styles.itemName}>Caja sorpresa (skin o estela)</Text>
          <View style={styles.rowRight}>
            <Pressable
              style={[styles.btn, coins < lootbox.openCost() && styles.btnDisabled]}
              onPress={handleLootbox}
              disabled={coins < lootbox.openCost()}
            >
              <Text style={styles.btnText}>{lootbox.openCost()} 🪙</Text>
            </Pressable>
          </View>
        </View>
        {lootboxMessage != null && <Text style={styles.lootboxMsg}>{lootboxMessage}</Text>}
        <Text style={styles.sectionTitle}>Skins</Text>
        {skins.map((item) => {
          const unlocked = isUnlocked(item);
          const equipped = isEquipped(item);
          const limited = isEventLimited(item);
          return (
            <View key={item.id} style={[styles.row, limited && styles.rowEvent]}>
              <Text style={styles.itemName}>{item.name}{limited ? ' (evento)' : ''}</Text>
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
  lootboxMsg: { color: '#00ff88', fontSize: 14, marginTop: 8 },
  eventBanner: { backgroundColor: 'rgba(100,50,255,0.25)', padding: 12, borderRadius: 8, marginBottom: 16 },
  eventBannerText: { color: '#c8b8ff', fontSize: 14 },
  rowEvent: { borderLeftWidth: 3, borderLeftColor: '#8b5cf6' },
});
