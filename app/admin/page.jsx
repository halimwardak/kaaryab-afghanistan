"use client";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import { useSaved } from '@/context/SavedContext';
import { api } from '@/lib/api';
const field = 'p-2 border rounded-xl bg-white dark:bg-slate-950 dark:border-slate-800 text-sm max-w-full';
function Administration() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { refresh } = useSaved();
  const [tab, setTab] = useState('users');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([api(tab === 'categories' ? '/categories' : `/admin/${tab}?page=${page}`, { signal: controller.signal }), api('/admin/stats', { signal: controller.signal })])
      .then(([data, totals]) => { setResult(data); setStats(totals.data); setError(''); })
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [tab, page, revision]);
  const mutate = async (path, method, body) => {
    setBusy(true); setError(''); setMessage('');
    try { await api(path, { method, body }); setRevision(v => v + 1); refresh(); setMessage('Changes saved.'); return true; }
    catch (err) { setError(err.message); return false; } finally { setBusy(false); }
  };
  return <div className="max-w-5xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold">{t("Administration")}</h1><Link href="/dashboard" className="text-purple-600 underline">{t("Manage opportunities")}</Link>
    <p className="text-sm text-slate-500 dark:text-slate-400">{t('Manage your website here. Changes are saved to the database.')}</p>
    {stats && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[['Users', stats.users], ['Applications', stats.applications], ['Published', stats.published], ['Unread messages', stats.unreadMessages]].map(([label, count]) => <div key={label} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"><p className="text-sm text-slate-500">{t(label)}</p><p className="text-2xl font-bold">{count}</p></div>)}</div>}
    <div className="flex flex-wrap gap-3">{['users', 'applications', 'categories', 'messages'].map(value => <button key={value} aria-pressed={tab === value} disabled={busy} onClick={() => { if (value === tab) return; setTab(value); setPage(1); setResult(null); setMessage(''); setError(''); }} className={`px-4 py-2 rounded-xl capitalize ${tab === value ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900'}`}>{t(value)}</button>)}</div>
    {tab === 'users' && <p className="text-sm text-slate-500 dark:text-slate-400">{t('Choose ADMIN or USER to change another account’s permissions. Changes save automatically. Your own administrator access is protected.')}</p>}
    {message && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{t(message)}</p>}
    {error && <p role="alert" className="text-rose-600">{t(error)} <button className="underline" onClick={() => setRevision(v => v + 1)}>{t("Retry")}</button></p>}
    {!result && !error && <p role="status">{t("Loading...")}</p>}
    {tab === "categories" && <form onSubmit={async event => { event.preventDefault(); const form = event.currentTarget; if (await mutate('/admin/categories', 'POST', Object.fromEntries(new FormData(form)))) form.reset(); }} className="flex flex-wrap gap-3"><input aria-label={t("New category name")} name="name" required minLength={2} maxLength={80} className={field} placeholder={t("New category")} /><input aria-label={t("Category name (Dari)")} name="nameFa" required minLength={2} maxLength={80} className={field} dir="rtl" /><input aria-label={t("Category name (Pashto)")} name="namePs" required minLength={2} maxLength={80} className={field} dir="rtl" /><button disabled={busy} className="text-purple-600">{t("Add category")}</button></form>}
    {result?.data.length === 0 && <p>{t("No records found.")}</p>}
    {result?.data.map(row => <article key={row.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-3">
      {tab === "applications" && <><h2 className="font-bold">{row.opportunity.title}</h2><p className="text-sm">{row.user.name} · {row.user.email} · {new Date(row.createdAt).toLocaleDateString()}</p><p className="text-sm whitespace-pre-wrap">{row.coverLetter}</p>{row.resumeUrl && <a href={row.resumeUrl} target="_blank" rel="noopener noreferrer" className="block text-purple-600 underline">{t("View resume")}</a>}<label className="text-sm">{t("Status")}<select aria-label={t('Application status for {{name}}',{name:row.user.name})} disabled={busy} value={row.status} onChange={e => mutate(`/admin/applications/${row.id}`, 'PATCH', { status: e.target.value })} className={field}>{['SUBMITTED', 'REVIEWING', 'INTERVIEW', 'ACCEPTED', 'REJECTED'].map(status => <option key={status} value={status}>{t(status)}</option>)}</select></label></>}
      {tab === "users" && <><h2 className="font-bold">{row.name}</h2><p className="text-sm">{row.email} · {row.active ? t("Active") : t("Disabled")}</p><div className="flex gap-3"><select aria-label={t('Role for {{name}}',{name:row.name})} disabled={busy || row.id === user.id} value={row.role} onChange={e => mutate(`/admin/users/${row.id}`, 'PATCH', { role: e.target.value })} className={field}><option value="USER">{t("USER")}</option><option value="ADMIN">{t("ADMIN")}</option></select><button disabled={busy || row.id === user.id} onClick={() => mutate(`/admin/users/${row.id}`, 'PATCH', { active: !row.active })} className="text-purple-600 disabled:opacity-40">{row.active ? t("Disable account") : t("Enable account")}</button></div></>}
      {tab === "categories" && <form className="flex flex-wrap gap-3" onSubmit={event => { event.preventDefault(); mutate(`/admin/categories/${row.id}`, 'PATCH', Object.fromEntries(new FormData(event.currentTarget))); }}><input aria-label={t("Category name")} name="name" defaultValue={row.name} required minLength={2} maxLength={80} className={field} /><input aria-label={t("Category name (Dari)")} name="nameFa" defaultValue={row.nameFa||""} required minLength={2} maxLength={80} className={field} dir="rtl" /><input aria-label={t("Category name (Pashto)")} name="namePs" defaultValue={row.namePs||""} required minLength={2} maxLength={80} className={field} dir="rtl" /><button disabled={busy} className="text-purple-600">{t("Rename")}</button><button type="button" disabled={busy} className="text-rose-600" onClick={() => { if (window.confirm(t('Delete category {{name}}?',{name:row.name}))) mutate(`/admin/categories/${row.id}`, 'DELETE'); }}>{t("Delete")}</button></form>}
      {tab === "messages" && <><h2 className="font-bold">{row.name} · {row.email}</h2><p className="text-xs text-slate-500">{new Date(row.createdAt).toLocaleString()}</p><p className="text-sm whitespace-pre-wrap">{row.message}</p><button disabled={busy} onClick={() => mutate(`/admin/messages/${row.id}`, 'PATCH', { read: !row.read })} className="text-purple-600">{t("Mark")}{row.read ? t("unread") : t("read")}</button></>}
    </article>)}
    {result?.pagination && <div className="flex gap-4 text-sm"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-purple-600 disabled:opacity-40">{t("Previous")}</button><span>{t("Page")} {page} </span><button disabled={page >= result.pagination.pages} onClick={() => setPage(p => p + 1)} className="text-purple-600 disabled:opacity-40">{t("Next")}</button></div>}
  </div>;
}
export default function AdminPage() { return <RequireAuth admin><Administration /></RequireAuth>; }
