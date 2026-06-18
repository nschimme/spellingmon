import { createI18n } from 'vue-i18n';
import enUS from './locales/en-US.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en-US' as any,
  fallbackLocale: 'en-US' as any,
  messages: {
    'en-US': enUS
  }
});

export async function loadLocaleMessages(locale: string) {
  if (i18n.global.availableLocales.includes(locale) || locale === 'en-US') {
    return;
  }

  try {
    let messages;
    switch (locale) {
      case 'de-DE': messages = await import('./locales/de-DE.json'); break;
      case 'es-MX': messages = await import('./locales/es-MX.json'); break;
      case 'fr-FR': messages = await import('./locales/fr-FR.json'); break;
      case 'pt-BR': messages = await import('./locales/pt-BR.json'); break;
      case 'ru-RU': messages = await import('./locales/ru-RU.json'); break;
      case 'zh-CN': messages = await import('./locales/zh-CN.json'); break;
      default: throw new Error('Unknown locale');
    }
    i18n.global.setLocaleMessage(locale, messages.default);
  } catch (error) {
    console.error(`Failed to load locale messages for ${locale}:`, error);
  }
}

export default i18n;
