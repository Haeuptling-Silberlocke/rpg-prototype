import { GameState } from '../systems/GameState';

const PANEL_WIDTH = 130;
const PANEL_HEIGHT = 76;
const PANEL_PADDING = 8;
const PANEL_MARGIN = 8;

/**
 * StatusPanel - kleines UI oben rechts.
 * Zeigt Gold / Kräuter / Alte Münzen und updated live bei GameState-Änderungen.
 */
export class StatusPanel {
  public container: Phaser.GameObjects.Container;
  private goldText!: Phaser.GameObjects.Text;
  private herbsText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const { width } = scene.scale;
    const x = width - PANEL_WIDTH / 2 - PANEL_MARGIN;
    const y = PANEL_HEIGHT / 2 + PANEL_MARGIN;

    this.container = scene.add.container(x, y).setScrollFactor(0).setDepth(1000);

    // Hintergrund
    const bg = scene.add.rectangle(
      0,
      0,
      PANEL_WIDTH,
      PANEL_HEIGHT,
      0x111827,
      0.85
    );
    bg.setStrokeStyle(2, 0xf59e0b, 1);
    this.container.add(bg);

    // Titel
    const title = scene.add
      .text(0, -PANEL_HEIGHT / 2 + 12, 'STATUS', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#f59e0b',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.container.add(title);

    // Zeilen
    this.goldText = this.addLine(scene, 0, -8, 'Gold: 0');
    this.herbsText = this.addLine(scene, 0, 10, 'Kräuter: 0');
    this.coinsText = this.addLine(scene, 0, 28, 'Münzen: 0');

    // An GameState hängen
    const state = GameState.instance;
    state.on('gold-changed', () => this.refresh());
    state.on('herbs-changed', () => this.refresh());
    state.on('coins-changed', () => this.refresh());

    this.refresh();
  }

  private addLine(
    scene: Phaser.Scene,
    x: number,
    y: number,
    initial: string
  ): Phaser.GameObjects.Text {
    const text = scene.add.text(
      x - PANEL_WIDTH / 2 + PANEL_PADDING,
      y,
      initial,
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#e5e7eb',
      }
    );
    this.container.add(text);
    return text;
  }

  private refresh(): void {
    const state = GameState.instance;
    this.goldText.setText(`💰 Gold: ${state.gold}`);
    this.herbsText.setText(`🌿 Kräuter: ${state.herbs}`);
    this.coinsText.setText(`🪙 Münzen: ${state.oldCoins}`);
  }
}
