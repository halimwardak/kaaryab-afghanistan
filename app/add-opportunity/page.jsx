"use client";
import { useTranslation } from 'react-i18next';
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSaved } from "../../context/SavedContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import OpportunityTranslations from '@/components/OpportunityTranslations';
import RequireAuth from "../../components/RequireAuth";
import { api } from "../../lib/api";

const opportunitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  organization: z.string().min(2, "Organization name is required"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(2, "Location is required (e.g. Kabul, Online)"),
  type: z.enum(["Remote", "On-site", "Hybrid"], {
    errorMap: () => ({ message: "Please select work type" }),
  }),
  deadline: z.string().min(1, "Deadline date is required"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  requirements: z.string().min(5, "Please enter requirements (comma-separated)"),
  applyLink: z.string().url("Please enter a valid URL (e.g., https://...)"),
  tags: z.string().optional(),
});

function AddOpportunityContent() {
  const { t } = useTranslation();
  const { addOpportunity, updateOpportunity } = useSaved();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [categories, setCategories] = useState([]);
  const [translations, setTranslations] = useState({});
  const [editStatus, setEditStatus] = useState('PUBLISHED');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      organization: "",
      category: "Job",
      location: "",
      type: "Remote",
      deadline: "",
      description: "",
      requirements: "",
      applyLink: "",
      tags: "",
    },
  });

  useEffect(() => {
    const controller = new AbortController();
    api('/categories', { signal: controller.signal }).then(result => {
      setCategories(result.data);
      if (!editId) setValue('category', result.data.some(item => item.name === 'Job') ? 'Job' : (result.data[0]?.name || ''));
    }).catch(err => { if (err.name !== 'AbortError') setSubmitError(err.message); });
    return () => controller.abort();
  }, [editId, setValue]);

  useEffect(() => {
    const controller = new AbortController();
    if (editId) {
      api(`/admin/opportunities/${encodeURIComponent(editId)}`, { signal: controller.signal }).then(({ data: opportunityToEdit }) => {
        setIsEditMode(true);
        setTranslations(Object.fromEntries((opportunityToEdit.translations||[]).map(item=>[item.locale,{...item,requirements:item.requirements.join('\n'),tags:item.tags.join('\n')}])));
        setEditStatus(opportunityToEdit.status);
        setValue("title", opportunityToEdit.title);
        setValue("organization", opportunityToEdit.organization);
        setValue("category", opportunityToEdit.category);
        setValue("location", opportunityToEdit.location);
        setValue("type", opportunityToEdit.type);
        setValue("deadline", opportunityToEdit.deadline);
        setValue("description", opportunityToEdit.description);
        setValue("requirements", Array.isArray(opportunityToEdit.requirements) ? opportunityToEdit.requirements.join(", ") : opportunityToEdit.requirements);
        setValue("applyLink", opportunityToEdit.applyLink);
        setValue("tags", Array.isArray(opportunityToEdit.tags) ? opportunityToEdit.tags.join(", ") : "");
      }).catch(err => { if (err.name !== 'AbortError') setSubmitError(err.message); });
    }
    return () => controller.abort();
  }, [editId, setValue]);

  const onSubmit = async (data) => {
    setSubmitError('');
    if (editId && !isEditMode) { setSubmitError('The opportunity to edit could not be loaded.'); return; }
    const processedData = {
      ...data,
      status: editStatus,
      translations: Object.entries(translations).filter(([,value])=>['title','organization','location','description','requirements','tags'].some(key=>value[key]?.trim())).map(([locale,value])=>({locale,...Object.fromEntries(['title','organization','location','description'].map(key=>[key,value[key]||''])), requirements:(value.requirements||'').split(/\n|،|,/).map(v=>v.trim()).filter(Boolean),tags:(value.tags||'').split(/\n|،|,/).map(v=>v.trim()).filter(Boolean)})),
      requirements: data.requirements.split(",").map((req) => req.trim()).filter(Boolean),
      tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    };

    try {
    if (isEditMode && updateOpportunity) {
      await updateOpportunity(editId, processedData);
      setSuccessMessage("Opportunity updated successfully! Redirecting...");
    } else if (addOpportunity) {
      await addOpportunity(processedData);
      setSuccessMessage("Opportunity created successfully! Redirecting...");
    }

    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
    } catch (err) { setSubmitError(err.message); }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 animate-in fade-in duration-300">
      <Link href="/dashboard" className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> <span>{t("Back to Dashboard")}</span>
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>{isEditMode ? t("Edit Opportunity") : t("Post a New Opportunity")}</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">{t("Provide details about the career, study, or training opportunity for Afghan youth.")}</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="m-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center space-x-2 text-sm font-medium animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t(successMessage)}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <h2 className="font-bold">{t('English content')}</h2>
          {submitError && <p role="alert" className="text-sm text-rose-600">{t(submitError)}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Opportunity Title *")}</label>
              <input
                {...register("title")}
                type="text"
                placeholder={t("e.g. Frontend Developer Intern")}
                className={`w-full px-4 py-2 text-sm border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${errors.title ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 dark:border-slate-800 focus:border-purple-500'}`}
              />
              {errors.title && <p className="text-[11px] font-medium text-rose-500">{t(errors.title.message)}</p>}
            </div>

            {/* Organization */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Organization Name *")}</label>
              <input
                {...register("organization")}
                type="text"
                placeholder={t("e.g. Kabul Tech Community")}
                className={`w-full px-4 py-2 text-sm border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${errors.organization ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 dark:border-slate-800 focus:border-purple-500'}`}
              />
              {errors.organization && <p className="text-[11px] font-medium text-rose-500">{t(errors.organization.message)}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Category *")}</label>
              <select
                {...register("category")}
                className="w-full px-4 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                {categories.map(category => <option key={category.id} value={category.name}>{t(category.name)}</option>)}
              </select>
            </div>

            {/* Workplace Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Workplace Type *")}</label>
              <select
                {...register("type")}
                className="w-full px-4 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="Remote" className="dark:bg-slate-950">{t("Remote")}</option>
                <option value="On-site" className="dark:bg-slate-950">{t("On-site")}</option>
                <option value="Hybrid" className="dark:bg-slate-950">{t("Hybrid")}</option>
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Location *")}</label>
              <input
                {...register("location")}
                type="text"
                placeholder={t("e.g. Kabul, Online")}
                className={`w-full px-4 py-2 text-sm border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${errors.location ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 dark:border-slate-800 focus:border-purple-500'}`}
              />
              {errors.location && <p className="text-[11px] font-medium text-rose-500">{t(errors.location.message)}</p>}
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Application Deadline *")}</label>
              <input
                {...register("deadline")}
                type="date"
                className={`w-full px-4 py-2 text-sm border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${errors.deadline ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 dark:border-slate-800 focus:border-purple-500'}`}
              />
              {errors.deadline && <p className="text-[11px] font-medium text-rose-500">{t(errors.deadline.message)}</p>}
            </div>
          </div>

          {/* Apply Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Application Link / URL *")}</label>
            <input
              {...register("applyLink")}
              type="text"
              placeholder="https://example.com/apply"
              className={`w-full px-4 py-2 text-sm border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${errors.applyLink ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 dark:border-slate-800 focus:border-purple-500'}`}
            />
            {errors.applyLink && <p className="text-[11px] font-medium text-rose-500">{t(errors.applyLink.message)}</p>}
          </div>

          {/* Requirements */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Requirements * (Separate with commas)")}</label>
            <input
              {...register("requirements")}
              type="text"
              placeholder={t("React, GitHub, Internet access")}
              className={`w-full px-4 py-2 text-sm border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${errors.requirements ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 dark:border-slate-800 focus:border-purple-500'}`}
            />
            {errors.requirements && <p className="text-[11px] font-medium text-rose-500">{t(errors.requirements.message)}</p>}
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Tags (Optional - Separate with commas)")}</label>
            <input
              {...register("tags")}
              type="text"
              placeholder={t("Nextjs, Scholarship")}
              className="w-full px-4 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Full Description *")}</label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder={t("Provide a detailed description of the role...")}
              className={`w-full px-4 py-2 text-sm border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${errors.description ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 dark:border-slate-800 focus:border-purple-500'}`}
            />
            {errors.description && <p className="text-[11px] font-medium text-rose-500">{t(errors.description.message)}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || Boolean(successMessage) || categories.length === 0}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{isEditMode ? t("Update Opportunity") : t("Publish Opportunity")}</span>
          </button>
          <OpportunityTranslations value={translations} onChange={setTranslations} />
        </form>
      </div>
    </div>
  );
}

export default function AddOpportunityPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-500">{t("Loading form...")}</div>}>
      <RequireAuth admin><AddOpportunityContent /></RequireAuth>
    </Suspense>
  );
}
