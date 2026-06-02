import { World } from './WorldGenerator';

/**
 * Vorbereitung für Stufe 2: gibt eine Liste aller blockierten Tiles zurück.
 * Aktuell wird das in der Scene direkt genutzt — diese Helper-Funktion
 * existiert für das Interaktionssystem der nächsten Stufe.
 */
export function buildCollisionMap(world: World): Array<{ x: number; y: number; blocked: boolean }> {
  const result: Array<{ x: number; y: number; blocked: boolean }> = [];
  for (let y = 0; y < world.height; y++) {
    for (let x = 0; x < world.width; x++) {
      const tile = world.tiles[y][x];
      result.push({
        x,
        y,
        blocked: tile === 'water' || tile === 'tree' || tile === 'rock',
      });
    }
  }
  return result;
}
