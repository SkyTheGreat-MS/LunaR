/**
 * Isometric Projection Math and Utilities
 */

import { GridPosition } from '../../game/types';

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

/**
 * Projects grid (X, Y) into 2D isometric screen space
 */
export function gridToScreen(
  gridX: number,
  gridY: number,
  tileWidth = TILE_WIDTH,
  tileHeight = TILE_HEIGHT
): { x: number; y: number } {
  return {
    x: ((gridX - gridY) * tileWidth) / 2,
    y: ((gridX + gridY) * tileHeight) / 2,
  };
}

/**
 * Inverts screen coordinates back into grid coordinates
 */
export function screenToGrid(
  screenX: number,
  screenY: number,
  originX: number,
  originY: number,
  zoom = 1,
  tileWidth = TILE_WIDTH,
  tileHeight = TILE_HEIGHT
): GridPosition {
  const relX = (screenX - originX) / zoom;
  const relY = (screenY - originY) / zoom;

  const halfW = tileWidth / 2;
  const halfH = tileHeight / 2;

  const gridX = Math.floor((relX / halfW + relY / halfH) / 2);
  const gridY = Math.floor((relY / halfH - relX / halfW) / 2);

  return { x: gridX, y: gridY };
}
