import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authApi, type AuthPayload } from '@/api/auth';
import { STORAGE_KEYS } from '@/utils/constants';

type User = AuthPayload['user'];

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedToken && storedUser) {
      setToken(storedToken);
      try { setUser(JSON.parse(storedUser)); } catch {}
    }
    setLoading(false);
  }, []);

  // Listen for session expiry events from the axios interceptor
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('ecoscan:session-expired', handler);
    return () => window.removeEventListener('ecoscan:session-expired', handler);
  }, []);

  const persist = useCallback((payload: AuthPayload) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, payload.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const mockUser = { id: '1', name: email.split('@')[0], email, level: 3, points: 2840 };
    const mockToken = 'mock-token-ecoscan';
    persist({ token: mockToken, user: mockUser });
  }, [persist]);

  const register = useCallback(async (name: string, email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 900));
    const mockUser = { id: '1', name, email, level: 1, points: 0 };
    const mockToken = 'mock-token-ecoscan';
    persist({ token: mockToken, user: mockUser });
  }, [persist]);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
