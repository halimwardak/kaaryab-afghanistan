"use client";
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from 'react-i18next';
export default function LanguageSwitcher() {
  const { locale, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  return <select aria-label={t('Language')} value={locale} onChange={event => changeLanguage(event.target.value)} className="max-w-32 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 px-2 py-1 text-sm">
    <option value="en">English</option><option value="fa-AF">فارسی دری</option><option value="ps-AF">پښتو</option>
  </select>;
}
