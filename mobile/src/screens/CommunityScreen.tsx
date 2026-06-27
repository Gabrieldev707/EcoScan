import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function CommunityScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHead}>
        <Feather name="users" size={16} color={colors.green} />
        <Text style={styles.sectionTitle}>Comunidade</Text>
      </View>

      <View style={styles.panel}>
        <Feather name="lock" size={22} color={colors.muted} />
        <Text style={styles.title}>Indisponivel nesta versao</Text>
        <Text style={styles.body}>
          Ranking, grupos e chat ainda nao possuem endpoints reais no backend atual.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  body: {
    fontFamily: fonts.bodyLight,
    fontSize: 14,
    color: colors.dim,
    lineHeight: 20,
  },
});
