import { defineStore } from 'pinia';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { STORAGE_KEYS, SUPPORTED_LANGUAGES } from '../utils/constants';
import i18n, { loadLocaleMessages } from '../i18n';

export interface SettingsStoreState {
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  volume: number;
  isMuted: boolean;
  locale: string;
  ttsVerified: boolean;
}

export const useSettingsStore = defineStore('settings', {
  persist: {
    key: STORAGE_KEYS.SETTINGS,
    version: '1.0.0',
    exclude: ['voices']
  },
  state: (): SettingsStoreState => ({
    voices: [],
    selectedVoiceName: '',
    volume: 1.0,
    isMuted: false,
    locale: 'en-US',
    ttsVerified: false,
  }),
  actions: {
    async init() {
      if (typeof window === 'undefined') return;

      await this.setLocale(this.locale);

      audio.setVolume(this.volume);
      audio.setMuted(this.isMuted);
      speech.setVolume(this.volume);

      await speech.init();

      if (this.selectedVoiceName && speech.setVoice(this.selectedVoiceName)) {
        // Voice set successfully
      } else if (this.locale) {
        speech.refreshVoices(this.locale);
        this.selectedVoiceName = speech.selectedVoice?.name || '';
      }

      this.updateVoices();

      if (window.speechSynthesis && window.speechSynthesis.addEventListener) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          speech.refreshVoices();
          this.updateVoices();
        });
      }
    },
    updateVoices() {
      this.voices = speech.voices;
      this.selectedVoiceName = speech.selectedVoice?.name || '';
    },
    setVoice(name: string) {
      if (speech.setVoice(name)) {
        this.selectedVoiceName = name;
      }
    },
    async setLocale(locale: string) {
      await loadLocaleMessages(locale);
      this.locale = locale;
      i18n.global.locale.value = locale;

      // Update TTS voice for new locale
      speech.refreshVoices(locale);
      this.updateVoices();
    },
    async detectAndSetLocale() {
      if (typeof navigator === 'undefined') return;

      const browserLocales = navigator.languages || [navigator.language];
      let bestMatch = 'en-US';

      for (const bLoc of browserLocales) {
        const match = SUPPORTED_LANGUAGES.find(lang =>
          lang.code.toLowerCase() === bLoc.toLowerCase() ||
          lang.code.split('-')[0].toLowerCase() === bLoc.split('-')[0].toLowerCase()
        );

        if (match && speech.isLanguageSupported(match.code)) {
          bestMatch = match.code;
          break;
        }
      }

      await this.setLocale(bestMatch);
    },
    setVolume(val: number) {
      this.volume = val;
      audio.setVolume(val);
      speech.setVolume(val);
    },
    setMuted(muted: boolean) {
      this.isMuted = muted;
      audio.setMuted(muted);
    },
    toggleMute() {
      this.setMuted(!this.isMuted);
    },
    t(key: string, params?: any): any {
      const translation = i18n.global.t(key, params);
      return translation;
    },
    confirmTtsVerified() {
      this.ttsVerified = true;
    }
  }
});
