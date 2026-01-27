# SQLite Database Implementation

## Overview

The ArchStats bot uses SQLite (`main.db`) for persistent, differential caching of API responses.

## Key Features

### 🚀 Multi-Layer Caching
1. **Memory Cache** - In-process, ultra-fast (1ms)
2. **SQLite Database** - Persistent, differential updates (10ms)
3. **API Calls** - Network source of truth (500ms+)

### 💾 Differential Storage
Only changed stats are stored in the database. The system calculates what changed between old and new data:

```typescript
const oldStats = { kills: 100, deaths: 50 };
const newStats = { kills: 105, deaths: 50 };
const diff = { kills: 105 }; // Only this gets stored
```

### ⏱️ Cache Expiration
- TTL: 2 minutes (configurable via `CACHE_TTL` in `src/config/constants.ts`)
- Stale entries are purged on startup

### 🔄 WAL Mode
- Write-Ahead Logging enabled for better concurrency
- Allows concurrent reads while writes happen
- Better for bot with multiple commands in flight

## Database Schema

### player_stats
```sql
CREATE TABLE player_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  stats_json TEXT NOT NULL,        -- Full player statistics
  updated_at INTEGER NOT NULL,      -- Unix timestamp
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_username ON player_stats(username);
CREATE INDEX idx_updated_at ON player_stats(updated_at);
```

### leaderboards
```sql
CREATE TABLE leaderboards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_id TEXT UNIQUE NOT NULL,     -- e.g., "wins:bedwars:global:lifetime"
  entries_json TEXT NOT NULL,       -- Leaderboard entries array
  updated_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_stat_id ON leaderboards(stat_id);
```

### economy_stats
```sql
CREATE TABLE economy_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  balances_json TEXT NOT NULL,      -- User balances object
  updated_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_economy_username ON economy_stats(username);
```

### lifesteal_stats
```sql
CREATE TABLE lifesteal_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  stats_json TEXT NOT NULL,         -- Lifesteal statistics
  updated_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_lifesteal_username ON lifesteal_stats(username);
```

### skins
```sql
CREATE TABLE skins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  skin_url TEXT NOT NULL,           -- Minecraft skin URL
  updated_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_skin_username ON skins(username);
```

## API Integration

### Modified Files
- `src/api/archmc.ts` - All endpoints now check DB first
- `src/api/mojang.ts` - Skin caching added

### Cache Flow Example

```typescript
// getPlayerStats(username)
1. Check memory cache → found? return
2. Check SQLite → found + fresh? return
3. API call → fetch from server
4. Save to SQLite → calculateDiff(old, new)
5. Return full stats
6. Log which stats changed (diff)
```

## Client Functions

All functions are in `src/db/client.ts`:

### Player Stats
```typescript
getCachedPlayerStats(username: string)   // Returns { stats, isFresh }
savePlayerStats(username: string, stats) // Returns differential object
getStatsDiff(username: string, newStats) // Calculate change
```

### Leaderboards
```typescript
getCachedLeaderboard(statId: string)     // Returns { data, isFresh }
saveLeaderboard(statId: string, data)    // Stores entries
```

### Economy
```typescript
getCachedEconomyData(username: string)   // Returns { data, isFresh }
saveEconomyData(username: string, data)  // Stores balances
```

### Lifesteal
```typescript
getCachedLifestealStats(username: string)   // Returns { stats, isFresh }
saveLifestealStats(username: string, stats) // Stores stats
```

### Skins
```typescript
getCachedSkin(username: string)          // Returns { url, isFresh }
saveSkin(username: string, skinUrl)      // Stores URL
```

### Utilities
```typescript
clearStaleCache()  // Purge expired entries
```

## Performance Impact

### Before SQLite
```
First request:  API call (500ms)
Second request: Memory cache (1ms)
After restart:  API call (500ms)
```

### After SQLite
```
First request:  API call (500ms) + save to DB
Second request: Memory cache (1ms)
After restart:  SQLite cache (10ms) + memory cache
```

**Result**: ~50x faster for post-restart requests!

## Monitoring

### View Database
```bash
# Using sqlite3 CLI
sqlite3 main.db

# List tables
.tables

# Check cache size
SELECT COUNT(*) FROM player_stats;
SELECT COUNT(*) FROM leaderboards;

# View cache age
SELECT username, datetime(updated_at/1000, 'unixepoch') 
FROM player_stats LIMIT 10;
```

### Log Messages
The bot logs when cache is used:
```
[DB] Updated 5 stat(s) for player123
```

This means 5 statistics changed from the previous request.

## Future Enhancements

- [ ] Periodic cache cleanup job
- [ ] Cache statistics (hit/miss ratio)
- [ ] Compression for large JSON blobs
- [ ] Database backup before updates
- [ ] Analytics on cache effectiveness

## Troubleshooting

### Database locked?
- WAL mode is enabled, shouldn't happen
- If persistent: delete `main.db-wal` and `main.db-shm`

### Cache not updating?
- Check `updated_at` timestamp is recent
- Verify TTL hasn't elapsed
- Check logs for API errors

### Large database file?
- Run `VACUUM` to reclaim space
- Clear old entries manually
- Check if JSON fields are too large

### Slow queries?
- Verify indexes exist (check schema)
- Run `ANALYZE` to update statistics
- Consider partitioning by date
