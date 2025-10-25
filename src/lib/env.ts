import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
});

export function getOpenAIKeyOrThrow() {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  return env.OPENAI_API_KEY;
}
