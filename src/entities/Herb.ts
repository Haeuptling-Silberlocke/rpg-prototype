import Phaser from 'phaser';
import { Interactable, InteractionConfig } from './Interactable';

/**
 * Ein sammelbares Kraut. Erscheint auf der Wiese, nach E sammelt es weg.
 */
export class Herb extends Interactable {
  constructor(scene: Phaser.Scene, x: number, y: number, config: InteractionConfig) {
    super(scene, x, y, 'herb', config);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(20, 20);
    this.drawAppearance();
  }

  drawAppearance(): void {
    // Kleine Pixel-Art-Pflanze direkt auf den Sprite
    const g = this.scene.add.graphics();
    const sx = this.x - 10;
    const sy = this.y - 10;

    // Stengel
    g.fillStyle(0x15803d, 1);
    g.fillRect(sx + 8, sy + 10, 2, 8);

    // Blätter (2)
    g.fillStyle(0x22c55e, 1);
    g.fillRect(sx + 4, sy + 10, 4, 3);
    g.fillRect(sx + 10, sy + 9, 4, 3);

    // Blüte (lila Mondkraut-Optik)
    g.fillStyle(0xc084fc, 1);
    g.fillRect(sx + 7, sy + 5, 4, 4);
    g.fillStyle(0xfae8ff, 1);
    g.fillRect(sx + 8, sy + 6, 2, 2);

    g.setDepth(this.depth + 1);
    this.setData('graphics', g);
  }

  protected override onSuccess(): void {
    // Pixel-Grafik entfernen
    const g = this.getData('graphics') as Phaser.GameObjects.Graphics | undefined;
    g?.destroy();
    super.onSuccess();
  }
}
