/**
 * Leaderboard image generation
 */

import {
  createCanvas,
  drawText,
  drawBox,
  roundedRect,
  drawBackground,
  drawOverlay,
  drawContainer,
  drawStatRow,
  drawFooter,
  getImageBuffer,
} from "./canvas.js";
import type { LeaderboardData } from "../types/index.js";

const RANK_COLORS: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

export async function generateLeaderboardImage(
  gameName: string,
  leaderboardData: LeaderboardData
): Promise<Buffer> {
  const width = 900;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  await drawBackground(ctx, width, height);
  drawOverlay(ctx, width, height);

  // Main container
  const padding = 20;
  const containerX = padding;
  const containerY = padding;
  const containerW = width - padding * 2;
  const containerH = height - padding * 2;

  drawContainer(ctx, containerX, containerY, containerW, containerH);

  // Header
  const headerY = containerY + 20;
  drawText(ctx, gameName.toUpperCase(), containerX + 30, headerY + 35, 32, "#55FFFF");
  drawText(ctx, "TOP 10 LEADERBOARD", containerX + 30, headerY + 65, 14, "#AAAAAA");

  // Column headers
  const colHeaderY = headerY + 95;
  drawBox(ctx, containerX + 15, colHeaderY - 5, containerW - 30, 30, "#333333", 0.5);

  const valueLabel = leaderboardData.valueLabel || "WINS";
  drawText(ctx, "#", containerX + 35, colHeaderY + 18, 16, "#FFFFFF");
  drawText(ctx, "PLAYER", containerX + 100, colHeaderY + 18, 16, "#FFFFFF");
  drawText(ctx, valueLabel, containerX + containerW - 120, colHeaderY + 18, 16, "#FFFFFF");

  // Leaderboard entries
  if (!leaderboardData?.entries?.length) {
    drawText(ctx, "No leaderboard data found", containerX + 30, containerY + 250, 24, "#ff6b6b");
    return getImageBuffer(canvas);
  }

  const rowHeight = 48;
  let rowY = colHeaderY + 45;

  for (let i = 0; i < Math.min(leaderboardData.entries.length, 10); i++) {
    const entry = leaderboardData.entries[i];
    const rank = entry.position || i + 1;
    const rankColor = RANK_COLORS[rank] || "#FFFFFF";

    drawStatRow(ctx, containerX + 15, rowY - 5, containerW - 30, rowHeight, "#00FF00");

    drawText(ctx, `#${rank}`, containerX + 35, rowY + 18, 19, rankColor);
    const playerName = (entry.username || "Unknown").substring(0, 22);
    drawText(ctx, playerName, containerX + 100, rowY + 18, 19, "#FFFFFF");
    drawText(ctx, entry.value.toString(), containerX + containerW - 120, rowY + 18, 19, "#55FFFF");

    rowY += rowHeight + 6;
  }

  // Footer
  const footerY = height - padding - 25;
  const totalPlayers = leaderboardData.totalPlayers || 0;
  drawFooter(ctx, containerX, containerW, footerY, `Total Players: ${totalPlayers.toLocaleString()} • Archie`);

  return getImageBuffer(canvas);
}
