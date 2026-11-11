"use client";
import { useTranslation } from 'react-i18next';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "../context/SavedContext";
import { useTheme } from "../context/ThemeContext";
import { Home, Briefcase, Bookmark, PlusCircle, LayoutDashboard, Info, Mail, Menu, X, Sun, Moon, FileText } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user } = useAuth();
  const { savedItems } = useSaved() || { savedItems: [] };
  const { darkMode, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/opportunities", label: "Opportunities", icon: Briefcase },
    { href: user?.role === 'ADMIN' ? '/admin' : '/dashboard', label: user?.role === 'ADMIN' ? 'Administration' : 'Dashboard', icon: LayoutDashboard },
    { href: "/add-opportunity", label: "Post Opportunity", icon: PlusCircle },
    { href: "/cv-builder", label: "CV Builder", icon: FileText },
    { href: "/saved", label: `${t('Saved')} (${savedItems ? savedItems.length : 0})`, icon: Bookmark },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
    { href: "/account", label: user ? "Account" : "Sign in", icon: Info },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{t("KaarYab")}</span>
            <span className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              AF
            </span>
          </Link>

          {/* Right Side Actions (Desktop) */}
          <div className="hidden xl:flex items-center space-x-4">
            <LanguageSwitcher />
            {/* Desktop Navigation */}
            <div className="flex space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t(link.label)}</span>
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle Button (Desktop) */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
              title={t("Toggle Theme")}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Actions Menu Button */}
          <div className="flex items-center space-x-2 xl:hidden">
            <LanguageSwitcher />
            {/* Theme Toggle Button (Mobile) */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? t("Close navigation") : t("Open navigation")}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="xl:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 space-y-1 shadow-inner animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium ${
                  isActive(link.href)
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{t(link.label)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
