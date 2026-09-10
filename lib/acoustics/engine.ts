// Web Audio API Acoustic Switch Synthesizer
// Simulates mechanical switch actuation, housing resonance, and plate dampening

export type SwitchProfile = "thock" | "clack" | "clicky" | "silent";
export type PlateMaterial = "brass" | "aluminum" | "fr4" | "polycarbonate";

export interface AcousticSettings {
  profile: SwitchProfile;
  plate: PlateMaterial;
  volume: number; // 0 to 1
}

class AcousticEngine {
  private ctx: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  private convolver: ConvolverNode | null = null;
  private masterFilter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;

  private createImpulseResponse(ctx: AudioContext) {
    const length = ctx.sampleRate * 0.4; // 400ms decay for small aluminum chamber
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      // Exponential decay
      const decay = Math.exp(-i / (ctx.sampleRate * 0.08));
      // Organic metallic ringing noise
      left[i] = (Math.random() * 2 - 1) * decay * (Math.sin(i * 0.1) * 0.5 + 0.5);
      right[i] = (Math.random() * 2 - 1) * decay * (Math.sin(i * 0.11) * 0.5 + 0.5);
    }
    return impulse;
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterFilter = this.ctx.createBiquadFilter();
      this.masterFilter.type = "peaking";
      
      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this.createImpulseResponse(this.ctx);
      
      this.masterGain = this.ctx.createGain();
      
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;

      // Routing: Synth -> MasterGain -> Convolver (parallel) + MasterFilter (series) -> Analyser -> Dest
      
      // Dry path
      this.masterGain.connect(this.masterFilter);
      
      // Wet path (reverb)
      const reverbGain = this.ctx.createGain();
      reverbGain.gain.value = 0.15; // 15% wet mix for subtle metallic room resonance
      this.masterGain.connect(this.convolver);
      this.convolver.connect(reverbGain);
      reverbGain.connect(this.masterFilter);

      this.masterFilter.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  private applyPlateEQ(plate: PlateMaterial) {
    if (!this.masterFilter) return;
    
    // Dynamically adjust the master EQ based on the selected plate material
    if (plate === "brass") {
      // Sharp, resonant high-end ping
      this.masterFilter.type = "peaking";
      this.masterFilter.frequency.value = 2400;
      this.masterFilter.Q.value = 4.0;
      this.masterFilter.gain.value = 8.0;
    } else if (plate === "polycarbonate") {
      // Deep thock, cuts out the high frequencies completely
      this.masterFilter.type = "lowpass";
      this.masterFilter.frequency.value = 1200;
      this.masterFilter.Q.value = 0.5;
    } else if (plate === "fr4") {
      // Slightly muted, flat response
      this.masterFilter.type = "lowshelf";
      this.masterFilter.frequency.value = 800;
      this.masterFilter.gain.value = -3.0;
    } else {
      // Aluminum: Balanced, slight mid-range bump
      this.masterFilter.type = "peaking";
      this.masterFilter.frequency.value = 1500;
      this.masterFilter.Q.value = 1.5;
      this.masterFilter.gain.value = 2.0;
    }
  }

  private lastPlayTime: number = 0;

  public playKeystroke(settings: AcousticSettings) {
    if (Date.now() - this.lastPlayTime < 35) return; // Prevent extreme audio clipping when spammed
    this.lastPlayTime = Date.now();

    try {
      this.initContext();
      if (!this.ctx || !this.analyser || !this.masterGain) return;

      this.applyPlateEQ(settings.plate);

      const now = this.ctx.currentTime;
      const jitter = (Math.random() - 0.5) * 0.08; // +/- 4% organic pitch jitter

      // Synth Gain node for the keystroke, routes into MasterGain
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.connect(this.masterGain);

      // Plate material multiplier for resonance frequency
      const plateFreqMultiplier = {
        brass: 1.15,
        aluminum: 1.0,
        fr4: 0.85,
        polycarbonate: 0.72,
      }[settings.plate];

      if (settings.profile === "thock") {
        // Deep marble thock: low frequency body + brief filtered burst
        const osc = this.ctx.createOscillator();
        osc.type = "triangle";
        const baseFreq = (125 + jitter * 100) * plateFreqMultiplier;
        osc.frequency.setValueAtTime(baseFreq * 1.8, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.06);

        gainNode.gain.setValueAtTime(settings.volume * 0.9, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.09);

        // Acoustic bottom-out slap
        this.addSlapNoise(now, 280 * plateFreqMultiplier, 0.03, settings.volume * 0.5);

      } else if (settings.profile === "clack") {
        // High-pitch, creamy clack
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        const baseFreq = (340 + jitter * 150) * plateFreqMultiplier;
        osc.frequency.setValueAtTime(baseFreq * 1.5, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.04);

        gainNode.gain.setValueAtTime(settings.volume * 0.85, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.06);

        this.addSlapNoise(now, 1200 * plateFreqMultiplier, 0.02, settings.volume * 0.6);

      } else if (settings.profile === "clicky") {
        // Dual-stage click bar: initial sharp snap + bottom out
        const osc = this.ctx.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(1400 * (1 + jitter), now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

        gainNode.gain.setValueAtTime(settings.volume * 0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.04);

        this.addSlapNoise(now + 0.015, 600, 0.03, settings.volume * 0.4);

      } else if (settings.profile === "silent") {
        // Dampened low impact
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(90 * plateFreqMultiplier, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);

        gainNode.gain.setValueAtTime(settings.volume * 0.35, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.07);
      }
    } catch (e) {
      console.warn("Acoustic engine warning:", e);
    }
  }

  private addSlapNoise(time: number, centerFreq: number, duration: number, gainVal: number) {
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
    filter.type = "bandpass";
    filter.frequency.value = centerFreq;
    filter.Q.value = 3.0;

    const slapGain = this.ctx.createGain();
    slapGain.gain.setValueAtTime(gainVal, time);
    slapGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(slapGain);
    slapGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  public soundEnabled: boolean = true;

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  private lastClickTime: number = 0;

  public playTactileClick(type: "click" | "toggle" | "relay" = "click") {
    if (!this.soundEnabled) return;
    if (Date.now() - this.lastClickTime < 30) return; // Prevent extreme audio overlapping
    this.lastClickTime = Date.now();
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === "toggle") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.02);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === "relay") {
        osc.type = "square";
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else {
        // High-precision micro click
        osc.type = "sine";
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
      }
    } catch {
      // AudioContext policy catch
    }
  }
}

export const acousticEngine = new AcousticEngine();
export const playTactileClick = (type: "click" | "toggle" | "relay" = "click") =>
  acousticEngine.playTactileClick(type);
