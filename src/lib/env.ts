import "server-only";
import { z } from "zod";

// rules.md §11: env values are validated at startup and fail fast.
const serverEnvSchema = z.object({
  FLEETFLOW_API_URL: z.url().transform((url) => url.replace(/\/+$/, "")),
});

export const serverEnv = serverEnvSchema.parse({
  FLEETFLOW_API_URL: process.env.FLEETFLOW_API_URL,
});
