import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { scansApi } from '../api/scans';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { Scan, ScanImagePayload } from '../types/scan';

const { width: SW, height: SH } = Dimensions.get('window');
const FRAME = SW * 0.7;

const BIN_HEX_BY_COLOR: Record<string, string> = {
  Vermelho: '#ef4444',
  Azul: '#3b82f6',
  Amarelo: '#eab308',
  Verde: '#22c55e',
  Marrom: '#92400e',
  Cinza: '#6b7280',
};

const CLASSIFIER_LABELS = {
  gemini: 'Gemini ativo',
  groq: 'Groq ativo',
  fallback: 'Modo local',
} as const;

type Coordinates = { lat: number; lng: number };

type State = 'idle' | 'camera' | 'loading' | 'result';

function getSupportedMimeType(value?: string): ScanImagePayload['mimeType'] {
  if (value === 'image/png' || value === 'image/webp') return value;
  return 'image/jpeg';
}

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
        <Feather name="camera" size={34} color={colors.green} />
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

  const corner = (pos: object) => <View style={[styles.corner, pos]} />;

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

function LoadingOverlay({ uri }: { uri?: string }) {
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
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={styles.loadingTitle}>Registrando descarte...</Text>
        <Animated.Text style={[styles.loadingSub, pulseStyle]}>
          IA analisando imagem, residuo e guia de descarte
        </Animated.Text>
      </View>
    </View>
  );
}

function ResultCard({
  result,
  previewUri,
  onReset,
}: {
  result: Scan;
  previewUri?: string;
  onReset: () => void;
}) {
  const cardY = useSharedValue(SH);
  const binHex = BIN_HEX_BY_COLOR[result.binColor] || colors.green;
  const sourceLabel = CLASSIFIER_LABELS[result.classificationSource] || 'IA ativa';
  const confidenceLabel = Math.round(result.confidence * 100) + '%';
  const itemLabel = result.identifiedItem || result.wasteType;
  const materialLabel = result.material || 'nao informado';

  useEffect(() => {
    cardY.value = withSpring(0, { damping: 18, stiffness: 120 });
  }, [cardY]);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateY: cardY.value }] }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {previewUri ? <Image source={{ uri: previewUri }} style={styles.resultBg} resizeMode="cover" /> : null}
      <View style={styles.resultBgOverlay} />

      <View style={[styles.badge, { backgroundColor: `${binHex}33`, borderColor: binHex }]}>
        <View style={[styles.badgeDot, { backgroundColor: binHex }]} />
        <Text style={[styles.badgeText, { color: binHex }]}>{result.category}</Text>
      </View>

      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.cardItem} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.72}>
          {itemLabel}
        </Text>
        <View style={styles.sourceRow}>
          <Feather name={result.imageProvided ? 'image' : 'cpu'} size={13} color={colors.accent} />
          <Text style={styles.sourceText}>{sourceLabel} / confianca {confidenceLabel}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoChip}>
            <Text style={styles.infoLabel}>Material</Text>
            <Text style={styles.infoValue}>{materialLabel}</Text>
          </View>
          <View style={styles.infoChip}>
            <Text style={styles.infoLabel}>Foto</Text>
            <Text style={styles.infoValue}>{result.imageProvided ? 'analisada' : 'texto'}</Text>
          </View>
        </View>

        <View style={styles.binRow}>
          <View style={[styles.binIcon, { borderColor: binHex }]}>
            <Feather name="trash-2" size={20} color={binHex} />
          </View>
          <View style={styles.cardTextGroup}>
            <Text style={styles.binLabel}>Lixeira {result.binColor}</Text>
            <Text style={styles.cardInstr}>{result.disposalGuide}</Text>
          </View>
        </View>

        {result.reason ? <Text style={styles.reasonText}>{result.reason}</Text> : null}

        <View style={styles.ptsRow}>
          <Feather name="zap" size={18} color={colors.green} />
          <Text style={styles.ptsText}>+{result.points} pts</Text>
          {result.canRecycle && (
            <View style={styles.recycleBadge}>
              <Feather name="refresh-cw" size={12} color={colors.lime} />
              <Text style={styles.recycleText}>Reciclavel</Text>
            </View>
          )}
        </View>

        <View style={styles.locRow}>
          <Feather name="map-pin" size={13} color={colors.muted} />
          <Text style={styles.locText}>{result.city}</Text>
        </View>

        <Pressable style={styles.btnReset} onPress={onReset}>
          <Feather name="camera" size={16} color={colors.green} />
          <Text style={styles.btnResetText}>Registrar outro</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { refreshUser } = useAuth();
  const [state, setState] = useState<State>('idle');
  const [previewUri, setPreviewUri] = useState<string | undefined>();
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [imageMimeType, setImageMimeType] = useState<ScanImagePayload['mimeType']>('image/jpeg');
  const [wasteType, setWasteType] = useState('');
  const [city, setCity] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [result, setResult] = useState<Scan | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [detectingCity, setDetectingCity] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const clearImage = useCallback(() => {
    setPreviewUri(undefined);
    setImageBase64(undefined);
    setImageMimeType('image/jpeg');
  }, []);

  const detectCity = useCallback(async () => {
    setDetectingCity(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Informe a cidade manualmente.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync(loc.coords);
      const cityName = geo?.city || geo?.subregion || geo?.district;
      const region = geo?.region;
      const label = [cityName, region].filter(Boolean).join(', ');

      setCoordinates({ lat: loc.coords.latitude, lng: loc.coords.longitude });

      if (label) {
        setCity(label);
        setErrorMessage('');
      } else {
        setErrorMessage('Coordenadas detectadas. Confira a cidade manualmente.');
      }
    } catch {
      setErrorMessage('Nao foi possivel detectar a cidade.');
    } finally {
      setDetectingCity(false);
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
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.5, base64: true });
    if (!photo?.uri) return;
    setPreviewUri(photo.uri);
    setImageBase64(photo.base64 || undefined);
    setImageMimeType('image/jpeg');
    setState('idle');
  };

  const pickImage = async () => {
    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
    });
    const asset = response.canceled ? undefined : response.assets[0];
    if (!asset?.uri) return;
    setPreviewUri(asset.uri);
    setImageBase64(asset.base64 || undefined);
    setImageMimeType(getSupportedMimeType(asset.mimeType || undefined));
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    setCoordinates(null);
  };

  const createScan = async () => {
    const trimmedWasteType = wasteType.trim();
    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setErrorMessage('Informe a cidade do descarte.');
      return;
    }

    if (!trimmedWasteType && !imageBase64) {
      setErrorMessage('Tire uma foto ou descreva o residuo.');
      return;
    }

    if (previewUri && !imageBase64) {
      setErrorMessage('Nao consegui preparar a imagem. Tire a foto novamente ou remova a foto para registrar por texto.');
      return;
    }

    setErrorMessage('');
    setState('loading');

    try {
      const scan = await scansApi.create({
        wasteType: trimmedWasteType || undefined,
        city: trimmedCity,
        lat: coordinates?.lat,
        lng: coordinates?.lng,
        image: imageBase64 ? { base64: imageBase64, mimeType: imageMimeType } : undefined,
      });
      setResult(scan);
      await refreshUser();
      setState('result');
    } catch (error) {
      setErrorMessage((error as Error).message);
      setState('idle');
    }
  };

  const reset = () => {
    clearImage();
    setWasteType('');
    setResult(null);
    setErrorMessage('');
    setState('idle');
  };

  if (state === 'camera') {
    return (
      <View style={styles.root}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

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

  if (state === 'loading') {
    return (
      <View style={styles.root}>
        <LoadingOverlay uri={previewUri} />
      </View>
    );
  }

  if (state === 'result' && result) {
    return (
      <View style={styles.root}>
        <ResultCard result={result} previewUri={previewUri} onReset={reset} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {previewUri ? <Image source={{ uri: previewUri }} style={styles.previewBg} resizeMode="cover" /> : null}
      <View style={styles.idleOverlay} />

      <View style={styles.idleTop}>
        <PulseButton onPress={openCamera} />
        <Text style={styles.idleHint}>Registre um descarte</Text>
        <Text style={styles.idleSub}>Tire uma foto ou descreva o residuo para a IA classificar o descarte.</Text>

        <View style={styles.mediaActions}>
          <Pressable style={styles.galleryBtn} onPress={pickImage}>
            <Feather name="image" size={16} color={colors.muted} />
            <Text style={styles.galleryText}>Galeria</Text>
          </Pressable>
          {previewUri ? (
            <Pressable style={styles.galleryBtn} onPress={clearImage}>
              <Feather name="trash-2" size={16} color={colors.muted} />
              <Text style={styles.galleryText}>Remover foto</Text>
            </Pressable>
          ) : null}
        </View>
        {previewUri ? <Text style={styles.photoHint}>Foto anexada para analise visual</Text> : null}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Dados do descarte</Text>
        <Text style={styles.formHint}>Com foto, o nome do residuo e opcional.</Text>
        <TextInput
          value={wasteType}
          onChangeText={setWasteType}
          placeholder="Opcional com foto. Ex.: Garrafa PET"
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCapitalize="sentences"
        />
        <View style={styles.cityRow}>
          <TextInput
            value={city}
            onChangeText={handleCityChange}
            placeholder="Ex.: Campina Grande, PB"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.cityInput]}
            autoCapitalize="words"
          />
          <Pressable style={styles.locateCityBtn} onPress={detectCity} disabled={detectingCity}>
            {detectingCity ? (
              <ActivityIndicator size="small" color={colors.green} />
            ) : (
              <Feather name={coordinates ? 'check' : 'map-pin'} size={16} color={colors.green} />
            )}
          </Pressable>
        </View>

        {errorMessage ? <Text style={styles.formError}>{errorMessage}</Text> : null}

        <Pressable style={styles.btnSave} onPress={createScan}>
          <Text style={styles.btnSaveText}>Registrar scan</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  pulseBtn: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.surface2,
    borderWidth: 2,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleTop: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 22,
  },
  idleHint: {
    marginTop: 22,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.text,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  idleSub: {
    marginTop: 8,
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.dim,
    lineHeight: 19,
    textAlign: 'center',
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  galleryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  photoHint: {
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  previewBg: {
    ...StyleSheet.absoluteFillObject,
  },
  idleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,9,10,0.78)',
  },

  formCard: {
    width: '88%',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
    gap: 10,
  },
  formTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  formHint: {
    marginTop: -4,
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: colors.dim,
    lineHeight: 17,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: colors.text,
    paddingHorizontal: 14,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  cityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cityInput: {
    flex: 1,
  },
  locateCityBtn: {
    width: 50,
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
    lineHeight: 18,
  },

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

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,9,10,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  loadingTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    marginTop: 8,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  loadingSub: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.green,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  resultBg: { ...StyleSheet.absoluteFillObject },
  resultBgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,9,10,0.72)' },
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
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  sourceText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoChip: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  infoLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  infoValue: {
    marginTop: 3,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.text,
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
  cardTextGroup: {
    flex: 1,
    gap: 4,
  },
  binLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.green,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  cardInstr: { fontFamily: fonts.bodyLight, fontSize: 14, color: colors.text, lineHeight: 20 },
  reasonText: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: colors.dim,
    lineHeight: 18,
  },
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
    borderColor: `${colors.lime}44`,
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
  btnSave: {
    backgroundColor: colors.green,
    borderRadius: 2,
    paddingVertical: 14,
    alignItems: 'center',
  },
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
