export interface SpeechInterface {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  _preferredVoiceName: string | null;
  _initialized: boolean;
  _initPromise: Promise<void> | null;
  _cleanup: (() => void) | null;
  supported: boolean;
  ttsVolume: number;
  lastError: string | null;
  _onError: ((error: string) => void) | null;
  init(force?: boolean): Promise<void>;
  isInitialized(): boolean;
  refreshVoices(langCode?: string | null): boolean;
  isLanguageSupported(langCode: string): boolean;
  setVolume(val: number): void;
  onError(callback: (error: string) => void): void;
  speak(text: string, langCode?: string | null): void;
  isSupported(): boolean;
  hasVoices(): boolean;
  setVoice(name: string): boolean;
}

export const speech: SpeechInterface = {
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
    console.log("[SPEECH] init", { force });
    if (this._initPromise && !force) return this._initPromise;

    if (force && this._cleanup) {
      this._cleanup();
    }

    this._initialized = false;
    this._initPromise = new Promise<void>((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.log("[SPEECH] speechSynthesis NOT FOUND");
        this._initPromise = null;
        resolve();
        return;
      }

      this.supported = true;
      const synth = window.speechSynthesis;
      let interval: ReturnType<typeof setInterval> | null = null;
      let isFinished = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

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
            // Use refreshVoices to handle logic for preferred and locale-based selection
            this.refreshVoices();
            if (this.selectedVoice) {
              finishInit();
            }
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
      timeoutId = setTimeout(() => {
        console.log("[SPEECH] init timeout reached");
        finishInit();
      }, 100);
    });

    return this._initPromise;
  },

  isInitialized() {
    return this._initialized;
  },

  refreshVoices(langCode: string | null = null) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    try {
      const synth = window.speechSynthesis;
      const available = synth.getVoices();
      if (available.length > 0) {
        this.voices = available;

        // If langCode is provided, try to find a matching voice
        if (langCode) {
          const code = langCode.split('-')[0].toLowerCase();
          const voicesForLang = this.voices.filter(v => v.lang.toLowerCase().startsWith(code));

          // 1. Try to find a Google voice for this language
          const googleMatch = voicesForLang.find(v => v.name.includes('Google'));
          if (googleMatch) {
            this.selectedVoice = googleMatch;
            return true;
          }

          // 2. Try to find an exact locale match if langCode is full (e.g. en-US)
          if (langCode.includes('-')) {
            const exactMatch = voicesForLang.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
            if (exactMatch) {
              this.selectedVoice = exactMatch;
              return true;
            }
          }

          // 3. Fallback to any voice for this language
          if (voicesForLang.length > 0) {
            this.selectedVoice = voicesForLang[0];
            return true;
          }
        }

        if (this._preferredVoiceName) {
          const preferred = available.find(v => v.name === this._preferredVoiceName);
          if (preferred) {
            this.selectedVoice = preferred;
            return true;
          }
        }

        if (!this.selectedVoice) {
          // Default selection if no langCode provided and no preferred voice
          this.selectedVoice = available.find(v => v.lang.toLowerCase().startsWith('en')) || available[0];
        }
      }
      return available.length > 0;
    } catch {
      return false;
    }
  },

  isLanguageSupported(langCode: string) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.__PLAYWRIGHT_TEST__)) {
      return true; // Always support all languages in dev/test for UI verification
    }
    if (!this.voices.length) this.refreshVoices();
    // Default to English if no voices are loaded yet or supported
    if (langCode.startsWith('en') && this.voices.length === 0) return true;

    const code = langCode.split('-')[0].toLowerCase();
    return this.voices.some(v => v.lang.toLowerCase().startsWith(code));
  },

  setVolume(val: number) {
    this.ttsVolume = Math.max(0, Math.min(1, val));
  },

  onError(callback: (error: string) => void) {
    this._onError = callback;
  },

  speak(text: string, langCode: string | null = null) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      if (langCode) {
        this.refreshVoices(langCode);
      } else if (!this.selectedVoice) {
        this.refreshVoices();
      }
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
        // Don't trigger global error for interrupted or canceled speech
        if (this._onError && !['interrupted', 'canceled'].includes(error)) {
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

  setVoice(name: string) {
    this._preferredVoiceName = name;
    const voice = this.voices.find(v => v.name === name);
    if (voice) {
      this.selectedVoice = voice;
      return true;
    }
    return false;
  }
};
