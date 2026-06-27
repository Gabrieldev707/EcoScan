import React, { createContext, useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth';
import { AUTH_STORAGE_KEYS, setUnauthorizedHandler } from '../api/client';
import type { AuthResponse, AuthUser } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(async () => {
    await AsyncStorage.multiRemove([AUTH_STORAGE_KEYS.token, AUTH_STORAGE_KEYS.user]);
    setToken(null);
    setUser(null);
  }, []);

  const persist = useCallback(async (payload: AuthResponse) => {
    await AsyncStorage.multiSet([
      [AUTH_STORAGE_KEYS.token, payload.token],
      [AUTH_STORAGE_KEYS.user, JSON.stringify(payload.user)],
    ]);
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const refreshUser = useCallback(async () => {
    const freshUser = await authApi.me();
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(freshUser));
    setUser(freshUser);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const savedToken = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.token);

        if (!savedToken) return;

        if (!mounted) return;
        setToken(savedToken);

        const freshUser = await authApi.me();
        if (!mounted) return;

        await AsyncStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(freshUser));
        setUser(freshUser);
      } catch {
        await clearSession();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const payload = await authApi.login(email, password);
    await persist(payload);
  }, [persist]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const payload = await authApi.register(name, email, password);
    await persist(payload);
  }, [persist]);

  const logout = useCallback(async () => {
    await authApi.logout();
    await clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
