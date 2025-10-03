const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

function ensureUrl(url) {
  try {
    return new URL(url);
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

function summariseHost(hostname) {
  return hostname
    .replace(/^www\./, '')
    .replace(/[-_]/g, ' ')
    .split('.')[0]
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function fallbackContext(companyUrl) {
  const parsed = ensureUrl(companyUrl);
  const brand = summariseHost(parsed.hostname);
  return {
    company_url: companyUrl,
    company_name: brand,
    tagline: `${brand} makes web experiences effortless`,
    industry: 'Software-as-a-Service',
    target_customers: ['Marketing teams', 'Growth leaders', 'Founders'],
    description: `${brand} streamlines go-to-market experiments with guided workflows.`,
    unique_value_proposition: `${brand} turns complex digital workflows into a guided journey for customers in minutes.`,
    value_proposition: `${brand} turns complex digital workflows into a guided journey for customers in minutes.`,
    keywords: ['automation', 'marketing-ops', 'conversion'],
    pain_points_addressed: [
      'Fragmented campaign tooling',
      'Slow creative testing cycles',
      'Lack of unified analytics'
    ],
    brand_tone: 'Confident, energetic, optimistic'
  };
}

function normaliseArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normaliseContext(context, companyUrl) {
  if (!context || typeof context !== 'object') {
    return fallbackContext(companyUrl);
  }

  const fallback = fallbackContext(companyUrl);
  return {
    ...fallback,
    ...context,
    company_url: companyUrl || context.company_url || fallback.company_url,
    company_name: context.company_name || fallback.company_name,
    tagline: context.tagline || context.description || fallback.tagline,
    industry: context.industry || fallback.industry,
    target_customers: normaliseArray(context.target_customers || context.target_audience || fallback.target_customers),
    keywords: normaliseArray(context.keywords || fallback.keywords),
    pain_points_addressed: normaliseArray(context.pain_points_addressed || context.pain_points || fallback.pain_points_addressed),
    brand_tone: context.brand_tone || context.tone || fallback.brand_tone,
    value_proposition: context.value_proposition || context.unique_value_proposition || context.description || fallback.value_proposition,
    unique_value_proposition: context.unique_value_proposition || context.value_proposition || context.description || fallback.unique_value_proposition,
    description: context.description || fallback.description
  };
}

async function loadJson(relativePath) {
  const absolutePath = path.resolve(__dirname, '..', relativePath);
  const content = await fs.readFile(absolutePath, 'utf-8');
  return JSON.parse(content);
}

async function loadModelConfig(key) {
  return loadJson(path.join('config', `${key}.json`));
}

async function loadPrompt(relativePath) {
  return loadJson(path.join('prompts', relativePath));
}

async function loadSeeds() {
  return loadJson(path.join('seeds', 'idea-templates.json'));
}

function* temperatureIterator(base, batches) {
  const jitter = 0.1;
  for (let index = 0; index < batches; index++) {
    const offset = ((index % 3) - 1) * jitter;
    yield Math.max(0.1, Math.min(1.2, parseFloat((base + offset).toFixed(2))));
  }
}

function generatePersonas({ context, count = 5 }) {
  const segments = [
    'data-driven growth marketers',
    'brand storytellers',
    'ops-minded founders',
    'performance advertisers',
    'community-led evangelists',
    'product marketers'
  ];

  const personas = [];
  let baseName = context.company_name;
  if (!baseName) {
    try {
      baseName = summariseHost(new URL(context.company_url).hostname);
    } catch (error) {
      baseName = 'Brand';
    }
  }
  const valueProp = context.value_proposition || context.unique_value_proposition || context.description;

  for (let i = 0; i < count; i++) {
    const segment = segments[(i + 3) % segments.length];
    personas.push({
      id: randomUUID(),
      name: `${baseName} Persona ${i + 1}`,
      description: `${baseName} works with ${segment} who crave ${valueProp?.toLowerCase() ?? 'clear outcomes.'}`,
      tone: i % 2 === 0 ? 'Bold' : 'Consultative',
      pain_points: [
        'Fragmented campaign tooling',
        'Slow creative testing cycles',
        'Lack of unified analytics'
      ],
      keywords: [
        context.industry?.toLowerCase() ?? 'industry',
        'marketing-ops',
        `innovation-${i + 1}`
      ]
    });
  }

  return personas;
}

function generateIdeas({
  persona,
  seeds,
  batchSize,
  targetIdeas,
  temperatureSeed,
  promptName,
  modelName
}) {
  const batches = Math.ceil(targetIdeas / batchSize);
  const iterator = temperatureIterator(temperatureSeed, batches);
  const ideas = [];

  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const seed = seeds[batchIndex % seeds.length];
    const currentTemperature = iterator.next().value;
    const size = Math.min(batchSize, targetIdeas - ideas.length);

    for (let i = 0; i < size; i++) {
      const sequence = batchIndex * batchSize + i + 1;
      ideas.push({
        id: randomUUID(),
        persona_id: persona.id,
        batch_id: `${batchIndex + 1}`,
        seed_template: seed.id,
        temperature: currentTemperature,
        prompt_used: promptName,
        model_used: modelName,
        headline: `${seed.title}: ${persona.name} #${sequence}`,
        hook: `${persona.description} — spark urgency with ${seed.frame.toLowerCase()}.`,
        body: `${persona.name} craves outcomes fast. Use ${seed.frame.toLowerCase()} to prove the value proposition: ${persona.description}`,
        keywords: persona.keywords.slice(0, 3)
      });
    }
  }

  return ideas.slice(0, targetIdeas);
}

function generateScripts(selectedIdeas) {
  return selectedIdeas.map((idea, index) => {
    const provider = idea.model_used?.split('-')[0] ?? 'model';
    return {
      id: randomUUID(),
      idea_id: idea.id,
      persona_id: idea.persona_id,
      draft: `Script draft ${index + 1} for ${idea.headline}. Focus on ${idea.keywords.join(', ')}.`,
      call_to_action: `CTA: Launch with ${provider.toUpperCase()} today.`
    };
  });
}

function generateAssets(scripts) {
  return scripts.map((script, index) => ({
    id: randomUUID(),
    script_id: script.id,
    idea_id: script.idea_id,
    asset_type: index % 2 === 0 ? 'Storyboard' : 'Static Concept',
    summary: `Asset derived from script ${script.id}: emphasise hero moment and CTA.`,
    deliverables: ['Storyboard PDF', 'Caption doc', 'Shot list']
  }));
}

module.exports = {
  ensureUrl,
  summariseHost,
  fallbackContext,
  normaliseContext,
  loadModelConfig,
  loadPrompt,
  loadSeeds,
  generatePersonas,
  generateIdeas,
  generateScripts,
  generateAssets
};
