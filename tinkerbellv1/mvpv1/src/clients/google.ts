import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..", "..", "..");

const envCandidates = [
  path.resolve(ROOT, ".env"),
  path.resolve(ROOT, "..", ".env"),
];

for (const envPath of envCandidates) {
  const result = dotenv.config({ path: envPath, override: true });
  if (result.parsed) {
    console.log(`[env] loaded from ${envPath}`);
    break;
  }

  if (result.error) {
    const code = (result.error as NodeJS.ErrnoException).code;
    if (code && code !== "ENOENT") {
      console.warn(`[env] failed to load ${envPath}:`, result.error.message);
    }
  }
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY missing. Please set it via environment or .env file.");
}

let textClient: GoogleGenAI | null = null;
let mediaClient: GoogleGenAI | null = null;

export function getTextClient(): GoogleGenAI {
  if (!textClient) {
    textClient = new GoogleGenAI({ apiKey });
  }
  return textClient;
}

export function getMediaClient(): GoogleGenAI {
  if (!mediaClient) {
    mediaClient = new GoogleGenAI({ apiKey, apiVersion: "v1alpha" });
  }
  return mediaClient;
}
