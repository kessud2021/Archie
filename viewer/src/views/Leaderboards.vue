<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getLeaderboard } from '../api/archmc'
import { GAME_STAT_MAP } from '../config/constants'
import type { LeaderboardEntry } from '../types/index'

interface Props {
  stat: string
}

const props = defineProps<Props>()

// Map stat IDs to game names from GAME_STAT_MAP
const gameNames: Record<string, string> = Object.entries(GAME_STAT_MAP).reduce(
  (acc: Record<string, string>, [gameKey, statId]: [string, string]) => {
    acc[statId] = gameKey.charAt(0).toUpperCase() + gameKey.slice(1)
    return acc
  },
  {} as Record<string, string>
)

const entries = ref<LeaderboardEntry[]>([])
const loading = ref(true)
const error = ref('')
const currentPage = ref(0)
const pageSize = 100
const totalPlayers = ref(0)

const gameName = computed(() => gameNames[props.stat] || props.stat)
const totalPages = computed(() => Math.ceil(totalPlayers.value / pageSize))

const loadLeaderboard = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await getLeaderboard(props.stat)
    entries.value = data.entries || []
    totalPlayers.value = data.totalPlayers || entries.value.length
  } catch (err) {
    error.value = `Failed to load ${gameName.value} leaderboard`
    console.error(err)
    entries.value = []
  } finally {
    loading.value = false
  }
}

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}

onMounted(loadLeaderboard)
watch(() => props.stat, () => {
  currentPage.value = 0
  loadLeaderboard()
})
watch(currentPage, loadLeaderboard)
</script>

<template>
  <div class="leaderboard-container">
    <div class="header">
      <RouterLink to="/" class="back-btn">← Back</RouterLink>
      <h1>{{ gameName }} Leaderboard</h1>
    </div>

    <div v-if="loading" class="loading">Loading leaderboard...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="content">
      <div class="stats-info">
        <p>Total Players: {{ totalPlayers }}</p>
        <p>Page {{ currentPage + 1 }} of {{ totalPages || 1 }}</p>
      </div>

      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Wins</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(entry, idx) in entries"
            :key="entry.username"
            :class="getRankClass(entry.position || idx + 1)"
          >
            <td class="rank">
              <span v-if="entry.position === 1" class="medal">🥇</span>
              <span v-else-if="entry.position === 2" class="medal">🥈</span>
              <span v-else-if="entry.position === 3" class="medal">🥉</span>
              <span v-else>#{{ entry.position || currentPage * pageSize + idx + 1 }}</span>
            </td>
            <td class="player-name">
              <RouterLink :to="`/player/${entry.username}`">
                {{ entry.username }}
              </RouterLink>
            </td>
            <td class="wins">{{ entry.value.toLocaleString() }}</td>
            <td class="progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${Math.min(100, (entry.value / 1000) * 100)}%` }"
                ></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button :disabled="currentPage === 0" @click="previousPage" class="page-btn">
          ← Previous
        </button>
        <span class="page-info">
          Page {{ currentPage + 1 }} of {{ totalPages || 1 }}
        </span>
        <button :disabled="currentPage >= totalPages - 1" @click="nextPage" class="page-btn">
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
function getRankClass(rank: number): string {
  if (rank === 1) return 'top-1'
  if (rank === 2) return 'top-2'
  if (rank === 3) return 'top-3'
  return ''
}
</script>

<style scoped>
.leaderboard-container {
  width: 100%;
}

.header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  border: 1px solid #ffd700;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: bold;
}

.back-btn:hover {
  background: #ffd700;
  color: #000;
}

.header h1 {
  font-size: 2.5rem;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
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

.content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.stats-info {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  background: rgba(255, 215, 0, 0.05);
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  font-size: 0.95rem;
  color: #b0b0b0;
}

.stats-info p {
  margin: 0;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard-table thead {
  background: rgba(255, 215, 0, 0.08);
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
}

.leaderboard-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: bold;
  color: #ffd700;
}

.leaderboard-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.leaderboard-table tbody tr {
  transition: all 0.3s ease;
}

.leaderboard-table tbody tr:hover {
  background: rgba(255, 215, 0, 0.08);
}

.leaderboard-table tbody tr.top-1 {
  background: rgba(255, 215, 0, 0.15);
}

.leaderboard-table tbody tr.top-2 {
  background: rgba(192, 192, 192, 0.1);
}

.leaderboard-table tbody tr.top-3 {
  background: rgba(205, 127, 50, 0.1);
}

.rank {
  font-weight: bold;
  min-width: 60px;
}

.medal {
  font-size: 1.2rem;
}

.player-name a {
  color: #00ffff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.player-name a:hover {
  color: #ffd700;
  text-shadow: 0 0 10px #00ffff;
}

.wins {
  font-weight: bold;
  color: #ffd700;
}

.progress {
  min-width: 200px;
}

.progress-bar {
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  transition: width 0.3s ease;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: rgba(255, 215, 0, 0.05);
  border-top: 1px solid rgba(255, 215, 0, 0.1);
}

.page-btn {
  padding: 0.5rem 1.5rem;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid #ffd700;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #ffd700;
  color: #000;
  transform: scale(1.05);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #b0b0b0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header h1 {
    font-size: 1.8rem;
  }

  .leaderboard-table th,
  .leaderboard-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }

  .progress {
    min-width: 100px;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
