// GPS OUTDOOR ENGINE (Geocaching Edition)
// Erkennt echte Fortbewegung im Freien ohne Geister-Schritte & reagiert direkt auf Richtungswechsel
// Ersteller: versteckules

export class GpsEngine {
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
