import React, { createContext, useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, type AuthPayload } from '../api/auth';

type User = AuthPayload['user'];

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['ecoscan_token', 'ecoscan_user']).then(pairs => {
      const t = pairs[0][1];
      const u = pairs[1][1];
      if (t) setToken(t);
      if (u) { try { setUser(JSON.parse(u)); } catch {} }
      setLoading(false);
    });
  }, []);

  const persist = async (payload: AuthPayload) => {
    await AsyncStorage.multiSet([
      ['ecoscan_token', payload.token],
      ['ecoscan_user', JSON.stringify(payload.user)],
    ]);
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const payload = await authApi.login(email, password);
    await persist(payload);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const payload = await authApi.register(name, email, password);
    await persist(payload);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    await AsyncStorage.multiRemove(['ecoscan_token', 'ecoscan_user']);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
