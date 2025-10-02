import { z } from "zod";
import { Persona, PromptDefinition } from "../types.js";
import { generateJSON } from "../utils/llm.js";
import { logInfo } from "../utils/logger.js";

export interface PersonaStepOptions {
  contextJson: string;
  prompt: PromptDefinition;
  model: string;
  maxRetries: number;
}

const personaSchema = z.object({
  persona_id: z.string(),
  name: z.string(),
  role: z.string(),
  company_size: z.string(),
  motivations: z.array(z.string()),
  pain_points: z.array(z.string()),
  preferred_channels: z.array(z.string()),
  tone: z.string(),
});

const personaResponseSchema = z.object({
  personas: z.array(personaSchema).length(3),
});

export async function generatePersonas(options: PersonaStepOptions): Promise<{ personas: Persona[]; rawText: string }> {
  const { contextJson, prompt, model, maxRetries } = options;
  const { data, rawText } = await generateJSON<{ personas: unknown }>({
    prompt,
    variables: {
      context: contextJson,
    },
    model,
    maxRetries,
    tag: "persona_generation",
  });

  const parsed = personaResponseSchema.parse(data);
  logInfo(
    "Generated personas",
    parsed.personas.map((persona: { name: string }) => persona.name)
  );
  return { personas: parsed.personas as Persona[], rawText };
}
