# RPG Prototype

2D Top-Down Action-RPG Prototyp.
Technologie: **Vite + TypeScript + Phaser 3**

## Setup

```bash
npm install
npm run dev
```

Spiel läuft auf `http://localhost:5173` (Vite Dev-Server).

## Build

```bash
npm run build
npm run preview   # Build testen
npm run typecheck # TypeScript-Validierung
```

## Steuerung

- **WASD** / Pfeiltasten = bewegen
- **E** = Interaktion (Dialog)

## Projektstruktur

```
src/
├── main.ts              ← Entry Point
├── scenes/              ← Phaser Scenes
│   └── WorldScene.ts
├── entities/            ← Spielobjekte
│   ├── Player.ts
│   └── NPC.ts
├── systems/             ← Spiellogik
│   ├── Constants.ts
│   ├── WorldGenerator.ts
│   └── CollisionMap.ts
├── ui/                  ← UI-Komponenten
│   └── DialogUI.ts
└── assets/              ← (für später) Bilder, Sounds
```

## Aktueller Feature-Stand (Stufe 1)

- ✅ Top-Down-Map (40×30 Tiles) mit Gras, Wegen, Wasser, Wald
- ✅ Spieler mit WASD-Bewegung
- ✅ Kamera folgt Spieler
- ✅ Kollisionen mit Bäumen, Felsen, Wasser
- ✅ NPC im Dorf mit Interaktions-Indikator
- ✅ Dialogfenster bei E-Druck

## Geplante nächste Schritte

- ⏭️ **Stufe 2** — Generisches Interaktionssystem (Kräuter, Baumlöcher, Bodenschätze)
- ⏭️ Echtes Tile-/Sprite-Asset-Layer (statt farbiger Rechtecke)
- ⏭️ Inventar-Vorstufe (Variablen + Debug-HUD)
- ⏭️ Sound-Effekte
- ⏭️ Animationen für Player + NPC

## Wichtige Hinweise

- ❌ Keine geschützten Marken oder Assets
- ✅ Eigene generische Fantasy-Welt
- ✅ Modular & erweiterbar
- ✅ Reines HTML/CSS/JS-Output, keine Build-Blocker
