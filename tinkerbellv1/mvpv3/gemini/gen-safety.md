# Safety, Moderation & Testing (JavaScript)

Gemini enforces built-in safety filters. Treat them as the first line, not the only line.

## Inspect Safety Ratings

```js
const result = await model.generateContent(prompt);

const candidate = result.response.candidates?.[0];
console.log(candidate.finishReason); // STOP, SAFETY, BLOCK
console.log(candidate.safetyRatings);
```

Each `safetyRatings` entry includes a `category` and `probability`.

## Custom Moderation Layer
- Run outputs through your own classifier (Perspective API, custom embedding vetting).
- Enforce allow-lists for regulated industries (healthcare, finance).
- Mask PII using deterministic regexes before storing transcripts.

## Red Team Checklist
- Prompt with adversarial instructions (dual-use, self-harm, disallowed requests).
- Verify refusal template is consistent (`"I’m sorry, but…"`).
- Log all refusals with hashed user IDs for auditing.

## Safety Settings Recap
- Tune thresholds in `safetySettings` (see `gen-text-configure.md`).
- Set `BLOCK_NONE` only for internal evaluation runs—never in production.

## Testing Strategy
- Snapshot user-facing prompts in fixtures; assert on refusal phrasing.
- Keep a regression suite that compares outputs between SDK versions.
- Automate load tests to catch scaling issues that may trigger rate limiting and fallback logic.

Reuse these policies in Python services by importing the same refusal templates and red-team prompt lists.