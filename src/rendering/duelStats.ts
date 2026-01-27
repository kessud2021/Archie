/**
 * Duel stats image generation
 */

import {
  createCanvas,
  drawText,
  drawBackground,
  drawOverlay,
  drawContainer,
  drawStatRow,
  drawFooter,
  getImageBuffer,
} from "./canvas.js";
import { DUEL_MODES } from "../config/constants.js";
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

export async function generateDuelStatsImage(
  username: string,
  playerData: PlayerData
): Promise<Buffer> {
  const width = 1000;
  const height = 1200;
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
  const headerY = containerY + 15;
  drawText(ctx, username.toUpperCase(), containerX + 30, headerY + 50, 36, "#55FFFF");
  drawText(ctx, "🥊 DUEL STATS", containerX + 30, headerY + 80, 16, "#AAAAAA");

  const stats = playerData.statistics || {};
  let duelY = headerY + 120;
  const rowHeight = 45;

  for (const mode of DUEL_MODES) {
    const eloKey = `elo:${mode.key}:ranked:lifetime`;
    const winsKey = `wins:${mode.key}:ranked:lifetime`;
    const eloStat = getStat(stats, eloKey);
    const winsStat = getStat(stats, winsKey);

    drawStatRow(ctx, containerX + 20, duelY - 5, containerW - 40, rowHeight, mode.color);

    drawText(ctx, mode.name, containerX + 35, duelY + 15, 19, "#FFFFFF");
    drawText(ctx, `ELO: ${eloStat.value}`, containerX + 250, duelY + 15, 18, mode.color);
    drawText(ctx, `Wins: ${winsStat.value}`, containerX + 500, duelY + 15, 18, mode.color);

    if (eloStat.position) {
      drawText(ctx, `#${eloStat.position}`, containerX + 750, duelY + 15, 16, "#AAFFAA");
    }

    duelY += rowHeight + 6;
  }

  // Footer
  const footerY = height - padding - 25;
  drawFooter(ctx, containerX, containerW, footerY);

  return getImageBuffer(canvas);
}
