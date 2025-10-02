import { Buffer } from "node:buffer";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { AssetBrief, Idea, IdeaScore, Persona, PromptDefinition } from "../types.js";
import { generateJSON } from "../utils/llm.js";
import { logInfo, logWarn } from "../utils/logger.js";
import { nowIso } from "../utils/time.js";
import { ensureDir, writeJSON } from "../utils/io.js";
import { resolvePath } from "../config.js";
import { getMediaClient } from "../clients/google.js";

const assetSchema = z.object({
  image_brief: z.string(),
  video_brief: z.object({
    hook: z.string(),
    scenes: z.array(z.object({ time: z.string(), visual: z.string() })),
    voiceover: z.string().optional().default(""),
    cta: z.string(),
  }),
});

export interface AssetGenerationOptions {
  contextJson: string;
  persona: Persona;
  ideas: Idea[];
  scores: IdeaScore[];
  prompt: PromptDefinition;
  modelText: string;
  modelsMedia: { image: string; video: string };
  maxRetries: number;
  topIdeaCount: number;
  topVideoCount: number;
  runDir: string;
}

export interface AssetGenerationResult {
  briefs: AssetBrief[];
  imagePaths: Record<string, string>;
  videoPaths: Record<string, string>;
}

function selectTop(ideas: Idea[], scores: IdeaScore[], limit: number): Idea[] {
  const scoreMap = new Map(scores.map((score) => [score.script_id, score.final_score] as const));
  const sorted = ideas.slice().sort((a, b) => {
    const scoreA = scoreMap.get(a.script_id) ?? 0;
    const scoreB = scoreMap.get(b.script_id) ?? 0;
    return scoreB - scoreA;
  });
  return sorted.slice(0, limit);
}

function buildVideoPrompt(brief: AssetBrief): string {
  const lines = [
    `Hook: ${brief.video_brief.hook}`,
    "Scenes:",
    ...brief.video_brief.scenes.map((scene) => `${scene.time} - ${scene.visual}`),
    `Voiceover: ${brief.video_brief.voiceover ?? ""}`,
    `CTA: ${brief.video_brief.cta}`,
  ];
  return lines.join("\n");
}

async function generateImage(model: string, prompt: string, outputPath: string): Promise<void> {
  const client = getMediaClient() as unknown as {
    models: { generateImages: (params: unknown) => Promise<unknown> };
  };

  try {
    const response = (await client.models.generateImages({
      model,
      prompt,
      config: {
        numberOfImages: 1,
      },
    })) as {
      generatedImages?: Array<{ image?: { imageBytes?: string } }>;
    };

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) {
      logWarn("Image generation returned no bytes", { model });
      return;
    }

    const buffer = Buffer.from(imageBytes, "base64");
    await writeFile(outputPath, buffer);
  } catch (error) {
    logWarn(`Image generation failed for model ${model}`, error);
  }
}

async function pollVideoOperation(client: unknown, initialOperation: unknown, attempts = 24): Promise<Buffer | null> {
  const typedClient = client as {
    operations: { get: (params: { operation: unknown }) => Promise<unknown> };
  };

  let operation = initialOperation;

  for (let i = 0; i < attempts; i += 1) {
    operation = await typedClient.operations.get({ operation });

    const status = operation as {
      done?: boolean;
      response?: { generatedVideos?: Array<{ video?: { videoBytes?: string } }> };
    };

    if (status.done) {
      const videoBytes = status.response?.generatedVideos?.[0]?.video?.videoBytes;
      if (!videoBytes) {
        return null;
      }
      return Buffer.from(videoBytes, "base64");
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  return null;
}

async function generateVideo(model: string, prompt: string, outputPath: string): Promise<void> {
  const client = getMediaClient() as unknown as {
    models: { generateVideos: (params: unknown) => Promise<unknown> };
    operations: { get: (params: { operation: unknown }) => Promise<unknown> };
  };

  try {
    const operation = (await client.models.generateVideos({
      model,
      prompt,
      config: {
        durationSeconds: 6,
      },
    })) as { operation?: { name?: string }; name?: string };

    const operationHandle = operation.operation ?? operation;
    if (!operationHandle) {
      logWarn("Video generation did not return an operation handle", { model });
      return;
    }

    const videoBuffer = await pollVideoOperation(client, operationHandle);
    if (!videoBuffer) {
      const handleName = (operationHandle as { name?: string }).name;
      logWarn("Video polling returned no data", { handleName, model });
      return;
    }

    await writeFile(outputPath, videoBuffer);
  } catch (error) {
    logWarn(`Video generation failed for model ${model}`, error);
  }
}

export async function generateAssets(options: AssetGenerationOptions): Promise<AssetGenerationResult> {
  const { contextJson, persona, ideas, scores, prompt, modelText, modelsMedia, maxRetries, topIdeaCount, topVideoCount, runDir } = options;

  const topIdeas = selectTop(ideas, scores, topIdeaCount);
  const videoIdeas = selectTop(ideas, scores, topVideoCount).map((idea) => idea.script_id);
  const ideaLookup = new Map(ideas.map((idea) => [idea.script_id, idea] as const));

  const briefsDir = path.join(runDir, "assets", "briefs");
  const imagesDir = path.join(runDir, "assets", "images");
  const videosDir = path.join(runDir, "assets", "videos");

  const briefsAbs = await ensureDir(briefsDir);
  const imagesAbs = await ensureDir(imagesDir);
  const videosAbs = await ensureDir(videosDir);

  const briefs: AssetBrief[] = [];
  const imagePaths: Record<string, string> = {};
  const videoPaths: Record<string, string> = {};

  for (const idea of topIdeas) {
    const { data, rawText } = await generateJSON<{ image_brief: string; video_brief: unknown }>({
      prompt,
      variables: {
        context: contextJson,
        persona: JSON.stringify(persona, null, 2),
        idea: JSON.stringify(idea, null, 2),
      },
      model: modelText,
      maxRetries,
      tag: `asset_${idea.script_id}`,
    });

    const parsed = assetSchema.parse(data);
    const brief: AssetBrief = {
      script_id: idea.script_id,
      image_brief: parsed.image_brief,
      video_brief: {
        hook: parsed.video_brief.hook,
        scenes: parsed.video_brief.scenes,
        voiceover: parsed.video_brief.voiceover ?? "",
        cta: parsed.video_brief.cta,
      },
      generated_at: nowIso(),
    };

    briefs.push(brief);

    await writeJSON(path.join(runDir, "assets", "briefs", `${idea.script_id}.json`), {
      brief,
      raw: rawText,
    });

    const imageOutputPath = path.join(imagesAbs, `${idea.script_id}.png`);
    await generateImage(modelsMedia.image, brief.image_brief, imageOutputPath);
    imagePaths[idea.script_id] = imageOutputPath;

    if (videoIdeas.includes(idea.script_id)) {
      const videoPrompt = buildVideoPrompt(brief);
      const videoOutputPath = path.join(videosAbs, `${idea.script_id}.mp4`);
      await generateVideo(modelsMedia.video, videoPrompt, videoOutputPath);
      videoPaths[idea.script_id] = videoOutputPath;
    }
  }

  logInfo("Asset generation complete", {
    briefs: briefs.length,
    images: Object.keys(imagePaths).length,
    videos: Object.keys(videoPaths).length,
  });

  return { briefs, imagePaths, videoPaths };
}
