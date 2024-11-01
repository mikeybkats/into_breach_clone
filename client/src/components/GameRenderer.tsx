import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { RootState } from "../state/store";
import { useSelector } from "react-redux";

// Constants for rendering
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const TILE_DEPTH = 16;

const COLORS = {
  ground: 0x7ea656, // Green for ground
  groundSide: 0x5c7d43, // Darker green for side of ground
  water: 0x4a90e2, // Blue for water
  waterSide: 0x3568b2, // Darker blue for side of water
  mountain: 0x8b4513, // Brown for mountains
  mountainSide: 0x653300, // Darker brown for side of mountains
  mech: 0xffd700, // Gold for mechs
  friend: 0x00ff00, // Green for friends
  enemy: 0xff0000, // Red for enemies
  selected: 0xffff00, // Yellow highlight for selected unit
};

// Calculate tile dimensions based on container size and grid
const calculateTileDimensions = (containerWidth: number, gridSize: number) => {
  // Calculate the maximum possible tile width that would fit the container
  // We divide by 1.5 to account for the isometric view overlap
  const maxTileWidth = containerWidth / gridSize / 1.5;

  // Calculate corresponding height (isometric tiles are typically 2:1 ratio)
  const tileWidth = Math.min(64, maxTileWidth); // Cap at 64px
  const tileHeight = tileWidth / 2;
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

  // Update gridToScreen to use dynamic tile dimensions
  const gridToScreen = (x: number, y: number, z: number) => {
    const { tileWidth, tileHeight, tileDepth } = tileDimensionsRef.current;
    return {
      x: ((x - y) * tileWidth) / 2,
      y: ((x + y) * tileHeight) / 2 - z * tileDepth,
    };
  };

  // Update resize handler
  const handleResize = () => {
    const app = pixiAppRef.current;
    if (!app || !gameContainerRef.current) return;

    const containerWidth = gameContainerRef.current.clientWidth;
    const containerHeight = gameContainerRef.current.clientHeight;
    const gridSize = gameState.grid.length;

    // Update tile dimensions
    tileDimensionsRef.current = calculateTileDimensions(
      containerWidth,
      gridSize
    );

    // Resize renderer
    app.renderer.resize(containerWidth, containerHeight);

    // Recenter the stage
    app.stage.position.set(
      containerWidth / 2,
      tileDimensionsRef.current.tileHeight * 2
    );

    // Trigger a re-render of the grid
    renderGrid(app);
  };

  // render the grid
  const renderGrid = (app: PIXI.Application) => {
    app.stage.removeChildren();
    const gridContainer = new PIXI.Container(); // create container for grid
    app.stage.addChild(gridContainer);

    const { tileWidth, tileHeight, tileDepth } = tileDimensionsRef.current;

    const drawIsometricTile = (
      graphics: PIXI.Graphics,
      z: number,
      type: "ground" | "water" | "mountain"
    ) => {
      // draw left side for depth
      graphics.beginFill(COLORS[`${type}Side`]);
      graphics.drawPolygon([
        0,
        0, // Top point
        -tileWidth / 2,
        tileHeight / 2, // Left point
        -tileWidth / 2,
        tileHeight / 2 + z * tileDepth, // Bottom left
        0,
        tileHeight + z * tileDepth, // Bottom middle
      ]);
      graphics.endFill();

      // Draw right side (for depth)
      graphics.beginFill(COLORS[`${type}Side`]);
      graphics.drawPolygon([
        0,
        0, // Top point
        tileWidth / 2,
        tileHeight / 2, // Right point
        tileWidth / 2,
        tileHeight / 2 + z * tileDepth, // Bottom right
        0,
        tileHeight + z * tileDepth, // Bottom middle
      ]);
      graphics.endFill();

      // Draw top face
      graphics.beginFill(COLORS[type]);
      graphics.drawPolygon([
        0,
        0, // Top point
        -tileWidth / 2,
        tileHeight / 2, // Left point
        0,
        tileHeight, // Bottom point
        tileWidth / 2,
        tileHeight / 2, // Right point
      ]);
      graphics.endFill();

      // Add subtle border
      graphics.lineStyle(1, 0x000000, 0.2);
      graphics.drawPolygon([
        0,
        0,
        -tileWidth / 2,
        tileHeight / 2,
        0,
        tileHeight,
        tileWidth / 2,
        tileHeight / 2,
      ]);
    };

    // render grid in isometric view
    // render back to front to handle overlapping tiles
    for (let y = gameState.grid.length - 1; y >= 0; y--) {
      for (let x = 0; x < gameState.grid[y].length; x++) {
        const tile = gameState.grid[y][x];
        const tileContainer = new PIXI.Container();
        const tileGraphics = new PIXI.Graphics();

        // calculate the elevation based on the tile type
        const elevation = tile.type === "mountain" ? 1 : 0;

        // draw the tile
        drawIsometricTile(tileGraphics, elevation, tile.type);

        // position the tile
        const screenPos = gridToScreen(x, y, elevation);
        console.log("screenPos", screenPos);
        tileContainer.position.set(screenPos.x, screenPos.y);
        tileContainer.addChild(tileGraphics);

        if (tile.unit) {
          const unitGraphics = new PIXI.Graphics();

          // Draw unit as a sphere for 3D effect
          const unitSize = TILE_WIDTH / 3;
          unitGraphics.beginFill(COLORS[tile.unit.type]);

          // Main circle
          unitGraphics.drawCircle(0, -unitSize / 2, unitSize);

          // Shadow
          unitGraphics.beginFill(0x000000, 0.2);
          unitGraphics.drawEllipse(0, 0, unitSize * 0.8, unitSize * 0.4);

          // Position unit in center of tile
          unitGraphics.position.set(0, -TILE_DEPTH * elevation);

          // Add health text
          const healthText = new PIXI.Text(tile.unit.health.toString(), {
            fontSize: 16,
            fill: 0xffffff,
            align: "center",
          });
          healthText.position.set(
            -healthText.width / 2,
            -TILE_DEPTH * elevation - unitSize
          );

          tileContainer.addChild(unitGraphics);
          tileContainer.addChild(healthText);

          // Highlight selected unit
          if (tile.unit.id === gameState.selectedUnitId) {
            const highlight = new PIXI.Graphics();
            highlight.lineStyle(2, COLORS.selected);
            highlight.drawPolygon([
              0,
              -TILE_DEPTH * elevation,
              -TILE_WIDTH / 2,
              TILE_HEIGHT / 2 - TILE_DEPTH * elevation,
              0,
              TILE_HEIGHT - TILE_DEPTH * elevation,
              TILE_WIDTH / 2,
              TILE_HEIGHT / 2 - TILE_DEPTH * elevation,
            ]);
            tileContainer.addChild(highlight);
          }

          // Make tile interactive
          tileContainer.eventMode = "static";
          tileContainer.cursor = "pointer";
        }

        gridContainer.addChild(tileContainer);
      }
    }
  };

  // initialize pixi app
  useEffect(() => {
    if (!gameContainerRef.current) return;

    const containerWidth = gameContainerRef.current.clientWidth;
    const containerHeight = gameContainerRef.current.clientHeight;
    const gridSize = gameState.grid.length;

    console.log("container", containerWidth, containerHeight, gridSize);

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
      resolution: window.devicePixelRatio || 1,
    });

    console.log("PIXI app created", app); // Debug log

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
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);

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

  return <div ref={gameContainerRef} className="gameContainer"></div>;
};

export { GameRenderer };
