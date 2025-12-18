import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';

// US-033: Persistencia de idioma en localStorage
const LANGUAGE_KEY = 'delicious_kitchen_language';
const savedLanguage = localStorage.getItem(LANGUAGE_KEY) || 'es';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation }
    },
    lng: savedLanguage, // idioma guardado o español por defecto
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// US-033: Guardar idioma cuando cambie
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;
