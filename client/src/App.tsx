import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

const App: React.FC = () => {
  const pixiContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pixiContainer.current) {
      const app = new PIXI.Application({
        width: 800,
        height: 600,
        backgroundColor: 0x1099bb,
      });
      pixiContainer.current.appendChild(app.view as HTMLCanvasElement);
      // Add your PIXI.js game logic here
      return () => {
        app.destroy(true, true);
      };
    }
  }, []);

  return (
    <div>
      <div ref={pixiContainer} />
      <div>
        <h1>Hello from React & Bun & Pixi.js!</h1>
      </div>
    </div>
  );
};

export default App;
