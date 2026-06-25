import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  Pressable,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { ImpactCard } from "../components/ImpactCard";
import { MedalCard } from "../components/MedalCard";
import { EcoButton } from "../components/EcoButton";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { scansApi, type Scan } from "../api/scans";
import { useAuth } from "../hooks/useAuth";

type Props = {
  route: { params: { name: string } };
  onLogout?: () => void;
};

const MEDALS = [
  { title: "Primeiro Scan", icon: "camera" as const, earned: true },
  { title: "10 Descartes", icon: "repeat" as const, earned: true },
  { title: "Guardião Verde", icon: "shield" as const, earned: true },
  { title: "Mestre da Reciclagem", icon: "award" as const, earned: false },
];

function useEntryAnim(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay]);

  return { opacity, transform: [{ translateY }] };
}

export function ProfileScreen({ route, onLogout }: Props) {
  const { name } = route.params;
  const { user } = useAuth();
  const [recentScans, setRecentScans] = useState<Scan[]>([]);

  useEffect(() => {
    scansApi
      .list(1)
      .then((res) => setRecentScans(res.items.slice(0, 3)))
      .catch(() => setRecentScans([]));
  }, []);

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const headerAnim = useEntryAnim(0);
  const impactAnim = useEntryAnim(100);
  const medalsAnim = useEntryAnim(200);
  const historyAnim = useEntryAnim(300);
  const logoutAnim = useEntryAnim(400);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    onLogout?.();
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View style={headerAnim}>
        <LinearGradient
          colors={[colors.bg, colors.surface2]}
          style={styles.header}
        >
          <LinearGradient
            colors={[colors.greenDim, colors.green]}
            style={styles.avatar}
          >
            <Text style={styles.initials}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Nível {user?.level ?? 1} — Guardião Verde
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.body}>
        {/* Impact Grid */}
        <Animated.View style={impactAnim}>
          <Text style={styles.sectionTitle}>Seu impacto</Text>
          <View style={styles.grid}>
            <View style={styles.row}>
              <ImpactCard
                value={String(user?.points ?? 0)}
                label="Pontos acumulados"
                icon="star"
              />
              <ImpactCard value="12,8 kg" label="CO₂ evitado" icon="wind" />
            </View>
            <View style={styles.row}>
              <ImpactCard value="340 L" label="Água poupada" icon="droplet" />
              <ImpactCard value="47" label="Itens reciclados" icon="package" />
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
            {MEDALS.map((m) => (
              <MedalCard
                key={m.title}
                title={m.title}
                icon={m.icon}
                earned={m.earned}
              />
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
            {recentScans.length === 0 ? (
              <View style={styles.scanRow}>
                <Text style={styles.scanDate}>
                  Nenhum descarte registrado ainda.
                </Text>
              </View>
            ) : (
              recentScans.map((s) => (
                <View key={s.id} style={styles.scanRow}>
                  <View style={styles.scanIcon}>
                    <Feather name="package" size={16} color={colors.green} />
                  </View>
                  <View style={styles.scanInfo}>
                    <Text style={styles.scanName}>{s.wasteType}</Text>
                    <Text style={styles.scanDate}>
                      {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                  <Text style={styles.scanPts}>+{s.points}</Text>
                </View>
              ))
            )}
          </View>
        </Animated.View>

        {/* Logout */}
        <Animated.View style={[logoutAnim, styles.logoutWrap]}>
          <EcoButton
            label="Sair da conta"
            onPress={handleLogout}
            variant="danger"
          />
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
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
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
    textTransform: "capitalize",
    lineHeight: 46,
  },
  badge: {
    backgroundColor: "rgba(29,255,138,0.12)",
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
    textTransform: "uppercase",
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
    textTransform: "uppercase",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
  },
  grid: {
    marginBottom: 28,
    marginHorizontal: -5,
  },
  row: {
    flexDirection: "row",
  },
  medals: {
    paddingBottom: 8,
    marginBottom: 28,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  scanList: {
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 28,
  },
  scanRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scanIcon: {
    width: 36,
    height: 36,
    borderRadius: 2,
    backgroundColor: "rgba(29,255,138,0.08)",
    alignItems: "center",
    justifyContent: "center",
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
  logoutWrap: {
    marginBottom: 40,
  },
});
