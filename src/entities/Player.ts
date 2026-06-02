import Phaser from 'phaser';
import { TILE_SIZE } from '../systems/Constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(TILE_SIZE, TILE_SIZE);
    this.setCollideWorldBounds(true);
    this.setTint(0x3b82f6);
  }
}
