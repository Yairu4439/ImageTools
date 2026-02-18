import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import es from './es.json';

const savedLang = typeof window !== 'undefined'
    ? localStorage.getItem('i18n-lang') || 'en'
    : 'en';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            es: { translation: es }
        },
        lng: savedLang,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

// Persist language changes
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('i18n-lang', lng);
});

export default i18n;
