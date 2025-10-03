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

async function runContextExtraction(options = {}) {
  const { companyUrl, promptPath, json: jsonOutput = false } = options;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Error: GEMINI_API_KEY not found in .env');
  }

  const resolvedPromptPath = promptPath
    ? path.resolve(promptPath)
    : path.join(process.cwd(), 'test', 'gemini', 'prompt-context-extraction.json');

  const config = JSON.parse(fs.readFileSync(resolvedPromptPath, 'utf8'));
  if (companyUrl) {
    config.company_url = companyUrl;
  }

  const finalPrompt = config.prompt_template.replace('{{company_url}}', config.company_url);

  const requestConfig = {
    model: 'gemini-2.5-flash',
    contents: [finalPrompt],
    config: {}
  };

  if (config.system_instruction) {
    requestConfig.systemInstruction = config.system_instruction;
  }

  if (config.temperature !== undefined || config.max_tokens !== undefined) {
    requestConfig.generationConfig = {};
    if (config.temperature !== undefined) {
      requestConfig.generationConfig.temperature = config.temperature;
    }
    if (config.max_tokens !== undefined) {
      requestConfig.generationConfig.maxOutputTokens = config.max_tokens;
    }
  }

  // IMPORTANT: When using urlContext tool, you CANNOT use responseMimeType
  // The tool and structured output are mutually exclusive
  if (config.tools && config.tools.length > 0) {
    requestConfig.config.tools = config.tools;
    // Do NOT set responseMimeType when using tools
  } else if (config.response_mime_type) {
    // Only add responseMimeType if NOT using tools
    requestConfig.config.responseMimeType = config.response_mime_type;
  }

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent(requestConfig);
  const rawText = typeof response.text === 'function'
    ? response.text()
    : (response.text ?? '');

  let parsed;
  try {
    // Try to parse as-is first
    parsed = JSON.parse(rawText);
  } catch (err) {
    // Try to extract JSON from markdown code fences
    try {
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        // Try without code fence markers
        const cleanText = rawText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        parsed = JSON.parse(cleanText);
      }
    } catch (err2) {
      parsed = null;
    }
  }

  const result = {
    prompt: {
      name: config.name,
      version: config.version,
      description: config.description
    },
    request: {
      temperature: config.temperature,
      maxTokens: config.max_tokens
    },
    context: parsed,
    rawText,
    urlContextMetadata: response.candidates?.[0]?.urlContextMetadata ?? null
  };

  if (jsonOutput) {
    return result;
  }

  console.log(`Running: ${config.name} v${config.version}`);
  console.log(`Description: ${config.description}`);
  if (config.temperature !== undefined) {
    console.log(`Temperature: ${config.temperature}`);
  }
  if (config.max_tokens !== undefined) {
    console.log(`Max Tokens: ${config.max_tokens}\n`);
  }

  console.log('Generating structured extraction...\n');
  console.log('--- Extracted Context (JSON) ---\n');
  console.log(rawText);

  if (parsed) {
    console.log('\n--- Pretty Printed ---\n');
    console.log(JSON.stringify(parsed, null, 2));
  }

  if (result.urlContextMetadata) {
    console.log('\n--- URL Context Metadata ---\n');
    console.log(JSON.stringify(result.urlContextMetadata, null, 2));
  }

  return result;
}

async function cli() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = await runContextExtraction({
      companyUrl: args['company-url'] || process.env.COMPANY_URL,
      promptPath: args.prompt,
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
  runContextExtraction
};
