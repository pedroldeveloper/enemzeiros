import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuth, login, logout, register, sendReset } from '../services/authService';
import { firebaseConfigured } from '../lib/firebase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  login: typeof login;
  register: typeof register;
  logout: typeof logout;
  sendReset: typeof sendReset;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  useEffect(() => subscribeToAuth((nextUser) => { setUser(nextUser); setLoading(false); }), []);
  const value = useMemo(() => ({ user, loading, configured: firebaseConfigured, login, register, logout, sendReset }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return value;
}
