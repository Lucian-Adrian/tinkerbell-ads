// API Request and Response Types

export interface IngestRequest {
  url: string
  uvp: string
}

export interface IngestResponse {
  companyId: string
  jobId: string
  message: string
}

export interface GeneratePersonasRequest {
  companyId: string
}

export interface GeneratePersonasResponse {
  jobId: string
  message: string
}

export interface GenerateScriptsRequest {
  personaId: string
  batches?: number
}

export interface GenerateScriptsResponse {
  jobId: string
  batchIds: string[]
  message: string
}

export interface CalculateScoresRequest {
  scriptId?: string
  scriptIds?: string[]
}

export interface CalculateScoresResponse {
  jobId: string
  message: string
}

export interface GenerateImagesRequest {
  scriptIds: string[]
}

export interface GenerateImagesResponse {
  jobId: string
  message: string
}

export interface GenerateVideosRequest {
  scriptIds: string[]
}

export interface GenerateVideosResponse {
  jobId: string
  message: string
}

export interface JobStatusResponse {
  id: string
  type: string
  status: string
  result: any
  error: string | null
  created_at: string
  completed_at: string | null
}

export interface ErrorResponse {
  error: string
  message: string
  details?: any
}

export interface SuccessResponse<T = any> {
  success: true
  data: T
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse
