// AI Service Types

export interface GeminiTextRequest {
  prompt: string
  systemInstruction?: string
  temperature?: number
  maxTokens?: number
  thinkingBudget?: number
}

export interface GeminiTextResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface GeminiStructuredRequest<T = any> {
  prompt: string
  systemInstruction?: string
  schema: any
  temperature?: number
}

export interface GeminiStructuredResponse<T = any> {
  data: T
  text: string
}

export interface ImagenRequest {
  prompt: string
  numberOfImages?: number
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
  personGeneration?: 'dont_allow' | 'allow_adult' | 'allow_all'
}

export interface ImagenResponse {
  images: Array<{
    url: string
    contentType: string
  }>
}

export interface VeoRequest {
  prompt: string
  duration?: number
  noAudio?: boolean
}

export interface VeoResponse {
  video: {
    url: string
    contentType: string
    duration: number
  }
}

export interface PersonaGenerationOutput {
  personas: Array<{
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
  }>
}

export interface ScriptGenerationOutput {
  ideas: Array<{
    headline: string
    body: string
    cta: string
    keywords: string[]
    hook: string
    angle: string
    painPoint: string
    solution: string
    benefit: string
  }>
}

export interface ScoringOutput {
  llmScore: number
  rationale: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}
