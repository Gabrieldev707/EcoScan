import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const ranking = [
  { pos: '01', name: 'Júlia Santos', points: '1.760 pts' },
  { pos: '02', name: 'Rafael Sousa', points: '1.520 pts' },
  { pos: '03', name: 'Ana Moreira', points: '1.330 pts' },
];

const rewards = [
  { title: 'Cupom parceiro', detail: '500 EcoPoints' },
  { title: 'Selo do bairro', detail: 'Meta coletiva' },
  { title: 'Relatório ESG', detail: 'Equipe empresa' },
];

export function CommunityScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.eyebrow}>
          <Feather name="users" size={12} color={colors.green} />
          <Text style={styles.eyebrowText}>Comunidade</Text>
        </View>
        <Text style={styles.title}>Impacto coletivo em tempo real.</Text>
        <Text style={styles.sub}>
          Grupos, ranking e recompensas no mesmo ritmo visual do dashboard web.
        </Text>
      </View>

      <View style={styles.groupCard}>
        <View>
          <Text style={styles.groupLabel}>Meu grupo</Text>
          <Text style={styles.groupName}>Guardiões do Centro</Text>
        </View>
        <View style={styles.groupMetric}>
          <Text style={styles.groupNumber}>42</Text>
          <Text style={styles.groupUnit}>membros</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHead}>
          <Text style={styles.panelTitle}>Ranking</Text>
          <Text style={styles.panelLink}>Semana</Text>
        </View>
        {ranking.map((member) => (
          <View key={member.pos} style={styles.rankRow}>
            <Text style={styles.rankPos}>{member.pos}</Text>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{member.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <Text style={styles.rankName}>{member.name}</Text>
            <Text style={styles.rankPoints}>{member.points}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHead}>
          <Text style={styles.panelTitle}>Recompensas</Text>
          <Text style={styles.panelLink}>EcoPoints</Text>
        </View>
        <View style={styles.rewardGrid}>
          {rewards.map((reward) => (
            <View key={reward.title} style={styles.reward}>
              <Feather name="gift" size={17} color={colors.green} />
              <Text style={styles.rewardTitle}>{reward.title}</Text>
              <Text style={styles.rewardDetail}>{reward.detail}</Text>
            </View>
          ))}
        </View>
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
  groupCard: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(29,255,138,0.05)',
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
  },
  groupLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  groupName: {
    marginTop: 7,
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 34,
    color: colors.text,
    textTransform: 'uppercase',
  },
  groupMetric: {
    alignItems: 'flex-end',
  },
  groupNumber: {
    fontFamily: fonts.display,
    fontSize: 48,
    lineHeight: 48,
    color: colors.green,
  },
  groupUnit: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.dim,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
    marginTop: 12,
  },
  panelHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  panelTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.text,
    textTransform: 'uppercase',
  },
  panelLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rankPos: {
    width: 30,
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.green,
  },
  avatar: {
    width: 34,
    height: 34,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.bg,
  },
  rankName: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.text,
  },
  rankPoints: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.dim,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rewardGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  reward: {
    flex: 1,
    minHeight: 118,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    padding: 12,
  },
  rewardTitle: {
    marginTop: 12,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    lineHeight: 15,
    color: colors.text,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  rewardDetail: {
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.green,
  },
});
