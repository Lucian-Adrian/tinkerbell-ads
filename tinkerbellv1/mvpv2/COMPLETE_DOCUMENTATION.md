# Tinkerbell MVP v2 - Complete System Documentation

## 📋 System Overview

Tinkerbell is an AI-powered B2B marketing campaign generator that automates the entire process from company analysis to production-ready marketing assets.

**Flow**: URL + UVP → Context Extraction → Personas → Scripts → Scoring → Assets (Images + Videos)

---

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase (PostgreSQL)
- **AI Services**: 
  - Gemini 2.5 Flash (text generation)
  - Imagen 4 Fast (image generation)
  - Veo 3 Fast (video generation)
- **Queue**: Custom job queue system
- **Storage**: Supabase Storage (images/videos)

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  Next.js Pages • React Components • Real-time Updates       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Routes Layer                        │
│  /api/ingest • /api/personas • /api/scripts • /api/scores   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  Services: Ingestion • Persona • Script • Scoring • Asset   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data & AI Services                        │
│  Supabase DB • Gemini API • Imagen API • Veo API           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure (Fully Organized)

```
mvpv2/
│
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── .env.local.example              # Environment variables template
├── .gitignore                      # Git ignore rules
│
├── README.md                       # Project overview & setup
├── IMPLEMENTATION_PLAN.md          # Detailed implementation plan
├── BUILD_PROGRESS.md               # Current build status
├── COMPLETE_DOCUMENTATION.md       # This file
│
├── public/                         # Static Assets
│   ├── images/                     # Images
│   └── fonts/                      # Fonts
│
├── types/                          # TypeScript Type Definitions
│   ├── database.ts                 # Database schema types
│   ├── api.ts                      # API request/response types
│   ├── ai.ts                       # AI service types
│   └── index.ts                    # Type exports
│
├── lib/                            # Core Libraries
│   │
│   ├── constants/                  # Application Constants
│   │   ├── seeds.ts                # 20 guerrilla marketing seeds
│   │   ├── temperatures.ts         # Temperature schedule
│   │   ├── scoring-weights.ts      # ViralCheck formula
│   │   ├── api-endpoints.ts        # API endpoint constants
│   │   └── index.ts
│   │
│   ├── utils/                      # Utility Functions
│   │   ├── cn.ts                   # Tailwind class merger
│   │   ├── format.ts               # Formatting utilities
│   │   ├── validation.ts           # Zod validation schemas
│   │   ├── date.ts                 # Date formatting
│   │   ├── error-handler.ts        # Error handling classes
│   │   ├── logger.ts               # Logging utility
│   │   ├── retry.ts                # Retry with backoff
│   │   └── index.ts
│   │
│   ├── ai/                         # AI Service Integrations
│   │   ├── gemini/                 # Gemini Services
│   │   │   ├── client.ts           # Gemini client setup
│   │   │   ├── text-generation.ts  # Text generation
│   │   │   ├── structured-output.ts # JSON structured output
│   │   │   └── thinking-config.ts  # Thinking budget config
│   │   │
│   │   ├── imagen/                 # Imagen Services
│   │   │   ├── client.ts           # Imagen client
│   │   │   ├── image-generation.ts # Image generation
│   │   │   ├── prompt-builder.ts   # Prompt engineering
│   │   │   └── config.ts
│   │   │
│   │   ├── veo/                    # Veo Services
│   │   │   ├── client.ts           # Veo client
│   │   │   ├── video-generation.ts # Video generation
│   │   │   └── config.ts
│   │   │
│   │   └── prompts/                # Prompt Templates
│   │       ├── persona-generation.ts
│   │       ├── script-generation.ts
│   │       ├── scoring-prompts.ts
│   │       ├── image-brief-prompts.ts
│   │       └── video-brief-prompts.ts
│   │
│   ├── supabase/                   # Supabase Integration
│   │   ├── client.ts               # Browser client
│   │   ├── server-client.ts        # Server client
│   │   ├── auth.ts                 # Auth helpers
│   │   ├── storage.ts              # Storage helpers
│   │   ├── realtime.ts             # Realtime subscriptions
│   │   └── database/               # Database Operations
│   │       ├── companies.ts
│   │       ├── personas.ts
│   │       ├── scripts.ts
│   │       ├── scores.ts
│   │       ├── assets.ts
│   │       └── jobs.ts
│   │
│   ├── services/                   # Business Logic Services
│   │   ├── ingestion-service.ts    # URL scraping & context
│   │   ├── persona-service.ts      # Persona generation
│   │   ├── script-service.ts       # Script generation
│   │   ├── scoring-service.ts      # ViralCheck scoring
│   │   ├── asset-service.ts        # Asset generation
│   │   ├── trends-service.ts       # Google Trends integration
│   │   └── job-service.ts          # Job management
│   │
│   └── queue/                      # Job Queue System
│       ├── queue-manager.ts        # Queue management
│       ├── worker.ts               # Worker process
│       ├── job-types.ts            # Job type definitions
│       └── handlers/               # Job Handlers
│           ├── scrape-handler.ts
│           ├── persona-handler.ts
│           ├── script-handler.ts
│           ├── score-handler.ts
│           └── asset-handler.ts
│
├── config/                         # Configuration Files
│   ├── site.ts                     # Site configuration
│   ├── env.ts                      # Environment configuration
│   └── navigation.ts               # Navigation configuration
│
├── components/                     # React Components
│   │
│   ├── ui/                         # Base UI Components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── skeleton.tsx
│   │   ├── spinner.tsx
│   │   └── toast.tsx
│   │
│   ├── layout/                     # Layout Components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   └── navigation.tsx
│   │
│   ├── forms/                      # Form Components
│   │   ├── ingest-form.tsx
│   │   ├── persona-selector.tsx
│   │   └── script-filters.tsx
│   │
│   ├── dashboard/                  # Dashboard Components
│   │   ├── stats-card.tsx
│   │   ├── project-card.tsx
│   │   └── project-list.tsx
│   │
│   ├── personas/                   # Persona Components
│   │   ├── persona-card.tsx
│   │   ├── persona-list.tsx
│   │   └── persona-generator.tsx
│   │
│   ├── scripts/                    # Script Components
│   │   ├── script-card.tsx
│   │   ├── script-list.tsx
│   │   ├── script-detail.tsx
│   │   └── batch-progress.tsx
│   │
│   ├── scores/                     # Scoring Components
│   │   ├── score-badge.tsx
│   │   ├── score-breakdown.tsx
│   │   └── viral-check-indicator.tsx
│   │
│   ├── assets/                     # Asset Components
│   │   ├── image-gallery.tsx
│   │   ├── video-player.tsx
│   │   └── asset-generator.tsx
│   │
│   └── shared/                     # Shared Components
│       ├── error-boundary.tsx
│       ├── loading-state.tsx
│       └── empty-state.tsx
│
├── app/                            # Next.js App Router
│   │
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   ├── globals.css                 # Global styles
│   │
│   ├── (auth)/                     # Auth Routes
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   │
│   ├── (dashboard)/                # Dashboard Routes
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── personas/page.tsx
│   │   │       ├── scripts/page.tsx
│   │   │       └── results/page.tsx
│   │   └── settings/page.tsx
│   │
│   └── api/                        # API Routes
│       ├── health/route.ts
│       ├── ingest/route.ts
│       ├── personas/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   └── generate/route.ts
│       ├── scripts/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── generate/route.ts
│       │   └── batch/[batchId]/route.ts
│       ├── scores/
│       │   ├── route.ts
│       │   ├── calculate/route.ts
│       │   └── trends/route.ts
│       ├── assets/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── generate-images/route.ts
│       │   └── generate-videos/route.ts
│       ├── jobs/
│       │   └── [id]/route.ts
│       └── webhooks/
│           └── supabase/route.ts
│
├── hooks/                          # React Hooks
│   ├── use-supabase.ts
│   ├── use-auth.ts
│   ├── use-realtime.ts
│   └── use-toast.ts
│
├── contexts/                       # React Contexts
│   ├── auth-context.tsx
│   ├── theme-context.tsx
│   └── toast-context.tsx
│
├── supabase/                       # Supabase Configuration
│   ├── migrations/                 # SQL Migrations
│   │   ├── 001_initial_schema.sql      # Tables, indexes, comments
│   │   └── 002_add_rls_policies.sql    # Row-level security
│   └── config.toml
│
├── scripts/                        # Utility Scripts
│   ├── setup-db.ts                 # Database setup
│   ├── seed-data.ts                # Seed test data
│   └── migrate.ts                  # Migration runner
│
└── docs/                           # Documentation
    ├── API.md                      # API documentation
    ├── ARCHITECTURE.md             # Architecture docs
    ├── DEPLOYMENT.md               # Deployment guide
    ├── DATABASE.md                 # Database schema
    └── AI_INTEGRATION.md           # AI integration guide
```

---

## 🗄️ Database Schema

### Tables

#### 1. companies
Stores company information and scraped context.

```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- url (TEXT) - Company website URL
- uvp (TEXT) - Unique value proposition
- metadata (JSONB) - Scraped content
- scraped_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

#### 2. personas
Generated buyer personas.

```sql
- id (UUID, PK)
- company_id (UUID, FK → companies)
- name (TEXT)
- persona_json (JSONB) - Complete persona data
- created_at (TIMESTAMPTZ)
```

#### 3. script_batches
Batch metadata for script generation.

```sql
- id (UUID, PK)
- company_id (UUID, FK → companies)
- persona_id (UUID, FK → personas)
- seed_template (TEXT) - Guerrilla seed keyword
- temperature (DECIMAL) - AI temperature (0.0-1.0)
- status (TEXT) - pending|processing|completed|failed
- created_at (TIMESTAMPTZ)
```

#### 4. scripts
Individual ad scripts.

```sql
- id (UUID, PK)
- batch_id (UUID, FK → script_batches)
- persona_id (UUID, FK → personas)
- headline (TEXT)
- body (TEXT)
- cta (TEXT)
- keywords (TEXT[])
- idea_json (JSONB) - Complete idea data
- created_at (TIMESTAMPTZ)
```

#### 5. scores
ViralCheck scoring results.

```sql
- id (UUID, PK)
- script_id (UUID, FK → scripts, UNIQUE)
- trend_score (INTEGER, 0-100)
- llm_score (INTEGER, 0-100)
- viral_score (INTEGER, 0-100)
- final_score (DECIMAL)
- rationale (TEXT)
- created_at (TIMESTAMPTZ)
```

#### 6. assets
Generated images and videos.

```sql
- id (UUID, PK)
- script_id (UUID, FK → scripts, UNIQUE)
- image_brief (JSONB)
- video_brief (JSONB)
- image_urls (TEXT[])
- video_urls (TEXT[])
- created_at (TIMESTAMPTZ)
```

#### 7. jobs
Background job queue.

```sql
- id (UUID, PK)
- type (TEXT) - scrape|generate_personas|generate_scripts|...
- status (TEXT) - pending|processing|completed|failed
- payload (JSONB)
- result (JSONB)
- error (TEXT)
- created_at (TIMESTAMPTZ)
- completed_at (TIMESTAMPTZ)
```

### Row-Level Security (RLS)

All tables have RLS policies ensuring users can only access their own data through the `user_id` foreign key chain.

---

## 🤖 AI Configuration

### Gemini 2.5 Flash
- **Purpose**: Text generation (personas, scripts, scoring)
- **Thinking**: Disabled (thinkingBudget: 0) for speed
- **Temperature**: Variable (0.2-0.8) for diversity
- **Output**: Structured JSON with schemas

### Imagen 4 Fast
- **Purpose**: Image generation for top 10 scripts
- **Config**:
  - numberOfImages: 4
  - aspectRatio: 16:9
  - personGeneration: allow_adult

### Veo 3 Fast
- **Purpose**: Video generation for top 3 scripts
- **Config**:
  - duration: 6 seconds
  - noAudio: true

---

## 📊 ViralCheck Scoring Formula

```
final_score = (0.45 × llm_score) + (0.35 × trend_score) + (0.20 × viral_score)
```

- **LLM Score**: Gemini predictive analysis (0-100)
- **Trend Score**: Google Trends keyword velocity (0-100)
- **Viral Score**: Pattern matching with successful campaigns (0-100)

### Score Classification
- **Excellent**: ≥80
- **Good**: 65-79
- **Average**: 50-64
- **Poor**: 35-49
- **Very Poor**: <35

---

## 🎯 Guerrilla Marketing Seeds (20 Total)

1. unconventional_approach
2. surprise_element
3. emotional_hook
4. problem_agitate_solve
5. contrarian_viewpoint
6. social_proof_extreme
7. urgency_scarcity
8. curiosity_gap
9. transformation_story
10. insider_secret
11. myth_busting
12. before_after_dramatic
13. challenge_accepted
14. exclusive_access
15. hidden_benefit
16. reverse_psychology
17. fear_of_missing_out
18. aspirational_identity
19. pain_amplification
20. unique_mechanism

Each seed ensures unique script angles.

---

## 🔄 System Workflow

### 1. Ingestion
```
POST /api/ingest { url, uvp }
→ Scrape website
→ Extract metadata
→ Store in companies table
→ Create job for persona generation
```

### 2. Persona Generation
```
Job: generate_personas
→ Use Gemini with company context
→ Generate 3 personas
→ Store in personas table
→ User selects 1 persona
```

### 3. Script Generation
```
POST /api/scripts/generate { personaId, batches: 4 }
→ Create 4 batches
→ Each batch:
  - Uses different seed keyword
  - Uses different temperature
  - Generates 5 scripts
→ Total: 20 scripts
→ Store in scripts table
```

### 4. Scoring
```
POST /api/scores/calculate { scriptIds }
→ For each script:
  - Get trend score (Google Trends)
  - Get LLM score (Gemini)
  - Get viral score (Pattern matching)
  - Calculate final score
→ Store in scores table
→ Rank scripts by final_score
```

### 5. Asset Generation
```
Top 10 scripts:
POST /api/assets/generate-images { scriptIds }
→ Generate image briefs
→ Call Imagen 4 Fast (4 images each)
→ Store in Supabase Storage
→ Save URLs in assets table

Top 3 scripts:
POST /api/assets/generate-videos { scriptIds }
→ Generate video briefs
→ Call Veo 3 Fast (6s videos)
→ Store in Supabase Storage
→ Save URLs in assets table
```

---

## 🚀 Getting Started

### 1. Installation
```bash
cd mvpv2
npm install
```

### 2. Environment Setup
```bash
cp .env.local.example .env.local
```

Fill in:
- Supabase URL and keys
- Google AI API key
- Model names

### 3. Database Setup
```bash
# Run migrations
npm run setup-db
```

### 4. Development
```bash
npm run dev
```

Open http://localhost:3000

---

## 📦 Dependencies

### Core
- next@15.5.4
- react@19.0.0
- typescript@5

### Database
- @supabase/supabase-js@2.46.1

### AI
- @google/generative-ai@0.21.0

### Utilities
- axios@1.7.9 (HTTP)
- cheerio@1.0.0 (scraping)
- zod@3.24.1 (validation)
- date-fns@4.1.0 (dates)

### UI
- tailwindcss@3.4.1
- clsx@2.1.1
- tailwind-merge@2.6.0
- lucide-react@0.468.0 (icons)
- tailwindcss-animate@1.0.7

---

## 🔐 Security

- **Row-Level Security**: All tables protected by RLS
- **User Isolation**: Users only see their own data
- **API Keys**: Protected in environment variables
- **Signed URLs**: Media assets served via Supabase signed URLs
- **Input Validation**: All inputs validated with Zod schemas

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/ingest` | Ingest company |
| GET | `/api/personas` | List personas |
| POST | `/api/personas/generate` | Generate personas |
| GET | `/api/scripts` | List scripts |
| POST | `/api/scripts/generate` | Generate scripts |
| POST | `/api/scores/calculate` | Calculate scores |
| POST | `/api/assets/generate-images` | Generate images |
| POST | `/api/assets/generate-videos` | Generate videos |
| GET | `/api/jobs/:id` | Get job status |

---

## 📈 System Limits

- **Max personas per company**: 3
- **Max scripts per persona**: 20 (4 batches × 5)
- **Script batch size**: 5
- **Max image generation**: 10 scripts (40 images total)
- **Max video generation**: 3 scripts
- **Images per script**: 4
- **Video duration**: 6 seconds

---

## 🎨 UI Features

- Responsive design (mobile, tablet, desktop)
- Real-time job progress updates
- Loading skeletons
- Error boundaries
- Toast notifications
- Dark mode ready

---

## 📚 Documentation Files

1. **README.md** - Setup and overview
2. **IMPLEMENTATION_PLAN.md** - Detailed implementation plan
3. **BUILD_PROGRESS.md** - Current build status
4. **COMPLETE_DOCUMENTATION.md** - This file
5. **Database migrations** - SQL schema and RLS policies

---

## 🔧 Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Self-Hosted
1. Build: `npm run build`
2. Start: `npm start`
3. Ensure environment variables are set

---

## 📊 Project Statistics

- **Total Files Created**: 40+
- **Total Lines of Code**: ~8000+
- **Type Definitions**: Complete
- **Database Migrations**: 2 files
- **Constants**: 4 modules
- **Utilities**: 7 modules
- **Configuration**: 3 modules

---

## ✅ Implementation Status

**Phase 1-2: Foundation (✅ COMPLETE)**
- Project setup
- Type system
- Constants
- Utilities
- Configuration
- Database migrations

**Phase 3: Core Services (🚧 NEXT)**
- Supabase integration
- AI services
- Business logic
- Job queue

**Phase 4: API Routes (📋 PLANNED)**
- All API endpoints

**Phase 5: Frontend (📋 PLANNED)**
- UI components
- Pages
- Forms
- Dashboard

---

## 🙏 Credits

Built with cutting-edge technologies:
- Next.js (Vercel)
- Supabase
- Google AI (Gemini, Imagen, Veo)
- Tailwind CSS

---

**Version**: 0.1.0  
**Last Updated**: January 2025  
**Status**: Foundation Complete, Core Services In Progress

For questions, refer to other documentation files or contact the development team.
