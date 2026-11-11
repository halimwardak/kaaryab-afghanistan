"use client";
// app/contact/page.jsx
import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";

export default function ContactPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSend = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
    await api('/contact', { method: 'POST', body: formData });
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFormData({ name: "", email: "", message: "" });
    }, 4000);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-300">
      <div className="text-center space-y-2 max-w-md mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t("Get in Touch")}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">{t("Have questions, feedback, or partnerships? We’d love to hear from you.")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/*ways of contact*/}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center space-x-3.5">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-400">{t("Email Us")}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">support@kaaryab.af</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center space-x-3.5">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-400">{t("Telegram Channel")}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">@KaarYab_AF</p>
            </div>
          </div>
        </div>

        {/* Custom Message Form */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          {sent ? (
            <div className="text-center py-12 space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("Message Sent!")}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed px-4">{t("Thank you for reaching out. Our support unit will review your query and reply soon.")}</p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              {error && <p role="alert" className="text-sm text-rose-600">{t(error)}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Full Name")}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("Your name")}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Email Address")}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Your Message")}</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t("How can we help you today?")}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium text-sm py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>{busy ? t("Sending...") : t("Send Message")}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
