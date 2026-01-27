/**
 * Type definitions for the Archie bot
 */

export interface Stat {
  value: number;
  position?: number;
  percentile?: number;
}

export interface PlayerStatistics {
  [key: string]: number | { value: number; position?: number; percentile?: number; totalPlayers?: number };
}

export interface StatValue {
  value: number;
  percentile: number;
  position: number;
  totalPlayers: number;
}

export interface PlayerData {
  statistics: PlayerStatistics;
}

export interface LeaderboardEntry {
  position: number;
  username: string;
  value: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalPlayers?: number;
  valueLabel?: string; // e.g., "WINS", "COINS", "TOKENS"
}

export interface EconomyStat {
  label: string;
  value: number;
}

export interface LifestealStat {
  label: string;
  value: number;
  position?: number;
}

export interface MiscStat {
  label: string;
  value: number;
}

export interface DuelMode {
  name: string;
  key: string;
  color: string;
}

export interface StatDisplay {
  label: string;
  stat: string;
  color: string;
}

export interface EconomyData {
  balances?: {
    [key: string]: number;
  };
}

export interface LifestealStats {
  [key: string]: number;
}

export interface GameConfig {
  name: string;
  statKey: string;
}
