/**
 * Local JSON file-based storage initialization
 */

import fs from "fs";
import path from "path";

const dataDir = path.resolve("./data");

/**
 * Initialize data directory
 */
export function initDatabase(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Get path for a user's data file
 */
export function getUserDataPath(username: string): string {
  return path.join(dataDir, `${username}.json`);
}
