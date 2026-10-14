// GPS OUTDOOR ENGINE (Geocaching Edition)
// Erkennt echte Fortbewegung im Freien ohne Geister-Schritte
// Ersteller: versteckules

export class GpsEngine {
  constructor(options = {}) {
    this.watchId = null;
    this.isTracking = false;
    this.hasPermission = false;
    this.status = 'idle'; // 'idle', 'searching', 'locked', 'denied', 'error'
    this.accuracy = 999;
    this.lastPosition = null;

    // Referenzpunkt für Schritt-Erkennung
    this.stepOriginCoord = null;
    this.prevStepCoord = null;

    // Live-Distanz zum aktuellen Schritt
    this.currentWalkDistance = 0;

    // Schritt-Schwelle: 2.0 Meter echte Ortsveränderung (ca. 2.5 bis 3 Schritte im Freien)
    this.stepThresholdMeters = options.stepThreshold || 2.0;

    // Cooldown gegen Doppelschritte (mindestens 1000ms)
    this.lastStepTime = -10000;
    this.stepCooldownMs = 1000;

    // Schrittzähler über Pedometer / Accelerometer (DeviceMotion)
    this.motionStepsCount = 0;
    this.lastMotionPeakTime = 0;
    this.isMotionListening = false;

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
    this.prevStepCoord = null;
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
    this.prevStepCoord = null;
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
      this.isMotionListening = false;
    }
  }

  // Erkennt physische Schritte über den Beschleunigungssensor (Stoß beim Gehen)
  handleDeviceMotion(e) {
    if (!this.isTracking) return;
    const acc = e.accelerationIncludingGravity || e.acceleration;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;
    const mag = Math.sqrt(x * x + y * y + z * z);

    // Erdanziehung abziehen (~9.81 m/s²)
    const delta = Math.abs(mag - 9.81);
    const now = performance.now();

    // Typischer Schritt-Peak beim Laufen: Delta > 2.0 m/s² mit min. 320ms Intervall
    if (delta > 2.0 && (now - this.lastMotionPeakTime > 320)) {
      this.lastMotionPeakTime = now;
      this.motionStepsCount++;
    }
  }

  // Verarbeitet GPS-Positionsänderungen
  handlePositionUpdate(pos) {
    this.lastPosition = pos;
    this.accuracy = pos.coords.accuracy || 999;
    this.hasPermission = true;

    const currentLat = pos.coords.latitude;
    const currentLon = pos.coords.longitude;

    // Erster GPS-Fix: Als Ausgangspunkt setzen
    if (!this.stepOriginCoord) {
      this.stepOriginCoord = { lat: currentLat, lon: currentLon };
      this.setStatus('locked', `GPS aktiv (±${Math.round(this.accuracy)}m) | 0.0m / ${this.stepThresholdMeters}m`);
      if (this.onLocationUpdate) this.onLocationUpdate(pos, 0);
      return;
    }

    // Distanz ZUM AUSGANGSPUNKT in Metern berechnen
    const distFromOrigin = this.haversineMeters(
      this.stepOriginCoord.lat,
      this.stepOriginCoord.lon,
      currentLat,
      currentLon
    );
    this.currentWalkDistance = distFromOrigin;

    // Status-Update mit Live-Distanzanzeige
    const distText = `${distFromOrigin.toFixed(1)}m / ${this.stepThresholdMeters}m`;
    if (this.accuracy <= 25) {
      this.setStatus('locked', `GPS aktiv (±${Math.round(this.accuracy)}m) | 🚶 ${distText}`);
    } else if (this.accuracy <= 45) {
      this.setStatus('searching', `GPS (±${Math.round(this.accuracy)}m) | 🚶 ${distText}`);
    } else {
      this.setStatus('searching', `Signal schwach (±${Math.round(this.accuracy)}m) | 🚶 ${distText}`);
    }

    const now = performance.now();

    // Schritt auslösen wenn:
    // a) Echte gegangene Distanz >= 2.0m (oder 2 Beschleunigungsschritte bei mind. 1.2m Distanz)
    // b) Genauigkeit akzeptabel (<= 45m)
    // c) Keine extreme Teleportation (> 50m)
    // d) Cooldown abgelaufen (mind. 1000ms)
    const thresholdReached = (distFromOrigin >= this.stepThresholdMeters) || 
                             (this.motionStepsCount >= 2 && distFromOrigin >= 1.2);

    if (
      thresholdReached &&
      distFromOrigin < 50 &&
      this.accuracy <= 45 &&
      (now - this.lastStepTime >= this.stepCooldownMs)
    ) {
      this.lastStepTime = now;
      this.motionStepsCount = 0;
      const originCoord = { ...this.stepOriginCoord };
      this.prevStepCoord = { ...this.stepOriginCoord };
      this.stepOriginCoord = { lat: currentLat, lon: currentLon };

      // Berechne die reale Himmelsrichtung des gelaufenen Schritts
      // 0° = Norden, 90° = Osten, 180° = Süden, 270° = Westen
      const bearing = this.calculateBearing(
        originCoord.lat,
        originCoord.lon,
        currentLat,
        currentLon
      );

      this.triggerHaptic(50);
      if (this.onStepTriggered) {
        this.onStepTriggered(bearing, distFromOrigin);
      }
    } else if (distFromOrigin >= 50) {
      // Satelliten-Sprung abgefangen: Ausgangspunkt neu kalibrieren
      this.stepOriginCoord = { lat: currentLat, lon: currentLon };
      this.motionStepsCount = 0;
    }

    if (this.onLocationUpdate) {
      this.onLocationUpdate(pos, distFromOrigin);
    }
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

  // Manuelles Auslösen (für Tests)
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
