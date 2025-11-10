import { useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

type TranslationKey = keyof typeof translations.sk & keyof typeof translations.en;

export const useTranslation = () => {
    const { language } = useLanguage();

    const t = useCallback((key: string): string => {
        // This type assertion is safe because we ensure all keys exist in both languages.
        return translations[language][key as TranslationKey] || key;
    }, [language]);

    return { t, language };
};
