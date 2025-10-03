#!/usr/bin/env node
require('dotenv/config');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY not found in .env');
      process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey });

    // Load comprehensive prompt configuration
    const promptPath = path.join(process.cwd(), 'test', 'gemini', 'prompt-context-extraction.json');
    const config = JSON.parse(fs.readFileSync(promptPath, 'utf8'));

    console.log(`Running: ${config.name} v${config.version}`);
    console.log(`Description: ${config.description}\n`);

    // Replace template variables
    let finalPrompt = config.prompt_template.replace('{{company_url}}', config.company_url);

    // Build the request
    const requestConfig = {
      model: 'gemini-2.5-flash',
      contents: [finalPrompt],
      config: {}
    };

    // Add system instruction if present
    if (config.system_instruction) {
      requestConfig.systemInstruction = config.system_instruction;
    }

    // Add generation config
    if (config.temperature !== undefined || config.max_tokens !== undefined) {
      requestConfig.generationConfig = {};
      if (config.temperature !== undefined) requestConfig.generationConfig.temperature = config.temperature;
      if (config.max_tokens !== undefined) requestConfig.generationConfig.maxOutputTokens = config.max_tokens;
    }

    // Add tools if specified (note: can't use responseMimeType with tools)
    if (config.tools && config.tools.length > 0) {
      requestConfig.config.tools = config.tools;
    } else if (config.response_mime_type) {
      // Only add responseMimeType if not using tools
      requestConfig.config.responseMimeType = config.response_mime_type;
    }

    console.log('Generating structured extraction...\n');

    const response = await ai.models.generateContent(requestConfig);

    console.log('--- Extracted Context (JSON) ---\n');
    console.log(response.text);

    // Pretty print
    try {
      const parsed = JSON.parse(response.text);
      console.log('\n--- Pretty Printed ---\n');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Raw output already shown
    }

    // Show URL metadata if available
    if (response.candidates?.[0]?.urlContextMetadata) {
      console.log('\n--- URL Context Metadata ---\n');
      console.log(JSON.stringify(response.candidates[0].urlContextMetadata, null, 2));
    }

  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  }
})();
