import { defineStore } from 'pinia';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, SUPPORTED_LANGUAGES } from '../utils/constants';
import i18n from '../i18n';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    voices: [],
    selectedVoiceName: '',
    volume: 1.0,
    isMuted: false,
    locale: 'en',
  }),
  actions: {
    async init() {
      if (typeof window === 'undefined') return;

      // Load saved preferences
      const savedVoice = storage.load(STORAGE_KEYS.SELECTED_VOICE);
      const savedVolume = storage.load(STORAGE_KEYS.VOLUME);
      const savedMuted = storage.load(STORAGE_KEYS.IS_MUTED);
      const savedLocale = storage.load(STORAGE_KEYS.LOCALE);

      if (savedVolume !== null) this.volume = parseFloat(savedVolume);
      if (savedMuted !== null) this.isMuted = savedMuted === 'true';
      if (savedLocale !== null) {
        this.setLocale(savedLocale);
      }

      audio.setVolume(this.volume);
      audio.setMuted(this.isMuted);
      speech.setVolume(this.volume);

      await speech.init();

      if (savedVoice && speech.setVoice(savedVoice)) {
        this.selectedVoiceName = savedVoice;
      } else if (this.locale) {
        // Try to pick a sensible voice for the current locale
        speech.refreshVoices(this.locale);
        this.selectedVoiceName = speech.selectedVoice?.name || '';
      }

      this.updateVoices();

      // Use addEventListener to avoid overriding speech.js handler
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
    setVoice(name) {
      if (speech.setVoice(name)) {
        this.selectedVoiceName = name;
        storage.save(STORAGE_KEYS.SELECTED_VOICE, name);
      }
    },
    async setLocale(locale) {
      this.locale = locale;
      i18n.global.locale.value = locale;
      storage.save(STORAGE_KEYS.LOCALE, locale);

      // Update TTS voice for new locale
      speech.refreshVoices(locale);
      this.updateVoices();
    },
    setVolume(val) {
      this.volume = val;
      audio.setVolume(val);
      speech.setVolume(val);
      storage.save(STORAGE_KEYS.VOLUME, val.toString());
    },
    setMuted(muted) {
      this.isMuted = muted;
      audio.setMuted(muted);
      storage.save(STORAGE_KEYS.IS_MUTED, muted.toString());
    },
    toggleMute() {
      this.setMuted(!this.isMuted);
    }
  }
});
