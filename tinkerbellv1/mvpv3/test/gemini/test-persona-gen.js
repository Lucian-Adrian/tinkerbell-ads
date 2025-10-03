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

async function runPersonaGeneration(options = {}) {
  const { contextPath, promptPath, outputPath, json: jsonOutput = false } = options;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Error: GEMINI_API_KEY not found in .env');
  }

  // Load context from file
  const resolvedContextPath = contextPath
    ? path.resolve(contextPath)
    : path.join(process.cwd(), 'minidemo', 'data', 'business_context.json');

  if (!fs.existsSync(resolvedContextPath)) {
    throw new Error(`Context file not found: ${resolvedContextPath}`);
  }

  const contextData = JSON.parse(fs.readFileSync(resolvedContextPath, 'utf8'));
  const context = contextData.context || contextData;

  // Load prompt configuration
  const resolvedPromptPath = promptPath
    ? path.resolve(promptPath)
    : path.join(process.cwd(), 'minidemo', 'prompts', 'prompt-personas.json');

  const promptConfig = JSON.parse(fs.readFileSync(resolvedPromptPath, 'utf8'));

  // Build the persona generation prompt
  const contextSummary = `
Company: ${context.company_name || 'Unknown'}
Industry: ${context.industry || 'Unknown'}
Description: ${context.description || context.tagline || context.value_proposition || 'N/A'}
Target Customers: ${Array.isArray(context.target_customers) ? context.target_customers.join(', ') : context.target_customers || 'N/A'}
Brand Tone: ${context.brand_tone || context.tone || 'N/A'}
Keywords: ${Array.isArray(context.keywords) ? context.keywords.join(', ') : context.keywords || 'N/A'}
Pain Points: ${Array.isArray(context.pain_points_addressed) ? context.pain_points_addressed.join(', ') : context.pain_points_addressed || 'N/A'}
`.trim();

  const promptText = `${promptConfig.request.instructions}

Business Context:
${contextSummary}

Generate exactly 5 distinct marketing personas that would be ideal targets for this company's advertising campaigns. Each persona should reflect different segments of the target audience.`;

  // Define the response schema for 5 personas
  const responseSchema = {
    type: 'OBJECT',
    properties: {
      personas: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: {
              type: 'STRING',
              description: 'A descriptive name for this persona (e.g., "Growth-Driven Marketing Leader")'
            },
            description: {
              type: 'STRING',
              description: 'A detailed description of this persona including their role, goals, and motivations'
            },
            tone: {
              type: 'STRING',
              description: 'The communication tone that resonates with this persona (e.g., "Bold", "Consultative", "Friendly")'
            },
            pain_points: {
              type: 'ARRAY',
              items: {
                type: 'STRING'
              },
              description: 'Key challenges and pain points this persona faces'
            },
            keywords: {
              type: 'ARRAY',
              items: {
                type: 'STRING'
              },
              description: 'Relevant keywords and themes that resonate with this persona'
            }
          },
          required: ['name', 'description', 'tone', 'pain_points', 'keywords']
        },
        description: 'Array of exactly 5 personas'
      }
    },
    required: ['personas']
  };

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  if (!jsonOutput) {
    console.log('Generating personas with Gemini 2.5 Flash...\n');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: promptText,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.7,
      maxOutputTokens: 4096
    }
  });

  const rawText = typeof response.text === 'function' ? response.text() : (response.text ?? '');

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    if (!jsonOutput) {
      console.error('Raw response text:');
      console.error(rawText);
    }
    throw new Error(`Failed to parse JSON response: ${err.message}`);
  }

  // Add unique IDs to each persona
  if (parsed.personas && Array.isArray(parsed.personas)) {
    const { randomUUID } = require('crypto');
    parsed.personas = parsed.personas.map(persona => ({
      id: randomUUID(),
      ...persona
    }));
  }

  const result = {
    request_id: contextData.request_id || null,
    context_file: path.basename(resolvedContextPath),
    prompt_used: promptConfig.name,
    model: 'gemini-2.5-flash',
    generated_at: new Date().toISOString(),
    ...parsed
  };

  // Save output if path specified
  if (outputPath) {
    const resolvedOutputPath = path.resolve(outputPath);
    fs.writeFileSync(resolvedOutputPath, JSON.stringify(result, null, 2), 'utf8');
    if (!jsonOutput) {
      console.log(`\n✓ Personas saved to ${resolvedOutputPath}`);
    }
  }

  if (jsonOutput) {
    return result;
  }

  console.log('--- Generated Personas (JSON) ---\n');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

async function cli() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = await runPersonaGeneration({
      contextPath: args.context || args['context-file'],
      promptPath: args.prompt,
      outputPath: args.output || args.out,
      json: Boolean(args.json)
    });

    if (args.json) {
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
  runPersonaGeneration
};
