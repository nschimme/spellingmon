import { createI18n } from 'vue-i18n';
import enUS from './locales/en-US.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS
  }
});

export async function loadLocaleMessages(locale) {
  if (i18n.global.availableLocales.includes(locale)) {
    return;
  }

  try {
    const messages = await import(`./locales/${locale}.json`);
    i18n.global.setLocaleMessage(locale, messages.default);
  } catch (error) {
    console.error(`Failed to load locale messages for ${locale}:`, error);
  }
}

export default i18n;
