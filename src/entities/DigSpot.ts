import Phaser from 'phaser';
import { Interactable, InteractionConfig } from './Interactable';

/**
 * Eine auffällige Bodenstelle (Unebenheit).
 * Später in Stufe 3 mit Schaufel-Tool zum Ausgraben.
 */
export class DigSpot extends Interactable {
  constructor(scene: Phaser.Scene, x: number, y: number, config: InteractionConfig) {
    super(scene, x, y, 'digSpot', config);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(22, 22);
    this.drawAppearance();
  }

  drawAppearance(): void {
    // Unebenheiten am Boden: braune Klekse + Schraffur
    const g = this.scene.add.graphics();

    // Dunklerer Boden-Patch
    g.fillStyle(0x451a03, 0.6);
    g.fillCircle(this.x, this.y, 10);
    g.fillStyle(0x78350f, 0.8);
    g.fillCircle(this.x, this.y, 8);

    // "X marks the spot" Schraffur
    g.lineStyle(2, 0xfbbf24, 1);
    g.beginPath();
    g.moveTo(this.x - 5, this.y - 5);
    g.lineTo(this.x + 5, this.y + 5);
    g.moveTo(this.x + 5, this.y - 5);
    g.lineTo(this.x - 5, this.y + 5);
    g.strokePath();

    g.setDepth(this.depth + 1);
    this.setData('graphics', g);
  }

  protected override onSuccess(): void {
    const g = this.getData('graphics') as Phaser.GameObjects.Graphics | undefined;
    g?.destroy();
    super.onSuccess();
  }
}
