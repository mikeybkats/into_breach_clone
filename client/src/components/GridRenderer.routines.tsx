import * as PIXI from "pixi.js";
import { COLORS, SIZES } from "../constants";
import { GameState, Tile } from "../types/game";

// Update gridToScreen to use dynamic tile dimensions
const gridToScreen = (args: {
  x: number;
  y: number;
  z: number;
  tileWidth: number;
  tileHeight: number;
  tileDepth: number;
}) => {
  const { x, y, z, tileWidth, tileHeight, tileDepth } = args;
  return {
    x: ((x - y) * tileWidth) / 2,
    y: ((x + y) * tileHeight) / 2 - z * tileDepth,
  };
};

export const drawIsometricTile = (args: {
  graphics: PIXI.Graphics;
  z: number;
  type: "ground" | "water" | "mountain";
  tileWidth: number;
  tileHeight: number;
  tileDepth: number;
}) => {
  const { graphics, z, type, tileWidth, tileHeight, tileDepth } = args;

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

export const drawGrid = (args: {
  gameState: GameState;
  gridContainer: PIXI.Container;
  tileWidth: number;
  tileHeight: number;
  tileDepth: number;
}) => {
  const { gameState, gridContainer, tileWidth, tileHeight, tileDepth } = args;
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
      drawIsometricTile({
        graphics: tileGraphics,
        z: elevation,
        type: tile.type,
        tileDepth,
        tileHeight,
        tileWidth,
      });

      // position the tile
      const screenPos = gridToScreen({
        x,
        y,
        z: elevation,
        tileWidth,
        tileHeight,
        tileDepth,
      });
      tileContainer.position.set(screenPos.x, screenPos.y);
      tileContainer.addChild(tileGraphics);

      if (tile.unit) {
        const unitGraphics = new PIXI.Graphics();

        // Draw unit as a sphere for 3D effect
        const unitSize = SIZES.TILE_WIDTH / 3;
        unitGraphics.beginFill(COLORS[tile.unit.type]);

        // Main circle
        unitGraphics.drawCircle(0, -unitSize / 2, unitSize);

        // Shadow
        unitGraphics.beginFill(0x000000, 0.2);
        unitGraphics.drawEllipse(0, 0, unitSize * 0.8, unitSize * 0.4);

        // Position unit in center of tile
        unitGraphics.position.set(0, -SIZES.TILE_DEPTH * elevation);

        // Add health text
        const healthText = new PIXI.Text(tile.unit.health.toString(), {
          fontSize: 16,
          fill: 0xffffff,
          align: "center",
        });
        healthText.position.set(
          -healthText.width / 2,
          -SIZES.TILE_DEPTH * elevation - unitSize
        );

        tileContainer.addChild(unitGraphics);
        tileContainer.addChild(healthText);

        // Highlight selected unit
        if (tile.unit.id === gameState.selectedUnitId) {
          const highlight = new PIXI.Graphics();
          highlight.lineStyle(2, COLORS.selected);
          highlight.drawPolygon([
            0,
            -SIZES.TILE_DEPTH * elevation,
            -SIZES.TILE_WIDTH / 2,
            SIZES.TILE_HEIGHT / 2 - SIZES.TILE_DEPTH * elevation,
            0,
            SIZES.TILE_HEIGHT - SIZES.TILE_DEPTH * elevation,
            SIZES.TILE_WIDTH / 2,
            SIZES.TILE_HEIGHT / 2 - SIZES.TILE_DEPTH * elevation,
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
