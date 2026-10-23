import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api, ProfileSummary } from './api';

const SESSION_KEY = 'myfitpalace:session:v1';

export type Session = { token: string; profile: ProfileSummary };

type SessionState = {
  session: Session | null;
  ready: boolean;
  signIn: (profile: ProfileSummary, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  /** Cierra la sesión local sin llamar al servidor (p. ej. sesión caducada) */
  dropSession: () => void;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => raw && setSession(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = (s: Session | null) => {
    setSession(s);
    (s ? AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s)) : AsyncStorage.removeItem(SESSION_KEY)).catch(() => {});
  };

  const signIn = useCallback(async (profile: ProfileSummary, password: string) => {
    const token = await api.login(profile.id, password);
    if (!token) return false;
    persist({ token, profile });
    return true;
  }, []);

  const signOut = useCallback(async () => {
    const current = session;
    persist(null);
    if (current) await api.logout(current.token).catch(() => {});
  }, [session]);

  const dropSession = useCallback(() => persist(null), []);

  return (
    <SessionContext.Provider value={{ session, ready, signIn, signOut, dropSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider');
  return ctx;
}
