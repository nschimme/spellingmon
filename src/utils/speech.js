export const speech = {
  voices: [],
  selectedVoice: null,
  _preferredVoiceName: null,
  _initialized: false,
  _initPromise: null,
  _cleanup: null,

  init(force = false) {
    if (this._initPromise && !force) return this._initPromise;

    if (force && this._cleanup) {
      this._cleanup();
    }

    this._initialized = false;
    this._initPromise = new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        this._initPromise = null;
        resolve();
        return;
      }

      const synth = window.speechSynthesis;
      let interval = null;
      let isFinished = false;
      let timeoutId = null;

      const finishInit = () => {
        if (isFinished) return;
        isFinished = true;

        if (interval) clearInterval(interval);
        if (timeoutId) clearTimeout(timeoutId);

        if (synth.removeEventListener) {
          synth.removeEventListener('voiceschanged', loadVoices);
        } else {
          synth.onvoiceschanged = null;
        }

        this._initialized = true;
        this._cleanup = null;
        resolve();
      };

      // Store cleanup for force-restart
      this._cleanup = () => {
        if (isFinished) return;
        isFinished = true;
        if (interval) clearInterval(interval);
        if (timeoutId) clearTimeout(timeoutId);
        if (synth.removeEventListener) {
          synth.removeEventListener('voiceschanged', loadVoices);
        } else {
          synth.onvoiceschanged = null;
        }
        resolve(); // Prevent hanging callers of the previous init promise
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
              // Prioritize Google US English
              const googleVoice = this.voices.find(v => v.name === 'Google US English');
              if (googleVoice) {
                this.selectedVoice = googleVoice;
              } else {
                this.selectedVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
              }
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

      // Explicitly call getVoices as some browsers need a poke to trigger voiceschanged
      synth.getVoices();
      loadVoices();

      // Periodic check as some browsers are finicky with voiceschanged
      interval = setInterval(loadVoices, 250);

      // Fallback resolve if voices take too long or never load
      timeoutId = setTimeout(finishInit, force ? 5000 : 2000);
    });

    return this._initPromise;
  },

  isInitialized() {
    return this._initialized;
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
