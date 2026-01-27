/**
 * Game statistics mapping for leaderboard queries
 */
export const GAME_STAT_MAP: Record<string, string> = {
  bedwars: "wins:bedwars:global:lifetime",
  skywars: "wins:skywars:global:lifetime",
  bridges: "wins:bridges:global:lifetime",
  stickfight: "wins:stickfight:global:lifetime",
  sumo: "wins:sumo:global:lifetime",
  builduhc: "wins:builduhc:global:lifetime",
  bedfight: "wins:bedfight:global:lifetime",
  boxing: "wins:boxing:global:lifetime",
  nodebuff: "wins:nodebuff:global:lifetime",
  pearl: "wins:pearl:global:lifetime",
  soup: "wins:soup:global:lifetime",
  spleef: "wins:spleef:global:lifetime",
  gapple: "wins:gapple:global:lifetime",
  combo: "wins:combo:global:lifetime",
};

/**
 * API timeouts (ms)
 */
export const API_TIMEOUT = 50000;
export const SKIN_TIMEOUT = 5000;
export const CACHE_TTL = 2 * 60 * 1000;

/**
 * Bedwars modes for stat display
 */
export const BEDWARS_MODES = ["solo", "duos", "trios", "quads", "4v4"];

/**
 * Duel modes for stat display
 */
export const DUEL_MODES = [
  { name: "NoDebuff", key: "nodebuff", color: "#55FFFF" },
  { name: "Sumo", key: "sumo", color: "#AAFFAA" },
  { name: "Bridge", key: "bridge", color: "#FFAA55" },
  { name: "Boxing", key: "boxing", color: "#FF55AA" },
  { name: "BuildUHC", key: "builduhc", color: "#55FF99" },
  { name: "Combo", key: "combo", color: "#FFFF55" },
];

/**
 * Game stat displays for "Other Games" section
 */
export const STAT_DISPLAYS = [
  { label: "Stickfight", stat: "wins:stickfight:global:lifetime", color: "#FF5555" },
  { label: "Sumo", stat: "wins:sumo:global:lifetime", color: "#55FFFF" },
  { label: "BuildUHC", stat: "wins:builduhc:global:lifetime", color: "#55FF55" },
  { label: "SkyWars", stat: "wins:skywars:global:lifetime", color: "#96CEBB" },
  { label: "Bridges", stat: "wins:bridges:global:lifetime", color: "#FFAA55" },
  { label: "Bedfight", stat: "wins:bedfight:global:lifetime", color: "#AA55FF" },
];

/**
 * Image generation config
 */
export const IMAGE_CONFIG = {
  colors: {
    bg: "#0a0e27",
    overlay: "#000000",
    container: "#1E1E1E",
    border: "#4A4A4A",
    primary: "#55FFFF",
    secondary: "#AAAAAA",
  },
  fonts: {
    main: "Minecraftia",
  },
};
