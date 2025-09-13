import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: t('settings.language.en') },
    { code: 'es', name: t('settings.language.es') },
    { code: 'fr', name: t('settings.language.fr') },
    { code: 'de', name: t('settings.language.de') },
    { code: 'ja', name: t('settings.language.ja') },
    { code: 'ko', name: t('settings.language.ko') },
    { code: 'zh', name: t('settings.language.zh') }
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    
    // Save language preference to localStorage
    localStorage.setItem('preferredLanguage', newLang);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <select 
        className="bg-transparent border-none focus:outline-none text-sm"
        value={i18n.language}
        onChange={handleLanguageChange}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;