import { defineStore } from 'pinia';
import { speech } from '../utils/speech';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    voices: [],
    selectedVoiceName: '',
  }),
  actions: {
    async init() {
      if (typeof window === 'undefined') return;

      await speech.init();
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
      speech.setVoice(name);
      this.selectedVoiceName = name;
    }
  }
});
