export const speech = {
  voices: [],
  selectedVoice: null,
  _preferredVoiceName: null,
  _initialized: false,
  _initPromise: null,

  init() {
    if (this._initPromise) return this._initPromise;

    this._initPromise = new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        this._initialized = true;
        resolve();
        return;
      }
      if (this._initialized) {
        resolve();
        return;
      }

      const synth = window.speechSynthesis;
      let interval = null;

      let isFinished = false;
      const finishInit = () => {
        if (isFinished) return;
        isFinished = true;
        if (interval) clearInterval(interval);
        if (synth.removeEventListener) {
          synth.removeEventListener('voiceschanged', loadVoices);
        } else {
          synth.onvoiceschanged = null;
        }
        this._initialized = true;
        resolve();
      };

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
            finishInit();
          }
        } catch (e) {
          console.warn('Failed to get voices:', e);
          finishInit();
        }
      };

      if (synth.addEventListener) {
        synth.addEventListener('voiceschanged', loadVoices);
      } else if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
      }

      loadVoices();

      // Periodic check as some browsers are finicky with voiceschanged
      interval = setInterval(loadVoices, 250);

      // Fallback resolve if voices take too long or never load
      setTimeout(finishInit, 2000);
    });

    return this._initPromise;
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
