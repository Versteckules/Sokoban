// SOKOBAN: DAS GEHEIMNIS DER PYRAMIDE
// 15 Verifizierte Level-Definitionen (Geocaching Edition)
// Ersteller: versteckules

export const LEVELS = [
  {
    "id": 1,
    "tier": 1,
    "name": "Smaragd-Pforte",
    "width": 5,
    "height": 3,
    "map": "#####\n#@$.#\n#####",
    "token": "f2d007031983473d",
    "minSteps": 1
  },
  {
    "id": 2,
    "tier": 1,
    "name": "Der grüne Pfad",
    "width": 5,
    "height": 5,
    "map": "#####\n#@  #\n# $ #\n# . #\n#####",
    "token": "e791e7ae8b0664b1",
    "minSteps": 2
  },
  {
    "id": 3,
    "tier": 1,
    "name": "Zwillingskammer",
    "width": 6,
    "height": 5,
    "map": "######\n#@   #\n# $$ #\n# .. #\n######",
    "token": "3e6f534e7829e07c",
    "minSteps": 5
  },
  {
    "id": 4,
    "tier": 1,
    "name": "Winkelschliff",
    "width": 7,
    "height": 5,
    "map": "#######\n#  @  #\n# $#$ #\n# . . #\n#######",
    "token": "7b4d22a89865b209",
    "minSteps": 6
  },
  {
    "id": 5,
    "tier": 1,
    "name": "Smaragd-Magazin",
    "width": 6,
    "height": 6,
    "map": "######\n#   .#\n# $  #\n#  $ #\n#.  @#\n######",
    "token": "5f0d251a504e8585",
    "minSteps": 10
  },
  {
    "id": 6,
    "tier": 2,
    "name": "Bernstein-Halle",
    "width": 6,
    "height": 5,
    "map": "######\n#. $ #\n#  $ #\n#@ . #\n######",
    "token": "bf9c6931c8792828",
    "minSteps": 9
  },
  {
    "id": 7,
    "tier": 2,
    "name": "Goldene Kammer",
    "width": 6,
    "height": 6,
    "map": "######\n#    #\n# $$ #\n# .#.#\n#  @ #\n######",
    "token": "895d60f7a5d3d093",
    "minSteps": 11
  },
  {
    "id": 8,
    "tier": 2,
    "name": "Sonnenpfad",
    "width": 5,
    "height": 6,
    "map": "#####\n#@  #\n# $$#\n## .#\n # .#\n ####",
    "token": "2796e36a47e7334e",
    "minSteps": 13
  },
  {
    "id": 9,
    "tier": 2,
    "name": "Das Säulenpaar",
    "width": 6,
    "height": 6,
    "map": "######\n#  . #\n# #$ #\n#@ $ #\n#.   #\n######",
    "token": "4c316265d5304189",
    "minSteps": 19
  },
  {
    "id": 10,
    "tier": 3,
    "name": "Amethyst-Grotte",
    "width": 7,
    "height": 6,
    "map": " ######\n##    #\n# .$$ #\n# .#@ #\n#     #\n#######",
    "token": "7f5a3ab100ba3429",
    "minSteps": 20
  },
  {
    "id": 11,
    "tier": 3,
    "name": "Violetter Zwang",
    "width": 6,
    "height": 7,
    "map": "######\n#   .#\n# #$ #\n# $  #\n#@#$.#\n#   .#\n######",
    "token": "70afb2e269ff3dd7",
    "minSteps": 23
  },
  {
    "id": 12,
    "tier": 3,
    "name": "Kristall-Labyrinth",
    "width": 7,
    "height": 7,
    "map": "#######\n#     #\n# $ $ #\n# .#@.#\n#  $  #\n#  .  #\n#######",
    "token": "0692fa038c2f82b7",
    "minSteps": 24
  },
  {
    "id": 13,
    "tier": 4,
    "name": "Rubin-Schleife",
    "width": 7,
    "height": 7,
    "map": "#######\n#  .  #\n# $#$ #\n# .@. #\n# $#$ #\n#  .  #\n#######",
    "token": "7c34afeb5354cc17",
    "minSteps": 30
  },
  {
    "id": 14,
    "tier": 4,
    "name": "Blutstein-Tresor",
    "width": 6,
    "height": 7,
    "map": "######\n# .  #\n# $$ #\n# .# #\n#@ $ #\n#  . #\n######",
    "token": "6081d5cbebf04623",
    "minSteps": 33
  },
  {
    "id": 15,
    "tier": 5,
    "name": "Das Obsidian-Heiligtum",
    "width": 7,
    "height": 7,
    "map": " ######\n # .  #\n##$#  #\n#  $ .#\n# @#  #\n# . $ #\n#######",
    "token": "46e9d2d8a5bb5c6b",
    "minSteps": 57
  }
];

export const PYRAMID_GRAPH = {
  // Tier 1 (0..4) - Basis, sofort spielbar
  0: [], 1: [], 2: [], 3: [], 4: [],
  // Tier 2 (5..8) - Benötigt je zwei Fundamentsteine
  5: [0, 1],
  6: [1, 2],
  7: [2, 3],
  8: [3, 4],
  // Tier 3 (9..11) - Benötigt je zwei Steine aus Tier 2
  9: [5, 6],
  10: [6, 7],
  11: [7, 8],
  // Tier 4 (12..13) - Benötigt je zwei Steine aus Tier 3
  12: [9, 10],
  13: [10, 11],
  // Tier 5 (14) - Apex-Spitze, benötigt beide Steine aus Tier 4
  14: [12, 13]
};

export const TIER_CONFIG = {
  1: {
    tier: 1,
    name: "Leicht",
    material: "Holz & Moosstein",
    ambienceName: "Urwald-Tempel (Holz & Moosstein)",
    icon: "🌿",
    color: "#10b981",
    accent: "#059669",
    glow: "rgba(16, 185, 129, 0.45)",
    label: "Smaragd",
    boxDesc: "Gezimmerte Holzkiste",
    wallDesc: "Moosbewachsener Bruchstein"
  },
  2: {
    tier: 2,
    name: "Mittel",
    material: "Sandstein & Gold",
    ambienceName: "Wüsten-Heiligtum (Sandstein & Gold)",
    icon: "☀️",
    color: "#f59e0b",
    accent: "#d97706",
    glow: "rgba(245, 158, 11, 0.45)",
    label: "Bernstein",
    boxDesc: "Sandstein-Sonnenmonolith",
    wallDesc: "Relief-Sandstein"
  },
  3: {
    tier: 3,
    name: "Hoch",
    material: "Schiefer & Amethyst",
    ambienceName: "Kristall-Katakomben (Schiefer & Amethyst)",
    icon: "🔮",
    color: "#8b5cf6",
    accent: "#7c3aed",
    glow: "rgba(139, 92, 246, 0.45)",
    label: "Amethyst",
    boxDesc: "Amethyst-Kristalltruhe",
    wallDesc: "Violetter Schieferfels"
  },
  4: {
    tier: 4,
    name: "Sehr hoch",
    material: "Schmiedeeisen & Rubin",
    ambienceName: "Eisen-Gewölbe (Schmiedeeisen & Rubin)",
    icon: "⚔️",
    color: "#ef4444",
    accent: "#dc2626",
    glow: "rgba(239, 68, 68, 0.45)",
    label: "Rubin",
    boxDesc: "Vernieteter Panzertresor",
    wallDesc: "Geschmiedete Panzerplatten"
  },
  5: {
    tier: 5,
    name: "Extrem",
    material: "Obsidian & Magma",
    ambienceName: "Das Obsidian-Apex (Obsidian & Magma)",
    icon: "🌋",
    color: "#ff3b30",
    accent: "#ff8c00",
    glow: "rgba(255, 59, 48, 0.55)",
    label: "Obsidian",
    boxDesc: "Glühendes Obsidian-Relikt",
    wallDesc: "Magma-durchzogener Obsidian"
  }
};

export const COMBINED_TOKENS_HASH = "8be5a0437766aa2d6672810c3bfeed2de067bafe5a3e03297b17166644cf7beb";
