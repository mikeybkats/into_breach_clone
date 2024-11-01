export interface Position {
  x: number;
  y: number;
}

export type TileType = "water" | "ground" | "mountain";

export interface Tile {
  position: Position;
  type: TileType;
  unit?: Unit; // Optional unit on the tile
}

export type UnitType = "enemy" | "friend";

export interface Unit {
  id: string;
  position: Position;
  health: number;
  type: UnitType;
  hasMoved: boolean;
  hasAttacked: boolean;
}

export type GamePhase = "planning" | "combat" | "action" | "end";
export type Turn = "player" | "enemy";

export interface GameState {
  grid: Tile[][];
  currentTurn: Turn;
  turnNumber: number;
  selectedUnitId: string | null;
  units: Unit[];
  gamePhase: GamePhase;
}
