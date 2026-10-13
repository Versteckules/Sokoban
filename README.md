# Sokoban: Das Geheimnis der Pyramide (Geocaching Edition)

> **Ersteller:** versteckules  
> **Typ:** Geocaching Mystery / Wherigo-Style Outdoor Web-App  
> **Technologie:** HTML5, CSS3, Vanilla ES6 JavaScript, Canvas 2D, Web Audio API, Web Crypto API, Geolocation API  

Ein audiovisuelles Geocaching-Erlebnis für Smartphone, Tablet und Desktop: 15 mathematisch geprüfte Sokoban-Rätsel in einer 5-stufigen Stufenpyramide, echtes GPS-Outdoor-Gameplay und ein kryptografischer AES-GCM Tresor zum Schutz der Final-Koordinaten.

---

## 🏛️ Features & Spielprinzip

1. **Die 15-Stufen Pyramide (5 → 4 → 3 → 2 → 1):**
   - **Tier 1 (Basis – 5 Level):** Smaragdgrün (`#10b981`) – Leicht
   - **Tier 2 (Stufe 2 – 4 Level):** Bernstein / Gold (`#f59e0b`) – Mittel
   - **Tier 3 (Stufe 3 – 3 Level):** Amethyst / Violett (`#8b5cf6`) – Hoch
   - **Tier 4 (Stufe 4 – 2 Level):** Rubinrot (`#ef4444`) – Sehr hoch
   - **Tier 5 (Apex-Spitze – 1 Level):** Obsidian / Magma (`#ff3b30`, Glüh-Akzent `#ff8c00`) – Extrem
   - **Freischalt-Logik:** Ein Stein der oberen Reihe öffnet sich erst, wenn **beide Fundamentsteine darunter** bezwungen wurden!

2. **GPS „Play Anywhere“ (Outdoor-Modus):**
   - Gehe auf einen Sportplatz, Schulhof, Marktplatz oder in einen Stadtpark (Flächenbedarf: ca. 28 × 28 Meter).
   - Tippe auf **„🎯 Hier verankern“**, um deine aktuelle GPS-Position als Startpunkt festzulegen.
   - **Ausrichten:** Mit dem Dreh-Button kannst du das Spielfeld entlang der Platzgrenzen drehen.
   - **Laufen:** Durch reales Gehen steuerst du die Spielfigur und schiebst die Steinblöcke.

3. **Geocaching Zero-Knowledge Kryptotresor:**
   - Die Finalkoordinaten sind mit **256-Bit AES-GCM** verschlüsselt.
   - Der Entschlüsselungs-Key entsteht erst im flüchtigen RAM aus den Hash-Tokens aller 15 gelösten Level.
   - Selbst durch Quellcode-Inspektion in der Browser-Konsole können die Koordinaten nicht vorab ausgelesen werden.

4. **Reviewer- & PC-Modus:**
   - Aktivierbar über `?mode=reviewer` an der URL oder durch **5x schnelles Antippen** des Schriftzugs *„Made by versteckules“*.
   - Schaltet die Tastatursteuerung (WASD / Pfeiltasten, Z = Undo, R = Reset) und das virtuelle Touch D-Pad frei.

---

## 📂 Projektstruktur

```text
sokoban/
├── index.html              # Hauptseite & Spielfeld
├── style.css               # Luxury Dark Theme & Pyramiden-Design
├── encrypt_tool.html       # Lokales Werkzeug zum Verschlüsseln deiner echten Cache-Koordinaten
├── assets/
│   ├── avatar.jpg          # Ersteller-Avatar ("Made by versteckules")
│   ├── hero.jpg            # Epische Hero-Pyramidengrafik
│   ├── music.mp3           # Eigene Hintergrundmusik (optional)
│   └── README.txt          # Hinweise zu Mediendateien
├── js/
│   ├── levels.js           # 15 Level-Definitionen & Lösungshashes
│   ├── engine.js           # Sokoban Core-Engine & Undo-Stack
│   ├── gps.js              # GPS Outdoor-Engine & Schritterkennung
│   ├── renderer.js         # Canvas 2D Pipeline (Partikel, Schleifspuren, Shake)
│   ├── crypto.js           # AES-GCM Tresor
│   ├── audio.js            # Web Audio API Synthesizer + MP3-Player
│   └── main.js             # UI-Lifecycle & Pyramiden-Navigation
├── .gitignore              # Schützt reviewer_loesung.txt vor dem Upload
├── reviewer_loesung.txt     # Reine Text-Lösung für die Reviewer-Note (bleibt privat!)
└── Konzept.md              # Ursprüngliches Pflichtenheft
```

---

## 🚀 Deployment auf GitHub Pages

1. Erstelle ein neues Repository auf GitHub (z. B. `sokoban-pyramide`).
2. Lade alle Dateien hoch. (Durch `.gitignore` wird `reviewer_loesung.txt` automatisch nicht hochgeladen).
3. Gehe im Repository auf **Settings** → **Pages**.
4. Wähle unter **Branch** `main` und `/ (root)` aus und klicke auf **Save**.
5. Nach 1–2 Minuten ist dein Spiel weltweit erreichbar unter:  
   `https://<dein-username>.github.io/sokoban-pyramide/`

---

## 🔐 Vor dem Livegang: Eigene Koordinaten hinterlegen

1. Öffne die Datei `encrypt_tool.html` lokal im Browser.
2. Trage deine echten Cache-Koordinaten und deinen Final-Hinweis ein.
3. Klicke auf **„Tresor jetzt verschlüsseln“**.
4. Kopiere den erzeugten Code-Block in die Datei `js/crypto.js` (an die Stelle von `DEFAULT_CIPHER_DATA`).
5. Fertig! Deine Koordinaten sind mathematisch abgesichert.
