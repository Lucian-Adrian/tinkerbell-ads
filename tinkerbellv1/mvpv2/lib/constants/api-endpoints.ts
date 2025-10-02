// API Endpoint Constants

export const API_ENDPOINTS = {
  // Health
  health: '/api/health',

  // Ingestion
  ingest: '/api/ingest',

  // Personas
  personas: {
    list: '/api/personas',
    generate: '/api/personas/generate',
    byId: (id: string) => `/api/personas/${id}`,
  },

  // Scripts
  scripts: {
    list: '/api/scripts',
    generate: '/api/scripts/generate',
    byId: (id: string) => `/api/scripts/${id}`,
    byBatch: (batchId: string) => `/api/scripts/batch/${batchId}`,
  },

  // Scores
  scores: {
    list: '/api/scores',
    calculate: '/api/scores/calculate',
    trends: '/api/scores/trends',
  },

  // Assets
  assets: {
    list: '/api/assets',
    generateImages: '/api/assets/generate-images',
    generateVideos: '/api/assets/generate-videos',
    byId: (id: string) => `/api/assets/${id}`,
  },

  // Jobs
  jobs: {
    byId: (id: string) => `/api/jobs/${id}`,
  },
} as const

export default API_ENDPOINTS
