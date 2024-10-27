import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const root = createRoot(document.getElementById("root") as HTMLElement);

  console.log("Rendering App");
  root?.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
} else {
  console.error("Window or document is undefined");
}
