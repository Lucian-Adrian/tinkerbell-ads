# description.md — Tinkerbell System Architecture (Supabase + Gemini-2.5-Flash)

> **Note:** This version replaces Prisma with Supabase (PostgreSQL + realtime) and targets `gemini-2.5-flash` as the core LLM model.  
> I include links / documentation notes to working with Supabase in Next.js and Gemini API details.

---

## 1 — High-level overview (revised)

Tinkerbell now uses:
- **Supabase** as primary backend (PostgreSQL, Auth, Realtime, Storage)
- **Next.js (React + TS)** for frontend and serverless API routes (and possibly edge functions)
- **Worker / background processes** to offload heavy LLM / image / video tasks

Flow remains: ingest → personas → script generation → scoring → select winners → asset briefs → image/video generation → UI / export.

---

## 2 — Using Supabase instead of Prisma

### Supabase capabilities

Supabase provides:
- Hosted PostgreSQL DB  
- Auth & row-level security (RLS)  
- Realtime subscriptions (listen/notify)  
- Storage (for images / video files)  
- Edge functions / serverless functions (optional)  
- HTTP APIs over tables (auto-generated) and RPC functions

Docs: how to use Supabase + Next.js → [Supabase Next.js guide] :contentReference[oaicite:0]{index=0}  
Docs: schema & migrations in Supabase / custom schemas :contentReference[oaicite:1]{index=1}

### Data model in Supabase

We will create tables analogous to our original design (users, companies, personas, script_batches, scripts, scores, assets, jobs). Use SQL migration scripts (or Supabase’s migration tooling) to define them.

We define RLS policies so that each user only sees his/her own companies, scripts, etc.

We use Supabase’s realtime (listen / subscription) features to push job status updates from workers to the frontend.

Supabase Storage is used to store generated images / videos; we manage access via signed URLs.

---

## 3 — Gemini 2.5 Flash (model choice) & API notes

### Model selection: gemini-2.5-flash

According to Google’s docs, `gemini-2.5-flash` is a model in the Gemini family optimized for cost and performance, supporting reasoning (“thinking”) capabilities. :contentReference[oaicite:2]{index=2}  
The API is OpenAI-compatible (via the Gemini API OpenAI compatibility endpoint) :contentReference[oaicite:3]{index=3}  
You can pass parameter `reasoning_effort` or other controls, depending on the API variant. :contentReference[oaicite:4]{index=4}  

**Important caveat**: Some Gemini preview/flash variants may have quirks when using “tools” or agent frameworks. For example, in one issue, using the `gemini-2.5-flash-preview-05-20` model with `tools` caused null `choices[0].message` when content filters triggered. :contentReference[oaicite:5]{index=5}  
Thus, for stability, it's safer to keep prompt calls simple (no tool usage) or wrap error-handling for content filter cases.

The API supports structured responses (we can ask for JSON output) via the OpenAI-compatible Chat Completions interface. :contentReference[oaicite:6]{index=6}  

### Prompting & “thinking”

Gemini Flash is a “thinking” model: first the model may perform internal reasoning, then produce output. You can control thinking budgets in some variants. :contentReference[oaicite:7]{index=7}  

We should include in each prompt an instruction that responses must be valid JSON (strict schema). And wrap each call in error handling and fallback (e.g. re-prompt with slight variation, or retry).

---

## 4 — Updated architecture & pipeline (Supabase + Gemini)

### A. Ingestion & context

- Next.js frontend calls ` POST /api/ingest` (server route)
- That route writes a `companies` row (with `url`, `uvp`, `user_id`) in Supabase
- Enqueue (in our own worker queue, separate from Supabase) a task `scrape-and-extract`
- Worker scrapes the URL, extracts metadata, writes into `companies.metadata` column, then enqueues `generate-personas`

### B. Persona generation

- Worker uses Gemini API with model `gemini-2.5-flash` to generate 5 personas via prompt
- Writes persona rows in Supabase `personas` table, linked to company
- Optionally broadcasts via Supabase realtime (e.g. via `supabase_realtime` or via direct WebSocket) that personas are ready

### C. Script generation

- For each persona, worker enqueues script batches (e.g. 4 batches of 5 scripts)
- Each batch triggers a Gemini call (model = `gemini-2.5-flash`) with prompt to produce JSON `{ideas: [...]}` of 5 script entries
- Validate, store in `scripts` table in Supabase, include provenance

### D. Scoring (ViralCheck)

- For each script:
  1. Trend score: use external service or library (e.g. pytrends, or public Google Trends endpoint) to fetch keyword interest. Store trend_score.
  2. LLM predictive: batch scripts to Gemini prompt (model = `gemini-2.5-flash`), ask score + rationale, store llm_score.
  3. Viral examples: include few-shot in prompt, ask Gemini for viral_score, store.
  4. Compute final_score = 0.45*llm_score + 0.35*trend_score + 0.20*viral_score. Write into `scores` linked to `scripts`.

### E. Winner selection

- Query Supabase to get top-10 scripts by final_score for that company.
- Mark them or store a flag `is_winner = true` in `scripts` or in a separate `winning_scripts` table.

### F. Asset brief & creative generation

- For each winner script: call Gemini with prompt to generate `image_brief` + `video_brief` JSON. Store into `assets` table in Supabase.
- Use Gemini 2.5 Flash Image (aka nano-banana) for image generation. Google announced **Gemini 2.5 Flash Image (nano-banana)** as a new image modality. :contentReference[oaicite:8]{index=8}  
- Call to image generation endpoint (via Gemini API or partner) with image_brief, store outputs in Supabase Storage.
- Variants: call iterative variant API (NanoBanana or image variant endpoint) to get multiple versions.
- Top 3: call Veo / video generation API with video_brief, store videos in Supabase Storage.

### G. UI & Download

- Frontend queries Supabase (via client or server APIs) to fetch personas, scripts + scores, asset URLs.
- Use Supabase signed URLs to securely access images/videos.
- Provide download endpoints (JSON / CSV) by retrieving from Supabase tables & formatting.

---

## 5 — Data tables (Supabase SQL / schema)

Example SQL tables (simplified):

```sql
-- users handled by Supabase Auth
create table companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  url text not null,
  uvp text not null,
  metadata jsonb,
  scraped_at timestamptz,
  created_at timestamptz default now()
);

create table personas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  name text,
  persona_json jsonb,
  created_at timestamptz default now()
);

create table script_batches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  persona_id uuid references personas(id),
  seed_template text,
  temperature float,
  status text,
  created_at timestamptz default now()
);

create table scripts (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references script_batches(id),
  persona_id uuid references personas(id),
  headline text,
  body text,
  cta text,
  keywords text[],
  idea_json jsonb,
  created_at timestamptz default now()
);

create table scores (
  id uuid primary key default gen_random_uuid(),
  script_id uuid references scripts(id) unique,
  trend_score int,
  llm_score int,
  viral_score int,
  final_score float,
  rationale text,
  created_at timestamptz default now()
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  script_id uuid references scripts(id) unique,
  image_brief jsonb,
  video_brief jsonb,
  image_urls text[],  -- list of signed storage paths
  video_urls text[],
  created_at timestamptz default now()
);
When working on the solution ,make sure to segment each file and categorize in folders, very microscopic and nicely categorized, make it all cleanly organized in folders and make it nice.