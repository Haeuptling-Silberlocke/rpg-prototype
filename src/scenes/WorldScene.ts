import Phaser from 'phaser';
import { Player, generatePlayerTextures } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { DialogUI } from '../ui/DialogUI';
import { Interactable } from '../entities/Interactable';
import { Herb } from '../entities/Herb';
import { TreeHole } from '../entities/TreeHole';
import { DigSpot } from '../entities/DigSpot';
import { TILE_SIZE, TILE_KEYS, INTERACT_DISTANCE } from '../systems/Constants';
import { buildCollisionMap } from '../systems/CollisionMap';
import { generateWorld, WorldInteractable } from '../systems/WorldGenerator';

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private npc!: NPC;
  private interactables: Interactable[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };
  private dialogUI!: DialogUI;
  private messageText?: Phaser.GameObjects.Text;
  private messageTimer = 0;

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

    // ===== INTERACTABLES (Kraut, Baumloch, Bodenstelle) =====
    for (const def of world.interactables) {
      this.spawnInteractable(def);
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
    this.cameras.main.setBounds(0, 0, mapWidth * TILE_SIZE, mapHeight * TILE_SIZE);

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
    buildCollisionMap(world);
    this.physics.add.collider(this.player, decorationLayer);

    // ===== DIALOG UI =====
    this.dialogUI = new DialogUI(this);

    // ===== NPC INTERAKTION (overlap) =====
    this.physics.add.overlap(this.player, this.npc, () => {
      this.npc.setNearby(true);
    }, undefined, this);

    // ===== UPDATE LOOP =====
    this.events.on('update', (time: number, delta: number) => {
      this.updateProximity();
      this.updateMessageTimer(delta);
      this.handleMovement(time, delta);
      this.handleInteraction();
    });

    // HUD
    this.add.text(10, 10, 'WASD = bewegen | E = interagieren', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0);

    // Counter HUD (rechts oben)
    const counter = this.add.text(this.cameras.main.width - 10, 10, '🌿 0', {
      fontSize: '16px',
      color: '#c084fc',
      backgroundColor: '#0a0a14cc',
      padding: { x: 8, y: 4 },
    })
      .setOrigin(1, 0)
      .setScrollFactor(0);
    this.events.on('update', () => {
      counter.setText(`🌿 ${this.collectedCount}`);
    });
  }

  private spawnInteractable(def: WorldInteractable): void {
    const px = def.x * TILE_SIZE + TILE_SIZE / 2;
    const py = def.y * TILE_SIZE + TILE_SIZE / 2;
    const entity: Interactable = this.createInteractable(def.type, px, py);
    this.interactables.push(entity);
  }

  private createInteractable(type: 'herb' | 'treeHole' | 'digSpot', px: number, py: number): Interactable {
    switch (type) {
      case 'herb':
        return new Herb(this, px, py, {
          type: 'herb',
          hint: 'E = sammeln',
          successText: 'Du hast Mondkraut gesammelt.',
          onInteract: (scene) => {
            const count = (scene as WorldScene).getCollectedCount();
            (scene as WorldScene).setCollectedCount(count + 1);
          },
        });
      case 'treeHole':
        return new TreeHole(this, px, py, {
          type: 'treeHole',
          hint: 'E = untersuchen',
          successText: 'In dem Baumloch liegt eine alte Münze.',
        });
      case 'digSpot':
        return new DigSpot(this, px, py, {
          type: 'digSpot',
          hint: 'E = untersuchen',
          successText: 'Hier scheint etwas vergraben zu sein.',
          requiredTool: 'shovel', // Platzhalter: zeigt nur Text
          requiredToolMissingText: 'Dir fehlt das richtige Werkzeug zum Graben.',
        });
    }
  }

  // ===== State für Debug-Counter (für späteres Inventar) =====
  private collectedCount = 0;
  getCollectedCount(): number { return this.collectedCount; }
  setCollectedCount(n: number): void { this.collectedCount = n; }

  private updateProximity(): void {
    // NPC
    if (Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.npc.x, this.npc.y
    ) > TILE_SIZE * 1.5) {
      this.npc.setNearby(false);
    }
    // Interactables
    for (const i of this.interactables) {
      if (i.isConsumed()) continue;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, i.x, i.y
      );
      i.setNearby(dist <= INTERACT_DISTANCE);
    }
  }

  private showMessage(text: string, color: string = '#FCD34D'): void {
    this.messageText?.destroy();
    const cam = this.cameras.main;
    this.messageText = this.add.text(cam.width / 2, cam.height - 160, text, {
      fontSize: '16px',
      color,
      backgroundColor: '#0a0a14ee',
      padding: { x: 16, y: 10 },
      align: 'center',
      wordWrap: { width: cam.width - 40 },
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(900);

    // Pop-in Animation
    this.messageText.setScale(0.7);
    this.tweens.add({
      targets: this.messageText,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut',
    });

    this.messageTimer = 3000; // 3 Sekunden anzeigen
  }

  private updateMessageTimer(delta: number): void {
    if (this.messageTimer > 0) {
      this.messageTimer -= delta;
      if (this.messageTimer <= 0 && this.messageText) {
        // Fade out
        this.tweens.add({
          targets: this.messageText,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            this.messageText?.destroy();
            this.messageText = undefined;
          },
        });
        this.messageTimer = 0;
      }
    }
  }

  private handleMovement(_time: number, delta: number): void {
    if (this.dialogUI.isOpen()) {
      this.player.setVelocity(0, 0);
      return;
    }
    const speed = 150;
    let vx = 0, vy = 0;
    if (this.wasdKeys.A.isDown || this.cursors.left?.isDown) vx -= speed;
    if (this.wasdKeys.D.isDown || this.cursors.right?.isDown) vx += speed;
    if (this.wasdKeys.W.isDown || this.cursors.up?.isDown) vy -= speed;
    if (this.wasdKeys.S.isDown || this.cursors.down?.isDown) vy += speed;
    this.player.setVelocityAndFace(vx, vy, delta);
  }

  private handleInteraction(): void {
    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.E)) {
      // 1) Dialog hat Vorrang (wenn offen, E schließt/advanced)
      if (this.dialogUI.isOpen()) {
        this.dialogUI.advance();
        return;
      }
      // 2) NPC-Dialog öffnen
      if (this.npc.isNearby()) {
        this.dialogUI.show('Weiser Elder', [
          'Willkommen, Wanderer.',
          'Diese Welt steckt voller Geheimnisse...',
          'Versuche das Mondkraut neben dem Weg zu sammeln!',
          'Drücke E erneut zum Schließen.',
        ]);
        return;
      }
      // 3) Interactables (nur nearest, eines gleichzeitig)
      let nearest: Interactable | null = null;
      let nearestDist = Infinity;
      for (const i of this.interactables) {
        if (!i.isNearby() || i.isConsumed()) continue;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, i.x, i.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = i;
        }
      }
      if (nearest) {
        const result = nearest.interact();
        const color = result.success ? '#86efac' : '#fbbf24';
        this.showMessage(result.message, color);
      }
    }
  }
}
