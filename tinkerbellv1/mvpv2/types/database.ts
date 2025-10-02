// Database Types (Generated from Supabase schema)

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: Company
        Insert: Omit<Company, 'id' | 'created_at'>
        Update: Partial<Omit<Company, 'id'>>
      }
      personas: {
        Row: Persona
        Insert: Omit<Persona, 'id' | 'created_at'>
        Update: Partial<Omit<Persona, 'id'>>
      }
      script_batches: {
        Row: ScriptBatch
        Insert: Omit<ScriptBatch, 'id' | 'created_at'>
        Update: Partial<Omit<ScriptBatch, 'id'>>
      }
      scripts: {
        Row: Script
        Insert: Omit<Script, 'id' | 'created_at'>
        Update: Partial<Omit<Script, 'id'>>
      }
      scores: {
        Row: Score
        Insert: Omit<Score, 'id' | 'created_at'>
        Update: Partial<Omit<Score, 'id'>>
      }
      assets: {
        Row: Asset
        Insert: Omit<Asset, 'id' | 'created_at'>
        Update: Partial<Omit<Asset, 'id'>>
      }
      jobs: {
        Row: Job
        Insert: Omit<Job, 'id' | 'created_at'>
        Update: Partial<Omit<Job, 'id'>>
      }
    }
  }
}

export interface Company {
  id: string
  user_id: string
  url: string
  uvp: string
  metadata: CompanyMetadata | null
  scraped_at: string | null
  created_at: string
}

export interface CompanyMetadata {
  title?: string
  description?: string
  keywords?: string[]
  content?: string
  industry?: string
  targetAudience?: string
}

export interface Persona {
  id: string
  company_id: string
  name: string
  persona_json: PersonaData
  created_at: string
}

export interface PersonaData {
  name: string
  age: number
  role: string
  goals: string[]
  painPoints: string[]
  behaviors: string[]
  preferences: string[]
  demographics: {
    location?: string
    income?: string
    education?: string
  }
}

export interface ScriptBatch {
  id: string
  company_id: string
  persona_id: string
  seed_template: string
  temperature: number
  status: BatchStatus
  created_at: string
}

export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Script {
  id: string
  batch_id: string
  persona_id: string
  headline: string
  body: string
  cta: string
  keywords: string[]
  idea_json: ScriptIdeaData
  created_at: string
}

export interface ScriptIdeaData {
  hook: string
  angle: string
  painPoint: string
  solution: string
  benefit: string
  urgency?: string
  socialProof?: string
}

export interface Score {
  id: string
  script_id: string
  trend_score: number
  llm_score: number
  viral_score: number
  final_score: number
  rationale: string
  created_at: string
}

export interface Asset {
  id: string
  script_id: string
  image_brief: ImageBrief | null
  video_brief: VideoBrief | null
  image_urls: string[]
  video_urls: string[]
  created_at: string
}

export interface ImageBrief {
  prompt: string
  style: string
  aspectRatio: string
  numberOfImages: number
  keywords: string[]
}

export interface VideoBrief {
  prompt: string
  duration: number
  style: string
  keywords: string[]
  noAudio: boolean
}

export interface Job {
  id: string
  type: JobType
  status: JobStatus
  payload: JobPayload
  result: JobResult | null
  error: string | null
  created_at: string
  completed_at: string | null
}

export type JobType =
  | 'scrape'
  | 'generate_personas'
  | 'generate_scripts'
  | 'calculate_scores'
  | 'generate_images'
  | 'generate_videos'

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type JobPayload = {
  companyId?: string
  personaId?: string
  scriptId?: string
  scriptIds?: string[]
  [key: string]: any
}

export type JobResult = {
  [key: string]: any
}
