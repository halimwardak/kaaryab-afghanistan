"use client";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import LegacyMigration from '@/components/LegacyMigration';
const field = 'w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm';
const button = 'px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm disabled:opacity-50';
export default function AccountPage() {
  const { t } = useTranslation();
  const { user, setUser, loading, authenticate, logout, error, refreshUser } = useAuth();
  const [mode, setMode] = useState('login');
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('reset');
    // Capture the external URL once and remove the sensitive reset token from browser history.
    if (token) {
      window.history.replaceState({}, '', '/account');
      // Initial synchronization with an external reset link is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResetToken(token); setMode('reset-password');
    }
  }, []);
  const perform = async (event, action) => {
    event.preventDefault(); setBusy(true); setMessage('');
    const form = event.currentTarget; const data = Object.fromEntries(new FormData(form));
    try {
      if (action === 'login' || action === 'register') { await authenticate(action, data); setMessage('Signed in successfully.'); }
      else if (action === 'profile') { const result = await api('/auth/profile', { method: 'PATCH', body: data }); setUser(result.user); setMessage('Profile updated.'); }
      else {
        if (action === 'reset-password') data.token = resetToken;
        const result = await api(`/auth/${action}`, { method: 'POST', body: data }); setMessage(result.message);
        if (action === 'change-password' || action === 'reset-password') { setUser(null); setMode('login'); setResetToken(''); form.reset(); }
      }
    } catch (err) { setMessage(err.message); } finally { setBusy(false); }
  };
  if (loading) return <p role="status">{t("Loading account...")}</p>;
  return <div className="max-w-xl mx-auto space-y-6"><h1 className="text-2xl font-bold">{user ? t("Your Account") : t("Welcome to KaarYab")}</h1>
    {error && <p role="alert">{t(error)} <button onClick={refreshUser} className="underline">{t("Retry")}</button></p>}
    {message && <p role="status" className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950 text-sm">{t(message)}</p>}
    {user ? <><section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4">
      <p>{user.email} · {user.role === "ADMIN" ? t("Administrator") : t("Member")}</p>
      <form onSubmit={event => perform(event, 'profile')} className="space-y-3"><label className="block text-sm">{t("Name")}<input name="name" required minLength={2} maxLength={100} defaultValue={user.name} className={field} /></label><button disabled={busy} className={button}>{t("Update profile")}</button></form>
      <Link href="/applications" className="text-purple-600 underline block">{t("My applications")}</Link>{user.role === "ADMIN" && <Link href="/admin" className="text-purple-600 underline block">{t("Administration")}</Link>}
      <button disabled={busy} onClick={async () => { setBusy(true); try { await logout(); setMessage('Signed out.'); } catch (err) { setMessage(err.message); } finally { setBusy(false); } }} className="text-purple-600 underline">{t("Sign out")}</button>
    </section><form onSubmit={event => perform(event, 'change-password')} className="bg-white dark:bg-slate-900 rounded-2xl p-6 space-y-3"><h2 className="font-bold">{t("Change password")}</h2><label className="block text-sm">{t("Current password")}<input name="currentPassword" type="password" autoComplete="current-password" required className={field} /></label><label className="block text-sm">{t("New password (12–72 characters)")}<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={72} required className={field} /></label><button disabled={busy} className={button}>{t("Change password")}</button></form><LegacyMigration /></> :
    <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5"><div className="flex gap-4 text-purple-600"><button onClick={() => { setMode('login'); setMessage(''); }}>{t("Sign in")}</button><button onClick={() => { setMode('register'); setMessage(''); }}>{t("Create account")}</button></div>
      <form key={mode} onSubmit={event => perform(event, mode)} className="space-y-4">
        {mode === 'register' && <label className="block text-sm">{t("Full name")}<input name="name" autoComplete="name" required minLength={2} maxLength={100} className={field} /></label>}
        {mode !== 'reset-password' && <label className="block text-sm">{t("Email")}<input name="email" type="email" autoComplete="email" maxLength={254} required className={field} /></label>}
        {mode !== 'forgot-password' && <label className="block text-sm">{mode === 'reset-password' ? t("New password") : t("Password")}<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 12} maxLength={72} required className={field} />{mode !== 'login' && <span className="text-xs text-slate-500">{t("Use 12–72 characters (at most 72 UTF-8 bytes).")}</span>}</label>}
        <button disabled={busy} className={button}>{busy ? t("Please wait...") : ({ login: t("Sign in"), register: t("Create account"), 'forgot-password': t("Request reset link"), 'reset-password': t("Reset password") }[mode])}</button>
      </form><button onClick={() => setMode('forgot-password')} className="text-sm text-purple-600 underline">{t("Forgot password?")}</button>
    </section>}
  </div>;
}
