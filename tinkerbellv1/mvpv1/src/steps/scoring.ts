import pLimit from "p-limit";
import { z } from "zod";
import { Idea, IdeaScore, Persona, PromptDefinition } from "../types.js";
import { generateJSON } from "../utils/llm.js";
import { logInfo, logWarn } from "../utils/logger.js";
import { nowIso } from "../utils/time.js";

const predictiveScoreSchema = z.object({
  script_id: z.string(),
  llm_score: z.number().min(0).max(100),
  rationale: z.string(),
});

const predictiveResponseSchema = z.object({
  scores: z.array(predictiveScoreSchema),
});

const viralScoreSchema = z.object({
  script_id: z.string(),
  viral_score: z.number().min(0).max(100),
  rationale: z.string(),
});

const viralResponseSchema = z.object({
  scores: z.array(viralScoreSchema),
});

export interface ScoringOptions {
  ideas: Idea[];
  persona: Persona;
  contextJson: string;
  predictivePrompt: PromptDefinition;
  viralPrompt: PromptDefinition;
  model: string;
  weights: { llm: number; trend: number; viral: number };
  batching: { predictiveBatchSize: number; viralBatchSize: number };
  trend: { lookbackDays: number; keywordsPerIdea: number };
  maxRetries: number;
}

interface TrendScoreResult {
  script_id: string;
  trend_score: number;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function fetchTrendScore(
  scriptId: string,
  keywords: string[],
  lookbackDays: number,
  keywordsPerIdea: number
): Promise<TrendScoreResult> {
  if (!keywords.length) {
    return { script_id: scriptId, trend_score: 30 };
  }

  const trimmed = keywords.slice(0, Math.max(1, keywordsPerIdea));

  const startTime = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
  const endTime = new Date();

  try {
    const mod = await import("google-trends-api");
    const trends = (mod.default ?? mod) as {
      interestOverTime: (options: Record<string, unknown>) => Promise<string>;
    };

    const raw = await trends.interestOverTime({
      keyword: trimmed,
      startTime,
      endTime,
      geo: "US",
    });

    const parsed = JSON.parse(raw) as {
      default?: { timelineData?: Array<{ value: number[] }> };
    };

    const timeline = parsed.default?.timelineData ?? [];
    if (!timeline.length) {
      return { script_id: scriptId, trend_score: 40 };
    }

    const scores = timeline.flatMap((entry) => entry.value ?? []);
    if (!scores.length) {
      return { script_id: scriptId, trend_score: 45 };
    }

    const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    return { script_id: scriptId, trend_score: Math.round(Math.min(100, Math.max(0, average))) };
  } catch (error) {
    logWarn(`Trend lookup failed for ${scriptId}; falling back to heuristic`, error);
    const fallback = Math.min(85, 35 + trimmed.length * 12);
    return { script_id: scriptId, trend_score: fallback };
  }
}

export async function scoreIdeas(options: ScoringOptions): Promise<IdeaScore[]> {
  const { ideas, persona, contextJson, predictivePrompt, viralPrompt, model, weights, batching, trend, maxRetries } = options;

  const ideaLookup = new Map(ideas.map((idea) => [idea.script_id, idea] as const));

  const predictiveBatches = chunk(ideas, Math.max(1, batching.predictiveBatchSize));
  const predictiveMap = new Map<string, { llm_score: number; rationale: string }>();

  for (const [index, batch] of predictiveBatches.entries()) {
    const { data } = await generateJSON<{ scores: unknown }>({
      prompt: predictivePrompt,
      variables: {
        context: contextJson,
        persona: JSON.stringify(persona, null, 2),
        ideas: JSON.stringify(
          batch.map((idea) => ({
            script_id: idea.script_id,
            headline: idea.headline,
            body: idea.body,
            cta: idea.cta,
            keywords: idea.keywords,
          })),
          null,
          2
        ),
      },
      model,
      maxRetries,
      tag: `predictive_batch_${index}`,
    });

    const parsed = predictiveResponseSchema.parse(data);
    for (const score of parsed.scores) {
      predictiveMap.set(score.script_id, { llm_score: score.llm_score, rationale: score.rationale });
    }
  }

  const viralBatches = chunk(ideas, Math.max(1, batching.viralBatchSize));
  const viralMap = new Map<string, { viral_score: number; rationale: string }>();
  for (const [index, batch] of viralBatches.entries()) {
    const { data } = await generateJSON<{ scores: unknown }>({
      prompt: viralPrompt,
      variables: {
        context: contextJson,
        persona: JSON.stringify(persona, null, 2),
        ideas: JSON.stringify(
          batch.map((idea) => ({
            script_id: idea.script_id,
            headline: idea.headline,
            body: idea.body,
            cta: idea.cta,
            keywords: idea.keywords,
          })),
          null,
          2
        ),
      },
      model,
      maxRetries,
      tag: `viral_batch_${index}`,
    });

    const parsed = viralResponseSchema.parse(data);
    for (const score of parsed.scores) {
      viralMap.set(score.script_id, { viral_score: score.viral_score, rationale: score.rationale });
    }
  }

  const limit = pLimit(4);
  const trendScores = await Promise.all(
    ideas.map((idea) =>
      limit(() => fetchTrendScore(idea.script_id, idea.keywords ?? [], trend.lookbackDays, trend.keywordsPerIdea))
    )
  );

  const trendMap = new Map<string, number>(
    trendScores.map((entry: TrendScoreResult) => [entry.script_id, entry.trend_score] as const)
  );

  const scores: IdeaScore[] = ideas.map((idea) => {
    const predictive = predictiveMap.get(idea.script_id) ?? { llm_score: 45, rationale: "Missing predictive score" };
    const viral = viralMap.get(idea.script_id) ?? { viral_score: 40, rationale: "Missing viral score" };
    const trendScore = trendMap.get(idea.script_id) ?? 35;

    const final =
      predictive.llm_score * weights.llm +
      trendScore * weights.trend +
      viral.viral_score * weights.viral;

    return {
      script_id: idea.script_id,
      trend_score: Math.round(trendScore),
      llm_score: Math.round(predictive.llm_score),
      viral_score: Math.round(viral.viral_score),
      final_score: Math.round(final),
      rationale: [predictive.rationale, viral.rationale].filter(Boolean).join("\n"),
      scored_at: nowIso(),
    } satisfies IdeaScore;
  });

  logInfo("Scoring complete", {
    ideas: scores.length,
    top: scores
      .slice()
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, 3)
      .map((score) => ({ script_id: score.script_id, score: score.final_score })),
  });

  return scores;
}
