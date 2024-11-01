import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice";

export const gameStateStore = configureStore({
  reducer: {
    game: gameReducer,
  },
});

export type RootState = ReturnType<typeof gameStateStore.getState>;
export type AppDispatch = typeof gameStateStore.dispatch;
