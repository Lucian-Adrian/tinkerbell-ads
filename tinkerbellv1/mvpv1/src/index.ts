import path from "node:path";
import { parseArgs, selectPersona } from "./utils/cli.js";
import { logInfo, logSection, logWarn } from "./utils/logger.js";
import { ensureDir, writeJSON } from "./utils/io.js";
import { loadMVPConfig, loadPrompt, loadSeeds, loadTemperatureSchedule } from "./config.js";
import { generateCompanyContext } from "./steps/context.js";
import { generatePersonas } from "./steps/persona.js";
import { generatePatch } from "./steps/patches.js";
import { scoreIdeas } from "./steps/scoring.js";
import { generateAssets } from "./steps/assets.js";
import { nowIso } from "./utils/time.js";
import { uuid } from "./utils/id.js";
import type { ExperimentRecord, Idea, PatchMetadata } from "./types.js";

async function main(): Promise<void> {
  logSection("Tinkerbell MVP :: Bootstrapping guerrilla marketing experiment");

  const startedAt = nowIso();
  const args = parseArgs();
  logInfo("Input received", args);

  const config = await loadMVPConfig();
  const [seeds, temperature, contextPrompt, personaPrompt, patchPrompt, predictivePrompt, viralPrompt, assetPrompt] =
    await Promise.all([
      loadSeeds(),
      loadTemperatureSchedule(),
      loadPrompt(config.prompts.context),
      loadPrompt(config.prompts.persona),
      loadPrompt(config.prompts.patch),
      loadPrompt(config.prompts.predictive),
      loadPrompt(config.prompts.viral),
      loadPrompt(config.prompts.asset),
    ]);

  const timestamp = nowIso().replace(/[:.]/g, "-");
  const experimentId = uuid();
  const runDir = path.join("output", `${timestamp}_${experimentId.slice(0, 8)}`);
  await ensureDir(runDir);

  logInfo("Run directory created", { runDir });

  const contextResult = await generateCompanyContext({
    companyId: experimentId,
    url: args.url,
    uvp: args.uvp,
    prompt: contextPrompt,
    model: config.models.text,
    maxRetries: config.maxPromptRetries,
  });

  await writeJSON(path.join(runDir, "context.json"), {
    ...contextResult.context,
    prompt_version: contextPrompt.version,
    raw_response: contextResult.rawText,
    sample: contextResult.sample,
  });

  const contextJson = JSON.stringify(contextResult.context, null, 2);

  const personasResult = await generatePersonas({
    contextJson,
    prompt: personaPrompt,
    model: config.models.text,
    maxRetries: config.maxPromptRetries,
  });

  await writeJSON(path.join(runDir, "personas.json"), {
    personas: personasResult.personas,
    prompt_version: personaPrompt.version,
    raw_response: personasResult.rawText,
  });

  const personaIndex = await selectPersona(personasResult.personas);
  const persona = personasResult.personas[personaIndex];
  logInfo("Persona selected", { persona: persona.name });

  const patchesDir = path.join(runDir, "patches");
  await ensureDir(patchesDir);

  const ideas: Idea[] = [];
  const patchMetadata: PatchMetadata[] = [];
  const seedPool = seeds.seeds;
  const temperatures = temperature.sequence;

  for (let i = 0; i < config.patchCount; i += 1) {
    const seed = seedPool[i % seedPool.length];
    const temp = temperatures[i % temperatures.length];

    const result = await generatePatch({
  contextJson,
      persona,
      prompt: patchPrompt,
      model: config.models.text,
      seed,
      temperature: temp,
      batchIndex: i,
      maxRetries: config.maxPromptRetries,
    });

    ideas.push(...result.ideas);
    patchMetadata.push(result.metadata);

    await writeJSON(path.join(patchesDir, `patch_${i + 1}.json`), {
      metadata: result.metadata,
      ideas: result.ideas,
      raw_response: result.rawText,
    });
  }

  const scores = await scoreIdeas({
    ideas,
    persona,
  contextJson,
    predictivePrompt,
    viralPrompt,
    model: config.models.text,
    weights: config.scoringWeights,
    batching: config.batching,
    trend: config.trend,
    maxRetries: config.maxPromptRetries,
  });

  await writeJSON(path.join(runDir, "scores.json"), {
    scores,
    weights: config.scoringWeights,
    prompt_versions: {
      predictive: predictivePrompt.version,
      viral: viralPrompt.version,
    },
  });

  const assetResult = await generateAssets({
  contextJson,
    persona,
    ideas,
    scores,
    prompt: assetPrompt,
    modelText: config.models.text,
    modelsMedia: {
      image: config.models.image,
      video: config.models.video,
    },
    maxRetries: config.maxPromptRetries,
    topIdeaCount: config.topIdeaCount,
    topVideoCount: config.topVideoCount,
    runDir,
  });

  await writeJSON(path.join(runDir, "assets", "summary.json"), {
    briefs: assetResult.briefs,
    images: assetResult.imagePaths,
    videos: assetResult.videoPaths,
  });

  const experiment: ExperimentRecord = {
    experiment_id: experimentId,
    started_at: startedAt,
    completed_at: nowIso(),
    input_url: args.url,
    uvp: args.uvp,
    persona_choice: persona.persona_id,
    prompt_files: config.prompts,
    model_versions: config.models,
    temperature_schedule: temperature.sequence,
    seeds_version: seeds.version,
    config_version: config.version,
  };

  await writeJSON(path.join(runDir, "experiment.json"), {
    ...experiment,
    patch_metadata: patchMetadata,
  });

  logSection("Run complete :: View outputs in the run directory.");
}

void main().catch((error) => {
  logWarn("Pipeline failed", error);
  process.exitCode = 1;
});
