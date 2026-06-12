import { defineStore } from 'pinia';
import { speech } from '../utils/speech';
import { storage } from '../utils/storage';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    voices: [],
    selectedVoiceName: '',
  }),
  actions: {
    async init() {
      if (typeof window === 'undefined') return;

      // Load saved voice preference if any
      const savedVoice = storage.load('selected_voice_name');

      await speech.init();

      if (savedVoice && speech.setVoice(savedVoice)) {
        this.selectedVoiceName = savedVoice;
      }

      this.updateVoices();

      // Use addEventListener to avoid overriding speech.js handler
      if (window.speechSynthesis && window.speechSynthesis.addEventListener) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
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
        storage.save('selected_voice_name', name);
      }
    }
  }
});
