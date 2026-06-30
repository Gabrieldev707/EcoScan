import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { communityApi } from '../api/community';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { CommunityFeedItem, CommunityOverview, RankingUser } from '../types/community';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ComponentProps<typeof Feather>['name'] }) {
  return (
    <View style={styles.statCell}>
      <View style={styles.statCard}>
        <Feather name={icon} size={16} color={colors.green} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function RankingRow({ user }: { user: RankingUser }) {
  return (
    <View style={[styles.rankingRow, user.isCurrentUser && styles.rankingRowActive]}>
      <View style={[styles.rankBadge, user.rank <= 3 && styles.rankBadgeTop]}>
        <Text style={[styles.rankText, user.rank <= 3 && styles.rankTextTop]}>#{user.rank}</Text>
      </View>
      <View style={styles.rankingInfo}>
        <Text style={styles.rankingName} numberOfLines={1}>{user.name}</Text>
        <Text style={styles.rankingMeta}>Nivel {user.level} / {user.scans} scans</Text>
      </View>
      <View style={styles.rankingScore}>
        <Text style={styles.points}>{user.points}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );
}

function FeedRow({ item }: { item: CommunityFeedItem }) {
  const source = item.classificationSource === 'fallback' ? 'local' : item.classificationSource;

  return (
    <View style={styles.feedRow}>
      <View style={styles.feedIcon}>
        <Feather name={item.canRecycle ? 'refresh-cw' : 'trash-2'} size={15} color={item.canRecycle ? colors.lime : colors.muted} />
      </View>
      <View style={styles.feedInfo}>
        <View style={styles.feedTop}>
          <Text style={styles.feedUser} numberOfLines={1}>{item.user.name}</Text>
          <Text style={styles.feedDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.feedWaste} numberOfLines={1}>{item.wasteType}</Text>
        <Text style={styles.feedMeta}>{item.category} / {item.city} / IA {source}</Text>
      </View>
      <Text style={styles.feedPoints}>+{item.points}</Text>
    </View>
  );
}

export function CommunityScreen() {
  const [overview, setOverview] = useState<CommunityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadCommunity = useCallback(async (mode: 'load' | 'refresh' = 'load') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);

    try {
      const data = await communityApi.overview(10);
      setOverview(data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCommunity();
    }, [loadCommunity]),
  );

  const summary = overview?.summary;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={colors.green}
          onRefresh={() => loadCommunity('refresh')}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.sectionHead}>
          <Feather name="users" size={16} color={colors.green} />
          <Text style={styles.sectionTitle}>Comunidade</Text>
        </View>
        <Pressable style={styles.iconBtn} onPress={() => loadCommunity('refresh')}>
          <Feather name="refresh-cw" size={16} color={colors.green} />
        </Pressable>
      </View>

      {loading && !overview ? (
        <View style={styles.statePanel}>
          <ActivityIndicator color={colors.green} />
          <Text style={styles.stateText}>Carregando comunidade...</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={styles.statePanel}>
          <Feather name="alert-circle" size={18} color={colors.error} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {summary ? (
        <View style={styles.statGrid}>
          <StatCard label="Sua posicao" value={'#' + summary.currentUserRank} icon="award" />
          <StatCard label="Membros" value={String(summary.totalMembers)} icon="users" />
          <StatCard label="Scans" value={String(summary.totalScans)} icon="camera" />
          <StatCard label="Reciclaveis" value={String(summary.recyclableScans)} icon="refresh-cw" />
        </View>
      ) : null}

      {overview ? (
        <>
          <View style={styles.panel}>
            <View style={styles.panelHead}>
              <Text style={styles.panelTitle}>Ranking</Text>
              <Text style={styles.panelSub}>Top EcoScanners</Text>
            </View>
            {overview.ranking.length ? overview.ranking.map((user) => (
              <RankingRow key={user.id} user={user} />
            )) : (
              <Text style={styles.emptyText}>Nenhum usuario pontuou ainda.</Text>
            )}
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHead}>
              <Text style={styles.panelTitle}>Atividade</Text>
              <Text style={styles.panelSub}>{summary?.totalPoints || 0} pts gerados</Text>
            </View>
            {overview.feed.length ? overview.feed.map((item) => (
              <FeedRow key={item.id} item={item} />
            )) : (
              <Text style={styles.emptyText}>Os descartes da comunidade aparecem aqui.</Text>
            )}
          </View>
        </>
      ) : null}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statePanel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 12,
    gap: 10,
    alignItems: 'center',
  },
  stateText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.dim,
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
    lineHeight: 18,
    textAlign: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 12,
  },
  statCell: {
    width: '50%',
    padding: 5,
  },
  statCard: {
    minHeight: 104,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 8,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    lineHeight: 36,
  },
  statLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 10,
  },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  panelTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  panelSub: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rankingRowActive: {
    backgroundColor: 'rgba(29,255,138,0.06)',
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  rankBadge: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  rankBadgeTop: {
    borderColor: colors.green,
  },
  rankText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.dim,
  },
  rankTextTop: {
    color: colors.green,
  },
  rankingInfo: {
    flex: 1,
    minWidth: 0,
  },
  rankingName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text,
  },
  rankingMeta: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: colors.dim,
    marginTop: 2,
  },
  rankingScore: {
    alignItems: 'flex-end',
  },
  points: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.green,
    lineHeight: 28,
  },
  pointsLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedIcon: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedInfo: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  feedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  feedUser: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.text,
  },
  feedDate: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.muted,
  },
  feedWaste: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.green,
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  feedMeta: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: colors.dim,
  },
  feedPoints: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.lime,
    lineHeight: 28,
  },
  emptyText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.dim,
    lineHeight: 18,
  },
});
