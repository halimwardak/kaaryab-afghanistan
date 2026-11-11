"use client";
import { useTranslation } from 'react-i18next';

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Document, Page, Text, View, StyleSheet, Font, pdf, Image as PDFImage } from "@react-pdf/renderer";
import { Plus, Trash2, Download, Loader2, FileText, GraduationCap, Briefcase, ArrowLeft, Award, BookOpen, Heart, Users, Camera } from "lucide-react";
import Link from "next/link";

Font.register({ family: 'KaarYab Arabic', fonts: [
  { src: '/fonts/NotoNaskhArabic.ttf' }, { src: '/fonts/NotoNaskhArabic.ttf',fontWeight:700 },
  { src: '/fonts/NotoNaskhArabic.ttf',fontStyle:'italic' }
] });
// 1. structure of the form data using Zod for validation
const educationSchema = z.object({
  school: z.string().min(1, "School name is required"),
  degree: z.string().min(1, "Degree is required"),
  year: z.string().min(1, "Year is required"),
});

const experienceSchema = z.object({
  company: z.string().min(1, "Company/Institution name is required"),
  role: z.string().min(1, "Role/Research Title is required"),
  period: z.string().min(1, "Period/Date is required"),
  description: z.string().optional(),
});

const genericSchema = z.object({
  text: z.string().min(1, "Field cannot be empty"),
});

const referenceSchema = z.object({
  name: z.string().min(1, "Reference name is required"),
  title: z.string().min(1, "Title/Position is required"),
  contact: z.string().min(1, "Contact details (Phone/Email) are required"),
});

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  professionalTitle: z.string().min(2, "Professional title is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  summary: z.string().max(1200, "Keep summary under 1200 characters").optional(),
  skills: z.string().min(1, "Skills are required"),
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  awards: z.array(genericSchema),
  certificates: z.array(genericSchema),
  interests: z.string().optional(),
  references: z.array(referenceSchema),
});

const defaultValues = {
  fullName: "",
  professionalTitle: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skills: "",
  education: [{ school: "", degree: "", year: "" }],
  experience: [{ company: "", role: "", period: "", description: "" }],
  awards: [{ text: "" }],
  certificates: [{ text: "" }],
  interests: "",
  references: [{ name: "", title: "", contact: "" }],
};

// 2. PDF file styles
const pdfStyles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 40, paddingHorizontal: 45, fontSize: 9.5, fontFamily: "Helvetica", color: "#2d3748" },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 15, marginBottom: 15 },
  headerLeft: { flex: 1, paddingRight: 10 },
  avatar: { width: 65, height: 75, borderRadius: 4, objectFit: "cover", borderHorizontalWidth: 1, borderVerticalWidth: 1, borderColor: "#cbd5e1" },
  name: { fontSize: 20, fontWeight: "bold", color: "#1a202c", letterSpacing: 0.5 },
  title: { fontSize: 11, color: "#4a5568", marginTop: 2, marginBottom: 6, fontStyle: "italic" },
  contactRow: { flexDirection: "row", flexWrap: "wrap", fontSize: 8.5, color: "#718096", gap: 4 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 10.5, fontWeight: "bold", marginBottom: 6, color: "#1a202c", textTransform: "uppercase", letterSpacing: 0.5, borderBottomWidth: 1, borderBottomColor: "#1a202c", paddingBottom: 2 },
  summaryText: { lineHeight: 1.5, color: "#2d3748", textAlign: "justify" },
  entry: { marginBottom: 10 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 },
  entryTitle: { fontWeight: "bold", color: "#1a202c", fontSize: 10 },
  entrySub: { color: "#4a5568", fontSize: 9 },
  entryDesc: { color: "#4a5568", marginTop: 2, lineHeight: 1.4, paddingLeft: 8, textAlign: "justify" },
  bulletItem: { flexDirection: "row", marginBottom: 4, paddingLeft: 4 },
  bullet: { width: 10, fontSize: 10 },
  bulletText: { flex: 1, lineHeight: 1.4, textAlign: "justify" },
  refGrid: { flexDirection: "row", flexWrap: "wrap", gap: 15 },
  refCard: { width: "48%", marginBottom: 6 }
});

// 3. PDF Document Component
function ResumeDocument({ data, photoBase64, t, locale }) {
  const contactParts = [data.email, data.phone, data.location].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={[pdfStyles.page,locale !== 'en' ? {fontFamily:'KaarYab Arabic',direction:'rtl',textAlign:'right'} : {}]}>
        <View style={pdfStyles.headerContainer}>
          <View style={pdfStyles.headerLeft}>
            <Text style={pdfStyles.name}>{data.fullName || t("Your Full Name")}</Text>
            <Text style={pdfStyles.title}>{data.professionalTitle || t("Professional Title")}</Text>
            <View style={pdfStyles.contactRow}>
              {contactParts.map((part, i) => (
                <Text key={i}>{part}{i < contactParts.length - 1 ? "   •   " : ""}</Text>
              ))}
            </View>
          </View>
          {photoBase64 && <PDFImage src={photoBase64} style={pdfStyles.avatar} />}
        </View>

        {data.summary && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{t("Personal Profile / Summary")}</Text>
            <Text style={pdfStyles.summaryText}>{data.summary}</Text>
          </View>
        )}

        {data.experience?.some((e) => e.company || e.role) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{t("Experiences & Research")}</Text>
            {data.experience.filter((e) => e.company || e.role).map((e, i) => (
              <View key={i} style={pdfStyles.entry}>
                <View style={pdfStyles.entryHeader}>
                  <Text style={pdfStyles.entryTitle}>• {e.role}{e.company ? `, ${e.company}` : ""}</Text>
                  <Text style={pdfStyles.entrySub}>{e.period}</Text>
                </View>
                {e.description && <Text style={pdfStyles.entryDesc}>{e.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {data.education?.some((e) => e.school || e.degree) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{t("Education")}</Text>
            {data.education.filter((e) => e.school || e.degree).map((e, i) => (
              <View key={i} style={pdfStyles.entry}>
                <View style={pdfStyles.entryHeader}>
                  <Text style={pdfStyles.entryTitle}>• {e.degree}</Text>
                  <Text style={pdfStyles.entrySub}>{e.year}</Text>
                </View>
                <Text style={[pdfStyles.entryDesc, { paddingLeft: 8 }]}>{e.school}</Text>
              </View>
            ))}
          </View>
        )}

        {data.awards?.some((a) => a.text) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{t("Honors & Awards")}</Text>
            {data.awards.filter((a) => a.text).map((a, i) => (
              <View key={i} style={pdfStyles.bulletItem}>
                <Text style={pdfStyles.bullet}>•</Text>
                <Text style={pdfStyles.bulletText}>{a.text}</Text>
              </View>
            ))}
          </View>
        )}

        {data.certificates?.some((c) => c.text) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{t("Certificates")}</Text>
            {data.certificates.filter((c) => c.text).map((c, i) => (
              <View key={i} style={pdfStyles.bulletItem}>
                <Text style={pdfStyles.bullet}>•</Text>
                <Text style={pdfStyles.bulletText}>{c.text}</Text>
              </View>
            ))}
          </View>
        )}

        {data.skills && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{t("Skills")}</Text>
            <Text style={pdfStyles.summaryText}>{data.skills}</Text>
          </View>
        )}

        {data.interests && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{t("Interests & Hobbies")}</Text>
            <Text style={pdfStyles.summaryText}>{data.interests}</Text>
          </View>
        )}

        {data.references?.some((r) => r.name) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>{t("References")}</Text>
            <View style={pdfStyles.refGrid}>
              {data.references.filter((r) => r.name).map((r, i) => (
                <View key={i} style={pdfStyles.refCard}>
                  <Text style={{ fontWeight: "bold", color: "#1a202c" }}>{r.name}</Text>
                  <Text style={{ color: "#4a5568", fontStyle: "italic", fontSize: 8.5, marginTop: 1 }}>{r.title}</Text>
                  <Text style={{ color: "#718096", fontSize: 8.5, marginTop: 2 }}>{r.contact}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

// 4. Main Component for the Page Body
export default function CVBuilderPage() {
  const { t, i18n } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [photo, setPhoto] = useState(null);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const education = useFieldArray({ control, name: "education" });
  const experience = useFieldArray({ control, name: "experience" });
  const awards = useFieldArray({ control, name: "awards" });
  const certificates = useFieldArray({ control, name: "certificates" });
  const references = useFieldArray({ control, name: "references" });
  
  const liveData = watch();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<ResumeDocument data={data} photoBase64={photo} t={t} locale={i18n.language} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(data.fullName || "resume").replace(/\s+/g, "_")}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert(t("Error generating PDF."));
    } finally {
      setIsGenerating(false);
    }
  };

  const inputClass = "w-full px-4 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-purple-500";
  const labelClass = "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6 px-4">
      <div className="flex justify-between items-center">
        <Link href="/dashboard" className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-500 hover:text-purple-600 dark:text-slate-400">
          <ArrowLeft className="w-4 h-4" /> <span>{t("Back to Dashboard")}</span>
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <span>{t("KaarYab Afghanistan Full CV Builder")}</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* left sidebar: form filling */}
        <div className="space-y-5 max-h-[85vh] overflow-y-auto pr-2">
          
          {/* personal information and photo */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b pb-2 dark:border-slate-800">{t("Personal Details & Photo")}</h3>
            
            <div className="flex items-center space-x-4 mb-2">
              <div className="relative w-16 h-20 bg-slate-100 dark:bg-slate-800 border rounded-lg flex items-center justify-center overflow-hidden">
                {photo ? <img src={photo} alt={t("Your CV portrait")} className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-slate-400" />}
              </div>
              <div>
                <label className="block text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-purple-50">{t("Upload Photo")}<input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">{t("PNG or JPG passport size image.")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("Full Name *")}</label>
                <input {...register("fullName")} placeholder={t("Alex Mercer")} className={inputClass} />
                {errors.fullName && <p className={errorClass}>{t(errors.fullName.message)}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("Professional Title *")}</label>
                <input {...register("professionalTitle")} placeholder={t("Senior Full-Stack Engineer / DevOps Specialist")} className={inputClass} />
                {errors.professionalTitle && <p className={errorClass}>{t(errors.professionalTitle.message)}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("Email Address *")}</label>
                <input {...register("email")} placeholder="alex.mercer.dev@email.com" className={inputClass} />
                {errors.email && <p className={errorClass}>{t(errors.email.message)}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("Phone Number *")}</label>
                <input {...register("phone")} placeholder="+1 (555) 019-2834" className={inputClass} />
                {errors.phone && <p className={errorClass}>{t(errors.phone.message)}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("Location *")}</label>
                <input {...register("location")} placeholder={t("San Francisco, CA")} className={inputClass} />
                {errors.location && <p className={errorClass}>{t(errors.location.message)}</p>}
              </div>
            </div>
            <div>
              <label className={labelClass}>{t("Professional Summary")}</label>
              <textarea {...register("summary")} rows={3} placeholder={t("Results-driven Software Engineer with 6+ years of experience designing scalable web applications and optimizing cloud infrastructure...")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("Skills (Categorized text)")}</label>
              <textarea {...register("skills")} rows={3} placeholder={t("Skills example")} className={inputClass} />
              {errors.skills && <p className={errorClass}>{t(errors.skills.message)}</p>}
            </div>
          </div>

          {/* professional experiences and research */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Briefcase className="w-4 h-4 text-purple-600" />{t("Experiences & Research")}</h3>
              <button type="button" onClick={() => experience.append({ company: "", role: "", period: "", description: "" })} className="text-xs font-bold text-purple-600 cursor-pointer hover:underline"><Plus className="w-3.5 h-3.5 inline" />{t("Add")}</button>
            </div>
            {experience.fields.map((field, i) => (
              <div key={field.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input {...register(`experience.${i}.role`)} placeholder={t("e.g. Senior Software Engineer")} className={inputClass} />
                  <input {...register(`experience.${i}.company`)} placeholder={t("e.g. TechCorp Solutions")} className={inputClass} />
                </div>
                <input {...register(`experience.${i}.period`)} placeholder={t("e.g. Jan 2023 - Present")} className={inputClass} />
                <textarea {...register(`experience.${i}.description`)} rows={2} placeholder={t("Led a team of 4 engineers to rebuild the core microservices architecture, reducing API latency by 40%...")} className={inputClass} />
                <button type="button" onClick={() => experience.remove(i)} className="text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" />{t("Remove")}</button>
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-purple-600" />{t("Education")}</h3>
              <button type="button" onClick={() => education.append({ school: "", degree: "", year: "" })} className="text-xs font-bold text-purple-600 cursor-pointer hover:underline"><Plus className="w-3.5 h-3.5 inline" />{t("Add")}</button>
            </div>
            {education.fields.map((field, i) => (
              <div key={field.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input {...register(`education.${i}.degree`)} placeholder={t("e.g. B.S. in Computer Science")} className={inputClass} />
                  <input {...register(`education.${i}.school`)} placeholder={t("e.g. Stanford University")} className={inputClass} />
                </div>
                <input {...register(`education.${i}.year`)} placeholder={t("e.g. 2018 - 2022")} className={inputClass} />
                <button type="button" onClick={() => education.remove(i)} className="text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" />{t("Remove")}</button>
              </div>
            ))}
          </div>

          {/* Honors & Awards Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Award className="w-4 h-4 text-purple-600" />{t("Honors & Awards")}</h3>
              <button type="button" onClick={() => awards.append({ text: "" })} className="text-xs font-bold text-purple-600 cursor-pointer hover:underline"><Plus className="w-3.5 h-3.5 inline" />{t("Add")}</button>
            </div>
            {awards.fields.map((field, i) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input {...register(`awards.${i}.text`)} placeholder={t("e.g. 1st Place Winner at Global Hackathon (2024)")} className={inputClass} />
                <button type="button" onClick={() => awards.remove(i)} className="text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {/* Certificates Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-600" />{t("Certificates")}</h3>
              <button type="button" onClick={() => certificates.append({ text: "" })} className="text-xs font-bold text-purple-600 cursor-pointer hover:underline"><Plus className="w-3.5 h-3.5 inline" />{t("Add")}</button>
            </div>
            {certificates.fields.map((field, i) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input {...register(`certificates.${i}.text`)} placeholder={t("e.g. AWS Certified Solutions Architect – Professional")} className={inputClass} />
                <button type="button" onClick={() => certificates.remove(i)} className="text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {/* Interests & Hobbies */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b pb-2 dark:border-slate-800 flex items-center gap-2"><Heart className="w-4 h-4 text-purple-600" />{t("Interests & Hobbies")}</h3>
            <textarea {...register("interests")} rows={2} placeholder={t("e.g. Open-source contribution, Blockchain systems, Amateur astronomy.")} className={inputClass} />
          </div>

          {/* References */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Users className="w-4 h-4 text-purple-600" />{t("References")}</h3>
              <button type="button" onClick={() => references.append({ name: "", title: "", contact: "" })} className="text-xs font-bold text-purple-600 cursor-pointer hover:underline"><Plus className="w-3.5 h-3.5 inline" />{t("Add")}</button>
            </div>
            {references.fields.map((field, i) => (
              <div key={field.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <input {...register(`references.${i}.name`)} placeholder={t("e.g. Sarah Jenkins")} className={inputClass} />
                <input {...register(`references.${i}.title`)} placeholder={t("e.g. CTO at TechCorp Solutions")} className={inputClass} />
                <input {...register(`references.${i}.contact`)} placeholder={t("e.g. Email: s.jenkins@techcorp.com")} className={inputClass} />
                <button type="button" onClick={() => references.remove(i)} className="text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" />{t("Remove")}</button>
              </div>
            ))}
          </div>

          <button type="submit" disabled={isGenerating} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50">
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> <span>{t("Generating CV...")}</span></> : <><Download className="w-4 h-4" /> <span>{t("Download Academic CV PDF")}</span></>}
          </button>
        </div>

        {/* right sidebar: live preview */}
        <div className="lg:sticky lg:top-6 h-fit bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 max-h-[85vh] overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5 text-start">
            
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wide">{liveData.fullName || t("Alex Mercer")}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 italic">{liveData.professionalTitle || t("Senior Full-Stack Engineer / DevOps Specialist")}</p>
                <p className="text-[11px] text-slate-400 mt-1">{[liveData.email, liveData.phone, liveData.location].filter(Boolean).join("   •   ")}</p>
              </div>
              {photo && <img src={photo} alt={t("Your CV portrait preview")} className="w-16 h-20 object-cover rounded border border-slate-200" />}
            </div>

            {liveData.summary && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider border-b border-slate-900 dark:border-slate-400 pb-0.5 mb-1.5">{t("Profile / Summary")}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-justify whitespace-pre-line">{liveData.summary}</p>
              </div>
            )}

            {liveData.experience?.some((e) => e.company || e.role) && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider border-b border-slate-900 dark:border-slate-400 pb-0.5 mb-1.5">{t("Experiences & Research")}</h4>
                <div className="space-y-2.5">
                  {liveData.experience.filter((e) => e.company || e.role).map((e, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between items-baseline"><span className="font-bold text-slate-800 dark:text-slate-200">• {e.role}{e.company ? `, ${e.company}` : ""}</span><span className="text-[10px] text-slate-400 font-medium">{e.period}</span></div>
                      {e.description && <p className="text-slate-500 dark:text-slate-400 mt-0.5 pl-3 text-justify whitespace-pre-line leading-relaxed">{e.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {liveData.education?.some((e) => e.school || e.degree) && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider border-b border-slate-900 dark:border-slate-400 pb-0.5 mb-1.5">{t("Education")}</h4>
                <div className="space-y-2">
                  {liveData.education.filter((e) => e.school || e.degree).map((e, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between items-baseline"><span className="font-bold text-slate-800 dark:text-slate-200">• {e.degree}</span><span className="text-[10px] text-slate-400 font-medium">{e.year}</span></div>
                      <p className="text-slate-400 dark:text-slate-500 pl-3">{e.school}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {liveData.awards?.some((a) => a.text) && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider border-b border-slate-900 dark:border-slate-400 pb-0.5 mb-1.5">{t("Honors & Awards")}</h4>
                <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  {liveData.awards.filter((a) => a.text).map((a, i) => <li key={i}>{a.text}</li>)}
                </ul>
              </div>
            )}

            {liveData.certificates?.some((c) => c.text) && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider border-b border-slate-900 dark:border-slate-400 pb-0.5 mb-1.5">{t("Certificates")}</h4>
                <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  {liveData.certificates.filter((c) => c.text).map((c, i) => <li key={i}>{c.text}</li>)}
                </ul>
              </div>
            )}

            {liveData.skills && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider border-b border-slate-900 dark:border-slate-400 pb-0.5 mb-1.5">{t("Skills")}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{liveData.skills}</p>
              </div>
            )}

            {liveData.references?.some((r) => r.name) && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider border-b border-slate-900 dark:border-slate-400 pb-0.5 mb-1.5">{t("References")}</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {liveData.references.filter((r) => r.name).map((r, i) => (
                    <div key={i} className="text-slate-600 dark:text-slate-300">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{r.name}</p>
                      <p className="text-[10px] text-slate-400 italic">{r.title}</p>
                      <p className="text-[10px] text-slate-400 whitespace-pre-line">{r.contact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </form>
    </div>
  );
}
