<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { getPlayerStats, getEconomyData, getPlayerSkinUrl } from '../api/archmc'
import { STAT_DISPLAYS } from '../config/constants'
import type { PlayerStatistics } from '../types/index'

interface Props {
  username: string
}

const props = defineProps<Props>()

const loading = ref(true)
const error = ref('')
const playerStats = ref<PlayerStatistics>({})
const economyData = ref<Record<string, number>>({})

// Build game categories from bot's stats
const gameCategories: Record<string, { label: string; stats: string[] }> = {
  bedwars: {
    label: 'Bedwars',
    stats: [
      'wins:bedwars:global:lifetime',
      'kills:bedwars:global:lifetime',
      'deaths:bedwars:global:lifetime',
      'final_kills:bedwars:global:lifetime',
    ],
  },
  skywars: {
    label: 'SkyWars',
    stats: [
      'wins:skywars:global:lifetime',
      'kills:skywars:global:lifetime',
      'deaths:skywars:global:lifetime',
    ],
  },
  bridges: {
    label: 'Bridges',
    stats: [
      'wins:bridges:global:lifetime',
      'kills:bridges:global:lifetime',
      'deaths:bridges:global:lifetime',
    ],
  },
  stickfight: {
    label: 'Stickfight',
    stats: [
      'wins:stickfight:global:lifetime',
      'kills:stickfight:global:lifetime',
      'deaths:stickfight:global:lifetime',
    ],
  },
  sumo: {
    label: 'Sumo',
    stats: [
      'wins:sumo:global:lifetime',
      'kills:sumo:global:lifetime',
      'deaths:sumo:global:lifetime',
    ],
  },
  builduhc: {
    label: 'BuildUHC',
    stats: [
      'wins:builduhc:global:lifetime',
      'kills:builduhc:global:lifetime',
      'deaths:builduhc:global:lifetime',
    ],
  },
}

const formatStatName = (stat: string): string => {
  // Format stat keys like "wins:bedwars:global:lifetime" to "Wins"
  const parts = stat.split(':')
  const statType = parts[0] ?? stat // "wins", "kills", etc.
  return statType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getStat = (statKey: string): number => {
  const stat = playerStats.value[statKey]
  if (typeof stat === 'number') return stat
  if (stat && typeof stat === 'object' && 'value' in stat) return (stat as any).value
  return 0
}

const getStatPosition = (stat: PlayerStatistics[string] | undefined): number | undefined => {
  if (stat && typeof stat === 'object' && 'position' in stat) return (stat as any).position
  return undefined
}

const loadPlayerData = async () => {
  try {
    loading.value = true
    error.value = ''
    const [statsData, econData] = await Promise.all([
      getPlayerStats(props.username),
      getEconomyData(props.username).catch(() => ({ balances: {} })),
    ])
    playerStats.value = statsData.statistics || {}
    economyData.value = econData.balances || {}
  } catch (err) {
    error.value = `Failed to load stats for ${props.username}`
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadPlayerData)
watch(() => props.username, loadPlayerData)
</script>

<template>
  <div class="profile-container">
    <RouterLink to="/" class="back-btn">← Back</RouterLink>

    <div v-if="loading" class="loading">Loading player stats...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="profile">
      <div class="profile-header">
        <div class="profile-skin">
          <img :src="getPlayerSkinUrl(username)" :alt="username" class="skin-img" />
        </div>
        <div class="profile-info">
          <h1>{{ username }}</h1>
          <div class="profile-stats">
            <div class="stat-box" v-if="Object.keys(economyData).length > 0">
              <label>Coins</label>
              <value>{{ economyData.coins ? economyData.coins.toLocaleString() : 'N/A' }}</value>
            </div>
            <div class="stat-box">
              <label>Total Games</label>
              <value>{{ Object.keys(playerStats).length }}</value>
            </div>
          </div>
        </div>
      </div>

      <div class="games-section">
        <div
          v-for="(category, key) in gameCategories"
          :key="key"
          class="game-category"
          v-show="category.stats.some((s) => playerStats[s] !== undefined)"
        >
          <h2>{{ category.label }}</h2>
          <div class="stats-grid">
            <div v-for="statKey in category.stats" :key="statKey" v-show="playerStats[statKey]"
              class="stat-item">
              <div class="stat-label">{{ formatStatName(statKey) }}</div>
              <div class="stat-value">{{ getStat(statKey).toLocaleString() }}</div>
              <div v-if="getStatPosition(playerStats[statKey])" class="stat-position">
                Rank: #{{ getStatPosition(playerStats[statKey]) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="Object.keys(playerStats).length === 0" class="no-stats">
          <p>No statistics found for this player.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  width: 100%;
}

.back-btn {
  display: inline-block;
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  border: 1px solid #ffd700;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  font-weight: bold;
}

.back-btn:hover {
  background: #ffd700;
  color: #000;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 8px;
}

.profile {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-header {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.profile-skin {
  display: flex;
  justify-content: center;
  align-items: center;
}

.skin-img {
  width: 128px;
  height: 128px;
  border: 2px solid #ffd700;
  border-radius: 8px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  font-size: 2.5rem;
  color: #ffd700;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.profile-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-box {
  background: rgba(255, 215, 0, 0.1);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.stat-box label {
  display: block;
  color: #b0b0b0;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-box value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
}

.games-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.game-category {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.game-category h2 {
  color: #ffd700;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: #ffd700;
  transform: translateY(-3px);
}

.stat-label {
  color: #b0b0b0;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 0.5rem;
}

.stat-position {
  color: #00ffff;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.no-stats {
  text-align: center;
  padding: 3rem;
  color: #b0b0b0;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-info h1 {
    font-size: 1.8rem;
  }

  .profile-stats {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}
</style>
