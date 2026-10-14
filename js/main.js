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
    this.lastManualTurnTime = 0;
    this.lastCompassHeading = null;
    this.hasActiveCompass = false;
    this.lastCompassTime = 0;
    this.orientationHandler = null;

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
      });
    }

    if (this.btnTurnRight) {
      this.btnTurnRight.addEventListener('click', () => {
        this.requestSensorPermissions();
        this.turnPlayerRelative(false); // 90° nach rechts drehen
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
    this.orientationHandler = (e) => {
      if (this.currentScreen !== 'game' || !this.engine || !this.engine.player) return;

      // Wenn der Spieler vor weniger als 2.2 Sekunden manuell gedreht hat: Kompass pausieren
      const now = performance.now();
      if (now - this.lastManualTurnTime < 2200) return;

      let heading = null;
      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
        heading = e.webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        heading = (360 - e.alpha) % 360;
      }

      if (heading === null || isNaN(heading)) return;

      this.hasActiveCompass = true;
      this.lastCompassTime = now;

      // Zitter-Filter: Micro-Bewegungen unter 2.0 Grad dämpfen
      if (this.lastCompassHeading !== null && Math.abs(heading - this.lastCompassHeading) < 2.0) {
        return;
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
      }

      if (this.renderer) {
        this.renderer.setCompassHeadingAngle(gridAngle);
      }
    };

    window.addEventListener('deviceorientation', this.orientationHandler, true);
    window.addEventListener('deviceorientationabsolute', this.orientationHandler, true);

    const enterBtn = document.getElementById('btn-enter-pyramid');
    if (enterBtn) enterBtn.addEventListener('click', () => this.requestSensorPermissions(), { once: true });
    if (this.canvas) {
      this.canvas.addEventListener('touchstart', () => this.requestSensorPermissions(), { once: true, passive: true });
    }
  }

  // Fragt Sensor-Berechtigungen (iOS Safari) für Kompass und Pedometer-Beschleunigungsmesser ab
  requestSensorPermissions() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(res => {
        if (res === 'granted' && this.orientationHandler) {
          window.addEventListener('deviceorientation', this.orientationHandler, true);
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
        // Standard & Primär: Die aktuelle Blickrichtung des Spielers (Kompass & Tasten)
        let targetDir = this.engine.player.facing;

        // Falls kein aktiver Kompass läuft und eine signifikante GPS-Peilung vorliegt:
        const hasCompass = this.hasActiveCompass && (performance.now() - (this.lastCompassTime || 0) < 4000);
        if (!hasCompass && bearing !== null && bearing !== undefined) {
          const gpsDir = this.bearingToGridDir(bearing);
          if (gpsDir) targetDir = gpsDir;
        }

        const dirNames = { up: 'NORD', right: 'OST', down: 'SÜD', left: 'WEST' };
        this.showMessageToast(`🚶 Schritt ausgeführt: ${dirNames[targetDir] || targetDir}`);
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
        // Im normalen Outdoor-Modus: Nur Blick & Laterne drehen (keine Bewegung ohne echte Schritte!)
        if (this.engine.player.facing !== gridDir) {
          this.engine.player.facing = gridDir;
          if (this.renderer && this.renderer.playerAnim) {
            this.renderer.playerAnim.facing = gridDir;
          }
          this.lastManualTurnTime = performance.now();
          this.audio.playStep();
          this.updateHudStats();
          if (this.gps) {
            this.gps.onDirectionChanged(gridDir);
          }
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
