// SOKOBAN HIGH-END CANVAS RENDERER & PARTICLE SYSTEM
// Echte Texturen (Mauern, Boden, Kisten), animierter Abenteurer-Charakter, Feld-Drehung & Partikel
// Ersteller: versteckules

import { CELL } from './engine.js';
import { TIER_CONFIG } from './levels.js';

export class SokobanRenderer {
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
    // No-op: Figur wird über 4-Wege-Blickrichtung und Spielfeld-Drehung gesteuert
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

    const facing = (this.engine && this.engine.player) ? this.engine.player.facing : (p.facing || 'down');

    this.ctx.save();
    this.ctx.translate(cx, cy);
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

    // Richtungs-Sprite auswählen
    let sprite = this.assets.playerDown;
    if (facing === 'up') sprite = this.assets.playerUp;
    else if (facing === 'left') sprite = this.assets.playerLeft;
    else if (facing === 'right') sprite = this.assets.playerRight;

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
    this.renderFacingIndicator(facing, s);

    this.ctx.restore();
  }

  // Zeichnet einen edlen goldenen Richtungspfeil vor der Figur
  renderFacingIndicator(facing, s) {
    this.ctx.save();
    let angle = 0;
    if (facing === 'right') angle = 0;
    else if (facing === 'down') angle = Math.PI / 2;
    else if (facing === 'left') angle = Math.PI;
    else if (facing === 'up') angle = -Math.PI / 2;

    this.ctx.rotate(angle);
    const dist = s * 0.42;
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.shadowColor = '#f59e0b';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(dist + s * 0.22, 0);
    this.ctx.lineTo(dist, -s * 0.12);
    this.ctx.lineTo(dist + s * 0.05, 0);
    this.ctx.lineTo(dist, s * 0.12);
    this.ctx.closePath();
    this.ctx.fill();
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
    ctx.font = 'bold 9px var(--font-mono, monospace)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('N', 0, -r + 4);

    ctx.restore();
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}
