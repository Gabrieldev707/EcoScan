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

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      shake();
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    await AsyncStorage.setItem('token', 'fake-token-ecoscan');
    setLoading(false);
    const name = email.split('@')[0];
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
    fontFamily: fonts.titleBold,
    fontSize: 32,
    color: colors.green,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
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
  forgotWrap: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
  },
  forgot: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
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
