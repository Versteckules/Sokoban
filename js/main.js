// SOKOBAN MAIN CONTROLLER & APPLICATION LIFECYCLE
// Verbindet Engine, Renderer, GPS, Audio, UI & Krypto-Tresor
// Ersteller: versteckules

import { LEVELS, TIER_CONFIG } from './levels.js';
import { SokobanEngine } from './engine.js';
import { SokobanRenderer } from './renderer.js';
import { AudioManager } from './audio.js';
import { GpsEngine } from './gps.js';
import { CryptoVault } from './crypto.js';

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

    // GPS & Controls
    this.gpsPill = document.getElementById('gps-pill');
    this.gpsPillText = document.getElementById('gps-pill-text');
    this.gpsAccIndicator = document.getElementById('gps-acc-indicator');
    this.rotationVal = document.getElementById('rotation-val');
    this.selectTileSize = document.getElementById('select-tile-size');
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

    // Reale Smartphone-Kompass-Drehung (deviceorientation)
    window.addEventListener('deviceorientation', (e) => {
      if (this.currentScreen !== 'game' || !this.renderer) return;
      let heading = null;
      if (e.webkitCompassHeading !== undefined) {
        heading = e.webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        heading = (360 - e.alpha) % 360;
      }
      if (heading !== null) {
        this.renderer.setPlayerCompassAngle(heading);
      }
    }, true);

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

    // GPS Controls & VISUELLES DREHEN
    document.getElementById('btn-set-anchor').addEventListener('click', () => {
      const res = this.gps.setAnchor(this.engine.player);
      if (res.success) {
        this.showMessageToast(res.message);
      } else {
        alert(res.message);
      }
    });

    document.getElementById('btn-rotate-field').addEventListener('click', () => {
      const nextAngle = (this.renderer.rotation + 90) % 360;
      this.renderer.setRotation(nextAngle);
      this.renderer.handleResize();
      this.gps.setRotation(nextAngle);
      this.rotationVal.textContent = `${nextAngle}°`;
      this.showMessageToast(`Spielfeld gedreht auf ${nextAngle}°`);
    });

    this.selectTileSize.addEventListener('change', (e) => {
      const size = parseFloat(e.target.value);
      this.gps.setTileSize(size);
      this.showMessageToast(`Kachelgröße: ${size}m pro Schritt`);
    });

    // Tastatursteuerung (Pfeiltasten & WASD nur im Reviewer-Modus! Z=Undo, R=Reset immer)
    window.addEventListener('keydown', (e) => {
      if (this.currentScreen !== 'game') return;

      const key = e.key.toLowerCase();
      const moveKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'];

      if (moveKeys.includes(key)) {
        e.preventDefault();
        if (!this.isReviewerMode) {
          this.showMessageToast('🚶 GPS-Outdoor-Modus aktiv: Laufe draußen um zu steuern! (Reviewer-Modus: 10x auf Hauptbild tippen)');
          return;
        }

        if (key === 'arrowup' || key === 'w') this.executeMove('up', false);
        else if (key === 'arrowdown' || key === 's') this.executeMove('down', false);
        else if (key === 'arrowleft' || key === 'a') this.executeMove('left', false);
        else if (key === 'arrowright' || key === 'd') this.executeMove('right', false);
        return;
      }

      if (key === 'z') { e.preventDefault(); this.handleUndo(); }
      else if (key === 'r') { e.preventDefault(); this.handleReset(); }
    });

    // Touch D-Pad Buttons
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

    bindTouch('btn-touch-up', () => this.executeMove('up', false));
    bindTouch('btn-touch-down', () => this.executeMove('down', false));
    bindTouch('btn-touch-left', () => this.executeMove('left', false));
    bindTouch('btn-touch-right', () => this.executeMove('right', false));
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
  }

  // GPS Callbacks einrichten
  setupGpsCallbacks() {
    this.gps.onLocationUpdate = (data) => {
      const acc = Math.round(data.accuracy);
      this.gpsAccIndicator.textContent = `Genauigkeit: ±${acc}m`;
      if (this.renderer) {
        this.renderer.gpsOverlay.accuracy = acc;
      }
    };

    this.gps.onStepTriggered = (direction) => {
      if (this.currentScreen === 'game') {
        this.executeMove(direction, true); // Echter GPS-Schritt im Freien
      }
    };

    this.gps.onStatusChange = (status, msg) => {
      this.gpsPill.className = `pill pill-gps ${status}`;
      this.gpsPillText.textContent = status === 'locked' ? 'GPS Signal stark' : (status === 'searching' ? 'GPS sucht...' : 'GPS inaktiv');
    };
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
    } else {
      this.gps.stopTracking();
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

    // GPS vorbereiten
    this.gps.anchor = null;
    this.showScreen('game');

    // Hinweis zur Verankerung
    setTimeout(() => {
      if (!this.gps.anchor) {
        this.showMessageToast('Tippe auf "🎯 Hier verankern", um deinen Startpunkt festzulegen!');
      }
    }, 400);
  }

  // Rechnet Bildschirm-Richtung anhand des aktuellen Drehwinkels in Grid-Richtung um
  mapScreenDirectionToGrid(direction, rotation = 0) {
    const dirs = ['up', 'right', 'down', 'left'];
    const d = direction.toLowerCase();
    let baseIndex = -1;
    if (d === 'up' || d === 'h' || d === 'hoch') baseIndex = 0;
    else if (d === 'right' || d === 're' || d === 'rechts') baseIndex = 1;
    else if (d === 'down' || d === 'r' || d === 'runter') baseIndex = 2;
    else if (d === 'left' || d === 'l' || d === 'links') baseIndex = 3;
    if (baseIndex === -1) return direction;

    const rotSteps = (Math.round((rotation % 360) / 90) % 4 + 4) % 4;
    const mappedIndex = (baseIndex + rotSteps) % 4;
    return dirs[mappedIndex];
  }

  // Führt einen Spielzug aus
  executeMove(direction, isGps = false) {
    // Normaler Geocaching-Modus: Tastatur/Touch blockieren, nur GPS darf steuern!
    if (!isGps && !this.isReviewerMode) {
      this.showMessageToast('🚶 GPS-Outdoor-Modus aktiv: Laufe draußen um zu steuern! (Reviewer-Modus: 10x auf Hauptbild tippen)');
      return;
    }
    const mappedDir = this.mapScreenDirectionToGrid(direction, this.renderer ? this.renderer.rotation : 0);
    const res = this.engine.move(mappedDir);
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
      this.audio.playBump();
      this.gps.triggerCollisionHaptic();
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
    this.touchDpadContainer.style.display = 'flex';
    this.reviewerBanner.style.display = 'block';
    setTimeout(() => {
      this.reviewerBanner.style.display = 'none';
    }, 4000);

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

// App starten sobald DOM geladen ist
window.addEventListener('DOMContentLoaded', () => {
  window.app = new SokobanApp();
});
