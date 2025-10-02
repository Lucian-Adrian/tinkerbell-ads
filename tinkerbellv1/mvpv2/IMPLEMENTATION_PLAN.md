# Tinkerbell MVP v2 - Implementation Plan

## Executive Summary
Build a complete B2B SaaS platform that automates marketing campaign creation using:
- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **AI**: Gemini 2.5 Flash for text, Imagen 4 Fast for images, Veo 3 Fast for videos
- **Architecture**: Microservices pattern with clean separation of concerns

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  Next.js App Router + React + TypeScript + Tailwind CSS         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Routes Layer                            │
│  /api/ingest, /api/personas, /api/scripts, /api/scores, etc.   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Services Layer                              │
│  AI Services | Database Services | Queue Services               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                              │
│  Supabase | Gemini API | Imagen API | Veo API                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure (Very Granular & Organized)

```
mvpv2/
├── README.md                           # Project overview & setup
├── IMPLEMENTATION_PLAN.md              # This file
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── .env.local.example
├── .gitignore
│
├── public/                             # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   ├── placeholder.png
│   │   └── icons/
│   └── fonts/
│
├── src/                                # Main source directory
│   │
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing page
│   │   ├── globals.css                 # Global styles
│   │   │
│   │   ├── (auth)/                     # Auth routes group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/                # Dashboard routes group
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── personas/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── scripts/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── results/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                        # API Routes
│   │       ├── health/
│   │       │   └── route.ts
│   │       ├── ingest/
│   │       │   └── route.ts            # URL ingestion & scraping
│   │       ├── personas/
│   │       │   ├── route.ts            # List/create personas
│   │       │   ├── [id]/
│   │       │   │   └── route.ts        # Get/update/delete persona
│   │       │   └── generate/
│   │       │       └── route.ts        # Generate personas
│   │       ├── scripts/
│   │       │   ├── route.ts            # List scripts
│   │       │   ├── [id]/
│   │       │   │   └── route.ts
│   │       │   ├── generate/
│   │       │   │   └── route.ts        # Generate script batches
│   │       │   └── batch/
│   │       │       └── [batchId]/
│   │       │           └── route.ts
│   │       ├── scores/
│   │       │   ├── route.ts
│   │       │   ├── calculate/
│   │       │   │   └── route.ts        # Calculate ViralCheck scores
│   │       │   └── trends/
│   │       │       └── route.ts        # Google Trends API
│   │       ├── assets/
│   │       │   ├── route.ts
│   │       │   ├── generate-images/
│   │       │   │   └── route.ts        # Imagen 4 Fast
│   │       │   ├── generate-videos/
│   │       │   │   └── route.ts        # Veo 3 Fast
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── jobs/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       └── webhooks/
│   │           └── supabase/
│   │               └── route.ts
│   │
│   ├── components/                     # React Components
│   │   │
│   │   ├── ui/                         # Base UI Components (shadcn-style)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── toast.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                     # Layout Components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── navigation.tsx
│   │   │   └── breadcrumbs.tsx
│   │   │
│   │   ├── forms/                      # Form Components
│   │   │   ├── ingest-form.tsx
│   │   │   ├── persona-selector.tsx
│   │   │   ├── script-filters.tsx
│   │   │   └── settings-form.tsx
│   │   │
│   │   ├── dashboard/                  # Dashboard Components
│   │   │   ├── stats-card.tsx
│   │   │   ├── project-card.tsx
│   │   │   ├── project-list.tsx
│   │   │   └── quick-actions.tsx
│   │   │
│   │   ├── personas/                   # Persona Components
│   │   │   ├── persona-card.tsx
│   │   │   ├── persona-list.tsx
│   │   │   ├── persona-detail.tsx
│   │   │   └── persona-generator.tsx
│   │   │
│   │   ├── scripts/                    # Script Components
│   │   │   ├── script-card.tsx
│   │   │   ├── script-list.tsx
│   │   │   ├── script-detail.tsx
│   │   │   ├── script-generator.tsx
│   │   │   ├── batch-progress.tsx
│   │   │   └── script-filters.tsx
│   │   │
│   │   ├── scores/                     # Scoring Components
│   │   │   ├── score-badge.tsx
│   │   │   ├── score-breakdown.tsx
│   │   │   ├── score-chart.tsx
│   │   │   └── viral-check-indicator.tsx
│   │   │
│   │   ├── assets/                     # Asset Components
│   │   │   ├── image-gallery.tsx
│   │   │   ├── video-player.tsx
│   │   │   ├── asset-card.tsx
│   │   │   └── asset-generator.tsx
│   │   │
│   │   └── shared/                     # Shared Components
│   │       ├── error-boundary.tsx
│   │       ├── loading-state.tsx
│   │       ├── empty-state.tsx
│   │       ├── confirmation-dialog.tsx
│   │       └── status-indicator.tsx
│   │
│   ├── lib/                            # Core Libraries & Utils
│   │   │
│   │   ├── ai/                         # AI Integration
│   │   │   ├── gemini/
│   │   │   │   ├── client.ts           # Gemini client setup
│   │   │   │   ├── text-generation.ts  # Text generation
│   │   │   │   ├── structured-output.ts # JSON structured output
│   │   │   │   ├── thinking-config.ts  # Thinking budget config
│   │   │   │   └── chat.ts             # Multi-turn conversations
│   │   │   │
│   │   │   ├── imagen/
│   │   │   │   ├── client.ts           # Imagen client
│   │   │   │   ├── image-generation.ts # Image generation
│   │   │   │   ├── prompt-builder.ts   # Prompt engineering
│   │   │   │   └── config.ts           # Imagen config
│   │   │   │
│   │   │   ├── veo/
│   │   │   │   ├── client.ts           # Veo client
│   │   │   │   ├── video-generation.ts # Video generation
│   │   │   │   └── config.ts           # Veo config
│   │   │   │
│   │   │   └── prompts/                # Prompt Templates
│   │   │       ├── persona-generation.ts
│   │   │       ├── script-generation.ts
│   │   │       ├── scoring-prompts.ts
│   │   │       ├── image-brief-prompts.ts
│   │   │       └── video-brief-prompts.ts
│   │   │
│   │   ├── supabase/                   # Supabase Integration
│   │   │   ├── client.ts               # Supabase client (browser)
│   │   │   ├── server-client.ts        # Supabase client (server)
│   │   │   ├── auth.ts                 # Auth helpers
│   │   │   ├── storage.ts              # Storage helpers
│   │   │   ├── realtime.ts             # Realtime subscriptions
│   │   │   └── database/               # Database operations
│   │   │       ├── companies.ts
│   │   │       ├── personas.ts
│   │   │       ├── scripts.ts
│   │   │       ├── scores.ts
│   │   │       ├── assets.ts
│   │   │       └── jobs.ts
│   │   │
│   │   ├── services/                   # Business Logic Services
│   │   │   ├── ingestion-service.ts    # URL scraping & context
│   │   │   ├── persona-service.ts      # Persona generation
│   │   │   ├── script-service.ts       # Script generation
│   │   │   ├── scoring-service.ts      # ViralCheck scoring
│   │   │   ├── asset-service.ts        # Asset generation
│   │   │   ├── trends-service.ts       # Google Trends
│   │   │   └── job-service.ts          # Background jobs
│   │   │
│   │   ├── queue/                      # Job Queue System
│   │   │   ├── queue-manager.ts        # Queue management
│   │   │   ├── worker.ts               # Worker process
│   │   │   ├── job-types.ts            # Job type definitions
│   │   │   └── handlers/               # Job handlers
│   │   │       ├── scrape-handler.ts
│   │   │       ├── persona-handler.ts
│   │   │       ├── script-handler.ts
│   │   │       ├── score-handler.ts
│   │   │       └── asset-handler.ts
│   │   │
│   │   ├── utils/                      # Utility Functions
│   │   │   ├── cn.ts                   # className utility
│   │   │   ├── format.ts               # Formatting helpers
│   │   │   ├── validation.ts           # Validation helpers
│   │   │   ├── date.ts                 # Date utilities
│   │   │   ├── error-handler.ts        # Error handling
│   │   │   ├── logger.ts               # Logging utility
│   │   │   └── retry.ts                # Retry logic
│   │   │
│   │   └── constants/                  # Constants
│   │       ├── seeds.ts                # Guerrilla marketing seeds
│   │       ├── temperatures.ts         # Temperature configs
│   │       ├── scoring-weights.ts      # Scoring formula weights
│   │       └── api-endpoints.ts        # API endpoint constants
│   │
│   ├── types/                          # TypeScript Types
│   │   ├── database.ts                 # Supabase DB types
│   │   ├── api.ts                      # API types
│   │   ├── ai.ts                       # AI response types
│   │   ├── company.ts
│   │   ├── persona.ts
│   │   ├── script.ts
│   │   ├── score.ts
│   │   ├── asset.ts
│   │   ├── job.ts
│   │   └── index.ts
│   │
│   ├── hooks/                          # React Hooks
│   │   ├── use-supabase.ts
│   │   ├── use-auth.ts
│   │   ├── use-realtime.ts
│   │   ├── use-toast.ts
│   │   ├── use-debounce.ts
│   │   └── use-local-storage.ts
│   │
│   ├── contexts/                       # React Contexts
│   │   ├── auth-context.tsx
│   │   ├── theme-context.tsx
│   │   └── toast-context.tsx
│   │
│   └── config/                         # Configuration Files
│       ├── site.ts                     # Site config
│       ├── navigation.ts               # Navigation config
│       └── env.ts                      # Environment config
│
├── supabase/                           # Supabase Configuration
│   ├── migrations/                     # SQL migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_rls_policies.sql
│   │   ├── 003_add_indexes.sql
│   │   └── 004_add_functions.sql
│   ├── functions/                      # Edge functions (optional)
│   └── config.toml
│
├── scripts/                            # Utility Scripts
│   ├── setup-db.ts                     # Database setup
│   ├── seed-data.ts                    # Seed test data
│   └── migrate.ts                      # Migration runner
│
├── docs/                               # Documentation
│   ├── API.md                          # API documentation
│   ├── ARCHITECTURE.md                 # Architecture docs
│   ├── DEPLOYMENT.md                   # Deployment guide
│   ├── DATABASE.md                     # Database schema docs
│   └── AI_INTEGRATION.md               # AI integration docs
│
└── tests/                              # Tests (optional for MVP)
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Implementation Phases

### Phase 1: Project Setup & Infrastructure (Steps 1-5)
1. Initialize Next.js project with TypeScript
2. Setup Tailwind CSS and UI components
3. Configure Supabase client
4. Create database schema and migrations
5. Setup environment variables

### Phase 2: Core Services (Steps 6-10)
6. Implement Gemini text generation service
7. Implement Imagen image generation service
8. Implement Veo video generation service
9. Setup Supabase database services
10. Create job queue system

### Phase 3: API Routes (Steps 11-15)
11. Implement ingestion API
12. Implement persona generation API
13. Implement script generation API
14. Implement scoring API
15. Implement asset generation API

### Phase 4: Frontend Components (Steps 16-20)
16. Build authentication pages
17. Build dashboard layout
18. Build project management UI
19. Build persona selection UI
20. Build script viewing UI

### Phase 5: Integration & Polish (Steps 21-25)
21. Implement realtime updates
22. Add loading states and error handling
23. Implement file storage
24. Add export functionality
25. Final testing and documentation

---

## Key Technical Decisions

### 1. AI Services Strategy
- **Gemini 2.5 Flash**: Text generation with thinking disabled for speed
- **Structured Output**: JSON schemas for all AI responses
- **Temperature Variation**: 0.2, 0.35, 0.5, 0.65, 0.8 across batches
- **Seed Keywords**: 20+ guerrilla marketing seeds for diversity

### 2. Batch Processing
- **Batch Size**: 5 scripts per batch
- **Total Batches**: 4 batches = 20 scripts per persona
- **Parallel Processing**: Multiple batches can run concurrently
- **Progress Tracking**: Realtime updates via Supabase

### 3. Scoring Formula (ViralCheck)
```
final_score = (0.45 × llm_score) + (0.35 × trend_score) + (0.20 × viral_score)
```
- **LLM Score**: Gemini predictive scoring (0-100)
- **Trend Score**: Google Trends keyword velocity (0-100)
- **Viral Score**: Pattern matching (future: RAG with viral videos)

### 4. Asset Generation
- **Top 10 Scripts**: Generate images with Imagen 4 Fast
  - 4 images per script
  - Aspect ratio: 16:9 (social media optimized)
  - numberOfImages: 4
- **Top 3 Scripts**: Generate videos with Veo 3 Fast
  - No audio (faster generation)
  - 6-second clips

### 5. Data Storage
- **PostgreSQL**: All structured data (companies, personas, scripts, scores)
- **Supabase Storage**: Images and videos with signed URLs
- **Realtime**: Job progress and status updates

---

## Seed Keywords (Guerrilla Marketing)

```typescript
const GUERRILLA_SEEDS = [
  "unconventional_approach",
  "surprise_element",
  "emotional_hook",
  "problem_agitate_solve",
  "contrarian_viewpoint",
  "social_proof_extreme",
  "urgency_scarcity",
  "curiosity_gap",
  "transformation_story",
  "insider_secret",
  "myth_busting",
  "before_after_dramatic",
  "challenge_accepted",
  "exclusive_access",
  "hidden_benefit",
  "reverse_psychology",
  "fear_of_missing_out",
  "aspirational_identity",
  "pain_amplification",
  "unique_mechanism"
];
```

---

## Temperature Schedule

```typescript
const TEMPERATURE_SCHEDULE = [0.2, 0.35, 0.5, 0.65, 0.8];
// Cycle through temperatures for each batch
```

---

## Database Schema Summary

### Tables
1. **companies**: id, user_id, url, uvp, metadata, scraped_at
2. **personas**: id, company_id, name, persona_json
3. **script_batches**: id, company_id, persona_id, seed, temperature, status
4. **scripts**: id, batch_id, persona_id, headline, body, cta, keywords, idea_json
5. **scores**: id, script_id, trend_score, llm_score, viral_score, final_score, rationale
6. **assets**: id, script_id, image_brief, video_brief, image_urls, video_urls
7. **jobs**: id, type, status, payload, result, error, created_at, completed_at

### Row-Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Policies based on user_id from auth.users

---

## API Endpoints

### Core Endpoints
- `POST /api/ingest` - Ingest company URL & UVP
- `GET /api/personas` - List personas
- `POST /api/personas/generate` - Generate personas
- `GET /api/scripts` - List scripts
- `POST /api/scripts/generate` - Generate script batches
- `POST /api/scores/calculate` - Calculate ViralCheck scores
- `POST /api/assets/generate-images` - Generate images
- `POST /api/assets/generate-videos` - Generate videos
- `GET /api/jobs/:id` - Get job status

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google AI
GOOGLE_AI_API_KEY=
GOOGLE_GEMINI_MODEL=gemini-2.5-flash
GOOGLE_IMAGEN_MODEL=imagen-4.0-fast-generate-001
GOOGLE_VEO_MODEL=veo-3-fast

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Success Criteria

### MVP Must Have
✅ User can input URL + UVP
✅ System scrapes and extracts context
✅ System generates 3 personas
✅ User selects 1 persona
✅ System generates 20 scripts (4 batches × 5 scripts)
✅ System scores all scripts (ViralCheck)
✅ System ranks and shows top 10
✅ System generates images for top 10
✅ System generates videos for top 3
✅ User can view and export results

### Nice to Have (Post-MVP)
- Multi-persona comparison
- Script editing
- Custom seed keywords
- A/B test suggestions
- Export to ad platforms
- Analytics dashboard

---

## Development Timeline

- **Phase 1**: 2-3 hours (Setup)
- **Phase 2**: 3-4 hours (Services)
- **Phase 3**: 2-3 hours (APIs)
- **Phase 4**: 3-4 hours (Frontend)
- **Phase 5**: 2-3 hours (Integration)

**Total**: ~12-17 hours for MVP

---

## Next Steps

1. ✅ Create this plan
2. Initialize Next.js project
3. Setup Supabase schema
4. Implement AI services
5. Build API routes
6. Create frontend UI
7. Test end-to-end
8. Document and deploy

---

*This plan is comprehensive and designed for systematic implementation. Each component is well-organized, documented, and follows best practices.*
