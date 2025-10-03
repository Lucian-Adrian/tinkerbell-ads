# Mini Demo: Context-Driven Persona & Idea Pipeline

This mini demo simulates the five-step workflow for turning a company URL into structured personas and ad ideas. It runs locally without external services and saves intermediate artifacts as JSON/CSV so you can swap in real APIs or databases later.

## Workflow Overview

1. **Context Ingestion**
   - Input: `company_url` plus a context prompt JSON.
   - Calls a mock Gemini URL-context provider to extract a structured business summary.
   - Output stored at `data/business_context.json`.

2. **Persona Generation**
   - Uses `business_context.json`, a selected model profile (Gemini, Claude, OpenAI, etc.), and a persona prompt schema.
   - Produces exactly five personas with `id`, `description`, `tone`, `pain_points`, and `keywords`.
   - Output stored at `data/personas.json`.

3. **Persona Selection (Step 2.1)**
   - Simulates the backoffice UI selection by choosing one of the five personas (first by default or via CLI flag).
   - Persists the selection at `data/persona_selection.json`.

4. **Anchor Persona → Idea Generation**
   - Inputs: anchor persona, prompt template, batch configuration, and rotating seed templates.
   - Generates ad ideas in configurable batch sizes until the target count is reached.
   - Stores results in `data/ideas.json` and `data/ideas.csv` with full reproducibility metadata.

5. **Storage Layer Abstraction**
   - A lightweight repository layer emulates Supabase tables and key-based writes using local files.
   - Swap the repository in `storage/index.js` when you connect a real database.

## Directory Structure

```
minidemo/
  config/
    gemini.json        # Provider defaults (temperature, max tokens, etc.)
    claude.json
    openai.json
  prompts/
    prompt-context-v1.json
    prompt-personas.json
    prompt-ideas.json
  data/                # Generated outputs (created on first run)
  seeds/
    idea-templates.json
  storage/
    index.js           # Local file-backed storage helpers
  ui/
    index.html         # Minimal browser UI for click-through demo
    app.js             # Runs mock pipeline steps client-side
    styles.css         # Presentation layer
  pipeline.js          # Orchestrates the five steps end to end
```

## Quick Start

```powershell
cd minidemo
node pipeline.js --company-url "https://example.com" `
  --model gemini `
  --context-prompt prompts/prompt-context-v1.json `
  --persona-prompt prompts/prompt-personas.json `
  --idea-prompt prompts/prompt-ideas.json `
  --seed-file seeds/idea-templates.json `
  --target-ideas 30 `
  --batch-size 5 `
  --temperature-seed 0.6 `
  --persona-index 0
```

- All switches have sensible defaults (see `pipeline.js`).
- Outputs are saved to the `data/` directory after each step.

### Click-Through UI

Run the lightweight API server so the browser UI can call the real generators:

```powershell
npm install
npm run start:minidemo
```

Then open http://localhost:4173 in your browser. The pages are served from `minidemo/ui/` while the `/api/*` routes proxy to the node helpers.

> **Tip:** add `GEMINI_API_KEY` to your project `.env` so the context step can call the Gemini API. Without a key the server automatically serves the deterministic fallback payload instead.

- Enter a company URL, pick a model backend, then advance through the five panels (Context → Personas → Ideas → Scripts → Assets).
- The context step calls `test/gemini/test-context-extraction.js`; if the Gemini API is unavailable it falls back to a deterministic scaffold so the pipeline stays interactive.
- Persona cards are clickable—select one to anchor idea generation, choose the ideas you like, and generate scripts/assets inline.

## Customisation Tips

- **Prompts**: Update the JSON files in `prompts/` to tweak schemas and instructions.
- **Providers**: Adjust or add config files in `config/` to describe new API backends.
- **Storage**: Replace `storage/index.js` with real Supabase calls when you are ready.
- **Seed Templates**: Add or remove idea seeds in `seeds/idea-templates.json` for more variety.

## Next Steps

- Wire the storage layer to Supabase once the schema is ready.
- Swap the mock provider functions with real Gemini/Claude/OpenAI SDK calls.
- Connect the pipeline to your backoffice UI and prompt selectors.
