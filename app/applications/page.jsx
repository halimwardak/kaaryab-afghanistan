"use client";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import RequireAuth from '@/components/RequireAuth';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
function Applications() {
  const { t } = useTranslation();
  const {locale} = useLanguage();
  const [result, setResult] = useState(null); const [error, setError] = useState(''); const [page, setPage] = useState(1); const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api(`/applications?page=${page}`, { signal: controller.signal }).then(data => { setResult(data); setError(''); }).catch(err => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [page, revision, locale]);
  return <div className="max-w-4xl mx-auto space-y-5"><h1 className="text-2xl font-bold">{t("My Applications")}</h1>
    {error && <p role="alert">{t(error)} <button onClick={() => setRevision(v => v + 1)} className="underline">{t("Retry")}</button></p>}{!result && !error && <p role="status">{t("Loading applications...")}</p>}
    {result?.data.length === 0 && <p>{t("No applications yet.")}<Link href="/opportunities" className="text-purple-600 underline">{t("Explore opportunities")}</Link></p>}
    {result?.data.map(item => <article key={item.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2"><h2 className="font-bold">{item.opportunity.title}</h2><p className="text-sm">{t(item.status)}{' '}{t("· Applied")}{new Date(item.createdAt).toLocaleDateString()}</p><p className="text-sm text-slate-500 whitespace-pre-wrap">{item.coverLetter}</p></article>)}
    <div className="flex items-center gap-4 text-sm"><button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-purple-600 disabled:opacity-40">{t("Previous")}</button><span>{t("Page")} {page} </span><button disabled={!result || page >= result.pagination.pages} onClick={() => setPage(p => p + 1)} className="text-purple-600 disabled:opacity-40">{t("Next")}</button></div>
  </div>;
}
export default function ApplicationsPage() { return <RequireAuth><Applications /></RequireAuth>; }
