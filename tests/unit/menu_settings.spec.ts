import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '../../src/i18n';
import MenuSettings from '../../src/components/menu/MenuSettings.vue';
import { useSettingsStore } from '../../src/stores/settingsStore';
import enUS from '../../src/i18n/locales/en-US.json';
import deDE from '../../src/i18n/locales/de-DE.json';
import esMX from '../../src/i18n/locales/es-MX.json';
import frFR from '../../src/i18n/locales/fr-FR.json';
import jaJP from '../../src/i18n/locales/ja-JP.json';
import ptBR from '../../src/i18n/locales/pt-BR.json';
import ruRU from '../../src/i18n/locales/ru-RU.json';
import zhCN from '../../src/i18n/locales/zh-CN.json';

describe('MenuSettings.vue Accessibility & Mute Toggle', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountMenuSettings = () => {
    return mount(MenuSettings, {
      global: {
        plugins: [i18n]
      }
    });
  };

  it('renders correct localized aria-label and title for unmuted and muted states', async () => {
    const settingsStore = useSettingsStore();
    settingsStore.isMuted = false;

    const wrapper = mountMenuSettings();

    const muteBtn = wrapper.find('button[aria-pressed]');
    expect(muteBtn.exists()).toBe(true);

    // Initial unmuted state
    expect(muteBtn.attributes('aria-pressed')).toBe('false');
    expect(muteBtn.attributes('aria-label')).toBe('muted');
    expect(muteBtn.attributes('title')).toBe('muted');

    // Click to mute
    await muteBtn.trigger('click');
    expect(settingsStore.isMuted).toBe(true);
    expect(muteBtn.attributes('aria-pressed')).toBe('true');
    expect(muteBtn.attributes('aria-label')).toBe('unmuted');
    expect(muteBtn.attributes('title')).toBe('unmuted');
  });

  it('verifies that unmuted and muted are defined across all 8 supported locale files', () => {
    const allLocales = [
      { name: 'en-US', data: enUS },
      { name: 'de-DE', data: deDE },
      { name: 'es-MX', data: esMX },
      { name: 'fr-FR', data: frFR },
      { name: 'ja-JP', data: jaJP },
      { name: 'pt-BR', data: ptBR },
      { name: 'ru-RU', data: ruRU },
      { name: 'zh-CN', data: zhCN }
    ];

    for (const { data } of allLocales) {
      expect(data.settings.unmuted).toBeDefined();
      expect(data.settings.unmuted.length).toBeGreaterThan(0);
      expect(data.settings.muted).toBeDefined();
      expect(data.settings.muted.length).toBeGreaterThan(0);
    }
  });
});
