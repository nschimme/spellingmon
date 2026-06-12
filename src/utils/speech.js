export const speech = {
  voices: [],
  selectedVoice: null,
  _preferredVoiceName: null,
  _initialized: false,

  init() {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }
      if (this._initialized) {
        resolve();
        return;
      }
      const synth = window.speechSynthesis;

      const loadVoices = () => {
        try {
          const availableVoices = synth.getVoices();
          if (availableVoices.length > 0) {
            this.voices = availableVoices;
            if (this._preferredVoiceName) {
              const preferred = this.voices.find(v => v.name === this._preferredVoiceName);
              if (preferred) this.selectedVoice = preferred;
            }
            if (!this.selectedVoice) {
              this.selectedVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
            }
            resolve();
          }
        } catch (e) {
          console.warn('Failed to get voices:', e);
          resolve();
        }
      };

      if (synth.addEventListener) {
        synth.addEventListener('voiceschanged', loadVoices);
      } else if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
      }

      loadVoices();

      // Periodic check as some browsers are finicky with voiceschanged
      const interval = setInterval(() => {
        loadVoices();
        if (this.voices.length > 0) {
          this._initialized = true;
          clearInterval(interval);
        }
      }, 250);

      // Fallback resolve if voices take too long or never load
      setTimeout(() => {
        clearInterval(interval);
        if (this.voices.length > 0) this._initialized = true;
        resolve();
      }, 2000);
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
    this._preferredVoiceName = name;
    const voice = this.voices.find(v => v.name === name);
    if (voice) {
      this.selectedVoice = voice;
      return true;
    }
    return false;
  }
};
