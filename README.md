# Archie Bot

A well-organized, maintainable Discord bot for displaying Minecraft player statistics from ArchMC.

## Project Structure

```
src/
├── api/                 # API clients for external services
│   ├── archmc.ts       # ArchMC API client
│   └── mojang.ts       # Mojang API client (Minecraft skins)
├── commands/           # Discord command handlers
│   ├── handlers.ts     # Command execution logic
│   └── register.ts     # Command definitions
├── config/             # Configuration constants
│   └── constants.ts    # Game mappings, colors, timeouts
├── rendering/          # Image generation
│   ├── canvas.ts       # Canvas drawing utilities
│   ├── stats.ts        # Stats image generator
│   ├── leaderboard.ts  # Leaderboard image generator
│   ├── duelStats.ts    # Duel stats image generator
│   ├── economy.ts      # Economy stats image generator
│   ├── lifesteal.ts    # Lifesteal stats image generator
│   ├── misc.ts         # Misc stats image generator
│   ├── compare.ts      # Player comparison image generator
│   └── index.ts        # Barrel exports
├── types/              # TypeScript type definitions
│   └── index.ts        # All types
├── utils/              # Utility functions
│   ├── cache.ts        # In-memory TTL cache
│   ├── logger.ts       # Logging and Discord logging
│   └── stats.ts        # Statistics helpers
└── index.ts            # Bot entry point
```

## Features

- **SQLite Database Caching**:
  - Persistent storage of player stats, leaderboards, economy data, lifesteal stats, and skins
  - Multi-layer caching: Memory → SQLite → API
  - Differential updates - only stores what changed
  - 2-minute TTL for cache freshness

- **8 Slash Commands**:
  - `/stats` - Full player statistics image
  - `/quick-stats` - Summary embed
  - `/leaderboard` - Game leaderboard image
  - `/duelstats` - Duel mode statistics
  - `/economy` - Economy stats with pagination
  - `/lifesteal` - Lifesteal stats with pagination
  - `/misc` - Miscellaneous stats with pagination
  - `/compare` - Player vs Player comparison

- **Beautiful Image Rendering**:
  - Glassmorphism design with neon colors
  - Rounded containers and borders
  - Progress bars and stat displays
  - Player skin integration

- **Robust Error Handling**:
  - Try-catch wrappers on all commands
  - Discord logging for errors
  - Graceful fallbacks

- **Performance Optimized**:
  - In-memory TTL cache for API responses
  - Configurable timeouts
  - Efficient image rendering

## Setup

### Prerequisites

- Node.js 18+ (for Node16 module resolution)
- npm
- Discord bot token
- ArchMC API key

### Project Structure

```
├── src/                    # TypeScript source code
│   ├── index.ts           # Bot entry point
│   ├── api/               # API clients
│   ├── commands/          # Command handlers
│   ├── db/                # Database layer
│   ├── rendering/         # Image generation
│   └── ...
├── dist/                   # Compiled JavaScript (auto-generated)
├── main.db                # SQLite database (auto-generated)
├── index.js               # Root entry point (delegates to dist/)
└── package.json
```

### Installation

```bash
npm install
```

### Development (with auto-rebuild)

```bash
npm run dev
```

This will compile TypeScript and start the bot.

### Build Only

```bash
npm run build
```

Outputs to `dist/` directory.

### Production Start

```bash
npm start
```

This automatically builds, then starts the bot.

### Environment Variables

Create a `.env` file:

```
BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_app_id
LOG_CHANNEL_ID=discord_channel_for_error_logs
API_BASE=https://api.arch.mc/v1
API_KEY=your_archmc_api_key
```

## Database Schema

SQLite database (`main.db`) with the following tables:

| Table | Purpose | Indexes |
|-------|---------|---------|
| `player_stats` | Cached player game statistics | username, updated_at |
| `leaderboards` | Cached leaderboard entries | stat_id |
| `economy_stats` | Cached economy/balance data | username |
| `lifesteal_stats` | Cached lifesteal statistics | username |
| `skins` | Cached Minecraft player skins | username |

**Cache TTL**: 2 minutes (configurable)  
**WAL Mode**: Enabled for better concurrency

## Code Organization

### API Layer (`src/api/`)

Handles all external API calls with caching:
- `archmc.ts` - Player stats, leaderboards, economy, lifesteal
- `mojang.ts` - Minecraft skin fetching

### Commands Layer (`src/commands/`)

Discord interaction handling:
- `register.ts` - Slash command definitions
- `handlers.ts` - Command execution logic with error handling

### Rendering Layer (`src/rendering/`)

Image generation:
- `canvas.ts` - Low-level canvas drawing functions
- Individual generators for each image type
- `index.ts` - Central exports

### Database Layer (`src/db/`)

SQLite database handling:
- `init.ts` - Database initialization and schema creation
- `client.ts` - CRUD operations with caching
  - `getCachedPlayerStats()` / `savePlayerStats()` - Differential storage
  - `getCachedLeaderboard()` / `saveLeaderboard()`
  - `getCachedEconomyData()` / `saveEconomyData()`
  - `getCachedLifestealStats()` / `saveLifestealStats()`
  - `getCachedSkin()` / `saveSkin()`
  - `clearStaleCache()` - Cleanup expired entries

### Utilities (`src/utils/`)

Helper functions:
- `cache.ts` - In-memory TTL caching (first layer)
- `logger.ts` - Console and Discord logging
- `stats.ts` - Statistics extraction helpers

### Types (`src/types/`)

TypeScript interfaces:
- PlayerData, LeaderboardData, etc.
- Ensures type safety across modules

### Config (`src/config/`)

Constants:
- Game stat mappings
- API timeouts
- Image colors and styling

## Caching Strategy

The bot uses a **3-layer caching system** for optimal performance:

```
Request → Memory Cache (1ms) → SQLite Cache (10ms) → API Call (500ms+)
```

### Layer 1: Memory Cache (`src/utils/cache.ts`)
- **Speed**: Fastest (in-process)
- **Scope**: Current process only
- **TTL**: 2 minutes
- **Use**: Immediate requests for same stat

### Layer 2: SQLite Cache (`src/db/client.ts`)
- **Speed**: Fast (disk I/O)
- **Scope**: Persistent across restarts
- **TTL**: 2 minutes
- **Use**: Bot restart survival, differential updates
- **Smart**: Only stores changed values

### Layer 3: API (`src/api/archmc.ts`)
- **Speed**: Slow (network)
- **Scope**: Source of truth
- **Hits**: Only when cache expired

**Example**: User requests stats for "player123"
1. Check memory (miss)
2. Check SQLite (hit) → return cached stats
3. Save to memory for next request

Next request 30 seconds later:
1. Check memory (hit) → return instantly
2. Skip SQLite, Skip API

## Development Tips

### Adding a New Command

1. Create handler in `src/commands/handlers.ts`
2. Add command definition in `src/commands/register.ts`
3. Add route in `src/index.ts` interactionCreate handler

### Adding a New Stat Display

1. Create generator in `src/rendering/`
2. Export from `src/rendering/index.ts`
3. Call from command handler

### Debugging

Enable verbose logging:

```bash
NODE_DEBUG=* npm run dev
```

## Dependencies

- `discord.js` - Discord API
- `canvas` - Image rendering
- `node-fetch` - HTTP requests
- `dotenv` - Environment variables

## License

Proprietary - Archie Bot

## Author

Archie Bot
