import { TILE_SIZE } from '../systems/Constants';

/**
 * Tree-Varianten mit unterschiedlicher Optik für abwechslungsreiche Wälder.
 */
export type TreeVariant = 'oak' | 'pine' | 'dark';

/**
 * Erzeugt die Tree-Textures:
 * - `<variant>-trunk`  : 16x32 (kollidierbar, 12px Stamm unten)
 * - `<variant>-crown`  : 32x32 (nicht kollidierbar, sitzt auf Tile darüber)
 * - `<variant>-shadow` : 32x8 ovaler Schatten (deko unter Krone)
 *
 * Jeder Baum in der Szene = Container mit Trunk (depth=niedrig) + Crown (depth=hoch).
 * Trunk kollidiert nur in den unteren 12px (siehe WorldScene-Setup).
 * Crown überlappt visuell Spieler von oben → räumliche Tiefe.
 */
export function generateTreeTextures(scene: Phaser.Scene): void {
  const variants: TreeVariant[] = ['oak', 'pine', 'dark'];
  for (const v of variants) {
    ensureTrunk(scene, v);
    ensureCrown(scene, v);
    ensureShadow(scene, v);
  }
}

function ensureTrunk(scene: Phaser.Scene, v: TreeVariant): void {
  const key = `${v}-trunk`;
  if (scene.textures.exists(key)) return;
  const w = 16;
  const h = TILE_SIZE; // 32
  const canvas = scene.textures.createCanvas(key, w, h)!;
  const ctx = canvas.context;
  drawTrunk(ctx, w, h, v);
  canvas.refresh();
}

function ensureCrown(scene: Phaser.Scene, v: TreeVariant): void {
  const key = `${v}-crown`;
  if (scene.textures.exists(key)) return;
  const size = TILE_SIZE; // 32
  const canvas = scene.textures.createCanvas(key, size, size)!;
  const ctx = canvas.context;
  drawCrown(ctx, size, size, v);
  canvas.refresh();
}

function ensureShadow(scene: Phaser.Scene, v: TreeVariant): void {
  const key = `${v}-shadow`;
  if (scene.textures.exists(key)) return;
  const w = TILE_SIZE;
  const h = 6;
  const canvas = scene.textures.createCanvas(key, w, h)!;
  const ctx = canvas.context;
  // Oval-Schatten
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 1, 0, 0, Math.PI * 2);
  ctx.fill();
  canvas.refresh();
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
 * Zeichnet den Stamm in den unteren 12 Pixeln (kollidierbarer Bereich).
 * Trunk wird auf 16x32 erzeugt; oberer Bereich (y=0..19) ist leer,
 * sodass die Krone nahtlos anschließen kann.
 */
function drawTrunk(ctx: CanvasRenderingContext2D, w: number, h: number, v: TreeVariant): void {
  const cx = w / 2;
  const trunkTop = h - 12; // Stamm beginnt bei y=20

  // Farben je Variante
  let trunkMain: string, trunkDk: string, trunkHl: string;
  if (v === 'oak') {
    trunkMain = '#78350f';
    trunkDk = '#451a03';
    trunkHl = '#92400e';
  } else if (v === 'pine') {
    trunkMain = '#5c3317';
    trunkDk = '#2e1a0a';
    trunkHl = '#7c4a26';
  } else {
    trunkMain = '#3e2a1a';
    trunkDk = '#1a0f08';
    trunkHl = '#5c3d2a';
  }

  // Stamm: 6px breit, 12px hoch
  const trunkW = 6;
  const trunkH = 12;
  const trunkX = Math.floor(cx - trunkW / 2);
  rect(ctx, trunkX, trunkTop, trunkW, trunkH, trunkMain);
  // Schatten rechts
  rect(ctx, trunkX + trunkW - 1, trunkTop, 1, trunkH, trunkDk);
  // Highlight links
  rect(ctx, trunkX, trunkTop, 1, trunkH, trunkHl);
  // Rinde (1-2 Details)
  if (v === 'oak' || v === 'pine') {
    px(ctx, trunkX + 2, trunkTop + 4, trunkDk);
    px(ctx, trunkX + 4, trunkTop + 8, trunkDk);
  }
}

/**
 * Zeichnet die Baumkrone (32x32). Verschiedene Formen pro Variante.
 */
function drawCrown(ctx: CanvasRenderingContext2D, w: number, h: number, v: TreeVariant): void {
  const cx = w / 2;
  const cy = h / 2;

  if (v === 'oak') {
    // Eiche: rundliche, breite Krone in mehreren Grüntönen
    const main = '#16a34a';
    const dk = '#14532d';
    const hl = '#22c55e';
    const dk2 = '#052e16';
    // Outer halo (sehr dunkel)
    circle(ctx, cx, cy + 1, 15, dk2);
    // Main crown
    circle(ctx, cx, cy, 14, main);
    // Shadow lobes (untere Hälfte dunkler)
    fillRect(ctx, 1, cy, w - 2, 5, dk);
    fillRect(ctx, 3, cy + 5, w - 6, 3, dk);
    // Highlights (obere Hälfte)
    fillRect(ctx, 5, 4, 8, 3, hl);
    fillRect(ctx, 8, 2, 4, 2, hl);
    // Light leaf clusters
    px(ctx, 9, 6, '#bbf7d0');
    px(ctx, 19, 8, '#bbf7d0');
    px(ctx, 13, 12, '#bbf7d0');
  } else if (v === 'pine') {
    // Tanne: 3 Dreiecks-Ebenen, dunkelgrün
    const main = '#166534';
    const dk = '#052e16';
    const hl = '#15803d';    // Bottom triangle (breit)
    triangle(ctx, cx, 28, 14, 4, main);
    triangle(ctx, cx, 28, 12, 4, dk, 'shadow');
    // Mid triangle
    triangle(ctx, cx, 21, 11, 4, main);
    triangle(ctx, cx, 21, 9, 4, dk, 'shadow');
    // Top triangle (spitz)
    triangle(ctx, cx, 12, 8, 4, main);
    triangle(ctx, cx, 12, 6, 4, dk, 'shadow');
    // Highlights
    px(ctx, cx - 2, 18, hl);
    px(ctx, cx - 3, 24, hl);
    px(ctx, cx - 2, 28, hl);
    // Stamm-Spitze sichtbar (ganz oben)
    fillRect(ctx, cx - 1, 4, 2, 3, '#5c3317');
  } else {
    // Dark tree: kompakt, mystisch-violett
    const main = '#4c1d95';
    const dk = '#1e0a3c';
    const hl = '#6d28d9';
    const accent = '#a78bfa';
    circle(ctx, cx, cy + 2, 12, dk);
    circle(ctx, cx, cy, 11, main);
    // Inner glow (lighter purple)
    circle(ctx, cx, cy - 1, 6, hl);
    // Glowing eyes / mystical spots
    px(ctx, cx - 4, cy - 2, accent);
    px(ctx, cx + 4, cy - 2, accent);
    px(ctx, cx - 1, cy + 4, accent);
    // Shadow
    fillRect(ctx, 4, cy + 7, w - 8, 3, dk);
    // Highlights
    px(ctx, 8, 5, '#c4b5fd');
    px(ctx, 20, 7, '#c4b5fd');
  }
}

function circle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function fillRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/**
 * Zeichnet ein Dreieck (Tannen-Ebene).
 * mode='shadow' zeichnet die rechte Hälfte (etwas nach links versetzt) als Schatten.
 */
function triangle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bottomY: number,
  halfWidth: number,
  height: number,
  color: string,
  mode: 'full' | 'shadow' = 'full'
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (mode === 'full') {
    ctx.moveTo(cx, bottomY - height);
    ctx.lineTo(cx - halfWidth, bottomY);
    ctx.lineTo(cx + halfWidth, bottomY);
  } else {
    // Shadow: leicht nach links versetztes, schmaleres Dreieck
    ctx.moveTo(cx + 1, bottomY - height + 1);
    ctx.lineTo(cx - halfWidth + 2, bottomY);
    ctx.lineTo(cx + halfWidth - 2, bottomY);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Hilfsfunktion für WorldScene: Spawnt einen Baum (Trunk + Crown) an Tile (x,y).
 * - trunkBody: statisches Arcade-Body nur in den unteren 12px (kollidierbar)
 * - crownSprite: NICHT kollidierbar, sitzt 32px höher (über dem Tile)
 *
 * Y-Sort via dynamischer depth: trunk.depth = y*100 + 1, crown.depth = y*100 + 3,
 * player.depth wird entsprechend in WorldScene gesetzt → Spieler zwischen Stamm und Krone.
 */
export function spawnTree(
  scene: Phaser.Scene,
  staticGroup: Phaser.Physics.Arcade.StaticGroup,
  variant: TreeVariant,
  tileX: number,
  tileY: number
): void {
  const ts = TILE_SIZE;
  const centerX = tileX * ts + ts / 2;
  const centerY = tileY * ts + ts / 2;

  // 1) Trunk (im Tile, untere Hälfte kollidiert)
  const trunk = scene.add.image(centerX, centerY, `${variant}-trunk`);
  trunk.setOrigin(0.5, 0.5);
  scene.physics.add.existing(trunk, true); // static body
  const body = trunk.body as Phaser.Physics.Arcade.Body;
  // Body nur in den unteren 12px des Trunks (= untere 12px des Tiles)
  body.setSize(6, 12);
  body.setOffset((16 - 6) / 2, ts - 12);
  body.updateFromGameObject();
  trunk.setData('blocked', true);
  staticGroup.add(trunk);
  trunk.setDepth(tileY * 100 + 1);

  // 2) Crown (über dem Tile)
  const crown = scene.add.image(centerX, centerY - ts, `${variant}-crown`);
  crown.setOrigin(0.5, 0.5);
  crown.setDepth(tileY * 100 + 3); // höher als Player (depth = y*100 + 2)

  // 3) Shadow (unter der Krone, sehr niedrige depth)
  const shadow = scene.add.image(centerX, centerY + ts / 2 - 1, `${variant}-shadow`);
  shadow.setOrigin(0.5, 0.5);
  shadow.setDepth(tileY * 100 + 0);
}
