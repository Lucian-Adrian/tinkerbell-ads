import { Buffer } from "node:buffer";
import { GenerateContentResponse } from "@google/genai";
import { PromptDefinition } from "../types.js";
import { getTextClient } from "../clients/google.js";
import { renderTemplate } from "./render.js";
import { logWarn } from "./logger.js";

export interface GenerateJSONOptions<T> {
  prompt: PromptDefinition;
  variables: Record<string, string>;
  model: string;
  temperature?: number;
  maxRetries: number;
  tag: string;
}

export interface LLMJsonResponse<T> {
  data: T;
  rawText: string;
  response: GenerateContentResponse;
}

function extractText(response: GenerateContentResponse): string {
  if (response.text) {
    return response.text;
  }

  const candidate = response.candidates?.[0];
  if (!candidate) {
    return "";
  }

  const parts = Array.isArray(candidate.content?.parts) ? candidate.content?.parts : [];
  const collected = parts
    ?.map((part) => {
      if (typeof part.text === "string") {
        return part.text;
      }
      if (part.inlineData?.data) {
        return Buffer.from(part.inlineData.data, "base64").toString("utf-8");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");

  return collected ?? "";
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function stripCodeFences(payload: string): string {
  const fenceMatch = payload.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }
  return payload.trim();
}

export async function generateJSON<T>({
  prompt,
  variables,
  model,
  temperature = 0.5,
  maxRetries,
  tag,
}: GenerateJSONOptions<T>): Promise<LLMJsonResponse<T>> {
  const client = getTextClient();
  const rendered = renderTemplate(prompt.template, variables);
  const payloadBytes = Buffer.byteLength(rendered, "utf-8");

  let attempt = 0;
  let lastError: unknown;
  const jitter = () => 250 + Math.floor(Math.random() * 250);

  while (attempt <= maxRetries) {
    try {
      const response = await (client as unknown as {
        models: {
          generateContent: (params: unknown) => Promise<GenerateContentResponse>;
        };
      }).models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: rendered }],
          },
        ],
        config: {
          systemInstruction: prompt.system,
          temperature,
        },
      });

      const text = extractText(response).trim();
      if (!text) {
        throw new Error(`Empty response for ${tag}`);
      }

      let parsed: T;
      try {
        parsed = JSON.parse(stripCodeFences(text)) as T;
      } catch (error) {
        throw new Error(`Failed to parse JSON for ${tag}: ${(error as Error).message}\n${text}`);
      }

      return { data: parsed, rawText: text, response };
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt > maxRetries) {
        break;
      }
      if (error instanceof Error) {
        const cause = (error as Error & { cause?: unknown }).cause as
          | (NodeJS.ErrnoException & { response?: Response })
          | undefined;
        const causeSummary = cause
          ? {
              name: cause.name,
              message: cause.message,
              code: cause.code,
              errno: cause.errno,
              syscall: cause.syscall,
              address: (cause as Record<string, unknown>).address,
              port: (cause as Record<string, unknown>).port,
            }
          : undefined;

        logWarn(`LLM call failed for ${tag} (attempt ${attempt}/${maxRetries}). Retrying...`, {
          message: error.message,
          name: error.name,
          payloadBytes,
          cause: causeSummary,
        });
      } else {
        logWarn(`LLM call failed for ${tag} (attempt ${attempt}/${maxRetries}). Retrying...`, error);
      }
      await delay(jitter());
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Unknown error generating JSON for ${tag}`);
}
