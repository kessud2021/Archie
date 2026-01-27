/**
 * Discord slash commands registration
 * Defines all available slash commands
 */

import { SlashCommandBuilder } from "discord.js";

export function getCommandDefinitions(): ReturnType<SlashCommandBuilder["toJSON"]>[] {
  return [
    new SlashCommandBuilder()
      .setName("stats")
      .setDescription("Get ArchMC stats for a player")
      .addStringOption((opt) =>
        opt
          .setName("player")
          .setDescription("Minecraft username")
          .setRequired(true)
      )
      .toJSON(),

    new SlashCommandBuilder()
      .setName("quick-stats")
      .setDescription("Quick stats summary as embed")
      .addStringOption((opt) =>
        opt
          .setName("player")
          .setDescription("Minecraft username")
          .setRequired(true)
      )
      .toJSON(),

    new SlashCommandBuilder()
      .setName("leaderboard")
      .setDescription("Get ArchMC leaderboard for a game")
      .addStringOption((opt) =>
        opt
          .setName("game")
          .setDescription("Game name (e.g., Bedwars, SkyWars, Bridges)")
          .setRequired(true)
          .addChoices(
            { name: "Bedwars", value: "bedwars" },
            { name: "SkyWars", value: "skywars" },
            { name: "Bridges", value: "bridges" },
            { name: "Stickfight", value: "stickfight" },
            { name: "Sumo", value: "sumo" },
            { name: "BuildUHC", value: "builduhc" },
            { name: "Bedfight", value: "bedfight" },
            { name: "Boxing", value: "boxing" },
            { name: "NoDebuff", value: "nodebuff" },
            { name: "Pearl", value: "pearl" },
            { name: "Soup", value: "soup" },
            { name: "Spleef", value: "spleef" },
            { name: "Gapple", value: "gapple" },
            { name: "Combo", value: "combo" }
          )
      )
      .toJSON(),

    new SlashCommandBuilder()
      .setName("compare")
      .setDescription("Compare two players stats")
      .addStringOption((opt) =>
        opt
          .setName("player1")
          .setDescription("First player username")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("player2")
          .setDescription("Second player username")
          .setRequired(true)
      )
      .toJSON(),

    new SlashCommandBuilder()
      .setName("duelstats")
      .setDescription("View duel stats for a player")
      .addStringOption((opt) =>
        opt
          .setName("player")
          .setDescription("Minecraft username")
          .setRequired(true)
      )
      .toJSON(),

    new SlashCommandBuilder()
      .setName("economy")
      .setDescription("View economy stats for a player")
      .addStringOption((opt) =>
        opt
          .setName("player")
          .setDescription("Minecraft username")
          .setRequired(true)
      )
      .addIntegerOption((opt) =>
        opt
          .setName("page")
          .setDescription("Page number (1-indexed)")
          .setRequired(false)
          .setMinValue(1)
      )
      .toJSON(),

    new SlashCommandBuilder()
      .setName("lifesteal")
      .setDescription("View lifesteal stats for a player")
      .addStringOption((opt) =>
        opt
          .setName("player")
          .setDescription("Minecraft username")
          .setRequired(true)
      )
      .addIntegerOption((opt) =>
        opt
          .setName("page")
          .setDescription("Page number (1-indexed)")
          .setRequired(false)
          .setMinValue(1)
      )
      .toJSON(),

    new SlashCommandBuilder()
      .setName("misc")
      .setDescription("View misc stats for a player")
      .addStringOption((opt) =>
        opt
          .setName("player")
          .setDescription("Minecraft username")
          .setRequired(true)
      )
      .addIntegerOption((opt) =>
        opt
          .setName("page")
          .setDescription("Page number (1-indexed)")
          .setRequired(false)
          .setMinValue(1)
      )
      .toJSON(),

    new SlashCommandBuilder()
      .setName("refer")
      .setDescription("View referral currency leaderboard")
      .addStringOption((opt) =>
        opt
          .setName("currency")
          .setDescription("Currency name")
          .setRequired(true)
          .addChoices(
            { name: "SkyWars Experience", value: "skywars-experience" },
            { name: "SkyWars Coins", value: "skywars-coins" },
            { name: "Bedwars Experience", value: "bedwars-experience" },
            { name: "Bedwars Coins", value: "bedwars-coins" },
            { name: "Lifesteal Tokens", value: "lifesteal-tokens" },
            { name: "Lifesteal Coins", value: "lifesteal-coins" },
            { name: "Miniwalls Experience", value: "miniwalls-experience" },
            { name: "Miniwalls Coins", value: "miniwalls-coins" },
            { name: "KitPvP Coins", value: "kitpvp-coins" },
            { name: "Survival Coins", value: "survival-coins" },
            { name: "Survival Shards", value: "survival-shards" },
            { name: "Coins", value: "coins" },
            { name: "Gems", value: "gems" },
            { name: "Experience", value: "experience" }
          )
      )
      .toJSON(),

    new SlashCommandBuilder()
      .setName("invite")
      .setDescription("Get the Archie Discord server invite link")
      .toJSON(),

    new SlashCommandBuilder()
      .setName("link")
      .setDescription("Link your Discord account to your Minecraft username")
      .addStringOption((opt) =>
        opt
          .setName("username")
          .setDescription("Your Minecraft username")
          .setRequired(true)
      )
      .toJSON(),
  ];
}
