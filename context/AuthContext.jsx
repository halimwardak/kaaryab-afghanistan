"use client";
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refreshUser = useCallback(async () => {
    try { const result = await api('/auth/me'); setUser(result.user); setError(''); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    api('/auth/me', { signal: controller.signal }).then(result => { setUser(result.user); setError(''); })
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const authenticate = async (mode, body) => { const result = await api(`/auth/${mode}`, { method: 'POST', body }); setUser(result.user); setError(''); };
  const logout = async () => { await api('/auth/logout', { method: 'POST' }); setUser(null); };
  return <AuthContext.Provider value={{ user, setUser, loading, error, authenticate, logout, refreshUser }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
