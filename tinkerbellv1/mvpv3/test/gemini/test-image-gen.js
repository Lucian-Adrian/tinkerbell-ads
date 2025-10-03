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

    // Load prompt from JSON
    const promptPath = path.join(process.cwd(), 'test', 'gemini', 'prompt-image-gen.json');
    const promptData = JSON.parse(fs.readFileSync(promptPath, 'utf8'));

    console.log(`Generating ${promptData.numberOfImages || 1} image(s)...`);

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt: promptData.prompt,
      config: {
        numberOfImages: promptData.numberOfImages || 2,
      },
    });

    let idx = 1;
    for (const generatedImage of response.generatedImages) {
      const imgBytes = generatedImage.image.imageBytes;
      const buffer = Buffer.from(imgBytes, 'base64');
      const filename = `test/gemini/imagen-${idx}.png`;
      fs.writeFileSync(filename, buffer);
      console.log(`✓ Saved ${filename}`);
      idx++;
    }

    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  }
})();
