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
    this.lastCoord = null;

    // Distanz-Tracking
    this.currentWalkDistance = 0;
    this.accumulatedDistance = 0;

    // Schritt-Schwelle: 1.8 Meter echte Ortsveränderung oder 3 echte Pedometer-Schritte
    this.stepThresholdMeters = options.stepThreshold || 1.8;
    this.targetMotionSteps = options.targetMotionSteps || 3;

    // Cooldown gegen Doppelschritte (750ms für geschmeidige Reaktion)
    this.lastStepTime = -10000;
    this.stepCooldownMs = 750;

    // Schrittzähler über Pedometer / Accelerometer (DeviceMotion)
    this.motionStepsCount = 0;
    this.lastMotionPeakTime = 0;
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
    this.lastCoord = null;
    this.prevStepCoord = null;
    this.currentWalkDistance = 0;
    this.accumulatedDistance = 0;
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
    this.lastCoord = null;
    this.prevStepCoord = null;
    this.currentWalkDistance = 0;
    this.accumulatedDistance = 0;
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
    // 1. Wenn acceleration ohne Gravitation vorliegt (Android & manche iOS Versionen)
    if (e.acceleration && e.acceleration.x !== null && (e.acceleration.x !== 0 || e.acceleration.y !== 0 || e.acceleration.z !== 0)) {
      const ax = acc.x || 0;
      const ay = acc.y || 0;
      const az = acc.z || 0;
      dynamicMag = Math.sqrt(ax * ax + ay * ay + az * az);
    } else if (e.accelerationIncludingGravity) {
      // 2. Gravitations-Filterung (Tiefpassfilter zur Erdanziehungs-Trennung)
      const gx = acc.x || 0;
      const gy = acc.y || 0;
      const gz = acc.z || 0;
      const rawMag = Math.sqrt(gx * gx + gy * gy + gz * gz);
      this.gravityFilter = 0.88 * this.gravityFilter + 0.12 * rawMag;
      dynamicMag = Math.abs(rawMag - this.gravityFilter);
    }

    const now = performance.now();

    // Schritt-Erkennung:
    // Beim Gehen mit Smartphone in der Hand (Blick aufs Display) liegt die dynamische Beschleunigung bei ca. 1.15 bis 2.8 m/s²
    // Kadenz: Minimal 300ms (schneller Schritt) bis maximal 1800ms
    if (dynamicMag >= 1.20 && (now - this.lastMotionPeakTime >= 300)) {
      // Wenn letzter Schritt länger als 2500ms her ist, fängt eine neue Geh-Sequenz an
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
      this.lastCoord = { lat: currentLat, lon: currentLon };
      this.updateStatusDisplay();
      if (this.onLocationUpdate) this.onLocationUpdate(pos, 0);
      return;
    }

    // Inkrementelle Distanz seit letztem GPS-Punkt (akkumulierte Bewegung)
    if (this.lastCoord) {
      const delta = this.haversineMeters(this.lastCoord.lat, this.lastCoord.lon, currentLat, currentLon);
      // Filter gegen GPS-Standstill-Noise (unter 0.25m ist Jitter, über 35m ist Satelliten-Sprung)
      if (delta >= 0.25 && delta <= 35 && this.accuracy <= 50) {
        this.accumulatedDistance += delta;
        this.lastCoord = { lat: currentLat, lon: currentLon };
      }
    } else {
      this.lastCoord = { lat: currentLat, lon: currentLon };
    }

    // Radialer Abstand zum Referenzpunkt
    const distFromOrigin = this.haversineMeters(
      this.stepOriginCoord.lat,
      this.stepOriginCoord.lon,
      currentLat,
      currentLon
    );

    // Gesamte effektive Gehdistanz für diesen Schritt
    this.currentWalkDistance = Math.max(distFromOrigin, this.accumulatedDistance);

    this.updateStatusDisplay();

    // Satelliten-Sprung abfangen (> 45m)
    if (distFromOrigin >= 45) {
      this.stepOriginCoord = { lat: currentLat, lon: currentLon };
      this.lastCoord = { lat: currentLat, lon: currentLon };
      this.accumulatedDistance = 0;
      this.motionStepsCount = 0;
      return;
    }

    // Prüfe Schritt-Trigger
    this.checkStepTrigger();

    if (this.onLocationUpdate) {
      this.onLocationUpdate(pos, this.currentWalkDistance);
    }
  }

  // Prüft alle Schritt-Trigger-Bedingungen (Sensor-Fusion)
  checkStepTrigger() {
    const now = performance.now();
    if (now - this.lastStepTime < this.stepCooldownMs) return;

    const currentDist = this.currentWalkDistance;
    const speed = (this.lastPosition && this.lastPosition.coords && this.lastPosition.coords.speed) || 0;
    const hasOutdoorGps = this.accuracy <= 45;

    // BEDINGUNGEN FÜR SCHRITT-AUSLÖSUNG (Sensor-Fusion):
    // 1. Pedometer-Kombination: 3 echte Schritte & GPS bestätigt Bewegung draußen (mind. 0.6m ODER Speed > 0.2m/s ODER frisches GPS-Signal)
    // 2. Reine GPS-Distanz: Mindestens 1.8 Meter Ortsveränderung bei akzeptabler GPS-Genauigkeit (falls Pedometer inaktiv)
    // 3. Pedometer-Outdoor-Fallback: 4 Schritte bei aktivem GPS-Fix (auch wenn GPS kurz träge aktualisiert)
    const conditionPedometerGps = (this.motionStepsCount >= this.targetMotionSteps) && 
                                  hasOutdoorGps && 
                                  (currentDist >= 0.6 || speed >= 0.25 || (now - this.lastGpsTimestamp < 8000));

    const conditionGpsDistance = (currentDist >= this.stepThresholdMeters) && 
                                 currentDist < 45 && 
                                 hasOutdoorGps;

    const conditionMotionFallback = (this.motionStepsCount >= 4) && hasOutdoorGps;

    if (conditionPedometerGps || conditionGpsDistance || conditionMotionFallback) {
      this.lastStepTime = now;
      const walkDist = currentDist;

      let bearing = null;
      if (this.stepOriginCoord && this.lastPosition) {
        const curLat = this.lastPosition.coords.latitude;
        const curLon = this.lastPosition.coords.longitude;
        // Peilung nur berechnen, wenn echte räumliche Distanz vorliegt (mind. 1.0m)
        const radialDist = this.haversineMeters(this.stepOriginCoord.lat, this.stepOriginCoord.lon, curLat, curLon);
        if (radialDist >= 1.0) {
          bearing = this.calculateBearing(this.stepOriginCoord.lat, this.stepOriginCoord.lon, curLat, curLon);
        }
      }

      // Referenzpunkte & Zähler für nächsten Schritt zurücksetzen
      this.motionStepsCount = 0;
      this.accumulatedDistance = 0;
      this.currentWalkDistance = 0;
      if (this.lastPosition) {
        this.prevStepCoord = this.stepOriginCoord ? { ...this.stepOriginCoord } : null;
        this.stepOriginCoord = {
          lat: this.lastPosition.coords.latitude,
          lon: this.lastPosition.coords.longitude
        };
        this.lastCoord = { ...this.stepOriginCoord };
      }

      this.triggerHaptic(50);
      this.updateStatusDisplay();

      if (this.onStepTriggered) {
        this.onStepTriggered(bearing, walkDist);
      }
    }
  }

  // Wird aufgerufen, wenn der Spieler die Richtung wechselt (Kompass oder Tasten)
  onDirectionChanged(newFacing) {
    if (this.currentFacing === newFacing) return;
    this.currentFacing = newFacing;

    // Bei Richtungswechsel sofort den Schritt-Ursprung und Pedometer-Zwischenstand neu kalibrieren!
    // Dadurch wird verhindert, dass vergangene Wegstrecken aus der alten Richtung
    // die neue Richtung verfälschen oder Schritte "schlucken".
    if (this.lastPosition) {
      this.stepOriginCoord = {
        lat: this.lastPosition.coords.latitude,
        lon: this.lastPosition.coords.longitude
      };
      this.lastCoord = { ...this.stepOriginCoord };
    }
    this.motionStepsCount = 0;
    this.accumulatedDistance = 0;
    this.currentWalkDistance = 0;

    // Kurzer haptischer Puls als Bestätigung des Richtungswechsels (15ms)
    this.triggerHaptic(15);
    this.updateStatusDisplay();
  }

  // Setzt den Referenzpunkt zurück ("Hier verankern")
  resetStepOrigin() {
    if (this.lastPosition) {
      this.stepOriginCoord = {
        lat: this.lastPosition.coords.latitude,
        lon: this.lastPosition.coords.longitude
      };
      this.lastCoord = { ...this.stepOriginCoord };
    } else {
      this.stepOriginCoord = null;
      this.lastCoord = null;
    }
    this.currentWalkDistance = 0;
    this.accumulatedDistance = 0;
    this.motionStepsCount = 0;
    this.updateStatusDisplay();
  }

  // Aktualisiert die Anzeige in der oberen Status-Pille
  updateStatusDisplay() {
    const dirNames = { up: 'NORD', right: 'OST', down: 'SÜD', left: 'WEST' };
    const facingText = dirNames[this.currentFacing] || '';

    const distInfo = `${this.currentWalkDistance.toFixed(1)}m`;
    const stepsInfo = this.motionStepsCount > 0 ? `Schritt ${this.motionStepsCount}/${this.targetMotionSteps}` : `${distInfo}`;

    if (this.accuracy <= 25) {
      this.setStatus('locked', `GPS aktiv (±${Math.round(this.accuracy)}m) | 🚶 ${stepsInfo} [${facingText}]`);
    } else if (this.accuracy <= 45) {
      this.setStatus('searching', `GPS (±${Math.round(this.accuracy)}m) | 🚶 ${stepsInfo} [${facingText}]`);
    } else {
      this.setStatus('searching', `GPS sucht Signal (±${Math.round(this.accuracy)}m)`);
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
