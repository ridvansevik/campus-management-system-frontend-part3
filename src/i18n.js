import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import tr from './locales/tr.json';
import en from './locales/en.json';
import it from './locales/it.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            tr: {
                translation: tr
            },
            en: {
                translation: en
            },
            it: {
                translation: it
            }
        },
        fallbackLng: 'tr',
        interpolation: {
            escapeValue: false // React already escapes values
        }
    });

export default i18n;
