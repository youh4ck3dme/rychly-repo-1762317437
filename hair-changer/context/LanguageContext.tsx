import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";

type Language = "sk" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined" && navigator.language) {
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "sk") {
      return "sk";
    }
  }
  return "en"; // Default to English
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
