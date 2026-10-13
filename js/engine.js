// SOKOBAN CORE ENGINE
// Verwaltung von Spielzustand, Zügen, Undo-Stack, Pyramiden-Abhängigkeiten und Persistenz
// Ersteller: versteckules

import { LEVELS, PYRAMID_GRAPH } from './levels.js';

export const CELL = {
  FLOOR: 0,
  WALL: 1,
  GOAL: 2,
  BOX: 3,
  BOX_ON_GOAL: 4
};

export class SokobanEngine {
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
      return { success: false, reason: 'wall', target: { x: targetX, y: targetY } };
    }

    // 2. Prüfe ob Kiste auf Zielfeld steht
    const boxIndex = this.getBoxIndexAt(targetX, targetY);

    if (boxIndex !== -1) {
      // Spieler möchte eine Kiste schieben
      const boxTargetX = targetX + dx;
      const boxTargetY = targetY + dy;

      // Kann Kiste geschoben werden? (keine Wand und keine weitere Kiste dahinter)
      if (this.isWall(boxTargetX, boxTargetY) || this.getBoxIndexAt(boxTargetX, boxTargetY) !== -1) {
        return { success: false, reason: 'blocked_box', target: { x: boxTargetX, y: boxTargetY } };
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
