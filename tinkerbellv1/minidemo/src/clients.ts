import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY missing. Update minidemo/.env before running the server.");
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
