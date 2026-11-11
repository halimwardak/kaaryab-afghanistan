"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createLanguageInstance } from '@/lib/i18n';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';
import { supportedLocales } from '@/locales/catalog.mjs';
const Context = createContext(null);
export function LanguageProvider({ children }) {
  const [i18n] = useState(createLanguageInstance);
  const { user, setUser, loading } = useAuth();
  const [locale, setLocale] = useState('en');
  const [error, setError] = useState('');
  useEffect(() => {
    if (loading) return;
    let preferred = user?.locale;
    if (!preferred) { try { preferred = new URLSearchParams(window.location.search).get('lang') || localStorage.getItem('kaaryab_language'); } catch {} }
    if (!supportedLocales.includes(preferred)) preferred = 'en';
    i18n.changeLanguage(preferred);
    document.documentElement.lang = preferred;
    document.documentElement.dir = preferred === 'en' ? 'ltr' : 'rtl';
    // Synchronize the stored preference after authentication completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocale(preferred);
  }, [user?.id, user?.locale, loading, i18n]);
  const changeLanguage = async next => {
    if (!supportedLocales.includes(next)) return;
    try {
      if (user) { const result = await api('/auth/language', { method: 'PATCH', body: { locale: next } }); setUser(result.user); }
      else { try { localStorage.setItem('kaaryab_language', next); } catch {} }
      await i18n.changeLanguage(next);
      document.documentElement.lang = next;
      document.documentElement.dir = next === 'en' ? 'ltr' : 'rtl';
      setLocale(next); setError('');
    } catch (err) { setError(err.message); }
  };
  return <I18nextProvider i18n={i18n}><Context.Provider value={{locale,changeLanguage}}>{error && <p role="alert">{i18n.t(error)}</p>}{children}</Context.Provider></I18nextProvider>;
}
export const useLanguage = () => useContext(Context);
