import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
  StyleSheet,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../hooks/useAuth';
import { EcoInput } from '../components/EcoInput';
import { EcoButton } from '../components/EcoButton';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const shakeX = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  // Pulsing dot
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseScale]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Informe e-mail e senha.');
      shake();
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      await login(email.trim(), password);
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
        {/* Logo */}
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>EcoScan</Text>
          <Animated.View style={[styles.dot, { transform: [{ scale: pulseScale }] }]} />
        </View>
        <Text style={styles.sub}>Identificação Inteligente de Resíduos</Text>

        {/* Card */}
        <Animated.View style={[styles.card, { transform: [{ translateX: shakeX }] }]}>
          <Text style={styles.title}>Bem-vindo{'\n'}de volta.</Text>
          <Text style={styles.lead}>Entre para continuar reciclando.</Text>
          {errorMessage ? <Text style={styles.formError}>{errorMessage}</Text> : null}

          <EcoInput
            label="E-mail"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <EcoInput
            label="Senha"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            isPassword
          />

          <EcoButton label="Entrar na conta" onPress={handleLogin} loading={loading} />

          <Pressable onPress={() => {}} style={styles.forgotWrap}>
            <Text style={styles.forgot}>Esqueci a senha</Text>
          </Pressable>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta? </Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Criar conta</Text>
          </Pressable>
        </View>
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
    paddingTop: 80,
    paddingBottom: 40,
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
    fontSize: 56,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 52,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  lead: {
    fontFamily: fonts.bodyLight,
    fontSize: 14,
    color: colors.dim,
    marginBottom: 28,
    lineHeight: 20,
  },
  forgotWrap: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
  },
  forgot: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  formError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
    lineHeight: 18,
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  footerLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.green,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
