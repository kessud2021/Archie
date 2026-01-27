# AGENTS.md

## Build & Run Commands

- **Start bot**: `node index.js`
- **Install dependencies**: `npm install`
- **No linting/testing setup** - simple bot with no test framework

## Architecture

**Single-file Discord bot** (index.js) with two main commands:

### `/stats {username}` Command
- Fetches detailed player statistics from ArchMC API
- Generates 1000x750 canvas image with:
  - Player skin (8x8 from Minecraft texture)
  - Username header
  - Detailed Bedwars section (wins, kills, deaths, WLR, ELO)
  - Game overview for 6 games (Stickfight, Sumo, BuildUHC, SkyWars, Bridges, Bedfight)
  - Color-coded progress bars scaled to meaningful maximums

### `/leaderboard {game}` Command
- Supports 14 games: Bedwars, SkyWars, Bridges, Stickfight, Sumo, BuildUHC, Bedfight, Boxing, NoDebuff, Pearl, Soup, Spleef, Gapple, Combo
- Generates 900x800 canvas image with:
  - Game title header
  - Column headers (Rank, Player, Wins)
  - Top 10 leaderboard entries with:
    - Colored rank (#1=Gold, #2=Silver, #3=Bronze)
    - Player username
    - Win count with visual bar
  - Alternating row backgrounds for readability
  - Total player count footer

### Core Features
- **API Integration**: ArchMC API for stats/leaderboards, Mojang API for skins
- **Caching**: 2-minute TTL in-memory cache for API responses
- **Skin Handling**: Fetches from Mojang, falls back to `steve.png`
- **Error Handling**: Comprehensive try-catch with graceful user messages
- **Timeouts**: AbortController with 10s API, 5s skin timeout

## Code Style

- **ES Modules** with arrow functions and destructuring
- **Error handling**: Try-catch with graceful Discord replies; console.error for diagnostics
- **Functions**: Helper functions for drawing (drawText, drawBox, drawBar), stat extraction (getStat), separate handlers per command
- **Comments**: Section dividers for major blocks (`/* --- Section --- */`)
- **Canvas API**: Context drawing with alpha transparency, progress bars, colored boxes, alternating rows
- **API Integration**: fetchFromArch() with AbortController timeouts, getLeaderboard() function
- **Validation**: Username length checks (3-16 chars), game name validation via GAME_STAT_MAP

## Environment Variables

- `BOT_TOKEN`: Discord bot token
- `CLIENT_ID`: Discord application ID  
- `API_BASE`: ArchMC API base URL (https://api.arch.mc/v1)
- `API_KEY`: ArchMC API authentication key
