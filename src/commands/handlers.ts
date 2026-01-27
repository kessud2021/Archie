/**
 * Discord slash command handlers
 * Processes user interactions and generates responses
 */

import { ChatInputCommandInteraction, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { getPlayerStats, getLeaderboard, getEconomyData, getLifestealStats } from "../api/archmc.js";
import { getMinecraftSkin } from "../api/mojang.js";
import { log, sendLogToDiscord } from "../utils/logger.js";
import { getStat, extractBedwarsStats } from "../utils/stats.js";
import { linkDiscordToMinecraft, getLinkedMinecraftUsername, isLinked } from "../utils/discord-links.js";
import { GAME_STAT_MAP, DUEL_MODES } from "../config/constants.js";
import {
  generateStatsImage,
  generateLeaderboardImage,
  generateDuelStatsImage,
  generateEconomyImage,
  generateLifestealImage,
  generateMiscImage,
  generateCompareImage,
} from "../rendering/index.js";

/**
 * /stats command - Full player statistics image
 */
export async function handleStatsCommand(
  interaction: ChatInputCommandInteraction,
  logChannel: any
): Promise<void> {
  const username = interaction.options.getString("player", true);

  if (!username || username.length > 16 || username.length < 3) {
    await interaction.reply("Username must be 3-16 characters.");
    return;
  }

  try {
    await interaction.deferReply();

    const [playerData, skinURL] = await Promise.all([
      getPlayerStats(username),
      getMinecraftSkin(username),
    ]);

    if (!playerData?.statistics || Object.keys(playerData.statistics).length === 0) {
      await interaction.editReply(`No stats found for **${username}**.`).catch(() => {});
      return;
    }

    const buffer = await generateStatsImage(username, playerData, skinURL);
    const attachment = new AttachmentBuilder(buffer, { name: "stats.png" });
    await interaction.editReply({ files: [attachment] }).catch(() => {});
  } catch (err) {
    log("error", `Stats error for ${username}`, err as Error);
    await sendLogToDiscord(logChannel, "error", `Stats error for ${username}`, err as Error);
    await interaction.editReply(
      `Error: ${(err as Error).message.substring(0, 80)}`
    ).catch(() => {});
  }
}

/**
 * /quick-stats command - Summary embed
 */
export async function handleQuickStatsCommand(
  interaction: ChatInputCommandInteraction,
  logChannel: any
): Promise<void> {
  const username = interaction.options.getString("player", true);

  if (!username || username.length > 16 || username.length < 3) {
    await interaction.reply("Username must be 3-16 characters.");
    return;
  }

  try {
    await interaction.deferReply();

    const playerData = await getPlayerStats(username);

    if (!playerData?.statistics || Object.keys(playerData.statistics).length === 0) {
      await interaction.editReply(`No stats found for **${username}**.`).catch(() => {});
      return;
    }

    const stats = playerData.statistics;
    const bedwars = getStat(stats, "wins:bedwars:global:lifetime");
    const skywars = getStat(stats, "wins:skywars:global:lifetime");
    const bridges = getStat(stats, "wins:bridges:global:lifetime");
    const stickfight = getStat(stats, "wins:stickfight:global:lifetime");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Archie — ${username}`)
      .addFields(
        { name: "Bedwars", value: `\`${bedwars.value}\` wins`, inline: true },
        { name: "SkyWars", value: `\`${skywars.value}\` wins`, inline: true },
        { name: "Bridges", value: `\`${bridges.value}\` wins`, inline: true },
        { name: "Stickfight", value: `\`${stickfight.value}\` wins`, inline: true }
      )
      .setFooter({ text: "Archie" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] }).catch(() => {});
  } catch (err) {
    log("error", `Quick stats error for ${username}`, err as Error);
    await sendLogToDiscord(logChannel, "error", `Quick stats error for ${username}`, err as Error);
    await interaction.editReply(
      `Error: ${(err as Error).message.substring(0, 80)}`
    ).catch(() => {});
  }
}

/**
 * /leaderboard command - Game leaderboard image
 */
export async function handleLeaderboardCommand(
  interaction: ChatInputCommandInteraction,
  logChannel: any
): Promise<void> {
  const game = interaction.options.getString("game", true);

  if (!GAME_STAT_MAP[game]) {
    await interaction.reply(`Unknown game: ${game}`);
    return;
  }

  try {
    await interaction.deferReply();

    const statId = GAME_STAT_MAP[game];
    const leaderboardData = await getLeaderboard(statId, 0, 10);

    if (!leaderboardData?.entries) {
      await interaction.editReply(`No leaderboard data found for **${game}**.`).catch(() => {});
      return;
    }

    const gameName = game.charAt(0).toUpperCase() + game.slice(1);
    const buffer = await generateLeaderboardImage(gameName, leaderboardData);
    const attachment = new AttachmentBuilder(buffer, { name: "leaderboard.png" });

    await interaction.editReply({ files: [attachment] }).catch(() => {});
  } catch (err) {
    log("error", `Leaderboard error for ${game}`, err as Error);
    await sendLogToDiscord(logChannel, "error", `Leaderboard error for ${game}`, err as Error);
    await interaction.editReply(
      `Error: ${(err as Error).message.substring(0, 80)}`
    ).catch(() => {});
  }
}

/**
 * /duelstats command - Duel stats image
 */
export async function handleDuelStatsCommand(
  interaction: ChatInputCommandInteraction,
  logChannel: any
): Promise<void> {
  const username = interaction.options.getString("player", true);

  if (!username || username.length > 16 || username.length < 3) {
    await interaction.reply("Username must be 3-16 characters.");
    return;
  }

  try {
    await interaction.deferReply();

    const playerData = await getPlayerStats(username);

    if (!playerData?.statistics || Object.keys(playerData.statistics).length === 0) {
      await interaction.editReply(`No stats found for **${username}**.`).catch(() => {});
      return;
    }

    const buffer = await generateDuelStatsImage(username, playerData);
    const attachment = new AttachmentBuilder(buffer, { name: "duelstats.png" });
    await interaction.editReply({ files: [attachment] }).catch(() => {});
  } catch (err) {
    log("error", `Duel stats error for ${username}`, err as Error);
    await sendLogToDiscord(logChannel, "error", `Duel stats error for ${username}`, err as Error);
    await interaction.editReply(
      `Error: ${(err as Error).message.substring(0, 80)}`
    ).catch(() => {});
  }
}

/**
 * /economy command - Economy stats with pagination
 */
export async function handleEconomyCommand(
  interaction: ChatInputCommandInteraction,
  logChannel: any
): Promise<void> {
  const username = interaction.options.getString("player", true);
  const page = interaction.options.getInteger("page") || 1;

  if (!username || username.length > 16 || username.length < 3) {
    await interaction.reply("Username must be 3-16 characters.");
    return;
  }

  try {
    await interaction.deferReply();

    const economyData = await getEconomyData(username);
    if (!economyData) {
      await interaction.editReply(`No economy data found for **${username}**.`).catch(() => {});
      return;
    }

    const balances = economyData.balances || {};
    const economyStats = Object.keys(balances).map((k) => ({
      label: k.replace(/[_-]/g, " ").substring(0, 40).toUpperCase(),
      value: balances[k],
    }));

    if (economyStats.length === 0) {
      await interaction.editReply(`No economy stats found for **${username}**.`).catch(() => {});
      return;
    }

    const buffer = await generateEconomyImage(username, economyStats, page);
    const attachment = new AttachmentBuilder(buffer, { name: "economy.png" });
    await interaction.editReply({ files: [attachment] }).catch(() => {});
  } catch (err) {
    log("error", `Economy error for ${username}`, err as Error);
    await sendLogToDiscord(logChannel, "error", `Economy error for ${username}`, err as Error);
    await interaction.editReply(
      `Error: ${(err as Error).message.substring(0, 80)}`
    ).catch(() => {});
  }
}

/**
 * /lifesteal command - Lifesteal stats with pagination
 */
export async function handleLifestealCommand(
  interaction: ChatInputCommandInteraction,
  logChannel: any
): Promise<void> {
  const username = interaction.options.getString("player", true);
  const page = interaction.options.getInteger("page") || 1;

  if (!username || username.length > 16 || username.length < 3) {
    await interaction.reply("Username must be 3-16 characters.");
    return;
  }

  try {
    await interaction.deferReply();

    const lifestat = await getLifestealStats(username);
    const statEntries = Object.keys(lifestat)
      .map((k) => {
        const rawValue = lifestat[k];
        // Ensure value is a number
        const value = typeof rawValue === "number" ? rawValue : (typeof rawValue === "object" && rawValue !== null && "value" in rawValue ? (rawValue as any).value : 0);
        return { label: k.replace(/[_-]/g, " ").substring(0, 40).toUpperCase(), value };
      })
      .sort((a, b) => b.value - a.value);

    if (statEntries.length === 0) {
      await interaction.editReply(`No lifesteal stats found for **${username}**.`).catch(() => {});
      return;
    }

    const buffer = await generateLifestealImage(username, statEntries, page);
    const attachment = new AttachmentBuilder(buffer, { name: "lifesteal.png" });
    await interaction.editReply({ files: [attachment] }).catch(() => {});
  } catch (err) {
    log("error", `Lifesteal error for ${username}`, err as Error);
    await sendLogToDiscord(logChannel, "error", `Lifesteal error for ${username}`, err as Error);
    await interaction.editReply(
      `Error: ${(err as Error).message.substring(0, 80)}`
    ).catch(() => {});
  }
}

/**
 * /misc command - Miscellaneous stats with pagination
 */
export async function handleMiscCommand(
  interaction: ChatInputCommandInteraction,
  logChannel: any
): Promise<void> {
  const username = interaction.options.getString("player", true);
  const page = interaction.options.getInteger("page") || 1;

  if (!username || username.length > 16 || username.length < 3) {
    await interaction.reply("Username must be 3-16 characters.");
    return;
  }

  try {
    await interaction.deferReply();

    const playerData = await getPlayerStats(username);
    if (!playerData?.statistics) {
      await interaction.editReply(`No stats found for **${username}**.`).catch(() => {});
      return;
    }

    const stats = playerData.statistics;
    const miscStats = Object.keys(stats)
      .filter(
        (k) =>
          !k.includes("bw_") &&
          !k.includes("sw_") &&
          !k.includes("balance") &&
          !k.includes("coins") &&
          !k.includes("gems") &&
          !k.includes("custom:") &&
          !k.includes("elo:")
      )
      .map((k) => {
        const rawValue = stats[k];
        // Ensure value is a number
        const value = typeof rawValue === "number" ? rawValue : (typeof rawValue === "object" && rawValue !== null && "value" in rawValue ? (rawValue as any).value : 0);
        const parts = k.split(":");
        const type = parts[0] || "stat";
        const game = parts[1] || "misc";
        return { label: `${type.toUpperCase()} ${game.toUpperCase()}`, value };
      })
      .filter((v, i, a) => a.findIndex((t) => t.label === v.label) === i);

    if (miscStats.length === 0) {
      await interaction.editReply(`No misc stats found for **${username}**.`).catch(() => {});
      return;
    }

    const buffer = await generateMiscImage(username, miscStats, page);
    const attachment = new AttachmentBuilder(buffer, { name: "misc.png" });
    await interaction.editReply({ files: [attachment] }).catch(() => {});
  } catch (err) {
    log("error", `Misc error for ${username}`, err as Error);
    await sendLogToDiscord(logChannel, "error", `Misc error for ${username}`, err as Error);
    await interaction.editReply(
      `Error: ${(err as Error).message.substring(0, 80)}`
    ).catch(() => {});
  }
}

/**
 * /compare command - Compare two players
 */
export async function handleCompareCommand(
  interaction: ChatInputCommandInteraction,
  logChannel: any
): Promise<void> {
  const player1 = interaction.options.getString("player1", true);
  const player2 = interaction.options.getString("player2", true);

  if (!player1 || player1.length > 16 || player1.length < 3) {
    await interaction.reply("Player 1 username must be 3-16 characters.");
    return;
  }

  if (!player2 || player2.length > 16 || player2.length < 3) {
    await interaction.reply("Player 2 username must be 3-16 characters.");
    return;
  }

  try {
    await interaction.deferReply();

    const [data1, skin1, data2, skin2] = await Promise.all([
      getPlayerStats(player1),
      getMinecraftSkin(player1),
      getPlayerStats(player2),
      getMinecraftSkin(player2),
    ]);

    if (!data1?.statistics || !data2?.statistics) {
      await interaction.editReply("Could not fetch stats for both players.").catch(() => {});
      return;
    }

    const buffer = await generateCompareImage(player1, data1, skin1, player2, data2, skin2);
    const attachment = new AttachmentBuilder(buffer, { name: "compare.png" });
    await interaction.editReply({ files: [attachment] }).catch(() => {});
  } catch (err) {
    log("error", `Compare error for ${player1} vs ${player2}`, err as Error);
    await sendLogToDiscord(
      logChannel,
      "error",
      `Compare error for ${player1} vs ${player2}`,
      err as Error
    );
    await interaction.editReply(
      `Error: ${(err as Error).message.substring(0, 80)}`
    ).catch(() => {});
  }
}

/**
 * /refer command - Referral currency leaderboards
 */
export async function handleReferCommand(
  interaction: ChatInputCommandInteraction,
  logChannel: any
): Promise<void> {
  const currency = interaction.options.getString("currency", true);

  try {
    await interaction.deferReply();

    // Load refer-leaderboard.json
    const fs = await import("fs");
    const path = await import("path");
    const referPath = path.default.resolve("./refer-leaderboard.json");
    const referData = JSON.parse(fs.default.readFileSync(referPath, "utf-8"));

    if (!referData[currency] || !referData[currency].entries) {
      await interaction.editReply(`No leaderboard data found for **${currency}**.`).catch(() => {});
      return;
    }

    const entries = referData[currency].entries.slice(0, 10).map((entry: any) => ({
      position: entry.position,
      username: entry.username,
      value: entry.balance,
    }));

    // Determine value label based on currency type
    let valueLabel = "BALANCE";
    if (currency.includes("experience")) valueLabel = "EXPERIENCE";
    else if (currency.includes("coin")) valueLabel = "COINS";
    else if (currency.includes("gem")) valueLabel = "GEMS";
    else if (currency.includes("token")) valueLabel = "TOKENS";
    else if (currency.includes("shard")) valueLabel = "SHARDS";

    const leaderboardData = {
      game: currency.replace(/-/g, " ").toUpperCase(),
      entries,
      totalPlayers: referData[currency].entries.length,
      valueLabel,
    };

    const gameName = currency.replace(/-/g, " ").toUpperCase();
    const buffer = await generateLeaderboardImage(gameName, leaderboardData);
    const attachment = new AttachmentBuilder(buffer, { name: `${currency}-leaderboard.png` });
    await interaction.editReply({ files: [attachment] }).catch(() => {});
  } catch (err) {
    log("error", `Refer error for ${currency}`, err as Error);
    await sendLogToDiscord(logChannel, "error", `Refer error for ${currency}`, err as Error);
    await interaction.editReply(
      `Error: ${(err as Error).message.substring(0, 80)}`
    ).catch(() => {});
  }
}

/**
 * /invite command - Send Discord server invite link
 */
export async function handleInviteCommand(
  interaction: ChatInputCommandInteraction,
  logChannel: any
): Promise<void> {
  try {
    await interaction.reply(
      "🎮 Join the **Archie Discord Server**!\nhttps://discord.gg/Gex6SFwhPc"
    );
  } catch (err) {
    log("error", "Invite error", err as Error);
    await sendLogToDiscord(logChannel, "error", "Invite error", err as Error);
    await interaction.reply("Error sending invite link.").catch(() => {});
  }
}

/**
 * /link command - Link Discord account to Minecraft username
 */
export async function handleLinkCommand(
  interaction: ChatInputCommandInteraction,
  logChannel: any
): Promise<void> {
  const username = interaction.options.getString("username", true);
  const discordUserId = interaction.user.id;

  if (!username || username.length > 16 || username.length < 3) {
    await interaction.reply("❌ Username must be 3-16 characters.");
    return;
  }

  try {
    await interaction.deferReply();

    // Validate username by checking if player exists
    const playerData = await getPlayerStats(username);
    if (!playerData?.statistics) {
      await interaction.editReply(`❌ Player **${username}** not found on ArchMC.`).catch(() => {});
      return;
    }

    // Link the accounts
    const success = linkDiscordToMinecraft(discordUserId, username);
    
    if (success) {
      await interaction.editReply(
        `✅ Successfully linked your Discord account to **${username}**!\n\nYou can now use other commands with your linked account.`
      ).catch(() => {});
      log("info", `User ${interaction.user.tag} linked to ${username}`);
    } else {
      await interaction.editReply("❌ Error linking account. Please try again.").catch(() => {});
    }
  } catch (err) {
    log("error", `Link error for ${username}`, err as Error);
    await sendLogToDiscord(logChannel, "error", `Link error for ${username}`, err as Error);
    await interaction.editReply(
      `❌ Error: ${(err as Error).message.substring(0, 80)}`
    ).catch(() => {});
  }
}
