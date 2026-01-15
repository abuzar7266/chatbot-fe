'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';

/**
 * Store Provider Component
 * Initializes global stores and handles side effects
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useAppStore();

  // Initialize theme on mount
  useEffect(() => {
    // Apply initial theme
    setTheme(theme);

    // Listen for system theme changes
    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, setTheme]);

  return <>{children}</>;
}

