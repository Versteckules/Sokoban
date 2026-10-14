// SOKOBAN PYRAMID - STANDALONE GAME BUNDLE
// Funktioniert sowohl auf GitHub Pages als auch beim direkten Doppelklick (file://) im Browser!
// Ersteller: versteckules
(function() {

// --- Source: levels.js ---
// SOKOBAN: DAS GEHEIMNIS DER PYRAMIDE
// 15 Verifizierte Level-Definitionen (Geocaching Edition)
// Ersteller: versteckules

const LEVELS = [
  {
    "id": 1,
    "tier": 1,
    "name": "Smaragd-Pforte",
    "width": 5,
    "height": 3,
    "map": "#####\n#@$.#\n#####",
    "token": "f2d007031983473d",
    "minSteps": 1
  },
  {
    "id": 2,
    "tier": 1,
    "name": "Der grüne Pfad",
    "width": 5,
    "height": 5,
    "map": "#####\n#@  #\n# $ #\n# . #\n#####",
    "token": "e791e7ae8b0664b1",
    "minSteps": 2
  },
  {
    "id": 3,
    "tier": 1,
    "name": "Zwillingskammer",
    "width": 6,
    "height": 5,
    "map": "######\n#@   #\n# $$ #\n# .. #\n######",
    "token": "3e6f534e7829e07c",
    "minSteps": 5
  },
  {
    "id": 4,
    "tier": 1,
    "name": "Winkelschliff",
    "width": 7,
    "height": 5,
    "map": "#######\n#  @  #\n# $#$ #\n# . . #\n#######",
    "token": "7b4d22a89865b209",
    "minSteps": 6
  },
  {
    "id": 5,
    "tier": 1,
    "name": "Smaragd-Magazin",
    "width": 6,
    "height": 6,
    "map": "######\n#   .#\n# $  #\n#  $ #\n#.  @#\n######",
    "token": "5f0d251a504e8585",
    "minSteps": 10
  },
  {
    "id": 6,
    "tier": 2,
    "name": "Bernstein-Halle",
    "width": 6,
    "height": 5,
    "map": "######\n#. $ #\n#  $ #\n#@ . #\n######",
    "token": "bf9c6931c8792828",
    "minSteps": 9
  },
  {
    "id": 7,
    "tier": 2,
    "name": "Goldene Kammer",
    "width": 6,
    "height": 6,
    "map": "######\n#    #\n# $$ #\n# .#.#\n#  @ #\n######",
    "token": "895d60f7a5d3d093",
    "minSteps": 11
  },
  {
    "id": 8,
    "tier": 2,
    "name": "Sonnenpfad",
    "width": 5,
    "height": 6,
    "map": "#####\n#@  #\n# $$#\n## .#\n # .#\n ####",
    "token": "2796e36a47e7334e",
    "minSteps": 13
  },
  {
    "id": 9,
    "tier": 2,
    "name": "Das Säulenpaar",
    "width": 6,
    "height": 6,
    "map": "######\n#  . #\n# #$ #\n#@ $ #\n#.   #\n######",
    "token": "4c316265d5304189",
    "minSteps": 19
  },
  {
    "id": 10,
    "tier": 3,
    "name": "Amethyst-Grotte",
    "width": 7,
    "height": 6,
    "map": " ######\n##    #\n# .$$ #\n# .#@ #\n#     #\n#######",
    "token": "7f5a3ab100ba3429",
    "minSteps": 20
  },
  {
    "id": 11,
    "tier": 3,
    "name": "Violetter Zwang",
    "width": 6,
    "height": 7,
    "map": "######\n#   .#\n# #$ #\n# $  #\n#@#$.#\n#   .#\n######",
    "token": "70afb2e269ff3dd7",
    "minSteps": 23
  },
  {
    "id": 12,
    "tier": 3,
    "name": "Kristall-Labyrinth",
    "width": 7,
    "height": 7,
    "map": "#######\n#     #\n# $ $ #\n# .#@.#\n#  $  #\n#  .  #\n#######",
    "token": "0692fa038c2f82b7",
    "minSteps": 24
  },
  {
    "id": 13,
    "tier": 4,
    "name": "Rubin-Schleife",
    "width": 7,
    "height": 7,
    "map": "#######\n#  .  #\n# $#$ #\n# .@. #\n# $#$ #\n#  .  #\n#######",
    "token": "7c34afeb5354cc17",
    "minSteps": 30
  },
  {
    "id": 14,
    "tier": 4,
    "name": "Blutstein-Tresor",
    "width": 6,
    "height": 7,
    "map": "######\n# .  #\n# $$ #\n# .# #\n#@ $ #\n#  . #\n######",
    "token": "6081d5cbebf04623",
    "minSteps": 33
  },
  {
    "id": 15,
    "tier": 5,
    "name": "Das Obsidian-Heiligtum",
    "width": 7,
    "height": 7,
    "map": " ######\n # .  #\n##$#  #\n#  $ .#\n# @#  #\n# . $ #\n#######",
    "token": "46e9d2d8a5bb5c6b",
    "minSteps": 57
  }
];

const PYRAMID_GRAPH = {
  // Tier 1 (0..4) - Basis, sofort spielbar
  0: [], 1: [], 2: [], 3: [], 4: [],
  // Tier 2 (5..8) - Benötigt je zwei Fundamentsteine
  5: [0, 1],
  6: [1, 2],
  7: [2, 3],
  8: [3, 4],
  // Tier 3 (9..11) - Benötigt je zwei Steine aus Tier 2
  9: [5, 6],
  10: [6, 7],
  11: [7, 8],
  // Tier 4 (12..13) - Benötigt je zwei Steine aus Tier 3
  12: [9, 10],
  13: [10, 11],
  // Tier 5 (14) - Apex-Spitze, benötigt beide Steine aus Tier 4
  14: [12, 13]
};

const TIER_CONFIG = {
  1: {
    tier: 1,
    name: "Leicht",
    material: "Holz & Moosstein",
    ambienceName: "Urwald-Tempel (Holz & Moosstein)",
    icon: "🌿",
    color: "#10b981",
    accent: "#059669",
    glow: "rgba(16, 185, 129, 0.45)",
    label: "Smaragd",
    boxDesc: "Gezimmerte Holzkiste",
    wallDesc: "Moosbewachsener Bruchstein"
  },
  2: {
    tier: 2,
    name: "Mittel",
    material: "Sandstein & Gold",
    ambienceName: "Wüsten-Heiligtum (Sandstein & Gold)",
    icon: "☀️",
    color: "#f59e0b",
    accent: "#d97706",
    glow: "rgba(245, 158, 11, 0.45)",
    label: "Bernstein",
    boxDesc: "Sandstein-Sonnenmonolith",
    wallDesc: "Relief-Sandstein"
  },
  3: {
    tier: 3,
    name: "Hoch",
    material: "Schiefer & Amethyst",
    ambienceName: "Kristall-Katakomben (Schiefer & Amethyst)",
    icon: "🔮",
    color: "#8b5cf6",
    accent: "#7c3aed",
    glow: "rgba(139, 92, 246, 0.45)",
    label: "Amethyst",
    boxDesc: "Amethyst-Kristalltruhe",
    wallDesc: "Violetter Schieferfels"
  },
  4: {
    tier: 4,
    name: "Sehr hoch",
    material: "Schmiedeeisen & Rubin",
    ambienceName: "Eisen-Gewölbe (Schmiedeeisen & Rubin)",
    icon: "⚔️",
    color: "#ef4444",
    accent: "#dc2626",
    glow: "rgba(239, 68, 68, 0.45)",
    label: "Rubin",
    boxDesc: "Vernieteter Panzertresor",
    wallDesc: "Geschmiedete Panzerplatten"
  },
  5: {
    tier: 5,
    name: "Extrem",
    material: "Obsidian & Magma",
    ambienceName: "Das Obsidian-Apex (Obsidian & Magma)",
    icon: "🌋",
    color: "#ff3b30",
    accent: "#ff8c00",
    glow: "rgba(255, 59, 48, 0.55)",
    label: "Obsidian",
    boxDesc: "Glühendes Obsidian-Relikt",
    wallDesc: "Magma-durchzogener Obsidian"
  }
};

const COMBINED_TOKENS_HASH = "8be5a0437766aa2d6672810c3bfeed2de067bafe5a3e03297b17166644cf7beb";

// --- Source: engine.js ---
// SOKOBAN CORE ENGINE
// Verwaltung von Spielzustand, Zügen, Undo-Stack, Pyramiden-Abhängigkeiten und Persistenz
// Ersteller: versteckules


const CELL = {
  FLOOR: 0,
  WALL: 1,
  GOAL: 2,
  BOX: 3,
  BOX_ON_GOAL: 4
};

class SokobanEngine {
  constructor() {
    this.currentLevelIndex = 0;
    this.currentLevel = null;
    this.width = 0;
    this.height = 0;
    this.staticGrid = []; // Nur Wände (1), Zielfelder (2), Böden (0)
    this.boxes = [];      // Array von { x, y }
    this.goals = [];      // Array von { x, y }
    this.player = { x: 0, y: 0, facing: 'down', isPushing: false };
    this.moveHistory = [];
    this.stepCount = 0;
    this.pushCount = 0;
    this.isCompleted = false;

    // Persistenter Fortschritt
    this.progress = this.loadProgress();
  }

  // Lädt ein Level anhand des Index (0 bis 14)
  loadLevel(index) {
    if (index < 0 || index >= LEVELS.length) {
      console.error(`Ungültiger Level-Index: ${index}`);
      return false;
    }

    this.currentLevelIndex = index;
    this.currentLevel = LEVELS[index];
    this.width = this.currentLevel.width;
    this.height = this.currentLevel.height;

    this.staticGrid = Array.from({ length: this.height }, () => Array(this.width).fill(CELL.FLOOR));
    this.boxes = [];
    this.goals = [];
    this.moveHistory = [];
    this.stepCount = 0;
    this.pushCount = 0;
    this.isCompleted = false;

    const lines = this.currentLevel.map.split('\n');
    for (let y = 0; y < this.height; y++) {
      const line = lines[y] || '';
      for (let x = 0; x < this.width; x++) {
        const char = line[x] || ' ';
        switch (char) {
          case '#':
            this.staticGrid[y][x] = CELL.WALL;
            break;
          case '.':
            this.staticGrid[y][x] = CELL.GOAL;
            this.goals.push({ x, y });
            break;
          case '$':
            this.boxes.push({ x, y });
            break;
          case '*':
            this.staticGrid[y][x] = CELL.GOAL;
            this.goals.push({ x, y });
            this.boxes.push({ x, y });
            break;
          case '@':
            this.player = { x, y, facing: 'down', isPushing: false };
            break;
          case '+':
            this.staticGrid[y][x] = CELL.GOAL;
            this.goals.push({ x, y });
            this.player = { x, y, facing: 'down', isPushing: false };
            break;
          default:
            this.staticGrid[y][x] = CELL.FLOOR;
        }
      }
    }

    return true;
  }

  // Führt einen Zug in die angegebene Richtung aus
  // direction: 'up', 'down', 'left', 'right' oder Vektor { dx, dy }
  move(direction) {
    if (this.isCompleted) return { success: false, reason: 'already_completed' };

    let dx = 0;
    let dy = 0;
    let facing = this.player.facing;

    if (typeof direction === 'string') {
      const d = direction.toLowerCase();
      if (d === 'up' || d === 'h' || d === 'hoch') { dx = 0; dy = -1; facing = 'up'; }
      else if (d === 'down' || d === 'r' || d === 'runter') { dx = 0; dy = 1; facing = 'down'; }
      else if (d === 'left' || d === 'l' || d === 'links') { dx = -1; dy = 0; facing = 'left'; }
      else if (d === 'right' || d === 're' || d === 'rechts') { dx = 1; dy = 0; facing = 'right'; }
    } else if (typeof direction === 'object') {
      dx = direction.dx || 0;
      dy = direction.dy || 0;
      if (dy < 0) facing = 'up';
      else if (dy > 0) facing = 'down';
      else if (dx < 0) facing = 'left';
      else if (dx > 0) facing = 'right';
    }

    if (dx === 0 && dy === 0) return { success: false, reason: 'no_movement' };

    this.player.facing = facing;

    const targetX = this.player.x + dx;
    const targetY = this.player.y + dy;

    // 1. Kollision mit Spielfeldrand oder Wand
    if (this.isWall(targetX, targetY)) {
      return { success: false, reason: 'wall', target: { x: targetX, y: targetY }, facing };
    }

    // 2. Prüfe ob Kiste auf Zielfeld steht
    const boxIndex = this.getBoxIndexAt(targetX, targetY);

    if (boxIndex !== -1) {
      // Spieler möchte eine Kiste schieben
      const boxTargetX = targetX + dx;
      const boxTargetY = targetY + dy;

      // Kann Kiste geschoben werden? (keine Wand und keine weitere Kiste dahinter)
      if (this.isWall(boxTargetX, boxTargetY) || this.getBoxIndexAt(boxTargetX, boxTargetY) !== -1) {
        return { success: false, reason: 'blocked_box', target: { x: boxTargetX, y: boxTargetY }, facing };
      }

      // Snapshot für Undo anlegen
      this.saveSnapshot(boxIndex, { x: targetX, y: targetY }, { x: boxTargetX, y: boxTargetY });

      // Kiste verschieben
      this.boxes[boxIndex].x = boxTargetX;
      this.boxes[boxIndex].y = boxTargetY;

      // Spieler bewegen
      this.player.x = targetX;
      this.player.y = targetY;
      this.player.isPushing = true;
      this.stepCount++;
      this.pushCount++;

      const win = this.checkWin();
      if (win) {
        this.handleLevelWin();
      }

      return {
        success: true,
        pushedBox: true,
        boxIndex,
        boxFrom: { x: targetX, y: targetY },
        boxTo: { x: boxTargetX, y: boxTargetY },
        playerFrom: { x: targetX - dx, y: targetY - dy },
        playerTo: { x: targetX, y: targetY },
        facing,
        win
      };
    } else {
      // Reiner Spielerschritt ohne Kiste
      this.saveSnapshot(-1, null, null);

      this.player.x = targetX;
      this.player.y = targetY;
      this.player.isPushing = false;
      this.stepCount++;

      return {
        success: true,
        pushedBox: false,
        playerFrom: { x: targetX - dx, y: targetY - dy },
        playerTo: { x: targetX, y: targetY },
        facing,
        win: false
      };
    }
  }

  // Speichert den Zustand für unbegrenztes Undo
  saveSnapshot(pushedBoxIndex, boxFrom, boxTo) {
    this.moveHistory.push({
      player: { x: this.player.x, y: this.player.y, facing: this.player.facing },
      boxes: this.boxes.map(b => ({ x: b.x, y: b.y })),
      pushedBoxIndex,
      boxFrom,
      boxTo
    });
  }

  // Macht den letzten Zug rückgängig
  undo() {
    if (this.moveHistory.length === 0 || this.isCompleted) {
      return { success: false, reason: 'no_history' };
    }

    const lastState = this.moveHistory.pop();
    this.player.x = lastState.player.x;
    this.player.y = lastState.player.y;
    this.player.facing = lastState.player.facing;
    this.player.isPushing = false;
    this.boxes = lastState.boxes.map(b => ({ x: b.x, y: b.y }));
    this.stepCount = Math.max(0, this.stepCount - 1);
    if (lastState.pushedBoxIndex !== -1) {
      this.pushCount = Math.max(0, this.pushCount - 1);
    }

    return {
      success: true,
      player: { x: this.player.x, y: this.player.y, facing: this.player.facing },
      boxes: this.boxes
    };
  }

  // Setzt das Level auf den Anfangszustand zurück
  reset() {
    return this.loadLevel(this.currentLevelIndex);
  }

  // Prüft, ob alle Kisten auf Zielfeldern stehen
  checkWin() {
    if (this.boxes.length === 0) return false;
    return this.boxes.every(box => this.isGoal(box.x, box.y));
  }

  // Wird aufgerufen, wenn das Level erfolgreich gelöst wurde
  handleLevelWin() {
    this.isCompleted = true;
    const levelId = this.currentLevel.id;
    const levelIndex = this.currentLevelIndex;

    if (!this.progress.completedLevels.includes(levelIndex)) {
      this.progress.completedLevels.push(levelIndex);
    }

    // Token für den Kryptotresor registrieren
    this.progress.levelTokens[levelIndex] = this.currentLevel.token;

    // Neue Level in der Pyramide freischalten
    this.updateUnlockedLevels();
    this.saveProgress();
  }

  // Prüft die Pyramiden-Abhängigkeiten (5-4-3-2-1)
  // Ein Stein schaltet sich frei, wenn BEIDE Fundamentsteine darunter gelöst sind
  isLevelUnlocked(index) {
    if (index >= 0 && index <= 4) return true; // Tier 1 ist immer offen
    const parents = PYRAMID_GRAPH[index] || [];
    if (parents.length === 0) return true;
    return parents.every(parentIndex => this.progress.completedLevels.includes(parentIndex));
  }

  // Aktualisiert die Liste freigeschalteter Level
  updateUnlockedLevels() {
    const unlocked = [];
    for (let i = 0; i < LEVELS.length; i++) {
      if (this.isLevelUnlocked(i)) {
        unlocked.push(i);
      }
    }
    this.progress.unlockedLevels = unlocked;
  }

  isWall(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
    return this.staticGrid[y][x] === CELL.WALL;
  }

  isGoal(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return this.staticGrid[y][x] === CELL.GOAL;
  }

  getBoxIndexAt(x, y) {
    return this.boxes.findIndex(b => b.x === x && b.y === y);
  }

  // Persistenz via localStorage
  saveProgress() {
    try {
      localStorage.setItem('sokoban_pyramid_save', JSON.stringify({
        completedLevels: this.progress.completedLevels,
        unlockedLevels: this.progress.unlockedLevels,
        levelTokens: this.progress.levelTokens,
        audioMuted: this.progress.audioMuted || false,
        tileSize: this.progress.tileSize || 4.0
      }));
    } catch (e) {
      console.warn('localStorage konnte nicht gespeichert werden:', e);
    }
  }

  loadProgress() {
    const defaultProgress = {
      completedLevels: [],
      unlockedLevels: [0, 1, 2, 3, 4],
      levelTokens: {},
      audioMuted: false,
      tileSize: 4.0
    };

    try {
      const data = localStorage.getItem('sokoban_pyramid_save');
      if (data) {
        const parsed = JSON.parse(data);
        return {
          completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
          unlockedLevels: Array.isArray(parsed.unlockedLevels) ? parsed.unlockedLevels : [0, 1, 2, 3, 4],
          levelTokens: parsed.levelTokens || {},
          audioMuted: !!parsed.audioMuted,
          tileSize: parsed.tileSize || 4.0
        };
      }
    } catch (e) {
      console.warn('localStorage konnte nicht geladen werden:', e);
    }
    return defaultProgress;
  }

  // Prüft, ob alle 15 Level abgeschlossen sind
  areAllLevelsCompleted() {
    return LEVELS.every((_, idx) => this.progress.completedLevels.includes(idx));
  }
}

// --- Source: audio.js ---
// SOKOBAN AUDIO SYSTEM
// Web Audio API Synthesizer für Soundeffekte + Hintergrundmusik mit Fallback
// Ersteller: versteckules

class AudioManager {
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

// --- Source: gps.js ---
// GPS OUTDOOR ENGINE (Geocaching Edition)
// Erkennt echte Fortbewegung im Freien ohne Geister-Schritte & reagiert direkt auf Richtungswechsel
// Ersteller: versteckules

class GpsEngine {
  constructor(options = {}) {
    this.watchId = null;
    this.isTracking = false;
    this.hasPermission = false;
    this.status = 'idle'; // 'idle', 'searching', 'locked', 'denied', 'error'
    this.accuracy = 999;
    this.lastPosition = null;
    this.lastGpsTimestamp = 0;

    // Referenzpunkt für Schritt-Erkennung
    this.stepOriginCoord = null;
    this.prevStepCoord = null;

    // Live-Gehdistanz zum Referenzpunkt
    this.currentWalkDistance = 0;

    // Schritt-Schwelle: 1.5 Meter echte räumliche Verdrängung (ca. 2-3 Schritte)
    this.stepThresholdMeters = options.stepThreshold || 1.5;

    // Cooldown gegen Doppelschritte (1200ms für absolute Stabilität & Schutz vor Geisterschritten)
    this.lastStepTime = -10000;
    this.stepCooldownMs = 1200;

    // Schrittzähler über Pedometer / Accelerometer (DeviceMotion)
    this.motionStepsCount = 0;
    this.lastMotionPeakTime = 0;
    this.lastMotionReceivedTime = 0;
    this.isMotionListening = false;
    this.motionHandler = null;
    this.gravityFilter = 9.81;

    // Letzte bekannte Himmelsrichtung
    this.currentFacing = 'up';

    // Callbacks
    this.onLocationUpdate = null;
    this.onStepTriggered = null;
    this.onStatusChange = null;

    // Kompatibilitäts-Eigenschaften
    this.anchor = { active: true };
    this.rotationAngle = 0;
    this.tileSize = 4.0;
  }

  // Startet kontinuierliche GPS-Standorterfassung & Bewegungssensoren
  startTracking() {
    if (this.isTracking) return true;
    this.isTracking = true;
    this.stepOriginCoord = null;
    this.currentWalkDistance = 0;
    this.motionStepsCount = 0;

    if ('geolocation' in navigator) {
      this.setStatus('searching', 'Satelliten werden gesucht...');
      try {
        this.watchId = navigator.geolocation.watchPosition(
          (pos) => this.handlePositionUpdate(pos),
          (err) => this.handleError(err),
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000
          }
        );
      } catch (e) {
        this.setStatus('error', 'GPS nicht verfügbar');
      }
    } else {
      this.setStatus('idle', 'Kein GPS');
    }

    this.startMotionStepSensor();
    return true;
  }

  // Stoppt das Tracking
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.stepOriginCoord = null;
    this.currentWalkDistance = 0;
    this.stopMotionStepSensor();
    this.setStatus('idle', 'Pausiert');
  }

  // Bewegungssensor (Pedometer / Schritt-Erkennung per Beschleunigungsmesser)
  startMotionStepSensor() {
    if (this.isMotionListening) return;
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      this.motionHandler = (e) => this.handleDeviceMotion(e);
      window.addEventListener('devicemotion', this.motionHandler, { passive: true });
      this.isMotionListening = true;
    }
  }

  stopMotionStepSensor() {
    if (this.isMotionListening && this.motionHandler) {
      window.removeEventListener('devicemotion', this.motionHandler);
      this.motionHandler = null;
      this.isMotionListening = false;
    }
  }

  // Erkennt physische Schritte über den Beschleunigungssensor (Stoß beim Gehen)
  handleDeviceMotion(e) {
    if (!this.isTracking) return;
    const acc = e.acceleration || e.accelerationIncludingGravity;
    if (!acc) return;

    let dynamicMag = 0;
    if (e.acceleration && e.acceleration.x !== null && (e.acceleration.x !== 0 || e.acceleration.y !== 0 || e.acceleration.z !== 0)) {
      const ax = acc.x || 0;
      const ay = acc.y || 0;
      const az = acc.z || 0;
      dynamicMag = Math.sqrt(ax * ax + ay * ay + az * az);
      this.lastMotionReceivedTime = performance.now();
    } else if (e.accelerationIncludingGravity) {
      const gx = acc.x || 0;
      const gy = acc.y || 0;
      const gz = acc.z || 0;
      const rawMag = Math.sqrt(gx * gx + gy * gy + gz * gz);
      this.gravityFilter = 0.88 * this.gravityFilter + 0.12 * rawMag;
      dynamicMag = Math.abs(rawMag - this.gravityFilter);
      this.lastMotionReceivedTime = performance.now();
    }

    const now = performance.now();

    // Schritt-Erkennung:
    // Dynamische Beschleunigung beim echten Gehen mit Handy in der Hand: ca. 1.25 bis 3.0 m/s²
    // Mindest-Intervall 340ms, Maximal-Intervall 1800ms
    if (dynamicMag >= 1.25 && (now - this.lastMotionPeakTime >= 340)) {
      // Wenn der letzte Schritt mehr als 2.5 Sekunden her ist: Neuer Schritt-Zyklus
      if (now - this.lastMotionPeakTime > 2500 && this.motionStepsCount > 0) {
        this.motionStepsCount = 0;
      }

      this.lastMotionPeakTime = now;
      this.motionStepsCount++;

      this.updateStatusDisplay();
      this.checkStepTrigger();
    }
  }

  // Verarbeitet GPS-Positionsänderungen
  handlePositionUpdate(pos) {
    this.lastPosition = pos;
    this.accuracy = pos.coords.accuracy || 999;
    this.hasPermission = true;
    this.lastGpsTimestamp = performance.now();

    const currentLat = pos.coords.latitude;
    const currentLon = pos.coords.longitude;

    // Erster GPS-Fix: Als Ausgangspunkt setzen
    if (!this.stepOriginCoord) {
      this.stepOriginCoord = { lat: currentLat, lon: currentLon };
      this.updateStatusDisplay();
      if (this.onLocationUpdate) this.onLocationUpdate(pos, 0);
      return;
    }

    // Echte radiale Verdrängung vom Referenzpunkt in Metern berechnen
    // (WICHTIG: Keine Summierung von Rausch-Deltas im Stillstand -> 100% Geisterschritt-Schutz!)
    const distFromOrigin = this.haversineMeters(
      this.stepOriginCoord.lat,
      this.stepOriginCoord.lon,
      currentLat,
      currentLon
    );
    this.currentWalkDistance = distFromOrigin;

    this.updateStatusDisplay();

    // Satelliten-Sprung abfangen (> 40m)
    if (distFromOrigin >= 40) {
      this.stepOriginCoord = { lat: currentLat, lon: currentLon };
      this.motionStepsCount = 0;
      return;
    }

    // Prüfe Schritt-Trigger
    this.checkStepTrigger();

    if (this.onLocationUpdate) {
      this.onLocationUpdate(pos, this.currentWalkDistance);
    }
  }

  // Prüft alle Schritt-Trigger-Bedingungen (Sensor-Fusion ohne Geisterschritte)
  checkStepTrigger() {
    const now = performance.now();
    if (now - this.lastStepTime < this.stepCooldownMs) return;

    const currentDist = this.currentWalkDistance;
    const speed = (this.lastPosition && this.lastPosition.coords && this.lastPosition.coords.speed) || 0;
    const hasOutdoorGps = this.accuracy <= 55;

    // Prüfe ob der Bewegungssensor aktiv Daten liefert (z.B. Smartphone in der Hand)
    const isMotionStreaming = this.isMotionListening && (now - this.lastMotionReceivedTime < 3500);

    let isStepTriggered = false;

    if (isMotionStreaming) {
      // SENSOR-FUSION (Smartphone im Freien):
      // 100% SCHUTZ VOR GEISTERSCHRITTEN IM STILLSTAND!
      // Der Spieler MUSS physische Schritte gegangen sein (mind. 2 Schritte = ca. 1.5m)
      // UND GPS bestätigt echte räumliche Verdrängung (Distanz >= 0.8m ODER Speed >= 0.22 m/s):
      const conditionWalkingPedometer = (this.motionStepsCount >= 2) && 
                                        hasOutdoorGps && 
                                        (currentDist >= 0.8 || speed >= 0.22 || currentDist >= 1.25);

      // Zügige Fortbewegung (z.B. schneller Ausfallschritt >= 2.5m mit mind. 1 Schritt-Impuls)
      const conditionFastStride = (currentDist >= 2.5) && (this.motionStepsCount >= 1) && hasOutdoorGps;

      isStepTriggered = conditionWalkingPedometer || conditionFastStride;
    } else {
      // FALLBACK NUR WENN KEIN BEWEGUNGSSENSOR VORHANDEN ODER BLOCKIERT:
      // (z.B. Desktop/Browser oder Sensor-Berechtigung verweigert)
      const conditionGpsFallback = (currentDist >= this.stepThresholdMeters) && 
                                   (currentDist < 40) && 
                                   hasOutdoorGps && 
                                   (speed >= 0.25 || currentDist >= 2.0);

      isStepTriggered = conditionGpsFallback;
    }

    if (isStepTriggered) {
      this.lastStepTime = now;
      const walkDist = currentDist;

      let bearing = null;
      if (this.stepOriginCoord && this.lastPosition) {
        const curLat = this.lastPosition.coords.latitude;
        const curLon = this.lastPosition.coords.longitude;
        if (currentDist >= 1.0) {
          bearing = this.calculateBearing(this.stepOriginCoord.lat, this.stepOriginCoord.lon, curLat, curLon);
        }
      }

      // Referenzpunkt für den nächsten Schritt auf die aktuelle Position setzen
      this.motionStepsCount = 0;
      this.currentWalkDistance = 0;
      if (this.lastPosition) {
        this.prevStepCoord = this.stepOriginCoord ? { ...this.stepOriginCoord } : null;
        this.stepOriginCoord = {
          lat: this.lastPosition.coords.latitude,
          lon: this.lastPosition.coords.longitude
        };
      }

      this.triggerHaptic(50);
      this.updateStatusDisplay();

      if (this.onStepTriggered) {
        this.onStepTriggered(bearing, walkDist);
      }
    }
  }

  // Wird aufgerufen, wenn der Spieler die Richtung wechselt (Kompass, Bildschirm-Tap oder Buttons)
  onDirectionChanged(newFacing) {
    if (this.currentFacing === newFacing) return;
    this.currentFacing = newFacing;

    // Sofortiger Reset des Referenzpunkts auf die aktuelle Position:
    // Verhindert Altlasten aus der alten Richtung und ermöglicht sofortiges Vorwärtsgehen!
    if (this.lastPosition) {
      this.stepOriginCoord = {
        lat: this.lastPosition.coords.latitude,
        lon: this.lastPosition.coords.longitude
      };
    }
    this.motionStepsCount = 0;
    this.currentWalkDistance = 0;

    this.triggerHaptic(20);
    this.updateStatusDisplay();
  }

  // Setzt den Referenzpunkt zurück ("Hier verankern")
  resetStepOrigin() {
    if (this.lastPosition) {
      this.stepOriginCoord = {
        lat: this.lastPosition.coords.latitude,
        lon: this.lastPosition.coords.longitude
      };
    } else {
      this.stepOriginCoord = null;
    }
    this.currentWalkDistance = 0;
    this.motionStepsCount = 0;
    this.updateStatusDisplay();
  }

  // Aktualisiert die Anzeige in der oberen Status-Pille
  updateStatusDisplay() {
    const dirNames = { up: 'NORD', right: 'OST', down: 'SÜD', left: 'WEST' };
    const facingText = dirNames[this.currentFacing] || '';

    const distInfo = `${this.currentWalkDistance.toFixed(1)}m / ${this.stepThresholdMeters}m`;
    const stepsInfo = this.motionStepsCount > 0 ? `Schritt ${this.motionStepsCount}/3 (${this.currentWalkDistance.toFixed(1)}m)` : distInfo;

    if (this.accuracy <= 25) {
      this.setStatus('locked', `GPS aktiv (±${Math.round(this.accuracy)}m) | 🚶 ${stepsInfo} [${facingText}]`);
    } else if (this.accuracy <= 55) {
      this.setStatus('searching', `GPS (±${Math.round(this.accuracy)}m) | 🚶 ${stepsInfo} [${facingText}]`);
    } else {
      this.setStatus('searching', `GPS Signal schwach (±${Math.round(this.accuracy)}m) | [${facingText}]`);
    }
  }

  // Haversine-Distanz zwischen zwei WGS84-Koordinaten in Metern
  haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Berechnet die Himmelsrichtung / Peilung zwischen zwei Koordinaten in Grad (0° = N, 90° = O, 180° = S, 270° = W)
  calculateBearing(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
  }

  // Manuelles Auslösen (für Tests & Simulation)
  triggerStep(walkDirectionOrBearing = null) {
    const now = performance.now();
    if (now - this.lastStepTime < this.stepCooldownMs) return;
    this.lastStepTime = now;

    this.triggerHaptic(45);
    if (this.onStepTriggered) {
      let bearing = null;
      if (typeof walkDirectionOrBearing === 'string') {
        const map = { up: 0, right: 90, down: 180, left: 270 };
        bearing = map[walkDirectionOrBearing] !== undefined ? map[walkDirectionOrBearing] : null;
      } else if (typeof walkDirectionOrBearing === 'number') {
        bearing = walkDirectionOrBearing;
      }
      this.onStepTriggered(bearing, this.stepThresholdMeters);
    }
  }

  triggerHaptic(duration = 40) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(duration); } catch (e) {}
    }
  }

  triggerCollisionHaptic() {
    if ('vibrate' in navigator) {
      try { navigator.vibrate([60, 40, 80]); } catch (e) {}
    }
  }

  handleError(err) {
    if (err.code === 1) {
      this.setStatus('denied', 'GPS Zugriff verweigert');
    } else {
      this.setStatus('searching', 'GPS sucht Signal...');
    }
  }

  setStatus(status, message) {
    this.status = status;
    if (this.onStatusChange) {
      this.onStatusChange(status, message);
    }
  }

  // Kompatibilitäts-Stubs
  setAnchor() { this.resetStepOrigin(); return { success: true }; }
  setRotation() {}
  setTileSize() {}
  syncPlayerTile() {}
}

// --- Source: renderer.js ---
// SOKOBAN HIGH-END CANVAS RENDERER & PARTICLE SYSTEM
// Echte Texturen (Mauern, Boden, Kisten), animierter Abenteurer-Charakter, Feld-Drehung & Partikel
// Ersteller: versteckules


class SokobanRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = null;

    // Viewport & Kachel-Metriken
    this.dpr = window.devicePixelRatio || 1;
    this.tileSize = 48;
    this.offsetX = 0;
    this.offsetY = 0;
    this.rotation = 0; // 0, 90, 180, 270 Grad

    // Grafische Assets (Echte AAA-Spielgrafiken)
    this.assets = {
      wall: this.loadImage('assets/wall.jpg'),
      floor: this.loadImage('assets/floor.jpg'),
      crate: this.loadImage('assets/crate.png'),
      playerDown: this.loadImage('assets/player_down.png'),
      playerUp: this.loadImage('assets/player_up.png'),
      playerLeft: this.loadImage('assets/player_left.png'),
      playerRight: this.loadImage('assets/player_right.png'),

      // Tier-Spezifische photorealistische 3D-Kisten (Unreal Engine 5 Renders)
      crates: {
        1: this.loadImage('assets/crate_tier1.png'),
        2: this.loadImage('assets/crate_tier2.png'),
        3: this.loadImage('assets/crate_tier3.png'),
        4: this.loadImage('assets/crate_tier4.png'),
        5: this.loadImage('assets/crate_tier5.png')
      },
      // Tier-Spezifische hochauflösende Felswände
      walls: {
        1: this.loadImage('assets/wall_tier1.jpg'),
        2: this.loadImage('assets/wall_tier2.jpg'),
        3: this.loadImage('assets/wall_tier3.jpg'),
        4: this.loadImage('assets/wall_tier4.jpg'),
        5: this.loadImage('assets/wall_tier5.jpg')
      },
      // Tier-Spezifische Bodenplatten
      floors: {
        1: this.loadImage('assets/floor_tier1.jpg'),
        2: this.loadImage('assets/floor_tier2.jpg'),
        3: this.loadImage('assets/floor_tier3.jpg'),
        4: this.loadImage('assets/floor_tier4.jpg'),
        5: this.loadImage('assets/floor_tier5.jpg')
      },
      // Tier-Spezifische Kammer-Hintergründe
      backgrounds: {
        1: this.loadImage('assets/bg_tier1.jpg'),
        2: this.loadImage('assets/bg_tier2.jpg'),
        3: this.loadImage('assets/bg_tier3.jpg'),
        4: this.loadImage('assets/bg_tier4.jpg'),
        5: this.loadImage('assets/bg_tier5.jpg')
      }
    };

    // Glättung & Interpolation
    this.playerAnim = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      facing: 'down',
      squashX: 1,
      squashY: 1,
      walkProgress: 0,
      isMoving: false
    };

    // Kisten-Interpolation
    this.boxAnims = [];

    // Boden-Schleifspuren (Kratzer durch schwere Steinblöcke)
    this.scratches = [];

    // Partikelsystem (Staub, Magie-Funken, Sieges-Feuerwerk)
    this.particles = [];
    this.ambientParticles = [];

    // Screen-Shake (Kameraschock bei Kollision)
    this.shakeDuration = 0;
    this.shakeIntensity = 0;

    // Zeitmessung
    this.lastTime = performance.now();
    this.animSpeed = 0.18; // Lerp-Faktor

    // GPS Radar Overlay
    this.gpsOverlay = {
      enabled: true,
      accuracy: 0,
      relativeMeters: null
    };

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  loadImage(src) {
    const img = new Image();
    img.src = src;
    img.isLoaded = false;
    img.onload = () => { img.isLoaded = true; };
    return img;
  }

  attachEngine(engine) {
    this.engine = engine;
    this.initAnimations();
    this.handleResize();
  }

  initAnimations() {
    if (!this.engine) return;
    this.playerAnim = {
      x: this.engine.player.x,
      y: this.engine.player.y,
      targetX: this.engine.player.x,
      targetY: this.engine.player.y,
      facing: this.engine.player.facing,
      currentAngle: 0,
      targetAngle: 0,
      squashX: 1,
      squashY: 1,
      walkProgress: 0,
      isMoving: false
    };

    this.boxAnims = this.engine.boxes.map(b => ({
      x: b.x,
      y: b.y,
      targetX: b.x,
      targetY: b.y,
      isMoving: false
    }));

    this.scratches = [];
    this.ambientParticles = [];
  }

  // Setzt den Drehwinkel des Spielfelds (0°, 90°, 180°, 270°)
  setRotation(degrees) {
    this.rotation = (degrees % 360 + 360) % 360;
  }

  // Passt Canvas an Container-Größe an
  handleResize() {
    if (!this.canvas || !this.engine) return;

    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height || width);

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    const gridW = this.engine.width;
    const gridH = this.engine.height;
    const padding = 28;

    // Berücksichtige Drehung bei 90° oder 270° (Breite & Höhe tauschen)
    const isRotated = (this.rotation === 90 || this.rotation === 270);
    const effectiveGridW = isRotated ? gridH : gridW;
    const effectiveGridH = isRotated ? gridW : gridH;

    const maxTileW = (width - padding * 2) / effectiveGridW;
    const maxTileH = (height - padding * 2) / effectiveGridH;
    this.tileSize = Math.floor(Math.min(maxTileW, maxTileH, 76));

    this.offsetX = Math.floor((width - gridW * this.tileSize) / 2);
    this.offsetY = Math.floor((height - gridH * this.tileSize) / 2);
  }

  triggerScreenshake(intensity = 3, durationMs = 90) {
    this.shakeIntensity = intensity;
    this.shakeDuration = durationMs;
  }

  // Registriert Zug für flüssige Interpolation
  onMoveExecuted(moveResult) {
    if (moveResult.facing) {
      this.playerAnim.facing = moveResult.facing;
    }

    if (!moveResult.success) {
      this.triggerScreenshake(2.5, 80);
      return;
    }

    this.playerAnim.targetX = moveResult.playerTo.x;
    this.playerAnim.targetY = moveResult.playerTo.y;
    this.playerAnim.facing = moveResult.facing;
    this.playerAnim.isMoving = true;
    this.playerAnim.walkProgress = 1; // Schritt-Zyklus starten

    if (moveResult.pushedBox) {
      const dx = moveResult.boxTo.x - moveResult.boxFrom.x;
      const dy = moveResult.boxTo.y - moveResult.boxFrom.y;

      if (dx !== 0) {
        this.playerAnim.squashX = 0.85;
        this.playerAnim.squashY = 1.15;
      } else {
        this.playerAnim.squashX = 1.15;
        this.playerAnim.squashY = 0.85;
      }

      const boxAnim = this.boxAnims[moveResult.boxIndex];
      if (boxAnim) {
        boxAnim.targetX = moveResult.boxTo.x;
        boxAnim.targetY = moveResult.boxTo.y;
        boxAnim.isMoving = true;
      }

      this.addScratch(moveResult.boxFrom, moveResult.boxTo);
      this.spawnDustParticles(moveResult.boxFrom, moveResult.boxTo);
      this.triggerScreenshake(1.8, 60);

      if (this.engine.isGoal(moveResult.boxTo.x, moveResult.boxTo.y)) {
        this.spawnGoalSparkles(moveResult.boxTo.x, moveResult.boxTo.y);
      }
    }

    if (moveResult.win) {
      this.spawnVictoryFireworks();
    }
  }

  addScratch(from, to) {
    this.scratches.push({
      fromX: from.x,
      fromY: from.y,
      toX: to.x,
      toY: to.y,
      maxAge: 3500,
      age: 0
    });
  }

  spawnDustParticles(from, to) {
    const tier = this.engine.currentLevel ? this.engine.currentLevel.tier : 1;
    const tierColor = TIER_CONFIG[tier].color;

    const midX = (from.x + to.x) / 2 + 0.5;
    const midY = (from.y + to.y) / 2 + 0.5;

    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: midX + (Math.random() - 0.5) * 0.4,
        y: midY + (Math.random() - 0.5) * 0.4,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05 - 0.02,
        size: Math.random() * 3.5 + 1.5,
        color: Math.random() > 0.4 ? 'rgba(210, 190, 160, 0.8)' : tierColor,
        alpha: 0.9,
        maxLife: 600,
        life: 0
      });
    }
  }

  spawnGoalSparkles(gridX, gridY) {
    const tier = this.engine.currentLevel ? this.engine.currentLevel.tier : 1;
    const tierColor = TIER_CONFIG[tier].color;

    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const speed = Math.random() * 0.07 + 0.03;
      this.particles.push({
        x: gridX + 0.5,
        y: gridY + 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 2,
        color: tierColor,
        alpha: 1,
        maxLife: 850,
        life: 0
      });
    }
  }

  spawnVictoryFireworks() {
    const tier = this.engine.currentLevel ? this.engine.currentLevel.tier : 1;
    const tierCfg = TIER_CONFIG[tier];
    const colors = [tierCfg.color, tierCfg.accent, '#fef08a', '#ffffff', '#fbbf24'];

    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.14 + 0.05;
      this.particles.push({
        x: this.engine.width / 2,
        y: this.engine.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4.5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        maxLife: 1500,
        life: 0
      });
    }
  }

  // 60 FPS Render Pipeline mit AAA Next-Level Grafik
  render(time) {
    const dt = Math.min(32, time - this.lastTime);
    this.lastTime = time;

    if (!this.engine || !this.ctx) return;

    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;

    this.ctx.clearRect(0, 0, width, height);

    const tier = this.engine.currentLevel ? this.engine.currentLevel.tier : 1;
    const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG[1];

    // 1. KINEMATISCHER KAMMER-HINTERGRUND (Atmosphärische Raumtiefe)
    this.renderChamberBackground(tier, width, height);

    this.ctx.save();

    // 2. Screenshake bei Kollision
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const shakeX = (Math.random() * 2 - 1) * this.shakeIntensity;
      const shakeY = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.ctx.translate(shakeX, shakeY);
    }

    // 3. SPIELFELD-DREHUNG (Visuell um die Spielfigur / den Spieler drehen!)
    const playerCenterX = this.offsetX + (this.playerAnim.x + 0.5) * this.tileSize;
    const playerCenterY = this.offsetY + (this.playerAnim.y + 0.5) * this.tileSize;

    if (this.rotation !== 0) {
      this.ctx.translate(playerCenterX, playerCenterY);
      this.ctx.rotate(this.rotation * Math.PI / 180);
      this.ctx.translate(-playerCenterX, -playerCenterY);
    }

    // 4. Echte hochauflösende Bodenplatten mit Fugen & Tiefenlicht
    this.renderFloor(time, tier, tierCfg);

    // 5. 3D-Wand-Schlagschatten auf den Boden (Ambient Occlusion & Raumtiefe)
    this.renderWallShadows();

    // 6. Kisten-Schleifspuren (Kratzer im Stein)
    this.renderScratches(dt);

    // 7. Mystische Ziel-Altäre mit pulsierendem Runenlicht
    this.renderGoals(time, tier, tierCfg);

    // 8. Echte 3D-Felsmauern mit Licht- & Schattenkanten
    this.renderWalls(tier, tierCfg);

    // 9. Photorealistische 3D-Kisten & Steine (Unreal Engine 5 Sprites)
    this.renderBoxes(dt, tier, tierCfg);

    // 10. Echter animierter Abenteurer-Charakter
    this.renderPlayer(dt, time, tierCfg);

    // 11. Dynamisches Fackellicht / Radial-Beleuchtung um den Spieler
    this.renderTorchLight(time, tierCfg);

    // 12. Zug- & Siegespartikel
    this.renderParticles(dt);

    // 13. Schwebende Tier-Ambiente-Partikel (Sporen, Goldstaub, Kristalle, Funken, Glut)
    this.updateAmbientParticles(dt, tierCfg);
    this.renderAmbientParticles();

    this.ctx.restore();

    // 14. Antike Kompass-Rose oben rechts (zeigt immer echtes Nord & Feldausrichtung)
    this.renderCompassRose();
  }

  // Zeichnet den stimmungsvollen Hintergrund der Kammer
  renderChamberBackground(tier, width, height) {
    const bgImg = this.assets.backgrounds[tier];
    if (bgImg && bgImg.isLoaded) {
      this.ctx.drawImage(bgImg, 0, 0, width, height);
    } else {
      this.ctx.fillStyle = '#0a0910';
      this.ctx.fillRect(0, 0, width, height);
    }

    // Weiche radiale Vignette
    const vignette = this.ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.35,
      width / 2, height / 2, Math.max(width, height) * 0.75
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.72)');
    this.ctx.fillStyle = vignette;
    this.ctx.fillRect(0, 0, width, height);
  }

  // Zeichnet echte Steinplatten als Boden
  renderFloor(time, tier, tierCfg) {
    const { width, height } = this.engine;
    const floorImg = this.assets.floors[tier] || this.assets.floor;
    const s = this.tileSize;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.engine.staticGrid[y][x] !== CELL.WALL) {
          const px = this.offsetX + x * s;
          const py = this.offsetY + y * s;

          if (floorImg && floorImg.isLoaded) {
            this.ctx.drawImage(floorImg, px, py, s, s);
            this.ctx.fillStyle = 'rgba(10, 9, 16, 0.32)';
            this.ctx.fillRect(px, py, s, s);
          } else {
            this.ctx.fillStyle = (x + y) % 2 === 0 ? '#1a1924' : '#14131e';
            this.ctx.fillRect(px, py, s, s);
          }

          // Stein-Fugen
          this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
        }
      }
    }
  }

  // 3D-Schlagschatten der Mauern auf benachbarte Bodenfelder
  renderWallShadows() {
    const { width, height } = this.engine;
    const s = this.tileSize;
    const shadowSize = Math.max(6, Math.floor(s * 0.16));

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.engine.staticGrid[y][x] === CELL.WALL) {
          const px = this.offsetX + x * s;
          const py = this.offsetY + y * s;

          if (y + 1 < height && this.engine.staticGrid[y + 1][x] !== CELL.WALL) {
            this.ctx.fillRect(px, py + s, s, shadowSize);
          }
          if (x + 1 < width && this.engine.staticGrid[y][x + 1] !== CELL.WALL) {
            this.ctx.fillRect(px + s, py, shadowSize, s);
          }
        }
      }
    }
    this.ctx.restore();
  }

  // Zeichnet Schleifspuren im Steinboden
  renderScratches(dt) {
    for (let i = this.scratches.length - 1; i >= 0; i--) {
      const s = this.scratches[i];
      s.age += dt;
      if (s.age >= s.maxAge) {
        this.scratches.splice(i, 1);
        continue;
      }

      const alpha = (1 - s.age / s.maxAge) * 0.55;
      const x1 = this.offsetX + (s.fromX + 0.5) * this.tileSize;
      const y1 = this.offsetY + (s.fromY + 0.5) * this.tileSize;
      const x2 = this.offsetX + (s.toX + 0.5) * this.tileSize;
      const y2 = this.offsetY + (s.toY + 0.5) * this.tileSize;

      this.ctx.save();
      this.ctx.strokeStyle = `rgba(180, 155, 130, ${alpha})`;
      this.ctx.lineWidth = Math.max(3, this.tileSize * 0.22);
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  // Zeichnet Zielfelder als magische thematische Altäre
  renderGoals(time, tier, tierCfg) {
    const pulse = 0.55 + 0.35 * Math.sin(time * 0.0035);

    this.engine.goals.forEach(goal => {
      const cx = this.offsetX + (goal.x + 0.5) * this.tileSize;
      const cy = this.offsetY + (goal.y + 0.5) * this.tileSize;
      const r = this.tileSize * 0.4;

      this.ctx.save();

      // Äußerer Leuchtkranz
      this.ctx.strokeStyle = tierCfg.color;
      this.ctx.globalAlpha = pulse * 0.9;
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
      this.ctx.stroke();

      // Rotierende Runenpunkte
      const angleOffset = time * 0.0012;
      const pointCount = tier === 2 ? 8 : (tier === 5 ? 6 : 4);
      for (let i = 0; i < pointCount; i++) {
        const ang = angleOffset + (i * Math.PI * 2) / pointCount;
        const dotX = cx + Math.cos(ang) * (r * 0.72);
        const dotY = cy + Math.sin(ang) * (r * 0.72);
        this.ctx.fillStyle = tierCfg.accent;
        this.ctx.beginPath();
        this.ctx.arc(dotX, dotY, tier === 5 ? 3 : 2.2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Zentraler Altar-Stein mit Glow
      this.ctx.fillStyle = tierCfg.color;
      this.ctx.globalAlpha = pulse * 0.65;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  // Zeichnet echte 3D-Steinmauern passend zum Tier-Material
  renderWalls(tier, tierCfg) {
    const { width, height } = this.engine;
    const wallImg = this.assets.walls[tier] || this.assets.wall;
    const s = this.tileSize;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.engine.staticGrid[y][x] === CELL.WALL) {
          const px = this.offsetX + x * s;
          const py = this.offsetY + y * s;

          this.ctx.save();

          if (wallImg && wallImg.isLoaded) {
            // Echte Felswand-Textur
            this.ctx.drawImage(wallImg, px, py, s, s);

            // 3D-Lichtkanten (Ober- und Linkskante)
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
            this.ctx.fillRect(px, py, s, 3);
            this.ctx.fillRect(px, py, 3, s);

            // 3D-Tiefenschatten (Unter- und Rechtskante)
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            this.ctx.fillRect(px, py + s - 4, s, 4);
            this.ctx.fillRect(px + s - 4, py, 4, s);

            // Tier-Farbschimmer in der Felsmauer
            this.ctx.strokeStyle = tierCfg.accent;
            this.ctx.globalAlpha = 0.35;
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(px + 4, py + 4, s - 8, s - 8);
          } else {
            this.ctx.fillStyle = '#22212c';
            this.ctx.fillRect(px, py, s, s);
          }

          this.ctx.restore();
        }
      }
    }
  }

  // Zeichnet echte photorealistische 3D-Kisten / Steine (Unreal Engine 5 Sprites)
  renderBoxes(dt, tier, tierCfg) {
    const crateImg = this.assets.crates[tier] || this.assets.crate;
    const s = this.tileSize;

    this.engine.boxes.forEach((box, idx) => {
      let anim = this.boxAnims[idx];
      if (!anim) {
        anim = { x: box.x, y: box.y, targetX: box.x, targetY: box.y, isMoving: false };
        this.boxAnims[idx] = anim;
      }

      anim.x += (anim.targetX - anim.x) * this.animSpeed;
      anim.y += (anim.targetY - anim.y) * this.animSpeed;

      const px = this.offsetX + anim.x * s;
      const py = this.offsetY + anim.y * s;
      const pad = s * 0.04;
      const boxSize = s - pad * 2;
      const onGoal = this.engine.isGoal(box.x, box.y);

      this.ctx.save();

      // Weicher realistischer 3D-Schlagschatten unter der Kiste
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
      this.ctx.beginPath();
      this.ctx.ellipse(px + s * 0.5, py + s * 0.88, boxSize * 0.48, boxSize * 0.22, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Echte 3D-Kiste zeichnen
      if (crateImg && crateImg.isLoaded) {
        this.ctx.drawImage(crateImg, px + pad, py + pad, boxSize, boxSize);

        // Bei Zielerreichung: Magischer Leuchtkranz & Bloom-Glow
        if (onGoal) {
          this.ctx.save();
          this.ctx.shadowColor = tierCfg.color;
          this.ctx.shadowBlur = 18;
          this.ctx.strokeStyle = tierCfg.color;
          this.ctx.lineWidth = 3.5;
          this.ctx.strokeRect(px + pad + 1, py + pad + 1, boxSize - 2, boxSize - 2);

          this.ctx.fillStyle = tierCfg.accent;
          this.ctx.globalAlpha = 0.25;
          this.ctx.fillRect(px + pad, py + pad, boxSize, boxSize);
          this.ctx.restore();
        }
      } else {
        this.ctx.fillStyle = onGoal ? '#fbbf24' : '#854d0e';
        this.ctx.fillRect(px + pad, py + pad, boxSize, boxSize);
      }

      this.ctx.restore();
    });
  }

  // Dynamisches Fackellicht um den Spieler herum
  renderTorchLight(time, tierCfg) {
    if (!this.playerAnim) return;

    const px = this.offsetX + (this.playerAnim.x + 0.5) * this.tileSize;
    const py = this.offsetY + (this.playerAnim.y + 0.5) * this.tileSize;

    const flicker = 1 + 0.05 * Math.sin(time * 0.008) + 0.03 * Math.cos(time * 0.015);
    const radius = this.tileSize * 3.8 * flicker;

    this.ctx.save();
    const torchGrad = this.ctx.createRadialGradient(px, py, 10, px, py, radius);
    torchGrad.addColorStop(0, 'rgba(254, 240, 138, 0.14)');
    torchGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.07)');
    torchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = torchGrad;
    this.ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    this.ctx.restore();
  }

  // Schwebende Ambiente-Partikel aktualisieren
  updateAmbientParticles(dt, tierCfg) {
    const tier = tierCfg.tier || 1;
    const gridW = this.engine ? this.engine.width : 8;
    const gridH = this.engine ? this.engine.height : 8;

    if (this.ambientParticles.length < 32 && Math.random() < 0.35) {
      let pColor, pSize, pVx, pVy, pMaxLife;

      if (tier === 1) {
        // TIER 1: Grüne Waldsporen & Glühwürmchen
        pColor = Math.random() > 0.4 ? '#4ade80' : '#86efac';
        pSize = Math.random() * 2.5 + 1.2;
        pVx = (Math.random() - 0.5) * 0.015;
        pVy = -(Math.random() * 0.018 + 0.006);
        pMaxLife = 2200 + Math.random() * 1000;
      } else if (tier === 2) {
        // TIER 2: Goldener Wüstenstaub
        pColor = Math.random() > 0.3 ? '#fbbf24' : '#fef08a';
        pSize = Math.random() * 2.2 + 1.0;
        pVx = (Math.random() * 0.02 + 0.005);
        pVy = -(Math.random() * 0.014 + 0.004);
        pMaxLife = 2000 + Math.random() * 800;
      } else if (tier === 3) {
        // TIER 3: Violette Kristallsplitter
        pColor = Math.random() > 0.5 ? '#c084fc' : '#e9d5ff';
        pSize = Math.random() * 2.8 + 1.2;
        pVx = (Math.random() - 0.5) * 0.018;
        pVy = -(Math.random() * 0.022 + 0.008);
        pMaxLife = 1800 + Math.random() * 900;
      } else if (tier === 4) {
        // TIER 4: Schmiedefunken (Sparks)
        pColor = Math.random() > 0.5 ? '#f87171' : '#fb923c';
        pSize = Math.random() * 2.6 + 1.0;
        pVx = (Math.random() - 0.5) * 0.035;
        pVy = -(Math.random() * 0.035 + 0.012);
        pMaxLife = 1200 + Math.random() * 600;
      } else {
        // TIER 5: Magma-Embers & Vulkanasche
        pColor = Math.random() > 0.4 ? '#ff3b30' : (Math.random() > 0.5 ? '#ff8c00' : '#fee2e2');
        pSize = Math.random() * 3.2 + 1.5;
        pVx = (Math.random() - 0.5) * 0.025;
        pVy = -(Math.random() * 0.04 + 0.015);
        pMaxLife = 1800 + Math.random() * 1000;
      }

      this.ambientParticles.push({
        x: Math.random() * gridW,
        y: gridH + 0.4,
        vx: pVx,
        vy: pVy,
        size: pSize,
        color: pColor,
        life: 0,
        maxLife: pMaxLife,
        wiggle: Math.random() * Math.PI * 2
      });
    }

    for (let i = this.ambientParticles.length - 1; i >= 0; i--) {
      const p = this.ambientParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.ambientParticles.splice(i, 1);
        continue;
      }
      p.wiggle += dt * 0.003;
      p.x += p.vx + Math.sin(p.wiggle) * 0.004;
      p.y += p.vy;
    }
  }

  // Schwebende Ambiente-Partikel mit Additive Blending ('lighter') zeichnen
  renderAmbientParticles() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < this.ambientParticles.length; i++) {
      const p = this.ambientParticles[i];
      const alpha = Math.sin((p.life / p.maxLife) * Math.PI);
      const px = this.offsetX + p.x * this.tileSize;
      const py = this.offsetY + p.y * this.tileSize;

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.9));
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  // Dreht die Figur anhand des realen Smartphone-Kompasses
  setPlayerCompassAngle(degrees) {
    if (degrees !== null && degrees !== undefined && !isNaN(degrees)) {
      this.compassAngle = (degrees % 360 + 360) % 360;
    } else {
      this.compassAngle = null;
    }
  }

  setCompassHeadingAngle(degrees) {
    this.setPlayerCompassAngle(degrees);
  }

  // Zeichnet den echten animierten Geocacher-Charakter
  renderPlayer(dt, time, tierCfg) {
    const p = this.playerAnim;
    p.x += (p.targetX - p.x) * this.animSpeed;
    p.y += (p.targetY - p.y) * this.animSpeed;

    p.squashX += (1 - p.squashX) * 0.15;
    p.squashY += (1 - p.squashY) * 0.15;

    // Lauf-Animation (Bobbing & Schwingen)
    const distToTarget = Math.hypot(p.targetX - p.x, p.targetY - p.y);
    const isActuallyMoving = distToTarget > 0.02;

    let bobOffset = 0;
    let walkAngle = 0;
    if (isActuallyMoving) {
      p.walkProgress += dt * 0.015;
      bobOffset = Math.sin(p.walkProgress * Math.PI * 2) * (this.tileSize * 0.06);
      walkAngle = Math.sin(p.walkProgress * Math.PI) * 3; // Grad Wackeln beim Laufen
    }

    const cx = this.offsetX + (p.x + 0.5) * this.tileSize;
    const cy = this.offsetY + (p.y + 0.5) * this.tileSize + bobOffset;
    const s = this.tileSize * 0.95;

    const gridFacing = (this.engine && this.engine.player) ? this.engine.player.facing : (p.facing || 'down');

    // Blickrichtung auf dem Bildschirm unter Berücksichtigung der Spielfeld-Drehung berechnen
    const facingToAngle = { up: 0, right: 90, down: 180, left: 270 };
    const gridAngle = facingToAngle[gridFacing] !== undefined ? facingToAngle[gridFacing] : 180;
    const screenAngle = (gridAngle + this.rotation) % 360;

    let screenFacing = 'down';
    if (screenAngle >= 315 || screenAngle < 45) screenFacing = 'up';
    else if (screenAngle >= 45 && screenAngle < 135) screenFacing = 'right';
    else if (screenAngle >= 135 && screenAngle < 225) screenFacing = 'down';
    else if (screenAngle >= 225 && screenAngle < 315) screenFacing = 'left';

    this.ctx.save();
    this.ctx.translate(cx, cy);

    // Spielfigur immer zur Kamera / zum Spieler aufrecht ausrichten (kein Umkippen bei Felddrehung)
    if (this.rotation !== 0) {
      this.ctx.rotate(-this.rotation * Math.PI / 180);
    }

    if (walkAngle !== 0) {
      this.ctx.rotate(walkAngle * Math.PI / 180);
    }
    this.ctx.scale(p.squashX, p.squashY);

    // Warmes goldenes Heldenlicht am Boden (Aura)
    const auraGrad = this.ctx.createRadialGradient(0, s * 0.15, 3, 0, s * 0.15, s * 0.65);
    auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
    auraGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = auraGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, s * 0.15, s * 0.65, 0, Math.PI * 2);
    this.ctx.fill();

    // Weicher realistischer Kontaktschatten unter der Figur
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, s * 0.38, s * 0.35, s * 0.15, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Richtungs-Sprite passend zur visuellen Bildschirmausrichtung auswählen
    let sprite = this.assets.playerDown;
    if (screenFacing === 'up') sprite = this.assets.playerUp;
    else if (screenFacing === 'left') sprite = this.assets.playerLeft;
    else if (screenFacing === 'right') sprite = this.assets.playerRight;

    if (sprite && sprite.isLoaded) {
      // Echter detaillierter Abenteurer mit Ausrüstung & leuchtender Kontur
      const drawW = s * 0.88;
      const drawH = s * 1.08;
      this.ctx.save();
      // Brillanter goldener Leuchtakzent für maximale Sichtbarkeit auf jedem Boden
      this.ctx.shadowColor = 'rgba(251, 191, 36, 0.65)';
      this.ctx.shadowBlur = 12;
      this.ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
      this.ctx.restore();
    } else {
      // Fallback
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Leuchtender Sicht- & Richtungsanzeiger vor der Figur
    this.renderFacingIndicator(screenFacing, s);

    this.ctx.restore();
  }

  // Zeichnet einen edlen goldenen Richtungspfeil und Laternenlichtkegel vor der Figur
  renderFacingIndicator(screenFacing, s) {
    this.ctx.save();
    let angle = 0;
    if (screenFacing === 'right') angle = 0;
    else if (screenFacing === 'down') angle = Math.PI / 2;
    else if (screenFacing === 'left') angle = Math.PI;
    else if (screenFacing === 'up') angle = -Math.PI / 2;

    this.ctx.rotate(angle);
    const dist = s * 0.44;

    // 1. Laternen-Lichtkegel auf den Boden in Blickrichtung (beleuchtet das Zielfeld / die Kiste)
    const beamGrad = this.ctx.createRadialGradient(dist * 0.3, 0, 4, dist + s * 0.7, 0, s * 0.9);
    beamGrad.addColorStop(0, 'rgba(251, 191, 36, 0.42)');
    beamGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.22)');
    beamGrad.addColorStop(0.8, 'rgba(245, 158, 11, 0.08)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = beamGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(dist * 0.25, -s * 0.16);
    this.ctx.lineTo(dist + s * 0.85, -s * 0.52);
    this.ctx.lineTo(dist + s * 0.85, s * 0.52);
    this.ctx.lineTo(dist * 0.25, s * 0.16);
    this.ctx.closePath();
    this.ctx.fill();

    // 2. Pulsierender, strahlender Richtungs-Chevron (Pfeil)
    const pulse = Math.sin(performance.now() * 0.007) * (s * 0.04);
    const arrowDist = dist + pulse;

    this.ctx.shadowColor = '#f59e0b';
    this.ctx.shadowBlur = 14;
    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.moveTo(arrowDist + s * 0.30, 0);
    this.ctx.lineTo(arrowDist + s * 0.06, -s * 0.16);
    this.ctx.lineTo(arrowDist + s * 0.12, 0);
    this.ctx.lineTo(arrowDist + s * 0.06, s * 0.16);
    this.ctx.closePath();
    this.ctx.fill();

    // Goldene Kontur für maximalen Kontrast auf jedem Untergrund
    this.ctx.strokeStyle = '#b45309';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.restore();
  }

  // Partikel
  renderParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      const alpha = 1 - p.life / p.maxLife;

      const px = this.offsetX + p.x * this.tileSize;
      const py = this.offsetY + p.y * this.tileSize;

      this.ctx.save();
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  // GPS Radar & Genauigkeits-Aura
  renderGpsOverlay(time) {
    const cx = this.offsetX + (this.playerAnim.x + 0.5) * this.tileSize;
    const cy = this.offsetY + (this.playerAnim.y + 0.5) * this.tileSize;
    const radarR = (this.tileSize * Math.min(10, Math.max(2, this.gpsOverlay.accuracy || 4))) / 4;

    this.ctx.save();
    const pulse = Math.sin(time * 0.003) * 0.15 + 0.85;

    // Pulsierender Radar-Kreis
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, Math.min(radarR * pulse, this.tileSize * 3.5), 0, Math.PI * 2);
    this.ctx.stroke();

    // Sanfte Radar-Aura
    const radGrad = this.ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.min(radarR * pulse, this.tileSize * 3.5));
    radGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
    radGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    this.ctx.fillStyle = radGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, Math.min(radarR * pulse, this.tileSize * 3.5), 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // Zeichnet eine edle antike Kompass-Rose in der oberen rechten Ecke des Spielfelds
  renderCompassRose() {
    const ctx = this.ctx;
    const width = this.canvas.width / this.dpr;
    const r = 22;
    const cx = width - r - 14;
    const cy = r + 14;

    ctx.save();
    ctx.translate(cx, cy);

    // Hintergrund & Bronze-Rahmen
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Nord-Richtung unter Berücksichtigung der Spielfeld-Drehung
    // Bei rotation = 0 zeigt Norden nach oben (-90° in Standard-Canvas-Winkeln)
    const northRad = (-this.rotation) * Math.PI / 180;
    ctx.rotate(northRad);

    // Nord-Nadel (Leuchtend Rot)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -r + 4);
    ctx.lineTo(4, -1);
    ctx.lineTo(-4, -1);
    ctx.closePath();
    ctx.fill();

    // Süd-Nadel (Silber-Grau)
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(0, r - 4);
    ctx.lineTo(4, 1);
    ctx.lineTo(-4, 1);
    ctx.closePath();
    ctx.fill();

    // N-Buchstabe
    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('N', 0, -r + 4);

    ctx.restore();
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}

// --- Source: crypto.js ---
// ZERO-KNOWLEDGE KRYPTOTRESOR (WEB CRYPTO API)
// 256-Bit AES-GCM Entschlüsselung der Geocaching Final-Koordinaten
// Ersteller: versteckules


// Standard Test-Tresor (Wird mit dem Master-Key aller 15 Level entschlüsselt)
// Standard-Koordinaten: "N 50° 16.782 E 011° 55.430"
// Hinweis: "Das Geheimnis ruht am Fuß der alten Steinstele im Moosversteck."
const DEFAULT_CIPHER_DATA = {
  ivHex: "9853d256b228d223dfc5a9e0",
  ciphertextHex: "2f9ab662de435165f8960f0c478d088e7df7091ce991055faaf01e05f481a3648fc33607ea500f329b1f2e5aecc013e081f4a28422f41fde877f25d5febf836b6f2d1251d92830910d28059c035e2ed02f461f217971ac4685d69d1a0b6d674136b481d832e412b3bd17aefc06e06b8b48254110cf62b64367cfa25aa8f396dd0c8ebbb2045afd91b9f16b4a0346a579a16a5966952fcb6b266c7379eccf5ecc07612809c5fc"
};

class CryptoVault {
  constructor() {
    this.decryptedData = null;
  }

  // Konvertiert Hex-String zu Uint8Array
  static hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  // Konvertiert Uint8Array zu Hex-String
  static bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Leitet den 256-Bit Master-Key aus den 15 Level-Tokens ab
  static async deriveMasterKey(tokensMap) {
    const tokenList = [];
    for (let i = 0; i < LEVELS.length; i++) {
      const token = tokensMap[i];
      if (!token || token !== LEVELS[i].token) {
        throw new Error(`Token für Level ${i + 1} fehlt oder ist manipuliert.`);
      }
      tokenList.push(token);
    }

    const combined = tokenList.join('');
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(combined));

    return await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Verschlüsselt einen beliebigen Text mit den 15 Tokens (für das Entwickler-Tool)
  static async encryptPayload(payloadJsonString, tokensMap) {
    const key = await CryptoVault.deriveMasterKey(tokensMap);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(payloadJsonString)
    );

    return {
      ivHex: CryptoVault.bytesToHex(iv),
      ciphertextHex: CryptoVault.bytesToHex(new Uint8Array(ciphertextBuffer))
    };
  }

  // Entschlüsselt die Final-Koordinaten
  async unlockCoordinates(tokensMap, customCipher = null) {
    const cipherData = customCipher || DEFAULT_CIPHER_DATA;

    try {
      const key = await CryptoVault.deriveMasterKey(tokensMap);
      const iv = CryptoVault.hexToBytes(cipherData.ivHex);
      const ciphertext = CryptoVault.hexToBytes(cipherData.ciphertextHex);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      const jsonStr = decoder.decode(decryptedBuffer);
      const data = JSON.parse(jsonStr);

      this.decryptedData = data;
      return {
        success: true,
        coordinates: data.coordinates,
        hint: data.hint,
        creator: data.creator || 'versteckules'
      };
    } catch (err) {
      console.error('Tresor-Entschlüsselung fehlgeschlagen:', err);
      return {
        success: false,
        reason: 'Siegel beschädigt – Nicht alle 15 Fundamentsteine verifiziert!'
      };
    }
  }
}

// --- Source: main.js ---
// SOKOBAN MAIN CONTROLLER & APPLICATION LIFECYCLE
// Verbindet Engine, Renderer, GPS, Audio, UI & Krypto-Tresor
// Ersteller: versteckules


class SokobanApp {
  constructor() {
    this.engine = new SokobanEngine();
    this.audio = new AudioManager();
    this.gps = new GpsEngine();
    this.vault = new CryptoVault();
    this.renderer = null;

    this.currentScreen = 'landing';
    this.isReviewerMode = false;
    this.creatorTapCount = 0;
    this.creatorTapTimer = null;
    this.lastManualTurnTime = -999999;
    this.lastManualHeading = null;
    this.lastCompassHeading = null;
    this.hasActiveCompass = false;
    this.lastCompassTime = 0;
    this.orientationHandler = null;
    this.wakeLock = null;

    // DOM-Referenzen
    this.screens = {
      landing: document.getElementById('landing-screen'),
      pyramid: document.getElementById('pyramid-screen'),
      game: document.getElementById('game-screen')
    };

    this.canvas = document.getElementById('sokoban-canvas');
    this.pyramidGrid = document.getElementById('pyramid-grid');
    this.progressCount = document.getElementById('progress-count');
    this.progressBarFill = document.getElementById('progress-bar-fill');
    this.btnOpenVault = document.getElementById('btn-open-vault');
    this.vaultBannerStatus = document.getElementById('vault-banner-status');

    // HUD
    this.hudLevelTier = document.getElementById('hud-level-tier');
    this.hudLevelName = document.getElementById('hud-level-name');
    this.hudStepCount = document.getElementById('hud-step-count');
    this.hudPushCount = document.getElementById('hud-push-count');

    // Controls & Status
    this.gpsPill = document.getElementById('gps-pill');
    this.gpsPillText = document.getElementById('gps-pill-text');
    this.rotationVal = document.getElementById('rotation-val');
    this.btnTurnLeft = document.getElementById('btn-turn-left');
    this.btnStepForward = document.getElementById('btn-step-forward');
    this.btnTurnRight = document.getElementById('btn-turn-right');
    this.btnRotateField = document.getElementById('btn-rotate-field');
    this.touchDpadContainer = document.getElementById('touch-dpad-container');
    this.reviewerBanner = document.getElementById('reviewer-badge-banner');

    // Modals
    this.modalVictory = document.getElementById('modal-victory');
    this.modalVault = document.getElementById('modal-vault');
    this.modalRules = document.getElementById('modal-rules');

    this.init();
  }

  init() {
    // 1. Renderer initialisieren
    this.renderer = new SokobanRenderer(this.canvas);
    this.renderer.attachEngine(this.engine);

    // 2. Audio & GPS Callbacks
    this.setupGpsCallbacks();

    // 3. Reviewer-Check über URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'reviewer' || urlParams.get('reviewer') === 'true') {
      this.activateReviewerMode();
    }

    // 4. Event-Listener registrieren
    this.bindEvents();

    // 5. Pyramiden-Übersicht vorrendern
    this.renderPyramid();

    // 6. 60 FPS Render-Loop starten
    this.startRenderLoop();
  }

  // Bindet alle UI- & Tastatur-Events
  bindEvents() {
    // Audio Mute Toggle
    document.getElementById('btn-audio-toggle').addEventListener('click', () => {
      this.audio.init();
      const muted = this.audio.toggleMute();
      document.getElementById('audio-icon').textContent = muted ? '🔇' : '🔊';
      this.engine.progress.audioMuted = muted;
      this.engine.saveProgress();
    });

    // Landing Screen Buttons
    document.getElementById('btn-enter-pyramid').addEventListener('click', () => {
      this.audio.init();
      this.audio.startMusic();
      this.requestSensorPermissions();
      this.showScreen('pyramid');
    });

    // FAQ & Anleitung Modals
    const openFaq = () => {
      this.modalRules.classList.add('active');
    };
    const closeFaq = () => {
      this.modalRules.classList.remove('active');
    };

    const btnOpenRules = document.getElementById('btn-open-rules');
    if (btnOpenRules) btnOpenRules.addEventListener('click', openFaq);

    const btnGlobalFaq = document.getElementById('btn-global-faq');
    if (btnGlobalFaq) btnGlobalFaq.addEventListener('click', openFaq);

    const btnGpsHelp = document.getElementById('btn-gps-help');
    if (btnGpsHelp) btnGpsHelp.addEventListener('click', openFaq);

    const btnCloseRules = document.getElementById('btn-close-rules');
    if (btnCloseRules) btnCloseRules.addEventListener('click', closeFaq);

    const btnCloseRulesX = document.getElementById('btn-close-rules-x');
    if (btnCloseRulesX) btnCloseRulesX.addEventListener('click', closeFaq);

    this.modalRules.addEventListener('click', (e) => {
      if (e.target === this.modalRules) closeFaq();
    });

    // 10x Klick auf das Bild in der Mitte (Hauptbild) schaltet den Reviewer-Modus frei
    let heroClicks = 0;
    let heroTimer = null;
    const triggerHeroClick = () => {
      heroClicks++;
      clearTimeout(heroTimer);
      if (heroClicks >= 10) {
        this.activateReviewerMode();
        heroClicks = 0;
      } else {
        heroTimer = setTimeout(() => { heroClicks = 0; }, 3500);
      }
    };

    const heroWrap = document.getElementById('hero-img-wrap');
    if (heroWrap) heroWrap.addEventListener('click', triggerHeroClick);
    const heroImg = document.getElementById('hero-img');
    if (heroImg) heroImg.addEventListener('click', triggerHeroClick);

    // Spielstand komplett zurücksetzen (Cookies/LocalStorage löschen)
    const btnResetSave = document.getElementById('btn-reset-save');
    if (btnResetSave) {
      btnResetSave.addEventListener('click', () => {
        if (confirm('Möchtest du deinen gesamten Spielfortschritt wirklich löschen und alle Level zurücksetzen?')) {
          localStorage.removeItem('sokoban_pyramid_save');
          this.engine.progress = {
            completedLevels: [],
            unlockedLevels: [0, 1, 2, 3, 4],
            levelTokens: {},
            audioMuted: false,
            tileSize: 4.0
          };
          this.engine.saveProgress();
          this.renderPyramid();
          this.showMessageToast('Spielfortschritt komplett zurückgesetzt!');
        }
      });
    }

    // Navigation zwischen Pyramide & Landing
    document.getElementById('btn-back-to-landing').addEventListener('click', () => {
      this.showScreen('landing');
    });

    // Level verlassen
    document.getElementById('btn-leave-level').addEventListener('click', () => {
      this.gps.stopTracking();
      this.showScreen('pyramid');
      this.renderPyramid();
    });

    // In-Game Aktionen: Undo & Reset
    document.getElementById('btn-undo').addEventListener('click', () => this.handleUndo());
    document.getElementById('btn-reset').addEventListener('click', () => this.handleReset());

    // SPIELSTEUERUNG (Buttons unter dem Spielfeld)
    if (this.btnTurnLeft) {
      this.btnTurnLeft.addEventListener('click', () => {
        this.requestSensorPermissions();
        this.turnPlayerRelative(true); // 90° nach links drehen
        const dirNames = { up: 'NORD (▲)', right: 'OST (▶)', down: 'SÜD (▼)', left: 'WEST (◀)' };
        this.showMessageToast(`🧭 Blickrichtung: ${dirNames[this.engine.player.facing] || this.engine.player.facing}`);
      });
    }

    if (this.btnTurnRight) {
      this.btnTurnRight.addEventListener('click', () => {
        this.requestSensorPermissions();
        this.turnPlayerRelative(false); // 90° nach rechts drehen
        const dirNames = { up: 'NORD (▲)', right: 'OST (▶)', down: 'SÜD (▼)', left: 'WEST (◀)' };
        this.showMessageToast(`🧭 Blickrichtung: ${dirNames[this.engine.player.facing] || this.engine.player.facing}`);
      });
    }

    if (this.btnStepForward) {
      this.btnStepForward.addEventListener('click', () => {
        this.requestSensorPermissions();
        if (this.isReviewerMode) {
          // Im Reviewer-Modus: Schritt vorwärts ausführen
          if (this.engine && this.engine.player) {
            this.executeMove(this.engine.player.facing);
          }
        } else {
          // Im normalen Outdoor-Modus: GPS-Referenzpunkt "Hier verankern"
          this.gps.resetStepOrigin();
          this.audio.playStep();
          this.showMessageToast('🎯 GPS-Startpunkt hier verankert! Laufe in Blickrichtung los.');
        }
      });
    }

    if (this.btnRotateField) {
      this.btnRotateField.addEventListener('click', () => this.rotateField());
    }

    // Direktes Antippen des Spielfelds (Im Outdoor-Modus: Blick drehen | Im Reviewer-Modus: Bewegen)
    if (this.canvas) {
      this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    // Tastatursteuerung: WASD / Pfeiltasten sind NUR im Reviewer-/Entwicklermodus aktiv!
    window.addEventListener('keydown', (e) => {
      if (this.currentScreen !== 'game' || !this.engine || !this.engine.player) return;

      const key = e.key.toLowerCase();

      // Undo & Reset funktionieren immer
      if (key === 'z') {
        e.preventDefault();
        this.handleUndo();
        return;
      } else if (key === 'r') {
        e.preventDefault();
        this.handleReset();
        return;
      }

      const isMoveKey = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' ', 'spacebar', 'enter', 'q', 'e'].includes(key);
      if (isMoveKey) {
        if (!this.isReviewerMode) {
          // Im normalen Outdoor-Modus: Tastatur ist gesperrt!
          e.preventDefault();
          this.showMessageToast('🚶 Outdoor-Modus aktiv: Bewege dich im echten Leben, um die Figur zu steuern!');
          return;
        }

        // --- ENTWICKLER- / REVIEWER-MODUS ---
        if (key === 'arrowup' || key === 'w') {
          e.preventDefault();
          this.executeMove(this.screenDirToGrid('up'));
        } else if (key === 'arrowdown' || key === 's') {
          e.preventDefault();
          this.executeMove(this.screenDirToGrid('down'));
        } else if (key === 'arrowleft' || key === 'a') {
          e.preventDefault();
          this.executeMove(this.screenDirToGrid('left'));
        } else if (key === 'arrowright' || key === 'd') {
          e.preventDefault();
          this.executeMove(this.screenDirToGrid('right'));
        } else if (key === ' ' || key === 'spacebar' || key === 'enter') {
          e.preventDefault();
          this.executeMove(this.engine.player.facing);
        } else if (key === 'q') {
          e.preventDefault();
          this.turnPlayerRelative(true);
        } else if (key === 'e') {
          e.preventDefault();
          this.turnPlayerRelative(false);
        }
      }
    });

    // Touch D-Pad Buttons (Direktes Bewegen & Schieben in alle 4 Richtungen)
    const bindTouch = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = (e) => {
        e.preventDefault();
        action();
      };
      el.addEventListener('touchstart', handler, { passive: false });
      el.addEventListener('click', handler);
    };

    bindTouch('btn-touch-up', () => { if (this.isReviewerMode) this.executeMove(this.screenDirToGrid('up')); });
    bindTouch('btn-touch-down', () => { if (this.isReviewerMode) this.executeMove(this.screenDirToGrid('down')); });
    bindTouch('btn-touch-left', () => { if (this.isReviewerMode) this.executeMove(this.screenDirToGrid('left')); });
    bindTouch('btn-touch-right', () => { if (this.isReviewerMode) this.executeMove(this.screenDirToGrid('right')); });
    bindTouch('btn-touch-center', () => { if (this.isReviewerMode) this.executeMove(this.engine.player.facing); });
    bindTouch('btn-touch-undo', () => this.handleUndo());
    bindTouch('btn-touch-reset', () => this.handleReset());

    // Victory Modal Buttons
    document.getElementById('btn-victory-pyramid').addEventListener('click', () => {
      this.modalVictory.classList.remove('active');
      this.showScreen('pyramid');
      this.renderPyramid();
    });

    document.getElementById('btn-victory-next').addEventListener('click', () => {
      this.modalVictory.classList.remove('active');
      const nextIndex = this.engine.currentLevelIndex + 1;
      if (nextIndex < LEVELS.length && this.engine.isLevelUnlocked(nextIndex)) {
        this.startLevel(nextIndex);
      } else {
        this.showScreen('pyramid');
        this.renderPyramid();
      }
    });

    // Vault Modal Button & Kopieren
    this.btnOpenVault.addEventListener('click', () => this.openFinalVault());
    document.getElementById('btn-close-vault').addEventListener('click', () => {
      this.modalVault.classList.remove('active');
    });

    document.getElementById('btn-copy-coords').addEventListener('click', () => {
      const text = document.getElementById('final-coordinates-text').textContent;
      navigator.clipboard.writeText(text).then(() => {
        const fb = document.getElementById('copy-feedback');
        fb.style.display = 'block';
        setTimeout(() => fb.style.display = 'none', 2500);
      });
    });

    // Reale Smartphone-Kompass-Erkennung (Drehung im Freien)
    let hasAbsoluteOrientation = false;

    this.orientationHandler = (e, isAbsolute = false) => {
      if (this.currentScreen !== 'game' || !this.engine || !this.engine.player) return;

      // Auf Android: Sobald deviceorientationabsolute läuft, relatives deviceorientation ignorieren!
      if (!isAbsolute && hasAbsoluteOrientation && e.webkitCompassHeading === undefined) {
        return;
      }
      if (isAbsolute) {
        hasAbsoluteOrientation = true;
      }

      const heading = this.calculateHeading(e);
      if (heading === null || isNaN(heading)) return;

      const now = performance.now();

      // Wenn der Spieler vor kurzem manuell gedreht hat:
      // Hebe die manuelle Sperre sofort auf, sobald eine echte Körperdrehung von mindestens 25° stattfindet!
      if (this.lastManualHeading !== null) {
        const turnDiff = Math.abs(heading - this.lastManualHeading);
        const normTurnDiff = Math.min(turnDiff, 360 - turnDiff);
        if (normTurnDiff >= 25) {
          this.lastManualTurnTime = -999999;
          this.lastManualHeading = null;
        }
      }

      if (now - this.lastManualTurnTime < 3000) return;

      this.hasActiveCompass = true;
      this.lastCompassTime = now;

      // Zitter-Filter: Micro-Bewegungen unter 2.5 Grad dämpfen
      if (this.lastCompassHeading !== null) {
        const diff = Math.abs(heading - this.lastCompassHeading);
        const normDiff = Math.min(diff, 360 - diff);
        if (normDiff < 2.5) return;
      }
      this.lastCompassHeading = heading;

      // Felddrehung berücksichtigen
      const fieldRot = this.renderer ? this.renderer.rotation : 0;
      const gridAngle = (heading - fieldRot + 360) % 360;

      const newFacing = this.angleToDirection(gridAngle, this.engine.player.facing);
      if (newFacing !== this.engine.player.facing) {
        this.engine.player.facing = newFacing;
        if (this.renderer && this.renderer.playerAnim) {
          this.renderer.playerAnim.facing = newFacing;
        }
        if (this.gps) {
          this.gps.onDirectionChanged(newFacing);
        }
        const dirNames = { up: 'NORD (▲)', right: 'OST (▶)', down: 'SÜD (▼)', left: 'WEST (◀)' };
        this.showMessageToast(`🧭 Kompass: ${dirNames[newFacing] || newFacing}`);
      }

      if (this.renderer) {
        this.renderer.setCompassHeadingAngle(gridAngle);
      }
    };

    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', (e) => this.orientationHandler(e, true), true);
    }
    window.addEventListener('deviceorientation', (e) => this.orientationHandler(e, false), true);

    const enterBtn = document.getElementById('btn-enter-pyramid');
    if (enterBtn) enterBtn.addEventListener('click', () => this.requestSensorPermissions(), { once: true });
    if (this.canvas) {
      this.canvas.addEventListener('touchstart', () => this.requestSensorPermissions(), { once: true, passive: true });
    }

    // WakeLock wiederherstellen, wenn der Nutzer zum Browser zurückkehrt
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.currentScreen === 'game') {
        this.requestWakeLock();
      }
    });
  }

  // Berechnet die Himmelsrichtung (0° = Nord, 90° = Ost, 180° = Süd, 270° = West)
  // Unterstützt iOS (webkitCompassHeading) & Android (deviceorientationabsolute mit 3D-Neigungskompensation)
  calculateHeading(e) {
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
      return e.webkitCompassHeading;
    }

    if (typeof e.alpha === 'number' && !isNaN(e.alpha)) {
      const alpha = e.alpha;
      const beta = e.beta || 0;
      const gamma = e.gamma || 0;

      // 3D-Neigungskompensation für typische Handhaltung (gekippt um 30°-70°)
      const degToRad = Math.PI / 180;
      const a = alpha * degToRad;
      const b = beta * degToRad;
      const g = gamma * degToRad;

      const cA = Math.cos(a), sA = Math.sin(a);
      const cB = Math.cos(b), sB = Math.sin(b);
      const cG = Math.cos(g), sG = Math.sin(g);

      // Vektor der Smartphone-Oberkante projiziert auf die Horizontebene
      // Vx = Ost-Komponente, Vy = Nord-Komponente
      const Vx = -cA * sG - sA * sB * cG;
      const Vy = -sA * sG + cA * sB * cG;

      if (Math.abs(Vx) > 0.05 || Math.abs(Vy) > 0.05) {
        let heading = Math.atan2(Vx, Vy) * (180 / Math.PI);
        if (heading < 0) heading += 360;
        return heading;
      }

      return (360 - alpha + 360) % 360;
    }

    return null;
  }

  // Fragt Sensor-Berechtigungen (iOS Safari) für Kompass und Pedometer-Beschleunigungsmesser ab
  requestSensorPermissions() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(res => {
        if (res === 'granted' && this.orientationHandler) {
          if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', (e) => this.orientationHandler(e, true), true);
          }
          window.addEventListener('deviceorientation', (e) => this.orientationHandler(e, false), true);
        }
      }).catch(() => {});
    }
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().then(res => {
        if (res === 'granted' && this.gps) {
          this.gps.startMotionStepSensor();
        }
      }).catch(() => {});
    }
  }

  // Mappt Bildschirm-Richtungen ('up', 'right', 'down', 'left') auf das interne Gitter unter Felddrehung
  screenDirToGrid(screenDir) {
    const rot = this.renderer ? this.renderer.rotation : 0;
    if (rot === 0) return screenDir;
    const dirs = ['up', 'right', 'down', 'left'];
    const sIdx = dirs.indexOf(screenDir);
    if (sIdx === -1) return screenDir;
    const steps = Math.round(rot / 90);
    const gIdx = (sIdx - steps + 4) % 4;
    return dirs[gIdx];
  }

  // Mappt GPS-Himmelsrichtung (Peilung 0°-360°) unter Felddrehung auf interne Gitter-Richtung ('up', 'right', 'down', 'left')
  bearingToGridDir(bearing) {
    if (typeof bearing === 'string') {
      return this.screenDirToGrid(bearing);
    }
    if (typeof bearing !== 'number' || isNaN(bearing)) {
      return this.engine && this.engine.player ? this.engine.player.facing : 'up';
    }
    const fieldRot = this.renderer ? this.renderer.rotation : 0;
    const relAngle = (bearing - fieldRot + 360) % 360;
    if (relAngle >= 45 && relAngle < 135) return 'right';
    if (relAngle >= 135 && relAngle < 225) return 'down';
    if (relAngle >= 225 && relAngle < 315) return 'left';
    return 'up';
  }

  // GPS & Bewegungssensor Callbacks
  setupGpsCallbacks() {
    this.gps.onStepTriggered = (bearing, distance) => {
      if (this.currentScreen === 'game' && this.engine && this.engine.player) {
        // Echter Schritt im Freien per Sensor-Fusion (Pedometer + GPS):
        // Die Bewegung erfolgt IMMER in die sichtbare Blickrichtung des Spielers!
        const targetDir = this.engine.player.facing;
        const dirNames = { up: 'NORD (▲)', right: 'OST (▶)', down: 'SÜD (▼)', left: 'WEST (◀)' };
        this.showMessageToast(`🚶 Schritt: ${dirNames[targetDir] || targetDir}`);
        this.executeMove(targetDir);
      }
    };

    this.gps.onStatusChange = (status, msg) => {
      if (this.gpsPill) {
        this.gpsPill.className = `pill pill-gps ${status}`;
      }
      if (this.gpsPillText) {
        this.gpsPillText.textContent = msg || (status === 'locked' ? 'GPS aktiv' : (status === 'searching' ? 'GPS sucht...' : 'GPS bereit'));
      }
    };
  }

  // Mappt einen kontinuierlichen Kompass-Winkel auf 4 Quadranten mit Hysterese-Puffer gegen Flackern
  angleToDirection(angle, currentFacing) {
    const h = 12; // 12 Grad Hysterese-Puffer gegen Flackern an den Quadranten-Grenzen
    const norm = (angle + 360) % 360;

    if (currentFacing === 'up') {
      if (norm < 45 + h || norm > 315 - h) return 'up';
      if (norm >= 45 + h && norm < 135) return 'right';
      if (norm >= 135 && norm < 225) return 'down';
      return 'left';
    }
    if (currentFacing === 'right') {
      if (norm >= 45 - h && norm < 135 + h) return 'right';
      if (norm >= 135 + h && norm < 225) return 'down';
      if (norm >= 225 && norm < 315) return 'left';
      return 'up';
    }
    if (currentFacing === 'down') {
      if (norm >= 135 - h && norm < 225 + h) return 'down';
      if (norm >= 225 + h && norm < 315) return 'left';
      if (norm >= 315 || norm < 45) return 'up';
      return 'right';
    }
    if (currentFacing === 'left') {
      if (norm >= 225 - h && norm < 315 + h) return 'left';
      if (norm >= 315 + h || norm < 45) return 'up';
      if (norm >= 45 && norm < 135) return 'right';
      return 'down';
    }

    if (norm >= 45 && norm < 135) return 'right';
    if (norm >= 135 && norm < 225) return 'down';
    if (norm >= 225 && norm < 315) return 'left';
    return 'up';
  }

  // Dreht die Figur bildschirmsensitiv nach links oder rechts
  turnPlayer(direction = false) {
    if (!this.engine || !this.engine.player) return;

    if (typeof direction === 'string') {
      const targetFacing = this.screenDirToGrid(direction);
      this.engine.player.facing = targetFacing;
      if (this.renderer && this.renderer.playerAnim) {
        this.renderer.playerAnim.facing = targetFacing;
      }
      this.lastManualTurnTime = performance.now();
      this.lastManualHeading = this.lastCompassHeading;
      this.audio.playStep();
      this.updateHudStats();
      if (this.gps) this.gps.onDirectionChanged(targetFacing);
      return;
    }

    this.turnPlayerRelative(!direction);
  }

  // Dreht die Figur relativ um 90°
  turnPlayerRelative(counterClockwise = false) {
    if (!this.engine || !this.engine.player) return;
    const dirs = ['up', 'right', 'down', 'left'];
    const curIdx = dirs.indexOf(this.engine.player.facing);
    const nextIdx = (curIdx + (counterClockwise ? 3 : 1)) % 4;
    const newFacing = dirs[nextIdx];
    this.engine.player.facing = newFacing;
    if (this.renderer && this.renderer.playerAnim) {
      this.renderer.playerAnim.facing = newFacing;
    }
    this.lastManualTurnTime = performance.now();
    this.lastManualHeading = this.lastCompassHeading;
    this.audio.playStep();
    this.updateHudStats();
    if (this.gps) {
      this.gps.onDirectionChanged(newFacing);
    }
  }

  // Dreht die Figur um 180° um
  turnPlayerAround() {
    if (!this.engine || !this.engine.player) return;
    const dirs = ['up', 'right', 'down', 'left'];
    const curIdx = dirs.indexOf(this.engine.player.facing);
    const nextIdx = (curIdx + 2) % 4;
    const newFacing = dirs[nextIdx];
    this.engine.player.facing = newFacing;
    if (this.renderer && this.renderer.playerAnim) {
      this.renderer.playerAnim.facing = newFacing;
    }
    this.lastManualTurnTime = performance.now();
    this.lastManualHeading = this.lastCompassHeading;
    this.audio.playStep();
    this.updateHudStats();
    if (this.gps) {
      this.gps.onDirectionChanged(newFacing);
    }
  }

  // Rotiert das gesamte Spielfeld um die Figur um 90°
  rotateField() {
    if (!this.renderer) return;
    const nextAngle = (this.renderer.rotation + 90) % 360;
    this.renderer.setRotation(nextAngle);
    if (this.rotationVal) {
      this.rotationVal.textContent = `${nextAngle}°`;
    }

    // Wenn der Kompass aktiv ist: Ausrichtung an das gedrehte Feld anpassen
    if (this.lastCompassHeading !== null && this.engine && this.engine.player) {
      const gridAngle = (this.lastCompassHeading - nextAngle + 360) % 360;
      const newFacing = this.angleToDirection(gridAngle, this.engine.player.facing);
      if (newFacing !== this.engine.player.facing) {
        this.engine.player.facing = newFacing;
        if (this.renderer.playerAnim) this.renderer.playerAnim.facing = newFacing;
        if (this.gps) this.gps.onDirectionChanged(newFacing);
      }
      this.renderer.setCompassHeadingAngle(gridAngle);
    }

    this.audio.playStep();
    this.updateHudStats();
  }

  // Tippen auf das Spielfeld: 1-Klick Drehen & Laufen / Kiste schieben!
  handleCanvasClick(e) {
    if (this.currentScreen !== 'game' || !this.engine || !this.renderer) return;

    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Drehung um die Spielfigur berücksichtigen
    const playerCenterX = this.renderer.offsetX + (this.engine.player.x + 0.5) * this.renderer.tileSize;
    const playerCenterY = this.renderer.offsetY + (this.engine.player.y + 0.5) * this.renderer.tileSize;

    const dx = clickX - playerCenterX;
    const dy = clickY - playerCenterY;
    const rad = -this.renderer.rotation * (Math.PI / 180);
    const unrotX = dx * Math.cos(rad) - dy * Math.sin(rad);
    const unrotY = dx * Math.sin(rad) + dy * Math.cos(rad);

    let targetDir = null;
    if (Math.abs(unrotX) >= Math.abs(unrotY) && Math.abs(unrotX) > this.renderer.tileSize * 0.25) {
      targetDir = unrotX > 0 ? 'right' : 'left';
    } else if (Math.abs(unrotY) > Math.abs(unrotX) && Math.abs(unrotY) > this.renderer.tileSize * 0.25) {
      targetDir = unrotY > 0 ? 'down' : 'up';
    }

    if (targetDir) {
      const gridDir = this.screenDirToGrid(targetDir);
      if (this.isReviewerMode) {
        // Im Reviewer-Modus: Schritt & Kiste schieben
        this.executeMove(gridDir);
      } else {
        // Im normalen Outdoor-Modus: Blick & Laterne drehen & sofortiges Feedback
        if (this.engine.player.facing !== gridDir) {
          this.engine.player.facing = gridDir;
          if (this.renderer && this.renderer.playerAnim) {
            this.renderer.playerAnim.facing = gridDir;
          }
          this.lastManualTurnTime = performance.now();
          this.lastManualHeading = this.lastCompassHeading;
          this.audio.playStep();
          this.updateHudStats();
          if (this.gps) {
            this.gps.onDirectionChanged(gridDir);
          }
          const dirNames = { up: 'NORD (▲)', right: 'OST (▶)', down: 'SÜD (▼)', left: 'WEST (◀)' };
          this.showMessageToast(`🧭 Blickrichtung: ${dirNames[gridDir] || gridDir}`);
        }
      }
    }
  }

  // Wechselt zwischen den Screens
  showScreen(screenName) {
    this.currentScreen = screenName;
    Object.keys(this.screens).forEach(key => {
      if (key === screenName) {
        this.screens[key].classList.add('active');
      } else {
        this.screens[key].classList.remove('active');
      }
    });

    if (screenName === 'game') {
      this.renderer.handleResize();
      this.gps.startTracking();
      this.requestWakeLock();
    } else {
      this.gps.stopTracking();
      this.releaseWakeLock();
    }
  }

  // Startet ein bestimmtes Level
  startLevel(levelIndex) {
    if (!this.engine.isLevelUnlocked(levelIndex)) {
      alert('Dieser Stein ist noch versiegelt! Löse zuerst beide Fundamentsteine darunter.');
      return;
    }

    this.engine.loadLevel(levelIndex);
    this.renderer.initAnimations();
    this.renderer.handleResize();

    // HUD aktualisieren
    const tier = this.engine.currentLevel.tier;
    const tierCfg = TIER_CONFIG[tier];
    this.hudLevelTier.textContent = `Tier ${tier} (${tierCfg.name})`;
    this.hudLevelTier.className = `tier-badge tier-${tier}`;
    this.hudLevelName.textContent = `Level ${this.engine.currentLevel.id}: ${this.engine.currentLevel.name}`;

    // Neues Ambiente dynamisch auf Screen & Body setzen
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.dataset.tier = tier;
    document.body.dataset.activeTier = tier;

    const ambientEl = document.getElementById('hud-level-ambient');
    if (ambientEl) {
      ambientEl.textContent = `${tierCfg.icon || '✦'} ${tierCfg.ambienceName || tierCfg.name}`;
      ambientEl.className = `hud-ambient-text tier-${tier}`;
    }

    this.updateHudStats();
    this.showScreen('game');
  }

  // Führt einen Spielzug aus
  executeMove(direction) {
    if (!this.engine || !this.engine.currentLevel) return;

    const res = this.engine.move(direction);
    this.renderer.onMoveExecuted(res);
    this.gps.resetStepOrigin(); // Referenzpunkt für nächsten Schritt synchronisieren

    if (res.success) {
      if (res.win) {
        this.audio.playWin();
        this.handleWin();
      } else if (res.pushedBox) {
        if (this.engine.isGoal(res.boxTo.x, res.boxTo.y)) {
          this.audio.playBoxOnGoal();
        } else {
          this.audio.playPush();
        }
      } else {
        this.audio.playStep();
      }
    } else {
      // Kollision gegen Wand oder blockierte Kiste
      this.audio.playBump();
      this.gps.triggerCollisionHaptic();
      if (res.reason === 'wall') {
        this.showMessageToast('🧱 Wand im Weg! Drehe dich mit Links/Rechts');
      } else if (res.reason === 'blocked_box') {
        this.showMessageToast('📦 Kiste blockiert! Kann nicht geschoben werden');
      }
    }

    this.updateHudStats();
  }

  handleUndo() {
    const res = this.engine.undo();
    if (res.success) {
      this.audio.playUndo();
      this.renderer.initAnimations();
      this.updateHudStats();
    }
  }

  handleReset() {
    this.engine.reset();
    this.renderer.initAnimations();
    this.updateHudStats();
    this.showMessageToast('Level zurückgesetzt');
  }

  updateHudStats() {
    this.hudStepCount.textContent = this.engine.stepCount;
    this.hudPushCount.textContent = this.engine.pushCount;

    const facingEl = document.getElementById('hud-facing-label');
    if (facingEl && this.engine && this.engine.player) {
      const facingMap = {
        up: '⬆ Nord',
        right: '➔ Ost',
        down: '⬇ Süd',
        left: '⬅ West'
      };
      facingEl.textContent = facingMap[this.engine.player.facing] || this.engine.player.facing;
    }
  }

  // Behandelt den Sieg eines Levels
  handleWin() {
    setTimeout(() => {
      document.getElementById('victory-level-name').textContent = `Level ${this.engine.currentLevel.id}: ${this.engine.currentLevel.name}`;
      document.getElementById('victory-steps').textContent = this.engine.stepCount;
      document.getElementById('victory-pushes').textContent = this.engine.pushCount;
      const completedCount = this.engine.progress.completedLevels.length;
      document.getElementById('victory-token').textContent = `Gespeichert (${completedCount}/15)`;
      this.modalVictory.classList.add('active');

      // Prüfen ob alle 15 gelöst
      if (this.engine.areAllLevelsCompleted()) {
        setTimeout(() => this.openFinalVault(), 1200);
      }
    }, 400);
  }

  // Rendert die 15-Level-Pyramide (5-4-3-2-1)
  renderPyramid() {
    this.pyramidGrid.innerHTML = '';

    // Die 5 Stufen der Pyramide (Index-Gruppierung von Spitze nach Basis)
    const tiersStructure = [
      [14],                 // Stufe 5: Extrem (Level 15)
      [12, 13],             // Stufe 4: Sehr hoch (Level 13-14)
      [9, 10, 11],          // Stufe 3: Hoch (Level 10-12)
      [5, 6, 7, 8],         // Stufe 2: Mittel (Level 6-9)
      [0, 1, 2, 3, 4]       // Stufe 1: Leicht (Level 1-5 Basis)
    ];

    tiersStructure.forEach((rowIndices, rowIdx) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'pyramid-row';

      rowIndices.forEach(levelIndex => {
        const lvl = LEVELS[levelIndex];
        const isCompleted = this.engine.progress.completedLevels.includes(levelIndex);
        const isUnlocked = this.engine.isLevelUnlocked(levelIndex);

        const stone = document.createElement('div');
        stone.className = `pyramid-stone tier-${lvl.tier} ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}`;
        stone.dataset.index = levelIndex;

        const numEl = document.createElement('span');
        numEl.className = 'stone-level-num';
        numEl.textContent = lvl.id < 10 ? `0${lvl.id}` : lvl.id;

        const nameEl = document.createElement('span');
        nameEl.className = 'stone-name';
        nameEl.textContent = lvl.name;

        const iconEl = document.createElement('span');
        iconEl.className = 'stone-status-icon';
        if (isCompleted) {
          iconEl.textContent = '✓';
          iconEl.style.color = '#fbbf24';
        } else if (!isUnlocked) {
          iconEl.textContent = '🔒';
        } else {
          iconEl.textContent = lvl.id === 15 ? '👑' : '✦';
        }

        stone.appendChild(iconEl);
        stone.appendChild(numEl);
        stone.appendChild(nameEl);

        stone.addEventListener('click', () => {
          if (isUnlocked) {
            this.startLevel(levelIndex);
          } else {
            alert(`Level ${lvl.id} ist noch gesperrt! Beide darunterliegenden Fundamente müssen zuerst gelöst werden.`);
          }
        });

        rowEl.appendChild(stone);
      });

      this.pyramidGrid.appendChild(rowEl);
    });

    // Fortschrittsbalken aktualisieren
    const completedCount = this.engine.progress.completedLevels.length;
    this.progressCount.textContent = `${completedCount} / 15`;
    const percent = Math.round((completedCount / 15) * 100);
    this.progressBarFill.style.width = `${percent}%`;

    // Tresor-Status
    if (this.engine.areAllLevelsCompleted()) {
      this.btnOpenVault.disabled = false;
      this.btnOpenVault.classList.add('btn-glow');
      this.vaultBannerStatus.textContent = '⚡ Alle 15 Siegel gebrochen! Der Tresor kann jetzt geöffnet werden!';
    } else {
      this.btnOpenVault.disabled = true;
      this.btnOpenVault.classList.remove('btn-glow');
      this.vaultBannerStatus.textContent = `Noch ${15 - completedCount} Level bis zur Entschlüsselung des Finals.`;
    }
  }

  // Öffnet den Geocaching-Kryptotresor
  async openFinalVault() {
    const result = await this.vault.unlockCoordinates(this.engine.progress.levelTokens);

    if (result.success) {
      document.getElementById('final-coordinates-text').textContent = result.coordinates;
      document.getElementById('final-hint-text').textContent = result.hint || 'Kein Spoiler hinterlegt.';
      this.modalVault.classList.add('active');
    } else {
      alert(`Zugriff verweigert:\n${result.reason}`);
    }
  }

  // 10x Tippen auf das Ersteller-Logo schaltet den Reviewer-Modus frei
  handleCreatorTap() {
    this.creatorTapCount++;
    clearTimeout(this.creatorTapTimer);

    if (this.creatorTapCount >= 10) {
      this.activateReviewerMode();
      this.creatorTapCount = 0;
    } else {
      this.creatorTapTimer = setTimeout(() => {
        this.creatorTapCount = 0;
      }, 3500);
    }
  }

  // Aktiviert den Reviewer-Modus (Tastatur & Touch-D-Pad)
  activateReviewerMode() {
    this.isReviewerMode = true;
    if (this.touchDpadContainer) {
      this.touchDpadContainer.style.display = 'flex';
    }
    if (this.reviewerBanner) {
      this.reviewerBanner.style.display = 'block';
      setTimeout(() => {
        this.reviewerBanner.style.display = 'none';
      }, 4000);
    }

    const stepBtnIcon = document.getElementById('step-btn-icon');
    const stepBtnLabel = document.getElementById('step-btn-label');
    if (stepBtnIcon) stepBtnIcon.textContent = '🚶';
    if (stepBtnLabel) stepBtnLabel.textContent = 'Vorwärts';

    const modeTag = document.getElementById('gps-mode-tag');
    if (modeTag) {
      modeTag.textContent = 'Reviewer: Tasten & Touch';
      modeTag.style.background = '#f59e0b';
      modeTag.style.color = '#000';
    }

    this.audio.playSecretUnlock();
    this.showMessageToast('⚡ Reviewer-Modus aktiviert! Tastatur & Touch D-Pad freigeschaltet.');
  }

  // Kleines Toast-Feedback am unteren Bildschirmrand
  showMessageToast(message) {
    let toast = document.getElementById('game-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'game-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.95);
        color: #f8fafc;
        border: 1px solid rgba(245, 158, 11, 0.5);
        padding: 8px 18px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, 2400);
  }

  // Screen Wake Lock API (Verhindert Abschalten des Displays im Freien)
  async requestWakeLock() {
    if ('wakeLock' in navigator && !this.wakeLock) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
      } catch (e) {
        // Ignorieren falls vom Betriebssystem abgelehnt (z.B. extremer Energiesparmodus)
      }
    }
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }

  // 60 FPS Animations-Schleife
  startRenderLoop() {
    const loop = (time) => {
      if (this.currentScreen === 'game' && this.renderer) {
        this.renderer.render(time);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// App sicher starten (sowohl wenn DOM noch lädt als auch wenn schon bereit)
function initApp() {
  if (!window.app) {
    window.app = new SokobanApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

})();