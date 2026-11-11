"use client";
import { useTranslation } from 'react-i18next';
// components/Footer.jsx
export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-slate-50 text-slate-500 border-t border-slate-200 py-8 mt-auto transition-colors duration-300 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center md:text-start space-y-1">
            <p>© {new Date().getFullYear()}{' '}{t("KaarYab Afghanistan. All rights reserved.")}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{t("Empowering Afghan youth to find jobs, scholarships, and skills.")}</p>
          </div>

          <div className="flex items-center gap-5 flex-wrap justify-center text-slate-400 dark:text-slate-500">
            
            {/* Twitter (X) */}
            <a href="https://x.com/Zahrana70554346" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-purple-600 dark:hover:text-pink-400 hover:scale-110 transition-all duration-200">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a href="https://www.instagram.com/zar_design6733/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-purple-600 dark:hover:text-pink-400 hover:scale-110 transition-all duration-200">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* GitHub */}
            <a href="https://github.com/Zahranazari607" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-purple-600 dark:hover:text-pink-400 hover:scale-110 transition-all duration-200">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a href="https://youtube.com/@zar-design6733?si=yhwD_1CSE7uAo9UX" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-purple-600 dark:hover:text-pink-400 hover:scale-110 transition-all duration-200">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
              </svg>
            </a>

            {/* LinkedIn */}
            <a href="https://www.linkedin.com/in/zahra-nazari-29aa07333/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-purple-600 dark:hover:text-pink-400 hover:scale-110 transition-all duration-200">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>

          </div>
        </div>

        <div className="text-center border-t border-slate-200/60 dark:border-slate-900 pt-4">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">{t("Created with ❤️ for Afghan Youth. By")}<span className="text-purple-600 dark:text-pink-400 font-bold">Halim</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
