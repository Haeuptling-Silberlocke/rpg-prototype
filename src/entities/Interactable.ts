import Phaser from 'phaser';

/**
 * Mögliche Typen einer Interaktion.
 * Spätere Stufen können hier um 'chest', 'door' etc. erweitert werden.
 */
export type InteractionType = 'herb' | 'treeHole' | 'digSpot';

/**
 * Konfiguration für eine Interaktion.
 * - interactionText: Was passiert, wenn E gedrückt wird
 * - requiredTool: Optional — wenn vorhanden, muss das Tool "im Inventar" sein
 *   (Aktuell wird nur ein Flag geprüft; richtiges Inventar kommt in Stufe 3+)
 */
export interface InteractionConfig {
  type: InteractionType;
  hint: string;                    // z.B. "E = sammeln"
  successText: string;             // z.B. "Du hast Mondkraut gesammelt."
  requiredTool?: string;           // z.B. 'shovel' (für später)
  requiredToolMissingText?: string; // z.B. "Du brauchst eine Schaufel."
  /** Wird nach erfolgreicher Interaktion aufgerufen (z.B. für Debug-Counter) */
  onInteract?: (scene: Phaser.Scene) => void;
}

/**
 * Basisklasse für alle interaktiven Welt-Objekte.
 * - Visueller Platzhalter (Kreis/Polygon)
 * - Proximity-Check via overlap mit Spieler
 * - E-Taste wird zentral in WorldScene behandelt
 *
 * Subklassen setzen `config` und können `onSuccess()` überschreiben.
 */
export abstract class Interactable extends Phaser.Physics.Arcade.Sprite {
  protected config: InteractionConfig;
  protected nearby = false;
  protected consumed = false;
  protected indicator?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: InteractionConfig
  ) {
    super(scene, x, y, texture);
    this.config = config;
  }

  /** Subklassen zeichnen ihre Optik (z.B. Pixel-Kraut) */
  abstract drawAppearance(): void;

  /** Setzt Proximity-Flag. Wird vom Scene-Update-Loop aufgerufen. */
  setNearby(value: boolean): void {
    if (this.consumed || this.nearby === value) return;
    this.nearby = value;
    if (value) {
      this.indicator = this.scene.add.text(this.x, this.y - 24, this.config.hint, {
        fontSize: '11px',
        color: '#FCD34D',
        backgroundColor: '#0a0a14cc',
        padding: { x: 6, y: 3 },
      }).setOrigin(0.5);
      this.scene.tweens.add({
        targets: this.indicator,
        y: this.y - 30,
        duration: 700,
        yoyo: true,
        repeat: -1,
      });
    } else if (this.indicator) {
      this.indicator.destroy();
      this.indicator = undefined;
    }
  }

  isNearby(): boolean {
    return this.nearby;
  }

  isConsumed(): boolean {
    return this.consumed;
  }

  getConfig(): InteractionConfig {
    return this.config;
  }

  /**
   * Führt die Interaktion aus. Gibt true zurück, wenn sie erfolgreich war
   * (z.B. für ein zukünftiges Inventar-Add).
   *
   * Aktuell: nur Textmeldung + bei 'oneShot'-Typen (herb) Verschwinden.
   */
  interact(): { success: boolean; message: string } {
    if (this.consumed) {
      return { success: false, message: 'Nichts mehr zu tun.' };
    }
    // Tool-Check (Platzhalter — wird in Stufe 3 ausgebaut)
    if (this.config.requiredTool) {
      // TODO: echte Tool-Logik mit Inventar
      return {
        success: false,
        message: this.config.requiredToolMissingText ?? 'Dir fehlt das richtige Werkzeug.',
      };
    }

    this.onSuccess();
    this.consumed = true;
    this.config.onInteract?.(this.scene);
    return { success: true, message: this.config.successText };
  }

  /** Subklassen-Override: z.B. Sprite ausblenden, Sound, etc. */
  protected onSuccess(): void {
    // Standard: einfach verstecken + Indicator weg
    this.indicator?.destroy();
    this.indicator = undefined;
    this.setVisible(false);
    this.disableBody(true, true);
  }
}
