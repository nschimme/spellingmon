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
    let module;
    switch (locale) {
      case 'de-DE': module = await import('./locales/de-DE.json'); break;
      case 'es-MX': module = await import('./locales/es-MX.json'); break;
      case 'fr-FR': module = await import('./locales/fr-FR.json'); break;
      case 'pt-BR': module = await import('./locales/pt-BR.json'); break;
      case 'ru-RU': module = await import('./locales/ru-RU.json'); break;
      case 'zh-CN': module = await import('./locales/zh-CN.json'); break;
      default: throw new Error('Unknown locale');
    }
    // Handle both Module.default and plain objects for maximum compatibility
    const messages = module.default || module;
    i18n.global.setLocaleMessage(locale, messages);
  } catch (error) {
    console.error(`Failed to load locale messages for ${locale}:`, error);
  }
}

export default i18n;
