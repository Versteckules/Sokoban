// GPS & MOVEMENT ENGINE (Outdoor Geocaching Edition)
// Erkennt echte Bewegung im Freien (GPS-Distanz & Schritt-Sensor)
// Ersteller: versteckules

export class GpsEngine {
  constructor(options = {}) {
    this.watchId = null;
    this.isTracking = false;
    this.hasPermission = false;
    this.status = 'idle'; // 'idle', 'searching', 'locked', 'denied', 'error'
    this.accuracy = 999;
    this.lastPosition = null;

    // Distanz-Akkumulator für GPS-Laufschritte
    this.lastGpsCoord = null;
    this.accumulatedDistance = 0;
    this.stepThresholdMeters = options.stepThreshold || 2.0; // Ca. 2-3 reale Schritte

    // Bewegungssensor (Beschleunigungsmesser / Pedometer)
    this.motionHandler = null;
    this.lastMotionPeak = 0;
    this.motionStepCount = 0;

    // Cooldown gegen Doppelschritte
    this.lastStepTime = 0;
    this.stepCooldownMs = 600;

    // Callbacks
    this.onLocationUpdate = null;
    this.onStepTriggered = null;
    this.onStatusChange = null;

    // Kompatibilitäts-Eigenschaften
    this.anchor = { active: true };
    this.rotationAngle = 0;
    this.tileSize = 4.0;
  }

  // Startet GPS und Bewegungssensor
  startTracking() {
    if (this.isTracking) return true;
    this.isTracking = true;

    this.accumulatedDistance = 0;
    this.lastGpsCoord = null;

    // 1. Geolocation API starten
    if ('geolocation' in navigator) {
      this.setStatus('searching', 'Satelliten werden gesucht...');
      try {
        this.watchId = navigator.geolocation.watchPosition(
          (pos) => this.handlePositionUpdate(pos),
          (err) => this.handleError(err),
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 12000
          }
        );
      } catch (e) {
        this.setStatus('error', 'GPS nicht verfügbar');
      }
    } else {
      this.setStatus('idle', 'Kein GPS auf diesem Gerät');
    }

    // 2. DeviceMotion Pedometer starten (Smartphone-Schritterkennung beim Gehen)
    this.initMotionSensor();

    return true;
  }

  // Stoppt das Tracking
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.motionHandler && window.removeEventListener) {
      window.removeEventListener('devicemotion', this.motionHandler);
      this.motionHandler = null;
    }
    this.isTracking = false;
    this.setStatus('idle', 'Standorterfassung pausiert');
  }

  // Initialisiert den Smartphone-Beschleunigungssensor für Schritt-Erkennung
  initMotionSensor() {
    if (typeof window === 'undefined' || !window.DeviceMotionEvent) return;

    this.motionHandler = (e) => {
      if (!this.isTracking) return;
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      const mag = Math.hypot(x, y, z);
      const now = performance.now();

      // Schritt-Stoß-Erkennung: Charakteristische Spitzen beim Laufen (~12.6 m/s²)
      if (mag > 12.6 && (now - this.lastMotionPeak) > 320 && (now - this.lastMotionPeak) < 1800) {
        this.lastMotionPeak = now;
        this.motionStepCount++;

        // Bei 2 erkannten Fußtritten (ein voller Geh-Schritt) einen Spielfeld-Schritt auslösen
        if (this.motionStepCount >= 2) {
          this.motionStepCount = 0;
          this.triggerStep('motion');
        }
      }
    };

    window.addEventListener('devicemotion', this.motionHandler, { passive: true });
  }

  // Verarbeitet GPS-Positionsänderungen
  handlePositionUpdate(pos) {
    this.lastPosition = pos;
    this.accuracy = pos.coords.accuracy || 999;
    this.hasPermission = true;

    if (this.accuracy <= 25) {
      this.setStatus('locked', `GPS aktiv (±${Math.round(this.accuracy)}m)`);
    } else {
      this.setStatus('searching', `Suche Signal (±${Math.round(this.accuracy)}m)`);
    }

    const { latitude, longitude } = pos.coords;

    if (this.lastGpsCoord) {
      const dist = this.haversineMeters(this.lastGpsCoord.lat, this.lastGpsCoord.lon, latitude, longitude);

      // Filter: Kleine Schwankungen (< 0.7m) im Stillstand ignorieren
      if (dist >= 0.7 && dist < 35) {
        this.accumulatedDistance += dist;
        this.lastGpsCoord = { lat: latitude, lon: longitude };

        // Sobald Schwellenwert (z.B. 2 Meter) erlaufen wurde: Schritt ausführen!
        if (this.accumulatedDistance >= this.stepThresholdMeters) {
          this.accumulatedDistance = 0;
          this.triggerStep('gps');
        }
      } else if (dist >= 35) {
        // Großer Sprung (z.B. Neu-Lock der Satelliten)
        this.lastGpsCoord = { lat: latitude, lon: longitude };
      }
    } else {
      this.lastGpsCoord = { lat: latitude, lon: longitude };
    }

    if (this.onLocationUpdate) {
      this.onLocationUpdate({
        coords: pos.coords,
        accuracy: this.accuracy,
        status: this.status
      });
    }
  }

  // Löst einen echten Schritt im Spiel aus
  triggerStep(source = 'walk') {
    const now = performance.now();
    if (now - this.lastStepTime < this.stepCooldownMs) return;
    this.lastStepTime = now;

    this.triggerHaptic(45);
    if (this.onStepTriggered) {
      this.onStepTriggered();
    }
  }

  // Haversine-Distanz zwischen zwei GPS-Punkten in Metern
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

  // Kompatibilitäts-Stubs
  setAnchor(playerPos) {
    this.lastGpsCoord = this.lastPosition ? { lat: this.lastPosition.coords.latitude, lon: this.lastPosition.coords.longitude } : null;
    this.accumulatedDistance = 0;
    return { success: true, message: 'Position kalibriert!' };
  }

  setRotation(angle) {
    this.rotationAngle = angle;
  }

  setTileSize(size) {
    this.stepThresholdMeters = Math.max(1.5, Math.min(4.0, size * 0.6));
  }

  syncPlayerTile(x, y) {}

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
      this.setStatus('denied', 'GPS-Zugriff verweigert');
    } else {
      this.setStatus('searching', 'Suche GPS-Signal...');
    }
  }

  setStatus(status, message) {
    this.status = status;
    if (this.onStatusChange) {
      this.onStatusChange(status, message);
    }
  }
}
