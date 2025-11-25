

class AudioService {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    // Lazy initialization handled in play methods
  }

  private init() {
    if (this.isInitialized) return;
    
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    this.context = new AudioContextClass();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterGain.gain.value = 0.5; // Default volume
    
    this.isInitialized = true;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.context && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.5, this.context.currentTime, 0.1);
    }
    if (muted) {
      this.stopAmbient();
    }
  }

  private async resumeContext() {
    if (!this.isInitialized) this.init();
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  // --- Sound Synthesis Helpers ---

  // 1. Cute "Ping" / Magic Sound (For Chibi)
  private playSparkle() {
    if (!this.context || !this.masterGain || this.isMuted) return;
    const t = this.context.currentTime;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 0.5);
  }

  // 2. Sacred Bell / Gong (For Artmulet/Deity)
  private playGong(pitch: number = 220) {
    if (!this.context || !this.masterGain || this.isMuted) return;
    const t = this.context.currentTime;

    // Main Tone
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'triangle'; // Richer than sine
    osc.frequency.setValueAtTime(pitch, t);
    
    // Envelope for a bell/gong (Instant attack, long decay)
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 3.0);

    // Harmonic (Metallic ring)
    const osc2 = this.context.createOscillator();
    const gain2 = this.context.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(pitch * 2.5, t); // Non-integer harmonic for metal sound
    gain2.gain.setValueAtTime(0.1, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t);
    osc2.stop(t + 1.0);
  }

  // --- Public Methods ---

  public async playClick(styleId: string) {
    await this.resumeContext();
    if (this.isMuted) return;

    if (styleId === 'chibi-pastel') {
      this.playSparkle();
    } else if (['artmulet', 'sacred-deity', 'naga-king', 'dark-sorcery'].includes(styleId)) {
      // Small bell sound
      this.playGong(550); 
    } else {
      // Standard click (soft woodblock)
      if (!this.context || !this.masterGain) return;
      const t = this.context.currentTime;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.frequency.setValueAtTime(400, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  // Dedicated Magic Toggle Sounds
  public async playMagicOn() {
    await this.resumeContext();
    if (this.isMuted || !this.context || !this.masterGain) return;
    
    // "Wink" Sound: High glissando sine wave with sparkle
    const t = this.context.currentTime;
    
    // 1. The "Wink" upward chirp
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, t);
    osc.frequency.exponentialRampToValueAtTime(2500, t + 0.15); // Fast chirp up
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain.gain.linearRampToValueAtTime(0, t + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
    
    // 2. The "Sparkle" (High pitched scattering)
    setTimeout(() => this.playSparkle(), 60);
  }

  public async playMagicOff() {
    await this.resumeContext();
    if (this.isMuted || !this.context || !this.masterGain) return;
    // Mechanical Switch Off
    const t = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public async playGenerateStart(styleId: string) {
    await this.resumeContext();
    if (this.isMuted) return;

    if (styleId === 'chibi-pastel') {
      // Ascending Arpeggio
      [0, 0.1, 0.2].forEach((delay, i) => {
        setTimeout(() => {
          if (this.context && this.masterGain) {
            const t = this.context.currentTime;
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.frequency.setValueAtTime(523.25 * (1 + i * 0.25), t); // C major-ish
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.3);
          }
        }, delay * 1000);
      });
    } else {
      // Deep "Om" start
      if (!this.context || !this.masterGain) return;
      const t = this.context.currentTime;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(100, t + 1.0); // Pitch drop
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.5);
      gain.gain.linearRampToValueAtTime(0, t + 2.0);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 2.0);
    }
  }

  public async playSuccess(styleId: string) {
    await this.resumeContext();
    if (this.isMuted) return;

    if (styleId === 'chibi-pastel') {
      // Magic Wand Glissando
      if (!this.context || !this.masterGain) return;
      const t = this.context.currentTime;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(2000, t + 0.3);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.3);
    } else {
      // Big Sacred Gong
      this.playGong(110); // Low A
    }
  }

  public async startAmbient() {
    await this.resumeContext();
    if (this.isMuted || !this.context || !this.masterGain) return;
    this.stopAmbient(); // Clear existing

    // Create a low pulsating drone
    const t = this.context.currentTime;
    
    // Oscillator 1: Low Drone
    const osc1 = this.context.createOscillator();
    const gain1 = this.context.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(110, t); // A2
    
    // LFO for throbbing effect
    const lfo = this.context.createOscillator();
    lfo.frequency.setValueAtTime(0.5, t); // 0.5 Hz pulse
    const lfoGain = this.context.createGain();
    lfoGain.gain.setValueAtTime(0.05, t); // Modulation depth
    
    lfo.connect(lfoGain);
    lfoGain.connect(gain1.gain); // Modulate volume
    
    gain1.gain.setValueAtTime(0.05, t); // Base volume
    
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    
    osc1.start(t);
    lfo.start(t);
    
    this.ambientOscillators = [osc1, lfo];
    this.ambientGain = gain1;
  }

  public stopAmbient() {
    if (this.ambientOscillators.length > 0) {
      this.ambientOscillators.forEach(osc => {
        try {
          osc.stop(); 
          osc.disconnect();
        } catch (e) {}
      });
      this.ambientOscillators = [];
    }
    if (this.ambientGain) {
        this.ambientGain.disconnect();
        this.ambientGain = null;
    }
  }

  // --- NEW SOUNDS FOR ALTAR ---
  public async playChanting() {
    await this.resumeContext();
    if (this.isMuted || !this.context || !this.masterGain) return;
    
    // Simulate Monastic Chant Drone (Three harmonic oscillators)
    const t = this.context.currentTime;
    const freqs = [110, 165, 220]; // A2, E3, A3
    
    freqs.forEach((f, i) => {
        if (!this.context || !this.masterGain) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = 'sawtooth'; // Sawtooth for vocal quality
        osc.frequency.setValueAtTime(f, t);
        
        // Low pass filter to soften the sawtooth into a "hum"
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.03, t + 1); // Fade in
        gain.gain.linearRampToValueAtTime(0, t + 8); // Fade out

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(t);
        osc.stop(t + 8);
    });
  }

  public async playSiamsiShake() {
    await this.resumeContext();
    if (this.isMuted || !this.context || !this.masterGain) return;
    
    // Simulate wooden sticks rattling (Multiple high pitched clicks)
    const t = this.context.currentTime;
    
    for (let i = 0; i < 5; i++) {
        const time = t + (Math.random() * 0.5);
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.frequency.setValueAtTime(800 + Math.random() * 400, time);
        osc.type = 'square';
        
        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.05);
    }
  }

  // --- NEW SOUNDS FOR ECONOMY ---
  public async playCoinSound() {
    await this.resumeContext();
    if (this.isMuted || !this.context || !this.masterGain) return;

    const t = this.context.currentTime;

    // Coin 1 (High ping)
    const osc1 = this.context.createOscillator();
    const gain1 = this.context.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1500, t);
    gain1.gain.setValueAtTime(0.1, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(t);
    osc1.stop(t + 0.5);

    // Coin 2 (Slightly delayed ping for "Cha-ching" feel)
    const osc2 = this.context.createOscillator();
    const gain2 = this.context.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2000, t + 0.05);
    gain2.gain.setValueAtTime(0.1, t + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t + 0.05);
    osc2.stop(t + 0.6);
  }
}

export const audioService = new AudioService();
