import { createI18n } from 'vue-i18n';
import enUS from './locales/en-US.json';
import deDE from './locales/de-DE.json';
import esMX from './locales/es-MX.json';
import frFR from './locales/fr-FR.json';
import ptBR from './locales/pt-BR.json';
import ruRU from './locales/ru-RU.json';
import zhCN from './locales/zh-CN.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'de-DE': deDE,
    'es-MX': esMX,
    'fr-FR': frFR,
    'pt-BR': ptBR,
    'ru-RU': ruRU,
    'zh-CN': zhCN
  }
});

export default i18n;
