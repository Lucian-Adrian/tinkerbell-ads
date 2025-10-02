import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PromptDefinition } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

export interface MVPConfig {
  version: string;
  ideasPerPatch: number;
  patchCount: number;
  topIdeaCount: number;
  topVideoCount: number;
  maxPromptRetries: number;
  scoringWeights: {
    llm: number;
    trend: number;
    viral: number;
  };
  trend: {
    lookbackDays: number;
    keywordsPerIdea: number;
  };
  batching: {
    predictiveBatchSize: number;
    viralBatchSize: number;
  };
  models: {
    text: string;
    image: string;
    video: string;
  };
  prompts: {
    context: string;
    persona: string;
    patch: string;
    predictive: string;
    viral: string;
    asset: string;
  };
}

export interface SeedsConfig {
  version: string;
  seeds: string[];
}

export interface TemperatureConfig {
  version: string;
  sequence: number[];
}

async function loadJSON<T>(relativePath: string): Promise<T> {
  const absolutePath = path.resolve(ROOT, relativePath);
  const contents = await readFile(absolutePath, "utf-8");
  return JSON.parse(contents) as T;
}

export async function loadMVPConfig(): Promise<MVPConfig> {
  return loadJSON<MVPConfig>("config/mvp-config.json");
}

export async function loadSeeds(): Promise<SeedsConfig> {
  return loadJSON<SeedsConfig>("config/seeds.json");
}

export async function loadTemperatureSchedule(): Promise<TemperatureConfig> {
  return loadJSON<TemperatureConfig>("config/temperature.json");
}

export async function loadPrompt(relativePath: string): Promise<PromptDefinition> {
  return loadJSON<PromptDefinition>(relativePath);
}

export function resolvePath(...segments: string[]): string {
  return path.resolve(ROOT, ...segments);
}
