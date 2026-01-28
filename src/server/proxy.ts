/**
 * Express Proxy Server for CORS bypass
 * Proxies requests from the web viewer to the ArchMC API
 */

import express, { Express, Request, Response } from "express";
import fetch from "node-fetch";
import { log } from "../utils/logger.js";

const API_BASE = process.env.API_BASE || "https://api.arch.mc/v1";
const API_KEY = process.env.API_KEY || "";
const PROXY_PORT = parseInt(process.env.PROXY_PORT || "3000");

const app: Express = express();

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Request timeout
app.use((req, res, next) => {
  res.setTimeout(10000, () => {
    res.status(504).json({ error: "Request timeout" });
  });
  next();
});

/**
 * Proxy GET request to ArchMC API
 */
async function proxyRequest(endpoint: string): Promise<unknown> {
  const url = `${API_BASE}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Leaderboard endpoint (no URL params)
 */
app.get("/api/leaderboards/:statId", async (req: Request, res: Response) => {
  try {
    const { statId } = req.params;
    const endpoint = `/leaderboards/${statId}`;
    log("info", `🔄 Proxying leaderboard: ${statId}`);

    const data = await proxyRequest(endpoint);
    res.json(data);
  } catch (error: any) {
    log("error", `Leaderboard proxy error: ${error.message}`);
    res.status(500).json({
      error: "Failed to fetch leaderboard",
      message: error.message,
    });
  }
});

/**
 * Player stats endpoint
 */
app.get(
  "/api/players/username/:username/statistics",
  async (req: Request, res: Response) => {
    try {
      const { username } = req.params;

      const endpoint = `/players/username/${username}/statistics`;
      log("info", `🔄 Proxying player stats: ${username}`);

      const data = await proxyRequest(endpoint);
      res.json(data);
    } catch (error: any) {
      log("error", `Player stats proxy error: ${error.message}`);
      res.status(500).json({
        error: "Failed to fetch player stats",
        message: error.message,
      });
    }
  }
);

/**
 * Economy endpoint
 */
app.get(
  "/api/economy/player/username/:username",
  async (req: Request, res: Response) => {
    try {
      const { username } = req.params;

      const endpoint = `/economy/player/username/${username}`;
      log("info", `🔄 Proxying economy data: ${username}`);

      const data = await proxyRequest(endpoint);
      res.json(data);
    } catch (error: any) {
      log("error", `Economy proxy error: ${error.message}`);
      res.status(500).json({
        error: "Failed to fetch economy data",
        message: error.message,
      });
    }
  }
);

/**
 * Lifesteal stats endpoint
 */
app.get(
  "/api/ugc/trojan/players/username/:username/statistics",
  async (req: Request, res: Response) => {
    try {
      const { username } = req.params;

      const endpoint = `/ugc/trojan/players/username/${username}/statistics`;
      log("info", `🔄 Proxying lifesteal stats: ${username}`);

      const data = await proxyRequest(endpoint);
      res.json(data);
    } catch (error: any) {
      log("error", `Lifesteal proxy error: ${error.message}`);
      res.status(500).json({
        error: "Failed to fetch lifesteal stats",
        message: error.message,
      });
    }
  }
);

/**
 * Health check
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    api_base: API_BASE,
    has_api_key: !!API_KEY,
  });
});

/**
 * Start proxy server
 */
export async function startProxyServer(): Promise<void> {
  try {
    app.listen(PROXY_PORT, () => {
      log("info", `✓ Proxy server listening on port ${PROXY_PORT}`);
      log("info", `  - Leaderboards: http://localhost:${PROXY_PORT}/api/leaderboards/{statId}`);
      log("info", `  - Player Stats: http://localhost:${PROXY_PORT}/api/players/username/{username}/statistics`);
      log("info", `  - Health Check: http://localhost:${PROXY_PORT}/health`);
    });
  } catch (error: any) {
    log("error", `Failed to start proxy server: ${error.message}`);
    throw error;
  }
}
