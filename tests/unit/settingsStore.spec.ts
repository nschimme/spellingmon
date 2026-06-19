import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSettingsStore } from '../../src/stores/settingsStore';

describe('settingsStore Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const settings = useSettingsStore();
    expect(settings.locale).toBe('en-US');
    expect(settings.volume).toBe(1.0);
    expect(settings.isMuted).toBe(false);
  });

  it('updates locale and handles tts verification', async () => {
    const settings = useSettingsStore();

    // We mock loadLocaleMessages globally in setup or here
    // For now we just test that the state updates
    await settings.setLocale('es-MX');
    expect(settings.locale).toBe('es-MX');

    expect(settings.ttsVerified).toBe(false);
    settings.confirmTtsVerified();
    expect(settings.ttsVerified).toBe(true);
  });

  it('toggles mute and sets volume', () => {
    const settings = useSettingsStore();
    settings.setVolume(0.5);
    expect(settings.volume).toBe(0.5);

    settings.toggleMute();
    expect(settings.isMuted).toBe(true);
    settings.toggleMute();
    expect(settings.isMuted).toBe(false);
  });
});
