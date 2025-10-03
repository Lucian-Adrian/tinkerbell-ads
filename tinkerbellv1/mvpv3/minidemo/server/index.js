#!/usr/bin/env node
require('dotenv/config');
const express = require('express');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const {
  fallbackContext,
  normaliseContext,
  loadModelConfig,
  loadPrompt,
  loadSeeds,
  generatePersonas,
  generateIdeas,
  generateScripts,
  generateAssets
} = require('./generators.js');
const { runContextExtraction } = require('../../test/gemini/test-context-extraction.js');
const { runPersonaGeneration } = require('../../test/gemini/test-persona-gen.js');
const { runIdeaGeneration } = require('../../test/gemini/test-idea-gen.js');
const { runScriptGeneration } = require('../../test/gemini/test-script-gen.js');

const PORT = Number(process.env.MINIDEMO_PORT || process.env.PORT || 4173);
const app = express();

app.use(express.json({ limit: '2mb' }));

const uiDir = path.resolve(__dirname, '../ui');
app.use(express.static(uiDir));

const sessions = new Map();
const resourceCache = {
  personaPrompt: null,
  ideaPrompt: null,
  seeds: null,
  models: new Map()
};

async function getPersonaPrompt() {
  if (!resourceCache.personaPrompt) {
    resourceCache.personaPrompt = await loadPrompt('prompt-personas.json');
  }
  return resourceCache.personaPrompt;
}

async function getIdeaPrompt() {
  if (!resourceCache.ideaPrompt) {
    resourceCache.ideaPrompt = await loadPrompt('prompt-ideas.json');
  }
  return resourceCache.ideaPrompt;
}

async function getSeeds() {
  if (!resourceCache.seeds) {
    resourceCache.seeds = await loadSeeds();
  }
  return resourceCache.seeds;
}

async function getModel(key) {
  if (!resourceCache.models.has(key)) {
    try {
      const model = await loadModelConfig(key);
      resourceCache.models.set(key, model);
    } catch (error) {
      resourceCache.models.set(key, null);
    }
  }
  return resourceCache.models.get(key);
}

function getSession(requestId) {
  return sessions.get(requestId);
}

function createSession({ companyUrl, context, metadata }) {
  const requestId = randomUUID();
  sessions.set(requestId, {
    companyUrl,
    context,
    metadata,
    personas: [],
    ideas: [],
    scripts: [],
    assets: []
  });
  return requestId;
}

app.post('/api/context', async (req, res) => {
  const { companyUrl } = req.body || {};
  if (!companyUrl) {
    return res.status(400).json({ error: 'companyUrl is required' });
  }

  try {
    let result;
    let apiError = null;
    
    try {
      result = await runContextExtraction({ companyUrl, json: true });
    } catch (error) {
      apiError = error.message || String(error);
      result = {
        prompt: null,
        request: null,
        context: null,
        rawText: null,
        urlContextMetadata: null,
        error: apiError
      };
    }

    // Check if we got valid structured context from Gemini
    const hasStructuredContext = result?.context && 
                                  typeof result.context === 'object' &&
                                  Object.keys(result.context).length > 0;
    
    let normalised;
    let source;
    
    if (hasStructuredContext) {
      // Use Gemini response
      normalised = normaliseContext(result.context, companyUrl);
      source = 'gemini-context-extraction';
    } else {
      // Use fallback
      normalised = fallbackContext(companyUrl);
      source = 'fallback';
    }

    const metadata = {
      context: {
        source,
        prompt: result?.prompt ?? null,
        request: result?.request ?? null,
        urlContextMetadata: result?.urlContextMetadata ?? null,
        rawText: result?.rawText ?? null,
        error: apiError
      }
    };

    const requestId = createSession({ companyUrl, context: normalised, metadata });

    return res.json({
      requestId,
      context: normalised,
      metadata: metadata.context
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Context generation failed' });
  }
});

app.post('/api/personas', async (req, res) => {
  const { requestId, modelKey = 'gemini', personaIndex = 0 } = req.body || {};
  if (!requestId) {
    return res.status(400).json({ error: 'requestId is required' });
  }

  const session = getSession(requestId);
  if (!session) {
    return res.status(404).json({ error: 'Unknown requestId' });
  }

  try {
    const personaPrompt = await getPersonaPrompt();
    const model = await getModel(modelKey);

    let personas;
    let metadata = { source: 'fallback', error: null };

    // Try to use real Gemini persona generation
    try {
      // Create a temporary context file for the generator
      const tempContextPath = path.join(__dirname, '../../minidemo/data', `temp_context_${requestId}.json`);
      const fs = require('fs');
      fs.writeFileSync(tempContextPath, JSON.stringify({
        request_id: requestId,
        saved_at: new Date().toISOString(),
        context: session.context
      }, null, 2), 'utf8');

      const result = await runPersonaGeneration({
        contextPath: tempContextPath,
        json: true
      });

      personas = result.personas;
      metadata = {
        source: 'gemini-persona-generation',
        model: result.model,
        prompt_used: result.prompt_used,
        generated_at: result.generated_at
      };

      // Clean up temp file
      try {
        fs.unlinkSync(tempContextPath);
      } catch (err) {
        // Ignore cleanup errors
      }
    } catch (error) {
      // Fall back to deterministic generation
      metadata.error = error.message || String(error);
      personas = generatePersonas({ context: session.context });
    }

    const index = Math.max(0, Math.min(personaIndex, personas.length - 1));

    session.personas = personas;
    session.ideas = [];
    session.scripts = [];
    session.assets = [];

    return res.json({
      personas,
      anchorPersonaIndex: index,
      prompt: personaPrompt,
      model,
      metadata
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Persona generation failed' });
  }
});

app.post('/api/ideas', async (req, res) => {
  const {
    requestId,
    personaId,
    batchSize = 5,
    targetIdeas = 30,
    temperatureSeed = 0.8,
    modelKey = 'gemini'
  } = req.body || {};

  if (!requestId) {
    return res.status(400).json({ error: 'requestId is required' });
  }
  if (!personaId) {
    return res.status(400).json({ error: 'personaId is required' });
  }

  const session = getSession(requestId);
  if (!session) {
    return res.status(404).json({ error: 'Unknown requestId' });
  }

  const persona = session.personas.find((item) => item.id === personaId);
  if (!persona) {
    return res.status(400).json({ error: 'personaId is not part of the current session' });
  }

  try {
    const seeds = await getSeeds();
    const ideaPrompt = await getIdeaPrompt();
    const model = await getModel(modelKey);

    let ideas;
    let metadata = { source: 'fallback', error: null };

    // Try to use real Gemini idea generation
    try {
      const fs = require('fs');
      const tempContextPath = path.join(__dirname, '../../minidemo/data', `temp_context_${requestId}.json`);
      const tempPersonaPath = path.join(__dirname, '../../minidemo/data', `temp_personas_${requestId}.json`);

      fs.writeFileSync(tempContextPath, JSON.stringify({
        request_id: requestId,
        context: session.context
      }, null, 2), 'utf8');

      fs.writeFileSync(tempPersonaPath, JSON.stringify({
        request_id: requestId,
        personas: session.personas
      }, null, 2), 'utf8');

      const result = await runIdeaGeneration({
        contextPath: tempContextPath,
        personaPath: tempPersonaPath,
        personaId,
        batchSize: Number(batchSize) || 5,
        targetIdeas: Number(targetIdeas) || 30,
        temperatureSeed: Number(temperatureSeed) || 0.8,
        json: true
      });

      ideas = result.ideas;
      metadata = {
        source: 'gemini-idea-generation',
        model: result.model,
        prompt_used: result.prompt_used,
        generated_at: result.generated_at,
        total_ideas: result.total_ideas
      };

      // Clean up temp files
      try {
        fs.unlinkSync(tempContextPath);
        fs.unlinkSync(tempPersonaPath);
      } catch (err) {
        // Ignore cleanup errors
      }
    } catch (error) {
      // Fall back to deterministic generation
      metadata.error = error.message || String(error);
      ideas = generateIdeas({
        persona,
        seeds,
        batchSize: Number(batchSize) || 5,
        targetIdeas: Number(targetIdeas) || 30,
        temperatureSeed: Number(temperatureSeed) || 0.8,
        promptName: ideaPrompt.name,
        modelName: model?.model || modelKey
      });
    }

    session.ideas = ideas;
    session.scripts = [];
    session.assets = [];

    return res.json({
      ideas,
      prompt: ideaPrompt,
      model,
      metadata
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Idea generation failed' });
  }
});

app.post('/api/scripts', async (req, res) => {
  const { requestId, ideaIds } = req.body || {};
  if (!requestId) {
    return res.status(400).json({ error: 'requestId is required' });
  }
  if (!Array.isArray(ideaIds) || ideaIds.length === 0) {
    return res.status(400).json({ error: 'ideaIds is required' });
  }

  const session = getSession(requestId);
  if (!session) {
    return res.status(404).json({ error: 'Unknown requestId' });
  }

  const selectedIdeas = session.ideas.filter((idea) => ideaIds.includes(idea.id));
  if (!selectedIdeas.length) {
    return res.status(400).json({ error: 'No matching ideas found for this session' });
  }

  try {
    let scripts;
    let metadata = { source: 'fallback', error: null };

    // Try to use real Gemini script generation
    try {
      const fs = require('fs');
      const tempIdeasPath = path.join(__dirname, '../../minidemo/data', `temp_ideas_${requestId}.json`);

      fs.writeFileSync(tempIdeasPath, JSON.stringify({
        request_id: requestId,
        ideas: session.ideas
      }, null, 2), 'utf8');

      const result = await runScriptGeneration({
        ideasPath: tempIdeasPath,
        ideaIds,
        json: true
      });

      scripts = result.scripts;
      metadata = {
        source: 'gemini-script-generation',
        model: result.model,
        generated_at: result.generated_at,
        total_scripts: result.total_scripts
      };

      // Clean up temp file
      try {
        fs.unlinkSync(tempIdeasPath);
      } catch (err) {
        // Ignore cleanup errors
      }
    } catch (error) {
      // Fall back to deterministic generation
      metadata.error = error.message || String(error);
      scripts = generateScripts(selectedIdeas);
    }

    session.scripts = scripts;
    session.assets = [];

    return res.json({ scripts, metadata });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Script generation failed' });
  }
});

app.post('/api/assets', (req, res) => {
  const { requestId } = req.body || {};
  if (!requestId) {
    return res.status(400).json({ error: 'requestId is required' });
  }

  const session = getSession(requestId);
  if (!session) {
    return res.status(404).json({ error: 'Unknown requestId' });
  }
  if (!session.scripts.length) {
    return res.status(400).json({ error: 'Generate scripts before requesting assets' });
  }

  const assets = generateAssets(session.scripts);
  session.assets = assets;

  return res.json({ assets });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(uiDir, 'index.html'));
});

async function start() {
  await Promise.all([getSeeds(), getPersonaPrompt(), getIdeaPrompt()]);
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Mini demo server ready on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  start();
}

module.exports = {
  app,
  start
};
