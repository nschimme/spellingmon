import { defineStore } from 'pinia';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    voices: [],
    selectedVoiceName: '',
    volume: 1.0,
    isMuted: false,
  }),
  actions: {
    async init() {
      if (typeof window === 'undefined') return;

      // Load saved preferences
      const savedVoice = storage.load(STORAGE_KEYS.SELECTED_VOICE);
      const savedVolume = storage.load(STORAGE_KEYS.VOLUME);
      const savedMuted = storage.load(STORAGE_KEYS.IS_MUTED);

      if (savedVolume !== null) this.volume = parseFloat(savedVolume);
      if (savedMuted !== null) this.isMuted = savedMuted === 'true';

      audio.setVolume(this.volume);
      audio.setMuted(this.isMuted);
      speech.setVolume(this.volume);

      await speech.init();

      if (savedVoice && speech.setVoice(savedVoice)) {
        this.selectedVoiceName = savedVoice;
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
