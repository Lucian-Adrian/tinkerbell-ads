#!/usr/bin/env node
require('dotenv/config');
const fs = require('fs/promises');
const path = require('path');

(async () => {
  try {
    // Load the prompt from prompt.json
    const promptPath = path.join(process.cwd(), 'test', 'gemini', 'prompt.json');
    const promptRaw = await fs.readFile(promptPath, 'utf8');
    const promptData = JSON.parse(promptRaw);
    const promptText = promptData.prompt || promptData;

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY not found in environment. Add it to .env file.');
      process.exit(1);
    }

    // Import GoogleGenAI SDK
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    // Make the request with urlContext tool
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [promptText],
      config: {
        tools: [{ urlContext: {} }],
      },
    });

    // Print the response text
    console.log('\n--- Generated Response ---\n');
    console.log(response.text);

    // Print URL context metadata
    console.log('\n--- URL Context Metadata ---\n');
    console.log(JSON.stringify(response.candidates[0].urlContextMetadata, null, 2));

  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  }
})();
