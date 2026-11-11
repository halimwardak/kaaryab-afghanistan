"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from './LanguageContext';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';
const SavedContext = createContext();
export function SavedProvider({ children }) {
  const {t} = useTranslation();
  const {locale} = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [opportunityPage, setOpportunityPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const pending = useRef(new Set());
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError(''); setSavedItems([]); setAllOpportunities([]);
      try {
        const [ops, saved, stats] = await Promise.all([
          api(`${user?.role === 'ADMIN' ? '/admin/opportunities' : '/opportunities'}?page=${opportunityPage}&limit=20`, { signal: controller.signal }),
          user ? api('/saved', { signal: controller.signal }) : Promise.resolve({ data: [] }),
          api(user?.role === 'ADMIN' ? '/admin/stats' : '/opportunities/stats', { signal: controller.signal }),
        ]);
        setAllOpportunities(ops.data); setPagination(ops.pagination); setStatistics(stats.data); setSavedItems(saved.data);
      } catch (err) { if (err.name !== 'AbortError') setError(err.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load(); return () => controller.abort();
  }, [user, authLoading, revision, opportunityPage, locale]);
  const toggleSave = async (opportunity) => {
    if (!user) { setError('Please sign in to save opportunities.'); return; }
    if (pending.current.has(opportunity.id)) return;
    pending.current.add(opportunity.id); setError('');
    const exists = savedItems.some(item => item.id === opportunity.id);
    try {
      await api(`/saved/${encodeURIComponent(opportunity.id)}`, { method: exists ? 'DELETE' : 'PUT' });
      setSavedItems(items => exists ? items.filter(item => item.id !== opportunity.id) : [...items.filter(item => item.id !== opportunity.id), opportunity]);
    } catch (err) { setError(err.message); }
    finally { pending.current.delete(opportunity.id); }
  };
  const addOpportunity = async (body) => {
    const result = await api('/admin/opportunities', { method: 'POST', body });
    refresh(); return result.data;
  };
  const updateOpportunity = async (id, body) => {
    const result = await api(`/admin/opportunities/${encodeURIComponent(id)}`, { method: 'PUT', body });
    setAllOpportunities(items => items.map(item => item.id === id ? result.data : item));
    setSavedItems(items => items.map(item => item.id === id ? result.data : item)); refresh(); return result.data;
  };
  const deleteOpportunity = async (id) => {
    if (!window.confirm(t('Delete this opportunity? This cannot be undone.'))) return;
    try {
      await api(`/admin/opportunities/${encodeURIComponent(id)}`, { method: 'DELETE' });
      setAllOpportunities(items => items.filter(item => item.id !== id));
      setSavedItems(items => items.filter(item => item.id !== id));
      refresh();
    } catch (err) { setError(err.message); }
  };
  return <SavedContext.Provider value={{ savedItems, allOpportunities, loading, error, toggleSave, addOpportunity, updateOpportunity, deleteOpportunity, refresh, opportunityPage, setOpportunityPage, pagination, statistics }}>
    {error && <div role="alert" className="bg-rose-50 dark:bg-rose-950 p-3 text-center text-sm text-rose-700 dark:text-rose-300">{t(error)} <Link href="/account" className="underline mx-2">{t('Account')}</Link><button onClick={refresh} className="underline">{t('Retry')}</button></div>}
    {loading && <p role="status" className="text-center text-sm text-slate-500 p-2">{t('Loading opportunities...')}</p>}{children}
  </SavedContext.Provider>;
}
export const useSaved = () => useContext(SavedContext);
