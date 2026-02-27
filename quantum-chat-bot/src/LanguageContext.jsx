import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // Get stored language from localStorage or default to "English"
    const stored = localStorage.getItem('preferredLanguage');
    return stored || "English";
  });

  const [translatedMessages, setTranslatedMessages] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Save to localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', selectedLanguage);
  }, [selectedLanguage]);

  const value = {
    selectedLanguage,
    setSelectedLanguage,
    translatedMessages,
    setTranslatedMessages,
    isTranslating,
    setIsTranslating
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};