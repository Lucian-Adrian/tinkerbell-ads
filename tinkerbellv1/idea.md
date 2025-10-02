description.md — Tinkerbell MVP Idea & Flow

Tinkerbell is a B2B SaaS platform that automates the process of creating, testing, and scaling marketing campaigns with almost no manual effort. Instead of marketing teams spending weeks brainstorming and testing ideas, Tinkerbell does it in a single day, at microbudgets.

Core Idea

Input & Context
The user provides two simple things:

Their company URL

Their unique value proposition (UVP)

That’s it. Tinkerbell takes care of the rest.

Persona Creation
The system generates a handful of buyer personas tailored to the company’s context and UVP. This ensures ads aren’t generic, but speak directly to potential customers.

Ad Script Generation
For each persona, Tinkerbell automatically generates ad scripts — headlines, copy, CTAs — across multiple creative angles (problem/solution, contrarian, social proof, etc.). This produces dozens (or even hundreds) of unique ad ideas instantly.

Scoring & Filtering (ViralCheck)
Instead of asking the user to test everything, Tinkerbell scores each script based on three signals:

Trends (keyword popularity right now)

Predictive AI Scoring (how likely it is to perform)

Viral Patterns (similarity to known successful campaigns)

The weak ideas are pruned. Only the top ideas survive.

Asset Generation
For the winning scripts, Tinkerbell generates creative briefs — images, videos, or variations — so campaigns are ready-to-launch, not just text on a screen.

Microbudget Testing
Instead of wasting thousands upfront, campaigns can be tested live for just $1–$5. Ads that flop are killed quickly. Ads that succeed are scaled immediately.

Final Dashboard
The user sees a ranked list of their best campaigns, complete with copy, images, video previews, and scoring rationales. They can export or launch them instantly.

Why It Works

From Guesswork to Data: Every campaign is backed by trend analysis and AI prediction.

From Months to Hours: Campaigns are created, scored, and test-ready in a single day.

From Thousands to Cents: Budgets go only to winners, cutting waste.

MVP Simplification

For the minimum viable product, we only need:

Input (URL + UVP)

Generate 3 personas

Generate 5 ad scripts per persona

Score them quickly (AI-only, trends optional)

Show top 5 ideas in a clean dashboard

This is enough to wow users and prove value. Asset generation (images/videos) and microbudget testing can come in phase 2.

Easy Improvements (without complexity)

Add a one-click test button: automatically run a $5 ad spend on the top ad.

Add variants of winning ads (AI tweaks headlines or tone).

Simplify scoring to just AI predictive score in MVP, then expand later.

⚡ One-liner: Tinkerbell is the crystal ball for B2B marketing — generating hundreds of ads, predicting winners, and scaling them with microbudgets.

I’ve simplified the description so it now focuses only on the idea, core logic, and MVP flow — no tech specs, no architecture. It’s about what Tinkerbell does, why it works, and how a minimum version could launch.

Want me to also rewrite the script/flow for the MVP version so it feels even leaner and more compelling for early demos?

You said:
So, I have worked on the idea even more, and now I want to use URL context to gather context for AI. Then, after the first step is done to gather all the context for the company, we then proceed to the second step. In the second step, they select one out of the three generated personas, and offers the big one of them.And then, imagine that you would select one out of these Generate User Personas, and after you select them, you proceed with generating business ideas. So you have like, 50 business ideas. That's the one you choose. We can do 3 business ideas for each customer, but we want to do like 20. So, after they create 20 ads, you think, I say, for each one of them, we use a patch, and generate the responses in patches, and we save them in JSON. Because we have SuperBase connected, it's easy to save in JSON and save to SuperBase. But, I want to somehow separate this. So, you know, we'll have 5 patch ideas that will be generated, and we'll separate them. So, we need structured output for the AI, which is possible, and it works. And then we need to handle it ourselves, to separate multiple ideas in a patch. Also, for each patch, in order to ensure multiple unique ideas for each patch, we have to use a seed. A seed phrase, a seed keyword, a seed phrase according to Guerrilla Marketing Playbook. And I will need at least 20 of them. Also, for each request, we will change the temperature. So that we make sure no response is the same, and we have only unique ideas. Because AI has a bias when generating ideas. Also, I think part of this is the system prompt. So, besides, after generating those ideas for users, I write them through the viral check. And the viral check is the Trends API. Look at the keyword velocity for each idea. Then I look at the Gemini check, which ensures common sense. It looks at how it looks and sounds. The assigned idea and description. And then, this group. And there is group data in the Gemini, because we will have a data set of a couple of very good performing videos. And we will use later retrieval augmented search to compare it and offer a score. But right now, we can use the two features and offer a final score based on this. Then, after the final score, we sort them, we rank them by highest score, and we choose the top ten, for each of these on the top ten we use Gemini to create json image_brief and vide_brief.
For top 10 we generate images using Imagen 4 fats
For top 3 we generate video using Veo 3 Fast no audio.
Then we show them somehow nicely
ChatGPT said:
Thought

Perfect — I get the tighter, product-first brief: no heavy architecture, just the core logic, the exact MVP flow, the data shape the AI should return, and practical rules (seeds, temps, batching, dedupe, scoring) so your agent + Supabase can run this reliably.

Below is a single concise doc you can paste into your agent or hand to a developer — it explains step-by-step how the app works, the prompts/structure you should enforce, how batches/patches and seeds operate, the ViralCheck scoring pipeline, and the output formats to store in Supabase. I also include a ready-made list of 20 Guerrilla-marketing seed phrases, temperature schedule, dedupe rules, and small improvements that give big ROI.

Tinkerbell — Core idea & MVP flow (product-first, no heavy tech)
One-sentence summary

Use the company URL + UVP to automatically extract brand context → generate 3 personas → user picks 1 persona → generate many ad concepts in controlled batches (patches) using varied seeds & temperatures → score with ViralCheck (Trends + Gemini predictive + viral few-shots) → rank, select top winners → generate image/video briefs and assets for top results → show ranked dashboard.

High-level user flow (MVP)

User supplies: Company URL + UVP.

Context gather (auto): Agent scrapes the URL and produces a compact context_json (logo URLs, headline text, 8–20 keywords, short product bullets, tone tags, primary CTA).

Persona generation: Agent returns 3 personas (brief JSON). UI shows them; user selects one.

Idea generation (patches):

For the selected persona, generate ideas in patches: each patch = 5 ideas (so 4 patches → 20 ideas).

Each patch uses a distinct seed phrase (from your Guerrilla playbook) and a controlled temperature so ideas are diverse and unique.

Each idea must be a strict JSON object (schema below).

Save each patch as patch_id + list of ideas in Supabase (JSON).

ViralCheck scoring: For each idea:

Extract keywords (top 10).

Compute Trend score (Google Trends velocity over last 30 days).

Run Gemini predictive scoring for engagement (batched).

Run Gemini viral similarity (few-shot with curated viral B2B examples).

Compute final_score = 0.45 * llm_score + 0.35 * trend_score + 0.20 * viral_score.

Ranking & selection: Sort by final_score. Pick Top 10; mark provenance (which persona, which patch, which seed, which temperature).

Asset briefs: For each Top 10 idea, call Gemini once to produce image_brief + video_brief JSON.

Asset generation: Generate images for Top 10 via Imagen 4 Fast (store URLs). Generate videos (silent) for Top 3 via Veo 3 Fast.

UI: Present ranked table with thumbnails, briefs, rationales, and an option to export JSON/CSV or launch micro-tests ($1–$5).

Why the patch/seed/temperature approach works

Seeds steer the creative direction (guerrilla playbook triggers different mental models).

Patches (small batches) keep LLM behavior constrained so you can enforce “no duplicates in patch” easily.

Varying temperature per patch produces stylistic diversity; combining with different seeds reduces repeated outputs.

Storing patches separately preserves provenance for A/B and lift analysis.

Exact output schema (store these JSON blobs in Supabase)
Company context (after scrape)
{
  "company_id":"uuid",
  "url":"https://...",
  "uvp":"Short UVP",
  "brand_headline":"...",
  "brand_keywords":["k1","k2",...],
  "brand_colors":["#hex1","#hex2"],
  "logo_urls":["..."],
  "short_bullets":["primary use case","main benefit"],
  "tone":"professional|playful|technical",
  "generated_at":"2025-09-30T12:00:00Z"
}

Persona (one of the 3)
{
  "persona_id":"uuid",
  "name":"e.g. Growth-Stack Gary",
  "role":"Head of Marketing",
  "company_size":"SMB / Midmarket / Enterprise",
  "motivations":["save ad budget","improve ROI"],
  "pain_points":["slow creative cycle","wasted spend"],
  "preferred_channels":["LinkedIn","Google"],
  "tone":"direct, data-driven"
}

Patch metadata
{
  "patch_id":"uuid",
  "persona_id":"uuid",
  "seed_phrase":"\"Contrarian: Ban the Benchmark\"",
  "temperature":0.45,
  "batch_index":2,
  "generated_at":"..."
}

Single idea / script (each idea is one JSON record)
{
  "script_id":"uuid",
  "patch_id":"uuid",
  "persona_id":"uuid",
  "headline":"<=70 chars",
  "body":"<=140 chars",
  "cta":"short CTA",
  "keywords":["k1","k2",... up to 10],
  "seed_phrase":"string",
  "temperature":0.45,
  "provenance":{"model":"gemini-2.5-flash","prompt_version":"v1"},
  "raw_llm_response":{ /* store for audit */ },
  "created_at":"..."
}

Scores (one per script)
{
  "script_id":"uuid",
  "trend_score":0-100,
  "llm_score":0-100,
  "viral_score":0-100,
  "final_score":float,
  "rationale": "1-2 sentence Gemini rationale",
  "scored_at":"..."
}

Asset brief (for top winners)
{
  "script_id":"uuid",
  "image_brief":"single-string descriptive prompt (product, scene, tone, brand colors, logo)",
  "video_brief":{
    "hook":"<=10 words",
    "scenes":[{"time":"0-3s","visual":"..."}],
    "voiceover":"full VO text (optional)",
    "cta":"..."
  },
  "generated_at":"..."
}

Prompt design (system + user) — rigid JSON output enforcement

Make prompts enforce a strict JSON response and short validation rules. Always validate and re-ask the LLM if JSON is invalid.

System prompt (high level)

You are a B2B guerrilla marketer AI. Output must be valid JSON only. Do NOT include explanatory text. Follow schema exactly.


User prompt for patch generation (example)

Context: {context_json}
Persona: {persona_json}
Seed phrase: "{{seed_phrase}}"
Temperature: {{temperature}}
Task: Generate 5 unique ad ideas for the persona. Each idea must be:
{id, headline (<=70 chars), body (<=140 chars), cta, keywords:[up to 10]}
Constraints: All headlines and bodies in this patch must be unique. Reply only with JSON: {"ideas":[...]}


Validation steps after each call

Parse JSON. If parse error → retry 1 (append: "Return only valid JSON. If you disagree, return empty array.").

Check uniqueness in-patch (headline/body duplicates) → if fails, re-gen that item only (or re-call).

Store validated ideas with patch metadata.

Seed phrases (20 guerrilla-playbook seeds)

Use one seed per patch. Here are 20 ready-to-use seeds (short line + short cue):

"Problem-solution: Pain-first"

"Contrarian: 'Do less, convert more'"

"Social proof: 'What your competitor stole'"

"Cost-saving: 'Cut ad waste now'"

"Speed: 'From months to hours'"

"Counter-intuitive: 'Stop A/B testing'"

"Secret: 'What 1% of teams do'"

"Guarantee: 'Pay only for winners'"

"Scarcity: 'Limited micro-tests'"

"Data-proof: 'Here's the metric that matters'"

"Case-study: 'How X gained 2x ROI'"

"Humor: 'Marketing that makes your CFO laugh'"

"Fear-of-missing-out: 'Competitor already does this'"

"Comparison: 'Vs traditional agency'"

"Insider: 'Agency-free creative in minutes'"

"ROI-first: 'Double conversion, halve spend'"

"How-to: '3 steps to hyper-iterate ads'"

"Shock: 'Your campaign is leaking money'"

"Nostalgia/format: 'Old-school copy, new-age AI'"

"Action-driven: 'Launch a test in 60 seconds'"

(Use these in the seed_phrase field; you can customize per vertical.)

Temperature schedule (example)

Use different temperature per patch to create variety. Example for 4 patches (each 5 ideas) = 20 ideas:

Patch 1: 0.15 (conservative)

Patch 2: 0.35 (balanced)

Patch 3: 0.6 (creative)

Patch 4: 0.8 (wild)

For 20 patches or more, rotate through [0.12,0.25,0.4,0.55,0.7,0.85] to maintain diversity.

Deduplication & uniqueness rules

In-patch: Headlines & bodies must be unique (strict string equality). If duplication occurs, regenerate that idea.

Across-patches: Compute a normalized similarity score (cosine on embeddings or Jaccard on tokens). If similarity > 0.85, mark as “near-duplicate” and optionally penalize score or re-generate.

Keyword overlap: If two ideas have the same top 5 keywords and similarity > 0.8, tag for manual inspection or automatic regeneration.

Small change with big impact: use a cheap embedding (or cheap LLM hashing) to de-duplicate rather than full re-generation every time.

ViralCheck — scoring pipeline (MVP: 2 signals; upgraded: 3 signals)
Minimal (fast MVP)

LLM predictive score (Gemini batch scoring, 0–100) — primary signal.

Trend score (optional for MVP; if omitted, use llm_score as final).

Recommended (full)

A. Trend score (0–100)

Extract up to 15 keywords from idea.

Query Google Trends (relative interest over 30 days) or a velocity metric. Normalize to 0–100. Cache queries 24 hours.

B. LLM predictive score (0–100)

Batch up to 10 scripts per call. Prompt Gemini as a B2B ad predictor. Return [{id, score, rationale}].

Temperature: 0–0.2 for reliability.

C. Viral example score (0–100)

Prompt Gemini with 2–3 few-shot viral B2B examples (curated). Ask similarity/likelihood to go viral and rationale.

Composite

final_score = 0.45 * llm_score + 0.35 * trend_score + 0.20 * viral_score


Store all components and the rationale.

How to use few-shot viral examples (simple)

Keep a curated list of 12–20 proven B2B viral ads (title, short rationale). For viral scoring prompts include 2–3 examples relevant to the company vertical. This dramatically improves the alignment of viral_score.

Asset brief generation (Top 10)

Prompt Gemini (single call per script) to output:

image_brief (single string): product, scene, tone, brand colors, logo position, text overlays.

video_brief (JSON): hook (<=10 words), scenes (time ranges and visuals), voiceover (single short script), cta.

Store both JSONs in Supabase. These should be human-readable but also actionable by Imagen/Veo.

Small changes that unlock outsized gains (low lift)

Persona control token: Add a one-line “persona-control” tag (e.g., “pain-driven CFO”) to all prompts so every idea stays on target. Tiny change, big alignment.

Seed re-weighting: If a seed repeatedly produces low-scoring ideas, reduce its usage or tweak seed wording automatically.

Micro-variants: For each top idea create 3 quick headline variants (cheap LLM call) to test micro-differences; this improves success rate when running microtests.

One-click $5 test: Allow user to push top idea live with single click — direct measurement beats prediction fast.

Use top keywords in ad creatives (force at least 1–2 high-trend keywords into headline or first sentence) — improves CTR in many channels.

UI/UX for displaying results (simple & effective)

Stepper UI: Step 1: Context (loading) → Step 2: Pick persona → Step 3: Generate patches (live progress) → Step 4: Scoring → Step 5: Winners dashboard.

Winners dashboard: Ranked table (rank, thumbnail, headline, final_score, trend_score, llm_score, viral_score, patch_id, seed_phrase). Clicking opens asset brief + previews.

Compare view: Side-by-side compare any two ideas with rationale & predicted score.

Export: CSV/JSON with full provenance (patch_id, seed, model, prompt_version, raw_llm_response).

Quick test: Button to launch $1–$5 ad test (only expose if billing connected).

Example small workflow you can feed to your Agent as a single instruction

Scrape url → produce context_json.

Produce 3 personas.

Wait for user selection.

For chosen persona: for i in patches (1..4):

pick seed_phrase = seeds[i], set temperature from schedule,

call LLM to generate 5 ideas JSON,

validate and store patch.

After all patches: extract keywords for each idea, call Google Trends (or skip), batch-call Gemini for predictive scoring, call Gemini viral few-shot scoring.

Compute final_score, pick top 10.

For top 10: request image_brief + video_brief, store them.

For top 10: call Imagen 4 Fast to produce images; for top 3 produce videos with Veo 3 Fast.

Present dashboard with ranked list and media.

Final notes & immediate checklist (MVP-first)

MVP scope: URL+UVP → 3 personas → pick 1 → 4 patches x 5 ideas = 20 ideas → Gemini scoring → Top 10 → image_briefs → images for Top 10 → videos for Top 3.

Start with AI-only scoring if trends integration is unavailable — add Trends later.

Enforce strict JSON from the LLM and implement a 1–2 retry policy on invalid output.

Use the seed list + temperature schedule + dedupe plan — that’s your low-effort gamble that yields diverse, unique ideas.

Save raw responses + prompt for provenance and iterative improvement.


You said:
I also want to save generative data and config in database so I know which input produced wich output, so I want to make it easy to change and test, that's why. I also want a JSON file for each system prompt and they will be called, I want to easily swap models, I want it easy to change everything and document the changes, basically make experiments, a change and then observe, what else do you say?
ChatGPT said:

That’s a great instinct — you’re basically building Tinkerbell as a marketing lab where every generation is an experiment, and you want to preserve the entire chain of causality:

What inputs/config you gave the AI → what outputs it produced → what scores it got → what assets it generated → how it performed in the real world.

This lets you tune, swap models, and compare experiments without breaking things. Here’s how I’d frame it, staying in your MVP “keep it light but powerful” mindset:

Recommendations for Experimentation & Traceability
1. Save all configs + prompts + outputs (causal logging)

Every generation run should create an Experiment record:

{
  "experiment_id":"uuid",
  "input_url":"https://...",
  "uvp":"short uvp",
  "persona_id":"uuid",
  "system_prompt_file":"prompts/patch_generation_v1.json",
  "model":"gemini-2.5-flash",
  "temperature":0.45,
  "seed_phrase":"Contrarian: Do less, convert more",
  "patch_id":"uuid",
  "output_json":{ /* raw ideas */ },
  "scores":{ /* viral check results */ },
  "assets":{ /* briefs, images, videos */ },
  "created_at":"...",
  "notes":"optional notes about run"
}


Store raw LLM responses, validated outputs, and scoring rationale all linked to that run.

2. System prompts as JSON files

Put each system prompt into /prompts/{task}_{version}.json:

{
  "name":"patch_generation",
  "version":"v1",
  "system_prompt":"You are a guerrilla B2B marketer AI. Output valid JSON only…",
  "schema_enforced":true,
  "last_updated":"2025-09-30",
  "notes":"First version with strict JSON schema."
}


That way you can swap prompt versions easily and track which version generated which outputs.

3. Model swap flexibility

Store model as part of every experiment config (e.g. "gemini-2.5-flash").

If you later switch to "gemini-pro", just update config → run again → now you can compare outputs across models on the same inputs.

4. Experiment tagging

Add simple tags to experiments:

model_version (gemini-2.5-flash)

prompt_version (patch_generation_v1)

seed_batch (guerrilla_v1)

temperature_schedule ([0.2,0.4,0.6])

This way you can query Supabase:
👉 “Show me all runs with gemini-2.5-flash and patch_generation_v1, temperature=0.4, that scored >75.”

5. Document changes like a changelog

Keep a /experiments/CHANGELOG.md where you note every adjustment:

2025-09-30: Updated seed list to include humor variant; results looked more diverse.

2025-10-05: Raised patch temp from 0.35→0.45 to reduce duplicates.

This becomes your lab notebook, super valuable later.

6. Make iteration cheap

Because you log everything, you can re-run old inputs with a different model, prompt, or scoring config and directly compare.

Example: Re-run 2025-09-30 experiment with gemini-2.5-pro, patch_generation_v2.json → compare scores side-by-side.

7. What else I’d suggest (high ROI, low lift)

Version seeds too. Save which seed list version (seeds_v1.json) was used.

Store JSON schema definitions. Keep schemas in /schemas/idea.json, /schemas/persona.json. This ensures you can validate outputs consistently across experiments.

Enable replay. If you want to test with a new scoring method (e.g. a new ViralCheck formula), you can replay old raw outputs → rescore them → compare.

Metrics dashboard. Build a simple dashboard that shows: number of unique ideas generated, % duplicates, average final_score, etc. → easy way to observe experiments.

Optional: human feedback loop. Store user selections (which persona/idea they liked most). That’s gold for fine-tuning later.

👉 So in short:

Every generation = Experiment record.

Prompts/models/seeds/temps = versioned JSON files.

Outputs + scores saved with provenance.

Changelog to track changes.

Replay/rescore option.

This gives you a marketing lab where you can A/B test everything and never lose track of why one output was better.

6. **Microbudget Testing**
   Instead of wasting thousands upfront, campaigns can be tested live for just **$1–$5**. Ads that flop are killed quickly. Ads that succeed are scaled immediately.

7. **Final Dashboard**
   The user sees a ranked list of their best campaigns, complete with copy, images, video previews, and scoring rationales. They can export or launch them instantly.

---

## Why It Works

* **From Guesswork to Data:** Every campaign is backed by trend analysis and AI prediction.
* **From Months to Hours:** Campaigns are created, scored, and test-ready in a single day.
* **From Thousands to Cents:** Budgets go only to winners, cutting waste.

---

## MVP Simplification
## Easy Improvements (without complexity)

* Add a **one-click test** button: automatically run a $5 ad spend on the top ad.
* Add **variants** of winning ads (AI tweaks headlines or tone).
* Simplify scoring to just AI predictive score in MVP, then expand later.

---

⚡ **One-liner**: Tinkerbell is the crystal ball for B2B marketing — generating hundreds of ads, predicting winners, and scaling them with microbudgets.
