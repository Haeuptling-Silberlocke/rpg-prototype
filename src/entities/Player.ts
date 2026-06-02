import Phaser from 'phaser';
import { TILE_SIZE } from '../systems/Constants';

/**
 * Generiert prozedural eine kleine Pixel-Art-Spielfigur als Phaser-Texture.
 * Verwendet 4 Richtungen (down, up, left, right) + 2 Walk-Frames pro Richtung.
 * Keine externen Assets nötig — alles wird zur Laufzeit gezeichnet.
 *
 * Sprite-Größe: 16x16 logische Pixel, wird auf 32x32 TILE skaliert.
 */
export function generatePlayerTextures(scene: Phaser.Scene): void {
  const size = 16;
  const directions = ['down', 'up', 'left', 'right'] as const;
  for (const dir of directions) {
    for (let frame = 0; frame < 2; frame++) {
      const key = `player-${dir}-${frame}`;
      if (scene.textures.exists(key)) continue;
      const canvas = scene.textures.createCanvas(key, size, size)!;
      const ctx = canvas.context;
      drawHero(ctx, dir, frame);
      canvas.refresh();
    }
  }
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/**
 * Zeichnet einen kleinen Helden.
 * - Blaue Kapuze (Kopf) + Rüstung
 * - Hautfarbe (Gesicht)
 * - Gürtel
 * - 2 Beine (in Side-View: ein Bein verdeckt)
 * - 2 Walk-Frames für Bein- und Arm-Animation
 * - "Augen" zeigen in die Bewegungsrichtung
 */
function drawHero(ctx: CanvasRenderingContext2D, dir: 'down' | 'up' | 'left' | 'right', frame: number): void {
  // Farbpalette (hoher Kontrast gegen dunkle Tiles + warmes Gras/Sand)
  const SKIN    = '#f5c089';
  const SKIN_DK = '#c89060';
  const HOOD    = '#60a5fa';  // Helleres Blau für Kapuze (Kontrast gegen dunkle Bäume)
  const HOOD_DK = '#1e40af';
  const HOOD_HL = '#93c5fd';  // Highlight oben
  const ARMOR   = '#2563eb';
  const ARMOR_HL= '#3b82f6';
  const BELT    = '#92400e';
  const BELT_BK = '#78350f';
  const PANTS   = '#1e3a8a';
  const BOOT    = '#0a0a14';  // Fast schwarz, klar als Stiefel erkennbar
  const EYES    = '#0a0a14';

  // ===== SCHATTEN (oval, semi-transparent) =====
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(8, 15, 5, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // ===== KÖRPER (Rüstung) =====
  // Schultern breit, Brust etwas schmaler
  rect(ctx, 5, 7, 6, 1, ARMOR_HL);  // Schulter-Highlight
  rect(ctx, 4, 8, 8, 1, ARMOR);
  rect(ctx, 4, 9, 8, 1, ARMOR);
  rect(ctx, 4, 10, 8, 1, ARMOR);
  rect(ctx, 4, 11, 8, 1, BELT);
  rect(ctx, 4, 12, 8, 1, BELT_BK);

  // ===== KAPUZE (Kopf, abhängig von Richtung) =====
  if (dir === 'down') {
    // Kapuze von vorn (mit Gesicht)
    rect(ctx, 5, 1, 6, 1, HOOD_HL);  // Top-Highlight
    rect(ctx, 4, 2, 8, 1, HOOD);
    rect(ctx, 4, 3, 8, 1, HOOD);
    rect(ctx, 4, 4, 8, 1, HOOD);
    // Kapuzen-Schatten unten
    rect(ctx, 4, 5, 8, 1, HOOD_DK);
    rect(ctx, 4, 6, 8, 1, HOOD_DK);
    // Gesicht (Haut in der Kapuze)
    rect(ctx, 5, 4, 6, 1, SKIN);
    // Augen
    px(ctx, 6, 4, EYES);
    px(ctx, 9, 4, EYES);
    // Mund
    rect(ctx, 7, 5, 2, 1, SKIN_DK);
  } else if (dir === 'up') {
    // Kapuze von hinten (kein Gesicht, aber Highlight)
    rect(ctx, 5, 1, 6, 1, HOOD_HL);
    rect(ctx, 4, 2, 8, 1, HOOD);
    rect(ctx, 4, 3, 8, 1, HOOD);
    rect(ctx, 4, 4, 8, 1, HOOD);
    rect(ctx, 4, 5, 8, 1, HOOD);
    rect(ctx, 4, 6, 8, 1, HOOD_DK);
    // Kapuzenspitze
    rect(ctx, 7, 7, 2, 1, HOOD_DK);
  } else if (dir === 'left') {
    // Profil links
    rect(ctx, 5, 1, 6, 1, HOOD_HL);
    rect(ctx, 4, 2, 7, 1, HOOD);
    rect(ctx, 4, 3, 7, 1, HOOD);
    rect(ctx, 4, 4, 7, 1, HOOD);
    rect(ctx, 4, 5, 7, 1, HOOD_DK);
    rect(ctx, 4, 6, 7, 1, HOOD_DK);
    // Gesicht (1 Pixel Haut vorne)
    rect(ctx, 4, 5, 1, 1, SKIN);
    // Auge
    px(ctx, 5, 4, EYES);
  } else {
    // Profil rechts
    rect(ctx, 5, 1, 6, 1, HOOD_HL);
    rect(ctx, 5, 2, 7, 1, HOOD);
    rect(ctx, 5, 3, 7, 1, HOOD);
    rect(ctx, 5, 4, 7, 1, HOOD);
    rect(ctx, 5, 5, 7, 1, HOOD_DK);
    rect(ctx, 5, 6, 7, 1, HOOD_DK);
    // Gesicht
    rect(ctx, 11, 5, 1, 1, SKIN);
    // Auge
    px(ctx, 10, 4, EYES);
  }

  // ===== ARME (Walk-Animation: 2 Frames) =====
  if (dir === 'left' || dir === 'right') {
    // Im Profil: ein Arm vorne, einer hinten (nur einer sichtbar je nach Frame)
    if (frame === 0) {
      // Idle: Arm an der Seite
      rect(ctx, 4, 8, 1, 3, ARMOR);
    } else {
      // Walk: Arm nach vorn
      rect(ctx, 4, 9, 1, 3, ARMOR_HL);
    }
  } else {
    // Down/Up: beide Arme seitlich
    if (frame === 0) {
      // Idle: Arme hängen nah am Körper
      rect(ctx, 3, 8, 1, 3, ARMOR);
      rect(ctx, 12, 8, 1, 3, ARMOR);
    } else {
      // Walk: Arme schwingen
      rect(ctx, 2, 8, 1, 3, ARMOR);
      rect(ctx, 13, 8, 1, 3, ARMOR);
    }
  }

  // ===== BEINE (Walk-Animation) =====
  if (dir === 'left' || dir === 'right') {
    // Im Profil: nur ein Bein sichtbar
    if (frame === 0) {
      // Idle: Bein steht
      rect(ctx, 5, 13, 3, 2, PANTS);
      rect(ctx, 5, 14, 3, 1, BOOT);
    } else {
      // Walk: Bein schwingt
      rect(ctx, 5, 13, 3, 3, PANTS);
      rect(ctx, 5, 14, 3, 1, BOOT);
    }
  } else {
    // Down/Up: beide Beine
    if (frame === 0) {
      // Idle
      rect(ctx, 5, 13, 2, 1, PANTS);
      rect(ctx, 9, 13, 2, 1, PANTS);
      rect(ctx, 5, 14, 2, 1, PANTS);
      rect(ctx, 9, 14, 2, 1, PANTS);
      rect(ctx, 5, 14, 2, 1, BOOT);
      rect(ctx, 9, 14, 2, 1, BOOT);
    } else {
      // Walk: linkes Bein vor
      rect(ctx, 5, 13, 2, 2, PANTS);
      rect(ctx, 9, 13, 2, 1, PANTS);
      rect(ctx, 5, 14, 2, 1, BOOT);
      rect(ctx, 9, 13, 2, 1, BOOT);
    }
  }
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private currentDirection: 'down' | 'up' | 'left' | 'right' = 'down';
  private walkFrame = 0;
  private walkTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-down-0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(TILE_SIZE, TILE_SIZE);
    this.setCollideWorldBounds(true);
  }

  /**
   * Bewegt den Spieler. Erwartet velocity in px/s.
   * Aktualisiert Richtung, Walk-Frame und Texture.
   */
  setVelocityAndFace(vx: number, vy: number, deltaMs: number): void {
    this.setVelocity(vx, vy);

    const isMoving = vx !== 0 || vy !== 0;

    if (isMoving) {
      if (Math.abs(vx) > Math.abs(vy)) {
        this.currentDirection = vx > 0 ? 'right' : 'left';
      } else {
        this.currentDirection = vy > 0 ? 'down' : 'up';
      }

      this.walkTimer += deltaMs;
      if (this.walkTimer >= 180) {
        this.walkTimer = 0;
        this.walkFrame = this.walkFrame === 0 ? 1 : 0;
      }
    } else {
      this.walkFrame = 0;
      this.walkTimer = 0;
    }

    this.setTexture(`player-${this.currentDirection}-${this.walkFrame}`);
  }
}
