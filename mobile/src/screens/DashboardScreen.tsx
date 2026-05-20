import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { ImpactCard } from '../components/ImpactCard';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

// ─── mock data ───────────────────────────────────────────────────────────────

const IMPACT_METRICS = [
  { value: '47,3 kg', label: 'Descartados', icon: 'trash-2' as const },
  { value: '12,8 kg', label: 'CO2 Evitado', icon: 'wind' as const },
  { value: '340 L', label: 'Agua Poupada', icon: 'droplet' as const },
  { value: '2.840', label: 'EcoPoints', icon: 'star' as const },
];

const WEEKLY_BARS = [
  { day: 'Seg', scans: 18 },
  { day: 'Ter', scans: 24 },
  { day: 'Qua', scans: 12 },
  { day: 'Qui', scans: 31 },
  { day: 'Sex', scans: 28 },
  { day: 'Sab', scans: 22 },
  { day: 'Dom', scans: 12 },
];

const MAX_SCANS = Math.max(...WEEKLY_BARS.map((b) => b.scans));
const BAR_MAX_HEIGHT = 130;

const GUIDE_CATEGORIES = [
  {
    name: 'Plastico',
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
    name: 'Rejeito',
    color: '#6b7280',
    accepted: ['Fraldas', 'Papel higienico', 'Guardanapos usados'],
    rejected: ['Nada e reciclavel aqui'],
    tip: 'Descarte na lixeira cinza. Reduza ao maximo esse volume.',
  },
];

// ─── sub-components ──────────────────────────────────────────────────────────

function AnimatedBar({ scans, index }: { scans: number; index: number }) {
  const height = useSharedValue(0);
  const targetH = Math.round((scans / MAX_SCANS) * BAR_MAX_HEIGHT);

  useEffect(() => {
    height.value = withDelay(index * 60, withTiming(targetH, { duration: 600 }));
  }, [height, targetH, index]);

  const barStyle = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <View style={barStyles.wrap}>
      <Text style={barStyles.tip}>{scans}</Text>
      <Animated.View style={[barStyles.bar, barStyle]} />
      <Text style={barStyles.day}>{WEEKLY_BARS[index].day}</Text>
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
            {item.accepted.map((a) => (
              <View key={a} style={accordionStyles.pillGreen}>
                <Text style={accordionStyles.pillGreenText}>{a}</Text>
              </View>
            ))}
          </View>

          <Text style={accordionStyles.sectionLabel}>Nao aceitos</Text>
          <View style={accordionStyles.pills}>
            {item.rejected.map((r) => (
              <View key={r} style={accordionStyles.pillRed}>
                <Text style={accordionStyles.pillRedText}>{r}</Text>
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

// ─── animated progress bar ────────────────────────────────────────────────────

function ProgressBar() {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(200, withTiming(0.84, { duration: 900 }));
  }, [width]);

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

// ─── main screen ─────────────────────────────────────────────────────────────

type Tab = 'impacto' | 'guia';

export function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('impacto');
  const impactoOpacity = useSharedValue(1);
  const guiaOpacity = useSharedValue(0);

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

  const impactoStyle = useAnimatedStyle(() => ({ opacity: impactoOpacity.value }));
  const guiaStyle = useAnimatedStyle(() => ({ opacity: guiaOpacity.value }));

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Ola, Gabriel</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Nivel 8</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>2.840 / 3.000 pts</Text>
          <Text style={styles.progressSub}>Proximo nivel: Especialista</Text>
        </View>
        <ProgressBar />
      </View>

      {/* Tabs */}
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

      {/* Tab 1 — Impacto */}
      {activeTab === 'impacto' && (
        <Animated.View style={impactoStyle}>
          {/* 2x2 metric grid */}
          <View style={styles.metricGrid}>
            {IMPACT_METRICS.map((m) => (
              <View key={m.label} style={styles.metricCell}>
                <ImpactCard value={m.value} label={m.label} icon={m.icon} />
              </View>
            ))}
          </View>

          {/* Weekly chart */}
          <View style={styles.panel}>
            <View style={styles.panelHead}>
              <Text style={styles.panelTitle}>Atividade semanal</Text>
              <Text style={styles.panelSub}>Semana</Text>
            </View>
            <View style={styles.chart}>
              {WEEKLY_BARS.map((bar, i) => (
                <AnimatedBar key={bar.day} scans={bar.scans} index={i} />
              ))}
            </View>
          </View>

          {/* Streak card */}
          <View style={styles.streakCard}>
            <View style={styles.streakIcon}>
              <Feather name="zap" size={20} color={colors.green} />
            </View>
            <View style={styles.streakBody}>
              <Text style={styles.streakLabel}>Sequencia ativa</Text>
              <Text style={styles.streakValue}>12 dias consecutivos</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Tab 2 — Guia */}
      {activeTab === 'guia' && (
        <Animated.View style={guiaStyle}>
          <Text style={styles.guiaIntro}>
            Saiba como preparar cada tipo de residuo para o descarte correto.
          </Text>
          {GUIDE_CATEGORIES.map((cat) => (
            <AccordionItem key={cat.name} item={cat} />
          ))}
        </Animated.View>
      )}
    </ScrollView>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
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

  // header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
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

  // progress
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

  // tabs
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

  // impacto tab
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

  // chart
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

  // streak
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(29,255,138,0.04)',
    padding: 16,
  },
  streakIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(29,255,138,0.1)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  streakBody: {
    gap: 2,
  },
  streakLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  streakValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  // guia tab
  guiaIntro: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.dim,
    lineHeight: 20,
    marginBottom: 16,
  },
});
