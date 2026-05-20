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
    borderRadius: 2,
    padding: 16,
    margin: 5,
    minHeight: 116,
  },
  icon: {
    marginBottom: 8,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.green,
    marginBottom: 4,
    lineHeight: 36,
    letterSpacing: 0.4,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.dim,
    lineHeight: 16,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
