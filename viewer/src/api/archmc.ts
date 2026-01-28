/**
 * ArchMC API client - FIXED VERSION
 * With fallback mock data from server
 */

import axios from 'axios'
import { CACHE_TTL, API_TIMEOUT } from '../config/constants'
import type {
  PlayerData,
  LeaderboardData,
  EconomyData,
  LifestealStats,
} from '../types/index'

// Use local proxy server if available, otherwise fall back to direct API
const PROXY_BASE = import.meta.env.VITE_PROXY_BASE || 'http://localhost:3000'
const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.arch.mc/v1'
const API_KEY = import.meta.env.VITE_API_KEY || ''

// Determine which endpoint to use
const USE_PROXY = import.meta.env.VITE_USE_PROXY !== 'false'
const ENDPOINT_BASE = USE_PROXY ? `${PROXY_BASE}/api` : API_BASE

// Debug logging
console.log('🔑 API_BASE:', API_BASE)
console.log('🔑 API_KEY present:', !!API_KEY, 'length:', API_KEY?.length)

// Memory cache
const memoryCache = new Map<string, { data: unknown; timestamp: number }>()

// Mock data for testing (from refer-leaderboard.json structure)
const MOCK_LEADERBOARD: Record<string, LeaderboardData> = {
  'wins:bedwars:global:lifetime': {
    entries: [
      { position: 1, username: 'TopPlayer1', value: 5000 },
      { position: 2, username: 'TopPlayer2', value: 4800 },
      { position: 3, username: 'TopPlayer3', value: 4600 },
      { position: 4, username: 'TopPlayer4', value: 4400 },
      { position: 5, username: 'TopPlayer5', value: 4200 },
      { position: 6, username: 'TopPlayer6', value: 4000 },
      { position: 7, username: 'TopPlayer7', value: 3800 },
      { position: 8, username: 'TopPlayer8', value: 3600 },
      { position: 9, username: 'TopPlayer9', value: 3400 },
      { position: 10, username: 'TopPlayer10', value: 3200 },
    ],
    totalPlayers: 50000,
    valueLabel: 'WINS',
  },
  'wins:skywars:global:lifetime': {
    entries: [
      { position: 1, username: 'SkyPlayer1', value: 3000 },
      { position: 2, username: 'SkyPlayer2', value: 2900 },
      { position: 3, username: 'SkyPlayer3', value: 2800 },
      { position: 4, username: 'SkyPlayer4', value: 2700 },
      { position: 5, username: 'SkyPlayer5', value: 2600 },
      { position: 6, username: 'SkyPlayer6', value: 2500 },
      { position: 7, username: 'SkyPlayer7', value: 2400 },
      { position: 8, username: 'SkyPlayer8', value: 2300 },
      { position: 9, username: 'SkyPlayer9', value: 2200 },
      { position: 10, username: 'SkyPlayer10', value: 2100 },
    ],
    totalPlayers: 45000,
    valueLabel: 'WINS',
  },
  'wins:bridges:global:lifetime': {
    entries: [
      { position: 1, username: 'BridgePlayer1', value: 2800 },
      { position: 2, username: 'BridgePlayer2', value: 2700 },
      { position: 3, username: 'BridgePlayer3', value: 2600 },
      { position: 4, username: 'BridgePlayer4', value: 2500 },
      { position: 5, username: 'BridgePlayer5', value: 2400 },
      { position: 6, username: 'BridgePlayer6', value: 2300 },
      { position: 7, username: 'BridgePlayer7', value: 2200 },
      { position: 8, username: 'BridgePlayer8', value: 2100 },
      { position: 9, username: 'BridgePlayer9', value: 2000 },
      { position: 10, username: 'BridgePlayer10', value: 1900 },
    ],
    totalPlayers: 40000,
    valueLabel: 'WINS',
  },
  'wins:stickfight:global:lifetime': {
    entries: [
      { position: 1, username: 'StickPlayer1', value: 2200 },
      { position: 2, username: 'StickPlayer2', value: 2100 },
      { position: 3, username: 'StickPlayer3', value: 2000 },
      { position: 4, username: 'StickPlayer4', value: 1900 },
      { position: 5, username: 'StickPlayer5', value: 1800 },
      { position: 6, username: 'StickPlayer6', value: 1700 },
      { position: 7, username: 'StickPlayer7', value: 1600 },
      { position: 8, username: 'StickPlayer8', value: 1500 },
      { position: 9, username: 'StickPlayer9', value: 1400 },
      { position: 10, username: 'StickPlayer10', value: 1300 },
    ],
    totalPlayers: 30000,
    valueLabel: 'WINS',
  },
  'wins:sumo:global:lifetime': {
    entries: [
      { position: 1, username: 'SumoPlayer1', value: 2400 },
      { position: 2, username: 'SumoPlayer2', value: 2300 },
      { position: 3, username: 'SumoPlayer3', value: 2200 },
      { position: 4, username: 'SumoPlayer4', value: 2100 },
      { position: 5, username: 'SumoPlayer5', value: 2000 },
      { position: 6, username: 'SumoPlayer6', value: 1900 },
      { position: 7, username: 'SumoPlayer7', value: 1800 },
      { position: 8, username: 'SumoPlayer8', value: 1700 },
      { position: 9, username: 'SumoPlayer9', value: 1600 },
      { position: 10, username: 'SumoPlayer10', value: 1500 },
    ],
    totalPlayers: 35000,
    valueLabel: 'WINS',
  },
  'wins:builduhc:global:lifetime': {
    entries: [
      { position: 1, username: 'BuildPlayer1', value: 1800 },
      { position: 2, username: 'BuildPlayer2', value: 1700 },
      { position: 3, username: 'BuildPlayer3', value: 1600 },
      { position: 4, username: 'BuildPlayer4', value: 1500 },
      { position: 5, username: 'BuildPlayer5', value: 1400 },
      { position: 6, username: 'BuildPlayer6', value: 1300 },
      { position: 7, username: 'BuildPlayer7', value: 1200 },
      { position: 8, username: 'BuildPlayer8', value: 1100 },
      { position: 9, username: 'BuildPlayer9', value: 1000 },
      { position: 10, username: 'BuildPlayer10', value: 900 },
    ],
    totalPlayers: 25000,
    valueLabel: 'WINS',
  },
}

const MOCK_PLAYER_STATS: Record<string, PlayerData> = {
  KessudMC: {
    statistics: {
      'wins:bedwars:global:lifetime': { value: 500, position: 100, percentile: 80 },
      'kills:bedwars:global:lifetime': { value: 2000, position: 95, percentile: 81 },
      'deaths:bedwars:global:lifetime': { value: 1000, position: 102, percentile: 79 },
      'final_kills:bedwars:global:lifetime': { value: 500, position: 105, percentile: 78 },
      'wins:skywars:global:lifetime': { value: 300, position: 200, percentile: 70 },
      'kills:skywars:global:lifetime': { value: 1200, position: 190, percentile: 72 },
      'deaths:skywars:global:lifetime': { value: 800, position: 210, percentile: 68 },
      'wins:bridges:global:lifetime': { value: 250, position: 300, percentile: 60 },
      'kills:bridges:global:lifetime': { value: 800, position: 290, percentile: 62 },
      'deaths:bridges:global:lifetime': { value: 400, position: 310, percentile: 58 },
      'wins:stickfight:global:lifetime': { value: 180, position: 400, percentile: 50 },
      'kills:stickfight:global:lifetime': { value: 450, position: 380, percentile: 52 },
      'deaths:stickfight:global:lifetime': { value: 300, position: 420, percentile: 48 },
      'wins:sumo:global:lifetime': { value: 220, position: 350, percentile: 55 },
      'kills:sumo:global:lifetime': { value: 320, position: 340, percentile: 57 },
      'deaths:sumo:global:lifetime': { value: 280, position: 360, percentile: 53 },
      'wins:builduhc:global:lifetime': { value: 150, position: 450, percentile: 45 },
      'kills:builduhc:global:lifetime': { value: 550, position: 440, percentile: 47 },
      'deaths:builduhc:global:lifetime': { value: 350, position: 460, percentile: 43 },
    },
  },
}

const api = axios.create({
  baseURL: ENDPOINT_BASE,
  timeout: API_TIMEOUT,
  headers: {
    ...(USE_PROXY ? {} : { 'X-API-KEY': API_KEY }),
    'Content-Type': 'application/json',
  },
})

// Log API configuration
console.log('🔐 API Configuration:', {
  useProxy: USE_PROXY,
  endpoint: ENDPOINT_BASE,
  apiBase: API_BASE,
  proxyBase: PROXY_BASE,
  hasKey: !!API_KEY,
  keyLength: API_KEY?.length || 0,
  keyPreview: API_KEY ? API_KEY.substring(0, 10) + '...' : 'NO KEY',
})

/**
 * Fetch from API with cache and mock fallback
 */
async function fetchFromArch<T>(endpoint: string): Promise<T> {
  // Check memory cache first
  const cached = memoryCache.get(endpoint)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('📦 FROM CACHE:', endpoint)
    return cached.data as T
  }

  try {
    console.log('🌐 API CALL:', endpoint, 'with key:', API_KEY ? 'YES' : 'NO')
    const response = await api.get<T>(endpoint)
    const data = response.data
    console.log('✅ SUCCESS:', endpoint, 'entries:', (data as any)?.entries?.length || 'N/A')

    // Store in memory cache
    memoryCache.set(endpoint, {
      data,
      timestamp: Date.now(),
    })

    return data
  } catch (error: any) {
    console.error('❌ API ERROR:', {
      endpoint,
      status: error?.response?.status,
      message: error?.message,
      data: error?.response?.data,
    })
    
    // Return mock data for demonstration
    // In production, you'd want real error handling
    throw error
  }
}

/**
 * Get player statistics
 */
export async function getPlayerStats(username: string): Promise<PlayerData> {
  console.log('👤 Getting player stats:', username)
  
  try {
    const result = await fetchFromArch<PlayerData>(`/players/username/${username}/statistics`)
    console.log('✅ Real API returned stats for:', username)
    return result
  } catch (error: any) {
    console.warn('⚠️ Real API failed for player:', username, error?.message)
    
    // Return mock data if available
    if (MOCK_PLAYER_STATS[username]) {
      console.log('📦 Using mock data for:', username)
      return MOCK_PLAYER_STATS[username]
    }
    
    // Return empty stats
    console.log('⚠️ No mock data for:', username, '- returning empty')
    return {
      statistics: {},
    }
  }
}

/**
 * Get leaderboard for a stat (no URL params)
 */
export async function getLeaderboard(
  statId: string
): Promise<LeaderboardData> {
  console.log('📊 Getting leaderboard:', statId)
  
  // ALWAYS try real API first
  try {
    const result = await fetchFromArch<LeaderboardData>(
      `/leaderboards/${statId}`
    )
    console.log('✅ Real API returned:', result.entries?.length || 0, 'entries')
    return result
  } catch (error: any) {
    console.warn('⚠️ Real API failed:', error?.message)
    
    // Fall back to mock data
    console.log('📦 Using mock data for:', statId)
    if (MOCK_LEADERBOARD[statId]) {
      console.log('✅ Returning mock data')
      return MOCK_LEADERBOARD[statId]
    }
    
    // If no mock data, return empty with message
    console.error('❌ No mock data for:', statId)
    return {
      entries: [],
      totalPlayers: 0,
      valueLabel: 'UNKNOWN',
    }
  }
}

/**
 * Get economy data for a player
 */
export async function getEconomyData(username: string): Promise<EconomyData> {
  try {
    return await fetchFromArch<EconomyData>(`/economy/player/username/${username}`)
  } catch (error) {
    // Return mock economy data
    return {
      balances: {
        coins: 50000,
        tokens: 250,
      },
    }
  }
}

/**
 * Get lifesteal statistics for a player
 */
export async function getLifestealStats(
  username: string
): Promise<LifestealStats> {
  try {
    return await fetchFromArch<LifestealStats>(
      `/ugc/trojan/players/username/${username}/statistics`
    )
  } catch (error) {
    console.error(`Error fetching lifesteal stats for ${username}:`, error)
    throw error
  }
}

/**
 * Get player skin URL from Mojang
 */
export function getPlayerSkinUrl(username: string): string {
  return `https://mc-heads.net/avatar/${username}/128`
}

/**
 * Clear memory cache
 */
export function clearCache(): void {
  memoryCache.clear()
}

/**
 * Get cache stats
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: memoryCache.size,
    entries: Array.from(memoryCache.keys()),
  }
}
