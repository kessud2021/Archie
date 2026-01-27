/**
 * Archie Discord Bot
 * Main entry point
 *
 * A Discord bot for displaying Minecraft player statistics from ArchMC.
 * Supports multiple games and provides detailed stats images.
 */

import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ChatInputCommandInteraction,
  TextBasedChannel,
} from "discord.js";
import { registerFont } from "canvas";
import fs from "fs";
import path from "path";
import { log, sendLogToDiscord } from "./utils/logger.js";
import { getCommandDefinitions } from "./commands/register.js";
import { initDatabase } from "./db/init.js";
import { clearStaleCache } from "./db/client.js";
import {
  handleStatsCommand,
  handleQuickStatsCommand,
  handleLeaderboardCommand,
  handleDuelStatsCommand,
  handleEconomyCommand,
  handleLifestealCommand,
  handleMiscCommand,
  handleCompareCommand,
  handleReferCommand,
  handleInviteCommand,
  handleLinkCommand,
} from "./commands/handlers.js";

// ============================================================================
// ENVIRONMENT & CONFIG
// ============================================================================

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const CLIENT_ID = process.env.CLIENT_ID || "";
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || "";

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

initDatabase();
log("info", "✓ Data directory initialized");

// Clear stale cache every hour
setInterval(() => {
  clearStaleCache();
}, 60 * 60 * 1000);

// ============================================================================
// FONT REGISTRATION
// ============================================================================

const fontPath = path.resolve("./Minecraft.ttf");
if (!fs.existsSync(fontPath)) {
  log("error", `Font not found: ${fontPath}`);
  process.exit(1);
}
registerFont(fontPath, { family: "Minecraftia" });

// ============================================================================
// DISCORD CLIENT SETUP
// ============================================================================

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

let logChannel: TextBasedChannel | null = null;

// ============================================================================
// COMMAND REGISTRATION
// ============================================================================

/**
 * Register slash commands with Discord
 */
async function registerCommands(): Promise<void> {
  if (!BOT_TOKEN || !CLIENT_ID) {
    log("warn", "BOT_TOKEN or CLIENT_ID not set, skipping command registration");
    return;
  }

  try {
    const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);
    const commands = getCommandDefinitions();
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    log("info", "✓ Commands registered");
  } catch (err) {
    log("error", "Failed to register commands", err as Error);
    await sendLogToDiscord(logChannel, "error", "Failed to register commands", err as Error);
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Bot ready event
 */
client.on("ready", async (readyClient) => {
  log("info", `✓ Bot logged in as ${readyClient.user.tag}`);

  // Fetch log channel if configured
  if (LOG_CHANNEL_ID) {
    try {
      logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null) as TextBasedChannel;
    } catch {
      log("warn", "Could not fetch log channel");
    }
  }

  await registerCommands();
});

/**
 * Interaction create event
 * Routes slash commands to their handlers
 */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  try {
    switch (cmd) {
      case "stats":
        await handleStatsCommand(interaction, logChannel);
        break;
      case "quick-stats":
        await handleQuickStatsCommand(interaction, logChannel);
        break;
      case "leaderboard":
        await handleLeaderboardCommand(interaction, logChannel);
        break;
      case "compare":
        await handleCompareCommand(interaction, logChannel);
        break;
      case "duelstats":
        await handleDuelStatsCommand(interaction, logChannel);
        break;
      case "economy":
        await handleEconomyCommand(interaction, logChannel);
        break;
      case "lifesteal":
        await handleLifestealCommand(interaction, logChannel);
        break;
      case "misc":
        await handleMiscCommand(interaction, logChannel);
        break;
      case "refer":
        await handleReferCommand(interaction, logChannel);
        break;
      case "invite":
        await handleInviteCommand(interaction, logChannel);
        break;
      case "link":
        await handleLinkCommand(interaction, logChannel);
        break;
      default:
        await interaction.reply(`Unknown command: ${cmd}`);
    }
  } catch (err) {
    log("error", `Command error for /${cmd}`, err as Error);
    await sendLogToDiscord(logChannel, "error", `Command error for /${cmd}`, err as Error);
  }
});

/**
 * Error handlers
 */
client.on("error", (err) => {
  log("error", "Discord client error", err);
  sendLogToDiscord(logChannel, "error", "Discord client error", err);
});

process.on("unhandledRejection", (err) => {
  log("error", "Unhandled promise rejection", err as Error);
  sendLogToDiscord(logChannel, "error", "Unhandled promise rejection", err as Error);
});

// ============================================================================
// BOT LOGIN
// ============================================================================

if (!BOT_TOKEN) {
  log("error", "❌ BOT_TOKEN environment variable not set");
  process.exit(1);
}

log("info", "🚀 Starting bot...");
client.login(BOT_TOKEN);
