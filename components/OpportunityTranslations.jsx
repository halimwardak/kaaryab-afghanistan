"use client";
import { useTranslation } from 'react-i18next';
const fields = [['title','Title'],['organization','Organization Name *'],['location','Location'],['description','Description'],['requirements','Requirements'],['tags','Skills & Tags']];
export default function OpportunityTranslations({ value, onChange }) {
  const {t}=useTranslation();
  return <section className="space-y-4"><h2 className="font-bold">{t('Content translations')}</h2><p className="text-sm text-slate-500">{t('Complete all fields for each translation you provide. Leave all fields empty to omit a language.')}</p>
    {['fa-AF','ps-AF'].map(locale=><fieldset key={locale} dir="rtl" className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"><legend>{t(locale==='fa-AF'?t("Dari content"):t("Pashto content"))}</legend>
      {fields.map(([key,label])=><label className="block text-sm" key={key}>{t(label)}<textarea aria-label={`${t(locale==='fa-AF'?t("Dari"):t("Pashto"))} — ${t(label)}`} rows={key==='description'?4:2} value={value[locale]?.[key]||''} onChange={e=>onChange({...value,[locale]:{...value[locale],[key]:e.target.value}})} className="block w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" /></label>)}
    </fieldset>)}
  </section>;
}
