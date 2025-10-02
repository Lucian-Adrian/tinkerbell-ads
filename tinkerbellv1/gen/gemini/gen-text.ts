import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

/**
 * Load environment variables from the local .env file so we can read
 * GEMINI_API_KEY while running the script locally.
 */
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing GEMINI_API_KEY. Add it to your .env file or export it before running the script."
  );
}

/**
 * We'll use Gemini 2.5 Flash throughout this demo. This string is the exact
 * model identifier expected by the API.
 */
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Create a single shared client instance. The SDK automatically handles
 * authentication headers for every request based on the API key we pass in.
 */
const ai = new GoogleGenAI({ apiKey });

type Demo = {
  title: string;
  description: string;
  run: () => Promise<void>;
};

/** Utility helper for consistent, easy-to-read console output. */
function printSection(title: string, description: string) {
  console.log("\n" + "=".repeat(80));
  console.log(title);
  console.log("-".repeat(title.length));
  console.log(description);
}

/**
 * Extract the first text candidate from a response. The SDK also exposes the
 * full candidate list if you want to inspect alternative replies.
 */
function extractText(response: unknown): string {
  const maybeResponse = response as { text?: string } | undefined;
  if (maybeResponse?.text) {
    return maybeResponse.text.trim();
  }
  return JSON.stringify(response, null, 2);
}

const demos: Demo[] = [
  {
    title: "1. Quick answer",
    description:
      "Send a single text prompt to Gemini 2.5 Flash and print the primary answer.",
    run: async () => {
      const prompt = "Explain how large language models work in plain English.";
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      console.log("Model:", MODEL_NAME);
      console.log("Prompt:", prompt);
      console.log("Answer:\n", extractText(response));
    },
  },
  {
    title: "2. Persona via system instruction",
    description:
      "Augment the same model call with a system instruction so the assistant answers as a friendly cat.",
    run: async () => {
      const prompt = "What is machine learning?";
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            "You are Neko, a cheerful cat guide. Keep explanations short and sprinkle in playful 'meow' cues.",
        },
      });

      console.log("Prompt:", prompt);
      console.log("Cat-flavored answer:\n", extractText(response));
    },
  },
  {
    title: "3. Tuned generation settings",
    description:
      "Use temperature and token limits for a concise creative story. We also disable the optional thinking phase for speed.",
    run: async () => {
      const prompt = "Write a 5 sentence story about a robot that learns to paint sunsets.";
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          generationConfig: {
            temperature: 0.8,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 250,
          },
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });

      console.log("Prompt:", prompt);
      console.log("Creative story:\n", extractText(response));
    },
  },
];

async function main() {
  console.log("🌟 Gemini 2.5 Flash text demos");
  console.log("=".repeat(80));

  for (const demo of demos) {
    printSection(demo.title, demo.description);
    const startedAt = Date.now();
    try {
      await demo.run();
    } catch (error) {
      console.error("⚠️  Demo failed:", error);
    } finally {
      const elapsedMs = Date.now() - startedAt;
      console.log(`⏱️  Completed in ${elapsedMs} ms`);
    }
  }

  console.log("\n✅ All demos finished.");
}

void main().catch((error) => {
  console.error("Unexpected error while running demos:", error);
  process.exitCode = 1;
});

