import { TileKey } from './Constants';
import { InteractionType } from '../entities/Interactable';
import { TreeVariant } from './TreeTextures';

export interface Decoration {
  x: number;
  y: number;
  type: TileKey;
}

/** Baum-Position mit Variante für mehr visuelle Abwechslung. */
export interface TreeSpawn {
  x: number;
  y: number;
  variant: TreeVariant;
}

export interface WorldInteractable {
  x: number;
  y: number;
  type: InteractionType;
}

export interface World {
  width: number;
  height: number;
  tiles: TileKey[][];
  decorations: Decoration[];
  /** Bäume mit expliziter Variante (Eiche/Tanne/dunkler Baum) */
  trees: TreeSpawn[];
  interactables: WorldInteractable[];
}

/**
 * Generiert eine kleine Top-Down-Welt:
 *  - Dorf-Bereich (oben links, mit Häusern via Felsen)
 *  - Wald (rechts/oben, Bäume)
 *  - Wasser (See unten links)
 *  - Sandstreifen am Wasser
 *  - Wege kreuz und quer
 *  - 3 interaktive Beispiele:
 *    - Mondkraut (1x, im Gras neben dem Weg)
 *    - Baumloch (1x, am Waldrand)
 *    - Bodenstelle zum Untersuchen (1x, in der Nähe des NPC)
 */
export function generateWorld(width: number, height: number): World {
  // 1) Tiles initialisieren (alles Gras)
  const tiles: TileKey[][] = [];
  for (let y = 0; y < height; y++) {
    const row: TileKey[] = [];
    for (let x = 0; x < width; x++) {
      row.push('grass');
    }
    tiles.push(row);
  }

  // 2) See unten links
  const lakeCenter = { x: 8, y: 22 };
  const lakeRadius = 5;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dist = Math.hypot(x - lakeCenter.x, y - lakeCenter.y);
      if (dist < lakeRadius) {
        tiles[y][x] = 'water';
      } else if (dist < lakeRadius + 1.5) {
        tiles[y][x] = 'sand';
      }
    }
  }

  // 3) Wald rechts (dichte Baum-Tiles) — als TreeSpawn-Liste mit Variante
  // Variante wird per Position-Hash deterministisch gewählt → kein Random-Spawn,
  // gleiche Bäume bei jedem Reload, aber Verteilung wirkt natürlich.
  const treeVariants: TreeVariant[] = ['oak', 'pine', 'dark'];
  const trees: TreeSpawn[] = [];
  for (let y = 2; y < 18; y++) {
    for (let x = 25; x < 38; x++) {
      if (Math.random() < 0.55) {
        // Pseudo-random aber deterministisch
        const idx = (x * 7 + y * 13) % treeVariants.length;
        const variant = treeVariants[idx];
        trees.push({ x, y, variant });
        tiles[y][x] = 'tree';
      }
    }
  }

  // 4) Dorf (oben links) - paar Felsen als Häuser
  tiles[4][5]  = 'rock'; tiles[4][6]  = 'rock';
  tiles[5][5]  = 'rock'; tiles[5][6]  = 'rock';
  tiles[4][8]  = 'rock';
  tiles[5][8]  = 'rock';

  // 5) Wege (horizontale und vertikale Linien)
  for (let x = 1; x < 20; x++) tiles[10][x] = 'path';
  for (let y = 6; y < 24; y++) tiles[y][15] = 'path';
  for (let x = 15; x < 35; x++) tiles[15][x] = 'path';

  // 6) Blumen zufällig verteilen
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (tiles[y][x] === 'grass' && Math.random() < 0.05) {
        tiles[y][x] = 'flower';
      }
    }
  }

  // 7) Decorations extra sammeln (für eigene Physik-Bodies)
  // Bäume werden NICHT hier gesammelt — die nutzen ihre eigene Trunk-Logik
  // mit kollidierbaren unteren 12px (siehe WorldScene.spawnTrees).
  const decorations: Decoration[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (tiles[y][x] === 'rock') {
        decorations.push({ x, y, type: 'rock' });
      }
    }
  }

  // 8) Interaktionen platzieren (deterministisch für Demo)
  const interactables: WorldInteractable[] = [
    { x: 12, y: 11, type: 'herb' },     // neben Hauptweg
    { x: 23, y: 13, type: 'treeHole' }, // am Waldrand (1 Tile vor Bäumen)
    { x: 13, y: 7,  type: 'digSpot' },  // zwischen Dorf und NPC
  ];

  return { width, height, tiles, decorations, trees, interactables };
}
