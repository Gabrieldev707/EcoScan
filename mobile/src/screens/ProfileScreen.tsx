import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { ImpactCard } from '../components/ImpactCard';
import { MedalCard } from '../components/MedalCard';
import { EcoButton } from '../components/EcoButton';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type Props = StackScreenProps<AuthStackParamList, 'Profile'>;

const MEDALS = [
  { title: 'Primeiro Scan', icon: 'camera' as const, earned: true },
  { title: '10 Descartes', icon: 'repeat' as const, earned: true },
  { title: 'Guardião Verde', icon: 'shield' as const, earned: true },
  { title: 'Mestre da Reciclagem', icon: 'award' as const, earned: false },
];

const RECENT_SCANS = [
  { icon: 'wine' as const, name: 'Garrafa PET — 600 ml', date: 'Hoje, 09:42', pts: '+12' },
  { icon: 'file' as const, name: 'Caixa de papelão', date: 'Hoje, 08:11', pts: '+8' },
  { icon: 'battery' as const, name: 'Pilha AA · 4 un', date: 'Ontem, 17:30', pts: '+30' },
];

function useEntryAnim(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, delay]);

  return { opacity, transform: [{ translateY }] };
}

export function ProfileScreen({ route, navigation }: Props) {
  const { name } = route.params;
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const headerAnim = useEntryAnim(0);
  const impactAnim = useEntryAnim(100);
  const medalsAnim = useEntryAnim(200);
  const historyAnim = useEntryAnim(300);
  const logoutAnim = useEntryAnim(400);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View style={headerAnim}>
        <LinearGradient colors={[colors.bg, colors.surface2]} style={styles.header}>
          <LinearGradient
            colors={[colors.greenDim, colors.green]}
            style={styles.avatar}
          >
            <Text style={styles.initials}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Nível 3 — Guardião Verde</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.body}>
        {/* Impact Grid */}
        <Animated.View style={impactAnim}>
          <Text style={styles.sectionTitle}>Seu impacto</Text>
          <View style={styles.grid}>
            <View style={styles.row}>
              <ImpactCard value="47,3 kg" label="Descartados" icon="trash-2" />
              <ImpactCard value="12,8 kg" label="CO₂ evitado" icon="wind" />
            </View>
            <View style={styles.row}>
              <ImpactCard value="340 L" label="Água poupada" icon="droplet" />
              <ImpactCard value="2.840" label="Pontos acumulados" icon="star" />
            </View>
          </View>
        </Animated.View>

        {/* Medals */}
        <Animated.View style={medalsAnim}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.medals}
          >
            {MEDALS.map(m => (
              <MedalCard key={m.title} title={m.title} icon={m.icon} earned={m.earned} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Recent Scans */}
        <Animated.View style={historyAnim}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos scans</Text>
            <Pressable style={styles.seeAll}>
              <Text style={styles.seeAllText}>Ver todos</Text>
              <Feather name="chevron-right" size={14} color={colors.green} />
            </Pressable>
          </View>
          <View style={styles.scanList}>
            {RECENT_SCANS.map(s => (
              <View key={s.name} style={styles.scanRow}>
                <View style={styles.scanIcon}>
                  <Feather name={s.icon} size={16} color={colors.green} />
                </View>
                <View style={styles.scanInfo}>
                  <Text style={styles.scanName}>{s.name}</Text>
                  <Text style={styles.scanDate}>{s.date}</Text>
                </View>
                <Text style={styles.scanPts}>{s.pts}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Logout */}
        <Animated.View style={[logoutAnim, styles.logoutWrap]}>
          <EcoButton label="Sair da conta" onPress={handleLogout} variant="danger" />
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  initials: {
    fontFamily: fonts.titleBold,
    fontSize: 32,
    color: colors.bg,
  },
  userName: {
    fontFamily: fonts.title,
    fontSize: 24,
    color: colors.text,
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  badge: {
    backgroundColor: 'rgba(29,255,138,0.12)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.green,
  },
  body: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: colors.text,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  grid: {
    marginBottom: 28,
    marginHorizontal: -5,
  },
  row: {
    flexDirection: 'row',
  },
  medals: {
    paddingBottom: 8,
    marginBottom: 28,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.green,
  },
  scanList: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 28,
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scanIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(29,255,138,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scanInfo: {
    flex: 1,
  },
  scanName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.text,
    marginBottom: 2,
  },
  scanDate: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: colors.muted,
  },
  scanPts: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.green,
  },
  logoutWrap: {
    marginBottom: 40,
  },
});
