const fs = require("node:fs/promises");
const path = require("node:path");

const DATA_DIR = path.resolve("./minidemo/data");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function writeJson(filename, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  return filePath;
}

async function writeCsv(filename, rows) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, rows.join("\n"), "utf-8");
  return filePath;
}

async function saveBusinessContext(requestId, context) {
  return writeJson("business_context.json", {
    request_id: requestId,
    saved_at: new Date().toISOString(),
    context
  });
}

async function savePersonas(requestId, personas) {
  return writeJson("personas.json", {
    request_id: requestId,
    saved_at: new Date().toISOString(),
    personas
  });
}

async function savePersonaSelection(requestId, persona) {
  return writeJson("persona_selection.json", {
    request_id: requestId,
    saved_at: new Date().toISOString(),
    persona
  });
}

async function saveIdeas(personaId, ideas, metadata) {
  const jsonPath = await writeJson("ideas.json", {
    persona_id: personaId,
    saved_at: new Date().toISOString(),
    metadata,
    ideas
  });

  const header = [
    "id",
    "persona_id",
    "batch_id",
    "seed_template",
    "temperature",
    "prompt_used",
    "model_used",
    "headline",
    "hook",
    "body",
    "keywords"
  ];

  const rows = [header.join(",")];
  for (const idea of ideas) {
    rows.push([
      idea.id,
      idea.persona_id,
      idea.batch_id,
      idea.seed_template,
      idea.temperature,
      idea.prompt_used,
      idea.model_used,
      JSON.stringify(idea.headline),
      JSON.stringify(idea.hook),
      JSON.stringify(idea.body),
      JSON.stringify(idea.keywords)
    ].join(","));
  }

  const csvPath = await writeCsv("ideas.csv", rows);
  return { jsonPath, csvPath };
}

module.exports = {
  saveBusinessContext,
  savePersonas,
  savePersonaSelection,
  saveIdeas
};
