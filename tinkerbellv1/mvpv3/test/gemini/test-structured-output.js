#!/usr/bin/env node
require('dotenv/config');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const { GoogleGenAI, Type } = await import('@google/genai');
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY not found in .env');
      process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey });

    // Load prompt from prompt.json
    const promptPath = path.join(process.cwd(), 'test', 'gemini', 'prompt.json');
    const promptData = JSON.parse(fs.readFileSync(promptPath, 'utf8'));
    const promptText = promptData.prompt || promptData;

    // Load output structure schema from output-structure.json
    const schemaPath = path.join(process.cwd(), 'test', 'gemini', 'output-structure.json');
    const responseSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    console.log('Generating structured output...\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    console.log('--- Structured JSON Output ---\n');
    console.log(response.text);

    // Optionally parse and pretty-print
    try {
      const parsed = JSON.parse(response.text);
      console.log('\n--- Pretty Printed ---\n');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Already printed raw text above
    }

  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  }
})();
