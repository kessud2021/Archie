import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

// Import bot utilities for consistent behavior
import { getCacheStats } from './api/archmc'
import { formatNumber } from './utils/stats'

const app = createApp(App)

// Make utilities available globally (optional - for debugging)
if (import.meta.env.DEV) {
  ;(window as any).__archie = {
    cache: getCacheStats,
    formatNumber,
  }
}

app.use(router)
app.mount('#app')
