import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { scansApi } from '../api/scans';
import { ImpactCard } from '../components/ImpactCard';
import { MedalCard } from '../components/MedalCard';
import { EcoButton } from '../components/EcoButton';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { Scan } from '../types/scan';

type Props = {
  route: { params: { name: string } };
  onLogout?: () => void;
};

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

function formatScanDate(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function ProfileScreen({ route, onLogout }: Props) {
  const { user, logout } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const displayName = user?.name || route.params.name;
  const initials = getInitials(displayName);

  const headerAnim = useEntryAnim(0);
  const impactAnim = useEntryAnim(100);
  const medalsAnim = useEntryAnim(200);
  const historyAnim = useEntryAnim(300);
  const logoutAnim = useEntryAnim(400);

  const loadScans = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const page = await scansApi.list(1, 20);
      setScans(page.items);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadScans();
    }, [loadScans]),
  );

  const medals = useMemo(() => ([
    { title: 'Primeiro Scan', icon: 'camera' as const, earned: scans.length >= 1 },
    { title: '10 Descartes', icon: 'repeat' as const, earned: scans.length >= 10 },
    { title: '500 Pontos', icon: 'shield' as const, earned: (user?.points || 0) >= 500 },
    { title: 'Nivel 5', icon: 'award' as const, earned: (user?.level || 1) >= 5 },
  ]), [scans.length, user?.level, user?.points]);

  const recyclableCount = scans.filter((scan) => scan.canRecycle).length;

  const handleLogout = async () => {
    await logout();
    onLogout?.();
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <Animated.View style={headerAnim}>
        <LinearGradient colors={[colors.bg, colors.surface2]} style={styles.header}>
          <LinearGradient
            colors={[colors.greenDim, colors.green]}
            style={styles.avatar}
          >
            <Text style={styles.initials}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{displayName}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Nivel {user?.level || 1}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.body}>
        <Animated.View style={impactAnim}>
          <Text style={styles.sectionTitle}>Seu impacto</Text>
          <View style={styles.grid}>
            <View style={styles.row}>
              <ImpactCard value={String(scans.length)} label="Scans registrados" icon="camera" />
              <ImpactCard value={String(recyclableCount)} label="Reciclaveis" icon="refresh-cw" />
            </View>
            <View style={styles.row}>
              <ImpactCard value={String(user?.points || 0)} label="Pontos acumulados" icon="star" />
              <ImpactCard value={String(user?.level || 1)} label="Nivel atual" icon="zap" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={medalsAnim}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.medals}
          >
            {medals.map((medal) => (
              <MedalCard key={medal.title} title={medal.title} icon={medal.icon} earned={medal.earned} />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View style={historyAnim}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ultimos scans</Text>
          </View>
          <View style={styles.scanList}>
            {loading ? (
              <View style={styles.stateRow}>
                <ActivityIndicator color={colors.green} />
              </View>
            ) : null}

            {errorMessage ? (
              <View style={styles.stateRow}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {!loading && !errorMessage && scans.length === 0 ? (
              <View style={styles.stateRow}>
                <Text style={styles.emptyText}>Nenhum scan registrado ainda.</Text>
              </View>
            ) : null}

            {scans.map((scan) => (
              <View key={scan.id} style={styles.scanRow}>
                <View style={styles.scanIcon}>
                  <Feather name="package" size={16} color={colors.green} />
                </View>
                <View style={styles.scanInfo}>
                  <Text style={styles.scanName}>{scan.wasteType}</Text>
                  <Text style={styles.scanDate}>{formatScanDate(scan.createdAt)} · {scan.category}</Text>
                </View>
                <Text style={styles.scanPts}>+{scan.points}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

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
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  initials: {
    fontFamily: fonts.display,
    fontSize: 42,
    color: colors.bg,
    letterSpacing: 1,
  },
  userName: {
    fontFamily: fonts.display,
    fontSize: 44,
    color: colors.text,
    marginBottom: 10,
    textTransform: 'capitalize',
    lineHeight: 46,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: 'rgba(29,255,138,0.12)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  body: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.text,
    marginBottom: 14,
    marginTop: 4,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
  scanList: {
    backgroundColor: colors.surface,
    borderRadius: 2,
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
    borderRadius: 2,
    backgroundColor: 'rgba(29,255,138,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scanInfo: {
    flex: 1,
  },
  scanName: {
    fontFamily: fonts.bodySemiBold,
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
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.green,
    letterSpacing: 0.5,
  },
  stateRow: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
    lineHeight: 18,
  },
  emptyText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.dim,
    lineHeight: 18,
  },
  logoutWrap: {
    marginBottom: 40,
  },
});
