/**
 * GameState - einfacher Singleton für Sammel-Werte.
 *
 * Noch KEIN Inventar, KEIN Speichern, nur In-Memory-Zähler.
 * Wird in WorldScene initialisiert und von Interactables aufgerufen.
 */
export type GameEvent = 'gold-changed' | 'herbs-changed' | 'coins-changed';

export class GameState {
  private static _instance: GameState | null = null;

  public gold: number = 0;
  public herbs: number = 0;
  public oldCoins: number = 0;

  private listeners: Map<GameEvent, Set<() => void>> = new Map();

  public static get instance(): GameState {
    if (!GameState._instance) {
      GameState._instance = new GameState();
    }
    return GameState._instance;
  }

  public addGold(amount: number): void {
    this.gold += amount;
    this.emit('gold-changed');
  }

  public addHerbs(amount: number): void {
    this.herbs += amount;
    this.emit('herbs-changed');
  }

  public addOldCoins(amount: number): void {
    this.oldCoins += amount;
    this.emit('coins-changed');
  }

  public on(event: GameEvent, callback: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  private emit(event: GameEvent): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => cb());
    }
  }
}
