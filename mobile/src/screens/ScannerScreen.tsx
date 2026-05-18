import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

// UC02 — Câmera + IA (em breve)
export function ScannerScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.icon}>📷</Text>
      <Text style={styles.title}>Scanner</Text>
      <Text style={styles.sub}>UC02 — Identificação por câmera com IA{'\n'}em desenvolvimento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontFamily: fonts.titleBold, fontSize: 24, color: colors.green, marginBottom: 8 },
  sub: { fontFamily: fonts.bodyLight, fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22 },
});
