import React, { createContext, useContext, useEffect, useState } from 'react';
import { BilingualText, Language } from '../types/academic';
import { getLanguageDirection } from '../utils/academicRules';

interface LanguageContextValue {
  lang: Language;
  dir: 'rtl' | 'ltr';
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (text: BilingualText) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');
  const dir = getLanguageDirection(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
  };

  const toggleLang = () => {
    setLangState((prev) => (prev === 'ar' ? 'fr' : 'ar'));
  };

  const t = (text: BilingualText) => text[lang];

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
