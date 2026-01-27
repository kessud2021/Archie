/**
 * Misc stats image generation
 */

import {
  createCanvas,
  drawText,
  drawOverlay,
  drawContainer,
  drawStatRow,
  drawFooter,
  getImageBuffer,
} from "./canvas.js";
import type { MiscStat } from "../types/index.js";

export async function generateMiscImage(
  username: string,
  miscStats: MiscStat[],
  page: number = 1
): Promise<Buffer> {
  const pageSize = 10;
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageStats = miscStats.slice(startIdx, endIdx);
  const totalPages = Math.ceil(miscStats.length / pageSize);

  const width = 1000;
  const height = 450 + pageStats.length * 40;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background (no image, just solid color)
  ctx.fillStyle = "#0a0e27";
  ctx.fillRect(0, 0, width, height);
  drawOverlay(ctx, width, height);

  // Main container
  const padding = 20;
  const containerX = padding;
  const containerY = padding;
  const containerW = width - padding * 2;
  const containerH = height - padding * 2;

  drawContainer(ctx, containerX, containerY, containerW, containerH);

  // Header
  drawText(ctx, username.toUpperCase(), containerX + 30, containerY + 50, 36, "#9B59B6");
  drawText(ctx, `🎮 MISCELLANEOUS STATS (Page ${page}/${totalPages})`, containerX + 30, containerY + 80, 16, "#AAAAAA");

  let y = containerY + 120;
  const rowHeight = 40;

  for (const stat of pageStats) {
    drawStatRow(ctx, containerX + 20, y - 5, containerW - 40, rowHeight, "#9B59B6");

    drawText(ctx, stat.label.substring(0, 30), containerX + 35, y + 15, 18, "#FFFFFF");
    drawText(ctx, stat.value.toString(), containerX + 700, y + 15, 20, "#9B59B6");

    y += rowHeight + 6;
  }

  // Footer
  const footerY = height - padding - 25;
  drawFooter(ctx, containerX, containerW, footerY);

  return getImageBuffer(canvas);
}
