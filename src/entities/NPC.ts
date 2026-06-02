import Phaser from 'phaser';
import { TILE_SIZE } from '../systems/Constants';

export class NPC extends Phaser.Physics.Arcade.Sprite {
  private nearby = false;
  private indicator?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, public name: string) {
    super(scene, x, y, 'npc');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(TILE_SIZE, TILE_SIZE);
    this.setTint(0xf59e0b);
    this.setImmovable(true);
    this.setData('blocked', true);
  }

  setNearby(value: boolean): void {
    if (this.nearby === value) return;
    this.nearby = value;
    if (value && !this.indicator) {
      this.indicator = this.scene.add.text(this.x, this.y - TILE_SIZE, '!', {
        fontSize: '20px',
        color: '#FCD34D',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.scene.tweens.add({
        targets: this.indicator,
        y: this.y - TILE_SIZE - 8,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    } else if (!value && this.indicator) {
      this.indicator.destroy();
      this.indicator = undefined;
    }
  }

  isNearby(): boolean {
    return this.nearby;
  }
}
