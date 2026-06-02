import Phaser from 'phaser';

export class DialogUI {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;
  private textObj?: Phaser.GameObjects.Text;
  private lines: string[] = [];
  private lineIndex = 0;
  private open = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  isOpen(): boolean {
    return this.open;
  }

  show(speaker: string, lines: string[]): void {
    if (this.open) return;
    this.lines = lines;
    this.lineIndex = 0;
    this.open = true;

    const cam = this.scene.cameras.main;
    const width = 600;
    const height = 120;
    const x = cam.width / 2 - width / 2;
    const y = cam.height - height - 20;

    this.container = this.scene.add.container(x, y).setScrollFactor(0).setDepth(1000);

    const bg = this.scene.add.rectangle(0, 0, width, height, 0x0b1020, 0.95);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(2, 0xf59e0b);

    const nameText = this.scene.add.text(16, 10, speaker, {
      fontSize: '14px',
      color: '#F59E0B',
      fontStyle: 'bold',
    });

    this.textObj = this.scene.add.text(16, 38, '', {
      fontSize: '16px',
      color: '#E5E7EB',
      wordWrap: { width: width - 32 },
    });

    this.container.add([bg, nameText, this.textObj]);
    this.renderLine();
  }

  private renderLine(): void {
    if (!this.textObj) return;
    this.textObj.setText(this.lines[this.lineIndex] ?? '');
  }

  advance(): void {
    this.lineIndex++;
    if (this.lineIndex >= this.lines.length) {
      this.close();
    } else {
      this.renderLine();
    }
  }

  close(): void {
    this.open = false;
    this.container?.destroy();
    this.container = undefined;
    this.textObj = undefined;
  }
}
