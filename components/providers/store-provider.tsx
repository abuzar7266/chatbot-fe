'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useAppStore();
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setTheme(theme);

    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, setTheme]);

  useEffect(() => {
    if (isAuthenticated && token) {
      apiClient.setAuthToken(token);
      return;
    }

    apiClient.clearAuthToken();
  }, [isAuthenticated, token]);

  return <>{children}</>;
}

