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
    if (this.moveHistory.length === 0) {
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
    this.isCompleted = this.checkWin();

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
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sokoban_pyramid_save', JSON.stringify({
          completedLevels: this.progress.completedLevels,
          unlockedLevels: this.progress.unlockedLevels,
          levelTokens: this.progress.levelTokens,
          audioMuted: this.progress.audioMuted || false,
          tileSize: this.progress.tileSize || 4.0
        }));
      }
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
      if (typeof window !== 'undefined' && window.localStorage) {
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
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      }
      this.initMusic();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API nicht unterstützt:', e);
    }
  }

  initMusic() {
    try {
      this.musicElement = new Audio('assets/music.mp3');
      this.musicElement.loop = true;
      this.musicElement.volume = 0.40;
      this.musicElement.addEventListener('error', () => {
        // Falls keine eigene assets/music.mp3 existiert: sanfter Web Audio Synthesizer-Hintergrund
        this.musicElement = null;
        if (this.isMusicPlaying && !this.isMuted) {
          this.startAmbientDrone();
        }
      });
    } catch (e) {
      this.musicElement = null;
    }
  }

  startMusic() {
    this.isMusicPlaying = true;
    if (this.isMuted) return;

    if (this.musicElement) {
      const playPromise = this.musicElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blockiert oder Datei fehlt -> Fallback auf Ambient Drone
          this.musicElement = null;
          if (this.isMusicPlaying && !this.isMuted) {
            this.startAmbientDrone();
          }
        });
      }
    } else {
      this.startAmbientDrone();
    }
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicElement) {
      this.musicElement.pause();
    }
    this.stopAmbientDrone();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.musicElement) this.musicElement.pause();
      this.stopAmbientDrone();
    } else {
      if (this.isMusicPlaying) {
        if (this.musicElement) {
          this.musicElement.play().catch(() => {});
        } else {
          this.startAmbientDrone();
        }
      }
    }
    return this.isMuted;
  }

  // Sanfter, beruhigender D-Moll Tempel-Ambient-Klangteppich
  startAmbientDrone() {
    if (this.isMuted || !this.ctx || this.ambientGain) return;
    try {
      this.ensureActive();
      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.04, now + 3);
      this.ambientGain.connect(this.ctx.destination);

      // Mystischer D-Moll Akkord (D3 = 146.8Hz, A3 = 220Hz, D4 = 293.6Hz)
      const freqs = [146.83, 220.00, 293.66];
      this.ambientOscillators = freqs.map((freq, i) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 280;

        osc.type = 'sine';
        osc.frequency.value = freq + (i === 1 ? 0.3 : -0.2);
        osc.connect(filter);
        filter.connect(this.ambientGain);
        osc.start(now);
        return osc;
      });
    } catch (e) {}
  }

  stopAmbientDrone() {
    if (this.ambientGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.linearRampToValueAtTime(0.001, now + 0.5);
        const oscs = this.ambientOscillators;
        const gain = this.ambientGain;
        this.ambientOscillators = [];
        this.ambientGain = null;
        setTimeout(() => {
          oscs.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch (e) {}
          });
          if (gain) {
            try { gain.disconnect(); } catch (e) {}
          }
        }, 600);
      } catch (e) {}
    }
  }

  ensureActive() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Soundeffekt: Leiser Schritt auf Steinplatten
  playStep() {
    if (this.isMuted || !this.ctx) return;
    this.ensureActive();
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
    this.ensureActive();
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
    this.ensureActive();
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
    this.ensureActive();
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
    this.ensureActive();
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
    this.ensureActive();
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
    this.ensureActive();
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
// GPS & SENSOR-FUSION OUTDOOR ENGINE (Geocaching Edition)
// Kombiniert Smartphone-Kompass (DeviceOrientation), Schrittzähler (DeviceMotion Pedometer)
// und hochgenaues GPS (Geolocation ENU + Kalman-Filter) für eine verzögerungsfreie,
// 100% zuverlässige Steuerung im Freien.
//
// Kern-Mechanik:
//   1. Kompass-Drehung: Dreht man sich mit dem Handy, dreht sich die Spielfigur live mit.
//      Die Blickrichtung beim Start / „Hier verankern“ ist automatisch „Oben (▲)“ auf dem Bildschirm.
//   2. Vorwärtslaufen: Läuft man los, bewegt sich die Figur durch die Kombination aus
//      Schritterkennung (Pedometer) und GPS-Distanz exakt in ihre aktuelle Blickrichtung.
//   3. 100% Geisterschritt-Schutz: Im erkannten Stillstand (Beschleunigungs-Varianz) sowie
//      während einer reinen Körperdrehung am Platz werden niemals Schritte ausgelöst.
//
// Ersteller: versteckules

const EARTH_R = 6371000;
const DEG = Math.PI / 180;

const DIR_VECTORS = {
  up: { dx: 0, dy: -1 },
  right: { dx: 1, dy: 0 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 }
};

const DIR_ANGLES = {
  up: 0,
  right: 90,
  down: 180,
  left: 270
};

class GpsEngine {
  constructor(options = {}) {
    // ---------- Konfiguration ----------
    this.tileSize = options.tileSize || 4.0;           // Meter pro Kachel (3m / 4m / 5m)
    this.stepFraction = options.stepFraction || 0.50;  // 50% der Kachelgröße triggern den Schritt (z.B. 2.0m bei 4m)
    this.strideLength = options.strideLength || 0.72;  // Physische Schrittlänge in Metern (~3 Schritte für 2m)
    this.stepCooldownMs = 520;                         // Mindestabstand zwischen zwei Spielfeld-Schritten
    this.maxAccuracy = options.maxAccuracy || 30;      // Fixes mit schlechterer Genauigkeit (m) werden für GPS-Drift ignoriert
    this.calibrationFixes = 2;                         // Schnelle Kalibrierung (2 Fixes)
    this.calibrationMs = 1200;                         // 1.2s Kalibrierphase
    this.gapResyncMs = 9000;                           // Funkstille, nach der GPS neu synchronisiert wird
    this.maxStepsPerFix = 2;                           // Aufholen bei GPS-Latenz
    this.qWalking = 3.0;                               // Kalman-Prozessrauschen (m/s) beim Gehen (reaktionsschnell)
    this.qStill = 0.20;                                //   ... im Stillstand
    this.qUnknown = 1.2;                               //   ... ohne Bewegungssensor

    // Austauschbare Uhr (für Tests)
    this.clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

    // ---------- Laufzeit-Status ----------
    this.watchId = null;
    this.isTracking = false;
    this.status = 'idle'; // idle | searching | weak | calibrating | ready | denied | error
    this.statusMessage = '';
    this.accuracy = null;
    this.lastFixTime = 0;
    this.lastStepTriggerTime = -10000;

    // Lokale Projektion & Kalman-Filter
    this.origin = null;   // { lat, lon, cosLat }
    this.filter = null;   // { x, y, P, t }  (x = Ost, y = Nord in Metern)
    this.outlierCount = 0;

    // Raster-Abbildung
    this.gridBearing = 0;   // Visuelle Spielfeld-Drehung (0, 90, 180, 270 Grad)
    this.stepOrigin = null; // { x, y } ENU – Punkt, an dem der letzte Zug ausgelöst wurde
    this.calibrating = true;
    this.calibrationStart = 0;
    this.calibrationCount = 0;
    this.paused = false;    // Pausiert während Modals / außerhalb des Spiels

    // ---------- Kompass (DeviceOrientation) ----------
    this.compass = {
      hasSensor: false,
      hasAbsolute: false,
      rawHeading: null,      // 0..360° (Uhrzeigersinn)
      smoothHeading: null,   // Geglätteter Kompasswinkel
      anchorHeading: 0,      // Referenzwinkel = "Oben (▲)" auf dem Smartphone-Bildschirm
      needsAnchor: true,     // Kalibriert beim Start / "Hier verankern" automatisch auf aktuelle Blickrichtung
      screenAngle: 0,        // 0..360° relativ zum Bildschirm-Oben
      gridAngle: 0,          // 0..360° im internen Level-Raster
      facing: 'down',        // 'up' | 'right' | 'down' | 'left' im internen Level-Raster
      screenFacing: 'down',  // 'up' | 'right' | 'down' | 'left' auf dem Bildschirm
      lastTurnTime: -10000,  // Schutz vor Schrittauslösung während einer Drehung am Platz
      lastEventTime: 0
    };
    this.orientationHandler = null;
    this.orientationAbsHandler = null;
    this.isOrientationListening = false;

    // ---------- Bewegungssensor & Pedometer (DeviceMotion) ----------
    this.motion = {
      samples: [],
      valid: false,
      lastTime: 0,
      lastActiveTime: 0,
      std: 0,
      isStill: false,
      quietSince: 0,
      strideCount: 0,
      walkedMeters: 0,
      lastStepPeakTime: 0,
      armedForPeak: true
    };
    this.motionHandler = null;
    this.isMotionListening = false;

    // ---------- Callbacks ----------
    this.onStepRequest = null;   // (dir, source) => boolean – Zug ausführen, true wenn erfolgreich
    this.onFacingChange = null;  // (gridDir, screenAngle, rawHeading) – Figur hat sich gedreht
    this.onStatusChange = null;  // (status, message)
    this.onUpdate = null;        // (state) – für Live-Anzeige
    this.onCalibrated = null;    // () – Kalibrierung abgeschlossen
  }

  // =====================================================================
  //  START / STOP
  // =====================================================================

  startTracking() {
    if (this.isTracking) return true;
    this.isTracking = true;
    this.resetFilter();

    // 1. Bewegungssensor (Pedometer) & Kompass starten (funktionieren auch ohne GPS-Lock sofort!)
    this.startMotionSensor();
    this.startOrientationSensor();

    // 2. GPS-Tracking starten
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      this.setStatus('error', 'GPS benötigt HTTPS');
      this.emitUpdate();
      return false;
    }

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      this.setStatus('error', 'Kein GPS verfügbar');
      this.emitUpdate();
      return false;
    }

    this.setStatus('searching', 'Suche GPS…');
    try {
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => this.handlePositionUpdate(pos),
        (err) => this.handleError(err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
      );
    } catch (e) {
      this.setStatus('error', 'GPS nicht verfügbar');
    }

    this.emitUpdate();
    return true;
  }

  stopTracking() {
    if (this.watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    this.watchId = null;
    this.isTracking = false;
    this.stopMotionSensor();
    this.stopOrientationSensor();
    this.resetFilter();
    this.setStatus('idle', 'GPS pausiert');
  }

  resetFilter() {
    this.origin = null;
    this.filter = null;
    this.stepOrigin = null;
    this.outlierCount = 0;
    this.accuracy = null;
    this.lastFixTime = 0;
    this.resetMotionSteps();
    this.startCalibration();
  }

  resetMotionSteps() {
    this.motion.strideCount = 0;
    this.motion.walkedMeters = 0;
    this.motion.armedForPeak = true;
  }

  startCalibration() {
    this.calibrating = true;
    this.calibrationStart = 0;
    this.calibrationCount = 0;
  }

  // =====================================================================
  //  KOMPASS / DEVICE ORIENTATION – Live-Drehung der Spielfigur
  // =====================================================================

  startOrientationSensor() {
    if (this.isOrientationListening || typeof window === 'undefined') return;

    this.orientationAbsHandler = (e) => this.handleDeviceOrientation(e, true);
    this.orientationHandler = (e) => this.handleDeviceOrientation(e, false);

    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', this.orientationAbsHandler, { passive: true });
    }
    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.orientationHandler, { passive: true });
    }
    this.isOrientationListening = true;
  }

  stopOrientationSensor() {
    if (this.isOrientationListening && typeof window !== 'undefined') {
      if (this.orientationAbsHandler) {
        window.removeEventListener('deviceorientationabsolute', this.orientationAbsHandler);
      }
      if (this.orientationHandler) {
        window.removeEventListener('deviceorientation', this.orientationHandler);
      }
    }
    this.orientationAbsHandler = null;
    this.orientationHandler = null;
    this.isOrientationListening = false;
  }

  // Extrahiert den neigungskompensierten Kompasswinkel (0..360° im Uhrzeigersinn)
  extractCompassHeading(e) {
    if (!e) return null;

    let heading = null;

    // 1. iOS Safari: Hardware-kalibrierter 3D-Kompasswinkel
    if (typeof e.webkitCompassHeading === 'number' && isFinite(e.webkitCompassHeading) && e.webkitCompassHeading >= 0) {
      heading = e.webkitCompassHeading;
    }
    // 2. Android / Standard W3C DeviceOrientation (alpha, beta, gamma)
    else if (typeof e.alpha === 'number' && isFinite(e.alpha)) {
      const alpha = e.alpha;
      const beta = (typeof e.beta === 'number' && isFinite(e.beta)) ? e.beta : 0;
      const gamma = (typeof e.gamma === 'number' && isFinite(e.gamma)) ? e.gamma : 0;

      // Neigungskompensierter Vorwärtsvektor (funktioniert flach in der Hand bis aufrecht bei 90° ohne Gimbal-Flip!)
      const a = alpha * DEG;
      const b = beta * DEG;
      const g = gamma * DEG;
      const ca = Math.cos(a), sa = Math.sin(a);
      const cb = Math.cos(b), sb = Math.sin(b);
      const cg = Math.cos(g), sg = Math.sin(g);

      const Yx = -sa * cb;
      const Yy = ca * cb;
      const Zx = ca * sg + sa * sb * cg;
      const Zy = sa * sg - ca * sb * cg;

      const fx = Yx * cb - Zx * sb;
      const fy = Yy * cb - Zy * sb;

      if (Math.hypot(fx, fy) > 1e-4) {
        heading = (Math.atan2(fx, fy) / DEG + 360) % 360;
      } else {
        heading = ((360 - alpha) % 360 + 360) % 360;
      }
    }

    if (heading === null || !isFinite(heading)) return null;

    // Bildschirm-Rotation (Landscape/Portrait) einrechnen
    let screenOrientationAngle = 0;
    if (typeof window !== 'undefined') {
      if (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === 'number') {
        screenOrientationAngle = window.screen.orientation.angle;
      } else if (typeof window.orientation === 'number') {
        screenOrientationAngle = window.orientation;
      }
    }

    return ((heading + screenOrientationAngle) % 360 + 360) % 360;
  }

  handleDeviceOrientation(e, isAbsolute = false) {
    if (!e) return;

    // Verhindere Konflikte, falls Android sowohl absolute als auch relative Events gleichzeitig feuert
    if (isAbsolute || e.absolute === true) {
      if (!this.compass.hasAbsolute) {
        this.compass.hasAbsolute = true;
        this.compass.needsAnchor = true;
      }
    } else if (this.compass.hasAbsolute && e.webkitCompassHeading === undefined) {
      return;
    }

    const rawHeading = this.extractCompassHeading(e);
    if (rawHeading === null) return;

    const now = this.clock();
    const c = this.compass;
    c.hasSensor = true;
    c.rawHeading = rawHeading;
    c.lastEventTime = now;

    // Automatische Nullpunkt-Verankerung beim Start / nach "Hier verankern"
    const wasAnchoring = c.needsAnchor;
    if (c.needsAnchor) {
      c.anchorHeading = rawHeading;
      c.smoothHeading = rawHeading;
      c.needsAnchor = false;
    }

    // Zirkuläre Winkel-Glättung (filtert leichtes Kompasszittern, reagiert sofort bei echter Drehung)
    if (c.smoothHeading === null) {
      c.smoothHeading = rawHeading;
    } else {
      const diff = ((rawHeading - c.smoothHeading + 540) % 360) - 180;
      const blend = Math.abs(diff) > 30 ? 1.0 : 0.45;
      c.smoothHeading = (c.smoothHeading + diff * blend + 360) % 360;
    }

    // Relativer Winkel auf dem Bildschirm (0° = Oben ▲, 90° = Rechts ▶, 180° = Unten ▼, 270° = Links ◀)
    const screenAngle = (c.smoothHeading - (c.anchorHeading || 0) + 360) % 360;
    // Zugehöriger Winkel im internen Sokoban-Gitter (unter Berücksichtigung der Felddrehung)
    const gridAngle = (screenAngle + 360 - this.gridBearing) % 360;

    c.screenAngle = screenAngle;
    c.gridAngle = gridAngle;
    c.screenFacing = this.angleToCardinal(screenAngle, c.screenFacing);

    const newGridFacing = this.angleToCardinal(gridAngle, c.facing);
    if (newGridFacing !== c.facing) {
      c.facing = newGridFacing;
      if (!wasAnchoring) {
        c.lastTurnTime = now;
        // Bei Richtungswechsel angefangene Teilschritte zurücksetzen, damit Drehen am Platz keinen Schritt auslöst
        this.resetMotionSteps();
        if (this.filter) {
          this.stepOrigin = { x: this.filter.x, y: this.filter.y };
        }
      }
      if (this.onFacingChange && !this.paused) {
        this.onFacingChange(newGridFacing, screenAngle, rawHeading);
      }
    } else if (this.onFacingChange && !this.paused) {
      // Kontinuierliches Update für sanfte Kompassnadel-Animation
      this.onFacingChange(c.facing, screenAngle, rawHeading);
    }

    this.emitUpdate();
  }

  // Wandelt einen 360°-Winkel mit ±10° Hysterese stabil in eine der 4 Hauptrichtungen um
  angleToCardinal(angle, currentDir = 'up') {
    const norm = ((angle % 360) + 360) % 360;

    // Prüfe zuerst, ob wir noch innerhalb der Hysterese-Zone (45° + 10° = 55°) der aktuellen Richtung liegen
    if (currentDir && DIR_ANGLES[currentDir] !== undefined) {
      const center = DIR_ANGLES[currentDir];
      const dist = Math.abs(((norm - center + 540) % 360) - 180);
      if (dist <= 55) {
        return currentDir;
      }
    }

    if (norm >= 315 || norm < 45) return 'up';
    if (norm >= 45 && norm < 135) return 'right';
    if (norm >= 135 && norm < 225) return 'down';
    return 'left';
  }

  // Synchronisiert den Kompass-Referenzwinkel, wenn der Spieler die Figur manuell (z.B. per Antippen) in eine Richtung dreht
  alignCompassToDirection(gridDir) {
    if (!DIR_VECTORS[gridDir]) return;
    const c = this.compass;
    c.facing = gridDir;
    const gridAngle = DIR_ANGLES[gridDir];
    const screenAngle = (gridAngle + this.gridBearing) % 360;
    c.gridAngle = gridAngle;
    c.screenAngle = screenAngle;
    c.screenFacing = this.angleToCardinal(screenAngle, c.screenFacing);
    c.lastTurnTime = this.clock();

    if (c.rawHeading !== null) {
      c.anchorHeading = (c.rawHeading - screenAngle + 360) % 360;
      c.smoothHeading = c.rawHeading;
      c.needsAnchor = false;
    }

    this.resetMotionSteps();
    if (this.filter) {
      this.stepOrigin = { x: this.filter.x, y: this.filter.y };
    }
    this.emitUpdate();
  }

  // =====================================================================
  //  BEWEGUNGSSENSOR & PEDOMETER – Stillstandssperre + Schritterkennung
  // =====================================================================

  startMotionSensor() {
    if (this.isMotionListening) return;
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;
    this.motionHandler = (e) => this.handleDeviceMotion(e);
    window.addEventListener('devicemotion', this.motionHandler, { passive: true });
    this.isMotionListening = true;
  }

  stopMotionSensor() {
    if (this.isMotionListening && this.motionHandler && typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.motionHandler);
    }
    this.motionHandler = null;
    this.isMotionListening = false;
    this.motion.samples = [];
    this.motion.valid = false;
    this.motion.isStill = false;
    this.resetMotionSteps();
  }

  getNeededStrides() {
    return Math.max(2, Math.round(this.stepDistance() / this.strideLength));
  }

  handleDeviceMotion(e) {
    if (!e) return;
    const pick = (v) => (v && typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number') ? v : null;
    const aGrav = pick(e.accelerationIncludingGravity);
    const aLin = pick(e.acceleration);
    const a = aGrav || aLin;
    if (!a) return;

    const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    if (!isFinite(mag)) return;

    const now = this.clock();
    const m = this.motion;
    m.samples.push({ t: now, v: mag });
    while (m.samples.length && now - m.samples[0].t > 1500) m.samples.shift();
    m.lastTime = now;

    // Berechne Mittelwert & Standardabweichung im Zeitfenster
    let sum = 0;
    for (const s of m.samples) sum += s.v;
    const mean = sum / m.samples.length;
    let varSum = 0;
    for (const s of m.samples) varSum += (s.v - mean) * (s.v - mean);
    const std = Math.sqrt(varSum / m.samples.length);
    m.std = std;

    if (m.samples.length >= 6 && now - m.samples[0].t >= 400) {
      // Echte Sensoren rauschen immer – exakt konstante Werte = defekter/emulierter Sensor
      m.valid = std > 1e-4;
      if (!m.valid) {
        m.isStill = false;
        return;
      }

      // Stillstandserkennung mit Hysterese:
      // Unter 0.35 m/s² für ≥ 900 ms = sicherer Stillstand (blockiert Geisterschritte zu 100%)
      if (std < 0.35) {
        if (!m.quietSince) m.quietSince = now;
        if (now - m.quietSince >= 900) {
          m.isStill = true;
          this.resetMotionSteps();
        }
      } else if (std > 0.50) {
        m.quietSince = 0;
        m.isStill = false;
        m.lastActiveTime = now;
      }
    }

    // ---------- Pedometer: Physische Schritte beim Gehen erkennen ----------
    // Dynamische Schritt-Amplitude (Abweichung von der Erdbeschleunigung bzw. lineare Beschleunigung)
    const dyn = (aGrav && mean > 5.0) ? Math.abs(mag - mean) : mag;

    if (dyn < 0.45) {
      m.armedForPeak = true;
    }

    // Verhindere Schrittzählung während einer reinen Körperdrehung am Platz
    const isTurning = (now - this.compass.lastTurnTime) < 380;
    const sinceLastPeak = now - m.lastStepPeakTime;

    // Wenn der Spieler länger als 2.4s stehen bleibt, verfällt ein einzelner alter Teilschritt
    if (m.strideCount > 0 && sinceLastPeak > 2400) {
      this.resetMotionSteps();
    }

    const isWalkingMotion = (!m.isStill && (std >= 0.48 || (!aGrav && dyn >= 1.15)));
    if (isWalkingMotion && !isTurning && dyn >= 1.05 && sinceLastPeak >= 300 && (m.armedForPeak || sinceLastPeak >= 420)) {
      m.armedForPeak = false;
      m.lastStepPeakTime = now;
      m.lastActiveTime = now;
      m.isStill = false;
      m.quietSince = 0;

      if (sinceLastPeak > 2400) {
        m.strideCount = 1;
      } else {
        m.strideCount++;
      }

      const neededStrides = this.getNeededStrides();
      m.walkedMeters = Math.min(this.stepDistance(), (m.strideCount / neededStrides) * this.stepDistance());

      // Wenn genügend echte Schritte in Blickrichtung gemacht wurden -> Zug sofort ausführen!
      if (!this.paused && m.strideCount >= neededStrides && (now - this.lastStepTriggerTime >= this.stepCooldownMs)) {
        this.executeTriggeredStep(this.compass.facing, 'pedometer');
      }

      this.emitUpdate();
    }
  }

  hasMotionData() {
    return this.motion.valid && (this.clock() - this.motion.lastTime < 2000);
  }

  isStill() {
    return this.hasMotionData() && this.motion.isStill;
  }

  // Prüft, ob das Gerät aktuell im Stillstand ist UND auch in den letzten ms (GPS-Nachlauf) keine Gehbewegung stattfand
  isStrictlyStillForGps() {
    if (!this.hasMotionData()) return false;
    if (!this.motion.isStill) return false;
    return (this.clock() - this.motion.lastActiveTime) > 2200;
  }

  // =====================================================================
  //  GPS-VERARBEITUNG
  // =====================================================================

  project(lat, lon) {
    return {
      x: (lon - this.origin.lon) * DEG * EARTH_R * this.origin.cosLat,
      y: (lat - this.origin.lat) * DEG * EARTH_R
    };
  }

  unproject(x, y) {
    return {
      lat: this.origin.lat + (y / EARTH_R) / DEG,
      lon: this.origin.lon + (x / (EARTH_R * this.origin.cosLat)) / DEG
    };
  }

  handlePositionUpdate(pos) {
    if (!pos || !pos.coords) return;
    const c = pos.coords;
    if (typeof c.latitude !== 'number' || typeof c.longitude !== 'number') return;

    const now = this.clock();
    const acc = (typeof c.accuracy === 'number' && isFinite(c.accuracy)) ? c.accuracy : 999;
    const t = (typeof pos.timestamp === 'number' && pos.timestamp > 0) ? pos.timestamp : now;
    const gap = this.lastFixTime ? now - this.lastFixTime : 0;
    this.lastFixTime = now;
    this.accuracy = acc;

    if (!this.origin) {
      this.origin = { lat: c.latitude, lon: c.longitude, cosLat: Math.cos(c.latitude * DEG) };
    }

    // 1. Zu ungenaue Fixes nicht für GPS-Drift verwenden (Pedometer + Kompass laufen trotzdem weiter!)
    if (acc > this.maxAccuracy) {
      this.setStatus('weak', `GPS ungenau (±${Math.round(acc)} m)`);
      this.emitUpdate();
      return;
    }

    const z = this.project(c.latitude, c.longitude);
    const R = Math.max(acc, 3) ** 2;
    let reset = false;

    // 2. Kalman-Filter (Positions-Modell mit dynamischer Verstärkung in Bewegung)
    if (!this.filter || gap > this.gapResyncMs) {
      this.filter = { x: z.x, y: z.y, P: R, t };
      this.outlierCount = 0;
      reset = true;
    } else {
      const f = this.filter;
      const dt = Math.min(10, Math.max(0.2, (t - f.t) / 1000));
      const q = this.currentProcessNoise();
      const P = f.P + dt * q * q;
      const ix = z.x - f.x;
      const iy = z.y - f.y;
      const innov = Math.sqrt(ix * ix + iy * iy);

      if (innov > 4 * Math.sqrt(P + R) && innov > 18) {
        this.outlierCount++;
        if (this.outlierCount < 3) {
          f.P = P;
          f.t = t;
          this.emitUpdate();
          return;
        }
        this.filter = { x: z.x, y: z.y, P: R, t };
        this.outlierCount = 0;
        reset = true;
      } else {
        this.outlierCount = 0;
        // Im Gehen (nicht still) hohe Reaktionsfreudigkeit (K >= 0.78), damit 2-3m Schritte sofort erkannt werden
        const rawK = P / (P + R);
        const K = this.isStill() ? rawK : Math.max(0.78, rawK);
        f.x += K * ix;
        f.y += K * iy;
        f.P = (1 - K) * P;
        f.t = t;
      }
    }

    if (reset) {
      this.stepOrigin = { x: this.filter.x, y: this.filter.y };
      if (gap > this.gapResyncMs) this.startCalibration();
    }

    // 3. Kurze Kalibrierphase nach Erststart
    if (this.calibrating) {
      if (!this.calibrationStart) this.calibrationStart = now;
      this.calibrationCount++;
      this.stepOrigin = { x: this.filter.x, y: this.filter.y };
      if (this.calibrationCount >= this.calibrationFixes && now - this.calibrationStart >= this.calibrationMs) {
        this.calibrating = false;
        this.triggerHaptic([30, 60, 30]);
        if (this.onCalibrated) this.onCalibrated();
      }
      this.updateStatusFromState();
      this.emitUpdate();
      return;
    }

    // 4. Schritt-Erkennung über GPS
    this.evaluateSteps();
    this.updateStatusFromState();
    this.emitUpdate();
  }

  currentProcessNoise() {
    if (!this.hasMotionData()) return this.qUnknown;
    return this.motion.isStill ? this.qStill : this.qWalking;
  }

  // =====================================================================
  //  RASTER-ABBILDUNG & SCHRITT-AUSFÜHRUNG
  // =====================================================================

  gridAxes() {
    const b = this.gridBearing * DEG;
    return {
      up: { x: Math.sin(b), y: Math.cos(b) },     // Spielfeld-Oben
      right: { x: Math.cos(b), y: -Math.sin(b) }  // Spielfeld-Rechts
    };
  }

  // Versatz seit dem letzten Zug in Raster-Metern (gx: + = rechts, gy: + = unten)
  getGridOffset() {
    if (!this.filter || !this.stepOrigin) return { gx: 0, gy: 0 };
    const dx = this.filter.x - this.stepOrigin.x;
    const dy = this.filter.y - this.stepOrigin.y;
    const ax = this.gridAxes();
    return {
      gx: dx * ax.right.x + dy * ax.right.y,
      gy: -(dx * ax.up.x + dy * ax.up.y)
    };
  }

  setGridOffset(gx, gy) {
    if (!this.filter) return;
    const ax = this.gridAxes();
    const ex = gx * ax.right.x - gy * ax.up.x;
    const ey = gx * ax.right.y - gy * ax.up.y;
    this.stepOrigin = { x: this.filter.x - ex, y: this.filter.y - ey };
  }

  stepDistance() {
    return this.tileSize * this.stepFraction;
  }

  // Führt einen erkannten Schritt (von Pedometer oder GPS) aus und synchronisiert beide Sensoren
  executeTriggeredStep(dir, source = 'gps') {
    if (!this.onStepRequest || this.paused) return false;
    const now = this.clock();
    if (now - this.lastStepTriggerTime < this.stepCooldownMs) return false;

    const targetDir = DIR_VECTORS[dir] ? dir : (this.compass.facing || 'down');
    this.lastStepTriggerTime = now;
    this.resetMotionSteps();

    const ok = !!this.onStepRequest(targetDir, source);
    if (this.filter && source === 'pedometer') {
      this.stepOrigin = { x: this.filter.x, y: this.filter.y };
    }
    this.triggerHaptic(ok ? 40 : [60, 40, 80]);
    return ok;
  }

  evaluateSteps() {
    if (!this.onStepRequest || this.paused || this.calibrating || !this.filter) return;
    // Im erkannten Stillstand (inkl. 2.2s Nachlauf für GPS-Latenz) keine Geisterschritte zulassen
    if (this.isStrictlyStillForGps()) return;

    const need = this.stepDistance();
    for (let i = 0; i < this.maxStepsPerFix; i++) {
      if (this.clock() - this.lastStepTriggerTime < this.stepCooldownMs) break;

      const { gx, gy } = this.getGridOffset();
      const ax = Math.abs(gx);
      const ay = Math.abs(gy);
      const radial = Math.hypot(gx, gy);

      // Wenn ein aktiver Kompass die Blickrichtung der Figur steuert:
      // Sobald die Schrittdistanz gelaufen wurde, bewegt sich die Figur garantiert in ihre Blickrichtung!
      if (this.compass.hasSensor) {
        if (radial < need) break;
        const dir = this.compass.facing || 'up';
        const ok = this.executeTriggeredStep(dir, 'gps');

        // Verbrauche die Schrittdistanz in Laufrichtung
        const remainRatio = Math.max(0, (radial - need) / radial);
        if (!ok || (radial - need) < need) {
          this.stepOrigin = { x: this.filter.x, y: this.filter.y };
        } else {
          this.setGridOffset(gx * remainRatio, gy * remainRatio);
        }
        if (!ok) break;
      } else {
        // Fallback für Geräte ohne Kompass-Sensor: Richtung direkt aus dem GPS-Vektor (gx, gy) bestimmen
        if (Math.max(ax, ay) < need) break;
        const horizontal = ax >= ay;
        const dir = horizontal ? (gx > 0 ? 'right' : 'left') : (gy > 0 ? 'down' : 'up');
        this.compass.facing = dir;
        const ok = this.executeTriggeredStep(dir, 'gps');

        let along = horizontal ? gx : gy;
        let across = horizontal ? gy : gx;
        along -= Math.sign(along) * need;
        if (!ok || Math.abs(along) < need) along = 0;
        if (ok) across = 0;

        if (horizontal) this.setGridOffset(along, across);
        else this.setGridOffset(across, along);
        if (!ok) break;
      }
    }
  }

  // =====================================================================
  //  STEUERUNG VON AUSSEN
  // =====================================================================

  // „Hier verankern“: setzt aktuelle GPS-Position als Ursprung UND aktuelle Handy-Blickrichtung als „Oben (▲)“
  reanchor(anchorCompass = true) {
    if (this.filter) {
      this.stepOrigin = { x: this.filter.x, y: this.filter.y };
    }
    this.resetMotionSteps();

    if (anchorCompass) {
      if (this.compass.rawHeading !== null) {
        this.compass.anchorHeading = this.compass.rawHeading;
        this.compass.smoothHeading = this.compass.rawHeading;
        this.compass.needsAnchor = false;
        this.compass.screenAngle = 0;
        this.compass.screenFacing = 'up';
        this.compass.gridAngle = (360 - this.gridBearing) % 360;
        this.compass.facing = this.angleToCardinal(this.compass.gridAngle, 'up');
        if (this.onFacingChange && !this.paused) {
          this.onFacingChange(this.compass.facing, 0, this.compass.rawHeading);
        }
      } else {
        this.compass.needsAnchor = true;
      }
    }

    this.updateStatusFromState();
    this.emitUpdate();
  }

  setGridBearing(degrees) {
    this.gridBearing = ((degrees % 360) + 360) % 360;
    // Aktualisiere die Gitter-Blickrichtung passend zur neuen Felddrehung
    this.compass.gridAngle = (this.compass.screenAngle + 360 - this.gridBearing) % 360;
    this.compass.facing = this.angleToCardinal(this.compass.gridAngle, this.compass.facing);
    if (this.onFacingChange && !this.paused) {
      this.onFacingChange(this.compass.facing, this.compass.screenAngle, this.compass.rawHeading);
    }
    this.reanchor(false);
  }

  setTileSize(meters) {
    if (typeof meters === 'number' && meters > 0) {
      this.tileSize = meters;
      this.reanchor(false);
    }
  }

  setPaused(paused) {
    this.paused = !!paused;
    if (!paused) this.reanchor(false);
  }

  // Wird regelmäßig von der App aufgerufen (Erkennung von Funkstille & Pedometer-Timeout)
  tick() {
    if (!this.isTracking) return;
    const now = this.clock();

    // Wenn der Spieler aufgehört hat zu gehen (> 2.0s kein Schritt mehr), Teil-Schritte sanft zurücksetzen
    if (this.motion.strideCount > 0 && now - this.motion.lastStepPeakTime > 2000) {
      this.resetMotionSteps();
      this.emitUpdate();
    }

    if (this.lastFixTime && now - this.lastFixTime > 6000 &&
        this.status !== 'denied' && this.status !== 'error') {
      const secs = Math.round((now - this.lastFixTime) / 1000);
      this.setStatus('searching', `Warte auf GPS… (${secs}s)`);
      this.emitUpdate();
    }
  }

  getState() {
    const { gx, gy } = this.getGridOffset();
    let calibProgress = 0;
    if (this.calibrating && this.calibrationStart) {
      const byCount = this.calibrationCount / this.calibrationFixes;
      const byTime = (this.clock() - this.calibrationStart) / this.calibrationMs;
      calibProgress = Math.max(0, Math.min(1, Math.min(byCount, byTime)));
    }

    const need = this.stepDistance();
    const gpsDist = (!this.calibrating && this.filter)
      ? (this.compass.hasSensor ? Math.hypot(gx, gy) : Math.max(Math.abs(gx), Math.abs(gy)))
      : 0;
    const pedoDist = this.motion.walkedMeters || 0;
    const currentWalkDistance = Math.min(need, Math.max(gpsDist, pedoDist));

    return {
      status: this.status,
      message: this.statusMessage,
      accuracy: this.accuracy,
      hasFix: !!this.filter,
      calibrating: this.calibrating,
      calibProgress,
      ready: (!!this.filter && !this.calibrating && this.status === 'ready') || this.compass.hasSensor || this.hasMotionData(),
      still: this.isStill(),
      motionAvailable: this.hasMotionData(),
      strideCount: this.motion.strideCount,
      neededStrides: this.getNeededStrides(),
      currentWalkDistance,
      compassAvailable: this.compass.hasSensor,
      compassScreenAngle: this.compass.screenAngle,
      compassFacing: this.compass.facing,
      compassScreenFacing: this.compass.screenFacing,
      gx,
      gy,
      stepDistance: need,
      tileSize: this.tileSize,
      gridBearing: this.gridBearing
    };
  }

  updateStatusFromState() {
    if (!this.filter) return;
    const accTxt = this.accuracy !== null ? `±${Math.round(this.accuracy)} m` : '';
    if (this.calibrating) {
      this.setStatus('calibrating', `Kalibriere ${accTxt}`);
    } else {
      this.setStatus('ready', `GPS ${accTxt}`);
    }
  }

  handleError(err) {
    if (!err) return;
    if (err.code === 1) {
      this.setStatus('denied', 'Standort verweigert');
    } else if (err.code === 2) {
      this.setStatus('searching', 'Kein GPS-Signal');
    } else {
      this.setStatus('searching', 'Suche GPS…');
    }
    this.emitUpdate();
  }

  setStatus(status, message) {
    const changed = status !== this.status || message !== this.statusMessage;
    this.status = status;
    this.statusMessage = message;
    if (changed && this.onStatusChange) this.onStatusChange(status, message);
  }

  emitUpdate() {
    if (this.onUpdate) this.onUpdate(this.getState());
  }

  triggerHaptic(pattern = 40) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (e) { /* ignorieren */ }
    }
  }

  triggerCollisionHaptic() {
    this.triggerHaptic([60, 40, 80]);
  }
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
    this.compassAngle = null; // Live Smartphone-Kompasswinkel (0..360°)

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
    this.handleResize();
  }

  // Passt Canvas an Container-Größe an
  handleResize() {
    if (!this.canvas || !this.engine || !this.canvas.parentElement) return;

    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height || width);
    if (width <= 0 || height <= 0) return;

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
    this.tileSize = Math.max(16, Math.floor(Math.min(maxTileW, maxTileH, 76)));

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

    // 3. SPIELFELD-DREHUNG (Visuell um das Zentrum der Arena drehen)
    const centerX = width / 2;
    const centerY = height / 2;

    if (this.rotation !== 0) {
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(this.rotation * Math.PI / 180);
      this.ctx.translate(-centerX, -centerY);
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

    // Falls ein Live-Kompass aktiv ist: stufenloser goldener Kompass-Zeiger am Aura-Ring der Figur
    if (this.compassAngle !== null && this.compassAngle !== undefined) {
      this.ctx.save();
      const liveRad = (this.compassAngle - 90) * (Math.PI / 180);
      this.ctx.rotate(liveRad);
      const ringR = s * 0.48;
      this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, ringR, -0.45, 0.45);
      this.ctx.stroke();

      this.ctx.fillStyle = '#38bdf8';
      this.ctx.beginPath();
      this.ctx.arc(ringR, 0, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

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
    const northRad = (this.rotation) * Math.PI / 180;
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

    // Live-Blickrichtungs-Zeiger (Goldenes Dreieck am Kompassring)
    const gridFacing = (this.engine && this.engine.player) ? this.engine.player.facing : 'down';
    const facingToAngle = { up: 0, right: 90, down: 180, left: 270 };
    const fallbackAngle = ((facingToAngle[gridFacing] || 0) + this.rotation) % 360;
    const lookDeg = (this.compassAngle !== null && this.compassAngle !== undefined) ? this.compassAngle : fallbackAngle;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(lookDeg * Math.PI / 180);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(0, -r - 3);
    ctx.lineTo(4, -r + 3);
    ctx.lineTo(-4, -r + 3);
    ctx.closePath();
    ctx.fill();
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


// Verschlüsselter Geocaching-Tresor (AES-GCM 256-Bit, Schlüssel wird erst im RAM aus allen 15 Level-Tokens abgeleitet)
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
// Verbindet Engine, Renderer, GPS & Sensor-Fusion (Kompass + Pedometer + GPS), Audio, UI & Krypto-Tresor
// Ersteller: versteckules


class SokobanApp {
  constructor() {
    this.engine = new SokobanEngine();
    this.audio = new AudioManager();
    this.gps = new GpsEngine({ tileSize: this.engine.progress.tileSize || 4.0 });
    this.vault = new CryptoVault();
    this.renderer = null;

    this.currentScreen = 'landing';
    this.isReviewerMode = false;
    this.wakeLock = null;
    this.toastTimer = null;
    this.lastTickTime = 0;

    // Direkter Handler-Alias für Kompass-Events
    this.orientationHandler = (e, isAbsolute = false) => {
      if (this.gps) this.gps.handleDeviceOrientation(e, isAbsolute);
    };

    // DOM-Referenzen Screens
    this.screens = {
      landing: document.getElementById('landing-screen'),
      pyramid: document.getElementById('pyramid-screen'),
      game: document.getElementById('game-screen')
    };

    // DOM-Referenzen Spielfeld & Pyramide
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
    this.hudFacingLabel = document.getElementById('hud-facing-label');

    // Controls & Status
    this.gpsPill = document.getElementById('gps-pill');
    this.gpsPillText = document.getElementById('gps-pill-text');
    this.rotationVal = document.getElementById('rotation-val');
    this.tileSizeVal = document.getElementById('tilesize-val');
    this.btnStepForward = document.getElementById('btn-step-forward');
    this.btnRotateField = document.getElementById('btn-rotate-field');
    this.btnTileSize = document.getElementById('btn-tilesize');
    this.btnGpsHelp = document.getElementById('btn-gps-help');
    this.touchDpadContainer = document.getElementById('touch-dpad-container');
    this.reviewerBanner = document.getElementById('reviewer-badge-banner');

    // GPS Live Nav-Banner
    this.gpsNavBanner = document.getElementById('gps-nav-banner');
    this.navTargetVal = document.getElementById('nav-target-val');
    this.navWalkInfo = document.getElementById('nav-walk-info');
    this.navMotionStatus = document.getElementById('nav-motion-status');
    this.navAccuracyInfo = document.getElementById('nav-accuracy-info');

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

    // 2. GPS & Sensor Callbacks einrichten
    this.setupGpsCallbacks();

    // 3. Gespeicherte Kachelgröße synchronisieren
    const savedTileSize = this.engine.progress.tileSize || 4.0;
    this.gps.setTileSize(savedTileSize);
    if (this.tileSizeVal) this.tileSizeVal.textContent = `${savedTileSize}m`;

    // 4. Gespeicherter Audio-Mute Zustand synchronisieren
    if (this.engine.progress.audioMuted) {
      this.audio.isMuted = true;
      const icon = document.getElementById('audio-icon');
      if (icon) icon.textContent = '🔇';
    }

    // 5. Reviewer-Check über URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'reviewer' || urlParams.get('reviewer') === 'true') {
      this.activateReviewerMode();
    }

    // 6. Event-Listener registrieren
    this.bindEvents();

    // 7. Pyramiden-Übersicht vorrendern
    this.renderPyramid();

    // 8. 60 FPS Render-Loop starten
    this.startRenderLoop();
  }

  // Bindet alle UI-, Touch- & Tastatur-Events
  bindEvents() {
    // Audio Mute Toggle
    const btnAudio = document.getElementById('btn-audio-toggle');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        this.audio.init();
        const muted = this.audio.toggleMute();
        const icon = document.getElementById('audio-icon');
        if (icon) icon.textContent = muted ? '🔇' : '🔊';
        this.engine.progress.audioMuted = muted;
        this.engine.saveProgress();
      });
    }

    // Landing Screen: "Pyramide betreten"
    const btnEnter = document.getElementById('btn-enter-pyramid');
    if (btnEnter) {
      btnEnter.addEventListener('click', () => {
        this.audio.init();
        this.audio.startMusic();
        this.requestSensorPermissions();
        // GPS, Kompass & Bewegungssensor sofort im Hintergrund starten
        this.gps.startTracking();
        this.showScreen('pyramid');
      });
    }

    // FAQ & Anleitung Modals
    const openFaq = () => { this.modalRules.classList.add('active'); };
    const closeFaq = () => { this.modalRules.classList.remove('active'); };

    const btnOpenRules = document.getElementById('btn-open-rules');
    if (btnOpenRules) btnOpenRules.addEventListener('click', openFaq);

    const btnGlobalFaq = document.getElementById('btn-global-faq');
    if (btnGlobalFaq) btnGlobalFaq.addEventListener('click', openFaq);

    if (this.btnGpsHelp) this.btnGpsHelp.addEventListener('click', openFaq);

    if (this.gpsPill) {
      this.gpsPill.style.cursor = 'pointer';
      this.gpsPill.addEventListener('click', () => {
        const state = this.gps ? this.gps.getState() : null;
        if (state && state.accuracy !== null) {
          this.showMessageToast(`🛰️ GPS: ${state.message} (Genauigkeit ±${Math.round(state.accuracy)}m)`);
        } else {
          openFaq();
        }
      });
    }

    const btnCloseRules = document.getElementById('btn-close-rules');
    if (btnCloseRules) btnCloseRules.addEventListener('click', closeFaq);

    const btnCloseRulesX = document.getElementById('btn-close-rules-x');
    if (btnCloseRulesX) btnCloseRulesX.addEventListener('click', closeFaq);

    this.modalRules.addEventListener('click', (e) => {
      if (e.target === this.modalRules) closeFaq();
    });

    // 10x Klick auf das Hauptbild schaltet den Reviewer-Modus frei
    let heroClicks = 0;
    let heroTimer = null;
    const triggerHeroClick = (e) => {
      if (e) e.stopPropagation();
      heroClicks++;
      clearTimeout(heroTimer);
      if (heroClicks >= 10) {
        this.activateReviewerMode();
        heroClicks = 0;
      } else {
        if (heroClicks >= 5) {
          this.showMessageToast(`⚡ Noch ${10 - heroClicks} Klicks bis zum Reviewer-Modus...`);
        }
        heroTimer = setTimeout(() => { heroClicks = 0; }, 3500);
      }
    };

    const heroWrap = document.getElementById('hero-img-wrap');
    if (heroWrap) heroWrap.addEventListener('click', triggerHeroClick);

    // Spielstand komplett zurücksetzen
    const btnResetSave = document.getElementById('btn-reset-save');
    if (btnResetSave) {
      btnResetSave.addEventListener('click', () => {
        if (confirm('Möchtest du deinen gesamten Spielfortschritt wirklich löschen und alle Level zurücksetzen?')) {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.removeItem('sokoban_pyramid_save');
            }
          } catch (e) {}
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
    const btnBackLanding = document.getElementById('btn-back-to-landing');
    if (btnBackLanding) {
      btnBackLanding.addEventListener('click', () => {
        this.showScreen('landing');
      });
    }

    // Level verlassen
    const btnLeaveLevel = document.getElementById('btn-leave-level');
    if (btnLeaveLevel) {
      btnLeaveLevel.addEventListener('click', () => {
        this.showScreen('pyramid');
        this.renderPyramid();
      });
    }

    // In-Game Aktionen: Undo & Reset
    const btnUndo = document.getElementById('btn-undo');
    if (btnUndo) btnUndo.addEventListener('click', () => this.handleUndo());

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) btnReset.addEventListener('click', () => this.handleReset());

    // SPIELSTEUERUNG (Buttons unter dem Spielfeld)
    // 1. "Hier verankern" (Outdoor) bzw. "Vorwärts" (Reviewer)
    if (this.btnStepForward) {
      this.btnStepForward.addEventListener('click', () => {
        this.requestSensorPermissions();
        if (this.isReviewerMode) {
          if (this.engine && this.engine.player) {
            this.executeMove(this.engine.player.facing);
          }
        } else {
          // Im Outdoor-Modus: Aktuelle GPS-Position UND aktuelle Blickrichtung als "Oben (▲)" verankern
          this.gps.reanchor(true);
          const upGridDir = this.screenDirToGrid('up');
          this.setPlayerFacing(upGridDir, false);
          this.audio.playStep();
          this.showMessageToast('🎯 Position & Blickrichtung (⬆) hier verankert! Drehe dich & laufe los.');
        }
      });
    }

    // 2. Spielfeld drehen (90°)
    if (this.btnRotateField) {
      this.btnRotateField.addEventListener('click', () => this.rotateField());
    }

    // 3. Kachelgröße umschalten (3m / 4m / 5m)
    if (this.btnTileSize) {
      this.btnTileSize.addEventListener('click', () => this.toggleTileSize());
    }

    // Direktes Antippen des Spielfelds (Outdoor: Laterne & Blick drehen | Reviewer: Bewegen)
    if (this.canvas) {
      this.canvas.addEventListener('click', (e) => {
        this.requestSensorPermissions();
        this.handleCanvasClick(e);
      });
    }

    // Tastatursteuerung: WASD / Pfeiltasten nur im Reviewer-/Entwicklermodus aktiv
    window.addEventListener('keydown', (e) => {
      // Escape schließt alle offenen Modale
      if (e.key === 'Escape') {
        if (this.modalRules && this.modalRules.classList.contains('active')) {
          this.modalRules.classList.remove('active');
        }
        if (this.modalVictory && this.modalVictory.classList.contains('active')) {
          this.modalVictory.classList.remove('active');
        }
        if (this.modalVault && this.modalVault.classList.contains('active')) {
          this.modalVault.classList.remove('active');
        }
        return;
      }

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
          e.preventDefault();
          this.showMessageToast('🚶 Outdoor-Modus aktiv: Drehe dich mit dem Handy & laufe im echten Leben!');
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

    // Touch D-Pad Buttons (Reviewer-Modus)
    const bindTouch = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;
      let lastTouch = 0;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        lastTouch = Date.now();
        action();
      }, { passive: false });
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (Date.now() - lastTouch < 450) return;
        action();
      });
    };

    bindTouch('btn-touch-up', () => { if (this.isReviewerMode) this.executeMove(this.screenDirToGrid('up')); });
    bindTouch('btn-touch-down', () => { if (this.isReviewerMode) this.executeMove(this.screenDirToGrid('down')); });
    bindTouch('btn-touch-left', () => { if (this.isReviewerMode) this.executeMove(this.screenDirToGrid('left')); });
    bindTouch('btn-touch-right', () => { if (this.isReviewerMode) this.executeMove(this.screenDirToGrid('right')); });
    bindTouch('btn-touch-center', () => { if (this.isReviewerMode) this.executeMove(this.engine.player.facing); });
    bindTouch('btn-touch-undo', () => this.handleUndo());
    bindTouch('btn-touch-reset', () => this.handleReset());

    // Victory Modal Buttons & Backdrop
    const btnVicPyramid = document.getElementById('btn-victory-pyramid');
    if (btnVicPyramid) {
      btnVicPyramid.addEventListener('click', () => {
        this.modalVictory.classList.remove('active');
        this.showScreen('pyramid');
        this.renderPyramid();
      });
    }

    const btnVicNext = document.getElementById('btn-victory-next');
    if (btnVicNext) {
      btnVicNext.addEventListener('click', () => {
        this.modalVictory.classList.remove('active');
        const nextIndex = this.engine.currentLevelIndex + 1;
        if (nextIndex < LEVELS.length && this.engine.isLevelUnlocked(nextIndex)) {
          this.startLevel(nextIndex);
        } else {
          this.showScreen('pyramid');
          this.renderPyramid();
        }
      });
    }

    if (this.modalVictory) {
      this.modalVictory.addEventListener('click', (e) => {
        if (e.target === this.modalVictory) {
          this.modalVictory.classList.remove('active');
        }
      });
    }

    // Vault Modal Button, Backdrop & Kopieren
    if (this.btnOpenVault) {
      this.btnOpenVault.addEventListener('click', () => this.openFinalVault());
    }

    const btnCloseVault = document.getElementById('btn-close-vault');
    if (btnCloseVault) {
      btnCloseVault.addEventListener('click', () => {
        this.modalVault.classList.remove('active');
      });
    }

    if (this.modalVault) {
      this.modalVault.addEventListener('click', (e) => {
        if (e.target === this.modalVault) {
          this.modalVault.classList.remove('active');
        }
      });
    }

    const btnCopyCoords = document.getElementById('btn-copy-coords');
    if (btnCopyCoords) {
      btnCopyCoords.addEventListener('click', () => {
        const text = document.getElementById('final-coordinates-text')?.textContent || '';
        const showFeedback = () => {
          const fb = document.getElementById('copy-feedback');
          if (fb) {
            fb.style.display = 'block';
            setTimeout(() => { fb.style.display = 'none'; }, 2500);
          }
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          Promise.race([
            navigator.clipboard.writeText(text),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Clipboard timeout')), 250))
          ]).then(showFeedback).catch(() => {
            this.fallbackCopyText(text);
            showFeedback();
          });
        } else {
          this.fallbackCopyText(text);
          showFeedback();
        }
      });
    }

    // WakeLock bei Sichtbarkeit wiederherstellen
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.currentScreen === 'game') {
        this.requestWakeLock();
      }
    });
  }

  // Sensor-Berechtigungen (iOS Safari 13+) für Pedometer UND Kompass anfragen
  requestSensorPermissions() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        DeviceMotionEvent.requestPermission().then(res => {
          if (res === 'granted' && this.gps) {
            this.gps.startMotionSensor();
          }
        }).catch(() => {});
      } catch (e) {}
    }

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        DeviceOrientationEvent.requestPermission().then(res => {
          if (res === 'granted' && this.gps) {
            this.gps.startOrientationSensor();
          }
        }).catch(() => {});
      } catch (e) {}
    }
  }

  // Mappt Bildschirm-Richtungen unter Felddrehung auf interne Gitter-Richtung
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

  // Mappt interne Gitter-Richtung auf visuelle Bildschirm-Richtung
  gridDirToScreen(gridDir) {
    const rot = this.renderer ? this.renderer.rotation : 0;
    if (rot === 0) return gridDir;
    const dirs = ['up', 'right', 'down', 'left'];
    const gIdx = dirs.indexOf(gridDir);
    if (gIdx === -1) return gridDir;
    const steps = Math.round(rot / 90);
    const sIdx = (gIdx + steps + 4) % 4;
    return dirs[sIdx];
  }

  // Setzt die Blickrichtung der Figur und synchronisiert optional den Kompass-Referenzwinkel
  setPlayerFacing(gridDir, alignCompass = true) {
    if (!this.engine || !this.engine.player) return;
    this.engine.player.facing = gridDir;
    if (this.renderer && this.renderer.playerAnim) {
      this.renderer.playerAnim.facing = gridDir;
    }
    if (alignCompass && this.gps) {
      this.gps.alignCompassToDirection(gridDir);
    }
    this.updateHudStats();
    if (this.gps) {
      this.updateGpsTelemetry(this.gps.getState());
    }
  }

  // GPS & Sensor Callbacks einrichten (Kompass-Drehung, Pedometer & GPS-Telemetry)
  setupGpsCallbacks() {
    // 1. Live-Drehung der Spielfigur über den Smartphone-Kompass
    this.gps.onFacingChange = (gridDir, screenAngle) => {
      if (this.renderer) {
        this.renderer.setPlayerCompassAngle(screenAngle);
      }
      if (this.currentScreen !== 'game' || !this.engine || !this.engine.player || this.engine.isCompleted) return;

      if (this.engine.player.facing !== gridDir) {
        this.engine.player.facing = gridDir;
        if (this.renderer && this.renderer.playerAnim) {
          this.renderer.playerAnim.facing = gridDir;
        }
        this.updateHudStats();
      }
    };

    // 2. Wenn die Sensor-Fusion (Pedometer oder GPS) einen realen Schritt nach vorne registriert
    this.gps.onStepRequest = (dir) => {
      if (this.currentScreen !== 'game' || !this.engine || !this.engine.currentLevel || this.engine.isCompleted) {
        return false;
      }

      // Bewege die Figur in ihre aktuelle Blickrichtung (bzw. GPS-Richtung falls kein Kompass vorhanden)
      const moveDir = (this.gps.compass && this.gps.compass.hasSensor && this.engine.player)
        ? this.engine.player.facing
        : (dir || this.engine.player.facing);

      const screenDir = this.gridDirToScreen(moveDir);
      const dirNames = { up: 'NORD (⬆)', right: 'OST (➔)', down: 'SÜD (⬇)', left: 'WEST (⬅)' };
      this.showMessageToast(`🚶 Schritt ausgeführt: ${dirNames[screenDir] || screenDir}`);

      const res = this.executeMove(moveDir);
      return res && res.success;
    };

    // 3. Statusänderung des GPS-Empfängers
    this.gps.onStatusChange = (status, msg) => {
      this.updateGpsPill(status, msg);
    };

    // 4. Live-Aktualisierung von Distanz, Blickrichtung, Bewegung und Signal
    this.gps.onUpdate = (state) => {
      this.updateGpsTelemetry(state);
    };

    // 5. GPS-Signal kalibriert
    this.gps.onCalibrated = () => {
      if (this.currentScreen === 'game') {
        this.showMessageToast('🎯 GPS bereit! Drehe dich in deine Wunschrichtung & laufe los.');
        this.audio.playBoxOnGoal();
      }
    };
  }

  // Aktualisiert die Status-Pille im Header
  updateGpsPill(status, msg) {
    if (!this.gpsPill) return;
    this.gpsPill.className = `pill pill-gps ${status}`;
    if (this.gpsPillText) {
      if (status === 'ready') {
        this.gpsPillText.textContent = msg || 'GPS aktiv';
      } else if (status === 'calibrating') {
        this.gpsPillText.textContent = msg || 'Kalibriere...';
      } else if (status === 'weak') {
        this.gpsPillText.textContent = msg || 'Signal schwach';
      } else if (status === 'denied') {
        this.gpsPillText.textContent = 'GPS verweigert';
      } else if (status === 'error') {
        this.gpsPillText.textContent = msg || 'Kein GPS';
      } else {
        this.gpsPillText.textContent = msg || 'GPS sucht...';
      }
    }
  }

  // Aktualisiert den Live-Wegweiser & Telemetrie-Banner unter dem Spielfeld
  updateGpsTelemetry(state) {
    if (!this.navTargetVal || !state) return;

    const gridFacing = (this.engine && this.engine.player) ? this.engine.player.facing : (state.compassFacing || 'down');
    const screenFacing = this.gridDirToScreen(gridFacing);
    const dirLabels = {
      up: 'NORD (⬆)',
      right: 'OST (➔)',
      down: 'SÜD (⬇)',
      left: 'WEST (⬅)'
    };
    const facingText = dirLabels[screenFacing] || 'NORD (⬆)';
    const needDist = state.stepDistance || 2.0;
    const currentDist = state.currentWalkDistance || 0;

    if (state.status === 'denied' && !state.motionAvailable && !state.compassAvailable) {
      this.navTargetVal.textContent = '⚠️ Bitte Standort- & Sensorzugriff im Browser erlauben';
      if (this.navWalkInfo) this.navWalkInfo.textContent = 'Sensoren gesperrt';
      if (this.navMotionStatus) {
        this.navMotionStatus.textContent = 'Kein Signal';
        this.navMotionStatus.className = 'gps-anchor-badge';
      }
      return;
    }

    // Zeige immer die aktuelle Blickrichtung (in die der nächste Schritt beim Laufen geht!)
    this.navTargetVal.textContent = `🧭 Blick & Lauf: ${facingText}`;

    if (this.navWalkInfo) {
      if (state.strideCount > 0) {
        this.navWalkInfo.textContent = `🚶 ${currentDist.toFixed(1)}m / ${needDist.toFixed(1)}m (${state.strideCount}/${state.neededStrides})`;
      } else {
        this.navWalkInfo.textContent = `🚶 ${currentDist.toFixed(1)}m / ${needDist.toFixed(1)}m`;
      }
    }

    if (this.navMotionStatus) {
      if (state.strideCount > 0 || (state.motionAvailable && !state.still)) {
        this.navMotionStatus.textContent = '🚶 In Bewegung';
        this.navMotionStatus.className = 'gps-anchor-badge active';
      } else if (state.calibrating && !state.compassAvailable && !state.motionAvailable) {
        this.navMotionStatus.textContent = '⏳ Kalibriere';
        this.navMotionStatus.className = 'gps-anchor-badge';
      } else {
        this.navMotionStatus.textContent = '🛑 Stillstand';
        this.navMotionStatus.className = 'gps-anchor-badge';
      }
    }

    if (this.navAccuracyInfo) {
      if (state.accuracy !== null) {
        this.navAccuracyInfo.textContent = `±${Math.round(state.accuracy)}m`;
      } else if (state.compassAvailable || state.motionAvailable) {
        this.navAccuracyInfo.textContent = '🧭 Aktiv';
      } else {
        this.navAccuracyInfo.textContent = '±--m';
      }
    }
  }

  // Kachelgröße umschalten (3m / 4m / 5m)
  toggleTileSize() {
    const sizes = [3.0, 4.0, 5.0];
    const cur = this.engine.progress.tileSize || 4.0;
    const idx = sizes.indexOf(cur);
    const nextSize = sizes[(idx + 1) % sizes.length];

    this.engine.progress.tileSize = nextSize;
    this.engine.saveProgress();
    this.gps.setTileSize(nextSize);

    if (this.tileSizeVal) {
      this.tileSizeVal.textContent = `${nextSize}m`;
    }

    this.audio.playStep();
    this.showMessageToast(`📏 Kachelgröße auf ${nextSize}m geändert (Schritt bei ${(nextSize * 0.5).toFixed(1)}m)!`);
  }

  // Rotiert das gesamte Spielfeld um die Figur um 90°
  rotateField() {
    if (!this.renderer) return;
    const nextAngle = (this.renderer.rotation + 90) % 360;
    this.renderer.setRotation(nextAngle);
    this.gps.setGridBearing(nextAngle);

    if (this.rotationVal) {
      this.rotationVal.textContent = `${nextAngle}°`;
    }

    this.audio.playStep();
    this.showMessageToast(`🔄 Spielfeld um 90° gedreht (${nextAngle}°)`);
    this.updateHudStats();
  }

  // Dreht die Figur relativ um 90°
  turnPlayerRelative(counterClockwise = false) {
    if (!this.engine || !this.engine.player) return;
    const dirs = ['up', 'right', 'down', 'left'];
    const curIdx = dirs.indexOf(this.engine.player.facing);
    const nextIdx = (curIdx + (counterClockwise ? 3 : 1)) % 4;
    const newFacing = dirs[nextIdx];
    this.setPlayerFacing(newFacing, true);
    this.audio.playStep();
  }

  // Tippen auf das Spielfeld
  handleCanvasClick(e) {
    if (this.currentScreen !== 'game' || !this.engine || !this.renderer) return;

    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Drehung um das Spielfeld-Zentrum berücksichtigen
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const unrotPx = this.renderer.offsetX + (this.engine.player.x + 0.5) * this.renderer.tileSize;
    const unrotPy = this.renderer.offsetY + (this.engine.player.y + 0.5) * this.renderer.tileSize;

    const rotRad = this.renderer.rotation * (Math.PI / 180);
    const relX = unrotPx - centerX;
    const relY = unrotPy - centerY;
    const screenPx = centerX + (relX * Math.cos(rotRad) - relY * Math.sin(rotRad));
    const screenPy = centerY + (relX * Math.sin(rotRad) + relY * Math.cos(rotRad));

    const diffX = clickX - screenPx;
    const diffY = clickY - screenPy;

    let screenDir = null;
    if (Math.abs(diffX) >= Math.abs(diffY) && Math.abs(diffX) > this.renderer.tileSize * 0.25) {
      screenDir = diffX > 0 ? 'right' : 'left';
    } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > this.renderer.tileSize * 0.25) {
      screenDir = diffY > 0 ? 'down' : 'up';
    }

    if (screenDir) {
      const gridDir = this.screenDirToGrid(screenDir);
      if (this.isReviewerMode) {
        this.executeMove(gridDir);
      } else {
        // Im normalen Outdoor-Modus: Laterne & Blickrichtung zur angetippten Kachel drehen
        // und den Kompass-Referenzwinkel auf diese Richtung synchronisieren!
        this.setPlayerFacing(gridDir, true);
        this.audio.playStep();
        const dirNames = { up: 'NORD (⬆)', right: 'OST (➔)', down: 'SÜD (⬇)', left: 'WEST (⬅)' };
        this.showMessageToast(`🧭 Blickrichtung ausgerichtet: ${dirNames[screenDir] || screenDir}`);
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
      requestAnimationFrame(() => {
        if (this.renderer && this.currentScreen === 'game') {
          this.renderer.handleResize();
        }
      });
      this.gps.startTracking();
      this.gps.setPaused(false);
      this.requestWakeLock();
    } else {
      this.gps.setPaused(true);
      this.releaseWakeLock();
    }
  }

  // Startet ein bestimmtes Level
  startLevel(levelIndex) {
    if (!this.engine.isLevelUnlocked(levelIndex)) {
      this.showMessageToast('🔒 Dieser Stein ist noch versiegelt! Beide Fundamente darunter müssen gelöst sein.');
      this.audio.playBump();
      return;
    }

    this.requestSensorPermissions();
    this.engine.loadLevel(levelIndex);
    this.renderer.initAnimations();
    this.renderer.handleResize();

    // Kachelgröße und Drehung für dieses Level anwenden
    this.gps.startTracking();
    this.gps.setTileSize(this.engine.progress.tileSize || 4.0);
    this.gps.setGridBearing(this.renderer.rotation || 0);
    this.gps.setPaused(false);
    const shouldAnchorCompass = !this.gps.compass || this.gps.compass.anchorHeading === null;
    this.gps.reanchor(shouldAnchorCompass);

    // Falls der Kompass bereits aktiv ist, übernimmt die Figur sofort die reale Blickrichtung des Spielers
    if (this.gps.compass && this.gps.compass.hasSensor) {
      this.setPlayerFacing(this.gps.compass.facing, false);
    } else {
      this.gps.compass.facing = this.engine.player.facing;
    }

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
    this.updateGpsTelemetry(this.gps.getState());
  }

  // Führt einen Spielzug aus
  executeMove(direction) {
    if (!this.engine || !this.engine.currentLevel) return { success: false };

    const res = this.engine.move(direction);
    if (this.engine.player && this.gps && this.gps.compass) {
      this.gps.compass.facing = this.engine.player.facing;
    }
    this.renderer.onMoveExecuted(res);

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
        this.showMessageToast('🧱 Wand im Weg! Drehe dich in eine freie Richtung.');
      } else if (res.reason === 'blocked_box') {
        this.showMessageToast('📦 Kiste blockiert! Kann nicht weiter geschoben werden.');
      }
    }

    this.updateHudStats();
    if (this.gps) {
      this.updateGpsTelemetry(this.gps.getState());
    }
    return res;
  }

  handleUndo() {
    const res = this.engine.undo();
    if (res.success) {
      this.audio.playUndo();
      this.renderer.initAnimations();
      this.gps.setPaused(false);
      this.gps.reanchor(false);
      this.updateHudStats();
      this.showMessageToast('↩ Zug rückgängig gemacht');
    } else {
      this.showMessageToast('Kein Zug zum Rückgängigmachen vorhanden');
    }
  }

  handleReset() {
    this.engine.reset();
    this.audio.playUndo();
    this.renderer.initAnimations();
    this.gps.setPaused(false);
    this.gps.reanchor(false);
    this.updateHudStats();
    this.showMessageToast('🔄 Level zurückgesetzt');
  }

  updateHudStats() {
    if (this.hudStepCount) this.hudStepCount.textContent = this.engine.stepCount;
    if (this.hudPushCount) this.hudPushCount.textContent = this.engine.pushCount;

    if (this.hudFacingLabel && this.engine && this.engine.player) {
      const screenDir = this.gridDirToScreen(this.engine.player.facing);
      const facingMap = {
        up: '⬆ Nord',
        right: '➔ Ost',
        down: '⬇ Süd',
        left: '⬅ West'
      };
      this.hudFacingLabel.textContent = facingMap[screenDir] || facingMap[this.engine.player.facing];
    }
  }

  // Behandelt den Sieg eines Levels
  handleWin() {
    // Pausiere GPS/Pedometer während der Sieges-Sequenz
    if (this.gps) {
      this.gps.setPaused(true);
    }

    setTimeout(() => {
      const vicName = document.getElementById('victory-level-name');
      if (vicName) vicName.textContent = `Level ${this.engine.currentLevel.id}: ${this.engine.currentLevel.name}`;
      const vicSteps = document.getElementById('victory-steps');
      if (vicSteps) vicSteps.textContent = this.engine.stepCount;
      const vicPushes = document.getElementById('victory-pushes');
      if (vicPushes) vicPushes.textContent = this.engine.pushCount;
      const completedCount = this.engine.progress.completedLevels.length;
      const vicToken = document.getElementById('victory-token');
      if (vicToken) vicToken.textContent = `Gespeichert (${completedCount}/15)`;
      this.modalVictory.classList.add('active');

      // Prüfen ob alle 15 gelöst
      if (this.engine.areAllLevelsCompleted()) {
        setTimeout(() => this.openFinalVault(), 1200);
      }
    }, 400);
  }

  // Rendert die 15-Level-Pyramide (5-4-3-2-1)
  renderPyramid() {
    if (!this.pyramidGrid) return;
    this.pyramidGrid.innerHTML = '';

    const tiersStructure = [
      [14],                 // Stufe 5: Extrem (Level 15)
      [12, 13],             // Stufe 4: Sehr hoch (Level 13-14)
      [9, 10, 11],          // Stufe 3: Hoch (Level 10-12)
      [5, 6, 7, 8],         // Stufe 2: Mittel (Level 6-9)
      [0, 1, 2, 3, 4]       // Stufe 1: Leicht (Level 1-5 Basis)
    ];

    tiersStructure.forEach((rowIndices) => {
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
            this.showMessageToast(`🔒 Level ${lvl.id} ist noch versiegelt! Beide Fundamente darunter müssen gelöst sein.`);
            this.audio.playBump();
          }
        });

        rowEl.appendChild(stone);
      });

      this.pyramidGrid.appendChild(rowEl);
    });

    // Fortschrittsbalken aktualisieren
    const completedCount = this.engine.progress.completedLevels.length;
    if (this.progressCount) this.progressCount.textContent = `${completedCount} / 15`;
    const percent = Math.round((completedCount / 15) * 100);
    if (this.progressBarFill) this.progressBarFill.style.width = `${percent}%`;

    // Tresor-Status
    if (this.engine.areAllLevelsCompleted()) {
      if (this.btnOpenVault) {
        this.btnOpenVault.disabled = false;
        this.btnOpenVault.classList.add('btn-glow');
      }
      if (this.vaultBannerStatus) {
        this.vaultBannerStatus.textContent = '⚡ Alle 15 Siegel gebrochen! Der Tresor kann jetzt geöffnet werden!';
      }
    } else {
      if (this.btnOpenVault) {
        this.btnOpenVault.disabled = true;
        this.btnOpenVault.classList.remove('btn-glow');
      }
      if (this.vaultBannerStatus) {
        this.vaultBannerStatus.textContent = `Noch ${15 - completedCount} Level bis zur Entschlüsselung des Finals.`;
      }
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
      this.showMessageToast(`🔒 Zugriff verweigert: ${result.reason}`);
      this.audio.playBump();
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

    if (this.renderer && this.currentScreen === 'game') {
      this.renderer.handleResize();
    }

    this.audio.playSecretUnlock();
    this.showMessageToast('⚡ Reviewer-Modus aktiviert! Tastatur & Touch D-Pad freigeschaltet.');
  }

  // Toast-Feedback
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
        max-width: 90vw;
        text-align: center;
        pointer-events: none;
        line-height: 1.4;
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

  // Screen Wake Lock API
  async requestWakeLock() {
    if ('wakeLock' in navigator && !this.wakeLock) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
      } catch (e) {}
    }
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }

  // Fallback Kopieren für Umgebungen ohne Clipboard API
  fallbackCopyText(text) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (e) {
      console.warn('Fallback Copy fehlgeschlagen:', e);
    }
  }

  // 60 FPS Render-Loop
  startRenderLoop() {
    const loop = (time) => {
      if (this.currentScreen === 'game' && this.renderer) {
        this.renderer.render(time);
      }
      // Regelmäßiger Tick der GPS-Engine (Erkennung von Signalverlust & Pedometer-Timeout)
      if (time - this.lastTickTime > 500) {
        this.lastTickTime = time;
        if (this.gps) this.gps.tick();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// App sicher starten
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