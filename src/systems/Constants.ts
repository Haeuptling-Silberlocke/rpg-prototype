// ===== TILE KONSTANTEN =====

export const TILE_SIZE = 32;

export type TileKey = 'grass' | 'path' | 'water' | 'tree' | 'rock' | 'sand' | 'flower';

export interface TileConfig {
  color: number;
  borderColor: number;
  blocked: boolean;
}

export const TILE_KEYS: Record<TileKey, TileConfig> = {
  grass:  { color: 0x2d5a2d, borderColor: 0x1a3a1a, blocked: false },
  path:   { color: 0x8b7355, borderColor: 0x6b5335, blocked: false },
  water:  { color: 0x1e4d8b, borderColor: 0x0e2d5b, blocked: true  },
  tree:   { color: 0x1a3a1a, borderColor: 0x0a1a0a, blocked: true  },
  rock:   { color: 0x6b6b6b, borderColor: 0x3a3a3a, blocked: true  },
  sand:   { color: 0xd4b896, borderColor: 0xa49070, blocked: false },
  flower: { color: 0x3a6a3a, borderColor: 0x1a3a1a, blocked: false },
};

export const PLAYER_SPEED = 150;
export const INTERACT_DISTANCE = 48; // Pixel
