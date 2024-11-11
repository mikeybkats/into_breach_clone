import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameState } from "../types/game";

const initialState: GameState = {
  grid: [],
  currentTurn: "player",
  turnNumber: 1,
  selectedUnitId: null,
  units: [],
  gamePhase: "planning",
};

export const gameSlice = createSlice({
  name: "pVc",
  initialState,
  reducers: {
    initializeGame: (
      state: GameState,
      action: PayloadAction<{ gridSize: number }>
    ) => {
      // create an 8x8 grid of tiles
      state.grid = Array.from({ length: action.payload.gridSize }, () =>
        Array.from({ length: action.payload.gridSize }, () => ({
          position: { x: 0, y: 0 },
          type: "ground",
        }))
      );

      // Initialize with some basic units
      state.units = [];

      // Place units on the grid
      state.units.forEach((unit) => {
        const { x, y } = unit.position;
        state.grid[y][x].unit = unit;
      });
    },
    selectUnit: (state, action: PayloadAction<string>) => {
      state.selectedUnitId = action.payload;
    },
    endTurn: (state) => {
      // Reset unit actions
      state.units.forEach((unit) => {
        unit.hasMoved = false;
        unit.hasAttacked = false;
      });

      state.selectedUnitId = null;
      state.gamePhase = "planning";
    },
  },
});

export const { initializeGame, selectUnit, endTurn } = gameSlice.actions;
export default gameSlice.reducer;
