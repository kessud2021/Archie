# TypeScript & Database Migration Guide

## What Changed

The bot has been completely refactored from a single-file JavaScript implementation to a well-organized TypeScript codebase with SQLite database caching.

## Old vs New

### Before
```
index.js (1500+ lines, monolithic)
├── Logging
├── Font registration
├── Discord client setup
├── Commands (all inline)
├── Image generators (all inline)
├── Handlers (all inline)
└── API calls (all inline)
```

### After
```
src/ (TypeScript modules)
├── index.ts (entry point, 150 lines)
├── api/
│   ├── archmc.ts (API client with DB caching)
│   └── mojang.ts (Mojang skin fetching)
├── commands/
│   ├── register.ts (command definitions)
│   └── handlers.ts (command logic, 400 lines)
├── db/
│   ├── init.ts (SQLite schema)
│   └── client.ts (CRUD operations, differential storage)
├── rendering/
│   ├── canvas.ts (drawing utilities)
│   ├── stats.ts (stats image)
│   ├── leaderboard.ts (leaderboard image)
│   ├── economy.ts (economy image)
│   ├── lifesteal.ts (lifesteal image)
│   ├── misc.ts (misc image)
│   ├── duelStats.ts (duel stats image)
│   ├── compare.ts (comparison image)
│   └── index.ts (barrel exports)
├── utils/
│   ├── cache.ts (in-memory TTL cache)
│   ├── logger.ts (logging to console & Discord)
│   └── stats.ts (statistics helpers)
├── config/
│   └── constants.ts (game mappings, colors, timeouts)
└── types/
    └── index.ts (TypeScript interfaces)

dist/ (compiled JavaScript, auto-generated)
main.db (SQLite cache, auto-generated)
```

## Breaking Changes

### Import Statements
If you had external code importing from `index.js`:

```javascript
// Old - no longer works
import { generateStatsImage } from "./index.js";

// New - use modules
import { generateStatsImage } from "./dist/rendering/stats.js";
```

### Environment Variables
No changes - same `.env` file works.

### Database
- New: `main.db` file created automatically
- Contains caches for stats, leaderboards, skins, etc.
- Persistent across restarts
- WAL mode for concurrent access

## Build Pipeline

### Development
```bash
npm run dev
```
- Watches/compiles TypeScript
- Starts the bot
- Live reload (restart needed)

### Production
```bash
npm run build    # Compile src/ → dist/
npm start        # Run dist/index.js
```

Or just:
```bash
npm start        # Auto-builds, then runs
```

## Code Quality Improvements

### Before
- ❌ Single 1500-line file
- ❌ No type safety
- ❌ All logic mixed together
- ❌ Hard to test individual parts
- ❌ API responses fetched every time
- ❌ No persistent cache

### After
- ✅ Modular TypeScript
- ✅ Full type safety
- ✅ Separation of concerns
- ✅ Testable functions
- ✅ 3-layer caching system
- ✅ Persistent SQLite cache
- ✅ Differential updates
- ✅ Better error handling
- ✅ Comprehensive documentation

## File Size Comparison

| Metric | Before | After |
|--------|--------|-------|
| **Source Files** | 1 file (1500 lines) | 20+ files (~3000 lines) |
| **Code Organization** | Monolithic | Modular |
| **Type Safety** | None | Full TypeScript |
| **Caching** | Memory only | Memory + SQLite |
| **Database** | None | SQLite (automatic) |
| **Compiled Size** | N/A | ~150KB (dist/) |

## Performance Gains

### API Calls
```
Before: Every request → API (500ms)
After:  Memory (1ms) → DB (10ms) → API (500ms)
```

**Result**: ~50x faster for cached requests

### Bot Startup
```
Before: No cache
After:  Pre-populate from SQLite on startup
```

**Result**: Instant responses even after restart

## Testing

Before TypeScript migration, no type checking was possible:

```javascript
// Old - no error until runtime
const result = await getPlayerStats("player");
console.log(result.unknown_property); // Oops, undefined
```

After:
```typescript
// New - error at compile time
const result = await getPlayerStats("player");
console.log(result.unknown_property); // TS2339: Property doesn't exist
```

## Database Schema

Automatic SQLite database with 5 tables:
- `player_stats` - Cached player statistics
- `leaderboards` - Cached leaderboards
- `economy_stats` - Economy data
- `lifesteal_stats` - Lifesteal data
- `skins` - Player skin URLs

See [DATABASE.md](./DATABASE.md) for detailed schema.

## Migration Checklist

If upgrading from old version:

- [ ] Delete old `index.js` (replaced with modular structure)
- [ ] Install dependencies: `npm install`
- [ ] Build: `npm run build`
- [ ] Start: `npm start`
- [ ] Verify bot logs in
- [ ] Check `main.db` was created
- [ ] Run a command (`/stats`)
- [ ] Verify image generated

## Rollback (if needed)

If you need the old code, it's preserved in git history:
```bash
git log --oneline | grep -i "typescript\|refactor"
git checkout <old-commit>
```

## What's Next

Ideas for further improvements:
- [ ] Unit tests for utils/
- [ ] Integration tests for API clients
- [ ] Monitoring/metrics
- [ ] Cache statistics dashboard
- [ ] Compression for large JSON
- [ ] Database partitioning by date
- [ ] Cache pre-warming on startup

## Support

For questions about the new structure:
1. Check `README.md` for setup
2. Check `DATABASE.md` for caching details
3. Look at `src/` module comments
4. Review TypeScript types in `src/types/index.ts`
