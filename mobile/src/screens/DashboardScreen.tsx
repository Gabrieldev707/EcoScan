import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const metrics = [
  { value: '147', label: 'Scans este mês', delta: '+18%', icon: 'camera' as const },
  { value: '12,4 kg', label: 'Material reciclado', delta: '+24%', icon: 'refresh-cw' as const },
  { value: '3,2 kg', label: 'CO₂ evitado', delta: '+9%', icon: 'wind' as const },
  { value: '1.760', label: 'EcoPoints', delta: '+42%', icon: 'star' as const },
];

const activity = [
  { day: 'Seg', height: 99, scans: 18 },
  { day: 'Ter', height: 130, scans: 24 },
  { day: 'Qua', height: 65, scans: 12 },
  { day: 'Qui', height: 166, scans: 31 },
  { day: 'Sex', height: 148, scans: 28 },
  { day: 'Sáb', height: 115, scans: 22 },
  { day: 'Dom', height: 68, scans: 12 },
];

const scans = [
  { name: 'Garrafa PET - 600 ml', meta: 'Hoje, 09:42 - Lixeira amarela', points: '+12', icon: 'package' as const },
  { name: 'Caixa de papelão', meta: 'Hoje, 08:11 - Lixeira azul', points: '+8', icon: 'file-text' as const },
  { name: 'Pilha AA - 4 un', meta: 'Ontem, 17:30 - Ponto especial', points: '+30', icon: 'battery-charging' as const },
  { name: 'Carregador celular', meta: 'Ontem, 14:05 - E-lixo', points: '+22', icon: 'cpu' as const },
];

export function DashboardScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.eyebrow}>
          <Feather name="bar-chart-2" size={12} color={colors.green} />
          <Text style={styles.eyebrowText}>Dashboard</Text>
        </View>
        <Text style={styles.title}>Seu progresso, tangível.</Text>
        <Text style={styles.sub}>
          Métricas em tempo real, histórico de scans e impacto coletivo em um painel direto para uso diário.
        </Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>Nível 8 - Defensora</Text>
          <Text style={styles.progressPts}>1.760<Text style={styles.progressDenom}> / 2.000</Text></Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.metricGrid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metric}>
            <View style={styles.metricTop}>
              <View style={styles.metricIcon}>
                <Feather name={metric.icon} size={15} color={colors.green} />
              </View>
              <Text style={styles.metricDelta}>{metric.delta}</Text>
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHead}>
          <Text style={styles.panelTitle}>Atividade semanal</Text>
          <Text style={styles.panelLink}>Semana</Text>
        </View>
        <View style={styles.chart}>
          {activity.map((item) => (
            <View key={item.day} style={styles.barWrap}>
              <Text style={styles.barTip}>{item.scans}</Text>
              <View style={[styles.bar, { height: item.height }]} />
              <Text style={styles.barDay}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHead}>
          <Text style={styles.panelTitle}>Últimos scans</Text>
          <Text style={styles.panelLink}>Ver tudo</Text>
        </View>
        {scans.map((scan) => (
          <View key={scan.name} style={styles.scanRow}>
            <View style={styles.scanIcon}>
              <Feather name={scan.icon} size={15} color={colors.green} />
            </View>
            <View style={styles.scanBody}>
              <Text style={styles.scanName}>{scan.name}</Text>
              <Text style={styles.scanMeta}>{scan.meta}</Text>
            </View>
            <Text style={styles.scanPts}>{scan.points}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  header: {
    marginBottom: 26,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(29,255,138,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 18,
  },
  eyebrowText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 58,
    lineHeight: 54,
    color: colors.text,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  sub: {
    marginTop: 12,
    fontFamily: fonts.bodyLight,
    fontSize: 14,
    lineHeight: 21,
    color: colors.dim,
  },
  progressCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    padding: 18,
    marginBottom: 12,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  progressLabel: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.text,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  progressPts: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.green,
    lineHeight: 30,
  },
  progressDenom: {
    fontSize: 17,
    color: colors.dim,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '88%',
    height: '100%',
    backgroundColor: colors.green,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 2,
  },
  metric: {
    width: '50%',
    padding: 5,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  metricIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(29,255,138,0.08)',
  },
  metricDelta: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1,
  },
  metricValue: {
    fontFamily: fonts.display,
    fontSize: 42,
    lineHeight: 42,
    color: colors.text,
    letterSpacing: 0.2,
  },
  metricLabel: {
    marginTop: 6,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    lineHeight: 15,
    color: colors.dim,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    padding: 18,
    marginTop: 12,
  },
  panelHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  panelTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  panelLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  chart: {
    height: 180,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
  },
  barWrap: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
  },
  barTip: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.green,
  },
  bar: {
    width: '100%',
    maxWidth: 28,
    backgroundColor: colors.green,
  },
  barDay: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  scanIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(29,255,138,0.08)',
  },
  scanBody: {
    flex: 1,
    minWidth: 0,
  },
  scanName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.text,
  },
  scanMeta: {
    marginTop: 3,
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  scanPts: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.green,
    letterSpacing: 0.4,
  },
});
