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
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
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
      showErrors();
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    await AsyncStorage.setItem('token', 'fake-token-ecoscan');
    setLoading(false);
    navigation.replace('Profile', { name });
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
    fontFamily: fonts.titleBold,
    fontSize: 32,
    color: colors.green,
  },
  sub: {
    fontFamily: fonts.bodyLight,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontFamily: fonts.titleBold,
    fontSize: 28,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 34,
  },
  lead: {
    fontFamily: fonts.bodyLight,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 28,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  footerLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.green,
  },
});
