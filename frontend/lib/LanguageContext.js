import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

const STORAGE_KEY = 'ui_lang';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('hi'); // Default: Hindi

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (savedLang && (savedLang === 'hi' || savedLang === 'en')) {
        setLanguage(savedLang);
      }
    }
  }, []);

  const changeLanguage = (newLang) => {
    if (newLang === 'hi' || newLang === 'en') {
      setLanguage(newLang);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newLang);
      }
    }
  };

  const toggleLanguage = () => {
    const next = language === 'hi' ? 'en' : 'hi';
    changeLanguage(next);
  };

  // Translation helper function
  const t = (key) => {
    const activeDict = translations[language] || translations.hi;
    return activeDict[key] ?? translations.hi[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      language: 'hi',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key) => translations.hi[key] || key,
    };
  }
  return context;
}
