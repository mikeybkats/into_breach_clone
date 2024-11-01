import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { RootState } from "../state/store";
import { useSelector } from "react-redux";
import styles from "./gameRenderer.module.css";
import { drawGrid } from "./GridRenderer.routines";

// Calculate tile dimensions based on container size and grid
const calculateTileDimensions = (
  containerWidth: number,
  containerHeight: number,
  gridSize: number
) => {
  // Calculate the maximum possible tile width that would fit the container
  // We divide by 1.5 to account for the isometric view overlap
  const maxTileWidth = containerWidth / gridSize / 1.5;
  const maxTileHeight = containerHeight / gridSize / 1.5;

  // Calculate corresponding height (isometric tiles are typically 2:1 ratio)
  const tileWidth = Math.min(64, maxTileWidth); // Cap at 64px
  const tileHeight = Math.min(32, maxTileHeight);
  const tileDepth = tileWidth / 4;

  return { tileWidth, tileHeight, tileDepth };
};

const GameRenderer: React.FC = () => {
  // Add refs for tile dimensions
  const tileDimensionsRef = useRef({
    tileWidth: 64,
    tileHeight: 32,
    tileDepth: 16,
  });
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const pixiAppRef = useRef<PIXI.Application | null>(null);
  const gameState = useSelector((state: RootState) => state.game);

  // render the grid
  const renderGrid = (app: PIXI.Application) => {
    app.stage.removeChildren();
    const gridContainer = new PIXI.Container(); // create container for grid
    app.stage.addChild(gridContainer);

    const { tileWidth, tileHeight, tileDepth } = tileDimensionsRef.current;

    drawGrid({
      gameState,
      gridContainer,
      tileWidth,
      tileHeight,
      tileDepth,
    });
  };

  // initialize pixi app
  useEffect(() => {
    if (!gameContainerRef.current) return;

    const containerWidth = gameContainerRef.current.clientWidth;
    const containerHeight = gameContainerRef.current.clientHeight;
    const gridSize = gameState.grid.length;

    // Set initial tile dimensions
    tileDimensionsRef.current = calculateTileDimensions(
      containerWidth,
      containerHeight,
      gridSize
    );

    // Create PIXI application
    const app = new PIXI.Application({
      width: containerWidth,
      height: containerHeight,
      backgroundColor: 0x87ceeb,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });

    // center the container
    app.stage.position.set(
      containerWidth / 2,
      tileDimensionsRef.current.tileHeight * 2
    );

    // Add canvas to our container
    gameContainerRef.current.appendChild(app.view as HTMLCanvasElement);
    pixiAppRef.current = app;

    renderGrid(app);

    // Add resize listener
    // window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      // window.removeEventListener("resize", handleResize);

      app.destroy(true);
      if (gameContainerRef.current) {
        gameContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  // gameState changes
  useEffect(() => {
    const app = pixiAppRef.current;
    if (!app) return;
    renderGrid(app);
  }, [gameState]);

  return <div ref={gameContainerRef} className={styles.gameContainer}></div>;
};

export { GameRenderer };
