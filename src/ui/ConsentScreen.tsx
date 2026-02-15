/**
 * Pantalla de consentimiento GDPR/ATT — aceptar o rechazar analytics y anuncios.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
interface ConsentScreenProps {
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}

export function ConsentScreen({ onAccept, onReject }: ConsentScreenProps) {
  const [loading, setLoading] = React.useState(false);
  const handleAccept = async () => {
    setLoading(true);
    await onAccept();
    setLoading(false);
  };
  const handleReject = async () => {
    setLoading(true);
    await onReject();
    setLoading(false);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacidad y anuncios</Text>
      <Text style={styles.body}>
        Usamos análisis para mejorar el juego y mostramos anuncios para mantenerlo gratis. ¿Aceptas cookies y anuncios personalizados?
      </Text>
      <Pressable
        style={[styles.btn, styles.acceptBtn, loading && styles.disabled]}
        onPress={handleAccept}
        disabled={loading}
      >
        <Text style={styles.btnText}>Aceptar</Text>
      </Pressable>
      <Pressable
        style={[styles.btn, styles.rejectBtn, loading && styles.disabled]}
        onPress={handleReject}
        disabled={loading}
      >
        <Text style={styles.rejectBtnText}>Rechazar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', padding: 32 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 16, textAlign: 'center' },
  body: { fontSize: 16, color: '#aaa', marginBottom: 32, textAlign: 'center' },
  btn: { paddingVertical: 16, borderRadius: 12, marginBottom: 12 },
  acceptBtn: { backgroundColor: '#00ff88' },
  rejectBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#666' },
  btnText: { color: '#0a0a0f', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  rejectBtnText: { color: '#aaa', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  disabled: { opacity: 0.6 },
});
