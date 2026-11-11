import { createInstance } from 'i18next';
import { resources } from '../locales/catalog.mjs';

// Each provider starts with the same synchronous English SSR snapshot.
// A shared mutable instance can retain a previous tree's selected language.
export function createLanguageInstance() {
  const instance = createInstance();
  instance.init({ resources, lng: 'en', fallbackLng: 'en', initAsync: false, keySeparator: false, nsSeparator: false, interpolation: { escapeValue: false }, react: { useSuspense: false } });
  return instance;
}
