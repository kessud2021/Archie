# Quick Start Guide

## 1. Setup (5 minutes)

### Install Dependencies
```bash
npm install
```

### Create `.env` File
```
BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_app_id
LOG_CHANNEL_ID=discord_channel_id_for_logs
API_BASE=https://api.arch.mc/v1
API_KEY=your_archmc_api_key
```

### Start the Bot
```bash
npm start
```

This will:
1. Compile TypeScript → `dist/`
2. Initialize SQLite database → `main.db`
3. Register Discord slash commands
4. Login and wait for commands

You should see:
```
[...] INFO: ✓ Database initialized
[...] INFO: ✓ Bot logged in as ArchStats#4757
[...] INFO: ✓ Commands registered
```

## 2. Test Commands

In Discord:
```
/stats player USERNAME           → Full stats image
/quick-stats player USERNAME     → Quick summary
/leaderboard game bedwars        → Top 10 players
/duelstats player USERNAME       → Duel mode stats
/economy player USERNAME         → Economy stats
/lifesteal player USERNAME       → Lifesteal stats
/misc player USERNAME            → Other stats
/compare player1 USERNAME1 player2 USERNAME2  → Head-to-head
```

## 3. Development

### Auto-rebuild on Changes
```bash
npm run dev
```

This compiles TypeScript and runs bot. Restart to pick up changes.

### Just Build
```bash
npm run build
```

Outputs compiled code to `dist/`.

## 4. What's Happening

### On First Request
```
User: /stats KessudMC
  ↓
Check Memory Cache (miss)
  ↓
Check SQLite DB (miss)
  ↓
Call ArchMC API (500ms)
  ↓
Save to SQLite (differential update)
  ↓
Save to Memory
  ↓
Generate image
  ↓
Send to Discord
```

### On Second Request (30 seconds later)
```
User: /stats KessudMC
  ↓
Check Memory Cache (HIT!) ← 1ms response
  ↓
Return instantly
```

### After Bot Restart
```
User: /stats KessudMC
  ↓
Check Memory Cache (miss - process restarted)
  ↓
Check SQLite DB (HIT!) ← 10ms response
  ↓
Return from disk cache
```

## 5. Check Database

```bash
sqlite3 main.db
```

```sql
-- How many players cached?
SELECT COUNT(*) FROM player_stats;

-- When was KessudMC last updated?
SELECT datetime(updated_at/1000, 'unixepoch') 
FROM player_stats 
WHERE username = 'KessudMC';

-- Exit
.quit
```

## 6. Monitoring

### Check Bot Logs
```
[timestamp] INFO: Command executed
[timestamp] ERROR: API error (500)
```

Look for:
- `✓ Database initialized` - DB is working
- `✓ Bot logged in` - Connected to Discord
- `✓ Commands registered` - Ready for use
- `[DB] Updated N stat(s)` - Cache was refreshed

### Common Issues

**"Bot not responding to commands"**
- Check slash commands registered: `✓ Commands registered` in logs
- Make sure bot has permissions in Discord server
- Try `/` in chat to see available commands

**"Database locked"**
- Usually doesn't happen (WAL mode enabled)
- Try restarting: `npm start`

**"API key invalid"**
- Check `API_KEY` in `.env`
- Check `API_BASE` is correct

**"Minecraft font not found"**
- Verify `Minecraft.ttf` exists in root directory
- Check file permissions

## 7. Code Overview

### Structure
```
src/
├── api/          ← Fetch data from ArchMC & Mojang
├── db/           ← SQLite caching
├── commands/     ← Discord interaction handlers
├── rendering/    ← Image generation
├── utils/        ← Helpers (logging, caching, stats)
└── config/       ← Constants & game mappings
```

### Adding a Feature

1. **New command?** → `src/commands/handlers.ts`
2. **New API endpoint?** → `src/api/archmc.ts`
3. **New image type?** → `src/rendering/`
4. **New utility?** → `src/utils/`

## 8. Deployment

### Docker (example)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

### Environment on Server
```bash
# Clone repo
git clone <repo>
cd discordbot

# Install & build
npm install
npm run build

# Create .env
echo "BOT_TOKEN=..." > .env
echo "CLIENT_ID=..." >> .env
# ... etc

# Run forever with PM2
npm install -g pm2
pm2 start dist/index.js --name "archstats-bot"
pm2 startup
pm2 save
```

## 9. Further Reading

- [README.md](./README.md) - Full documentation
- [DATABASE.md](./DATABASE.md) - Database & caching details
- [MIGRATION.md](./MIGRATION.md) - What changed from old version

## 10. Support

### Debug Mode
Add to `.env`:
```
DEBUG=*
```

### Check TypeScript Errors
```bash
npm run build
```

Will show any type/compilation errors.

### View All Commands
```typescript
// src/commands/register.ts
```

---

**Ready?** Run `npm start` and test in Discord! 🚀
