'use client';

import * as React from 'react';
import { api, errorMessage } from '@/lib/api';
import type { PublicUser } from '@/lib/types';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<PublicUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const res = await api<{ success: boolean; data: PublicUser }>('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = React.useCallback(async (email: string, password: string) => {
    try {
      const res = await api<{ success: boolean; data: { user: PublicUser } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(res.data.user);
    } catch (error) {
      throw new Error(errorMessage(error));
    }
  }, []);

  const register = React.useCallback(
    async (input: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
      try {
        const res = await api<{ success: boolean; data: { user: PublicUser } }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        setUser(res.data.user);
      } catch (error) {
        throw new Error(errorMessage(error));
      }
    },
    [],
  );

  const logout = React.useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
