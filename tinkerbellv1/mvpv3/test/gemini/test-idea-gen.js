#!/usr/bin/env node
require('dotenv/config');
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

async function runIdeaGeneration(options = {}) {
  const {
    contextPath,
    personaPath,
    personaId,
    seedsPath,
    promptPath,
    outputPath,
    batchSize = 5,
    targetIdeas = 30,
    temperatureSeed = 0.8,
    json: jsonOutput = false
  } = options;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Error: GEMINI_API_KEY not found in .env');
  }

  // Load context
  const resolvedContextPath = contextPath
    ? path.resolve(contextPath)
    : path.join(process.cwd(), 'minidemo', 'data', 'business_context.json');

  if (!fs.existsSync(resolvedContextPath)) {
    throw new Error(`Context file not found: ${resolvedContextPath}`);
  }

  const contextData = JSON.parse(fs.readFileSync(resolvedContextPath, 'utf8'));
  const context = contextData.context || contextData;

  // Load personas
  const resolvedPersonaPath = personaPath
    ? path.resolve(personaPath)
    : path.join(process.cwd(), 'test', 'gemini', 'personas.json');

  if (!fs.existsSync(resolvedPersonaPath)) {
    throw new Error(`Persona file not found: ${resolvedPersonaPath}`);
  }

  const personaData = JSON.parse(fs.readFileSync(resolvedPersonaPath, 'utf8'));
  const personas = personaData.personas || personaData;

  // Select the persona
  let selectedPersona;
  if (personaId) {
    selectedPersona = personas.find(p => p.id === personaId);
    if (!selectedPersona) {
      throw new Error(`Persona with id ${personaId} not found`);
    }
  } else {
    selectedPersona = personas[0];
  }

  // Load seeds
  const resolvedSeedsPath = seedsPath
    ? path.resolve(seedsPath)
    : path.join(process.cwd(), 'minidemo', 'seeds', 'idea-templates.json');

  const seeds = JSON.parse(fs.readFileSync(resolvedSeedsPath, 'utf8'));

  // Load prompt configuration
  const resolvedPromptPath = promptPath
    ? path.resolve(promptPath)
    : path.join(process.cwd(), 'minidemo', 'prompts', 'prompt-ideas.json');

  const promptConfig = JSON.parse(fs.readFileSync(resolvedPromptPath, 'utf8'));

  // Calculate batches
  const numBatches = Math.ceil(Number(targetIdeas) / Number(batchSize));
  const ideas = [];

  const { GoogleGenAI } = await import('@google/genai');
  const { randomUUID } = require('crypto');
  const ai = new GoogleGenAI({ apiKey });

  if (!jsonOutput) {
    console.log(`Generating ${targetIdeas} ideas in ${numBatches} batches...`);
    console.log(`Persona: ${selectedPersona.name}\n`);
  }

  // Generate ideas in batches
  for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
    const seed = seeds[batchIndex % seeds.length];
    const currentBatchSize = Math.min(Number(batchSize), Number(targetIdeas) - ideas.length);
    
    // Temperature variation
    const jitter = 0.1;
    const offset = ((batchIndex % 3) - 1) * jitter;
    const temperature = Math.max(0.1, Math.min(1.2, parseFloat((Number(temperatureSeed) + offset).toFixed(2))));

    const promptText = `${promptConfig.request.instructions}

Business Context:
Company: ${context.company_name || 'Unknown'}
Value Proposition: ${context.value_proposition || context.description || 'N/A'}
Industry: ${context.industry || 'Unknown'}

Target Persona:
Name: ${selectedPersona.name}
Description: ${selectedPersona.description}
Tone: ${selectedPersona.tone}
Pain Points: ${selectedPersona.pain_points.join(', ')}
Keywords: ${selectedPersona.keywords.join(', ')}

Creative Seed Template:
Title: ${seed.title}
Frame: ${seed.frame}
Format: ${seed.format}

Generate exactly ${currentBatchSize} unique advertising campaign ideas tailored to this persona and creative direction.`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        ideas: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              headline: {
                type: 'STRING',
                description: 'Attention-grabbing headline for the ad'
              },
              hook: {
                type: 'STRING',
                description: 'Opening hook that captures attention in the first 3 seconds'
              },
              body: {
                type: 'STRING',
                description: 'Main body copy that explains the value proposition'
              },
              keywords: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Relevant keywords for targeting and optimization'
              }
            },
            required: ['headline', 'hook', 'body', 'keywords']
          }
        }
      },
      required: ['ideas']
    };

    if (!jsonOutput) {
      console.log(`Batch ${batchIndex + 1}/${numBatches} (temperature: ${temperature})...`);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature,
        maxOutputTokens: 4096
      }
    });

    const rawText = typeof response.text === 'function' ? response.text() : (response.text ?? '');

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      if (!jsonOutput) {
        console.error(`Batch ${batchIndex + 1} failed to parse:`, rawText);
      }
      throw new Error(`Failed to parse JSON in batch ${batchIndex + 1}: ${err.message}`);
    }

    if (parsed.ideas && Array.isArray(parsed.ideas)) {
      parsed.ideas.forEach(idea => {
        ideas.push({
          id: randomUUID(),
          persona_id: selectedPersona.id,
          batch_id: `${batchIndex + 1}`,
          seed_template: seed.id,
          temperature,
          prompt_used: promptConfig.name,
          model_used: 'gemini-2.5-flash',
          ...idea
        });
      });
    }

    if (ideas.length >= Number(targetIdeas)) {
      break;
    }
  }

  const result = {
    request_id: contextData.request_id || personaData.request_id || null,
    context_file: path.basename(resolvedContextPath),
    persona_file: path.basename(resolvedPersonaPath),
    persona_id: selectedPersona.id,
    persona_name: selectedPersona.name,
    prompt_used: promptConfig.name,
    model: 'gemini-2.5-flash',
    total_ideas: ideas.length,
    batch_size: Number(batchSize),
    target_ideas: Number(targetIdeas),
    temperature_seed: Number(temperatureSeed),
    generated_at: new Date().toISOString(),
    ideas: ideas.slice(0, Number(targetIdeas))
  };

  // Save output if path specified
  if (outputPath) {
    const resolvedOutputPath = path.resolve(outputPath);
    fs.writeFileSync(resolvedOutputPath, JSON.stringify(result, null, 2), 'utf8');
    if (!jsonOutput) {
      console.log(`\n✓ Ideas saved to ${resolvedOutputPath}`);
    }
  }

  if (jsonOutput) {
    return result;
  }

  console.log(`\n✓ Generated ${result.ideas.length} ideas`);
  console.log('\n--- Sample Ideas ---\n');
  result.ideas.slice(0, 3).forEach((idea, idx) => {
    console.log(`${idx + 1}. ${idea.headline}`);
    console.log(`   Hook: ${idea.hook}`);
    console.log(`   Keywords: ${idea.keywords.join(', ')}\n`);
  });

  return result;
}

async function cli() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = await runIdeaGeneration({
      contextPath: args.context || args['context-file'],
      personaPath: args.personas || args['persona-file'],
      personaId: args['persona-id'],
      seedsPath: args.seeds || args['seed-file'],
      promptPath: args.prompt,
      outputPath: args.output || args.out,
      batchSize: args['batch-size'] || 5,
      targetIdeas: args['target-ideas'] || 30,
      temperatureSeed: args['temperature-seed'] || args.temperature || 0.8,
      json: Boolean(args.json)
    });

    if (args.json && !args.output) {
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  }
}

if (require.main === module) {
  cli();
}

module.exports = {
  runIdeaGeneration
};
