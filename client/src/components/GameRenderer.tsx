import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { RootState } from "../state/store";
import { shallowEqual, useSelector } from "react-redux";
import styles from "./gameRenderer.module.css";
import { drawGrid } from "./GridRenderer.routines";

// Calculate tile dimensions based on container size and grid
const calculateTileDimensions = (containerWidth: number, gridSize: number) => {
  // Calculate the maximum possible tile width that would fit the container
  const maxTileWidth = containerWidth / (gridSize * 2) / 1.5;
  const maxTileHeight = maxTileWidth / 2;

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
  const gameState = useSelector((state: RootState) => state.game, shallowEqual);

  const handleResize = () => {
    renderApp();
  };

  // render the grid
  const renderGrid = (app: PIXI.Application) => {
    app.stage.removeChildren();
    const gridContainer = new PIXI.Container(); // create container for grid

    gridContainer.pivot.set(gridContainer.width / 2, gridContainer.height / 2);
    // Position the container at the center of the screen
    gridContainer.position.set(app.screen.width / 2, app.screen.height / 2);

    app.stage.addChild(gridContainer);

    const { tileWidth, tileHeight, tileDepth } = tileDimensionsRef.current;

    drawGrid({
      gameState,
      gridContainer,
      tileWidth,
      tileHeight,
      tileDepth,
    });

    gridContainer.scale.set(1.5, 1.5);

    const gridContainerLocation = [
      { name: "gridContainer.x", value: gridContainer.x },
      { name: "gridContainer.y", value: gridContainer.y },
      { name: "gridContainer.width", value: gridContainer.width },
      { name: "gridContainer.height", value: gridContainer.height },
    ];

    gridContainerLocation.forEach((location, index) => {
      printText(`${location.name}: ${location.value}`, index + 5, 0, app);
    });
  };

  const cleanupApp = (app: PIXI.Application) => {
    window.removeEventListener("resize", handleResize);

    app?.destroy(true);
    if (gameContainerRef.current) {
      gameContainerRef.current.innerHTML = "";
    }
  };

  const printText = (
    text: string,
    row: number,
    column: number,
    app: PIXI.Application
  ) => {
    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 24,
      fill: ["#e21b88ff "], // Text color
    });

    const pText = new PIXI.Text(text, style);

    pText.x = column * tileDimensionsRef.current.tileWidth;
    pText.y = row * tileDimensionsRef.current.tileWidth;

    app.stage.addChild(pText);
  };

  const initializeApp = () => {
    if (!gameContainerRef.current) return;

    const containerWidth = gameContainerRef.current.clientWidth;
    const containerHeight = gameContainerRef.current.clientHeight;
    const gridSize = gameState.grid.length; // number of rows is zero at start

    // Set initial tile dimensions
    tileDimensionsRef.current = calculateTileDimensions(
      containerWidth,
      gridSize
    );

    // Create PIXI application
    const app = new PIXI.Application({
      width: containerWidth,
      height: containerHeight,
      backgroundColor: 0x87ceeb,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // center the container
    // app.stage.position.set(containerWidth / 4, containerHeight / 4);

    // Add canvas to our container
    gameContainerRef.current.appendChild(app.view as HTMLCanvasElement);
    pixiAppRef.current = app;

    renderGrid(app);

    const sizes = [
      { name: "gameContainerRef.clientWidth", value: containerWidth },
      { name: "gameContainerRef.clientHeight", value: containerHeight },
      { name: "gridSize", value: gridSize },
      { name: "app.view.width", value: app.view.width },
      { name: "app.view.height", value: app.view.height },
    ];
    sizes.forEach((size, index) => {
      printText(`${size.name}: ${size.value}`, index, 0, app);
    });

    // Add resize listener
    window.addEventListener("resize", handleResize);

    return app;
  };

  const renderApp = () => {
    const app = pixiAppRef.current;
    if (!app) return;
    const containerWidth = gameContainerRef?.current?.clientWidth;
    const gridSize = gameState.grid.length;

    // Set initial tile dimensions
    tileDimensionsRef.current = calculateTileDimensions(
      containerWidth ?? 0,
      gridSize
    );

    // renderGrid(app);
  };

  // initialize pixi app
  useEffect(() => {
    const app = initializeApp();

    // Cleanup on unmount
    return () => {
      if (app) {
        cleanupApp(app);
      }
    };
  }, []);

  // gameState changes
  useEffect(() => {
    renderApp();
  }, [gameState]);

  return <div ref={gameContainerRef} className={styles.gameContainer}></div>;
};

export { GameRenderer };
