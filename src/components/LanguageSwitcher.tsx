import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../lib/i18n.tsx';
import type { Language } from '../lib/i18n/translations';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { currentLanguage, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'sk' as Language, name: 'Slovenčina', flag: '🇸🇰' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);

    // Store preference in localStorage
    localStorage.setItem('papi-language', langCode);

    // Update document language attribute
    document.documentElement.lang = langCode;
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 text-white px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-all"
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="text-sm font-medium hidden sm:block">{currentLang?.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 right-0 bg-gray-800/90 backdrop-blur-lg border border-gray-600/50 rounded-lg overflow-hidden shadow-xl z-50 min-w-[200px]"
            >
              {languages.map((language) => (
                <motion.button
                  key={language.code}
                  whileHover={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    currentLanguage === language.code
                      ? 'bg-amber-400/20 text-amber-200 border-r-2 border-amber-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <div className="font-medium text-sm">{language.name}</div>
                    <div className="text-xs opacity-70">{language.code.toUpperCase()}</div>
                  </div>
                  {currentLanguage === language.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};