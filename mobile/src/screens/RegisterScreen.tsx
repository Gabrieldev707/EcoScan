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

type Props = StackScreenProps<AuthStackParamList, 'Register'>;

function validate(name: string, email: string, pwd: string, confirm: string) {
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = 'Nome obrigatório';
  if (!email.trim() || !email.includes('@')) errors.email = 'E-mail inválido';
  if (pwd.length < 6) errors.password = 'Mínimo 6 caracteres';
  if (pwd !== confirm) errors.confirm = 'Senhas não coincidem';
  return errors;
}

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const errorOpacity = useRef(new Animated.Value(0)).current;

  const showErrors = () => {
    errorOpacity.setValue(0);
    Animated.timing(errorOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const handleRegister = async () => {
    const errs = validate(name, email, password, confirm);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setErrorMessage('');
      showErrors();
      return;
    }
    setErrors({});
    setErrorMessage('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (error) {
      setErrorMessage((error as Error).message);
      showErrors();
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
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>EcoScan</Text>
        </View>
        <Text style={styles.sub}>Crie sua conta gratuita</Text>

        <Animated.View style={[styles.card, { opacity: errors ? 1 : errorOpacity }]}>
          <Text style={styles.title}>Criar{'\n'}conta.</Text>
          <Text style={styles.lead}>Comece a transformar descartes em impacto.</Text>
          {errorMessage ? <Text style={styles.formError}>{errorMessage}</Text> : null}

          <EcoInput
            label="Nome completo"
            icon="user"
            value={name}
            onChangeText={t => { setName(t); setErrors(e => ({ ...e, name: '' })); }}
            error={errors.name}
            autoCapitalize="words"
          />
          <EcoInput
            label="E-mail"
            icon="mail"
            value={email}
            onChangeText={t => { setEmail(t); setErrors(e => ({ ...e, email: '' })); }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <EcoInput
            label="Senha"
            icon="lock"
            value={password}
            onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: '' })); }}
            error={errors.password}
            isPassword
          />
          <EcoInput
            label="Confirmar senha"
            icon="shield"
            value={confirm}
            onChangeText={t => { setConfirm(t); setErrors(e => ({ ...e, confirm: '' })); }}
            error={errors.confirm}
            isPassword
          />

          <EcoButton label="Criar conta" onPress={handleRegister} loading={loading} />
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta? </Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>Entrar</Text>
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
    marginBottom: 6,
  },
  logoText: {
    fontFamily: fonts.display,
    fontSize: 38,
    color: colors.text,
    letterSpacing: 1.2,
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
  formError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
    lineHeight: 18,
    marginBottom: 14,
  },
});
