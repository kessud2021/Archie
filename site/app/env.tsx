import { z } from "zod";

const Environment = z.object({
  API_KEY: z.string(),
  API_URL: z.string().default("https://api.statsify.net"),
  ENVIRONMENT: z.enum(["development", "production"]).default("production"),
});

export const env = Environment.parse(process.env);
