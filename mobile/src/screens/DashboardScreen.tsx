import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { scansApi } from '../api/scans';
import { ImpactCard } from '../components/ImpactCard';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { Scan } from '../types/scan';

const BAR_MAX_HEIGHT = 130;
const WEEK_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const GUIDE_CATEGORIES = [
  {
    name: 'Plástico',
    color: '#ef4444',
    accepted: ['Garrafas PET', 'Potes', 'Embalagens', 'Sacolas limpas'],
    rejected: ['Plastico sujo', 'Isopor', 'Fita adesiva'],
    tip: 'Esvazie e amasse antes de descartar na lixeira vermelha.',
  },
  {
    name: 'Papel',
    color: '#3b82f6',
    accepted: ['Papelao', 'Revistas', 'Jornais', 'Caixas limpas'],
    rejected: ['Papel engordurado', 'Papel higienico', 'Fotografias'],
    tip: 'Mantenha seco e desdobre as caixas para economizar espaco.',
  },
  {
    name: 'Metal',
    color: '#eab308',
    accepted: ['Latas de aluminio', 'Tampinhas', 'Ferragens', 'Fios'],
    rejected: ['Latas com produto', 'Aerossol pressurizado', 'Tinta'],
    tip: 'Amasse latas para reduzir volume antes do descarte.',
  },
  {
    name: 'Vidro',
    color: '#22c55e',
    accepted: ['Garrafas', 'Frascos', 'Potes de conserva', 'Copos'],
    rejected: ['Espelhos', 'Vidro temperado', 'Ceramica', 'Lampadas'],
    tip: 'Embale vidros quebrados em jornal antes de descartar.',
  },
  {
    name: 'Orgânico',
    color: '#92400e',
    accepted: ['Restos de comida', 'Cascas', 'Folhas', 'Borras de cafe'],
    rejected: ['Plastico sujo', 'Vidro', 'Metal'],
    tip: 'Separe para compostagem quando houver coleta ou estrutura propria.',
  },
  {
    name: 'Rejeito',
    color: '#6b7280',
    accepted: ['Fraldas', 'Papel higienico', 'Guardanapos usados'],
    rejected: ['Nada reciclavel aqui'],
    tip: 'Descarte na lixeira cinza. Reduza ao maximo esse volume.',
  },
];

type Tab = 'impacto' | 'guia';

interface WeeklyBar {
  day: string;
  scans: number;
  key: string;
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildWeeklyBars(scans: Scan[]): WeeklyBar[] {
  const today = new Date();
  const bars: WeeklyBar[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = getDateKey(date);
    const scansForDay = scans.filter((scan) => getDateKey(new Date(scan.createdAt)) === key).length;

    bars.push({
      key,
      day: WEEK_LABELS[date.getDay()],
      scans: scansForDay,
    });
  }

  return bars;
}

function AnimatedBar({ bar, index, maxScans }: { bar: WeeklyBar; index: number; maxScans: number }) {
  const height = useSharedValue(0);
  const targetHeight = bar.scans === 0 ? 0 : Math.max(8, Math.round((bar.scans / maxScans) * BAR_MAX_HEIGHT));

  React.useEffect(() => {
    height.value = withDelay(index * 60, withTiming(targetHeight, { duration: 600 }));
  }, [height, targetHeight, index]);

  const barStyle = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <View style={barStyles.wrap}>
      <Text style={barStyles.tip}>{bar.scans}</Text>
      <Animated.View style={[barStyles.bar, barStyle]} />
      <Text style={barStyles.day}>{bar.day}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    height: BAR_MAX_HEIGHT + 40,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  tip: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.green,
    lineHeight: 16,
  },
  bar: {
    width: '100%',
    maxWidth: 26,
    backgroundColor: colors.green,
  },
  day: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

function AccordionItem({ item }: { item: (typeof GUIDE_CATEGORIES)[number] }) {
  const [open, setOpen] = useState(false);
  const height = useSharedValue(0);
  const CONTENT_HEIGHT = 180;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    height.value = withTiming(next ? CONTENT_HEIGHT : 0, { duration: 280 });
  };

  const bodyStyle = useAnimatedStyle(() => ({ height: height.value, overflow: 'hidden' }));

  return (
    <View style={accordionStyles.item}>
      <Pressable style={accordionStyles.header} onPress={toggle}>
        <View style={[accordionStyles.dot, { backgroundColor: item.color }]} />
        <Text style={accordionStyles.name}>{item.name}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
      </Pressable>

      <Animated.View style={bodyStyle}>
        <View style={accordionStyles.body}>
          <Text style={accordionStyles.sectionLabel}>Aceitos</Text>
          <View style={accordionStyles.pills}>
            {item.accepted.map((accepted) => (
              <View key={accepted} style={accordionStyles.pillGreen}>
                <Text style={accordionStyles.pillGreenText}>{accepted}</Text>
              </View>
            ))}
          </View>

          <Text style={accordionStyles.sectionLabel}>Nao aceitos</Text>
          <View style={accordionStyles.pills}>
            {item.rejected.map((rejected) => (
              <View key={rejected} style={accordionStyles.pillRed}>
                <Text style={accordionStyles.pillRedText}>{rejected}</Text>
              </View>
            ))}
          </View>

          <Text style={accordionStyles.tip}>{item.tip}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const accordionStyles = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  name: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pillGreen: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: 'rgba(29,255,138,0.08)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  pillGreenText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 0.8,
  },
  pillRed: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  pillRedText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.error,
    letterSpacing: 0.8,
  },
  tip: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: colors.dim,
    lineHeight: 18,
    marginTop: 4,
  },
});

function ProgressBar({ progress }: { progress: number }) {
  const width = useSharedValue(0);

  React.useEffect(() => {
    width.value = withDelay(200, withTiming(Math.max(0, Math.min(progress, 1)), { duration: 900 }));
  }, [width, progress]);

  const barStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` as unknown as number }));

  return (
    <View style={progressStyles.track}>
      <Animated.View style={[progressStyles.fill, barStyle]} />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    marginTop: 10,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.green,
  },
});

export function DashboardScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('impacto');
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const impactoOpacity = useSharedValue(1);
  const guiaOpacity = useSharedValue(0);

  const loadScans = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const page = await scansApi.list(1, 50);
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

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    if (tab === 'impacto') {
      guiaOpacity.value = withTiming(0, { duration: 180 });
      impactoOpacity.value = withTiming(1, { duration: 180 });
    } else {
      impactoOpacity.value = withTiming(0, { duration: 180 });
      guiaOpacity.value = withTiming(1, { duration: 180 });
    }
  };

  const weeklyBars = useMemo(() => buildWeeklyBars(scans), [scans]);
  const maxScans = Math.max(1, ...weeklyBars.map((bar) => bar.scans));
  const recyclableCount = scans.filter((scan) => scan.canRecycle).length;
  const totalScanPoints = scans.reduce((sum, scan) => sum + scan.points, 0);
  const currentLevelStart = ((user?.level || 1) - 1) * 500;
  const nextLevelPoints = (user?.level || 1) * 500;
  const levelProgress = ((user?.points || 0) - currentLevelStart) / 500;

  const impactMetrics = [
    { value: String(scans.length), label: 'Scans registrados', icon: 'camera' as const },
    { value: String(recyclableCount), label: 'Reciclaveis', icon: 'refresh-cw' as const },
    { value: String(user?.points || 0), label: 'Pontos totais', icon: 'star' as const },
    { value: String(totalScanPoints), label: 'Pontos no historico', icon: 'zap' as const },
  ];

  const impactoStyle = useAnimatedStyle(() => ({ opacity: impactoOpacity.value }));
  const guiaStyle = useAnimatedStyle(() => ({ opacity: guiaOpacity.value }));

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Ola, {user?.name?.split(' ')[0] || 'usuario'}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Nivel {user?.level || 1}</Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>{user?.points || 0} / {nextLevelPoints} pts</Text>
          <Text style={styles.progressSub}>Proximo nivel</Text>
        </View>
        <ProgressBar progress={levelProgress} />
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tabBtn, activeTab === 'impacto' && styles.tabBtnActive]}
          onPress={() => switchTab('impacto')}
        >
          <Text style={[styles.tabText, activeTab === 'impacto' && styles.tabTextActive]}>
            Impacto
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeTab === 'guia' && styles.tabBtnActive]}
          onPress={() => switchTab('guia')}
        >
          <Text style={[styles.tabText, activeTab === 'guia' && styles.tabTextActive]}>
            Guia
          </Text>
        </Pressable>
      </View>

      {activeTab === 'impacto' && (
        <Animated.View style={impactoStyle}>
          {loading ? (
            <View style={styles.statePanel}>
              <ActivityIndicator color={colors.green} />
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.statePanel}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.metricGrid}>
            {impactMetrics.map((metric) => (
              <View key={metric.label} style={styles.metricCell}>
                <ImpactCard value={metric.value} label={metric.label} icon={metric.icon} />
              </View>
            ))}
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHead}>
              <Text style={styles.panelTitle}>Atividade semanal</Text>
              <Text style={styles.panelSub}>Real</Text>
            </View>
            <View style={styles.chart}>
              {weeklyBars.map((bar, index) => (
                <AnimatedBar key={bar.key} bar={bar} index={index} maxScans={maxScans} />
              ))}
            </View>
          </View>

          {!loading && scans.length === 0 ? (
            <View style={styles.statePanel}>
              <Text style={styles.emptyText}>Nenhum scan registrado ainda.</Text>
            </View>
          ) : null}
        </Animated.View>
      )}

      {activeTab === 'guia' && (
        <Animated.View style={guiaStyle}>
          <Text style={styles.guiaIntro}>
            Saiba como preparar cada tipo de residuo para o descarte correto.
          </Text>
          {GUIDE_CATEGORIES.map((category) => (
            <AccordionItem key={category.name} item={category} />
          ))}
        </Animated.View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  greeting: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(29,255,138,0.1)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  levelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  progressCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 20,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  progressLabel: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.green,
    letterSpacing: 0.4,
  },
  progressSub: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabBtnActive: {
    backgroundColor: colors.surface2,
    borderColor: colors.green,
    borderBottomWidth: 2,
  },
  tabText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: colors.green,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 8,
  },
  metricCell: {
    width: '50%',
    padding: 5,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  panelHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  panelTitle: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  panelSub: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: BAR_MAX_HEIGHT + 40,
  },
  statePanel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 12,
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
  guiaIntro: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.dim,
    lineHeight: 20,
    marginBottom: 16,
  },
});
