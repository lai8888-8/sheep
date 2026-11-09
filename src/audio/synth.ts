/**
 * Procedural Web Audio API sound engine for Sleep Farm.
 * Generates organic acoustics: chewing grass, gentle snores, diverse vocal bleats,
 * bell chimes, and nocturnal meadow crickets with zero external audio assets.
 */

// 引入时间类型，用于控制白天、黄昏、黑夜等不同环境的背景音。
// Imports the TimeOfDay type to control different ambient soundscapes.
import { TimeOfDay } from '../types/sheep';

export type BleatVariety = 'classic' | 'baby' | 'deep' | 'double' | 'purr';

// 核心音频引擎类。完全不依赖外部 MP3/WAV 文件，纯靠数学计算发声。
// The core sound engine class. Zero external assets, purely synthesized via math.
class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isAmbienceRunning = false;
  private isMuted = false;
  private timeOfDay: TimeOfDay = 'day';

  // 这两个振荡器用来产生背景的“持续低音（Drone）”，模拟夜晚或白天的氛围。
  // Dual oscillators for the background ambient drone.

  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private natureTimer: number | null = null;
  private melodyTimer: number | null = null;

  //定时器，用于随机触发环境音（如鸟叫、虫鸣）和旋律拨弦。
  // Timers for randomly triggering nature sounds and melodic plucks.

  //节流控制，防止吃草声和打鼾声在一帧内疯狂触发导致爆音。
  // Throttle timestamps to prevent audio clipping from overlapping sounds.
  private lastChewAudioTime = 0;
  private lastSnoreAudioTime = 0;

  // 初始化音频上下文。现代浏览器要求用户点击页面后才能初始化 AudioContext。
  // Initialize the AudioContext (requires user interaction in browsers).
  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime); // 默认主音量 0.8 / Default master volume
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

    // 切换静音状态 / Toggles mute state.
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
   * Helper: Create short white/pink noise buffer for grassy crunches & breath sounds
   */
  // 生成“粉红噪音（Pink Noise）”。这是一种比白噪音更柔和的随机声波，用来模拟风吹、吃草和呼吸声。
  // Generates Pink Noise (softer than white noise) for wind, grass, and breathing.
  private createNoiseBuffer(duration = 0.5): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }
    return buffer;
  }

  /**
   * 🌿 Chewing Grass Sound: Crisp, cute procedural grassy munches
   */
  public playChewSound() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const now = Date.now();
      // Throttle so chewing doesn't overlap excessively
      if (now - this.lastChewAudioTime < 380) return;
      this.lastChewAudioTime = now;

      const t = this.ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer(0.25);
      if (!noiseBuffer) return;

      // Two quick nibbles (crunch-munch)
      const nibbles = [0, 0.08 + Math.random() * 0.04];
      nibbles.forEach((offset, idx) => {
        if (!this.ctx || !this.masterGain || !noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        // Bandpass filter for dry grassy snapping
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400 + Math.random() * 600, t + offset);
        filter.Q.setValueAtTime(3.5, t + offset);

        // Low click for jaw teeth contact
        const lowPop = this.ctx.createOscillator();
        const lowGain = this.ctx.createGain();
        lowPop.type = 'sine';
        lowPop.frequency.setValueAtTime(260 + Math.random() * 40, t + offset);
        lowPop.frequency.exponentialRampToValueAtTime(120, t + offset + 0.04);

        lowGain.gain.setValueAtTime(0.08, t + offset);
        lowGain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.04);
        lowPop.connect(lowGain);
        lowGain.connect(this.masterGain);

        // Crunch envelope
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.0001, t + offset);
        gainNode.gain.linearRampToValueAtTime(0.12 / (idx + 1), t + offset + 0.012);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.07);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        noise.start(t + offset);
        noise.stop(t + offset + 0.08);
        lowPop.start(t + offset);
        lowPop.stop(t + offset + 0.05);
      });
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * 💤 Gentle Sleeping Snore Sound: Soft, peaceful rhythmic breathy sigh
   */
  public playSnoreSound() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const now = Date.now();
      if (now - this.lastSnoreAudioTime < 2400) return;
      this.lastSnoreAudioTime = now;

      const t = this.ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer(1.4);
      if (!noiseBuffer) return;

      // Inhale phase: gentle warm rising breath
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, t);
      filter.frequency.linearRampToValueAtTime(420, t + 0.5);
      filter.frequency.linearRampToValueAtTime(200, t + 1.1);

      // Low nasal breathing tone
      const hum = this.ctx.createOscillator();
      const humGain = this.ctx.createGain();
      hum.type = 'sine';
      hum.frequency.setValueAtTime(95, t);
      hum.frequency.linearRampToValueAtTime(115, t + 0.45);
      hum.frequency.linearRampToValueAtTime(88, t + 1.0);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.07, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);

      humGain.gain.setValueAtTime(0.0001, t);
      humGain.gain.linearRampToValueAtTime(0.04, t + 0.4);
      humGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);

      hum.connect(humGain);
      humGain.connect(this.masterGain);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 1.15);
      hum.start(t);
      hum.stop(t + 1.15);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * 🐑 Diverse Sheep Bleats with 5 distinct personality vocalizations!
   */
  public playBleatVariation(variety: BleatVariety = 'classic', pitchMod = 1.0) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const t = this.ctx.currentTime;

      if (variety === 'double') {
        // Quick playful stutter: "ba-baa!"
        this.synthesizeBleatBurst(t, 0.22, 1.1 * pitchMod, 0.28, 6.5);
        this.synthesizeBleatBurst(t + 0.26, 0.65, 1.0 * pitchMod, 0.32, 5.5);
        return;
      }

      if (variety === 'baby') {
        // High cute lamb chirp: "Maa~!"
        this.synthesizeBleatBurst(t, 0.55, 1.45 * pitchMod, 0.3, 7.2, 850, 1800);
        return;
      }

      if (variety === 'deep') {
        // Grand sovereign resonant bleat: "Baaah~"
        this.synthesizeBleatBurst(t, 1.1, 0.75 * pitchMod, 0.38, 4.8, 500, 1100);
        return;
      }

      if (variety === 'purr') {
        // Affectionate trill / happy purr bleat
        this.synthesizeBleatBurst(t, 0.75, 1.15 * pitchMod, 0.25, 9.5, 750, 1500, true);
        return;
      }

      // Default: 'classic' warm pastoral bleat
      this.synthesizeBleatBurst(t, 0.85 + Math.random() * 0.2, pitchMod, 0.32, 5.8);
    } catch {
      // Audio safety fallback
    }
  }
  
  // 重点讲解】这是最硬核的音频合成函数！模拟了人类/动物的声带（Formant 共振峰）。
  // [HIGHLIGHT] This is the core synthesis function! Simulates vocal tract formants.
  /**
   * Helper: Synthesize a single vocal bleat burst with formant filters and throat tremor
   */
  private synthesizeBleatBurst(
    startTime: number,
    duration: number,
    pitchMod: number,
    peakVol: number,
    tremorSpeed: number,
    f1Freq = 650,
    f2Freq = 1350,
    isPurr = false
  ) {
    if (!this.ctx || !this.masterGain) return;

    const baseFreq = (isPurr ? 240 : 185 + Math.random() * 30) * pitchMod;

    // Sawtooth voice oscillator
    const osc = this.ctx.createOscillator();
    osc.type = isPurr ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq * 1.1, startTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, startTime + duration * 0.65);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, startTime + duration);

    // LFO throat wobble
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(tremorSpeed, startTime);
    lfoGain.gain.setValueAtTime(isPurr ? 22 : 14, startTime);
    lfo.connect(osc.frequency);
    lfo.start(startTime);
    lfo.stop(startTime + duration);

    // Dual Formants
    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(f1Freq * pitchMod, startTime);
    filter1.Q.setValueAtTime(4.2, startTime);

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'bandpass';
    filter2.frequency.setValueAtTime(f2Freq * pitchMod, startTime);
    filter2.Q.setValueAtTime(3.8, startTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(peakVol, startTime + 0.06);
    gainNode.gain.exponentialRampToValueAtTime(peakVol * 0.55, startTime + duration * 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter1);
    osc.connect(filter2);
    filter1.connect(gainNode);
    filter2.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Original playBleat fallback
   */
  public playBleat(pitchMod = 1.0) {
    this.playBleatVariation('classic', pitchMod);
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
   * 💥 Playful Headbutt Sound: Cute soft wooden tap / knock for rams bumping heads
   */
  public playBonkSound() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const t = this.ctx.currentTime;

      // Low wooden thump
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.11);

      oscGain.gain.setValueAtTime(0.18, t);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.11);

      // Cute wooden tap click
      const noiseBuffer = this.createNoiseBuffer(0.04);
      if (noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.Q.setValueAtTime(5.5, t);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.12, t);
        nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.masterGain);
        noise.start(t);
        noise.stop(t + 0.04);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * ✨ Cheerful Social Chime: Happy ascending two-tone chirp after sheep play together
   */
  public playHappyChirpSound() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      const notes = [659.25, 880.0]; // E5 -> A5
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const st = t + idx * 0.08;
        osc.frequency.setValueAtTime(freq, st);
        gain.gain.setValueAtTime(0.0001, st);
        gain.gain.linearRampToValueAtTime(0.12, st + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.32);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(st);
        osc.stop(st + 0.32);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Set and transition active Time of Day ambiance
   */
  /**
   * Set and transition active Time of Day ambiance
   */
  public setTimeOfDay(tod: TimeOfDay) {
    this.timeOfDay = tod;
    if (this.isAmbienceRunning && this.ctx && this.droneFilter) {
      const t = this.ctx.currentTime;
      // Smooth drone frequency and filter crossfade
      if (tod === 'day') {
        this.droneOsc1?.frequency.linearRampToValueAtTime(146.83, t + 2.0); // D3
        this.droneOsc2?.frequency.linearRampToValueAtTime(220.00, t + 2.0); // A3
        this.droneFilter.frequency.linearRampToValueAtTime(480, t + 2.0);
      } else if (tod === 'night') {
        this.droneOsc1?.frequency.linearRampToValueAtTime(77.78, t + 2.0); // Eb2
        this.droneOsc2?.frequency.linearRampToValueAtTime(116.54, t + 2.0); // Bb2
        this.droneFilter.frequency.linearRampToValueAtTime(170, t + 2.0);
      } else if (tod === 'twilight') {
        this.droneOsc1?.frequency.linearRampToValueAtTime(87.31, t + 2.0); // F2
        this.droneOsc2?.frequency.linearRampToValueAtTime(130.81, t + 2.0); // C3
        this.droneFilter.frequency.linearRampToValueAtTime(260, t + 2.0);
      } else {
        // Dawn
        this.droneOsc1?.frequency.linearRampToValueAtTime(130.81, t + 2.0); // C3
        this.droneOsc2?.frequency.linearRampToValueAtTime(196.00, t + 2.0); // G3
        this.droneFilter.frequency.linearRampToValueAtTime(340, t + 2.0);
      }
    }
  }

  public getTimeOfDay(): TimeOfDay {
    return this.timeOfDay;
  }

  /**
   * Start procedural soothing BGM and nature soundscape according to time of day
   */
  public startAmbience(tod?: TimeOfDay) {
    if (tod) this.timeOfDay = tod;
    if (this.isAmbienceRunning) return;

    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, t);
      this.ambientGain.gain.linearRampToValueAtTime(0.24, t + 2.5);
      this.ambientGain.connect(this.masterGain);

      // 1. Dual warm pastoral drone oscillators
      const initialFreqs =
        this.timeOfDay === 'day'
          ? [146.83, 220.0, 480]
          : this.timeOfDay === 'night'
          ? [77.78, 116.54, 170]
          : this.timeOfDay === 'twilight'
          ? [87.31, 130.81, 260]
          : [130.81, 196.0, 340];

      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc2.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(initialFreqs[0], t);
      this.droneOsc2.frequency.setValueAtTime(initialFreqs[1], t);

      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(initialFreqs[2], t);

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.09, t);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(droneGain);
      droneGain.connect(this.ambientGain);

      this.droneOsc1.start();
      this.droneOsc2.start();

      this.isAmbienceRunning = true;

      // Start nature acoustics & melodic chimes loops
      this.scheduleNextNatureSound();
      this.scheduleNextMelodicChime();
    } catch {
      // Audio safety fallback
    }
  }

  public startNightAmbience() {
    this.startAmbience('night');
  }

  /**
   * Schedule soothing procedural nature sounds:
   * - Day: Sunny meadow birds & refreshing summer breezes
   * - Night: Summer cicadas (蝉鸣) & night meadow crickets
   * - Twilight: Golden sunset gentle breeze murmurs
   * - Dawn: Morning birdsong chirps (晨鸣鸟语)
   */
  private scheduleNextNatureSound() {
    if (!this.isAmbienceRunning) return;

    const delay =
      this.timeOfDay === 'day'
        ? 2600 + Math.random() * 2400
        : this.timeOfDay === 'night'
        ? 2200 + Math.random() * 2600
        : this.timeOfDay === 'dawn'
        ? 3200 + Math.random() * 3000
        : 3500 + Math.random() * 3500;

    this.natureTimer = window.setTimeout(() => {
      if (this.isAmbienceRunning && !this.isMuted) {
        if (this.timeOfDay === 'day') {
          if (Math.random() > 0.45) {
            this.playMorningBirdsong();
          } else {
            this.playSunsetBreeze();
          }
        } else if (this.timeOfDay === 'night') {
          // Alternate between warm summer cicadas and cricket chirps
          if (Math.random() > 0.4) {
            this.playSummerCicadas();
          } else {
            this.playCricketChirp();
          }
        } else if (this.timeOfDay === 'twilight') {
          this.playSunsetBreeze();
        } else {
          // Dawn: morning songbirds
          this.playMorningBirdsong();
        }
      }
      this.scheduleNextNatureSound();
    }, delay);
  }

  /**
   * 🌙 Summer Cicadas (夏夜蝉鸣): gentle undulating high-frequency tree shimmer
   */
  private playSummerCicadas() {
    if (!this.ctx || !this.ambientGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer(2.2);
      if (!noiseBuffer) return;

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      // High resonant bandpass for summer cicada frequency
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(5400 + Math.random() * 400, t);
      filter.Q.setValueAtTime(6.5, t);

      // Tremolo LFO for pulsating cicada body rattle
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(9 + Math.random() * 3, t);

      const swellGain = this.ctx.createGain();
      swellGain.gain.setValueAtTime(0.0001, t);
      swellGain.gain.linearRampToValueAtTime(0.035, t + 0.6);
      swellGain.gain.linearRampToValueAtTime(0.042, t + 1.2);
      swellGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);

      lfo.connect(lfoGain.gain);
      noise.connect(filter);
      filter.connect(swellGain);
      swellGain.connect(this.ambientGain);

      lfo.start(t);
      lfo.stop(t + 2.1);
      noise.start(t);
      noise.stop(t + 2.1);
    } catch {
      // Ignore
    }
  }

  /**
   * 🦗 Meadow Crickets (草间蟋蟀)
   */
  private playCricketChirp() {
    if (!this.ctx || !this.ambientGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const chirpCount = 2 + Math.floor(Math.random() * 3);

      for (let i = 0; i < chirpCount; i++) {
        const ct = t + i * 0.055;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(4700 + Math.random() * 250, ct);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(4700, ct);
        filter.Q.setValueAtTime(8, ct);

        gain.gain.setValueAtTime(0.0001, ct);
        gain.gain.linearRampToValueAtTime(0.02, ct + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, ct + 0.04);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(ct);
        osc.stop(ct + 0.045);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * 🌆 Sunset Meadow Breeze (黄昏晚风)
   */
  private playSunsetBreeze() {
    if (!this.ctx || !this.ambientGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer(3.0);
      if (!noiseBuffer) return;

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, t);
      filter.frequency.linearRampToValueAtTime(720, t + 1.4);
      filter.frequency.linearRampToValueAtTime(360, t + 2.8);
      filter.Q.setValueAtTime(1.8, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.04, t + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.9);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      noise.start(t);
      noise.stop(t + 2.95);
    } catch {
      // Ignore
    }
  }

  /**
   * 🌅 Morning Songbird Chirps (清晨晨光鸟语)
   */
  private playMorningBirdsong() {
    if (!this.ctx || !this.ambientGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [
        { start: 2900, peak: 4200, end: 3400, dur: 0.09, offset: 0 },
        { start: 3400, peak: 4800, end: 3900, dur: 0.08, offset: 0.12 },
        { start: 4200, peak: 3800, end: 3100, dur: 0.07, offset: 0.25 },
      ];

      notes.forEach((note) => {
        if (!this.ctx || !this.ambientGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const st = t + note.offset;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.start, st);
        osc.frequency.exponentialRampToValueAtTime(note.peak, st + note.dur * 0.45);
        osc.frequency.exponentialRampToValueAtTime(note.end, st + note.dur);

        gain.gain.setValueAtTime(0.0001, st);
        gain.gain.linearRampToValueAtTime(0.035, st + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, st + note.dur);

        osc.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(st);
        osc.stop(st + note.dur);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * 🎵 Schedule gentle soothing ambient music box & bell chimes
   */
  private scheduleNextMelodicChime() {
    if (!this.isAmbienceRunning) return;

    const delay = 3400 + Math.random() * 3200;
    this.melodyTimer = window.setTimeout(() => {
      if (this.isAmbienceRunning && !this.isMuted) {
        this.playMelodicPluck();
      }
      this.scheduleNextMelodicChime();
    }, delay);
  }

  /**
   * Pluck a gentle peaceful pentatonic music box note
   */
  private playMelodicPluck() {
    if (!this.ctx || !this.ambientGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;

      // Select gentle soothing scale based on time of day
      const scales: Record<TimeOfDay, number[]> = {
        day: [392.00, 440.00, 493.88, 587.33, 659.25, 783.99], // G major sunny pastoral pentatonic
        night: [311.13, 392.0, 466.16, 523.25, 622.25, 783.99], // Eb lullaby pentatonic
        twilight: [349.23, 440.0, 523.25, 659.25, 783.99, 880.0], // Fmaj7 / Am sunset
        dawn: [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5], // C major dewy morning
      };

      const scale = scales[this.timeOfDay] || scales.day;
      const freq = scale[Math.floor(Math.random() * scale.length)];

      const osc = this.ctx.createOscillator();
      const overtone = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, t);

      const decay = 2.4 + Math.random() * 0.8;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.045, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(t);
      osc.stop(t + decay);
      overtone.start(t);
      overtone.stop(t + decay * 0.5);
    } catch {
      // Ignore
    }
  }

  public stopAmbience() {
    if (this.natureTimer) {
      clearTimeout(this.natureTimer);
      this.natureTimer = null;
    }
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
        setTimeout(() => {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.disconnect();
          this.droneOsc1 = null;
          this.droneOsc2 = null;
          this.droneFilter = null;
          this.ambientGain?.disconnect();
          this.ambientGain = null;
        }, 1300);
      } catch {
        // Ignore
      }
    }
    this.isAmbienceRunning = false;
  }

  public stopNightAmbience() {
    this.stopAmbience();
  }

  public toggleAmbience(tod?: TimeOfDay): boolean {
    if (this.isAmbienceRunning) {
      this.stopAmbience();
      return false;
    } else {
      this.startAmbience(tod);
      return true;
    }
  }
}

export const soundEngine = new SoundEngine();

export interface SheepVoiceProfile {
  variety: BleatVariety;
  pitchMod: number;
  label: string;
}

// 【重点讲解】这是连接“睡眠数据”和“音频”的桥梁！
// This is the bridge connecting "sleep data" and "audio"!
/**
 * Determine acoustic vocalization profile based on biometric sleep phenotype
 */
export function getSheepBleatConfig(sheep: {
  hours: number;
  size: number;
  quality: string;
  dreamType: string;
  id?: number;
}): SheepVoiceProfile {
  const seed = (sheep.id || 1) * 31;

  // 1. Tiny lamb or short sleep (< 4.5h) -> Sweet high-pitched lamb chirp
  if (sheep.hours <= 4.5 || sheep.size < 32) {
    const pitch = 1.05 + Math.max(0, 4.5 - sheep.hours) * 0.08;
    return { variety: 'baby', pitchMod: pitch, label: 'Lamb Chirp' };
  }

  // 2. Large elder sheep or long sleep (>= 8.5h) -> Sovereign resonant bass bleat
  if (sheep.hours >= 8.5 || sheep.size > 44) {
    const pitch = Math.max(0.75, 0.9 - (sheep.hours - 8.5) * 0.04);
    return { variety: 'deep', pitchMod: pitch, label: 'Resonant Bass' };
  }

  // 3. Lucid / Good dream sheep -> Playful stutter or affectionate purr
  if (sheep.dreamType === 'good') {
    if (seed % 2 === 0) {
      return { variety: 'purr', pitchMod: 1.05, label: 'Content Purr' };
    }
    return { variety: 'double', pitchMod: 1.02, label: 'Playful Double' };
  }

  // 4. Nightmare / Bad dream sheep -> Slightly hesitant, soft classic bleat
  if (sheep.dreamType === 'bad') {
    return { variety: 'classic', pitchMod: 0.94, label: 'Muted Bleat' };
  }

  // 5. Calm / Neutral sheep
  const varietyPool: BleatVariety[] = ['classic', 'double', 'purr'];
  const pickedVariety = varietyPool[seed % varietyPool.length];
  return {
    variety: pickedVariety,
    pitchMod: sheep.quality === 'Poor' ? 1.12 : sheep.quality === 'Great' ? 0.98 : 1.0,
    label: pickedVariety === 'purr' ? 'Warm Purr' : pickedVariety === 'double' ? 'Double Baa' : 'Pastoral Baa',
  };
}
