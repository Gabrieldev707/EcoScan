import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import { authApi } from '../api/auth';
import { EcoButton } from '../components/EcoButton';
import { EcoInput } from '../components/EcoInput';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type Props = StackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const shakeX = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Informe seu e-mail.');
      setSuccessMessage('');
      shake();
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await authApi.forgotPassword(trimmedEmail);
      setSuccessMessage(response.message);
    } catch (error) {
      setErrorMessage((error as Error).message);
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={18} color={colors.green} />
        </Pressable>

        <View style={styles.logoRow}>
          <Text style={styles.logoText}>EcoScan</Text>
          <View style={styles.dot} />
        </View>
        <Text style={styles.sub}>Recuperacao de acesso</Text>

        <Animated.View style={[styles.card, { transform: [{ translateX: shakeX }] }]}>
          <Text style={styles.title}>Esqueceu</Text>
          <Text style={[styles.title, styles.titleSecond]}>a senha?</Text>
          <Text style={styles.lead}>Digite o e-mail da conta para receber as instrucoes.</Text>

          {errorMessage ? <Text style={styles.formError}>{errorMessage}</Text> : null}
          {successMessage ? <Text style={styles.formSuccess}>{successMessage}</Text> : null}

          <EcoInput
            label="E-mail"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <EcoButton label="Enviar instrucoes" onPress={handleSubmit} loading={loading} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    backgroundColor: colors.surface,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  logoText: {
    fontFamily: fonts.display,
    fontSize: 38,
    color: colors.text,
    letterSpacing: 1.2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
  sub: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.green,
    letterSpacing: 2.1,
    textTransform: 'uppercase',
    marginBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(29,255,138,0.04)',
    borderRadius: 2,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 50,
    color: colors.text,
    lineHeight: 48,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  titleSecond: {
    marginBottom: 8,
  },
  lead: {
    fontFamily: fonts.bodyLight,
    fontSize: 14,
    color: colors.dim,
    marginBottom: 28,
    lineHeight: 20,
  },
  formError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
    lineHeight: 18,
    marginBottom: 14,
  },
  formSuccess: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.green,
    lineHeight: 18,
    marginBottom: 14,
  },
});
