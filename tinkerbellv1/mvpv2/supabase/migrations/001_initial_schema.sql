-- Tinkerbell MVP v2 - Initial Schema
-- This migration creates all the core tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  uvp TEXT NOT NULL,
  metadata JSONB,
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personas table
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  persona_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Script batches table
CREATE TABLE script_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  seed_template TEXT NOT NULL,
  temperature DECIMAL(3, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scripts table
CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES script_batches(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  cta TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  idea_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID NOT NULL UNIQUE REFERENCES scripts(id) ON DELETE CASCADE,
  trend_score INTEGER NOT NULL CHECK (trend_score >= 0 AND trend_score <= 100),
  llm_score INTEGER NOT NULL CHECK (llm_score >= 0 AND llm_score <= 100),
  viral_score INTEGER NOT NULL CHECK (viral_score >= 0 AND viral_score <= 100),
  final_score DECIMAL(5, 2) NOT NULL,
  rationale TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID NOT NULL UNIQUE REFERENCES scripts(id) ON DELETE CASCADE,
  image_brief JSONB,
  video_brief JSONB,
  image_urls TEXT[] DEFAULT '{}',
  video_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('scrape', 'generate_personas', 'generate_scripts', 'calculate_scores', 'generate_images', 'generate_videos')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payload JSONB NOT NULL,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);

CREATE INDEX idx_personas_company_id ON personas(company_id);
CREATE INDEX idx_personas_created_at ON personas(created_at DESC);

CREATE INDEX idx_script_batches_company_id ON script_batches(company_id);
CREATE INDEX idx_script_batches_persona_id ON script_batches(persona_id);
CREATE INDEX idx_script_batches_status ON script_batches(status);

CREATE INDEX idx_scripts_batch_id ON scripts(batch_id);
CREATE INDEX idx_scripts_persona_id ON scripts(persona_id);
CREATE INDEX idx_scripts_created_at ON scripts(created_at DESC);

CREATE INDEX idx_scores_script_id ON scores(script_id);
CREATE INDEX idx_scores_final_score ON scores(final_score DESC);

CREATE INDEX idx_assets_script_id ON assets(script_id);

CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE companies IS 'Stores company information and scraped metadata';
COMMENT ON TABLE personas IS 'Generated buyer personas for each company';
COMMENT ON TABLE script_batches IS 'Batch metadata for script generation';
COMMENT ON TABLE scripts IS 'Individual ad scripts generated from personas';
COMMENT ON TABLE scores IS 'ViralCheck scores for each script';
COMMENT ON TABLE assets IS 'Generated images and videos for winning scripts';
COMMENT ON TABLE jobs IS 'Background job queue for async operations';

COMMENT ON COLUMN companies.metadata IS 'Scraped website metadata (title, description, keywords, content)';
COMMENT ON COLUMN personas.persona_json IS 'Complete persona data (demographics, goals, pain points, behaviors)';
COMMENT ON COLUMN script_batches.seed_template IS 'Guerrilla marketing seed keyword used for generation';
COMMENT ON COLUMN script_batches.temperature IS 'AI temperature setting for diversity (0.0-1.0)';
COMMENT ON COLUMN scripts.idea_json IS 'Complete script idea data (hook, angle, pain point, solution, benefit)';
COMMENT ON COLUMN scores.final_score IS 'Weighted final score: 0.45*llm + 0.35*trend + 0.20*viral';
COMMENT ON COLUMN assets.image_brief IS 'Image generation prompt and configuration';
COMMENT ON COLUMN assets.video_brief IS 'Video generation prompt and configuration';
