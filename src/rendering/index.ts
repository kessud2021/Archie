/**
 * Rendering module exports
 */

export { generateLeaderboardImage } from "./leaderboard.js";
export { generateStatsImage } from "./stats.js";
export { generateDuelStatsImage } from "./duelStats.js";
export { generateEconomyImage } from "./economy.js";
export { generateLifestealImage } from "./lifesteal.js";
export { generateMiscImage } from "./misc.js";
export { generateCompareImage } from "./compare.js";

// Re-export canvas utilities for any custom rendering
export {
  createImage,
  drawText,
  drawBox,
  drawBar,
  roundedRect,
  drawBackground,
  drawOverlay,
  drawContainer,
  drawStatRow,
  drawFooter,
  getImageBuffer,
  loadImage,
  createCanvas,
} from "./canvas.js";
