"use client";
import { useTranslation } from 'react-i18next';

import Link from "next/link";
import { Briefcase, GraduationCap, Award, Globe, ArrowRight } from "lucide-react";
import { useSaved } from "../context/SavedContext";
import { useTheme } from "../context/ThemeContext";

export default function HomePage() {
  const { t } = useTranslation();
  const { statistics } = useSaved();
  const { darkMode } = useTheme(); 
  
  const getCount = (type, value) => {
    const keys = { Job: 'jobs', Scholarship: 'scholarships', Internship: 'internships', Remote: 'remote' };
    return statistics?.[keys[value]] ?? 0;
  };

  const categories = [
    { 
      name: "Jobs", 
      count: getCount("category", "Job"), 
      icon: Briefcase, 
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400", 
      href: "/opportunities?category=Job" 
    },
    { 
      name: "Scholarships", 
      count: getCount("category", "Scholarship"), 
      icon: GraduationCap, 
      color: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400", 
      href: "/opportunities?category=Scholarship" 
    },
    { 
      name: "Internships", 
      count: getCount("category", "Internship"), 
      icon: Award, 
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400", 
      href: "/opportunities?category=Internship" 
    },
    { 
      name: "Remote Work", 
      count: getCount("type", "Remote"), 
      icon: Globe, 
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400", 
      href: "/opportunities?type=Remote" 
    },
  ];

  return (
    <div className="space-y-16 py-4 relative z-10 transition-colors duration-200">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">{t("Find Your Next")} <span className="bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{t("Opportunity")}</span>{' '}{t("In Afghanistan")}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{t("KaarYab is a unified platform built for Afghan youth, students, and job seekers to discover jobs, scholarships, remote positions, and training programs in one secure place.")}</p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link 
            href="/opportunities" 
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 dark:from-purple-500 dark:to-pink-400 text-white px-6 py-3 rounded-xl font-medium shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <span>{t("Explore Opportunities")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/add-opportunity" 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 py-3 rounded-xl font-medium transition-all shadow-sm"
          >{t("Post an Opportunity")}</Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-6 relative z-20">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{t("Browse by Category")}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Quickly find what matches your current career goals")}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={t(cat.name)} 
                href={cat.href}
                className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-3 cursor-pointer hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${cat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {t(cat.name)}
                </h3>
                <span className="text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-full transition-colors duration-300 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/60 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  {cat.count}{' '}{t("Available")}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Info Callout Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-black rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden border dark:border-slate-800">
        <div className="max-w-xl space-y-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-400 dark:text-pink-300">{t("Empowering Women")}</span>
          <h2 className="text-2xl md:text-4xl font-bold">{t("Looking for Online or Remote Roles?")}</h2>
          <p className="text-slate-300 dark:text-slate-400 text-sm md:text-base leading-relaxed">{t("KaarYab prioritizes safe, online, and remote education and work alternatives to help girls and women across Afghanistan continue their growth path.")}</p>
          <div className="pt-2">
            <Link href="/opportunities?type=Remote" className="inline-flex items-center space-x-1 text-pink-400 hover:text-pink-300 dark:text-pink-300 dark:hover:text-pink-200 font-medium text-sm transition-colors">
              <span>{t("View Remote Options")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      </section>
    </div>
  );
}
