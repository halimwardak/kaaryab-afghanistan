"use client";
// app/opportunities/page.jsx
import { useTranslation } from 'react-i18next';
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import OpportunityCard from "../../components/OpportunityCard";
import { useLanguage } from '@/context/LanguageContext';
import { Search, SlidersHorizontal, Folder, Globe } from "lucide-react";

function OpportunitiesContent() {
  const { t } = useTranslation();
  const {locale} = useLanguage();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get('category') || "All");
  const [type, setType] = useState(searchParams.get('type') || "All");
  const [categories, setCategories] = useState(['All']);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [sort, setSort] = useState('newest');
  const [location, setLocation] = useState('');
  const [expired, setExpired] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => { api('/categories').then(result => setCategories(['All', ...result.data.map(item => item.name)])).catch(err => setError(err.message)); }, []);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true); setError('');
      const query = new URLSearchParams({ page: String(page), limit: '12', sort });
      if (search) query.set('search', search);
      if (category !== 'All') query.set('category', category);
      if (type !== 'All') query.set('type', type);
      if (location) query.set('location', location);
      if (expired) query.set('expired', expired);
      try { const result = await api(`/opportunities?${query}`, { signal: controller.signal }); setFilteredOpportunities(result.data); setPages(result.pagination.pages); }
      catch (err) { if (err.name !== 'AbortError') setError(err.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, category, type, page, sort, location, expired, revision, locale]);
  const types = ["All", "Remote", "On-site", "Hybrid"];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{t("Explore Opportunities")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("Search and filter through jobs, scholarships, and training options.")}</p>
      </div>

      {/* کادر اصلی فیلترها و سرچ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">

        {/* کادر سرچ متنی */}
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder={t("Search by title, keyword, or organization...")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
          />
        </div>

        {/* دراپ‌داون دسته‌بندی */}
        <div className="flex items-center space-x-2 min-w-[180px]">
          <Folder className="w-4 h-4 text-slate-400 dark:text-slate-500 hidden md:block" />
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                {t(cat === "All" ? t("All Categories") : cat)}
              </option>
            ))}
          </select>
        </div>

        {/* دراپ‌داون نوع کار */}
        <div className="flex items-center space-x-2 min-w-[150px]">
          <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500 hidden md:block" />
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
          >
            {types.map((workType) => (
              <option key={workType} value={workType} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                {t(workType === "All" ? t("All Types") : workType)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <input aria-label={t("Location")} placeholder={t("Filter by location")} value={location} onChange={e => { setLocation(e.target.value); setPage(1); }} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" />
        <select aria-label={t("Sort opportunities")} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"><option value="newest">{t("Newest first")}</option><option value="oldest">{t("Oldest first")}</option><option value="deadline">{t("Deadline")}</option><option value="title">{t("Title")}</option></select>
        <select aria-label={t("Deadline filter")} value={expired} onChange={e => { setExpired(e.target.value); setPage(1); }} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"><option value="">{t("All deadlines")}</option><option value="false">{t("Open deadlines")}</option><option value="true">{t("Expired")}</option></select>
      </div>
      {error && <p role="alert" className="text-rose-600">{t(error)} <button onClick={() => setRevision(v => v + 1)} className="underline">{t("Retry")}</button></p>}
      {loading ? <p role="status">{t("Loading opportunities...")}</p> : error ? null : filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((item) => (
            <OpportunityCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* وضعیت خالی بودن نتیجه */
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <SlidersHorizontal className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{t("No Opportunities Found")}</h3>
          <p className="text-sm text-slate-400 dark:text-slate-400 max-w-xs mx-auto">{t("Try adjusting your search keywords or filters to find what you are looking for.")}</p>
        </div>
      )}
      <div className="flex items-center gap-4 text-sm"><button disabled={loading || page <= 1} onClick={() => setPage(p => p - 1)} className="text-purple-600 disabled:opacity-40">{t("Previous")}</button><span>{t("Page")} {page} {' '}{t("of")} {Math.max(pages, 1)}</span><button disabled={loading || page >= pages} onClick={() => setPage(p => p + 1)} className="text-purple-600 disabled:opacity-40">{t("Next")}</button></div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const { t } = useTranslation(); return <Suspense fallback={<p>{t("Loading opportunities...")}</p>}><OpportunitiesContent /></Suspense>; }
