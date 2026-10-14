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
    // Glättungskoordinaten (Low-Pass Filter)
    this.filteredLat = null;
    this.filteredLon = null;

    // Schritt-Schwelle: Mindestens 3.5m echte Ortsveränderung
    this.stepThresholdMeters = options.stepThreshold || 3.5;

    // Cooldown gegen Doppelschritte (mindestens 1200ms)
    this.lastStepTime = -10000;
    this.stepCooldownMs = 1200;

    // Callbacks
    this.onLocationUpdate = null;
    this.onStepTriggered = null;
    this.onStatusChange = null;

    // Kompatibilitäts-Eigenschaften
    this.anchor = { active: true };
    this.rotationAngle = 0;
    this.tileSize = 4.0;
  }

  // Startet kontinuierliche GPS-Standorterfassung
  startTracking() {
    if (this.isTracking) return true;
    this.isTracking = true;
    this.stepOriginCoord = null;
    this.prevStepCoord = null;
    this.filteredLat = null;
    this.filteredLon = null;

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
    this.filteredLat = null;
    this.filteredLon = null;
    this.setStatus('idle', 'Pausiert');
  }

  // Verarbeitet GPS-Positionsänderungen mit Jitter-Filter
  handlePositionUpdate(pos) {
    this.lastPosition = pos;
    this.accuracy = pos.coords.accuracy || 999;
    this.hasPermission = true;

    if (this.accuracy <= 20) {
      this.setStatus('locked', `GPS aktiv (±${Math.round(this.accuracy)}m)`);
    } else if (this.accuracy <= 35) {
      this.setStatus('searching', `GPS ungenau (±${Math.round(this.accuracy)}m)`);
    } else {
      this.setStatus('searching', `Suche Signal (±${Math.round(this.accuracy)}m)`);
    }

    const { latitude, longitude, speed } = pos.coords;

    // 1. Tiefpass-Filter (EWMA) dämpft Messrauschen im Stand
    const filterAlpha = 0.35;
    if (this.filteredLat === null) {
      this.filteredLat = latitude;
      this.filteredLon = longitude;
    } else {
      this.filteredLat = this.filteredLat * (1 - filterAlpha) + latitude * filterAlpha;
      this.filteredLon = this.filteredLon * (1 - filterAlpha) + longitude * filterAlpha;
    }

    const currentLat = this.filteredLat;
    const currentLon = this.filteredLon;

    // 2. Erster Fix: Als Ausgangspunkt setzen
    if (!this.stepOriginCoord) {
      this.stepOriginCoord = { lat: currentLat, lon: currentLon };
      if (this.onLocationUpdate) this.onLocationUpdate(pos);
      return;
    }

    // 3. Stationär-Check über GPS-Doppler-Geschwindigkeit
    // Wenn Smartphone meldet: Geschwindigkeit < 0.35 m/s (~1.2 km/h), steht der Spieler still!
    const isStationaryBySpeed = (speed !== null && speed !== undefined && !isNaN(speed) && speed < 0.35);

    // 4. Distanz ZUM AUSGANGSPUNKT berechnen
    const distFromOrigin = this.haversineMeters(
      this.stepOriginCoord.lat,
      this.stepOriginCoord.lon,
      currentLat,
      currentLon
    );

    const now = performance.now();

    // Dynamische Schwelle basierend auf GPS-Genauigkeit (mind. 3.5m)
    const effectiveThreshold = Math.max(this.stepThresholdMeters, this.accuracy * 0.28);

    // Schritt auslösen nur wenn:
    // a) Echte geglättete Distanz >= 3.5m
    // b) Nicht stationär laut GPS-Chip
    // c) Keine irreale Teleportation (> 40m)
    // d) Akzeptable GPS-Genauigkeit (<= 25m)
    // e) Cooldown abgelaufen (mind. 1200ms)
    // f) Kein Rücksprung auf vorherige Position (Bounce-Back Schutz)
    if (
      distFromOrigin >= effectiveThreshold &&
      distFromOrigin < 40 &&
      this.accuracy <= 25 &&
      !isStationaryBySpeed
    ) {
      // Bounce-Back Check: Wenn die Position nahe am vorherigen Schritt liegt, ist es Jitter
      let isBounceBack = false;
      if (this.prevStepCoord) {
        const distToPrev = this.haversineMeters(
          this.prevStepCoord.lat,
          this.prevStepCoord.lon,
          currentLat,
          currentLon
        );
        if (distToPrev < 2.0) {
          isBounceBack = true;
        }
      }

      if (!isBounceBack && (now - this.lastStepTime >= this.stepCooldownMs)) {
        this.lastStepTime = now;
        const originCoord = { ...this.stepOriginCoord };
        this.prevStepCoord = { ...this.stepOriginCoord };
        this.stepOriginCoord = { lat: currentLat, lon: currentLon };

        // Berechne die reale Himmelsrichtung des gelaufenen Schritts (Norden=up, Osten=right, etc.)
        let walkDirection = null;
        if (originCoord) {
          const bearing = this.calculateBearing(
            originCoord.lat,
            originCoord.lon,
            currentLat,
            currentLon
          );
          if (bearing >= 315 || bearing < 45) walkDirection = 'up';
          else if (bearing >= 45 && bearing < 135) walkDirection = 'right';
          else if (bearing >= 135 && bearing < 225) walkDirection = 'down';
          else if (bearing >= 225 && bearing < 315) walkDirection = 'left';
        }

        this.triggerHaptic(45);
        if (this.onStepTriggered) {
          this.onStepTriggered(walkDirection);
        }
      }
    } else if (distFromOrigin >= 40) {
      // Satelliten-Sprung abgefangen: Ausgangspunkt neu kalibrieren ohne Schritt
      this.stepOriginCoord = { lat: currentLat, lon: currentLon };
    }

    if (this.onLocationUpdate) {
      this.onLocationUpdate(pos);
    }
  }

  // Setzt den Referenzpunkt zurück (z.B. nach manueller Drehung, Schritt oder Level-Start)
  resetStepOrigin() {
    if (this.filteredLat !== null) {
      this.stepOriginCoord = {
        lat: this.filteredLat,
        lon: this.filteredLon
      };
    } else if (this.lastPosition) {
      this.stepOriginCoord = {
        lat: this.lastPosition.coords.latitude,
        lon: this.lastPosition.coords.longitude
      };
    } else {
      this.stepOriginCoord = null;
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

  triggerStep(walkDirection = null) {
    const now = performance.now();
    if (now - this.lastStepTime < this.stepCooldownMs) return;
    this.lastStepTime = now;

    this.triggerHaptic(45);
    if (this.onStepTriggered) {
      this.onStepTriggered(walkDirection);
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
      this.setStatus('denied', 'GPS verweigert');
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
