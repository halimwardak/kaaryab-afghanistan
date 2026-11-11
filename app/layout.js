// app/layout.js
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SavedProvider } from "../context/SavedContext";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";

const inter = localFont({ src: "../public/fonts/Inter.ttf", display: "swap" });

export const metadata = {
  title: "KaarYab Afghanistan",
  description: "Opportunity Finder Platform for Afghan Youth",
  icons: {
    icon: "https://api.iconify.design/lucide:graduation-cap.svg?color=%239333ea",
    shortcut: "https://api.iconify.design/lucide:graduation-cap.svg?color=%239333ea",
    apple: "https://api.iconify.design/lucide:graduation-cap.svg?color=%239333ea",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 min-h-screen flex flex-col transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider><LanguageProvider><SavedProvider>
            <Navbar />
            
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            
            <Footer />
          </SavedProvider></LanguageProvider></AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
