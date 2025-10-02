/**
 * Site Configuration
 */

export const siteConfig = {
  name: 'Tinkerbell',
  description: 'AI-Powered B2B Marketing Campaign Generator',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '0.1.0',
  links: {
    github: 'https://github.com',
    docs: '/docs',
  },
  features: {
    personaGeneration: true,
    scriptGeneration: true,
    viralCheck: true,
    imageGeneration: true,
    videoGeneration: true,
  },
  limits: {
    maxPersonasPerCompany: 3,
    maxScriptsPerPersona: 20,
    scriptBatchSize: 5,
    maxImageScripts: 10,
    maxVideoScripts: 3,
    imagesPerScript: 4,
  },
}

export type SiteConfig = typeof siteConfig
