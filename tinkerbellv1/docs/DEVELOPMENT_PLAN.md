# Tinkerbell Development Plan — Complete Implementation Roadmap

**Version:** 2.0  
**Last Updated:** January 2025  
**Tech Stack:** Next.js 15, TypeScript, Supabase, Gemini 2.5 Flash, TailwindCSS

---

## 🎯 Executive Summary

Tinkerbell is an AI-powered B2B SaaS platform that revolutionizes marketing campaign creation by automating persona generation, ad script creation, predictive scoring, and asset generation. This plan outlines a **phased development approach** from MVP to full-scale production, with clear milestones, technical specifications, and risk mitigation strategies.

### Key Improvements Over Original Plan:
1. **Modular Architecture** - Microscopic file segmentation with clean folder organization
2. **Enhanced Error Handling** - Comprehensive fallback mechanisms for AI operations
3. **Real-time Progress** - Live updates using Supabase Realtime
4. **Caching Layer** - Redis integration for performance optimization
5. **Advanced Analytics** - Detailed campaign performance tracking
6. **Security First** - Row-level security, rate limiting, and API key rotation
7. **Scalable Workers** - Bull queue system for background job processing
8. **Testing Strategy** - Unit, integration, and E2E testing from day one
9. **API Rate Management** - Intelligent retry logic and exponential backoff
10. **Multi-tenant Support** - Built-in support for team collaboration

---

## 📋 Table of Contents

1. [Phase 0: Foundation & Setup](#phase-0-foundation--setup)
2. [Phase 1: MVP Core Features](#phase-1-mvp-core-features)
3. [Phase 2: Enhanced Features](#phase-2-enhanced-features)
4. [Phase 3: Production Optimization](#phase-3-production-optimization)
5. [Phase 4: Scale & Enterprise](#phase-4-scale--enterprise)
6. [Technical Architecture](#technical-architecture)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [Worker System](#worker-system)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Strategy](#deployment-strategy)
12. [Security Considerations](#security-considerations)
13. [Risk Mitigation](#risk-mitigation)
14. [Performance Optimization](#performance-optimization)
15. [Monitoring & Observability](#monitoring--observability)

---

## Phase 0: Foundation & Setup
**Duration:** Week 1  
**Goal:** Establish development environment, project structure, and core infrastructure

### 0.1 Development Environment Setup

#### Prerequisites:
- Node.js 18+ installed
- PostgreSQL 14+ (or Supabase account)
- Redis 6+ installed
- Git configured
- VS Code or preferred IDE

#### Initial Setup Commands:
```bash
# Create Next.js project with TypeScript
npx create-next-app@latest tinkerbell --typescript --tailwind --app --eslint

cd tinkerbell

# Install core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install @google/generative-ai
npm install zod
npm install bull ioredis
npm install swr axios
npm install react-hook-form @hookform/resolvers
npm install lucide-react
npm install recharts
npm install date-fns clsx tailwind-merge

# Install dev dependencies
npm install -D @types/node @types/react @types/bull
npm install -D eslint-config-prettier
npm install -D husky lint-staged
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D vitest @vitejs/plugin-react

# Install scraping dependencies
npm install cheerio axios
npm install @types/cheerio

# Install utility libraries
npm install nanoid uuid
npm install jsonwebtoken
npm install bcryptjs

# Setup Husky for git hooks
npx husky-init && npm install
```


### 0.2 Project Structure

Create this highly organized, microscopic folder structure:

```
tinkerbell/
├── src/
│   ├── app/                           # Next.js 15 App Router
│   │   ├── (auth)/                    # Auth routes group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/               # Protected dashboard routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── personas/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── scripts/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── assets/
│   │   │   │           └── page.tsx
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                       # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── callback/
│   │   │   │   │   └── route.ts
│   │   │   │   └── signout/
│   │   │   │       └── route.ts
│   │   │   ├── companies/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── scrape/
│   │   │   │       │   └── route.ts
│   │   │   │       └── stats/
│   │   │   │           └── route.ts
│   │   │   ├── personas/
│   │   │   │   ├── route.ts
│   │   │   │   ├── generate/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── scripts/
│   │   │   │   ├── route.ts
│   │   │   │   ├── generate/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── batch/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── scores/
│   │   │   │   ├── route.ts
│   │   │   │   ├── calculate/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── assets/
│   │   │   │   ├── route.ts
│   │   │   │   ├── generate/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── jobs/
│   │   │   │   ├── status/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── export/
│   │   │   │   ├── json/
│   │   │   │   │   └── route.ts
│   │   │   │   └── csv/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── supabase/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── global-error.tsx
│   ├── components/                    # React Components
│   │   ├── ui/                        # Base UI components
│   │   │   ├── button/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── button.test.tsx
│   │   │   │   └── button.stories.tsx
│   │   │   ├── card/
│   │   │   │   ├── card.tsx
│   │   │   │   └── card.test.tsx
│   │   │   ├── input/
│   │   │   │   ├── input.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   └── input.test.tsx
│   │   │   ├── modal/
│   │   │   │   ├── modal.tsx
│   │   │   │   └── modal.test.tsx
│   │   │   ├── toast/
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── toast-provider.tsx
│   │   │   │   └── use-toast.ts
│   │   │   ├── badge/
│   │   │   │   └── badge.tsx
│   │   │   ├── progress/
│   │   │   │   └── progress.tsx
│   │   │   ├── spinner/
│   │   │   │   └── spinner.tsx
│   │   │   ├── select/
│   │   │   │   └── select.tsx
│   │   │   ├── tabs/
│   │   │   │   └── tabs.tsx
│   │   │   ├── dropdown/
│   │   │   │   └── dropdown.tsx
│   │   │   └── skeleton/
│   │   │       └── skeleton.tsx
│   │   ├── layout/                    # Layout components
│   │   │   ├── header/
│   │   │   │   ├── header.tsx
│   │   │   │   └── user-menu.tsx
│   │   │   ├── sidebar/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── sidebar-item.tsx
│   │   │   │   └── sidebar-section.tsx
│   │   │   ├── footer/
│   │   │   │   └── footer.tsx
│   │   │   └── navigation/
│   │   │       ├── nav.tsx
│   │   │       └── breadcrumb.tsx
│   │   ├── forms/                     # Form components
│   │   │   ├── company/
│   │   │   │   ├── company-input-form.tsx
│   │   │   │   ├── company-edit-form.tsx
│   │   │   │   └── company-form-schema.ts
│   │   │   ├── persona/
│   │   │   │   ├── persona-editor.tsx
│   │   │   │   └── persona-form-schema.ts
│   │   │   ├── script/
│   │   │   │   ├── script-filter.tsx
│   │   │   │   └── script-editor.tsx
│   │   │   └── auth/
│   │   │       ├── login-form.tsx
│   │   │       ├── signup-form.tsx
│   │   │       └── auth-schema.ts
│   │   ├── dashboard/                 # Dashboard-specific components
│   │   │   ├── company/
│   │   │   │   ├── company-card.tsx
│   │   │   │   ├── company-list.tsx
│   │   │   │   └── company-stats.tsx
│   │   │   ├── persona/
│   │   │   │   ├── persona-list.tsx
│   │   │   │   ├── persona-card.tsx
│   │   │   │   └── persona-details.tsx
│   │   │   ├── script/
│   │   │   │   ├── script-grid.tsx
│   │   │   │   ├── script-card.tsx
│   │   │   │   ├── script-preview.tsx
│   │   │   │   └── script-comparison.tsx
│   │   │   ├── score/
│   │   │   │   ├── score-chart.tsx
│   │   │   │   ├── score-breakdown.tsx
│   │   │   │   └── score-badge.tsx
│   │   │   ├── asset/
│   │   │   │   ├── asset-preview.tsx
│   │   │   │   ├── asset-gallery.tsx
│   │   │   │   └── asset-download.tsx
│   │   │   └── analytics/
│   │   │       ├── analytics-overview.tsx
│   │   │       ├── trend-chart.tsx
│   │   │       └── performance-metrics.tsx
│   │   ├── realtime/                  # Realtime components
│   │   │   ├── job-status/
│   │   │   │   ├── job-status.tsx
│   │   │   │   └── job-status-badge.tsx
│   │   │   ├── progress/
│   │   │   │   ├── progress-tracker.tsx
│   │   │   │   └── progress-steps.tsx
│   │   │   └── live-feed/
│   │   │       └── live-feed.tsx
│   │   └── providers/                 # Context providers
│   │       ├── auth-provider.tsx
│   │       ├── theme-provider.tsx
│   │       ├── toast-provider.tsx
│   │       └── realtime-provider.tsx
│   ├── lib/                           # Core libraries and utilities
│   │   ├── supabase/                  # Supabase integration
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   ├── types.ts
│   │   │   └── queries/               # Database query functions
│   │   │       ├── companies/
│   │   │       │   ├── get-companies.ts
│   │   │       │   ├── get-company.ts
│   │   │       │   ├── create-company.ts
│   │   │       │   ├── update-company.ts
│   │   │       │   └── delete-company.ts
│   │   │       ├── personas/
│   │   │       │   ├── get-personas.ts
│   │   │       │   ├── create-persona.ts
│   │   │       │   └── update-persona.ts
│   │   │       ├── scripts/
│   │   │       │   ├── get-scripts.ts
│   │   │       │   ├── get-top-scripts.ts
│   │   │       │   ├── create-script.ts
│   │   │       │   └── update-script.ts
│   │   │       ├── scores/
│   │   │       │   ├── get-scores.ts
│   │   │       │   ├── create-score.ts
│   │   │       │   └── update-score.ts
│   │   │       └── assets/
│   │   │           ├── get-assets.ts
│   │   │           ├── create-asset.ts
│   │   │           └── update-asset.ts
│   │   ├── ai/                        # AI/LLM integration
│   │   │   ├── gemini/
│   │   │   │   ├── client.ts          # Gemini API wrapper
│   │   │   │   ├── config.ts
│   │   │   │   ├── retry-logic.ts
│   │   │   │   └── error-handler.ts
│   │   │   ├── prompts/               # Prompt templates
│   │   │   │   ├── persona/
│   │   │   │   │   ├── persona-generation.ts
│   │   │   │   │   └── persona-refinement.ts
│   │   │   │   ├── script/
│   │   │   │   │   ├── script-generation.ts
│   │   │   │   │   ├── script-variants.ts
│   │   │   │   │   └── creative-angles.ts
│   │   │   │   ├── scoring/
│   │   │   │   │   ├── llm-scoring.ts
│   │   │   │   │   └── viral-scoring.ts
│   │   │   │   └── assets/
│   │   │   │       ├── image-brief.ts
│   │   │   │       └── video-brief.ts
│   │   │   ├── parsers/               # Response parsers
│   │   │   │   ├── persona-parser.ts
│   │   │   │   ├── script-parser.ts
│   │   │   │   ├── score-parser.ts
│   │   │   │   └── json-extractor.ts
│   │   │   └── validators/            # Response validators
│   │   │       ├── persona-validator.ts
│   │   │       ├── script-validator.ts
│   │   │       └── schema-validator.ts
│   │   ├── workers/                   # Background job processing
│   │   │   ├── queue/
│   │   │   │   ├── queue.ts           # Bull queue setup
│   │   │   │   ├── connection.ts      # Redis connection
│   │   │   │   └── config.ts
│   │   │   ├── processors/            # Job processors
│   │   │   │   ├── scraper/
│   │   │   │   │   ├── scraper.ts
│   │   │   │   │   └── scraper.test.ts
│   │   │   │   ├── persona/
│   │   │   │   │   ├── persona-gen.ts
│   │   │   │   │   └── persona-gen.test.ts
│   │   │   │   ├── script/
│   │   │   │   │   ├── script-gen.ts
│   │   │   │   │   ├── script-batch.ts
│   │   │   │   │   └── script-gen.test.ts
│   │   │   │   ├── scoring/
│   │   │   │   │   ├── scorer.ts
│   │   │   │   │   ├── trend-scorer.ts
│   │   │   │   │   └── scorer.test.ts
│   │   │   │   ├── assets/
│   │   │   │   │   ├── asset-gen.ts
│   │   │   │   │   ├── image-gen.ts
│   │   │   │   │   └── video-gen.ts
│   │   │   │   └── cleanup/
│   │   │   │       └── cleanup.ts
│   │   │   └── jobs/                  # Job definitions
│   │   │       ├── types.ts
│   │   │       ├── scrape-job.ts
│   │   │       ├── persona-job.ts
│   │   │       ├── script-job.ts
│   │   │       ├── score-job.ts
│   │   │       └── asset-job.ts
│   │   ├── services/                  # Business logic services
│   │   │   ├── scraper/
│   │   │   │   ├── scraper-service.ts
│   │   │   │   ├── url-validator.ts
│   │   │   │   └── content-extractor.ts
│   │   │   ├── persona/
│   │   │   │   ├── persona-service.ts
│   │   │   │   └── persona-cache.ts
│   │   │   ├── script/
│   │   │   │   ├── script-service.ts
│   │   │   │   ├── script-generator.ts
│   │   │   │   └── script-optimizer.ts
│   │   │   ├── scoring/
│   │   │   │   ├── scoring-service.ts
│   │   │   │   ├── trend-service.ts
│   │   │   │   ├── llm-scorer.ts
│   │   │   │   └── viral-scorer.ts
│   │   │   ├── assets/
│   │   │   │   ├── asset-service.ts
│   │   │   │   ├── image-service.ts
│   │   │   │   └── video-service.ts
│   │   │   └── export/
│   │   │       ├── export-service.ts
│   │   │       ├── json-exporter.ts
│   │   │       └── csv-exporter.ts
│   │   ├── utils/                     # Utility functions
│   │   │   ├── validation/
│   │   │   │   ├── validation.ts
│   │   │   │   └── schemas.ts
│   │   │   ├── formatting/
│   │   │   │   ├── date-formatter.ts
│   │   │   │   └── text-formatter.ts
│   │   │   ├── errors/
│   │   │   │   ├── error-handler.ts
│   │   │   │   ├── error-types.ts
│   │   │   │   └── error-logger.ts
│   │   │   ├── cache/
│   │   │   │   ├── cache.ts
│   │   │   │   └── cache-keys.ts
│   │   │   ├── rate-limit/
│   │   │   │   └── rate-limiter.ts
│   │   │   ├── logger/
│   │   │   │   ├── logger.ts
│   │   │   │   └── log-levels.ts
│   │   │   └── helpers/
│   │   │       ├── array-helpers.ts
│   │   │       ├── object-helpers.ts
│   │   │       └── string-helpers.ts
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── data/
│   │   │   │   ├── use-companies.ts
│   │   │   │   ├── use-company.ts
│   │   │   │   ├── use-personas.ts
│   │   │   │   ├── use-scripts.ts
│   │   │   │   ├── use-scores.ts
│   │   │   │   └── use-assets.ts
│   │   │   ├── realtime/
│   │   │   │   ├── use-realtime.ts
│   │   │   │   ├── use-job-status.ts
│   │   │   │   └── use-live-updates.ts
│   │   │   ├── ui/
│   │   │   │   ├── use-toast.ts
│   │   │   │   ├── use-modal.ts
│   │   │   │   └── use-theme.ts
│   │   │   └── utils/
│   │   │       ├── use-debounce.ts
│   │   │       ├── use-throttle.ts
│   │   │       ├── use-local-storage.ts
│   │   │       └── use-auth.ts
│   │   └── types/                     # TypeScript types
│   │       ├── database.types.ts      # Generated from Supabase
│   │       ├── api.types.ts
│   │       ├── ai.types.ts
│   │       ├── job.types.ts
│   │       ├── company.types.ts
│   │       ├── persona.types.ts
│   │       ├── script.types.ts
│   │       ├── score.types.ts
│   │       ├── asset.types.ts
│   │       └── index.ts
│   ├── config/                        # Configuration files
│   │   ├── constants.ts
│   │   ├── env.ts                     # Environment validation
│   │   ├── ai-config.ts
│   │   ├── worker-config.ts
│   │   ├── cache-config.ts
│   │   └── rate-limit-config.ts
│   └── styles/                        # Global styles
│       ├── globals.css
│       ├── variables.css
│       └── themes/
│           ├── light.css
│           └── dark.css
├── supabase/                          # Supabase configuration
│   ├── migrations/                    # Database migrations
│   │   ├── 20250101000000_init_schema.sql
│   │   ├── 20250101000001_auth_setup.sql
│   │   ├── 20250101000002_rls_policies.sql
│   │   ├── 20250101000003_functions.sql
│   │   └── 20250101000004_indexes.sql
│   ├── functions/                     # Edge functions
│   │   └── realtime-webhook/
│   │       └── index.ts
│   ├── seed.sql                       # Seed data
│   └── config.toml
├── workers/                           # Standalone worker application
│   ├── src/
│   │   ├── index.ts
│   │   ├── processors/
│   │   └── config/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── tests/                             # Test files
│   ├── unit/
│   │   ├── lib/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── api/
│   │   └── workers/
│   └── e2e/
│       ├── auth.spec.ts
│       ├── company-flow.spec.ts
│       └── script-generation.spec.ts
├── scripts/                           # Utility scripts
│   ├── setup-db.ts
│   ├── seed-data.ts
│   ├── migrate.ts
│   └── generate-types.ts
├── public/                            # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
├── docs/                              # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── CONTRIBUTING.md
│   └── WORKER_SYSTEM.md
├── .env.local
├── .env.example
├── .env.test
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── .prettierignore
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── vitest.config.ts
├── package.json
├── package-lock.json
├── README.md
└── LICENSE
```


### 0.3 Database Schema Design

#### Complete SQL Migrations:

**Migration 1: Core Tables (20250101000000_init_schema.sql)**
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  uvp TEXT NOT NULL,
  industry TEXT,
  metadata JSONB DEFAULT '{}',
  scraped_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scraping', 'ready', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Personas table
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  industry TEXT,
  company_size TEXT,
  pain_points TEXT[],
  goals TEXT[],
  buying_motivations TEXT[],
  objections TEXT[],
  preferred_channels TEXT[],
  demographics JSONB DEFAULT '{}',
  psychographics JSONB DEFAULT '{}',
  persona_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Script batches table
CREATE TABLE script_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  template_type TEXT,
  creative_angle TEXT,
  temperature FLOAT DEFAULT 0.7,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  scripts_generated INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Scripts table
CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES script_batches(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  cta TEXT NOT NULL,
  keywords TEXT[],
  creative_angle TEXT,
  target_platform TEXT DEFAULT 'linkedin',
  tone TEXT,
  script_data JSONB DEFAULT '{}',
  is_winner BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE UNIQUE,
  trend_score INT CHECK (trend_score >= 0 AND trend_score <= 100),
  llm_score INT CHECK (llm_score >= 0 AND llm_score <= 100),
  viral_score INT CHECK (viral_score >= 0 AND viral_score <= 100),
  final_score FLOAT CHECK (final_score >= 0 AND final_score <= 100),
  trend_rationale TEXT,
  llm_rationale TEXT,
  viral_rationale TEXT,
  scoring_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE UNIQUE,
  image_brief JSONB DEFAULT '{}',
  video_brief JSONB DEFAULT '{}',
  image_urls TEXT[],
  video_urls TEXT[],
  storage_paths TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table (for tracking background tasks)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type TEXT NOT NULL,
  job_id TEXT NOT NULL UNIQUE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  reference_id UUID,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'active', 'completed', 'failed', 'delayed', 'paused')),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  result JSONB DEFAULT '{}',
  error JSONB DEFAULT '{}',
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- Campaign tracking (for Phase 2)
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  budget_cents INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  script_ids UUID[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);

CREATE INDEX idx_personas_company_id ON personas(company_id);

CREATE INDEX idx_script_batches_company_id ON script_batches(company_id);
CREATE INDEX idx_script_batches_persona_id ON script_batches(persona_id);
CREATE INDEX idx_script_batches_status ON script_batches(status);

CREATE INDEX idx_scripts_company_id ON scripts(company_id);
CREATE INDEX idx_scripts_persona_id ON scripts(persona_id);
CREATE INDEX idx_scripts_batch_id ON scripts(batch_id);
CREATE INDEX idx_scripts_is_winner ON scripts(is_winner) WHERE is_winner = TRUE;
CREATE INDEX idx_scripts_is_active ON scripts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_scripts_created_at ON scripts(created_at DESC);

CREATE INDEX idx_scores_script_id ON scores(script_id);
CREATE INDEX idx_scores_final_score ON scores(final_score DESC);

CREATE INDEX idx_assets_script_id ON assets(script_id);
CREATE INDEX idx_assets_status ON assets(status);

CREATE INDEX idx_jobs_job_id ON jobs(job_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

CREATE INDEX idx_campaigns_company_id ON campaigns(company_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Create composite indexes for common queries
CREATE INDEX idx_scripts_company_winner ON scripts(company_id, is_winner) WHERE is_active = TRUE;
CREATE INDEX idx_scripts_persona_active ON scripts(persona_id, is_active) WHERE is_active = TRUE;

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_companies_metadata_gin ON companies USING gin(metadata);
CREATE INDEX idx_personas_persona_data_gin ON personas USING gin(persona_data);
CREATE INDEX idx_scripts_script_data_gin ON scripts USING gin(script_data);
CREATE INDEX idx_scores_scoring_data_gin ON scores USING gin(scoring_data);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Apply triggers to tables
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personas_updated_at 
  BEFORE UPDATE ON personas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at 
  BEFORE UPDATE ON scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scores_updated_at 
  BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at 
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Migration 2: Row Level Security (20250101000002_rls_policies.sql)**
```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their own companies"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- Personas policies
CREATE POLICY "Users can view personas of their companies"
  ON personas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = personas.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert personas for their companies"
  ON personas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = personas.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update personas of their companies"
  ON personas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = personas.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Script batches policies
CREATE POLICY "Users can view script batches of their companies"
  ON script_batches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = script_batches.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Scripts policies
CREATE POLICY "Users can view scripts of their companies"
  ON scripts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = scripts.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scripts of their companies"
  ON scripts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = scripts.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Scores policies
CREATE POLICY "Users can view scores of their scripts"
  ON scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scripts
      JOIN companies ON companies.id = scripts.company_id
      WHERE scripts.id = scores.script_id
      AND companies.user_id = auth.uid()
    )
  );

-- Assets policies
CREATE POLICY "Users can view assets of their scripts"
  ON assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scripts
      JOIN companies ON companies.id = scripts.company_id
      WHERE scripts.id = assets.script_id
      AND companies.user_id = auth.uid()
    )
  );

-- Jobs policies
CREATE POLICY "Users can view their own jobs"
  ON jobs FOR SELECT
  USING (
    company_id IS NULL OR
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Campaigns policies
CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = campaigns.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own campaigns"
  ON campaigns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = campaigns.company_id
      AND companies.user_id = auth.uid()
    )
  );
```

**Migration 3: Database Functions (20250101000003_functions.sql)**
```sql
-- Function to get top scripts for a company
CREATE OR REPLACE FUNCTION get_top_scripts(
  p_company_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  script_id UUID,
  headline TEXT,
  body TEXT,
  cta TEXT,
  persona_name TEXT,
  final_score FLOAT,
  trend_score INT,
  llm_score INT,
  viral_score INT,
  creative_angle TEXT,
  keywords TEXT[]
) AS \$\$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS script_id,
    s.headline,
    s.body,
    s.cta,
    p.name AS persona_name,
    sc.final_score,
    sc.trend_score,
    sc.llm_score,
    sc.viral_score,
    s.creative_angle,
    s.keywords
  FROM scripts s
  JOIN personas p ON s.persona_id = p.id
  JOIN scores sc ON s.id = sc.script_id
  WHERE s.company_id = p_company_id
    AND s.is_active = TRUE
  ORDER BY sc.final_score DESC
  LIMIT p_limit;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark top scripts as winners
CREATE OR REPLACE FUNCTION mark_top_scripts_as_winners(
  p_company_id UUID,
  p_top_n INT DEFAULT 10
)
RETURNS INT AS \$\$
DECLARE
  updated_count INT;
BEGIN
  -- First, unmark all existing winners for this company
  UPDATE scripts
  SET is_winner = FALSE
  WHERE company_id = p_company_id;

  -- Mark top N scripts as winners
  WITH top_scripts AS (
    SELECT s.id
    FROM scripts s
    JOIN scores sc ON s.id = sc.script_id
    WHERE s.company_id = p_company_id
      AND s.is_active = TRUE
    ORDER BY sc.final_score DESC
    LIMIT p_top_n
  )
  UPDATE scripts
  SET is_winner = TRUE
  WHERE id IN (SELECT id FROM top_scripts);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get company statistics
CREATE OR REPLACE FUNCTION get_company_stats(p_company_id UUID)
RETURNS JSONB AS \$\$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_personas', (
      SELECT COUNT(*) FROM personas WHERE company_id = p_company_id
    ),
    'total_scripts', (
      SELECT COUNT(*) FROM scripts WHERE company_id = p_company_id AND is_active = TRUE
    ),
    'total_winners', (
      SELECT COUNT(*) FROM scripts WHERE company_id = p_company_id AND is_winner = TRUE
    ),
    'avg_score', (
      SELECT COALESCE(ROUND(AVG(final_score)::numeric, 2), 0)
      FROM scores sc
      JOIN scripts s ON sc.script_id = s.id
      WHERE s.company_id = p_company_id AND s.is_active = TRUE
    ),
    'max_score', (
      SELECT COALESCE(MAX(final_score), 0)
      FROM scores sc
      JOIN scripts s ON sc.script_id = s.id
      WHERE s.company_id = p_company_id AND s.is_active = TRUE
    ),
    'assets_generated', (
      SELECT COUNT(*)
      FROM assets a
      JOIN scripts s ON a.script_id = s.id
      WHERE s.company_id = p_company_id
      AND a.status = 'completed'
    ),
    'pending_jobs', (
      SELECT COUNT(*)
      FROM jobs
      WHERE company_id = p_company_id
      AND status IN ('queued', 'active')
    )
  ) INTO stats;

  RETURN stats;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get persona performance
CREATE OR REPLACE FUNCTION get_persona_performance(p_persona_id UUID)
RETURNS JSONB AS \$\$
DECLARE
  performance JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_scripts', (
      SELECT COUNT(*) FROM scripts WHERE persona_id = p_persona_id AND is_active = TRUE
    ),
    'avg_score', (
      SELECT COALESCE(ROUND(AVG(sc.final_score)::numeric, 2), 0)
      FROM scores sc
      JOIN scripts s ON sc.script_id = s.id
      WHERE s.persona_id = p_persona_id AND s.is_active = TRUE
    ),
    'top_keywords', (
      SELECT COALESCE(
        jsonb_agg(DISTINCT keyword ORDER BY keyword)
        FILTER (WHERE keyword IS NOT NULL),
        '[]'::jsonb
      )
      FROM scripts s, unnest(s.keywords) AS keyword
      WHERE s.persona_id = p_persona_id AND s.is_active = TRUE
      LIMIT 10
    ),
    'winners_count', (
      SELECT COUNT(*) FROM scripts 
      WHERE persona_id = p_persona_id AND is_winner = TRUE
    )
  ) INTO performance;

  RETURN performance;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old jobs
CREATE OR REPLACE FUNCTION cleanup_old_jobs(days_old INT DEFAULT 30)
RETURNS INT AS \$\$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM jobs
  WHERE status IN ('completed', 'failed')
    AND (completed_at < NOW() - INTERVAL '1 day' * days_old
         OR failed_at < NOW() - INTERVAL '1 day' * days_old);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate weighted score
CREATE OR REPLACE FUNCTION calculate_weighted_score(
  p_trend_score INT,
  p_llm_score INT,
  p_viral_score INT
)
RETURNS FLOAT AS \$\$
BEGIN
  -- Weights: LLM 45%, Trend 35%, Viral 20%
  RETURN (
    (COALESCE(p_llm_score, 0) * 0.45) +
    (COALESCE(p_trend_score, 0) * 0.35) +
    (COALESCE(p_viral_score, 0) * 0.20)
  );
END;
\$\$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get scripts by score range
CREATE OR REPLACE FUNCTION get_scripts_by_score_range(
  p_company_id UUID,
  p_min_score FLOAT,
  p_max_score FLOAT
)
RETURNS SETOF scripts AS \$\$
BEGIN
  RETURN QUERY
  SELECT s.*
  FROM scripts s
  JOIN scores sc ON s.id = sc.script_id
  WHERE s.company_id = p_company_id
    AND s.is_active = TRUE
    AND sc.final_score >= p_min_score
    AND sc.final_score <= p_max_score
  ORDER BY sc.final_score DESC;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;
```

