"use client";
import { useTranslation } from 'react-i18next';
import { useSaved } from "../../context/SavedContext";
import { Briefcase, Bookmark, PlusCircle, GraduationCap, Trash2, Edit, Calendar, ShieldAlert, Award, Globe } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import RequireAuth from "../../components/RequireAuth";
import { api } from "../../lib/api";
import { useState } from "react";

function DashboardContent() {
  const { t } = useTranslation();
  const { allOpportunities, savedItems, deleteOpportunity, refresh, statistics, pagination, opportunityPage, setOpportunityPage, loading } = useSaved();
  const [statusError, setStatusError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const changeStatus = async (op) => {
    setBusyId(op.id); setStatusError('');
    try { await api(`/admin/opportunities/${encodeURIComponent(op.id)}/status`, { method: 'PATCH', body: { status: op.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } }); refresh(); }
    catch (err) { setStatusError(err.message); } finally { setBusyId(null); }
  };
  
  const totalOpportunities = statistics?.total ?? 0;
  const totalJobs = statistics?.jobs ?? 0;
  const totalScholarships = statistics?.scholarships ?? 0;
  const totalInternships = statistics?.internships ?? 0;
  const totalRemote = statistics?.remote ?? 0;

  const expiringSoonOpportunities = statistics?.expiring ?? [];

  const emergencyDisplayItems = expiringSoonOpportunities.length > 0 
    ? expiringSoonOpportunities 
    : allOpportunities.slice(0, 3);

  const chartData = [
    { name: "Jobs", count: totalJobs },
    { name: "Scholarships", count: totalScholarships },
    { name: "Internships", count: totalInternships },
    { name: "Remote Work", count: totalRemote },
  ];

  const stats = [
    { label: "Total Active", value: totalOpportunities, icon: Briefcase, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
    { label: "Jobs", value: totalJobs, icon: Briefcase, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40" },
    { label: "Scholarships", value: totalScholarships, icon: GraduationCap, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-950/40" },
    { label: "Internships", value: totalInternships, icon: Award, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
    { label: "Remote Roles", value: totalRemote, icon: Globe, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40" },
    { label: "Saved By You", value: savedItems.length, icon: Bookmark, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40" },
  ];

  return (
    <div className="space-y-8 py-4 animate-in fade-in duration-300 transition-colors duration-200">
      <Link href="/admin" className="text-purple-600 underline text-sm">{t("Manage users, applications, categories and messages")}</Link>
      {statusError && <p role="alert" className="text-rose-600 text-sm">{statusError}</p>}
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{t("Management Dashboard")}</h1>
          <p className="text-sm text-slate-400 dark:text-slate-400">{t("Monitor live stats, analytical charts, and perform CRUD actions.")}</p>
        </div>
        <Link href="/add-opportunity" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-1.5 self-start shadow-md transition-all transform hover:-translate-y-0.5">
          <PlusCircle className="w-4 h-4" /> <span>{t("Add Opportunity")}</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="flex items-center gap-4 text-sm"><button disabled={loading || opportunityPage <= 1} onClick={() => setOpportunityPage(p => p - 1)} className="text-purple-600 disabled:opacity-40">{t("Previous listings")}</button><span>{t("Page")}{opportunityPage}</span><button disabled={loading || !pagination || opportunityPage >= pagination.pages} onClick={() => setOpportunityPage(p => p + 1)} className="text-purple-600 disabled:opacity-40">{t("Next listings")}</button></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-3 hover:border-purple-100 dark:hover:border-purple-900 transition-colors">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">{t(stat.label)}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t("Visual Metrics Breakdown")}</h3>
            <span className="text-[11px] font-medium text-purple-600 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">{t("Live Analytics")}</span>
          </div>
          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.map(item => ({...item,name:t(item.name)}))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: 'var(--color-bg-dropdown)', borderRadius: '12px' }} />
                <Bar name={t("Items")} dataKey="count" fill="url(#colorPurplePink)" radius={[6, 6, 0, 0]}>
                  <defs>
                    <linearGradient id="colorPurplePink" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-50 dark:border-slate-800 pb-2">
            <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {expiringSoonOpportunities.length > 0 ? t("Expiring Soon (Critical)") : t("Recent Submissions")}
            </h3>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {emergencyDisplayItems.length > 0 ? (
              emergencyDisplayItems.map((op, idx) => (
                <div key={op.id || `emergency-${idx}`} className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 border border-slate-100 dark:border-slate-850 rounded-xl flex items-start justify-between gap-2 transition-colors">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{op.title}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{op.organization}</p>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                    expiringSoonOpportunities.length > 0 
                      ? "text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 animate-pulse" 
                      : "text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400"
                  }`}>
                    <Calendar className="w-3 h-3" /> 
                    <span>{op.deadline}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">{t("No opportunities available.")}</div>
            )}
          </div>
        </div>
      </div>

      {/* Manage Submissions (CRUD) Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t("Manage Submissions (CRUD Active)")}</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{t("Total:")}{totalOpportunities}{' '}{t("Items")}</span>
        </div>
        <div className="overflow-x-auto">
          {totalOpportunities > 0 ? (
            <table className="w-full text-start border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 font-medium border-b border-slate-100 dark:border-slate-800 text-xs">
                  <th className="p-4">{t("Opportunity Title")}</th>
                  <th className="p-4">{t("Category")}</th>
                  <th className="p-4">{t("Type & Location")}</th>
                  <th className="p-4 text-end">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {allOpportunities.map((op, index) => (
                  <tr key={op.id || `table-item-${index}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">{op.title}</span> 
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{op.organization}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 rounded-lg text-xs font-semibold">
                        {t(op.category)}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t(op.type)} <span className="text-slate-300 dark:text-slate-700 mx-1">|</span> {op.location}
                    </td>
                    <td className="p-4 text-end flex justify-end items-center space-x-2">
                      <button disabled={busyId === op.id} onClick={() => changeStatus(op)} className="text-xs text-purple-600 disabled:opacity-50">{op.status === 'PUBLISHED' ? t("Unpublish") : t("Publish")}</button>
                      <button disabled={busyId === op.id || op.status === 'CLOSED'} onClick={async () => { setBusyId(op.id); try { await api(`/admin/opportunities/${op.id}/status`, { method: 'PATCH', body: { status: 'CLOSED' } }); refresh(); } catch (err) { setStatusError(err.message); } finally { setBusyId(null); } }} className="text-xs text-slate-500 disabled:opacity-50">{t("Close")}</button>
                      <Link 
                        href={`/add-opportunity?edit=${op.id}`} 
                        className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors inline-block"
                        title={t("Edit This Opportunity")}
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => deleteOpportunity(op.id)} 
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors" 
                        title={t("Delete This Opportunity")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">{t("No opportunities found in the database. Try creating one!")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() { return <RequireAuth admin><DashboardContent /></RequireAuth>; }
