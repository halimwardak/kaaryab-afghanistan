"use client";
// app/opportunities/[id]/page.jsx
import { useTranslation } from 'react-i18next';
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useLanguage } from '@/context/LanguageContext';
import ApplicationForm from "../../../components/ApplicationForm";
import { useSaved } from "../../../context/SavedContext";
import { ArrowLeft, Calendar, MapPin, Briefcase, Bookmark, BookmarkCheck, ExternalLink, CheckCircle } from "lucide-react";

export default function OpportunityDetailsPage({ params: paramsPromise }) {
  const { t } = useTranslation();
  const {locale} = useLanguage();
  const params = use(paramsPromise);
  const router = useRouter();
  const { savedItems, toggleSave } = useSaved();

  // پیدا کردن آیتم بر اساس ID
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    api(`/opportunities/${encodeURIComponent(params.id)}`, { signal: controller.signal })
      .then(result => { setItem(result.data); setLoading(false); })
      .catch(err => { if (err.name !== 'AbortError') { setError(err.status === 404 ? '' : err.message); setLoading(false); } });
    return () => controller.abort();
  }, [params.id, locale]);
  const isSaved = savedItems.some((saved) => saved.id === item?.id);

  // اگر آیتم پیدا نشد
  if (loading) return <p role="status" className="text-center py-16">{t("Loading opportunity...")}</p>;
  if (error) return <p role="alert" className="text-center py-16 text-rose-600">{t(error)}</p>;
  if (!item) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-500">{t("Opportunity Not Found")}</h2>
        <p className="text-slate-500 text-sm dark:text-slate-500">{t("The opportunity you are looking for does not exist or has expired.")}</p>
        <Link href="/opportunities" className="inline-flex items-center space-x-2 text-purple-600 font-medium">
          <ArrowLeft className="w-4 h-4" /> <span>{t("Back to Opportunities")}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* دکمه بازگشت */}
      <button 
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t("Back")}</span>
      </button>

      {locale !== 'en' && item.contentLocale === 'en' && <p className="text-sm text-slate-500">{t('Translation is not available yet. Original content is shown.')}</p>}
      {/* هدر اصلی کارت جزئیات */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1 rounded-md">
              {t(item.category)}
            </span>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-md">
              {t(item.type)}
            </span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900">{item.title}</h1>
          <p className="text-lg text-slate-600 font-medium">{item.organization}</p>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400 pt-2">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-amber-600 font-medium">
              <Calendar className="w-4 h-4" />
              <span>{t("Deadline:")}{item.deadline}</span>
            </div>
          </div>
        </div>

        {/* دکمه‌های اکشن */}
        <div className="flex md:flex-col gap-3 min-w-[160px] pt-4 md:pt-0">
          <a
            href={item.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-grow text-center bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5"
          >
            <span>{t("Apply Now")}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          
          <button
            onClick={() => toggleSave(item)}
            className={`flex items-center justify-center space-x-1.5 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
              isSaved 
                ? "bg-purple-50 border-purple-200 text-purple-700" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 fill-purple-600 text-purple-600" /> : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? t("Saved") : t("Save Role")}</span>
          </button>
        </div>
      </div>

      {/* بخش توضیحات و نیازمندی‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* سمت چپ: جزئیات متن */}
        <div className="md:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-950">{t("Description")}</h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">{item.description}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-950">{t("Requirements")}</h3>
            <ul className="space-y-2.5">
              {item.requirements.map((req, i) => (
                <li key={i} className="flex items-start space-x-2.5 text-slate-600 text-sm">
                  <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* سمت راست: برچسب‌ها و خلاصه موقعیت */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-fit space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-400">{t("Skills & Tags")}</h3>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="text-xs bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ApplicationForm opportunity={item} />
    </div>
  );
}
