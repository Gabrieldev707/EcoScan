import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,        
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { ScanResult } from '../types/scan';
import { scansApi } from '../api/scans';
import { useAuth } from '../hooks/useAuth';

const { width: SW, height: SH } = Dimensions.get('window');
const FRAME = SW * 0.7;



// ─── types ───────────────────────────────────────────────────────────────────
type State = 'idle' | 'camera' | 'loading' | 'result';

interface CaptureData {
  uri: string;
  base64: string;
  city: string;
}
// ─── helpers ─────────────────────────────────────────────────────────────────
function categoryToHex(category: string): string {
  const map: Record<string, string> = {
    'Plástico': '#ef4444',
    'Papel':    '#3b82f6',
    'Metal':    '#eab308',
    'Vidro':    '#22c55e',
    'Orgânico': '#a16207',
    'Rejeito':  '#6b7280',
  };
  return map[category] ?? '#6b7280';
}

// ─── sub-components ──────────────────────────────────────────────────────────
function PulseButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Pressable style={styles.pulseBtn} onPress={onPress}>
        <Feather name="camera" size={36} color={colors.green} />
      </Pressable>
    </Animated.View>
  );
}

function ScanFrame() {
  const scanY = useSharedValue(0);

  useEffect(() => {
    scanY.value = withRepeat(
      withSequence(
        withTiming(FRAME - 4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [scanY]);

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value }],
  }));

  const corner = (pos: object) => (
    <View style={[styles.corner, pos]} />
  );

  return (
    <View style={styles.frameBox}>
      {corner(styles.cornerTL)}
      {corner(styles.cornerTR)}
      {corner(styles.cornerBL)}
      {corner(styles.cornerBR)}
      <Animated.View style={[styles.scanLine, scanStyle]} />
    </View>
  );
}

function LoadingOverlay({ uri }: { uri: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={styles.loadingTitle}>Analisando resíduo...</Text>
        <Animated.Text style={[styles.loadingSub, pulseStyle]}>
          IA processando imagem
        </Animated.Text>
      </View>
    </View>
  );
}

function ResultCard({
  result,
  capture,
  onSave,
  onReset,
}: {
  result: ScanResult;
  capture: CaptureData;
  onSave: () => Promise<void>;
  onReset: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const cardY = useSharedValue(SH);
  const itemO = useSharedValue(0);
  const instrO = useSharedValue(0);
  const ptsO = useSharedValue(0);
  const locO = useSharedValue(0);
  const btnO = useSharedValue(0);

  useEffect(() => {
    cardY.value = withSpring(0, { damping: 18, stiffness: 120 });
    itemO.value = withDelay(200, withTiming(1, { duration: 300 }));
    instrO.value = withDelay(350, withTiming(1, { duration: 300 }));
    ptsO.value = withDelay(500, withTiming(1, { duration: 300 }));
    locO.value = withDelay(620, withTiming(1, { duration: 300 }));
    btnO.value = withDelay(750, withTiming(1, { duration: 300 }));
  }, [cardY, itemO, instrO, ptsO, locO, btnO]);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateY: cardY.value }] }));
  const itemStyle = useAnimatedStyle(() => ({ opacity: itemO.value }));
  const instrStyle = useAnimatedStyle(() => ({ opacity: instrO.value }));
  const ptsStyle = useAnimatedStyle(() => ({ opacity: ptsO.value }));
  const locStyle = useAnimatedStyle(() => ({ opacity: locO.value }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnO.value }));

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    await onSave();
    setSaving(false);
    setSaved(true);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image source={{ uri: capture.uri }} style={styles.resultBg} resizeMode="cover" />
      <View style={styles.resultBgOverlay} />

      {/* bin badge */}
      <View style={[styles.badge, { backgroundColor: result.binHex + '33', borderColor: result.binHex }]}>
        <View style={[styles.badgeDot, { backgroundColor: result.binHex }]} />
        <Text style={[styles.badgeText, { color: result.binHex }]}>{result.category}</Text>
      </View>

      <Animated.View style={[styles.card, cardStyle]}>
        <Animated.Text style={[styles.cardItem, itemStyle]}>{result.item}</Animated.Text>

        <Animated.View style={[styles.binRow, instrStyle]}>
          <View style={[styles.binIcon, { borderColor: result.binHex }]}>
            <Feather name="trash-2" size={20} color={result.binHex} />
          </View>
          <Text style={styles.cardInstr}>{result.howToDispose}</Text>
        </Animated.View>

        <Animated.View style={[styles.ptsRow, ptsStyle]}>
          <Feather name="zap" size={18} color={colors.green} />
          <Text style={styles.ptsText}>+{result.points} pts</Text>
          {result.canRecycle && (
            <View style={styles.recycleBadge}>
              <Feather name="refresh-cw" size={12} color={colors.lime} />
              <Text style={styles.recycleText}>Reciclável</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View style={[styles.locRow, locStyle]}>
          <Feather name="map-pin" size={13} color={colors.muted} />
          <Text style={styles.locText}>{capture.city}</Text>
        </Animated.View>

        <Animated.View style={[styles.btnGroup, btnStyle]}>
          <Pressable
            style={[styles.btnSave, saved && styles.btnSaved]}
            onPress={handleSave}
            disabled={saving || saved}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.bg} />
            ) : (
              <Text style={styles.btnSaveText}>{saved ? 'Salvo!' : 'Salvar descarte'}</Text>
            )}
          </Pressable>
          <Pressable style={styles.btnReset} onPress={onReset}>
            <Feather name="camera" size={16} color={colors.green} />
            <Text style={styles.btnResetText}>Escanear outro</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────
export function ScannerScreen() {
  const { token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<State>('idle');
  const [capture, setCapture] = useState<CaptureData | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const getCity = async (): Promise<string> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return 'Localização indisponível';
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync(loc.coords);
      return geo ? `${geo.city ?? geo.district}, ${geo.region}` : 'Localização desconhecida';
    } catch {
      return 'Localização indisponível';
    }
  };

  const runScan = useCallback(async (uri: string, base64: string) => {
    const city = await getCity();
    setCapture({ uri, base64, city });
    setState('loading');
  
    try {
      const scan = await scansApi.create(base64);
      setResult({
        item: scan.wasteType,
        category: scan.category,
        binColor: scan.disposalGuide,
        binHex: categoryToHex(scan.category),
        howToDispose: scan.disposalGuide,
        canRecycle: scan.category !== 'Rejeito',
        points: scan.points,
      });
      setState('result');
    } catch {
      setState('idle');
      Alert.alert('Erro', 'Não foi possível identificar o resíduo.');
    }
  }, []);

  const openCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }
    setState('camera');
  };

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ base64: true, quality: 0.6 });
    if (!photo?.uri || !photo.base64) return;
    setState('loading');
    await runScan(photo.uri, photo.base64);
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.6,
    });
    if (res.canceled || !res.assets[0]) return;
    const { uri, base64 } = res.assets[0];
    if (!base64) return;
    await runScan(uri, base64);
  };

  const reset = () => {
    setCapture(null);
    setResult(null);
    setState('idle');
  };

  // ── render ─────────────────────────────────────────────────────────────────
  if (state === 'idle') {
    return (
      <View style={styles.root}>
        <PulseButton onPress={openCamera} />
        <Text style={styles.idleHint}>Aponte para um resíduo</Text>
        <Pressable style={styles.galleryBtn} onPress={pickImage}>
          <Feather name="image" size={16} color={colors.muted} />
          <Text style={styles.galleryText}>Escolher da galeria</Text>
        </Pressable>
      </View>
    );
  }

  if (state === 'camera') {
    return (
      <View style={styles.root}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

        {/* dark vignette */}
        <View style={styles.vignetteTop} />
        <View style={styles.vignetteBottom} />

        <ScanFrame />

        <Pressable style={styles.closeBtn} onPress={() => setState('idle')}>
          <Feather name="x" size={24} color={colors.text} />
        </Pressable>

        <Pressable style={styles.captureBtn} onPress={takePicture}>
          <View style={styles.captureBtnInner} />
        </Pressable>
      </View>
    );
  }

  if (state === 'loading' && capture) {
    return (
      <View style={styles.root}>
        <LoadingOverlay uri={capture.uri} />
      </View>
    );
  }

  if (state === 'result' && capture && result) {
    return (
      <View style={styles.root}>
        <ResultCard
          result={result}
          capture={capture}
          onSave={async () => {}}
          onReset={reset}
        />
      </View>
    );
  }

  return <View style={styles.root} />;
}

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  // idle
  pulseBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface2,
    borderWidth: 2,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleHint: {
    marginTop: 24,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.text,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  galleryBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  galleryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // camera
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SH * 0.22,
    backgroundColor: 'rgba(7,9,10,0.72)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SH * 0.22,
    backgroundColor: 'rgba(7,9,10,0.72)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  frameBox: {
    position: 'absolute',
    width: FRAME,
    height: FRAME,
    top: (SH - FRAME) / 2,
    left: (SW - FRAME) / 2,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: colors.green,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 4 },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.green,
    opacity: 0.8,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(7,9,10,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtn: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(29,255,138,0.08)',
  },
  captureBtnInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.green,
  },

  // loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,9,10,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    marginTop: 8,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  loadingSub: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.green,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },

  // result
  resultBg: { ...StyleSheet.absoluteFillObject },
  resultBgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,9,10,0.55)' },
  badge: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 2,
    borderWidth: 1,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    padding: 24,
    paddingBottom: 36,
    gap: 16,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  cardItem: {
    fontFamily: fonts.display,
    fontSize: 46,
    color: colors.text,
    lineHeight: 48,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  binRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  binIcon: {
    width: 40,
    height: 40,
    borderRadius: 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardInstr: { flex: 1, fontFamily: fonts.bodyLight, fontSize: 14, color: colors.text, lineHeight: 20 },
  ptsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ptsText: { fontFamily: fonts.display, fontSize: 32, color: colors.green, letterSpacing: 0.5 },
  recycleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.lime + '44',
  },
  recycleText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.lime,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locText: { fontFamily: fonts.bodyLight, fontSize: 12, color: colors.muted },
  btnGroup: { gap: 10, marginTop: 4 },
  btnSave: {
    backgroundColor: colors.green,
    borderRadius: 2,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSaved: { backgroundColor: colors.greenDim },
  btnSaveText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.bg,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  btnReset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnResetText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.green,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
