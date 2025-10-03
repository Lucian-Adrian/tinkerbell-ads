# Complete Pipeline Test Run

This document shows a full end-to-end test of the ad generation pipeline.

## Step 1: Context Extraction

```powershell
node test/gemini/test-context-extraction.js `
  --company-url "https://examen.md" `
  --output minidemo/data/business_context.json
```

**Output**: Business context with company details, industry, pain points, etc.

## Step 2: Persona Generation

```powershell
node test/gemini/test-persona-gen.js `
  --context minidemo/data/business_context.json `
  --output test/gemini/personas.json
```

**Output**: 5 distinct marketing personas
- The Overwhelmed Marketing Manager
- The Strategic Marketing Director
- The Data-Driven Growth Leader
- The Ambitious Startup Founder
- The Client-Focused Agency Owner

## Step 3: Idea Generation

```powershell
# Get persona ID from personas.json
$personaId = (Get-Content test/gemini/personas.json | ConvertFrom-Json).personas[0].id

node test/gemini/test-idea-gen.js `
  --context minidemo/data/business_context.json `
  --personas test/gemini/personas.json `
  --persona-id $personaId `
  --target-ideas 30 `
  --batch-size 5 `
  --temperature-seed 0.8 `
  --output test/gemini/ideas.json
```

**Output**: 30 campaign ideas with headlines, hooks, body copy, and keywords

Sample ideas:
- "Stop the Digital Tug-of-War!"
- "Unblock Your Digital Bottlenecks!"
- "Personalization, Not Perspiration!"

## Step 4: Script Generation

```powershell
# Select first 3 ideas
$ideaIds = ((Get-Content test/gemini/ideas.json | ConvertFrom-Json).ideas[0..2] | ForEach-Object { $_.id }) -join ","

node test/gemini/test-script-gen.js `
  --ideas test/gemini/ideas.json `
  --idea-ids $ideaIds `
  --output test/gemini/scripts.json
```

**Output**: Video ad scripts with:
- Scene-by-scene breakdown (timestamps, visuals, voiceover)
- Music mood suggestions
- Call-to-action
- **AI image/video generation prompt**

## Step 5: Asset Generation

### Option A: Image Generation (Imagen 3.0)

```powershell
# Extract image prompt from first script
$imagePrompt = (Get-Content test/gemini/scripts.json | ConvertFrom-Json).scripts[0].image_prompt

# Update test/gemini/prompt-image-gen.json with the prompt
# Then run:
node test/gemini/test-image-gen.js
```

**Output**: `imagen-1.png`, `imagen-2.png`

### Option B: Video Generation (Veo 3.0)

```powershell
# Extract image prompt from script
$videoPrompt = (Get-Content test/gemini/scripts.json | ConvertFrom-Json).scripts[0].image_prompt

# Update test/gemini/prompt-video-v1.json with the prompt
# Then run:
node test/gemini/test-video-gen.js
```

**Output**: `test/gemini/generated-video.mp4`

## Complete Workflow (Web UI)

```powershell
# Start the integrated server
npm run start:minidemo

# Open http://localhost:4173
```

### UI Workflow:
1. **Context Step**
   - Enter company URL: `https://examen.md`
   - Click "Run Context Extraction"
   - ✓ Status badge turns green
   - View structured business context

2. **Personas Step**
   - Click "Run Persona Generation"
   - ✓ 5 personas generated
   - Click on "The Overwhelmed Marketing Manager" to select

3. **Ideas Step**
   - Set batch size: 5
   - Set target ideas: 30
   - Click "Run Idea Generation"
   - ✓ 30 ideas generated
   - Select your favorite ideas (checkboxes)

4. **Scripts Step**
   - Click "Run Script Generation"
   - ✓ Video scripts generated for selected ideas
   - View detailed scene breakdowns and image prompts

5. **Assets Step**
   - Click "Run Asset Generation"
   - ✓ Asset definitions created
   - Ready for Imagen/Veo integration

## Output Files

After a complete run, you'll have:

```
minidemo/data/
  business_context.json          # Step 1 output

test/gemini/
  personas.json                  # Step 2 output
  ideas.json                     # Step 3 output
  scripts.json                   # Step 4 output
  imagen-1.png                   # Step 5a output
  imagen-2.png                   # Step 5a output
  generated-video.mp4            # Step 5b output
```

## Data Flow

```
Company URL (https://examen.md)
  ↓
[Context Extraction] → business_context.json
  {
    company_name: "Examen",
    industry: "EdTech",
    value_proposition: "..."
  }
  ↓
[Persona Generation] → personas.json
  {
    personas: [
      { id: "uuid-1", name: "The Overwhelmed Marketing Manager", ... },
      { id: "uuid-2", name: "The Strategic Marketing Director", ... },
      ...
    ]
  }
  ↓
[Idea Generation] → ideas.json
  {
    persona_id: "uuid-1",
    ideas: [
      {
        id: "uuid-a",
        headline: "Stop the Digital Tug-of-War!",
        hook: "Imagine trying to update your website...",
        body: "...",
        keywords: ["efficiency", "automation"]
      },
      ...
    ]
  }
  ↓
[Script Generation] → scripts.json
  {
    scripts: [
      {
        idea_id: "uuid-a",
        title: "Stop the Digital Tug-of-War!",
        scenes: [...],
        image_prompt: "A vibrant vertical video ad showing..."
      },
      ...
    ]
  }
  ↓
[Asset Generation] → imagen-1.png / generated-video.mp4
```

## Metadata Tracking

Every step tracks metadata:

```json
{
  "metadata": {
    "source": "gemini-persona-generation",
    "model": "gemini-2.5-flash",
    "generated_at": "2025-10-03T07:40:37.219Z",
    "error": null
  }
}
```

If Gemini API fails, `source` becomes `"fallback"` and `error` contains the failure reason, but the pipeline continues with deterministic mocks.

## Performance

Typical generation times (with Gemini 2.5 Flash):
- Context: ~3-5 seconds
- Personas: ~5-7 seconds
- Ideas (30): ~15-25 seconds (batched)
- Scripts (10): ~30-45 seconds
- Images (Imagen): ~10-15 seconds per image
- Video (Veo): ~2-5 minutes per video

## Cost Estimates

Using Gemini 2.5 Flash pricing (as of 2025):
- Context: ~$0.001
- Personas: ~$0.002
- Ideas (30): ~$0.015
- Scripts (10): ~$0.025
- **Total per campaign**: ~$0.043 + asset generation costs

Imagen/Veo pricing varies based on resolution and duration.

## Next Actions

1. ✅ Context extraction working
2. ✅ Persona generation working
3. ✅ Idea generation working
4. ✅ Script generation working
5. ⏳ Wire scripts → Imagen/Veo for actual media
6. ⏳ Add batch processing for multiple URLs
7. ⏳ Integrate with Supabase for persistence
8. ⏳ Build campaign management dashboard
