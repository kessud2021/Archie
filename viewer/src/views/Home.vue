<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getLeaderboard } from '../api/archmc'
import { GAME_STAT_MAP, STAT_DISPLAYS } from '../config/constants'
import type { LeaderboardEntry } from '../types/index'

// Map bot's game config to UI format
const icons: Record<string, string> = {
  bedwars: '⛏️',
  skywars: '☁️',
  bridges: '🌉',
  stickfight: '🎯',
  sumo: '💪',
  builduhc: '🏗️',
}

const games = Object.entries(GAME_STAT_MAP)
  .map(([gameKey, statId]) => ({
    name: gameKey.charAt(0).toUpperCase() + gameKey.slice(1),
    id: statId, // Use the full stat ID like "wins:bedwars:global:lifetime"
    icon: icons[gameKey] ?? '🎮',
  }))
  .slice(0, 6) // First 6 games

interface GameStats {
  [key: string]: LeaderboardEntry[]
}

const topPlayers = ref<GameStats>({})
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    for (const game of games) {
      const data = await getLeaderboard(game.id, 0, 5)
      topPlayers.value[game.id] = data.entries || []
    }
  } catch (err) {
    error.value = 'Failed to load leaderboards'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>Archie Stats Viewer</h1>
      <p>Complete Arch MC Statistics & Leaderboards</p>
      <p class="subtitle">Click on any player to view their full profile</p>
    </div>

    <div v-if="loading" class="loading">Loading leaderboards...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="games-grid">
      <div v-for="game in games" :key="game.id" class="game-card">
        <div class="game-header">
          <span class="game-icon">{{ game.icon }}</span>
          <h2>{{ game.name }}</h2>
        </div>

        <div class="game-content">
          <div class="top-players">
            <div
              v-for="(player, idx) in topPlayers[game.id]"
              :key="player.username"
              class="player-row"
            >
              <div class="rank" :class="getRankClass(idx)">
                #{{ player.position || idx + 1 }}
              </div>
              <RouterLink :to="`/player/${player.username}`" class="player-link">
                {{ player.username }}
              </RouterLink>
              <div class="wins">{{ player.value }} wins</div>
            </div>
          </div>

          <RouterLink :to="`/leaderboards/${game.id}`" class="view-all-btn">
            View Full Leaderboard →
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
function getRankClass(index: number): string {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return ''
}
</script>

<style scoped>
.home {
  width: 100%;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 255, 200, 0.1));
  border-radius: 12px;
  margin-bottom: 3rem;
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.hero p {
  font-size: 1.3rem;
  color: #e0e0e0;
}

.subtitle {
  font-size: 1rem !important;
  color: #b0b0b0 !important;
  margin-top: 1rem !important;
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

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.game-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.game-card:hover {
  border-color: #ffd700;
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(255, 215, 0, 0.2);
}

.game-header {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 255, 200, 0.05));
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
}

.game-icon {
  font-size: 2rem;
}

.game-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.game-content {
  padding: 1.5rem;
}

.top-players {
  margin-bottom: 1.5rem;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.player-row:hover {
  background: rgba(255, 215, 0, 0.1);
}

.rank {
  min-width: 50px;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-align: center;
  background: rgba(100, 100, 100, 0.3);
  font-size: 0.9rem;
}

.rank.gold {
  background: rgba(255, 215, 0, 0.3);
  color: #ffd700;
}

.rank.silver {
  background: rgba(192, 192, 192, 0.3);
  color: #c0c0c0;
}

.rank.bronze {
  background: rgba(205, 127, 50, 0.3);
  color: #cd7f32;
}

.player-link {
  flex: 1;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.player-link:hover {
  color: #ffd700;
}

.wins {
  color: #b0b0b0;
  font-size: 0.9rem;
}

.view-all-btn {
  display: inline-block;
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #000;
  text-decoration: none;
  border-radius: 6px;
  text-align: center;
  font-weight: bold;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.view-all-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(255, 215, 0, 0.3);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }

  .hero p {
    font-size: 1rem;
  }

  .games-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
