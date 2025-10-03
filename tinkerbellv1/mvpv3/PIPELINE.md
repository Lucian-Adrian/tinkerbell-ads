# Tinkerbell Ad Generation Pipeline

Complete AI-powered pipeline for generating advertising campaign ideas, scripts, and assets from a company URL.

## Pipeline Overview

```
URL → Context → Personas → Ideas → Scripts → Assets
```

### 1. **Context Extraction** (`test-context-extraction.js`)
- **Input**: Company URL
- **Model**: Gemini 2.5 Flash with `urlContext` tool
- **Output**: `business_context.json`
  - Company name, industry, description
  - Target customers, pain points
  - Brand tone, keywords
  - Value proposition

### 2. **Persona Generation** (`test-persona-gen.js`)
- **Input**: Business context
- **Model**: Gemini 2.5 Flash with structured output
- **Output**: `personas.json` (5 personas)
  - Name, description, tone
  - Pain points, keywords
  - Unique ID for tracking

### 3. **Idea Generation** (`test-idea-gen.js`)
- **Input**: Context + selected persona + seed templates
- **Model**: Gemini 2.5 Flash with structured output
- **Output**: `ideas.json` (configurable batch size)
  - Headline, hook, body copy
  - Keywords for targeting
  - Batch tracking with temperature variation

### 4. **Script Generation** (`test-script-gen.js`)
- **Input**: Selected ideas
- **Model**: Gemini 2.5 Flash with structured output
- **Output**: `scripts.json`
  - Video ad script with scenes
  - Timestamps, visuals, voiceover
  - Music mood, call-to-action
  - **Image/video generation prompt**

### 5. **Asset Generation**
- **Input**: Scripts with image prompts
- **Models**: 
  - Imagen 3.0 for static images (`test-image-gen.js`)
  - Veo 3.0 for video generation (`test-video-gen.js`)
- **Output**: Generated media files (PNG, MP4)

## Quick Start

### Prerequisites

```powershell
# Install dependencies
npm install

# Set up environment variables
# Create .env file in project root:
GEMINI_API_KEY=your_api_key_here
```

### Option 1: Run Individual Test Scripts

```powershell
# 1. Extract context from URL
node test/gemini/test-context-extraction.js `
  --company-url "https://example.com" `
  --output minidemo/data/business_context.json

# 2. Generate personas
node test/gemini/test-persona-gen.js `
  --context minidemo/data/business_context.json `
  --output test/gemini/personas.json

# 3. Generate ideas
node test/gemini/test-idea-gen.js `
  --context minidemo/data/business_context.json `
  --personas test/gemini/personas.json `
  --target-ideas 30 `
  --batch-size 5 `
  --output test/gemini/ideas.json

# 4. Generate scripts
node test/gemini/test-script-gen.js `
  --ideas test/gemini/ideas.json `
  --output test/gemini/scripts.json

# 5. Generate images from script prompts
node test/gemini/test-image-gen.js `
  --prompt "prompt from scripts.json image_prompt field"
```

### Option 2: Use the Web UI

```powershell
# Start the integrated server
npm run start:minidemo

# Open browser to http://localhost:4173
```

The web UI provides:
- Visual step-by-step workflow
- Status tracking for each step
- Real-time generation with fallback to deterministic mocks
- Output display and metadata inspection
- Persona selection and idea filtering

## Test Files Reference

### Context Extraction
**File**: `test/gemini/test-context-extraction.js`  
**Prompt**: `test/gemini/prompt-context-extraction.json`

```powershell
node test/gemini/test-context-extraction.js `
  --company-url "https://yoursite.com" `
  --prompt test/gemini/prompt-context-extraction.json `
  --output context.json `
  --json  # Optional: JSON-only output
```

### Persona Generation
**File**: `test/gemini/test-persona-gen.js`  
**Prompt**: `test/gemini/prompt-persona-gen.json`

```powershell
node test/gemini/test-persona-gen.js `
  --context business_context.json `
  --prompt test/gemini/prompt-persona-gen.json `
  --output personas.json
```

### Idea Generation
**File**: `test/gemini/test-idea-gen.js`  
**Prompt**: `minidemo/prompts/prompt-ideas.json`  
**Seeds**: `minidemo/seeds/idea-templates.json`

```powershell
node test/gemini/test-idea-gen.js `
  --context business_context.json `
  --personas personas.json `
  --persona-id "uuid-here" `
  --target-ideas 50 `
  --batch-size 10 `
  --temperature-seed 0.8 `
  --output ideas.json
```

### Script Generation
**File**: `test/gemini/test-script-gen.js`

```powershell
node test/gemini/test-script-gen.js `
  --ideas ideas.json `
  --idea-ids "id1,id2,id3" `
  --output scripts.json
```

### Image Generation
**File**: `test/gemini/test-image-gen.js`  
**Prompt**: `test/gemini/prompt-image-gen.json`

```powershell
node test/gemini/test-image-gen.js
# Generates imagen-1.png, imagen-2.png from prompt file
```

### Video Generation
**File**: `test/gemini/test-video-gen.js`  
**Prompt**: `test/gemini/prompt-video-v1.json`

```powershell
node test/gemini/test-video-gen.js
# Generates test/gemini/generated-video.mp4
```

## Server API Endpoints

When running `npm run start:minidemo`, the following REST API is available:

### POST `/api/context`
```json
{
  "companyUrl": "https://example.com"
}
```
**Returns**: Context + requestId + metadata

### POST `/api/personas`
```json
{
  "requestId": "uuid",
  "modelKey": "gemini",
  "personaIndex": 0
}
```
**Returns**: 5 personas + anchorPersonaIndex + metadata

### POST `/api/ideas`
```json
{
  "requestId": "uuid",
  "personaId": "persona-uuid",
  "batchSize": 5,
  "targetIdeas": 30,
  "temperatureSeed": 0.8,
  "modelKey": "gemini"
}
```
**Returns**: Array of ideas + metadata

### POST `/api/scripts`
```json
{
  "requestId": "uuid",
  "ideaIds": ["idea-uuid-1", "idea-uuid-2"]
}
```
**Returns**: Array of video scripts + metadata

### POST `/api/assets`
```json
{
  "requestId": "uuid"
}
```
**Returns**: Array of asset definitions + metadata

## Output Structure

### Context Output
```json
{
  "request_id": "uuid",
  "context": {
    "company_name": "Acme Corp",
    "industry": "SaaS",
    "description": "...",
    "target_customers": ["..."],
    "keywords": ["..."],
    "pain_points_addressed": ["..."],
    "brand_tone": "Professional"
  }
}
```

### Personas Output
```json
{
  "request_id": "uuid",
  "personas": [
    {
      "id": "uuid",
      "name": "The Overwhelmed Marketing Manager",
      "description": "...",
      "tone": "Empathetic",
      "pain_points": ["..."],
      "keywords": ["..."]
    }
  ]
}
```

### Ideas Output
```json
{
  "request_id": "uuid",
  "persona_id": "uuid",
  "ideas": [
    {
      "id": "uuid",
      "persona_id": "uuid",
      "batch_id": "1",
      "seed_template": "seed-uuid",
      "temperature": 0.8,
      "headline": "Stop the Digital Tug-of-War!",
      "hook": "...",
      "body": "...",
      "keywords": ["efficiency", "automation"]
    }
  ]
}
```

### Scripts Output
```json
{
  "request_id": "uuid",
  "scripts": [
    {
      "id": "uuid",
      "idea_id": "uuid",
      "persona_id": "uuid",
      "title": "Stop the Digital Tug-of-War!",
      "duration": "23 seconds",
      "scenes": [
        {
          "timestamp": "0:00-0:03",
          "visual": "...",
          "voiceover": "...",
          "music_mood": "Upbeat"
        }
      ],
      "call_to_action": "Get Started Today!",
      "image_prompt": "A vibrant vertical video ad showing..."
    }
  ]
}
```

## Metadata & Fallbacks

Each API endpoint returns a `metadata` field indicating:
- `source`: `"gemini-*-generation"` or `"fallback"`
- `model`: Model used (e.g., `"gemini-2.5-flash"`)
- `generated_at`: ISO timestamp
- `error`: Error message if Gemini call failed (only present on fallback)

If `GEMINI_API_KEY` is missing or API calls fail, the server automatically falls back to deterministic mock generators while keeping the UI functional.

## Customization

### Modify Prompts
Edit JSON files in:
- `test/gemini/prompt-*.json` - Context & persona prompts
- `minidemo/prompts/prompt-*.json` - Idea prompts

### Add Seed Templates
Edit `minidemo/seeds/idea-templates.json` to add more creative frameworks.

### Change Models
Update `minidemo/config/gemini.json` or create new config files for different providers.

## Troubleshooting

### "GEMINI_API_KEY not found"
Create a `.env` file in the project root:
```
GEMINI_API_KEY=your_key_here
```

### "Failed to parse JSON response"
- Increase `maxOutputTokens` in the script
- Lower `temperature` for more stable output
- Check the raw response in error logs

### Server not starting
```powershell
# Check if port 4173 is available
netstat -ano | findstr :4173

# Change port via environment variable
$env:PORT=3000; npm run start:minidemo
```

### Fallback mode always active
- Verify API key is correct
- Check network connectivity
- Review error in `metadata.error` field

## Architecture

```
test/gemini/              # Individual generator test scripts
├── test-context-extraction.js
├── test-persona-gen.js
├── test-idea-gen.js
├── test-script-gen.js
├── test-image-gen.js
└── test-video-gen.js

minidemo/
├── server/
│   ├── index.js         # Express API server
│   └── generators.js    # Fallback deterministic generators
├── ui/
│   ├── index.html       # Web UI
│   ├── app.js           # Frontend logic
│   └── styles.css       # Styling
├── config/              # Model configurations
├── prompts/             # Prompt templates
├── seeds/               # Creative seed templates
└── data/                # Generated outputs (gitignored)
```

## Next Steps

1. **Batch Processing**: Run entire campaigns through the pipeline
2. **Database Integration**: Replace temp files with Supabase
3. **Asset Generation**: Wire scripts → Imagen/Veo for real media
4. **Analytics**: Track performance of generated ads
5. **A/B Testing**: Generate variants and measure conversion lift

## License

ISC
