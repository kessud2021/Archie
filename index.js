/**
 * Archie Bot Entry Point
 * 
 * This file is kept for convenience.
 * The bot is written in TypeScript (src/) and compiled to JavaScript (dist/).
 * 
 * In production: run `npm start` which executes dist/index.js
 * In development: run `npm run dev` which compiles and runs
 * 
 * To start the bot directly from source:
 *   node --loader tsx src/index.ts
 * 
 * Or build then run:
 *   npm run build && npm start
 */

import("./dist/index.js").catch((err) => {
  console.error("Failed to load bot:", err.message);
  process.exit(1);
});
