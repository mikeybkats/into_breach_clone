import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { gameStateStore } from "./state/store";
import App from "./App";

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const root = createRoot(document.getElementById("root") as HTMLElement);

  root?.render(
    <React.StrictMode>
      <Provider store={gameStateStore}>
        <App />
      </Provider>
    </React.StrictMode>
  );
} else {
  console.error("Window or document is undefined");
}
