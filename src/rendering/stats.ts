/**
 * Player stats image generation
 */

import {
  createCanvas,
  loadImage,
  drawText,
  roundedRect,
  drawBackground,
  drawOverlay,
  drawContainer,
  drawStatRow,
  drawFooter,
  getImageBuffer,
} from "./canvas.js";
import { STAT_DISPLAYS } from "../config/constants.js";
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

export async function generateStatsImage(
  username: string,
  playerData: PlayerData,
  skinURL: string
): Promise<Buffer> {
  const width = 1000;
  const height = 750;
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

  // Player head
  try {
    const skin = await loadImage(skinURL);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(skin, 8, 8, 8, 8, containerX + 15, headerY + 5, 70, 70);
  } catch {
    ctx.fillStyle = "#666666";
    ctx.fillRect(containerX + 15, headerY + 5, 70, 70);
  }

  drawText(ctx, username, containerX + 100, headerY + 50, 36, "#55FFFF");

  const stats = playerData.statistics || {};

  // Bedwars section
  const bedwarsY = headerY + 100;
  drawText(ctx, "BEDWARS", containerX + 30, bedwarsY + 22, 22, "#FF5555");

  const bedwarsStats = {
    soloWins: getStat(stats, "wins:bw_mini_solo:casual:lifetime"),
    duosWins: getStat(stats, "wins:bw_mini_duos:casual:lifetime"),
    triosWins: getStat(stats, "wins:bw_mega_trios:casual:lifetime"),
    quadsWins: getStat(stats, "wins:bw_mega_quads:casual:lifetime"),
    fv4Wins: getStat(stats, "wins:bw_special_4v4:casual:lifetime"),
    kills: getStat(stats, "kills:bedwars:global:lifetime"),
    deaths: getStat(stats, "deaths:bedwars:global:lifetime"),
    finalKills: getStat(stats, "final_kills:bedwars:global:lifetime"),
  };

  const totalWins =
    bedwarsStats.soloWins.value +
    bedwarsStats.duosWins.value +
    bedwarsStats.triosWins.value +
    bedwarsStats.quadsWins.value +
    bedwarsStats.fv4Wins.value;

  let bwy = bedwarsY + 45;
  const rowHeight = 40;
  const halfWidth = (containerW - 40) / 2 - 5;

  const drawBedwarsRow = (label: string, value: string, position?: number | string, percentile?: number) => {
    drawStatRow(ctx, containerX + 20, bwy - 5, halfWidth, rowHeight, "#00FF00");
    drawText(ctx, label, containerX + 35, bwy + 20, 20, "#FFFFFF");
    const displayValue = `${value}${position ? ` (${position})` : ""}`;
    drawText(ctx, displayValue, containerX + 220, bwy + 20, 19, "#55FFFF");
    if (percentile) {
      drawText(ctx, `${percentile.toFixed(1)}%`, containerX + 350, bwy + 20, 16, "#AAFFAA");
    }
    bwy += rowHeight + 6;
  };

  drawBedwarsRow("Total", totalWins.toString());
  drawBedwarsRow("Solo", bedwarsStats.soloWins.value.toString(), bedwarsStats.soloWins.position || "", bedwarsStats.soloWins.percentile);
  drawBedwarsRow("Duos", bedwarsStats.duosWins.value.toString(), bedwarsStats.duosWins.position || "", bedwarsStats.duosWins.percentile);
  drawBedwarsRow("Trios", bedwarsStats.triosWins.value.toString(), bedwarsStats.triosWins.position || "", bedwarsStats.triosWins.percentile);
  drawBedwarsRow("Quads", bedwarsStats.quadsWins.value.toString(), bedwarsStats.quadsWins.position || "", bedwarsStats.quadsWins.percentile);
  drawBedwarsRow("4v4s", bedwarsStats.fv4Wins.value.toString(), bedwarsStats.fv4Wins.position || "", bedwarsStats.fv4Wins.percentile);
  drawBedwarsRow("Kills", bedwarsStats.kills.value.toString(), bedwarsStats.kills.position || "", bedwarsStats.kills.percentile);
  drawBedwarsRow("Deaths", bedwarsStats.deaths.value.toString(), bedwarsStats.deaths.position || "", bedwarsStats.deaths.percentile);
  drawBedwarsRow("FK", bedwarsStats.finalKills.value.toString(), bedwarsStats.finalKills.position || "", bedwarsStats.finalKills.percentile);

  // Other Games section
  const rightColX = containerX + (containerW - 40) / 2 + 15;
  drawText(ctx, "OTHER GAMES", rightColX + 15, bedwarsY + 22, 18, "#96CEBB");

  let gy = bedwarsY + 45;

  for (const display of STAT_DISPLAYS) {
    const stat = getStat(stats, display.stat);

    drawStatRow(ctx, rightColX, gy - 5, halfWidth, rowHeight, "#00FF00");
    drawText(ctx, display.label, rightColX + 15, gy + 20, 20, "#FFFFFF");
    drawText(ctx, stat.value.toString(), rightColX + 250, gy + 20, 24, display.color);

    gy += rowHeight + 6;
  }

  // Footer
  const footerY = height - padding - 25;
  drawFooter(ctx, containerX, containerW, footerY);

  return getImageBuffer(canvas);
}
