import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { promises as fs } from "node:fs";
import { Buffer } from "node:buffer";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing GEMINI_API_KEY. Add it to your .env file or export it before running the script."
  );
}

const MODEL_NAME = "imagen-4.0-generate-001";
const PROMPT = "A cheerful robot holding a bright red skateboard in a neon-lit city";
const IMAGE_COUNT = 2;
const API_VERSION = "v1alpha";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, "../assets");

const ai = new GoogleGenAI({ apiKey, apiVersion: API_VERSION });

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function saveImages(baseName: string, images: Array<{ image?: { imageBytes?: string } }>) {
  if (!images.length) {
    console.warn("No images returned from the model.");
    return;
  }

  await ensureOutputDir();

  await Promise.all(
    images.map(async (image, index) => {
      const imageBytes = image.image?.imageBytes;
      if (!imageBytes) {
        console.warn(`Image ${index + 1} had no bytes; skipping.`);
        return;
      }

      const buffer = Buffer.from(imageBytes, "base64");
      const filename = `${baseName}-${index + 1}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);
      await fs.writeFile(filepath, buffer);
      console.log(`🖼️  Saved ${filepath}`);
    })
  );
}

async function generateImages() {
  console.log("🚀 Starting Gemini image generation demo");
  console.log(`Model: ${MODEL_NAME}`);
  console.log(`API version: ${API_VERSION}`);
  console.log(`Prompt: ${PROMPT}`);
  console.log(`Requested images: ${IMAGE_COUNT}`);

  try {
    const response = await ai.models.generateImages({
      model: MODEL_NAME,
      prompt: PROMPT,
      config: {
        numberOfImages: IMAGE_COUNT,
      },
    });

    await saveImages("gemini-image", response.generatedImages ?? []);
    console.log("✅ Image generation completed");
  } catch (error) {
    console.error("❌ Image generation failed", error);
  }
}

void generateImages();