# Mini Demo Harness

Isolated playground for sanity-checking Gemini text, Imagen image, and Veo video flows without touching the main pipelines.

## Features

- **Text smoke test** – call `gemini-2.5-flash` and inspect raw markdown response.
- **Image sanity check** – generate a single frame via `imagen-4.0-generate-001`.
- **Video probe** – fire a short `veo-3.0-fast-generate-001` request and poll until the operation completes.
- **Polished mini UI** – submit prompts and preview outputs from a single page.
- **Fully isolated** – ships with its own `.env`, dependencies, and scripts.

## Setup

```powershell
cd minidemo
copy .env.example .env   # then drop in your GEMINI_API_KEY
npm install
```

Edit `.env` and set `GEMINI_API_KEY` to a valid Gemini Developer API key. Adjust `PORT` if 4000 is occupied.

## Usage

Start the local server (auto-reloads with `tsx watch`):

```powershell
npm run dev
```

Then open <http://localhost:4000> (or your custom port) to drive the UI.

### API endpoints

- `POST /api/text` → `{ prompt }` ⇒ `{ text, raw }`
- `POST /api/image` → `{ prompt }` ⇒ `{ imageBase64, mimeType }`
- `POST /api/video` → `{ prompt, durationSeconds? }` ⇒ `{ videoBase64, mimeType }`
- `GET /api/health` sanity check

Requests are JSON encoded; responses include simple error payloads on failure.

## Notes & limits

- Video generation polls up to ~2 minutes (24 attempts × 5 s). You can tweak the window in `src/server.ts` if needed.
- Veo quotas are easy to exhaust; if you hit 429s, just rerun later or lower your usage.
- All assets are held in-memory and streamed back to the browser; nothing is persisted to disk.
- This harness only targets the Gemini Developer API. For Vertex AI usage, extend `src/clients.ts` with project/location credentials.

## Available scripts

| Command          | Description                                |
| ---------------- | ------------------------------------------ |
| `npm run dev`    | Start server with live reload (tsx watch)  |
| `npm start`      | Run server once via Node + tsx loader      |
| `npm run typecheck` | Static type check with `tsc --noEmit` |

Happy testing!
