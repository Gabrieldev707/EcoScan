import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface ImpactCardProps {
  value: string;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}

export function ImpactCard({ value, label, icon }: ImpactCardProps) {
  return (
    <View style={styles.card}>
      <Feather name={icon} size={18} color={colors.muted} style={styles.icon} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    margin: 5,
    minHeight: 110,
  },
  icon: {
    marginBottom: 8,
  },
  value: {
    fontFamily: fonts.titleBold,
    fontSize: 26,
    color: colors.green,
    marginBottom: 4,
  },
  label: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
});
