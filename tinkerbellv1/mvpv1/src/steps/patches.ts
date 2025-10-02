import { z } from "zod";
import { Idea, PatchMetadata, Persona, PromptDefinition } from "../types.js";
import { generateJSON } from "../utils/llm.js";
import { nowIso } from "../utils/time.js";
import { uuid } from "../utils/id.js";
import { logInfo } from "../utils/logger.js";

const ideaSchema = z.object({
  script_id: z.string(),
  headline: z.string(),
  body: z.string(),
  cta: z.string(),
  keywords: z.array(z.string()).default([]),
});

const patchSchema = z.object({
  ideas: z.array(ideaSchema),
});

export interface GeneratePatchOptions {
  contextJson: string;
  persona: Persona;
  prompt: PromptDefinition;
  model: string;
  seed: string;
  temperature: number;
  batchIndex: number;
  maxRetries: number;
}

export interface PatchResult {
  metadata: PatchMetadata;
  ideas: Idea[];
  rawText: string;
}

export async function generatePatch(options: GeneratePatchOptions): Promise<PatchResult> {
  const { contextJson, persona, prompt, model, seed, temperature, batchIndex, maxRetries } = options;
  const patchId = uuid();
  const { data, rawText } = await generateJSON<{ ideas: unknown }>({
    prompt,
    variables: {
      context: contextJson,
      persona: JSON.stringify(persona, null, 2),
      seed,
      temperature: temperature.toString(),
      patchId,
    },
    model,
    temperature,
    maxRetries,
    tag: `patch_${batchIndex}`,
  });

  const parsed = patchSchema.parse(data);
  const generatedAt = nowIso();

  const metadata: PatchMetadata = {
    patch_id: patchId,
    persona_id: persona.persona_id,
    seed_phrase: seed,
    temperature,
    batch_index: batchIndex,
    prompt_version: prompt.version,
    generated_at: generatedAt,
  };

  const ideas: Idea[] = parsed.ideas.map((idea: z.infer<typeof ideaSchema>) => ({
    script_id: idea.script_id,
    patch_id: patchId,
    persona_id: persona.persona_id,
    headline: idea.headline,
    body: idea.body,
    cta: idea.cta,
    keywords: idea.keywords ?? [],
    seed_phrase: seed,
    temperature,
    provenance: {
      model,
      prompt_version: prompt.version,
    },
    raw_llm_response: rawText,
    created_at: generatedAt,
  }));

  logInfo(`Generated patch ${batchIndex + 1}`, ideas.map((idea) => idea.headline));
  return { metadata, ideas, rawText };
}
