import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { EcoPoint } from '../types/ecopoint';

const { height: SH } = Dimensions.get('window');

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MOCK_ECOPOINTS: EcoPoint[] = [
  {
    id: '1',
    name: 'Ecoponto Central',
    address: 'R. Venancio Neiva, 123',
    lat: -7.2301,
    lng: -35.8816,
    categories: ['Plastico', 'Papel', 'Metal'],
  },
  {
    id: '2',
    name: 'Ecoponto Bodocongo',
    address: 'Av. Mal. Floriano, 456',
    lat: -7.218,
    lng: -35.9012,
    categories: ['Vidro', 'Metal'],
  },
  {
    id: '3',
    name: 'Ponto Verde Universitario',
    address: 'R. Aprigio Veloso, 882',
    lat: -7.2156,
    lng: -35.9078,
    categories: ['Plastico', 'Papel'],
  },
  {
    id: '4',
    name: 'Ecoponto Malvinas',
    address: 'Av. Portugal, 789',
    lat: -7.2445,
    lng: -35.8923,
    categories: ['Metal', 'Vidro', 'Plastico'],
  },
  {
    id: '5',
    name: 'Coleta Seletiva Centro',
    address: 'R. Maciel Pinheiro, 234',
    lat: -7.2189,
    lng: -35.8801,
    categories: ['Papel', 'Plastico'],
  },
];

const CATEGORIES = ['Todos', 'Plastico', 'Papel', 'Metal', 'Vidro'];

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0c1010' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#07090a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a6255' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#10171a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#07090a' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#4a6255' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#10171a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#07090a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#0c1010' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#4a6255' }] },
];

export function MapScreen() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selected, setSelected] = useState<EcoPoint | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [proximityBanner, setProximityBanner] = useState<{ name: string; dist: number } | null>(null);
  const mapRef = useRef<MapView>(null);
  const proximityTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cardY = useSharedValue(SH);
  const bannerY = useSharedValue(-80);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateY: cardY.value }] }));
  const bannerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bannerY.value }] }));

  useEffect(() => {
    let watcher: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(coords);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.04, longitudeDelta: 0.04 }, 1000);

      watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          const nearby = MOCK_ECOPOINTS.find(
            (p) => haversine(latitude, longitude, p.lat, p.lng) < 500,
          );
          if (nearby) {
            const dist = Math.round(haversine(latitude, longitude, nearby.lat, nearby.lng));
            setProximityBanner({ name: nearby.name, dist });
            bannerY.value = withSpring(0, { damping: 14, stiffness: 100 });

            if (proximityTimeout.current) clearTimeout(proximityTimeout.current);
            proximityTimeout.current = setTimeout(() => {
              bannerY.value = withTiming(-80, { duration: 400 });
              setTimeout(() => setProximityBanner(null), 420);
            }, 4000);
          }
        },
      );
    })();

    return () => {
      watcher?.remove();
      if (proximityTimeout.current) clearTimeout(proximityTimeout.current);
    };
  }, [bannerY]);

  const filtered =
    activeCategory === 'Todos'
      ? MOCK_ECOPOINTS
      : MOCK_ECOPOINTS.filter((p) => p.categories.includes(activeCategory));

  const selectPoint = (point: EcoPoint) => {
    setSelected(point);
    cardY.value = withSpring(0, { damping: 16, stiffness: 120 });
  };

  const closeCard = () => {
    cardY.value = withTiming(SH, { duration: 300 });
    setTimeout(() => setSelected(null), 320);
  };

  const openMaps = (point: EcoPoint) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
    Linking.openURL(url);
  };

  const getDistance = (point: EcoPoint): string => {
    if (!userLocation) return '';
    const d = Math.round(haversine(userLocation.latitude, userLocation.longitude, point.lat, point.lng));
    return d < 1000 ? `${d} m` : `${(d / 1000).toFixed(1)} km`;
  };

  const locateUser = () => {
    if (!userLocation) return;
    mapRef.current?.animateToRegion(
      { ...userLocation, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      800,
    );
  };

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={{
          latitude: -7.2301,
          longitude: -35.8816,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filtered.map((point) => (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.lat, longitude: point.lng }}
            onPress={() => selectPoint(point)}
          >
            <View style={[styles.marker, selected?.id === point.id && styles.markerActive]}>
              <Feather name="trash-2" size={14} color={colors.green} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Proximity banner */}
      {proximityBanner && (
        <Animated.View style={[styles.banner, bannerStyle]}>
          <Feather name="map-pin" size={13} color={colors.bg} />
          <Text style={styles.bannerText}>
            Ecoponto proximo — {proximityBanner.name} a {proximityBanner.dist}m
          </Text>
        </Animated.View>
      )}

      {/* Category filter */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.pill, activeCategory === cat && styles.pillActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Locate user button */}
      <Pressable style={styles.locateBtn} onPress={locateUser}>
        <Feather name="navigation" size={18} color={colors.green} />
      </Pressable>

      {/* Ecopoint card */}
      {selected && (
        <Animated.View style={[styles.card, cardStyle]}>
          <Pressable style={styles.cardClose} onPress={closeCard}>
            <Feather name="x" size={18} color={colors.text} />
          </Pressable>

          <Text style={styles.cardName}>{selected.name}</Text>
          <Text style={styles.cardAddr}>{selected.address}</Text>

          <View style={styles.tagsRow}>
            {selected.categories.map((cat) => (
              <View key={cat} style={styles.tag}>
                <Text style={styles.tagText}>{cat}</Text>
              </View>
            ))}
            {userLocation ? (
              <View style={styles.distTag}>
                <Text style={styles.distTagText}>{getDistance(selected)}</Text>
              </View>
            ) : null}
          </View>

          <Pressable style={styles.dirBtn} onPress={() => openMaps(selected)}>
            <Feather name="map-pin" size={15} color={colors.bg} />
            <Text style={styles.dirBtnText}>Como chegar</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // marker
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerActive: {
    backgroundColor: 'rgba(29,255,138,0.18)',
    borderColor: colors.green,
    transform: [{ scale: 1.2 }],
  },

  // proximity banner
  banner: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    backgroundColor: colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  bannerText: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.bg,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // category filter
  filterWrap: {
    position: 'absolute',
    top: 108,
    left: 0,
    right: 0,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: 'rgba(29,255,138,0.12)',
    borderColor: colors.green,
  },
  pillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  pillTextActive: {
    color: colors.green,
  },

  // locate button
  locateBtn: {
    position: 'absolute',
    bottom: 220,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ecopoint card
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  cardClose: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingRight: 40,
  },
  cardAddr: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.dim,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(29,255,138,0.08)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  tagText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  distTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distTagText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.accent,
    letterSpacing: 0.4,
  },
  dirBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.green,
    paddingVertical: 14,
  },
  dirBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.bg,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
