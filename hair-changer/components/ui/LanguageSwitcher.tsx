import { useTranslation } from "../../lib/i18n.tsx";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "sk" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="text-sm font-bold uppercase w-10 h-7 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
      aria-label="Change language"
    >
      {language === "sk" ? "EN" : "SK"}
    </button>
  );
};
