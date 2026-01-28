<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <RouterLink to="/" class="logo">
          ⛏ Archie
        </RouterLink>
        <ul class="nav-links">
          <li>
            <RouterLink to="/">Home</RouterLink>
          </li>
          <li class="dropdown">
            <span>Leaderboards</span>
            <div class="dropdown-menu">
              <RouterLink to="/leaderboards/wins:bedwars:global:lifetime">Bedwars</RouterLink>
              <RouterLink to="/leaderboards/wins:skywars:global:lifetime">SkyWars</RouterLink>
              <RouterLink to="/leaderboards/wins:bridges:global:lifetime">Bridges</RouterLink>
              <RouterLink to="/leaderboards/wins:stickfight:global:lifetime">Stickfight</RouterLink>
              <RouterLink to="/leaderboards/wins:sumo:global:lifetime">Sumo</RouterLink>
              <RouterLink to="/leaderboards/wins:builduhc:global:lifetime">BuildUHC</RouterLink>
            </div>
          </li>
        </ul>
      </div>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="footer">
      <p>&copy; 2025 Archie Stats - Arch MC Statistics Viewer</p>
    </footer>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 100%);
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.navbar {
  background: rgba(15, 12, 41, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  border-bottom: 2px solid #ffd700;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffd700;
  text-decoration: none;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.1);
  text-shadow: 0 0 10px #ffd700;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a,
.nav-links span {
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
  cursor: pointer;
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #ffd700;
  transition: width 0.3s ease;
}

.nav-links a:hover::after,
.nav-links a.router-link-active::after {
  width: 100%;
}

.nav-links a:hover,
.nav-links span:hover {
  color: #ffd700;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(15, 12, 41, 0.98);
  border: 1px solid #ffd700;
  border-top: none;
  border-radius: 0 0 8px 8px;
  min-width: 200px;
  flex-direction: column;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.dropdown:hover .dropdown-menu {
  display: flex;
}

.dropdown-menu a {
  padding: 0.75rem 1.5rem;
  display: block;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
}

.dropdown-menu a:hover {
  background: rgba(255, 215, 0, 0.1);
  padding-left: 2rem;
}

.main-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.footer {
  background: rgba(15, 12, 41, 0.95);
  border-top: 2px solid #ffd700;
  padding: 2rem;
  text-align: center;
  margin-top: auto;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }

  .nav-links {
    gap: 1rem;
    font-size: 0.9rem;
  }

  .logo {
    font-size: 1.4rem;
  }

  .dropdown-menu {
    position: static;
    display: none;
    background: rgba(48, 43, 99, 0.95);
    border: none;
    border-radius: 0;
  }

  .dropdown:hover .dropdown-menu {
    display: flex;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
