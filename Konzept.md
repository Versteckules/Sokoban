# SOKOBAN: DAS GEHEIMNIS DER PYRAMIDE (GEOCACHING EDITION)
## Finales Gesamtkonzept & Implementierungs-Dokumentation (Stand: Vollständig implementiert)

> **Status:** Durch iterative Tests & Benutzeranpassungen finalisiert und aktiv im Code verankert  
> **Ersteller:** versteckules („Made by versteckules“)  
> **Ziel-Plattform:** Primär für Smartphones & Tablets (iOS & Android) sowie Desktop/PC (HTML5, Vanilla CSS, Canvas 2D, Web Audio API, Web Crypto API, Geolocation API)  
> **Projekt-Typ:** Standalone-taugliches Web-Game (Multi-File Quellcode + vorkompiliertes `game.bundle.js` für Offline- & GitHub-Pages-Nutzung)  

---

## 1. Übersicht & Spielprinzip

Ein audiovisuell herausragendes Geocaching-Webspiel für Smartphone, Tablet und PC:

* **Echtes GPS-Outdoor-Gameplay („Play Anywhere“):**
  - Der Geocacher muss sich auf einem Sportplatz, Schulhof, Marktplatz oder im Park physisch bewegen, um die Spielfigur über das virtuelle Kachelgitter zu steuern.
  - **Tastatur- & Touch-Sperre im Normalmodus:** Tasten (WASD / Pfeile) und On-Screen-D-Pad sind für Spieler draußen gesperrt, damit geschummeltes Sofa-Spielen verhindert wird. Ein Info-Toast erinnert daran, real draußen zu laufen.
* **Monumentale 15-Level Stufenpyramide (5 → 4 → 3 → 2 → 1):**
  - **Tier 1 (Leicht – 5 Level):** Smaragdgrün (`#10b981`) – Verlassene Waldruine
  - **Tier 2 (Mittel – 4 Level):** Bernstein / Gold (`#f59e0b`) – Pharaonische Sandsteinkammer
  - **Tier 3 (Hoch – 3 Level):** Amethyst / Violett (`#8b5cf6`) – Mystische Kristallgrotte
  - **Tier 4 (Sehr hoch – 2 Level):** Rubinrot (`#ef4444`) – Antike Zwergenschmiede
  - **Tier 5 (Extrem – 1 Level):** Obsidian / Magma (`#ff3b30`, Glüh-Akzent `#ff8c00`) – Flammender Vulkankern
  - **Strikte Pyramiden-Freischaltung:** Ein Stein der oberen Reihe schaltet sich ausschließlich frei, wenn **beide darunterliegenden Fundamentsteine** erfolgreich gelöst wurden.
* **Geocaching Zero-Knowledge Kryptotresor:**
  - Final-Koordinaten und Final-Hinweis sind mit **AES-GCM (256-Bit)** verschlüsselt.
  - Jedes Level erzeugt ein 16-stelliges kryptografisches Siegel-Token. Diese Siegel werden im Hintergrund im `localStorage` gesichert.
  - Im Sieges-Dialog sieht der Spieler keine verwirrenden Hex-Codes, sondern den thematischen Status: **„Pyramiden-Siegel: Gespeichert ✓ (X / 15)“**.
  - Erst wenn alle 15 Siegel im flüchtigen RAM vereint sind, wird der Master-Key generiert und die Geocaching-Koordinaten entschlüsselt.
* **Verdeckter Reviewer- & Test-Modus:**
  - Keine sichtbaren Entwickler-Schaltflächen auf der Startseite (nur die Ersteller-Box **„Made by versteckules“**).
  - Aktivierung durch **10x schnelles Klicken auf das Hauptbild** (`#hero-img`) auf der Startseite oder via URL-Parameter `?mode=reviewer`.
  - Schaltet Tastatursteuerung (WASD / Pfeiltasten) und ein virtuelles Touch-D-Pad frei.
  - Lückenlose Dokumentation mit Text-Lösungen in `reviewer_loesung.txt` (durch `.gitignore` geschützt).
* **Kompletter Spielstand-Reset:**
  - Über das Menü/Regelwerk kann der gesamte Spielfortschritt (`localStorage`) per Bestätigungs-Dialog vollständig gelöscht und auf Level 1 zurückgesetzt werden.

---

## 2. Visuelles Design & High-End Grafiksystem

### Dynamisches 5-Tier Raumambiente:
Mit jeder Pyramidenstufe ändert sich das komplette Ambiente und Kacheldesign:
1. **Tier 1 (Holz & Wald):** Holzkisten mit Eisenbeschlägen, Moossteinmauern, alte Steinplatten, schwebende Waldsporen & Glühwürmchen.
2. **Tier 2 (Sandstein & Gold):** Pharaonische Hieroglyphenkisten, Sandsteinquader, Wüstenkammer, glitzernder Goldstaub.
3. **Tier 3 (Kristall & Amethyst):** Leuchtende Amethystblöcke, Runenmauern, violette Kristallsplitter.
4. **Tier 4 (Eisen & Schmiede):** Schwere Panzertresore aus Gusseisen, dunkler Schlackenstein, sprühende Schmiedefunken.
5. **Tier 5 (Obsidian & Magma):** Glutdurchzogene Obsidianblöcke, Basaltfelsen, Vulkanglut & aufsteigende Asche.

### Spielfigur (Abenteurer & Geocacher):
* **Farbgebung & Sichtbarkeit:**
  - Satter Königsblau-Look der Expeditionsjacke, warmer Sattelleder-Hut, Rucksack mit Kletterseil, GPS-Empfänger und Sturmlaterne.
  - Helle, warme Teintfarben und kontrastreiche Wanderstiefel (kein blasses Erscheinungsbild).
  - Goldene Lichtkante (Rim-Light) an der Silhouette für sofortige Erkennbarkeit auf jedem dunklen Untergrund.
  - Boden-Heldenaura mit sanftem Gold-Glow (`shadowBlur: 12`) und weicher Kontaktschatten unter den Füßen.
* **Dynamisches Fackellicht:**
  - Realistisch flackernde Radial-Lichtquelle (`renderTorchLight`), die den Bereich um den Spieler erhellt.
* **Ausrichtung & Kompass:**
  - Figur richtet sich in Bewegungsrichtung aus (4-Wege-Animation).
  - Unterstützt Smartphone-Kompass-Drehung (`deviceorientation`).
* **Relief-Startbild (`assets/hero.jpg`):**
  - Epische Pyramiden-Hero-Grafik, in die das Ersteller-Porträt (`avatar.jpg`) als antikes Felsenrelief nahtlos eingearbeitet wurde.

---

## 3. Maßgebliche Smartphone- & Tablet-Optimierung

Das Spiel ist maßgeblich und primär für den Einsatz im Freien auf **Smartphones und Tablets** optimiert:

1. **Kein Scrollen im Spielfeld (Dynamic Viewport Height `100dvh`):**
   - Das Spielgeschehen (`#game-screen`) ist als flexibler Vollbildschirm ohne vertikales Scrollen aufgebaut.
   - Der Kachel-Canvas skaliert automatisch im Raum zwischen oberem HUD und unterer GPS-Leiste.
   - Spielfeld, Zugzähler und GPS-Bedienknöpfe sind auf jedem Handy (von 360px Breite bis zum iPad) gleichzeitig sichtbar.
2. **Daumen-optimierte Touch-Targets:**
   - Alle Schaltflächen haben eine Mindesthöhe von **42 bis 48 Pixeln** (Apple & Google Touch Guidelines).
   - `touch-action: manipulation;` verhindert lästiges Doppel-Tap-Hineinzoomen bei schneller Bedienung.
   - Textmarkierung und blaue Tap-Highlights sind mobil deaktiviert.
3. **Ergonomisches Mobile-Grid:**
   - Auf Smartphones ordnen sich die GPS-Hauptfunktionen („Hier verankern“, „Drehen“, Kachelgröße) automatisch in ein 3-Spalten-Raster für einfache Einhandbedienung.
4. **Notch & Home-Bar Safe Areas:**
   - `env(safe-area-inset-bottom)` schützt die unteren Buttons vor der Wischleiste moderner iPhones und Android-Geräte.
5. **Pyramiden-Stufen auf schmalen Screens:**
   - Automatische Breitenanpassung (`clamp(50px, 17vw, 72px)`) der Fundamentsteine verhindert horizontales Überlaufen auf 360–390px schmalen Bildschirmen.

---

## 4. Interaktives FAQ- & Anleitungs-System (`❓`)

Um Spielern draußen im Feld alle Spielfunktionen sofort verständlich zu machen, verfügt die App über ein modales, card-basiertes FAQ-System:
* **Zugänge:**
  1. Header-Button `❓` (auf jedem Screen oben rechts dauerhaft erreichbar).
  2. Inline-Button `❓ Hilfe` in der GPS-Steuerungsleiste (direkt neben „Hier verankern“).
  3. Startseiten-Button `📖 Spielregeln & GPS-Guide`.

### Die dokumentierten Kernfragen der Anleitung:
1. **🎯 Wofür ist „Hier verankern“?**
   - *Funktion:* Kalibriert die reale GPS-Position des Spielers als Startpunkt der Spielfigur.
   - *Praxis-Tipp:* Stößt man beim Laufen an den Rand der Wiese, an einen Zaun oder an ein Gebüsch, geht man einfach ein paar Meter zurück in die freie Mitte und tippt erneut auf „Hier verankern“. Das Spielfeld zentriert sich sofort neu um den Spieler, ohne den Zugfortschritt des Levels zu verlieren!
2. **🔄 Wofür ist „Drehen (0° / 90° / 180° / 270°)“?**
   - *Funktion:* Richtet das virtuelle Spielfeld an Geländekanten aus.
   - *Praxis-Tipp:* Steht man parallel zu einer Sportplatzlinie, einem Zaun oder Gehweg, dreht man das Spielfeld um 90°, sodass die Korridore genau in die freie Laufrichtung zeigen.
3. **📏 Welche Kachelgröße soll ich wählen?**
   - **Kompakt (3 Meter):** Für kleinere Höfe, Parkplätze oder beengtes Areal.
   - **Standard (4 Meter) 🌟 Empfohlen:** Der ideale Sweet Spot! Fängt normales Smartphone-GPS-Schwanken (±2–3m) zuverlässig ab.
   - **Weit (5 Meter):** Für große Sportplätze, Felder oder Parkwiesen – für maximale Bewegung an der frischen Luft.
4. **🚶 Wie steuert man per GPS?**
   - Echtes Vorwärtslaufen im Gelände: Mehr als 50% der Distanz zur Nachbarkachel (ca. 2 Meter) triggern den Schritt und Kistenschub.
   - Hinweis: Tasten und On-Screen-Pfeile sind im normalen Outdoor-Modus gesperrt.
5. **↩ Undo & 🔄 Reset:**
   - Rückgängigmachen von Zügen bei verklemmten Kisten oder sofortiger Level-Neustart.
6. **🔺 Wie funktioniert die Pyramide?**
   - 15 Stufen von unten nach oben; ein Stein öffnet sich erst, wenn beide darunterliegenden Fundamente gelöst sind.
7. **👑 Wann erhält man die Final-Koordinaten?**
   - Jedes gelöste Level sichert ein magisches Siegel im Tresor. Nach Abschluss von Level 15 öffnet sich der 256-Bit Master-Tresor mit den Geocaching-Koordinaten und dem Spoiler-Hinweis.

---

## 5. GPS „Play Anywhere“ – Spezifikation & Dimensionierung

### Platzbedarf auf dem Gelände:
* **Kompakte Level-Größe:** Alle 15 Puzzles basieren auf kompakten 6×6 bis maximal 8×8 Kachelrastern (Microban-Puzzles).
* **Kachelgröße:** Konfigurierbar (3m, 4m, 5m), Standard **4,0 Meter** pro Kachel.
* **Flächenbedarf:** **ca. 24 m × 24 m bis maximal 32 m × 32 m** (ca. 600–1.000 m²).
* **Ideale Orte:** Sportplatz, Park, Schulhof, Bolzplatz, Marktplatz.

### GPS-Steuerungs-Mechanik:
1. **1-Klick-Verankerung:** Klick auf „Hier Spielfeld verankern“ setzt die reale GPS-Position als Startkachel.
2. **Re-Anchor / Neuausrichtung:** Jederzeit im Spiel kann das Spielfeld neu zentriert werden.
3. **Spielfeld-Drehung:** Spielfeld kann stufenlos um 90° gedreht werden.
4. **Hysterese & Totzone:** Ein Schritt wird getriggert, sobald der Spieler mehr als 50% in das Nachbarfeld eintritt. Totzone im Stillstand verhindert Zappeln.
5. **Haptisches Feedback:** Smartphone vibriert beim Kistenschieben und bei Mauerkontakt.

---

## 6. Dateistruktur & Architektur

```text
sokoban/
├── index.html              # Hauptseite (Landing, Pyramide, Spielfeld, FAQ-Modal)
├── style.css               # Luxury-Dark Theme, 100dvh No-Scroll Layout, Mobile-Grid
├── assets/
│   ├── avatar.jpg          # Original Ersteller-Avatar ("Made by versteckules")
│   ├── hero.jpg            # Pyramiden-Startbild mit integriertem Steinrelief-Avatar
│   ├── music.mp3           # Atmosphärische Hintergrundmusik
│   ├── player_down.png     # Hochauflösender Abenteurer (Blick nach vorne / unten)
│   ├── player_up.png       # Abenteurer-Sprite (oben)
│   ├── player_left.png     # Abenteurer-Sprite (links)
│   ├── player_right.png    # Abenteurer-Sprite (rechts)
│   ├── crate_tier1..5.png  # 5 Tier-spezifische Kisten (Holz, Sandstein, Kristall, Eisen, Magma)
│   ├── wall_tier1..5.jpg   # 5 Tier-spezifische Mauertexturen
│   ├── floor_tier1..5.jpg  # 5 Tier-spezifische Bodentexturen
│   └── bg_tier1..5.jpg     # 5 Atmosphärische Kammer-Hintergründe
├── js/
│   ├── game.bundle.js      # All-in-One Standalone-Bundle (Offline & GitHub Pages)
│   ├── levels.js           # 15 mathematisch geprüfte Sokoban-Level & Siegel-Token
│   ├── engine.js           # Core-Logik, Pyramiden-Freischaltung (2 Fundamente), Undo/Reset
│   ├── gps.js              # GPS Engine (High-Accuracy, Meter-Projektion, Hysterese)
│   ├── renderer.js         # Canvas 2D Pipeline (Fackellicht, Ambient Occlusion, Partikel)
│   ├── crypto.js           # AES-GCM Tresor & Key-Derivation aus 15 Siegeln
│   ├── audio.js            # Synthetisierte SFX (Web Audio API) + MP3-Steuerung
│   └── main.js             # UI-Routing, 10x Hero-Klick Trigger, FAQ-Modal-Handling
├── encrypt_tool.html       # Lokales Web-Tool zum Einpflegen neuer Cache-Koordinaten
├── reviewer_loesung.txt     # Walkthrough-Textlösungen aller 15 Level (durch .gitignore geschützt)
└── .gitignore              # Verhindert Veröffentlichung der Reviewer-Lösung auf GitHub
```

---

## 7. Implementierungs-Chronik & Umsetzungs-Status

* [x] **Schritt 1: Projekt-Setup & Sicherheit**
  * `.gitignore` konfiguriert (schützt `reviewer_loesung.txt`).
  * `reviewer_loesung.txt` mit klaren Zügen (H, R, L, RE) für alle 15 Level erstellt.
  * `encrypt_tool.html` für sichere AES-GCM Verschlüsselung bereitgestellt.
* [x] **Schritt 2: Level-Design & Pure Sokoban Engine**
  * 15 verifizierte Puzzles mit optimalem Schwierigkeitsanstieg (Tier 1 bis 5).
  * Undo-Stack, Schnell-Reset und Pyramiden-Abhängigkeitsgraph mit 2-Fundamentstein-Prüfung.
* [x] **Schritt 3: GPS Outdoor Engine & Tastatursperre**
  * Outdoor-Modus sperrt Tastatur/Touch für echte Geocacher.
  * Hysterese, 1-Klick-Verankerung, 90°-Drehung und Gyroskop/Kompass-Anbindung.
* [x] **Schritt 4: Audiovisuelles System & Next-Level Grafik**
  * Web Audio API für prozedurale Soundeffekte (Schieben, Wand, Sieg, Klick, Reviewer-Fanfare).
  * 5 Tier-spezifische Texturwelten (Kisten, Mauern, Böden, Hintergründe, Raumpartikel).
  * Dynamisches Fackellicht, Kistenschleifspuren und Wandschatten (Ambient Occlusion).
* [x] **Schritt 5: UI & Reviewer-Zugang**
  * Hero-Startseite mit integriertem Relief-Avatar und „Made by versteckules“.
  * Reviewer-Modus durch 10x Klick auf das Hauptbild (oder `?mode=reviewer`) aktivierbar.
  * Spielstand-Komplett-Reset im Menü.
* [x] **Schritt 6: Spieler-Figur Perfektionierung**
  * Farbkontrast-Boost (+90% Sättigung, +42% Helligkeit, +32% Kontrast).
  * Goldenes Rim-Light und Helden-Boden-Aura.
* [x] **Schritt 7: Siegel-Kryptotresor & Final-Prüfung**
  * Siegel-Tokens werden im Hintergrund für AES-256 gesammelt.
  * Thematische Anzeige: „Pyramiden-Siegel: Gespeichert ✓ (X / 15)“.
  * Automatisches Öffnen des Tresors nach Abschluss von Level 15.
  * Standalone-Bundle `game.bundle.js` für fehlerfreie Ausführung überall.
* [x] **Schritt 8: Mobile- & Tablet-Ergonomie sowie interaktives FAQ-System**
  * Maßgebliche Optimierung für Handys und Tablets: `100dvh` Dynamic Viewport Height, Safe-Area-Support (Notch/Homebar), Touch-Targets mit min. 44px und flexibles No-Scroll-Spielfeldlayout.
  * Interaktives Card-basiertes FAQ- & Anleitungs-Modal (erreichbar über `❓` im globalen Header, `❓ Hilfe` in der GPS-Leiste und den Startseiten-Button).
  * Ausführliche Erklärungen zu „Hier verankern“ (Re-Zentrieren bei Hindernissen), „Drehen“ (Ausrichtung an Platzkanten), Kachelgröße (3m, 4m, 5m), GPS-Laufmechanik, Undo/Reset und Kryptotresor.
* [x] **Schritt 9: GPS-Outdoor-Laufoptimierung, Auto-Verankerung & Richtungs-Guidance**
  * **Behebung des Schritt-Verwerfungs-Bugs:** Schnelles Gehen oder GPS-Latenz (> 1 Kachel Delta) wird nicht mehr als Jitter verworfen, sondern schrittweise sauber und kontinuierlich ausgeführt.
  * **Behebung des Doppel-Rotations-Bugs:** Bei `isGps` wurde der Drehwinkel nicht mehr doppelt rotiert.
  * **Automatische Startpunkt-Verankerung:** Bei Signal-Empfang wird der Startpunkt automatisch kalibriert, sodass Spieler sofort loslaufen können.
  * **Live-Wegweiser & Kompass-HUD:** Dynamischer Banner zeigt Zielrichtung (z. B. „Level 1: Ziel liegt im OSTEN“), gelaufene Meter und Himmelsrichtung an.
  * **Wandkollisions-Hinweise:** Läuft der Spieler gegen eine Wand, erscheint ein klarer visueller Hinweis inklusive Drehungs-Empfehlung.
  * **Canvas Kompass-Rose:** Hochwertige Miniatur-Kompassrose in der Ecke des Spielfelds visualisiert die Ausrichtung der Pyramidenkammer zur realen Welt.
