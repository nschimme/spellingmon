import { SOUND_EFFECTS } from './constants';

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private initialized: boolean = false;

  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.volume = 0.5;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    if (typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
      this.initialized = true;

      if (this.ctx.state === 'suspended') {
        const resume = () => {
          if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
          window.removeEventListener('click', resume);
          window.removeEventListener('keydown', resume);
          window.removeEventListener('pointerdown', resume);
          window.removeEventListener('touchstart', resume);
        };
        window.addEventListener('click', resume);
        window.addEventListener('keydown', resume);
        window.addEventListener('pointerdown', resume, { passive: true });
        window.addEventListener('touchstart', resume, { passive: true });
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.01);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.01);
    }
  }

  playSound(type: string) {
    // Attempt auto-init on first play call (usually user triggered)
    if (!this.initialized) this.init();

    if (!this.initialized || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    switch (type) {
      case SOUND_EFFECTS.CLICK:
        this.playBlip(880, 0.1);
        break;
      case SOUND_EFFECTS.HIT:
        this.playNoise(0.15, 0.5);
        break;
      case SOUND_EFFECTS.FAINT:
        this.playSlide(440, 110, 0.8);
        break;
      case SOUND_EFFECTS.HEAL:
        this.playArpeggio([440, 554.37, 659.25, 880], 0.1);
        break;
      case SOUND_EFFECTS.CAPTURE_SUCCESS:
        this.playArpeggio([523.25, 659.25, 783.99, 1046.50], 0.15);
        break;
      case SOUND_EFFECTS.CAPTURE_FAIL:
        this.playSlide(220, 110, 0.3);
        break;
      case SOUND_EFFECTS.BATTLE_START:
        this.playSlide(110, 880, 0.5, 'square');
        break;
      case SOUND_EFFECTS.VICTORY:
        this.playArpeggio([523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50], 0.1);
        break;
      case SOUND_EFFECTS.LEVEL_UP:
        this.playArpeggio([523.25, 659.25, 783.99, 1046.50], 0.1);
        break;
      case SOUND_EFFECTS.EVOLUTION:
        this.playEvolution();
        break;
      case SOUND_EFFECTS.DISCOVERY:
        this.playArpeggio([440, 659.25, 880, 1318.51], 0.08);
        break;
      case SOUND_EFFECTS.POISON_DAMAGE:
        this.playPoison();
        break;
      default:
        console.warn(`Unknown sound type requested: ${type}`);
        break;
    }
  }

  playBlip(freq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playNoise(duration: number, volume: number = 0.1) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    noise.start();
    noise.stop(this.ctx.currentTime + duration);
  }

  playSlide(startFreq: number, endFreq: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playArpeggio(notes: number[], noteDuration: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * noteDuration);

      gain.gain.setValueAtTime(0, now + i * noteDuration);
      gain.gain.linearRampToValueAtTime(0.1, now + i * noteDuration + 0.01);
      gain.gain.linearRampToValueAtTime(0, now + i * noteDuration + noteDuration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + i * noteDuration);
      osc.stop(now + i * noteDuration + noteDuration);
    });
  }

  playEvolution() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const duration = 4.0;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);

    // Rapidly increasing pitch warble
    for (let i = 0; i < duration * 10; i++) {
      const time = now + (i * 0.1);
      const freq = 220 + (i * 20);
      osc.frequency.linearRampToValueAtTime(freq, time);
    }

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.5);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration);
  }

  playPoison() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const duration = 0.2;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + duration);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration);
  }
}

export const audio = new AudioService();
