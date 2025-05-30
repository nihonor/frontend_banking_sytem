"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface LanguageProviderProps {
  children: React.ReactNode;
}

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const languageNames: Record<string, string> = {
  en: "English",
  fr: "Français",
  rw: "Kinyarwanda",
  sw: "Kiswahili",
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    document.documentElement.lang = language;
    // You could load language-specific content here
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export { languageNames };
