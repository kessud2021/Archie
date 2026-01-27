/**
 * Logging utility
 * Handles console logging and Discord channel logging
 */

import { EmbedBuilder, TextBasedChannel } from "discord.js";

type LogLevel = "info" | "warn" | "error";

/**
 * Console logging
 */
export function log(level: LogLevel, message: string, error?: Error | null): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
  console.log(
    `${prefix} ${message}`,
    error ? `\n${error.stack || error}` : ""
  );
}

/**
 * Send log message to Discord channel
 */
export async function sendLogToDiscord(
  channel: any | null,
  level: LogLevel,
  message: string,
  error?: Error | null
): Promise<void> {
  if (!channel) return;

  try {
    const embed = new EmbedBuilder()
      .setColor(level === "error" ? 0xff6b6b : 0xffaa00)
      .setTitle(`${level.toUpperCase()} LOG`)
      .setDescription(message.substring(0, 100))
      .setTimestamp();

    if (error) {
      embed.addFields({
        name: "Error",
        value: `\`\`\`${String(error).substring(0, 1000)}\`\`\``,
      });
    }

    if (typeof channel.send === "function") {
      await channel.send({ embeds: [embed] }).catch(() => {});
    }
  } catch {
    // Silently fail if can't send to Discord
  }
}
