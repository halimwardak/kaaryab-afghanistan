"use client";
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSaved } from '@/context/SavedContext';
import { api } from '@/lib/api';
export default function LegacyMigration() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { refresh } = useSaved();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const backup = () => {
    try {
      const blob = new Blob([JSON.stringify({ kaaryab_opportunities: localStorage.getItem('kaaryab_opportunities'), kaaryab_saved: localStorage.getItem('kaaryab_saved') }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = 'kaaryab-legacy-backup.json'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage('Backup exported. Original browser data was kept.');
    } catch (err) { setMessage(err.message); }
  };
  const migrate = async () => {
    setBusy(true); setMessage('');
    try {
      const opportunities = JSON.parse(localStorage.getItem('kaaryab_opportunities') || '[]');
      const saved = JSON.parse(localStorage.getItem('kaaryab_saved') || '[]');
      if (!Array.isArray(opportunities) || !Array.isArray(saved)) throw new Error('Invalid legacy format. Export a backup.');
      const mapping = new Map(); let failed = 0;
      if (user.role === 'ADMIN') {
        for (let offset = 0; offset < opportunities.length; offset += 100) {
          const result = await api('/admin/import', { method: 'POST', body: { items: opportunities.slice(offset, offset + 100) } });
          for (const row of result.data) { if (row.error) failed++; else if (row.legacyId) mapping.set(row.legacyId, row.id); }
        }
      }
      const ids = saved.map(item => mapping.get(item?.id) || item?.id).filter(id => typeof id === 'string' && id.length > 0 && id.length <= 100);
      let unmatched = saved.length - ids.length; let imported = 0;
      for (let offset = 0; offset < ids.length; offset += 500) {
        const result = await api('/saved/import', { method: 'POST', body: { ids: ids.slice(offset, offset + 500) } });
        unmatched += result.unmatched.length; imported += result.imported;
      }
      setMessage([t('Import report: {{imported}} bookmarks, {{unmatched}} unmatched bookmarks, {{failed}} invalid listings.',{imported,unmatched,failed}), user.role !== 'ADMIN' ? t('Listing imports require an administrator.') : '', t('Original browser data was kept.'),t('Export the backup to recover unresolved records.')].join(' ')); refresh();
    } catch (err) { setMessage(`${t(err.message)} ${t('Original browser data was kept.')}`); }
    finally { setBusy(false); }
  };
  return <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-3"><h2 className="font-bold">{t("Move your old browser data")}</h2><p className="text-sm text-slate-500">{t("Export a backup, then import this browser's saved opportunities. Administrators can also import old listings. Existing server records are never overwritten.")}</p><div className="flex flex-wrap gap-3"><button onClick={backup} className="text-purple-600 underline">{t("Export backup")}</button><button disabled={busy} onClick={migrate} className="text-purple-600 underline disabled:opacity-50">{busy ? t("Importing...") : t("Import old data")}</button></div>{message && <p role="status" className="text-sm">{t(message)}</p>}</section>;
}
