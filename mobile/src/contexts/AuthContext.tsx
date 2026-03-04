import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '@/api/auth';
import { tokenStore } from '@/api/tokenStore';
import type { User } from '@/schemas/auth';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const u = await authApi.getMe();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  const restoreSession = useCallback(async () => {
    const hasRefresh = await tokenStore.hasRefreshToken();
    if (!hasRefresh) {
      setIsLoading(false);
      return;
    }
    try {
      await authApi.refresh();
      await loadUser();
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadUser]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      await tokenStore.setTokens(res.access_token, res.refresh_token);
      await loadUser();
    },
    [loadUser]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
