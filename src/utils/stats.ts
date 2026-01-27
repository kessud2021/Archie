/**
 * Statistics utility functions
 * Helpers for extracting and processing player statistics
 */

import type { Stat, PlayerStatistics } from "../types/index.js";

/**
 * Extract a single stat from player statistics
 */
export function getStat(
  stats: PlayerStatistics,
  statKey: string
): Stat {
  const value = stats[statKey] as number | undefined;
  return {
    value: value ?? 0,
    position: undefined,
    percentile: undefined,
  };
}

/**
 * Calculate win-loss ratio
 */
export function calculateWLR(wins: number, losses: number): number {
  return losses === 0 ? wins : wins / losses;
}

/**
 * Format large numbers for display
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Extract and format Bedwars stats
 */
export function extractBedwarsStats(stats: PlayerStatistics): Record<string, number> {
  const modes = ["solo", "duos", "trios", "quads", "4v4"];
  const bedwarsStats: Record<string, number> = {};

  for (const mode of modes) {
    const key = mode === "4v4" 
      ? "wins:bw_special_4v4:casual:lifetime"
      : `wins:bw_mini_${mode}:casual:lifetime`;
    bedwarsStats[mode] = (stats[key] as number) ?? 0;
  }

  return bedwarsStats;
}

/**
 * Extract duel mode stats
 */
export function extractDuelStats(
  stats: PlayerStatistics,
  mode: string
): { elo: number; wins: number } {
  const eloKey = `elo:${mode}:ranked:lifetime`;
  const winsKey = `wins:${mode}:ranked:lifetime`;

  return {
    elo: (stats[eloKey] as number) ?? 0,
    wins: (stats[winsKey] as number) ?? 0,
  };
}
