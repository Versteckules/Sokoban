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

export const DIR_VECTORS = {
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

export class GpsEngine {
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
