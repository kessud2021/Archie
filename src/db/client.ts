/**
 * JSON file-based storage for stats caching
 */

import fs from "fs";
import path from "path";
import { getUserDataPath } from "./init.js";
import { CACHE_TTL } from "../config/constants.js";
import type {
  PlayerStatistics,
  LeaderboardData,
  EconomyData,
  LifestealStats,
} from "../types/index.js";

/**
 * User data file structure - stores only changed fields (differential)
 */
interface UserDataFile {
  playerStats?: {
    // Only changed fields stored here
    [key: string]: unknown;
    updated_at: number;
  };
  leaderboards?: {
    [statId: string]: {
      data: LeaderboardData;
      updated_at: number;
    };
  };
  economyData?: {
    data: EconomyData;
    updated_at: number;
  };
  lifestealStats?: {
    // Only changed fields stored here
    [key: string]: unknown;
    updated_at: number;
  };
  skinUrl?: {
    url: string;
    updated_at: number;
  };
}

/**
 * Read user data file, return empty object if doesn't exist
 */
function readUserData(username: string): UserDataFile {
  const filePath = getUserDataPath(username);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // Silently fail
  }
  return {};
}

/**
 * Write user data file
 */
function writeUserData(username: string, data: UserDataFile): void {
  try {
    const filePath = getUserDataPath(username);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Silently fail
  }
}

/**
 * Calculate difference between old and new stats
 */
function calculateDiff(
  oldStats: PlayerStatistics,
  newStats: PlayerStatistics
): Partial<PlayerStatistics> {
  const diff: Partial<PlayerStatistics> = {};

  for (const key in newStats) {
    if (oldStats[key] !== newStats[key]) {
      diff[key] = newStats[key];
    }
  }

  return diff;
}

// ============================================================================
// PLAYER STATS
// ============================================================================

/**
 * Get cached player stats if fresh
 */
export function getCachedPlayerStats(
  username: string
): { stats: PlayerStatistics; isFresh: boolean } | null {
  try {
    const data = readUserData(username);
    if (!data.playerStats) return null;

    const now = Date.now();
    const isFresh = now - data.playerStats.updated_at < CACHE_TTL;

    // Reconstruct stats from stored differential updates
    const { updated_at, ...changes } = data.playerStats;
    const stats = changes as PlayerStatistics;

    return {
      stats,
      isFresh,
    };
  } catch {
    return null;
  }
}

/**
 * Save player stats to file (only changed fields)
 */
export function savePlayerStats(
  username: string,
  stats: PlayerStatistics
): Partial<PlayerStatistics> {
  try {
    const data = readUserData(username);

    // Get old stats to calculate diff
    const oldStats = data.playerStats ? 
      (({ updated_at, ...rest }: UserDataFile['playerStats']) => rest)(data.playerStats) as PlayerStatistics
      : {};
    const diff = calculateDiff(oldStats, stats);

    // Only store changed fields + timestamp
    if (Object.keys(diff).length > 0) {
      data.playerStats = {
        ...diff,
        updated_at: Date.now(),
      };
      writeUserData(username, data);
    }

    return diff;
  } catch {
    return {};
  }
}

/**
 * Get stats diff (what changed)
 */
export function getStatsDiff(
  username: string,
  newStats: PlayerStatistics
): Partial<PlayerStatistics> {
  const oldCache = getCachedPlayerStats(username);
  const oldStats = oldCache?.stats || {};
  return calculateDiff(oldStats, newStats);
}

// ============================================================================
// LEADERBOARDS
// ============================================================================

/**
 * Get cached leaderboard if fresh
 */
export function getCachedLeaderboard(
  statId: string
): { data: LeaderboardData; isFresh: boolean } | null {
  try {
    // For leaderboards, we store them in a global leaderboards.json file
    const filePath = path.join(path.resolve("./data"), "leaderboards.json");
    
    if (!fs.existsSync(filePath)) return null;

    const fileData = fs.readFileSync(filePath, "utf-8");
    const leaderboards: {
      [key: string]: { data: LeaderboardData; updated_at: number };
    } = JSON.parse(fileData);

    if (!leaderboards[statId]) return null;

    const now = Date.now();
    const isFresh = now - leaderboards[statId].updated_at < CACHE_TTL;

    return {
      data: leaderboards[statId].data,
      isFresh,
    };
  } catch {
    return null;
  }
}

/**
 * Save leaderboard to file
 */
export function saveLeaderboard(statId: string, data: LeaderboardData): void {
  try {
    const filePath = path.join(path.resolve("./data"), "leaderboards.json");
    
    let leaderboards: {
      [key: string]: { data: LeaderboardData; updated_at: number };
    } = {};

    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      leaderboards = JSON.parse(fileData);
    }

    leaderboards[statId] = {
      data,
      updated_at: Date.now(),
    };

    fs.writeFileSync(filePath, JSON.stringify(leaderboards, null, 2), "utf-8");
  } catch {
    // Silently fail
  }
}

// ============================================================================
// ECONOMY STATS
// ============================================================================

/**
 * Get cached economy data if fresh
 */
export function getCachedEconomyData(
  username: string
): { data: EconomyData; isFresh: boolean } | null {
  try {
    const data = readUserData(username);
    if (!data.economyData) return null;

    const now = Date.now();
    const isFresh = now - data.economyData.updated_at < CACHE_TTL;

    return {
      data: data.economyData.data,
      isFresh,
    };
  } catch {
    return null;
  }
}

/**
 * Save economy data to file
 */
export function saveEconomyData(username: string, data: EconomyData): void {
  try {
    const userData = readUserData(username);

    userData.economyData = {
      data,
      updated_at: Date.now(),
    };

    writeUserData(username, userData);
  } catch {
    // Silently fail
  }
}

// ============================================================================
// LIFESTEAL STATS
// ============================================================================

/**
 * Get cached lifesteal stats if fresh
 */
export function getCachedLifestealStats(
  username: string
): { stats: LifestealStats; isFresh: boolean } | null {
  try {
    const data = readUserData(username);
    if (!data.lifestealStats) return null;

    const now = Date.now();
    const isFresh = now - data.lifestealStats.updated_at < CACHE_TTL;

    // Reconstruct stats from stored differential updates
    const { updated_at, ...changes } = data.lifestealStats;
    const stats = changes as LifestealStats;

    return {
      stats,
      isFresh,
    };
  } catch {
    return null;
  }
}

/**
 * Save lifesteal stats to file (only changed fields)
 */
export function saveLifestealStats(
  username: string,
  stats: LifestealStats
): void {
  try {
    const data = readUserData(username);

    // Get old stats to calculate diff
    const oldStats = data.lifestealStats ?
      (({ updated_at, ...rest }: UserDataFile['lifestealStats']) => rest)(data.lifestealStats) as LifestealStats
      : {};
    const diff = calculateDiff(oldStats as PlayerStatistics, stats as PlayerStatistics);

    // Only store changed fields + timestamp
    if (Object.keys(diff).length > 0) {
      data.lifestealStats = {
        ...diff,
        updated_at: Date.now(),
      };
      writeUserData(username, data);
    }
  } catch {
    // Silently fail
  }
}

// ============================================================================
// SKINS
// ============================================================================

/**
 * Get cached skin URL if fresh
 */
export function getCachedSkin(
  username: string
): { url: string; isFresh: boolean } | null {
  try {
    const data = readUserData(username);
    if (!data.skinUrl) return null;

    const now = Date.now();
    const isFresh = now - data.skinUrl.updated_at < CACHE_TTL;

    return {
      url: data.skinUrl.url,
      isFresh,
    };
  } catch {
    return null;
  }
}

/**
 * Save skin URL to file
 */
export function saveSkin(username: string, skinUrl: string): void {
  try {
    const data = readUserData(username);

    data.skinUrl = {
      url: skinUrl,
      updated_at: Date.now(),
    };

    writeUserData(username, data);
  } catch {
    // Silently fail
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Clear all stale cache entries
 */
export function clearStaleCache(): void {
  try {
    const dataDir = path.resolve("./data");
    
    if (!fs.existsSync(dataDir)) return;

    const files = fs.readdirSync(dataDir);
    const now = Date.now();

    files.forEach((file) => {
      if (file.endsWith(".json") && file !== "leaderboards.json") {
        const filePath = path.join(dataDir, file);
        
        try {
          const userData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          let modified = false;

          // Check and remove stale entries
          if (
            userData.playerStats &&
            now - userData.playerStats.updated_at >= CACHE_TTL
          ) {
            delete userData.playerStats;
            modified = true;
          }
          if (
            userData.economyData &&
            now - userData.economyData.updated_at >= CACHE_TTL
          ) {
            delete userData.economyData;
            modified = true;
          }
          if (
            userData.lifestealStats &&
            now - userData.lifestealStats.updated_at >= CACHE_TTL
          ) {
            delete userData.lifestealStats;
            modified = true;
          }
          if (
            userData.skinUrl &&
            now - userData.skinUrl.updated_at >= CACHE_TTL
          ) {
            delete userData.skinUrl;
            modified = true;
          }

          if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), "utf-8");
          }
        } catch {
          // Silently fail
        }
      }
    });

    // Clear stale leaderboards
    try {
      const leaderboardsPath = path.join(path.resolve("./data"), "leaderboards.json");
      
      if (fs.existsSync(leaderboardsPath)) {
        const leaderboards = JSON.parse(
          fs.readFileSync(leaderboardsPath, "utf-8")
        );
        let modified = false;

        for (const statId in leaderboards) {
          if (now - leaderboards[statId].updated_at >= CACHE_TTL) {
            delete leaderboards[statId];
            modified = true;
          }
        }

        if (modified) {
          fs.writeFileSync(
            leaderboardsPath,
            JSON.stringify(leaderboards, null, 2),
            "utf-8"
          );
        }
      }
    } catch {
      // Silently fail
    }
  } catch {
    // Silently fail
  }
}
