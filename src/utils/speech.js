export const speech = {
  voices: [],
  selectedVoice: null,

  init() {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }
      const synth = window.speechSynthesis;

      const loadVoices = () => {
        try {
          this.voices = synth.getVoices();
          if (this.voices.length > 0) {
            this.selectedVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
            resolve();
          }
        } catch (e) {
          console.warn('Failed to get voices:', e);
          resolve();
        }
      };

      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
      }

      loadVoices();

      // Fallback resolve if voices take too long or never load
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  },

  speak(text) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  },

  setVoice(name) {
    this.selectedVoice = this.voices.find(v => v.name === name) || this.selectedVoice;
  }
};
