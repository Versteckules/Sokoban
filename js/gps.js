// GPS PLAY ANYWHERE ENGINE
// Outdoor-Standortverfolgung, Verankerung, Ausrichtung und Schritt-Erkennung
// Ersteller: versteckules

export class GpsEngine {
  constructor(options = {}) {
    this.watchId = null;
    this.isTracking = false;
    this.hasPermission = false;
    this.status = 'idle'; // 'idle', 'searching', 'locked', 'denied', 'error'
    this.lastPosition = null;
    this.accuracy = 999; // in Metern

    // Anchor-Punkt für die Verankerung auf dem Spielfeld
    this.anchor = null; // { lat, lon, heading, playerStartX, playerStartY }
    this.currentTile = { x: 0, y: 0 };
    this.lastStepTile = { x: 0, y: 0 };

    // Konfiguration
    this.tileSize = options.tileSize || 4.0; // Meter pro Kachel (Default 4.0m)
    this.rotationAngle = options.rotationAngle || 0; // Grad (0..360)
    this.thresholdRatio = 0.55; // Hysterese: >55% Kacheltiefe für Schritt

    // Cooldown gegen Doppelschritte
    this.lastStepTime = 0;
    this.stepCooldownMs = 800;

    // Callbacks
    this.onLocationUpdate = null;
    this.onStepTriggered = null;
    this.onStatusChange = null;
  }

  // Startet die kontinuierliche GPS-Standorterfassung
  startTracking() {
    if (!('geolocation' in navigator)) {
      this.setStatus('error', 'Geolocation API wird von diesem Browser nicht unterstützt.');
      return false;
    }

    if (this.isTracking) return true;

    this.setStatus('searching', 'Satelliten werden gesucht...');
    this.isTracking = true;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.handlePositionUpdate(pos),
      (err) => this.handleError(err),
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    return true;
  }

  // Stoppt das Tracking (z. B. beim Verlassen des Spielfelds)
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.setStatus('idle', 'Standorterfassung pausiert.');
  }

  // Verankert das Spielfeld an der aktuellen GPS-Position
  // playerGridPos: { x, y } (aktuelle Position der Spielfigur im Level)
  setAnchor(playerGridPos) {
    if (!this.lastPosition) {
      return { success: false, message: 'Noch kein GPS-Signal vorhanden. Bitte kurz warten.' };
    }

    const { latitude, longitude } = this.lastPosition.coords;
    this.anchor = {
      lat: latitude,
      lon: longitude,
      rotation: this.rotationAngle,
      playerStartX: playerGridPos.x,
      playerStartY: playerGridPos.y
    };

    this.currentTile = { x: playerGridPos.x, y: playerGridPos.y };
    this.lastStepTile = { x: playerGridPos.x, y: playerGridPos.y };

    this.triggerHaptic(60);

    return {
      success: true,
      anchor: this.anchor,
      message: `Spielfeld erfolgreich verankert! (Genauigkeit: ±${Math.round(this.accuracy)}m)`
    };
  }

  // Rotiert das Spielfeld um die Verankerung (z. B. entlang von Sportplatz-Grenzen)
  setRotation(angleDegrees) {
    this.rotationAngle = (angleDegrees % 360 + 360) % 360;
    if (this.anchor) {
      this.anchor.rotation = this.rotationAngle;
    }
  }

  // Ändert die Kachelgröße (3m, 4m, 5m)
  setTileSize(meters) {
    this.tileSize = Math.max(2.5, Math.min(6.0, meters));
  }

  // Verarbeitet eingehende GPS-Koordinaten
  handlePositionUpdate(pos) {
    this.lastPosition = pos;
    this.accuracy = pos.coords.accuracy || 999;
    this.hasPermission = true;

    if (this.accuracy <= 15) {
      this.setStatus('locked', `Signal stabil (±${Math.round(this.accuracy)}m)`);
    } else {
      this.setStatus('searching', `Suche besseres Signal (±${Math.round(this.accuracy)}m)`);
    }

    let relativeMeters = { east: 0, north: 0, dist: 0 };
    let calculatedTile = { x: 0, y: 0 };

    if (this.anchor) {
      relativeMeters = this.calculateMetersFromAnchor(pos.coords.latitude, pos.coords.longitude);
      calculatedTile = this.calculateTileCoordinates(relativeMeters.east, relativeMeters.north);

      this.currentTile = calculatedTile;
      this.checkStepTrigger(calculatedTile);
    }

    if (this.onLocationUpdate) {
      this.onLocationUpdate({
        coords: pos.coords,
        accuracy: this.accuracy,
        relativeMeters,
        calculatedTile,
        anchor: this.anchor,
        status: this.status
      });
    }
  }

  // Prüft, ob der Geocacher eine Nachbarkachel betreten hat
  checkStepTrigger(calcTile) {
    const now = performance.now();
    if (now - this.lastStepTime < this.stepCooldownMs) return;

    const dx = calcTile.x - this.lastStepTile.x;
    const dy = calcTile.y - this.lastStepTile.y;

    // Nur genau einen orthogonalen Schritt (nicht diagonal) zulassen
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      let direction = null;
      if (dx === 1) direction = 'right';
      else if (dx === -1) direction = 'left';
      else if (dy === 1) direction = 'down';
      else if (dy === -1) direction = 'up';

      if (direction && this.onStepTriggered) {
        this.lastStepTime = now;
        this.lastStepTile = { x: calcTile.x, y: calcTile.y };
        this.triggerHaptic(40);
        this.onStepTriggered(direction, calcTile);
      }
    } else if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      // Größerer Sprung (GPS-Jitter) -> schrittweise anpassen ohne wilden Kistenschub
      this.lastStepTile = { x: calcTile.x, y: calcTile.y };
    }
  }

  // Projiziert WGS84 Lat/Lon in relative Meter (Ost & Nord)
  calculateMetersFromAnchor(lat, lon) {
    if (!this.anchor) return { east: 0, north: 0, dist: 0 };

    const avgLat = (this.anchor.lat + lat) / 2 * (Math.PI / 180);
    const dLat = (lat - this.anchor.lat) * (Math.PI / 180);
    const dLon = (lon - this.anchor.lon) * (Math.PI / 180);

    const earthRadius = 6378137; // Meter
    const north = dLat * earthRadius;
    const east = dLon * earthRadius * Math.cos(avgLat);
    const dist = Math.sqrt(east * east + north * north);

    return { east, north, dist };
  }

  // Rotiert die Koordinaten und rechnet Meter in Gitterkacheln um
  calculateTileCoordinates(eastMeters, northMeters) {
    const rad = -this.rotationAngle * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Rotation anwenden
    const localX = eastMeters * cos - northMeters * sin;
    const localY = eastMeters * sin + northMeters * cos;

    // Im Bildschirm-Grid: X nach rechts (+), Y nach unten (+) -> dy = -localY
    const tileOffsetX = Math.round(localX / this.tileSize);
    const tileOffsetY = Math.round(-localY / this.tileSize);

    return {
      x: this.anchor.playerStartX + tileOffsetX,
      y: this.anchor.playerStartY + tileOffsetY
    };
  }

  // Haptisches Vibrationsfeedback für Smartphones
  triggerHaptic(duration = 40) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {}
    }
  }

  triggerCollisionHaptic() {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([60, 40, 80]);
      } catch (e) {}
    }
  }

  handleError(err) {
    let msg = 'GPS-Fehler.';
    if (err.code === 1) {
      this.setStatus('denied', 'GPS-Zugriff verweigert. Bitte Standort in den Browser-Einstellungen erlauben.');
    } else if (err.code === 2) {
      this.setStatus('searching', 'Standort nicht verfügbar. Suche Signal...');
    } else {
      this.setStatus('error', 'GPS-Timeout.');
    }
  }

  setStatus(status, message) {
    this.status = status;
    if (this.onStatusChange) {
      this.onStatusChange(status, message);
    }
  }
}
