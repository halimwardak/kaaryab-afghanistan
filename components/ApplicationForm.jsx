"use client";
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
export default function ApplicationForm({ opportunity }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [submitted, setSubmitted] = useState(false);
  if (!user) return <p className="text-sm"><Link href="/account" className="text-purple-600 underline">{t("Sign in")}</Link>{t("to submit and track an application through KaarYab.")}</p>;
  if (opportunity.deadline < new Date().toISOString().slice(0, 10) || opportunity.status !== 'PUBLISHED') return <p className="text-sm text-amber-600">{t("Applications are closed for this opportunity.")}</p>;
  const submit = async event => {
    event.preventDefault(); setBusy(true); setMessage(''); const data = Object.fromEntries(new FormData(event.currentTarget));
    if (!data.resumeUrl) delete data.resumeUrl;
    try { await api('/applications', { method: 'POST', body: { ...data, opportunityId: opportunity.id } }); setSubmitted(true); setMessage('Application submitted. Track its status in My applications.'); }
    catch (err) { setMessage(err.message); } finally { setBusy(false); }
  };
  return <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4"><h2 className="font-bold">{t("Apply through KaarYab")}</h2><p className="text-xs text-slate-500">{t("Your application is received by KaarYab administrators. You can also use the organization's external Apply Now link.")}</p>{message && <p role="status" className="text-sm">{t(message)}</p>}
    {!submitted && <form onSubmit={submit} className="space-y-3"><label className="block text-sm">{t("Cover letter")}<textarea name="coverLetter" required minLength={20} maxLength={10000} rows={4} className="w-full mt-1 p-3 border rounded-xl dark:bg-slate-950 dark:border-slate-800" /></label><label className="block text-sm">{t("Resume URL (optional)")}<input name="resumeUrl" type="url" maxLength={2000} placeholder="https://..." className="w-full mt-1 p-3 border rounded-xl dark:bg-slate-950 dark:border-slate-800" /></label><button disabled={busy} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-xl disabled:opacity-50">{busy ? t("Submitting...") : t("Submit application")}</button></form>}
    <Link href="/applications" className="text-purple-600 underline text-sm">{t("My applications")}</Link></section>;
}
