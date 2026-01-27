/**
 * ArchMC API client
 * Handles all API calls to the ArchMC server
 * Uses SQLite database for persistent caching
 */

import fetch from "node-fetch";
import { cache } from "../utils/cache.js";
import { API_TIMEOUT } from "../config/constants.js";
import {
  getCachedPlayerStats,
  savePlayerStats,
  getCachedLeaderboard,
  saveLeaderboard,
  getCachedEconomyData,
  saveEconomyData,
  getCachedLifestealStats,
  saveLifestealStats,
  getCachedSkin,
  saveSkin,
} from "../db/client.js";
import type {
  PlayerData,
  LeaderboardData,
  EconomyData,
  LifestealStats,
} from "../types/index.js";

const API_BASE = process.env.API_BASE || "https://api.arch.mc/v1";
const API_KEY = process.env.API_KEY || "";

/**
 * Fetch data from ArchMC API with multi-layer caching
 * 1. Memory cache (fast)
 * 2. SQLite DB cache (persistent)
 * 3. API (source of truth)
 */
async function fetchFromArch<T>(endpoint: string): Promise<T> {
  // Layer 1: Check memory cache first
  const memoryCached = cache.get<T>(endpoint);
  if (memoryCached) return memoryCached;

  // Layer 2: Check SQLite cache (will be checked in specific functions)

  const url = `${API_BASE}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const res = await fetch(url, {
      headers: { "X-API-KEY": API_KEY },
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "unknown error");
      throw new Error(`API ${res.status}: ${errorText.substring(0, 50)}`);
    }

    const data = (await res.json()) as T;
    cache.set(endpoint, data);
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get player statistics with database caching
 * Returns full stats, but logs which stats were updated
 */
export async function getPlayerStats(username: string): Promise<PlayerData> {
  // Check database cache first
  const dbCached = getCachedPlayerStats(username);
  if (dbCached?.isFresh) {
    return { statistics: dbCached.stats };
  }

  // Fetch from API
  const data = await fetchFromArch<PlayerData>(
    `/players/username/${username}/statistics`
  );

  // Save to database and get diff
  const diff = savePlayerStats(username, data.statistics || {});

  // Log changes if any
  if (Object.keys(diff).length > 0) {
    console.log(
      `[DB] Updated ${Object.keys(diff).length} stat(s) for ${username}`
    );
  }

  return data;
}

/**
 * Get leaderboard for a stat with database caching
 */
export async function getLeaderboard(
  statId: string,
  page: number = 0,
  size: number = 10
): Promise<LeaderboardData> {
  // Check database cache first
  const dbCached = getCachedLeaderboard(statId);
  if (dbCached?.isFresh) {
    return dbCached.data;
  }

  // Fetch from API
  const data = await fetchFromArch<LeaderboardData>(
    `/leaderboards/${statId}?page=${page}&size=${size}`
  );

  // Save to database
  saveLeaderboard(statId, data);

  return data;
}

/**
 * Get economy data for a player with database caching
 */
export async function getEconomyData(username: string): Promise<EconomyData> {
  // Check database cache first
  const dbCached = getCachedEconomyData(username);
  if (dbCached?.isFresh) {
    return dbCached.data;
  }

  // Fetch from API
  const data = await fetchFromArch<EconomyData>(
    `/economy/player/username/${username}`
  );

  // Save to database
  saveEconomyData(username, data);

  return data;
}

/**
 * Get lifesteal statistics for a player with database caching
 */
export async function getLifestealStats(
  username: string
): Promise<LifestealStats> {
  // Check database cache first
  const dbCached = getCachedLifestealStats(username);
  if (dbCached?.isFresh) {
    return dbCached.stats;
  }

  // Fetch from API
  const data = await fetchFromArch<LifestealStats>(
    `/ugc/trojan/players/username/${username}/statistics`
  );

  // Save to database
  saveLifestealStats(username, data);

  return data;
}
