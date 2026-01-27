/**
 * Compare players image generation
 */

import {
  createCanvas,
  loadImage,
  drawText,
  drawOverlay,
  drawContainer,
  drawStatRow,
  drawFooter,
  getImageBuffer,
} from "./canvas.js";
import type { PlayerData, StatValue, PlayerStatistics } from "../types/index.js";

function getStat(stats: PlayerStatistics, key: string): StatValue {
  const stat = stats[key];
  if (stat && typeof stat === "object") {
    return {
      value: stat.value || 0,
      percentile: stat.percentile || 0,
      position: stat.position || 0,
      totalPlayers: stat.totalPlayers || 0,
    };
  }
  return { value: 0, percentile: 0, position: 0, totalPlayers: 0 };
}

export async function generateCompareImage(
  player1: string,
  data1: PlayerData,
  skin1: string,
  player2: string,
  data2: PlayerData,
  skin2: string
): Promise<Buffer> {
  const width = 1200;
  const height = 800;
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
  drawText(ctx, "⚔️ PLAYER COMPARISON", containerX + 30, containerY + 40, 28, "#55FFFF");

  // Player positions
  const leftX = containerX + 40;
  const rightX = containerX + containerW / 2 + 20;
  const playerY = containerY + 80;

  // Player 1 skin
  try {
    const s1 = await loadImage(skin1);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(s1, 8, 8, 8, 8, leftX, playerY, 100, 100);
  } catch {
    ctx.fillStyle = "#666666";
    ctx.fillRect(leftX, playerY, 100, 100);
  }

  drawText(ctx, player1.toUpperCase(), leftX, playerY + 120, 18, "#55FFFF");

  // Player 2 skin
  try {
    const s2 = await loadImage(skin2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(s2, 8, 8, 8, 8, rightX, playerY, 100, 100);
  } catch {
    ctx.fillStyle = "#666666";
    ctx.fillRect(rightX, playerY, 100, 100);
  }

  drawText(ctx, player2.toUpperCase(), rightX, playerY + 120, 18, "#55FFFF");

  // Bedwars Comparison
  const stats1 = data1.statistics || {};
  const stats2 = data2.statistics || {};

  const bedwarsModes = ["solo", "duos", "trios", "quads", "4v4"];
  let compY = playerY + 150;
  const rowHeight = 35;

  drawText(ctx, "BEDWARS WINS", containerX + 30, compY - 15, 14, "#FF5555");

  for (const mode of bedwarsModes) {
    const key = `wins:bw_mini_${mode}:casual:lifetime`;
    const key4v4 = `wins:bw_special_4v4:casual:lifetime`;
    const actualKey = mode === "4v4" ? key4v4 : key;

    const w1 = getStat(stats1, actualKey).value;
    const w2 = getStat(stats2, actualKey).value;
    const winner = w1 > w2 ? "🔥" : w2 > w1 ? "⭐" : "🤝";

    drawStatRow(ctx, containerX + 30, compY - 10, containerW - 60, rowHeight, "#FF5555");

    drawText(ctx, mode.toUpperCase(), containerX + 45, compY + 10, 13, "#FFFFFF");
    drawText(ctx, `${w1}`, leftX + 50, compY + 10, 14, "#55FFFF");
    drawText(ctx, "vs", containerX + containerW / 2 - 15, compY + 10, 13, "#AAAAAA");
    drawText(ctx, `${w2}`, rightX + 50, compY + 10, 14, "#FFAA55");
    drawText(ctx, winner, containerX + containerW - 70, compY + 10, 16, "#FFFF55");

    compY += rowHeight + 4;
  }

  // Footer
  const footerY = height - padding - 25;
  drawFooter(ctx, containerX, containerW, footerY);

  return getImageBuffer(canvas);
}
