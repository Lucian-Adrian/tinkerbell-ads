-- Row-Level Security (RLS) Policies
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

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
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = personas.company_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert personas for their companies"
  ON personas FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = personas.company_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can update personas of their companies"
  ON personas FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = personas.company_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete personas of their companies"
  ON personas FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = personas.company_id
    AND companies.user_id = auth.uid()
  ));

-- Script batches policies
CREATE POLICY "Users can view script batches of their companies"
  ON script_batches FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = script_batches.company_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert script batches for their companies"
  ON script_batches FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = script_batches.company_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can update script batches of their companies"
  ON script_batches FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = script_batches.company_id
    AND companies.user_id = auth.uid()
  ));

-- Scripts policies
CREATE POLICY "Users can view scripts of their personas"
  ON scripts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM personas
    JOIN companies ON companies.id = personas.company_id
    WHERE personas.id = scripts.persona_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert scripts for their personas"
  ON scripts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM personas
    JOIN companies ON companies.id = personas.company_id
    WHERE personas.id = scripts.persona_id
    AND companies.user_id = auth.uid()
  ));

-- Scores policies
CREATE POLICY "Users can view scores of their scripts"
  ON scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM scripts
    JOIN personas ON personas.id = scripts.persona_id
    JOIN companies ON companies.id = personas.company_id
    WHERE scripts.id = scores.script_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert scores for their scripts"
  ON scores FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM scripts
    JOIN personas ON personas.id = scripts.persona_id
    JOIN companies ON companies.id = personas.company_id
    WHERE scripts.id = scores.script_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can update scores of their scripts"
  ON scores FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM scripts
    JOIN personas ON personas.id = scripts.persona_id
    JOIN companies ON companies.id = personas.company_id
    WHERE scripts.id = scores.script_id
    AND companies.user_id = auth.uid()
  ));

-- Assets policies
CREATE POLICY "Users can view assets of their scripts"
  ON assets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM scripts
    JOIN personas ON personas.id = scripts.persona_id
    JOIN companies ON companies.id = personas.company_id
    WHERE scripts.id = assets.script_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert assets for their scripts"
  ON assets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM scripts
    JOIN personas ON personas.id = scripts.persona_id
    JOIN companies ON companies.id = personas.company_id
    WHERE scripts.id = assets.script_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can update assets of their scripts"
  ON assets FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM scripts
    JOIN personas ON personas.id = scripts.persona_id
    JOIN companies ON companies.id = personas.company_id
    WHERE scripts.id = assets.script_id
    AND companies.user_id = auth.uid()
  ));

-- Jobs policies (users can view jobs related to their data)
CREATE POLICY "Users can view their own jobs"
  ON jobs FOR SELECT
  USING (
    -- Allow if job payload contains a company_id owned by the user
    (payload->>'companyId')::UUID IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert jobs for their data"
  ON jobs FOR INSERT
  WITH CHECK (
    -- Allow if job payload contains a company_id owned by the user
    (payload->>'companyId')::UUID IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all jobs"
  ON jobs FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
