import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ecoAlertsApi } from '../api/ecoalerts';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { EcoAlert, EcoAlertImagePayload, EcoAlertSeverity, EcoAlertStatus, EcoAlertType } from '../types/ecoalert';

type Coordinates = { lat: number; lng: number };

const TYPE_LABELS: Record<EcoAlertType, string> = {
  illegal_dumping: 'Descarte irregular',
  overflowing_bin: 'Lixeira cheia',
  street_litter: 'Lixo em via publica',
  hazardous_waste: 'Risco ambiental',
  blocked_drain: 'Bueiro obstruido',
  other: 'Ocorrencia urbana',
};

const SEVERITY_LABELS: Record<EcoAlertSeverity, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
};

const STATUS_LABELS: Record<EcoAlertStatus, string> = {
  received: 'Recebido',
  under_review: 'Em analise',
  forwarded: 'Encaminhado',
  resolved: 'Resolvido',
  rejected: 'Rejeitado',
};

const SEVERITY_COLORS: Record<EcoAlertSeverity, string> = {
  low: colors.accent,
  medium: colors.lime,
  high: colors.error,
};

function getSupportedMimeType(value?: string): EcoAlertImagePayload['mimeType'] {
  if (value === 'image/png' || value === 'image/webp') return value;
  return 'image/jpeg';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AlertCard({ alert }: { alert: EcoAlert }) {
  const severityColor = SEVERITY_COLORS[alert.severity];

  return (
    <View style={styles.alertCard}>
      <View style={styles.alertTopRow}>
        <View style={styles.alertCodeWrap}>
          <Text style={styles.alertCode}>{alert.alertCode}</Text>
          <Text style={styles.alertDate}>{formatDate(alert.createdAt)}</Text>
        </View>
        <View style={[styles.severityBadge, { borderColor: severityColor, backgroundColor: severityColor + '1f' }]}>
          <Text style={[styles.severityText, { color: severityColor }]}>{SEVERITY_LABELS[alert.severity]}</Text>
        </View>
      </View>

      <Text style={styles.alertType}>{TYPE_LABELS[alert.type]}</Text>
      <Text style={styles.alertSummary}>{alert.summary}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Feather name="clock" size={12} color={colors.accent} />
          <Text style={styles.metaText}>{STATUS_LABELS[alert.status]}</Text>
        </View>
        <View style={styles.metaChip}>
          <Feather name="cpu" size={12} color={colors.accent} />
          <Text style={styles.metaText}>{alert.analysisSource === 'gemini' ? 'Gemini' : 'Triagem'}</Text>
        </View>
      </View>

      {alert.detectedItems.length ? (
        <View style={styles.tagsRow}>
          {alert.detectedItems.slice(0, 4).map((item) => (
            <View key={item} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.actionBox}>
        <Text style={styles.actionLabel}>Proxima acao</Text>
        <Text style={styles.actionText}>{alert.recommendedAction}</Text>
      </View>
    </View>
  );
}

export function EcoAlertScreen() {
  const [previewUri, setPreviewUri] = useState<string | undefined>();
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [imageMimeType, setImageMimeType] = useState<EcoAlertImagePayload['mimeType']>('image/jpeg');
  const [city, setCity] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [note, setNote] = useState('');
  const [alerts, setAlerts] = useState<EcoAlert[]>([]);
  const [createdAlert, setCreatedAlert] = useState<EcoAlert | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const clearImage = useCallback(() => {
    setPreviewUri(undefined);
    setImageBase64(undefined);
    setImageMimeType('image/jpeg');
  }, []);

  const loadAlerts = useCallback(async () => {
    const data = await ecoAlertsApi.list(1, 10);
    setAlerts(data.items);
  }, []);

  useEffect(() => {
    loadAlerts().catch((error) => setErrorMessage((error as Error).message));
  }, [loadAlerts]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadAlerts();
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setRefreshing(false);
    }
  };

  const applyAsset = (asset: ImagePicker.ImagePickerAsset) => {
    setPreviewUri(asset.uri);
    setImageBase64(asset.base64 || undefined);
    setImageMimeType(getSupportedMimeType(asset.mimeType || undefined));
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage('Permita a camera para registrar o EcoAlerta.');
      return;
    }

    const response = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
    });
    const asset = response.canceled ? undefined : response.assets[0];
    if (asset?.uri) applyAsset(asset);
  };

  const pickImage = async () => {
    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
    });
    const asset = response.canceled ? undefined : response.assets[0];
    if (asset?.uri) applyAsset(asset);
  };

  const detectLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Permita a localizacao ou informe a cidade manualmente.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync(loc.coords);
      const cityName = geo?.city || geo?.subregion || geo?.district;
      const region = geo?.region;
      const label = [cityName, region].filter(Boolean).join(', ');

      setCoordinates({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      if (label) setCity(label);
      setErrorMessage('');
    } catch {
      setErrorMessage('Nao foi possivel detectar a localizacao.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    setCoordinates(null);
  };

  const submit = async () => {
    if (!imageBase64) {
      setErrorMessage('Tire ou selecione uma foto do ponto de lixo.');
      return;
    }

    if (!coordinates) {
      setErrorMessage('Use o botao de localizacao para anexar o ponto exato.');
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Informe a cidade do alerta.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const alert = await ecoAlertsApi.create({
        city: city.trim(),
        lat: coordinates.lat,
        lng: coordinates.lng,
        note: note.trim() || undefined,
        image: { base64: imageBase64, mimeType: imageMimeType },
      });
      setCreatedAlert(alert);
      setAlerts((current) => [alert, ...current.filter((item) => item.id !== alert.id)].slice(0, 10));
      setNote('');
      clearImage();
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.green} />}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Feather name="alert-triangle" size={22} color={colors.green} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.kicker}>EcoAlerta</Text>
          <Text style={styles.title}>Reportar ponto de lixo</Text>
          <Text style={styles.lead}>Registre acumulacao de lixo, descarte irregular ou risco ambiental com foto e localizacao.</Text>
        </View>
      </View>

      <View style={styles.capturePanel}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.emptyPreview}>
            <Feather name="camera" size={34} color={colors.muted} />
            <Text style={styles.emptyPreviewText}>Foto da ocorrencia</Text>
          </View>
        )}

        <View style={styles.mediaRow}>
          <Pressable style={styles.mediaButton} onPress={takePhoto}>
            <Feather name="camera" size={15} color={colors.green} />
            <Text style={styles.mediaButtonText}>Camera</Text>
          </Pressable>
          <Pressable style={styles.mediaButton} onPress={pickImage}>
            <Feather name="image" size={15} color={colors.green} />
            <Text style={styles.mediaButtonText}>Galeria</Text>
          </Pressable>
          {previewUri ? (
            <Pressable style={styles.mediaButton} onPress={clearImage}>
              <Feather name="trash-2" size={15} color={colors.muted} />
              <Text style={styles.mediaButtonTextMuted}>Remover</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.formPanel}>
        <View style={styles.cityRow}>
          <TextInput
            value={city}
            onChangeText={handleCityChange}
            placeholder="Cidade"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.cityInput]}
            autoCapitalize="words"
          />
          <Pressable style={styles.locateButton} onPress={detectLocation} disabled={loadingLocation}>
            {loadingLocation ? (
              <ActivityIndicator size="small" color={colors.green} />
            ) : (
              <Feather name={coordinates ? 'check' : 'map-pin'} size={16} color={colors.green} />
            )}
          </Pressable>
        </View>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Observacao opcional: ex. tem mau cheiro, bloqueia calcada, perto de escola..."
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.noteInput]}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable style={[styles.submitButton, submitting && styles.submitButtonDisabled]} onPress={submit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <>
              <Feather name="send" size={16} color={colors.bg} />
              <Text style={styles.submitText}>Enviar EcoAlerta</Text>
            </>
          )}
        </Pressable>
      </View>

      {createdAlert ? (
        <View style={styles.protocolPanel}>
          <Text style={styles.protocolLabel}>Protocolo criado</Text>
          <Text style={styles.protocolCode}>{createdAlert.alertCode}</Text>
          <Text style={styles.protocolText}>{createdAlert.summary}</Text>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Meus alertas</Text>
        <Text style={styles.sectionMeta}>{alerts.length} recentes</Text>
      </View>

      {alerts.length ? (
        alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
      ) : (
        <View style={styles.emptyList}>
          <Text style={styles.emptyListText}>Nenhum EcoAlerta registrado ainda.</Text>
        </View>
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
    padding: 20,
    paddingTop: 58,
    paddingBottom: 34,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  kicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.green,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 2,
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.text,
    lineHeight: 42,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  lead: {
    marginTop: 8,
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.dim,
    lineHeight: 19,
  },
  capturePanel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 12,
  },
  preview: {
    width: '100%',
    height: 210,
    backgroundColor: colors.surface2,
  },
  emptyPreview: {
    height: 210,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyPreviewText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  mediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  mediaButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  mediaButtonTextMuted: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  formPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 10,
  },
  cityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cityInput: {
    flex: 1,
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
  noteInput: {
    minHeight: 92,
    paddingTop: 12,
    lineHeight: 20,
  },
  locateButton: {
    width: 50,
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
    lineHeight: 18,
  },
  submitButton: {
    minHeight: 50,
    backgroundColor: colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.bg,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  protocolPanel: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(29,255,138,0.08)',
    padding: 16,
    gap: 6,
  },
  protocolLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  protocolCode: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.text,
    letterSpacing: 0.6,
  },
  protocolText: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.dim,
    lineHeight: 19,
  },
  sectionHeader: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    textTransform: 'uppercase',
  },
  sectionMeta: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  alertCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 10,
  },
  alertTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  alertCodeWrap: {
    flex: 1,
  },
  alertCode: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.green,
    letterSpacing: 1.3,
  },
  alertDate: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
  severityBadge: {
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  severityText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  alertType: {
    fontFamily: fonts.display,
    fontSize: 25,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  alertSummary: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.dim,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  metaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: 'rgba(29,255,138,0.08)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionBox: {
    borderLeftWidth: 2,
    borderLeftColor: colors.green,
    paddingLeft: 10,
    gap: 3,
  },
  actionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  actionText: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  emptyList: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
