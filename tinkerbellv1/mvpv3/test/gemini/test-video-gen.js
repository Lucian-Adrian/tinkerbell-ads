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
    const promptPath = path.join(process.cwd(), 'test', 'gemini', 'prompt-video-v1.json');
    const promptData = JSON.parse(fs.readFileSync(promptPath, 'utf8'));
    const prompt = promptData.prompt;

    console.log('Starting video generation...\n');

    let operation = await ai.models.generateVideos({
      model: 'veo-3.0-fast-generate-preview',
      prompt: prompt,
    });

    // Poll until video is ready
    while (!operation.done) {
      console.log('Waiting for video generation to complete...');
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    // Download the generated video
    const outputPath = 'test/gemini/generated-video.mp4';
    await ai.files.download({
      file: operation.response.generatedVideos[0].video,
      downloadPath: outputPath,
    });

    console.log(`\n✓ Video saved to ${outputPath}`);
  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  }
})();
