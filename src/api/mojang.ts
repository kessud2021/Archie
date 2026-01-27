/**
 * Mojang API client
 * Handles Minecraft skin and profile queries
 * Uses database caching for skins
 */

import fetch from "node-fetch";
import path from "path";
import { SKIN_TIMEOUT } from "../config/constants.js";
import { getCachedSkin, saveSkin } from "../db/client.js";

/**
 * Get Minecraft player skin URL with database caching
 */
export async function getMinecraftSkin(username: string): Promise<string> {
  // Check database cache first
  const dbCached = getCachedSkin(username);
  if (dbCached?.isFresh) {
    return dbCached.url;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SKIN_TIMEOUT);

    try {
      // Get UUID from username
      const uuidRes = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${username}`,
        { signal: controller.signal }
      );

      if (!uuidRes.ok) throw new Error("Not found");

      const { id: uuid } = (await uuidRes.json()) as { id: string };

      // Get profile data
      const profileRes = await fetch(
        `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`,
        { signal: controller.signal }
      );

      if (!profileRes.ok) throw new Error("No profile");

      const { properties } = (await profileRes.json()) as {
        properties: Array<{ name: string; value: string }>;
      };

      const texture = properties.find((p) => p.name === "textures");
      if (!texture) throw new Error("No texture");

      const decoded = JSON.parse(
        Buffer.from(texture.value, "base64").toString()
      ) as {
        textures: { SKIN: { url: string } };
      };

      const skinUrl = decoded.textures.SKIN.url;
      
      // Cache in database
      saveSkin(username, skinUrl);
      
      return skinUrl;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    // Fallback to local steve.png
    const fallbackUrl = `file://${path.resolve("./steve.png")}`;
    saveSkin(username, fallbackUrl);
    return fallbackUrl;
  }
}
