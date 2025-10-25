import OpenAI from "openai";
import { getOpenAIKeyOrThrow } from "./env";

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: getOpenAIKeyOrThrow(),
    });
  }

  return client;
}

function extractD2Code(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    const withoutFence = trimmed
      .replace(/^```(?:d2)?\s*/i, "")
      .replace(/```$/, "");
    return withoutFence.trim();
  }

  return trimmed;
}

export async function promptToD2Code(prompt: string, locale: string) {
  const systemPrompt = `You are an assistant that converts natural language descriptions into valid D2 diagrams. Only respond with D2 code. Do not wrap the code in explanations. Always keep labels readable on both light and dark backgrounds.`;

  const response = await getClient().responses.create({
    model: "gpt-4.1",
    temperature: 0.2,
    max_output_tokens: 2048,
    input: [
      {
        role: "system",
        content: [{ type: "text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Locale: ${locale}\nPrompt: ${prompt}\nReturn only D2 code.`,
          },
        ],
      },
    ],
  });

  const text = (response.output_text ?? "").trim();

  if (!text) {
    throw new Error("OpenAI response was empty");
  }

  return extractD2Code(text);
}
