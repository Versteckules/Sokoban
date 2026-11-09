// SOKOBAN MAIN CONTROLLER & APPLICATION LIFECYCLE
// Verbindet Engine, Renderer, GPS & Sensor-Fusion (Kompass + Pedometer + GPS), Audio, UI & Krypto-Tresor
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
