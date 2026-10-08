/**
 * Procedural Web Audio API sound engine for Sleep Farm.
 * Implements synthetic acoustic models with zero external audio assets required.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isAmbienceRunning = false;
  private cricketTimer: number | null = null;
  private isMuted = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public getIsAmbienceRunning() {
    return this.isAmbienceRunning;
  }

  /**
   * Procedural Sheep Bleat (Formant synthesis + Vocal tract filter + Vibrato LFO)
   */
  public playBleat(pitchMod = 1.0) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      const duration = 0.85 + Math.random() * 0.25;

      // Base pitch varies naturally
      const baseFreq = (180 + Math.random() * 40) * pitchMod;

      // Voice oscillator (Sawtooth gives rich vocal harmonics)
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq * 1.15, t);
      // Natural pitch bend downwards during bleat
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + duration * 0.7);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, t + duration);

      // Vibrato LFO (Sheep throat wobble ~5.5Hz)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(5.8, t);
      lfoGain.gain.setValueAtTime(14, t);
      lfo.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + duration);

      // Vocal Tract Formant Filters (F1 ~650Hz, F2 ~1400Hz)
      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(650 * pitchMod, t);
      filter1.Q.setValueAtTime(4.0, t);

      const filter2 = this.ctx.createBiquadFilter();
      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(1350 * pitchMod, t);
      filter2.Q.setValueAtTime(3.5, t);

      // Amplitude Envelope (Attack -> Tremolo Decay)
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.0001, t);
      gainNode.gain.linearRampToValueAtTime(0.35, t + 0.08); // attack
      gainNode.gain.exponentialRampToValueAtTime(0.18, t + duration * 0.5); // sustain body
      gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration); // gentle release

      // Connect graph
      osc.connect(filter1);
      osc.connect(filter2);
      filter1.connect(gainNode);
      filter2.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + duration);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Dream Clover Bell Chime (Summoning flock)
   */
  public playBellChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      const freqs = [784, 1175, 1568]; // G5, D6, G6 harmonic chord

      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const decay = 1.4 + idx * 0.3;
        gain.gain.setValueAtTime(0.15 / (idx + 1), t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + decay);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Petting Sound (Cute high harmonic purr chime)
   */
  public playPetSound() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.18); // A5

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.35);
    } catch {
      // Ignore
    }
  }

  /**
   * Pastoral Night Ambience (Subtle wind murmur + low harmonic lullaby drone + gentle crickets)
   */
  public startNightAmbience() {
    if (this.isAmbienceRunning) return;

    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 2.0);
      this.ambientGain.connect(this.masterGain);

      // 1. Deep lullaby sub drone
      const droneOsc = this.ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(160, this.ctx.currentTime);

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      droneOsc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(this.ambientGain);
      droneOsc.start();

      // 2. Periodic gentle cricket chirp synthesis
      this.isAmbienceRunning = true;
      this.scheduleCricketChirp();
    } catch {
      // Ignore
    }
  }

  private scheduleCricketChirp() {
    if (!this.isAmbienceRunning) return;

    const delay = 1800 + Math.random() * 2500;
    this.cricketTimer = window.setTimeout(() => {
      this.triggerCricketChirp();
      this.scheduleCricketChirp();
    }, delay);
  }

  private triggerCricketChirp() {
    if (!this.ctx || !this.ambientGain || !this.isAmbienceRunning || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const chirpCount = 3 + Math.floor(Math.random() * 3);

      for (let i = 0; i < chirpCount; i++) {
        const ct = t + i * 0.06;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(4600 + Math.random() * 200, ct);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(4600, ct);
        filter.Q.setValueAtTime(8, ct);

        gain.gain.setValueAtTime(0.0001, ct);
        gain.gain.linearRampToValueAtTime(0.025, ct + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ct + 0.045);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(ct);
        osc.stop(ct + 0.05);
      }
    } catch {
      // Ignore
    }
  }

  public stopNightAmbience() {
    if (this.cricketTimer) {
      clearTimeout(this.cricketTimer);
      this.cricketTimer = null;
    }
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.0);
      } catch {
        // Ignore
      }
    }
    this.isAmbienceRunning = false;
  }

  public toggleAmbience(): boolean {
    if (this.isAmbienceRunning) {
      this.stopNightAmbience();
      return false;
    } else {
      this.startNightAmbience();
      return true;
    }
  }
}

export const soundEngine = new SoundEngine();
