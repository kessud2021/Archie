/**
 * Discord user to Minecraft username linking
 */

import fs from "fs";
import path from "path";

interface DiscordLinks {
  [discordUserId: string]: string; // Maps Discord user ID to Minecraft username
}

const linksPath = path.resolve("./data/discord_links.json");

/**
 * Load all links from file
 */
function loadLinks(): DiscordLinks {
  try {
    if (fs.existsSync(linksPath)) {
      const data = fs.readFileSync(linksPath, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // Silently fail, return empty object
  }
  return {};
}

/**
 * Save links to file
 */
function saveLinks(links: DiscordLinks): void {
  try {
    const dir = path.dirname(linksPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(linksPath, JSON.stringify(links, null, 2), "utf-8");
  } catch {
    // Silently fail
  }
}

/**
 * Link a Discord user to a Minecraft username
 */
export function linkDiscordToMinecraft(discordUserId: string, minecraftUsername: string): boolean {
  try {
    const links = loadLinks();
    links[discordUserId] = minecraftUsername;
    saveLinks(links);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Minecraft username for a Discord user
 */
export function getLinkedMinecraftUsername(discordUserId: string): string | null {
  try {
    const links = loadLinks();
    return links[discordUserId] || null;
  } catch {
    return null;
  }
}

/**
 * Unlink a Discord user
 */
export function unlinkDiscord(discordUserId: string): boolean {
  try {
    const links = loadLinks();
    delete links[discordUserId];
    saveLinks(links);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a Discord user is linked
 */
export function isLinked(discordUserId: string): boolean {
  const links = loadLinks();
  return discordUserId in links;
}
