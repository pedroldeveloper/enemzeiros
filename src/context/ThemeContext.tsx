import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { readUserSettings, updateUserSettings } from '../services/authService';

export type ThemeChoice = 'light' | 'dark' | 'system';
type ThemeContextValue = { theme: ThemeChoice; resolvedTheme: 'light' | 'dark'; setTheme: (theme: ThemeChoice) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeChoice>(() => {
    const stored = localStorage.getItem('enemzeiros-theme');
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });
  const [syncedUid, setSyncedUid] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setSyncedUid(null); return; }
    let active = true;
    readUserSettings(user.uid).then((profile) => {
      if (!active) return;
      const remoteTheme = profile?.preferences?.theme;
      if (remoteTheme === 'light' || remoteTheme === 'dark' || remoteTheme === 'system') {
        setThemeState(remoteTheme);
        localStorage.setItem('enemzeiros-theme', remoteTheme);
      }
      setSyncedUid(user.uid);
    }).catch(() => setSyncedUid(user.uid));
    return () => { active = false; };
  }, [user]);

  const setTheme = useCallback((nextTheme: ThemeChoice) => {
    setThemeState(nextTheme);
    localStorage.setItem('enemzeiros-theme', nextTheme);
    if (user && syncedUid === user.uid) void updateUserSettings(user.uid, { theme: nextTheme }).catch(() => undefined);
  }, [user, syncedUid]);

  const resolvedTheme = theme === 'system' ? systemTheme() : theme;
  useEffect(() => { document.documentElement.dataset.theme = resolvedTheme; }, [resolvedTheme]);
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => { document.documentElement.dataset.theme = media.matches ? 'dark' : 'light'; };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [theme]);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme precisa estar dentro de ThemeProvider.');
  return value;
}
