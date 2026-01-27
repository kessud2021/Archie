<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'

interface Props {
  guildName: string
}

const props = defineProps<Props>()

const loading = ref(true)
const error = ref('')
const members = ref<Array<{ username: string; role: string; joinDate: string }>>([])

const loadGuildData = async () => {
  try {
    loading.value = true
    error.value = ''
    // This would be replaced with actual API call
    // For now, placeholder data
    members.value = []
  } catch (err) {
    error.value = `Failed to load guild ${props.guildName}`
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadGuildData)
watch(() => props.guildName, loadGuildData)
</script>

<template>
  <div class="guild-container">
    <RouterLink to="/" class="back-btn">← Back</RouterLink>

    <div class="guild-header">
      <h1>{{ guildName }}</h1>
    </div>

    <div v-if="loading" class="loading">Loading guild data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="content">
      <div v-if="members.length > 0" class="members-list">
        <div class="members-header">
          <h2>Members</h2>
          <p>Total: {{ members.length }}</p>
        </div>
        <div class="members-grid">
          <div v-for="member in members" :key="member.username" class="member-card">
            <RouterLink :to="`/player/${member.username}`" class="member-link">
              <div class="member-avatar">
                <img
                  :src="`https://mc-heads.net/avatar/${member.username}/64`"
                  :alt="member.username"
                />
              </div>
              <div class="member-info">
                <div class="member-name">{{ member.username }}</div>
                <div class="member-role">{{ member.role }}</div>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
      <div v-else class="no-members">
        <p>No member data available for this guild.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guild-container {
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

.guild-header {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 255, 200, 0.05));
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  margin-bottom: 2rem;
}

.guild-header h1 {
  font-size: 2.5rem;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
  margin: 0;
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
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
  padding-bottom: 1rem;
}

.members-header h2 {
  color: #ffd700;
  margin: 0;
}

.members-header p {
  color: #b0b0b0;
  margin: 0;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.member-card {
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.member-card:hover {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
  transform: translateY(-5px);
}

.member-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
}

.member-avatar {
  margin-bottom: 1rem;
}

.member-avatar img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  border: 2px solid #ffd700;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.member-info {
  text-align: center;
  width: 100%;
}

.member-name {
  font-weight: bold;
  color: #fff;
  margin-bottom: 0.5rem;
  word-break: break-word;
  font-size: 0.9rem;
}

.member-role {
  color: #00ffff;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.no-members {
  text-align: center;
  padding: 3rem;
  color: #b0b0b0;
}

@media (max-width: 768px) {
  .guild-header h1 {
    font-size: 1.8rem;
  }

  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
