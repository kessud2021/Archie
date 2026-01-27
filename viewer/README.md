# Archie Stats Viewer

A comprehensive Vue.js web application for viewing Arch MC statistics, leaderboards, and player profiles.

## Features

✨ **Complete Statistics Viewer**
- Global leaderboards for all games (Bedwars, SkyWars, Bridges, Stickfight, Sumo, BuildUHC)
- Top 5 players on homepage for quick view
- Pagination support for full leaderboards
- Search and browse player profiles

👤 **Player Profiles**
- Detailed statistics for individual players
- Minecraft skin display
- Economy data (coins, tokens, etc.)
- Statistics breakdown by game mode
- Player rankings and percentiles

🏆 **Leaderboards**
- Game-specific leaderboards with ranking
- Medal indicators (#1, #2, #3)
- Win counts and progress bars
- Paginated results (100 entries per page)
- Clickable player links to profiles

🎨 **Modern Design**
- Dark theme with gold accents
- Responsive layout (desktop and mobile)
- Smooth animations and transitions
- Minecraft-inspired aesthetics

## Setup

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Copy `.env.local` and update with your API credentials:
   ```bash
   VITE_API_BASE=https://api.arch.mc/v1
   VITE_API_KEY=your_api_key_here
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```
   
   The built files will be in the `dist/` folder

## Project Structure

```
src/
├── api/
│   └── archmc.ts          # API client for ArchMC
├── views/
│   ├── Home.vue           # Homepage with top players
│   ├── Leaderboards.vue   # Leaderboard pages
│   ├── PlayerProfile.vue  # Individual player stats
│   └── GuildLeaderboard.vue # Guild member list
├── router/
│   └── index.ts           # Vue Router configuration
├── assets/
│   └── styles/
│       └── main.css       # Global styles
├── App.vue                # Root component
└── main.ts                # Entry point
```

## Routes

- `/` - Homepage with top players across games
- `/leaderboards/:stat` - Leaderboard for a specific game (e.g., `/leaderboards/bedwars_wins`)
- `/player/:username` - Player profile page
- `/guilds/:guildName` - Guild member list

## Supported Games

- Bedwars
- SkyWars
- Bridges
- Stickfight
- Sumo
- BuildUHC
- Boxing
- NoDebuff
- Pearl
- Soup
- Spleef
- Gapple
- Combo
- Bedfight

## API Integration

The app uses the ArchMC API v1 with the following endpoints:

- `GET /players/username/{username}/statistics` - Player stats
- `GET /leaderboards/{statId}` - Leaderboard data
- `GET /economy/player/username/{username}` - Economy data
- `GET /ugc/trojan/players/username/{username}/statistics` - Lifesteal stats

## Features in Detail

### Home Page
- Displays top 5 players from each major game
- Quick links to full leaderboards
- Clickable player names that link to profiles

### Leaderboards
- 100 entries per page
- Pagination controls
- Rank medals for top 3
- Progress bars showing relative performance
- Sort indicators and player counts

### Player Profiles
- Minecraft skin (128x128)
- Overall player statistics
- Game-by-game breakdown with wins, kills, deaths
- Economy information (coins, tokens)
- Ranking information where available

## Performance

- Responsive design works on mobile, tablet, and desktop
- Smooth animations and transitions
- Optimized images (Minecraft skins from mc-heads.net)
- Efficient API caching (via backend)

## Styling

The app uses a modern dark theme with:
- Primary gold color: `#ffd700`
- Secondary cyan color: `#00ffff`
- Dark background with gradient
- Glass-morphism effects with blur

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Development

### Available Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Code Style

- Vue 3 Composition API with TypeScript
- Scoped styles for component isolation
- Responsive CSS Grid and Flexbox layouts
- ESM imports for better tree-shaking

## Deployment

### Deploy to Netlify/Vercel

1. Build the project: `npm run build`
2. Deploy the `dist/` folder
3. Set environment variables in deployment platform

### Docker (optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Future Enhancements

- [ ] Guild statistics and member ranking
- [ ] Player comparison tool
- [ ] Statistics trends/graphs
- [ ] Search functionality
- [ ] Favorite players/guilds
- [ ] Dark/Light theme toggle
- [ ] Export statistics as images
- [ ] Real-time updates with WebSocket

## License

MIT

## Credits

- Built with Vue 3, TypeScript, and Vite
- Stats from Arch MC API
- Minecraft skins from mc-heads.net
