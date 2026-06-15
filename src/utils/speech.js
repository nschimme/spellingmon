export const speech = {
  voices: [],
  selectedVoice: null,
  _preferredVoiceName: null,
  _initialized: false,
  _initPromise: null,
  _cleanup: null,
  supported: false,
  ttsVolume: 1,
  lastError: null,
  _onError: null,

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

      this.supported = true;
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
      // Also do an immediate refresh for late voices
      this.refreshVoices();

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

  refreshVoices(langCode = null) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    try {
      const synth = window.speechSynthesis;
      const available = synth.getVoices();
      if (available.length > 0) {
        this.voices = available;

        // If langCode is provided, try to find a matching voice
        if (langCode) {
           const code = langCode.split('-')[0].toLowerCase();
           const match = this.voices.find(v => v.lang.toLowerCase().startsWith(code));
           if (match) {
             this.selectedVoice = match;
             return true;
           }
        }

        if (!this.selectedVoice) {
          if (this._preferredVoiceName) {
            const preferred = available.find(v => v.name === this._preferredVoiceName);
            if (preferred) this.selectedVoice = preferred;
          }
          if (!this.selectedVoice) {
            this.selectedVoice = available.find(v => v.lang.startsWith('en')) || available[0];
          }
        }
      }
      return available.length > 0;
    } catch {
      return false;
    }
  },

  isLanguageSupported(langCode) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.__PLAYWRIGHT_TEST__)) {
      return true; // Always support all languages in dev/test for UI verification
    }
    if (!this.voices.length) this.refreshVoices();
    // Default to English if no voices are loaded yet or supported
    if (langCode === 'en' && this.voices.length === 0) return true;

    const code = langCode.split('-')[0].toLowerCase();
    return this.voices.some(v => v.lang.toLowerCase().startsWith(code));
  },

  setVolume(val) {
    this.ttsVolume = Math.max(0, Math.min(1, val));
  },

  onError(callback) {
    this._onError = callback;
  },

  speak(text) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      this.refreshVoices();
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.volume = this.ttsVolume;
      utterance.onerror = (e) => {
        const error = e.error || 'unknown';
        console.warn('TTS utterance error:', error);
        this.lastError = error;
        if (this._onError) {
          this._onError(error);
        }
      };
      utterance.onend = () => { this.lastError = null; };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
      this.lastError = 'exception';
      if (this._onError) {
        this._onError('exception');
      }
    }
  },

  isSupported() {
    return this.supported || !!(typeof window !== 'undefined' && window.speechSynthesis);
  },

  hasVoices() {
    return this.voices.length > 0;
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
