#!/usr/bin/env node
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const {
  saveBusinessContext,
  savePersonas,
  savePersonaSelection,
  saveIdeas
} = require("./storage/index.js");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

async function loadJson(filePath) {
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
}

function resolvePath(relativePath, fallbackDir = process.cwd()) {
  if (!relativePath) return null;
  return path.isAbsolute(relativePath)
    ? relativePath
    : path.resolve(fallbackDir, relativePath);
}

function ensureUrl(url) {
  try {
    return new URL(url);
  } catch (err) {
    throw new Error(`Invalid company URL: ${url}`);
  }
}

function summariseHost(hostname) {
  return hostname
    .replace(/^www\./, "")
    .replace(/[-_]/g, " ")
    .split(".")[0]
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mockGeminiUrlContext({ companyUrl, prompt }) {
  const url = ensureUrl(companyUrl);
  const brand = summariseHost(url.hostname);
  return {
    company_name: brand,
    tagline: `${brand} makes web experiences effortless`,
    industry: "Software-as-a-Service",
    target_customers: ["Marketing teams", "Growth leaders", "Founders"],
    value_proposition: `${brand} turns complex digital workflows into a guided journey for customers in minutes.`,
    key_features: [
      "Drag-and-drop campaign builder",
      "AI-generated creative briefs",
      "Real-time analytics dashboard"
    ],
    tone: "Confident, energetic, optimistic",
    call_to_action: `Start building with ${brand} today`
  };
}

function mockPersonaGenerator({ context, prompt, model }) {
  const seedSegments = [
    "data-driven growth marketers",
    "brand storytellers",
    "ops-minded founders",
    "performance advertisers",
    "community-led evangelists",
    "product marketers"
  ];

  const personas = [];
  const baseName = context.company_name;
  for (let i = 0; i < 5; i++) {
    const segment = seedSegments[(i + 3) % seedSegments.length];
    personas.push({
      id: randomUUID(),
      name: `${baseName} Persona ${i + 1}`,
      description: `${baseName} works with ${segment} who crave ${context.value_proposition.toLowerCase()}.`,
      tone: i % 2 === 0 ? "Bold" : "Consultative",
      pain_points: [
        "Fragmented campaign tooling",
        "Slow creative testing cycles",
        "Lack of unified analytics"
      ],
      keywords: [
        `innovation-${i + 1}`,
        "marketing-ops",
        "conversion-lift"
      ]
    });
  }
  return personas;
}

function* temperatureIterator(base, batches) {
  const jitter = 0.1;
  for (let i = 0; i < batches; i++) {
    const offset = ((i % 3) - 1) * jitter;
    yield Math.max(0.1, Math.min(1.2, parseFloat((base + offset).toFixed(2))));
  }
}

function mockIdeaGenerator({
  persona,
  seed,
  batchSize,
  batchIndex,
  temperature,
  promptName,
  modelName
}) {
  const ideas = [];
  for (let i = 0; i < batchSize; i++) {
    const id = randomUUID();
    ideas.push({
      id,
      persona_id: persona.id,
      batch_id: `${batchIndex + 1}`,
      seed_template: seed.id,
      temperature,
      prompt_used: promptName,
      model_used: modelName,
      headline: `${seed.title}: ${persona.name} #${batchIndex * batchSize + i + 1}`,
      hook: `${persona.description} — spark urgency with ${seed.frame.toLowerCase()}.`,
      body: `${persona.name} craves outcomes fast. Use ${seed.frame.toLowerCase()} to prove the value proposition: ${persona.description}`,
      keywords: persona.keywords.slice(0, 3)
    });
  }
  return ideas;
}

async function main() {
  const args = parseArgs(process.argv);
  const companyUrl = args["company-url"] ?? "https://example.com";
  const requestId = randomUUID();
  const baseDir = path.resolve(process.cwd(), "minidemo");

  const contextPromptPath = resolvePath(
    args["context-prompt"] ?? "./prompts/prompt-context-v1.json",
    baseDir
  );
  const personaPromptPath = resolvePath(
    args["persona-prompt"] ?? "./prompts/prompt-personas.json",
    baseDir
  );
  const ideaPromptPath = resolvePath(
    args["idea-prompt"] ?? "./prompts/prompt-ideas.json",
    baseDir
  );
  const seedFilePath = resolvePath(
    args["seed-file"] ?? "./seeds/idea-templates.json",
    baseDir
  );

  const modelKey = (args.model ?? "gemini").toLowerCase();
  const modelConfigPath = resolvePath(`./config/${modelKey}.json`, baseDir);

  const batchSize = Number(args["batch-size"] ?? 5);
  const targetIdeas = Number(args["target-ideas"] ?? 30);
  const personaIndex = Number(args["persona-index"] ?? 0);
  const tempSeed = Number(args["temperature-seed"] ?? 0.8);

  const [contextPrompt, personaPrompt, ideaPrompt, seeds, modelConfig] =
    await Promise.all([
      loadJson(contextPromptPath),
      loadJson(personaPromptPath),
      loadJson(ideaPromptPath),
      loadJson(seedFilePath),
      loadJson(modelConfigPath)
    ]);

  // Step 1: Context Ingestion
  const businessContext = mockGeminiUrlContext({
    companyUrl,
    prompt: contextPrompt
  });
  const contextPath = await saveBusinessContext(requestId, businessContext);

  // Step 2: Persona Generation
  const personas = mockPersonaGenerator({
    context: businessContext,
    prompt: personaPrompt,
    model: modelConfig
  });
  const personasPath = await savePersonas(requestId, personas);

  // Step 2.1: Persona Selection
  const anchorPersona = personas[personaIndex] ?? personas[0];
  const selectionPath = await savePersonaSelection(requestId, {
    ...anchorPersona,
    selected_index: personas.indexOf(anchorPersona)
  });

  // Step 3: Anchor Persona → Idea Generation
  const batches = Math.ceil(targetIdeas / batchSize);
  const temps = temperatureIterator(tempSeed, batches);
  let ideas = [];
  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const seed = seeds[batchIndex % seeds.length];
    const temperature = temps.next().value;
    const batchIdeas = mockIdeaGenerator({
      persona: anchorPersona,
      seed,
      batchSize: Math.min(batchSize, targetIdeas - ideas.length),
      batchIndex,
      temperature,
      promptName: ideaPrompt.name,
      modelName: modelConfig.model
    });
    ideas = ideas.concat(batchIdeas);
  }
  ideas = ideas.slice(0, targetIdeas);

  const ideaMetadata = {
    request_id: requestId,
    persona_id: anchorPersona.id,
    total_ideas: ideas.length,
    batch_size: batchSize,
    target_ideas: targetIdeas,
    seed_file: path.relative(baseDir, seedFilePath),
    prompt_file: path.relative(baseDir, ideaPromptPath),
    model: modelConfig.model
  };

  const { jsonPath: ideasJsonPath, csvPath: ideasCsvPath } = await saveIdeas(
    anchorPersona.id,
    ideas,
    ideaMetadata
  );

  console.log("Mini demo pipeline complete!\n");
  console.log("Artifacts:");
  console.log(`  Context → ${path.relative(process.cwd(), contextPath)}`);
  console.log(`  Personas → ${path.relative(process.cwd(), personasPath)}`);
  console.log(`  Selection → ${path.relative(process.cwd(), selectionPath)}`);
  console.log(`  Ideas JSON → ${path.relative(process.cwd(), ideasJsonPath)}`);
  console.log(`  Ideas CSV → ${path.relative(process.cwd(), ideasCsvPath)}`);
}

main().catch((error) => {
  console.error("Pipeline failed:", error);
  process.exit(1);
});
