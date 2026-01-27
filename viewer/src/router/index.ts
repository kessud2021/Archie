import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import Home from '../views/Home.vue'
import Leaderboards from '../views/Leaderboards.vue'
import PlayerProfile from '../views/PlayerProfile.vue'
import GuildLeaderboard from '../views/GuildLeaderboard.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/leaderboards/:stat',
    name: 'Leaderboards',
    component: Leaderboards,
    props: true,
  },
  {
    path: '/player/:username',
    name: 'PlayerProfile',
    component: PlayerProfile,
    props: true,
  },
  {
    path: '/guilds/:guildName',
    name: 'GuildLeaderboard',
    component: GuildLeaderboard,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
