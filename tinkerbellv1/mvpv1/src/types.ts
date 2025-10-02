export interface PromptDefinition {
  name: string;
  version: string;
  system: string;
  template: string;
}

export interface CompanyContext {
  company_id: string;
  url: string;
  uvp: string;
  brand_headline: string;
  brand_keywords: string[];
  brand_colors: string[];
  logo_urls: string[];
  short_bullets: string[];
  tone: string;
  generated_at: string;
}

export interface Persona {
  persona_id: string;
  name: string;
  role: string;
  company_size: string;
  motivations: string[];
  pain_points: string[];
  preferred_channels: string[];
  tone: string;
}

export interface Idea {
  script_id: string;
  patch_id: string;
  persona_id: string;
  headline: string;
  body: string;
  cta: string;
  keywords: string[];
  seed_phrase: string;
  temperature: number;
  provenance: {
    model: string;
    prompt_version: string;
  };
  raw_llm_response: unknown;
  created_at: string;
}

export interface PatchMetadata {
  patch_id: string;
  persona_id: string;
  seed_phrase: string;
  temperature: number;
  batch_index: number;
  prompt_version: string;
  generated_at: string;
}

export interface IdeaScore {
  script_id: string;
  trend_score: number;
  llm_score: number;
  viral_score: number;
  final_score: number;
  rationale: string;
  scored_at: string;
}

export interface AssetBrief {
  script_id: string;
  image_brief: string;
  video_brief: {
    hook: string;
    scenes: Array<{ time: string; visual: string }>;
    voiceover: string;
    cta: string;
  };
  generated_at: string;
}

export interface ExperimentRecord {
  experiment_id: string;
  started_at: string;
  completed_at?: string;
  input_url: string;
  uvp: string;
  persona_choice: string;
  prompt_files: Record<string, string>;
  model_versions: Record<string, string>;
  temperature_schedule: number[];
  seeds_version: string;
  config_version: string;
  notes?: string;
}
