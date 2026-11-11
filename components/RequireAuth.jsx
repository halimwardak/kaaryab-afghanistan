"use client";
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
export default function RequireAuth({ admin = false, children }) {
  const { t } = useTranslation();
  const { user, loading, error, refreshUser } = useAuth();
  if (loading) return <p role="status" className="p-6 text-slate-500">{t("Loading account...")}</p>;
  if (error) return <div role="alert" className="p-6 text-rose-600">{t(error)} <button onClick={refreshUser} className="underline">{t("Retry")}</button></div>;
  if (!user) return <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 text-center space-y-4"><p>{t("Please sign in to continue.")}</p><Link href="/account" className="text-purple-600 underline">{t("Sign in / Create account")}</Link></div>;
  if (admin && user.role !== 'ADMIN') return <div role="alert" className="p-8 rounded-2xl bg-white dark:bg-slate-900">{t("This page is for administrators.")}<Link href="/opportunities" className="text-purple-600 underline">{t("Explore opportunities")}</Link></div>;
  return children;
}
