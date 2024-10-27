import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GameState {
  level: number;
}

const initialState: GameState = {
  level: 1,
};

export const gameSlice = createSlice({
  name: "pVc",
  initialState,
  reducers: {
    setLevel: (state, action: PayloadAction<number>) => {
      state.level = action.payload;
    },
  },
});

export const { setLevel } = gameSlice.actions;
export default gameSlice.reducer;
