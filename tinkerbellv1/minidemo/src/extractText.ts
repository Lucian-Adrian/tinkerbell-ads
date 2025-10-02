import { Buffer } from "node:buffer";
import type { GenerateContentResponse } from "@google/genai";

export function extractText(response: GenerateContentResponse): string {
  if (response.text) {
    return response.text.trim();
  }

  const candidate = response.candidates?.[0];
  if (!candidate) {
    return "";
  }

  const parts = Array.isArray(candidate.content?.parts) ? candidate.content?.parts : [];
  const collected = parts
    .map((part) => {
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

  return collected.trim();
}
