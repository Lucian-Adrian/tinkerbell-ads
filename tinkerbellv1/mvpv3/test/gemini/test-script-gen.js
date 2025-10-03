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

async function runScriptGeneration(options = {}) {
  const {
    ideasPath,
    ideaIds,
    outputPath,
    json: jsonOutput = false
  } = options;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Error: GEMINI_API_KEY not found in .env');
  }

  // Load ideas
  const resolvedIdeasPath = ideasPath
    ? path.resolve(ideasPath)
    : path.join(process.cwd(), 'test', 'gemini', 'ideas.json');

  if (!fs.existsSync(resolvedIdeasPath)) {
    throw new Error(`Ideas file not found: ${resolvedIdeasPath}`);
  }

  const ideasData = JSON.parse(fs.readFileSync(resolvedIdeasPath, 'utf8'));
  const allIdeas = ideasData.ideas || ideasData;

  // Filter selected ideas
  let selectedIdeas = allIdeas;
  if (ideaIds && Array.isArray(ideaIds) && ideaIds.length > 0) {
    selectedIdeas = allIdeas.filter(idea => ideaIds.includes(idea.id));
  }

  if (selectedIdeas.length === 0) {
    throw new Error('No ideas selected for script generation');
  }

  const { GoogleGenAI } = await import('@google/genai');
  const { randomUUID } = require('crypto');
  const ai = new GoogleGenAI({ apiKey });

  if (!jsonOutput) {
    console.log(`Generating video scripts for ${selectedIdeas.length} ideas...\n`);
  }

  const scripts = [];

  for (let idx = 0; idx < selectedIdeas.length; idx++) {
    const idea = selectedIdeas[idx];

    const promptText = `You are an expert video creative director for paid social advertising campaigns.

Create a detailed video ad script based on this campaign idea:

Headline: ${idea.headline}
Hook: ${idea.hook}
Body: ${idea.body}
Keywords: ${idea.keywords.join(', ')}

Generate a complete video script with the following structure:
- Opening Hook (3 seconds)
- Problem/Pain Point (5 seconds)
- Solution Introduction (5 seconds)
- Key Benefits (7 seconds)
- Call to Action (3 seconds)

The script should be engaging, conversion-focused, and optimized for social media viewing (vertical format, 15-30 seconds total).`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        title: {
          type: 'STRING',
          description: 'Title of the video ad'
        },
        duration: {
          type: 'STRING',
          description: 'Estimated duration (e.g., "25 seconds")'
        },
        scenes: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              timestamp: {
                type: 'STRING',
                description: 'Time marker (e.g., "0:00-0:03")'
              },
              visual: {
                type: 'STRING',
                description: 'Description of what appears on screen'
              },
              voiceover: {
                type: 'STRING',
                description: 'Spoken narration or on-screen text'
              },
              music_mood: {
                type: 'STRING',
                description: 'Background music mood/style'
              }
            },
            required: ['timestamp', 'visual', 'voiceover']
          }
        },
        call_to_action: {
          type: 'STRING',
          description: 'Final CTA displayed on screen'
        },
        image_prompt: {
          type: 'STRING',
          description: 'Detailed prompt for AI image/video generation describing the key visual concept'
        }
      },
      required: ['title', 'duration', 'scenes', 'call_to_action', 'image_prompt']
    };

    if (!jsonOutput) {
      console.log(`[${idx + 1}/${selectedIdeas.length}] ${idea.headline}...`);
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
        console.error(`Script ${idx + 1} failed to parse:`, rawText);
      }
      throw new Error(`Failed to parse JSON for idea ${idea.id}: ${err.message}`);
    }

    scripts.push({
      id: randomUUID(),
      idea_id: idea.id,
      persona_id: idea.persona_id,
      ...parsed
    });
  }

  const result = {
    request_id: ideasData.request_id || null,
    ideas_file: path.basename(resolvedIdeasPath),
    total_scripts: scripts.length,
    model: 'gemini-2.5-flash',
    generated_at: new Date().toISOString(),
    scripts
  };

  // Save output if path specified
  if (outputPath) {
    const resolvedOutputPath = path.resolve(outputPath);
    fs.writeFileSync(resolvedOutputPath, JSON.stringify(result, null, 2), 'utf8');
    if (!jsonOutput) {
      console.log(`\n✓ Scripts saved to ${resolvedOutputPath}`);
    }
  }

  if (jsonOutput) {
    return result;
  }

  console.log(`\n✓ Generated ${result.scripts.length} video scripts`);
  console.log('\n--- Sample Script ---\n');
  const sample = scripts[0];
  console.log(`Title: ${sample.title}`);
  console.log(`Duration: ${sample.duration}`);
  console.log(`CTA: ${sample.call_to_action}`);
  console.log(`\nImage Prompt:\n${sample.image_prompt}`);

  return result;
}

async function cli() {
  try {
    const args = parseArgs(process.argv.slice(2));
    
    let ideaIds = null;
    if (args['idea-ids']) {
      ideaIds = args['idea-ids'].split(',').map(id => id.trim());
    }

    const result = await runScriptGeneration({
      ideasPath: args.ideas || args['ideas-file'],
      ideaIds,
      outputPath: args.output || args.out,
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
  runScriptGeneration
};
