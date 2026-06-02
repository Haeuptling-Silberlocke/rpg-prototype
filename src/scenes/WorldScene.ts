import Phaser from 'phaser';
import { Player, generatePlayerTextures } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { DialogUI } from '../ui/DialogUI';
import { TILE_SIZE, TILE_KEYS } from '../systems/Constants';
import { buildCollisionMap } from '../systems/CollisionMap';
import { generateWorld } from '../systems/WorldGenerator';

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private npc!: NPC;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };
  private dialogUI!: DialogUI;

  constructor() {
    super('WorldScene');
  }

  create(): void {
    // ===== TEXTURES GENERIEREN (Pixel-Art Player) =====
    generatePlayerTextures(this);

    const mapWidth = 40;
    const mapHeight = 30;
    const world = generateWorld(mapWidth, mapHeight);

    // ===== TILE LAYER =====
    const groundLayer = this.add.container(0, 0);
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tileKey = world.tiles[y][x];
        const rect = this.add.rectangle(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE,
          TILE_SIZE,
          TILE_KEYS[tileKey].color
        );
        rect.setOrigin(0.5, 0.5);
        groundLayer.add(rect);
      }
    }

    // ===== DECORATION LAYER (Bäume, Felsen) =====
    const decorationLayer = this.physics.add.staticGroup();
    for (const deco of world.decorations) {
      const tile = TILE_KEYS[deco.type];
      const obj = this.add.rectangle(
        deco.x * TILE_SIZE + TILE_SIZE / 2,
        deco.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE,
        TILE_SIZE,
        tile.color
      );
      obj.setStrokeStyle(2, tile.borderColor);
      obj.setData('blocked', true);
      this.physics.add.existing(obj, true);
      decorationLayer.add(obj);
    }

    // ===== NPC =====
    this.npc = new NPC(this, 10 * TILE_SIZE, 8 * TILE_SIZE, 'Elder');
    this.add.existing(this.npc);

    // ===== PLAYER =====
    this.player = new Player(this, 8 * TILE_SIZE, 8 * TILE_SIZE);
    this.add.existing(this.player);

    // ===== KAMERA =====
    this.cameras.main.setBackgroundColor('#0a0a14');
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(
      0, 0,
      mapWidth * TILE_SIZE,
      mapHeight * TILE_SIZE
    );

    // ===== INPUT =====
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      E: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    };

    // ===== KOLLISIONEN =====
    buildCollisionMap(world); // für Stufe 2 vorbereitet
    this.physics.add.collider(this.player, decorationLayer);

    // ===== DIALOG UI =====
    this.dialogUI = new DialogUI(this);

    // ===== NPC INTERAKTION =====
    this.physics.add.overlap(this.player, this.npc, () => {
      this.npc.setNearby(true);
    }, undefined, this);

    this.events.on('update', (time: number, delta: number) => {
      if (Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.npc.x, this.npc.y
      ) > TILE_SIZE * 1.5) {
        this.npc.setNearby(false);
      }
      this.handleMovement(time, delta);
      this.handleInteraction();
    });

    // HUD-Hinweis
    this.add.text(10, 10, 'WASD = bewegen | E = interagieren', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0);
  }

  private handleMovement(_time: number, delta: number): void {
    if (this.dialogUI.isOpen()) {
      this.player.setVelocity(0, 0);
      return;
    }
    const speed = 150;
    let vx = 0;
    let vy = 0;
    if (this.wasdKeys.A.isDown || this.cursors.left?.isDown) vx -= speed;
    if (this.wasdKeys.D.isDown || this.cursors.right?.isDown) vx += speed;
    if (this.wasdKeys.W.isDown || this.cursors.up?.isDown) vy -= speed;
    if (this.wasdKeys.S.isDown || this.cursors.down?.isDown) vy += speed;
    // setVelocityAndFace aktualisiert Richtung + Walk-Frame automatisch
    this.player.setVelocityAndFace(vx, vy, delta);
  }

  private handleInteraction(): void {
    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.E)) {
      if (this.npc.isNearby() && !this.dialogUI.isOpen()) {
        this.dialogUI.show(
          'Weiser Elder',
          [
            'Willkommen, Wanderer.',
            'Diese Welt steckt voller Geheimnisse...',
            'Drücke E erneut zum Schließen.',
          ]
        );
      } else if (this.dialogUI.isOpen()) {
        this.dialogUI.advance();
      }
    }
  }
}
