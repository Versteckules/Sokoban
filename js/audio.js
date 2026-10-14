// SOKOBAN AUDIO SYSTEM
// Web Audio API Synthesizer für Soundeffekte + Hintergrundmusik mit Fallback
// Ersteller: versteckules

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicElement = null;
    this.isMusicPlaying = false;
    this.ambientOscillators = [];
    this.isInitialized = false;
  }

  // Initialisiert AudioContext nach erster Nutzer-Interaktion
  init() {
    if (this.isInitialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
      this.initMusic();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API nicht unterstützt:', e);
    }
  }

  initMusic() {
    this.musicElement = new Audio('assets/music.mp3');
    this.musicElement.loop = true;
    this.musicElement.volume = 0.40;

    // Falls keine eigene assets/music.mp3 existiert, bleibt der Hintergrund ruhig (kein nerviges Synthesizer-Brummen)
    this.musicElement.addEventListener('error', () => {
      // Ruhiger Hintergrund, nur Soundeffekte aktiv
    });
  }

  startMusic() {
    this.isMusicPlaying = true;
    if (this.isMuted) return;

    if (this.musicElement) {
      const playPromise = this.musicElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Keine Musikdatei vorhanden oder Autoplay blockiert: Ruhig bleiben
        });
      }
    }
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicElement) {
      this.musicElement.pause();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.musicElement) this.musicElement.pause();
    } else {
      if (this.isMusicPlaying && this.musicElement) {
        this.musicElement.play().catch(() => {});
      }
    }
    return this.isMuted;
  }

  startAmbientDrone() {
    // Deaktiviert: Kein nerviges 55Hz Synthesizer-Brummen
  }

  stopAmbientDrone() {
    // Deaktiviert
  }

  // Soundeffekt: Leiser Schritt auf Steinplatten
  playStep() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // Soundeffekt: Schweres Kistenschleifen (Stein auf Stein Reibung)
  playPush() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Rauschen für Schleifgeräusch
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.7));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);

      // Dumpfer Bass-Körper
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(75, now);
      sub.frequency.exponentialRampToValueAtTime(35, now + 0.18);
      subGain.gain.setValueAtTime(0.25, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(now);
      sub.stop(now + 0.18);
    } catch (e) {}
  }

  // Soundeffekt: Stoß gegen Wand / Blockade
  playBump() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.15);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // Soundeffekt: Zug rückgängig (Undo)
  playUndo() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // Soundeffekt: Kiste erreicht Zielfeld (magisches Leuchten)
  playBoxOnGoal() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // Soundeffekt: Triumphale Level-Sieg-Akkorde (Pyramiden-Harmonie)
  playWin() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [293.66, 369.99, 440.00, 587.33]; // D, F#, A, D
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + 0.9);
      });
    } catch (e) {}
  }

  // Soundeffekt: Geheime Reviewer-Modus-Aktivierung
  playSecretUnlock() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.15);
      });
    } catch (e) {}
  }
}
