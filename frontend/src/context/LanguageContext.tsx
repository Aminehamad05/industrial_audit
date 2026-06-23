import React, { createContext, useContext, useState } from 'react';
import { translations } from '../translations';
import type { Language } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default language is French ('fr')
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('hutch_language');
    if (saved === 'en' || saved === 'fr') {
      return saved as Language;
    }
    return 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hutch_language', lang);
  };

  const t = (key: string): string => {
    const dict = translations[language];
    // Check if the key exists in translations
    if (key in dict) {
      return (dict as any)[key];
    }
    // Check if the key exists in the other language dictionary as a fallback
    const fallbackLang = language === 'fr' ? 'en' : 'fr';
    const fallbackDict = translations[fallbackLang];
    if (key in fallbackDict) {
      return (fallbackDict as any)[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
