import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const ecopoints = [
  { name: 'Cooperativa Verde Vida', distance: '450 m', accepts: 'Plástico, metal, papel', status: 'Aberto' },
  { name: 'Ecoponto Açude Velho', distance: '1,2 km', accepts: 'Eletrônicos e pilhas', status: 'Até 18h' },
  { name: 'Mercado Sustentável', distance: '1,8 km', accepts: 'Óleo, vidro, embalagens', status: 'Parceiro' },
];

export function MapScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.eyebrow}>
          <Feather name="map-pin" size={12} color={colors.green} />
          <Text style={styles.eyebrowText}>Mapa</Text>
        </View>
        <Text style={styles.title}>Pontos de coleta próximos.</Text>
        <Text style={styles.sub}>
          Uma leitura compacta dos ecopontos ao redor, seguindo o mesmo foco do web: ação rápida e destino correto.
        </Text>
      </View>

      <View style={styles.heroPanel}>
        <View style={styles.mapGrid}>
          {Array.from({ length: 18 }).map((_, index) => (
            <View key={index} style={[styles.mapCell, index === 7 && styles.mapCellActive]} />
          ))}
        </View>
        <View style={styles.locationBadge}>
          <Feather name="navigation" size={14} color={colors.bg} />
          <Text style={styles.locationText}>Campina Grande</Text>
        </View>
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Ecopontos</Text>
        <Text style={styles.sectionLink}>500 m</Text>
      </View>

      {ecopoints.map((point) => (
        <View key={point.name} style={styles.pointCard}>
          <View style={styles.pointIcon}>
            <Feather name="map-pin" size={16} color={colors.green} />
          </View>
          <View style={styles.pointBody}>
            <View style={styles.pointTop}>
              <Text style={styles.pointName}>{point.name}</Text>
              <Text style={styles.distance}>{point.distance}</Text>
            </View>
            <Text style={styles.accepts}>{point.accepts}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.status}>{point.status}</Text>
            </View>
          </View>
        </View>
      ))}
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
  heroPanel: {
    height: 220,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginBottom: 26,
  },
  mapGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 14,
    gap: 8,
  },
  mapCell: {
    width: '30%',
    height: 24,
    borderWidth: 1,
    borderColor: 'rgba(29,255,138,0.08)',
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  mapCellActive: {
    backgroundColor: 'rgba(29,255,138,0.18)',
    borderColor: colors.green,
  },
  locationBadge: {
    position: 'absolute',
    left: 18,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.green,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  locationText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.bg,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    textTransform: 'uppercase',
  },
  sectionLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  pointCard: {
    flexDirection: 'row',
    gap: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 10,
  },
  pointIcon: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(29,255,138,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointBody: {
    flex: 1,
    minWidth: 0,
  },
  pointTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pointName: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text,
  },
  distance: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.green,
  },
  accepts: {
    marginTop: 4,
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.dim,
  },
  statusRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  status: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
});
