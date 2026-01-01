/**
 * SoundManager - Basic procedural sound effects using Web Audio API
 */
export class SoundManager {
  constructor() {
    this.audioContext = null;
    this.volume = 0.3; // Lower default volume
    this.isInitialized = false;
  }
  
  // Initialize audio context (requires user interaction)
  init() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
      console.log('SoundManager initialized');
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }
  
  playShoot(type) {
    if (!this.isInitialized || !this.audioContext) return;
    
    try {
      // Simple gunshot synth
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      if (type === 'kinetic') {
        osc.frequency.value = 100;
        osc.type = 'square';
      } else if (type === 'flux') {
        osc.frequency.value = 200;
        osc.type = 'sine';
      }
      
      gain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.1);
    } catch (e) {
      console.warn('Sound playback error:', e);
    }
  }
  
  playHit() {
    if (!this.isInitialized || !this.audioContext) return;
    
    try {
      // Enemy hit sound
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.frequency.value = 80;
      osc.type = 'square';
      gain.gain.setValueAtTime(this.volume * 0.7, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.15);
    } catch (e) {
      console.warn('Sound playback error:', e);
    }
  }
  
  playCollect() {
    if (!this.isInitialized || !this.audioContext) return;
    
    try {
      // Resource collection sound
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.2);
    } catch (e) {
      console.warn('Sound playback error:', e);
    }
  }
  
  playWaveStart() {
    if (!this.isInitialized || !this.audioContext) return;
    
    try {
      // Wave start alert
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.3);
      osc.type = 'triangle';
      
      gain.gain.setValueAtTime(this.volume * 0.8, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.3);
    } catch (e) {
      console.warn('Sound playback error:', e);
    }
  }
  
  playDamage() {
    if (!this.isInitialized || !this.audioContext) return;
    
    try {
      // Player damage sound
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.frequency.value = 60;
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.2);
    } catch (e) {
      console.warn('Sound playback error:', e);
    }
  }
  
  playConversion() {
    if (!this.isInitialized || !this.audioContext) return;
    
    try {
      // Conversion success sound - rising tone
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      // Rising tone for successful conversion
      osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        600, 
        this.audioContext.currentTime + 0.3
      );
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(this.volume * 0.6, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.01, 
        this.audioContext.currentTime + 0.3
      );
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.3);
    } catch (e) {
      console.warn('Sound playback error:', e);
    }
  }
  
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
  }
}
