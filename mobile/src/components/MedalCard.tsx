import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface MedalCardProps {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  earned: boolean;
}

export function MedalCard({ title, icon, earned }: MedalCardProps) {
  return (
    <View style={[styles.card, earned && styles.cardEarned, !earned && styles.cardLocked]}>
      <View style={[styles.iconWrap, earned && styles.iconWrapEarned]}>
        <Feather name={icon} size={22} color={earned ? colors.green : colors.muted} />
      </View>
      <Text style={[styles.title, !earned && styles.titleLocked]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  cardEarned: {
    backgroundColor: colors.surface2,
    borderColor: colors.green,
  },
  cardLocked: {
    opacity: 0.3,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconWrapEarned: {
    backgroundColor: 'rgba(29,255,138,0.1)',
  },
  title: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 15,
  },
  titleLocked: {
    color: colors.muted,
  },
});
