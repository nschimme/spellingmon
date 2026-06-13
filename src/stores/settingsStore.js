import { defineStore } from 'pinia';
import { speech } from '../utils/speech';
import { audio } from '../utils/audio';
import { storage } from '../utils/storage';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    voices: [],
    selectedVoiceName: '',
    volume: 0.5,
    isMuted: false,
  }),
  actions: {
    async init() {
      if (typeof window === 'undefined') return;

      // Load saved preferences
      const savedVoice = storage.load('selected_voice_name');
      const savedVolume = storage.load('volume');
      const savedMuted = storage.load('is_muted');

      if (savedVolume !== null) this.volume = parseFloat(savedVolume);
      if (savedMuted !== null) this.isMuted = savedMuted === 'true';

      audio.setVolume(this.volume);
      audio.setMuted(this.isMuted);

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
    },
    setVolume(val) {
      this.volume = val;
      audio.setVolume(val);
      storage.save('volume', val.toString());
    },
    setMuted(muted) {
      this.isMuted = muted;
      audio.setMuted(muted);
      storage.save('is_muted', muted.toString());
    },
    toggleMute() {
      this.setMuted(!this.isMuted);
    }
  }
});
