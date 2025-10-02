# Tinkerbell MVP v1

This package orchestrates the end-to-end Tinkerbell workflow described in `idea.md`:

1. **Context ingestion** – scrape the company URL and extract key brand context.
2. **Persona generation** – ask Gemini 2.5 Flash for three tailored personas and prompt the user to pick one.
3. **Idea patches** – generate 20 ad concepts across four patches, each with unique seeds and temperatures.
4. **ViralCheck scoring** – score every idea with trend, predictive, and viral similarity signals.
5. **Asset briefs & generation** – create structured image/video briefs, render Imagen 4 Fast assets for the top 10, and Veo 3 Fast videos for the top 3.
6. **Experiment logging** – persist every prompt, configuration, and output so experiments are fully reproducible.

## Requirements

- Node.js 20+ (includes the global `fetch`).
- `GEMINI_API_KEY` in your environment or `.env` next to this folder.
- Optional: outbound network access for Google Trends API (used via `google-trends-api`).

## Getting started

```powershell
cd mvpv1
npm install
# Run the orchestrator. You'll be prompted for persona selection.
npm start -- --url "https://example.com" --uvp "One-line UVP"
```

Outputs are written to `output/<timestamp>/` and include:

- `context.json` – normalized company context.
- `personas.json` – the three personas returned by Gemini.
- `patches/` – raw and validated idea batches with metadata.
- `scores.json` – ViralCheck components per idea.
- `assets/` – image briefs, video briefs, generated PNGs and MP4s.
- `experiment.json` – full configuration + provenance for the run.

You can tweak prompts, seeds, and configuration without changing the code:

- Prompts live in `prompts/*.json`.
- Guerrilla seeds and temperature schedule live in `config/seeds.json` and `config/temperature.json`.
- Additional knobs (idea counts, batch sizes, scoring weights) live in `config/mvp-config.json`.

Every file is versioned so you can A/B prompts or models by simply incrementing the `version` field and pointing the config at the new file.
