/**
 * Canvas rendering utilities
 * Low-level drawing functions for images
 */

import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D, Image } from "canvas";
import path from "path";
import fs from "fs";

/**
 * Create a new canvas with background color
 */
export function createImage(width: number, height: number, bgColor: string): Canvas {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  return canvas;
}

/**
 * Draw text with shadow on canvas
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string = "#ffffff",
  font: string = "Minecraftia"
): void {
  ctx.font = `${fontSize}px ${font}`;
  ctx.fillStyle = "#000000";
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

/**
 * Draw a box with optional alpha
 */
export function drawBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string = "#1a1a1a",
  alpha: number = 0.7
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
}

/**
 * Draw a rounded rectangle
 */
export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw a progress bar
 */
export function drawBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  percentage: number,
  bgColor: string,
  barColor: string
): void {
  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, width, height);

  // Bar
  ctx.fillStyle = barColor;
  ctx.fillRect(x, y, (width * percentage) / 100, height);
}

/**
 * Get PNG buffer from canvas
 */
export function getImageBuffer(canvas: Canvas): Buffer {
  return canvas.toBuffer("image/png");
}

/**
 * Load background image and draw it scaled to fit canvas
 */
export async function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgPath: string = "./background.png"
): Promise<void> {
  const resolvedPath = path.resolve(bgPath);
  if (fs.existsSync(resolvedPath)) {
    try {
      const bg = await loadImage(resolvedPath);
      const scale = Math.max(width / bg.width, height / bg.height);
      const sw = width / scale;
      const sh = height / scale;
      const sx = (bg.width - sw) / 2;
      const sy = (bg.height - sh) / 2;
      ctx.drawImage(bg, sx, sy, sw, sh, 0, 0, width, height);
    } catch {
      ctx.fillStyle = "#0a0e27";
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    ctx.fillStyle = "#0a0e27";
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Draw a dark overlay on the canvas
 */
export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  alpha: number = 0.7
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;
}

/**
 * Draw a rounded container with border
 */
export function drawContainer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number = 15,
  fillColor: string = "#1E1E1E",
  strokeColor: string = "#4A4A4A",
  fillAlpha: number = 0.9
): void {
  ctx.fillStyle = fillColor;
  ctx.globalAlpha = fillAlpha;
  roundedRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  roundedRect(ctx, x, y, w, h, radius);
  ctx.stroke();
}

/**
 * Draw a row with rounded rectangle background and border
 */
export function drawStatRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  radius: number = 8
): void {
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = color;
  roundedRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  roundedRect(ctx, x, y, w, h, radius);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * Draw footer with attribution
 */
export function drawFooter(
  ctx: CanvasRenderingContext2D,
  containerX: number,
  containerW: number,
  footerY: number,
  text: string = "Archie"
): void {
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = "#333333";
  ctx.fillRect(containerX + 15, footerY, containerW - 30, 22);
  ctx.globalAlpha = 1;
  drawText(ctx, text, containerX + 30, footerY + 17, 13, "#888888");
}

export { loadImage, createCanvas, Canvas, CanvasRenderingContext2D };
