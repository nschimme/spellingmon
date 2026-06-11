export const speech = {
  voices: [],
  selectedVoice: null,

  init() {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      if (!synth) {
        resolve();
        return;
      }

      const loadVoices = () => {
        this.voices = synth.getVoices();
        if (this.voices.length > 0) {
          this.selectedVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
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
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    window.speechSynthesis.speak(utterance);
  },

  setVoice(name) {
    this.selectedVoice = this.voices.find(v => v.name === name) || this.selectedVoice;
  }
};
