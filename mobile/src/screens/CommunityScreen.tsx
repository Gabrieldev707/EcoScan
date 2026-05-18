import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

// UC05 — Chatbot + grupos (em breve)
export function CommunityScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.icon}>👥</Text>
      <Text style={styles.title}>Comunidade</Text>
      <Text style={styles.sub}>UC05 — Chatbot e grupos colaborativos{'\n'}em desenvolvimento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontFamily: fonts.titleBold, fontSize: 24, color: colors.green, marginBottom: 8 },
  sub: { fontFamily: fonts.bodyLight, fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22 },
});
