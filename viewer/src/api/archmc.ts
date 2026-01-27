/**
 * ArchMC API client - Browser-compatible version
 * Uses the exact same endpoints and types as the bot
 * Only differences: no SQLite caching (browser has no filesystem)
 */

import axios from 'axios'
import { CACHE_TTL, API_TIMEOUT } from '../config/constants'
import type {
  PlayerData,
  LeaderboardData,
  EconomyData,
  LifestealStats,
} from '../types/index'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.arch.mc/v1'
const API_KEY = import.meta.env.VITE_API_KEY || ''

// Simple memory cache (since we can't use SQLite in browser)
const memoryCache = new Map<string, { data: unknown; timestamp: number }>()

const api = axios.create({
  baseURL: API_BASE,
  timeout: API_TIMEOUT,
  headers: {
    'X-API-KEY': API_KEY,
  },
})

/**
 * Cache-aware fetch from ArchMC API
 * 1. Memory cache (2-minute TTL)
 * 2. API (source of truth)
 */
async function fetchFromArch<T>(endpoint: string): Promise<T> {
  // Check memory cache first
  const cached = memoryCache.get(endpoint)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }

  try {
    const response = await api.get<T>(endpoint)
    const data = response.data

    // Store in memory cache
    memoryCache.set(endpoint, {
      data,
      timestamp: Date.now(),
    })

    return data
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error)
    throw error
  }
}

/**
 * Get player statistics
 * Endpoint: GET /players/username/{username}/statistics
 */
export async function getPlayerStats(username: string): Promise<PlayerData> {
  return fetchFromArch<PlayerData>(`/players/username/${username}/statistics`)
}

/**
 * Get leaderboard for a stat
 * Endpoint: GET /leaderboards/{statId}?page={page}&size={size}
 */
export async function getLeaderboard(
  statId: string,
  page: number = 0,
  size: number = 10
): Promise<LeaderboardData> {
  return fetchFromArch<LeaderboardData>(
    `/leaderboards/${statId}?page=${page}&size=${size}`
  )
}

/**
 * Get economy data for a player
 * Endpoint: GET /economy/player/username/{username}
 */
export async function getEconomyData(username: string): Promise<EconomyData> {
  return fetchFromArch<EconomyData>(`/economy/player/username/${username}`)
}

/**
 * Get lifesteal statistics for a player
 * Endpoint: GET /ugc/trojan/players/username/{username}/statistics
 */
export async function getLifestealStats(
  username: string
): Promise<LifestealStats> {
  return fetchFromArch<LifestealStats>(
    `/ugc/trojan/players/username/${username}/statistics`
  )
}

/**
 * Get player skin URL from Mojang
 * External service (not from ArchMC API)
 */
export function getPlayerSkinUrl(username: string): string {
  return `https://mc-heads.net/avatar/${username}/128`
}

/**
 * Clear memory cache (useful for debugging)
 */
export function clearCache(): void {
  memoryCache.clear()
}

/**
 * Get cache stats (for debugging)
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: memoryCache.size,
    entries: Array.from(memoryCache.keys()),
  }
}
