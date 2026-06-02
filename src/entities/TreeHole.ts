import Phaser from 'phaser';
import { Interactable, InteractionConfig } from './Interactable';

/**
 * Ein untersuchbarer Baum mit einem Loch.
 * Bleibt nach Untersuchung sichtbar (One-Shot=false), nur Text ändert sich.
 */
export class TreeHole extends Interactable {
  constructor(scene: Phaser.Scene, x: number, y: number, config: InteractionConfig) {
    super(scene, x, y, 'treeHole', config);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(28, 28);
    this.drawAppearance();
  }

  drawAppearance(): void {
    // Baumstumpf: brauner Kreis + schwarzes Loch in der Mitte
    const g = this.scene.add.graphics();

    // Stumpf-Ring
    g.fillStyle(0x78350f, 1);
    g.fillCircle(this.x, this.y, 12);
    g.fillStyle(0x92400e, 1);
    g.fillCircle(this.x, this.y, 10);
    g.fillStyle(0x78350f, 1);
    g.fillCircle(this.x, this.y, 8);

    // Loch (dunkel)
    g.fillStyle(0x0a0a14, 1);
    g.fillCircle(this.x, this.y, 5);

    // Highlight oben (für Tiefe)
    g.fillStyle(0x451a03, 1);
    g.fillCircle(this.x - 1, this.y - 2, 1);

    g.setDepth(this.depth + 1);
    this.setData('graphics', g);
  }
}
