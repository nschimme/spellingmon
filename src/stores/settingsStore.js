import { defineStore } from 'pinia';
import { speech } from '../utils/speech';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    voices: [],
    selectedVoiceName: '',
  }),
  actions: {
    async init() {
      await speech.init();
      this.updateVoices();
      // Listen for voice changes
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.updateVoices();
        };
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
