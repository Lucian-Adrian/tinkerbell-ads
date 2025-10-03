const MODEL_CONFIGS = {
  gemini: { label: "Gemini 2.5 Flash", path: "../config/gemini.json" },
  claude: { label: "Claude 3.5 Sonnet", path: "../config/claude.json" },
  openai: { label: "GPT-4.1", path: "../config/openai.json" }
};

const PROMPT_PATHS = {
  context: "../prompts/prompt-context-v1.json",
  personas: "../prompts/prompt-personas.json",
  ideas: "../prompts/prompt-ideas.json"
};

const SEEDS_PATH = "../seeds/idea-templates.json";
const STEP_ORDER = ["context", "personas", "ideas", "scripts", "assets"];

const state = {
  requestId: null,
  modelKey: "gemini",
  modelConfig: null,
  contextPrompt: null,
  contextMetadata: null,
  personaPrompt: null,
  personaMetadata: null,
  ideaPrompt: null,
  ideaMetadata: null,
  scriptMetadata: null,
  assetMetadata: null,
  seeds: [],
  context: null,
  personas: [],
  anchorPersonaIndex: null,
  anchorPersonaId: null,
  ideas: [],
  selectedIdeaIds: new Set(),
  scripts: [],
  assets: [],
  stepStatus: Object.fromEntries(STEP_ORDER.map((key) => [key, "pending"])),
  currentStep: "context"
};

const elements = {
  modelSelect: document.getElementById("modelSelect"),
  companyUrl: document.getElementById("companyUrl"),
  personaIndex: document.getElementById("personaIndex"),
  batchSize: document.getElementById("batchSize"),
  targetIdeas: document.getElementById("targetIdeas"),
  temperatureSeed: document.getElementById("temperatureSeed"),
  personasGrid: document.getElementById("personasGrid"),
  ideasList: document.getElementById("ideasList"),
  contextOutput: document.getElementById("contextOutput"),
  scriptsOutput: document.getElementById("scriptsOutput"),
  assetsOutput: document.getElementById("assetsOutput"),
  personaTemplate: document.getElementById("personaTemplate"),
  ideaTemplate: document.getElementById("ideaTemplate"),
  sections: {
    context: document.getElementById("step-context"),
    personas: document.getElementById("step-personas"),
    ideas: document.getElementById("step-ideas"),
    scripts: document.getElementById("step-scripts"),
    assets: document.getElementById("step-assets")
  },
  statusBadges: {
    context: document.querySelector("#step-context .status"),
    personas: document.querySelector("#step-personas .status"),
    ideas: document.querySelector("#step-ideas .status"),
    scripts: document.querySelector("#step-scripts .status"),
    assets: document.querySelector("#step-assets .status")
  },
  buttons: {
    context: {
      back: document.getElementById("contextBack"),
      run: document.getElementById("contextRun"),
      rerun: document.getElementById("contextRerun"),
      next: document.getElementById("contextNext")
    },
    personas: {
      back: document.getElementById("personasBack"),
      run: document.getElementById("personasRun"),
      rerun: document.getElementById("personasRerun"),
      next: document.getElementById("personasNext")
    },
    ideas: {
      back: document.getElementById("ideasBack"),
      run: document.getElementById("ideasRun"),
      rerun: document.getElementById("ideasRerun"),
      next: document.getElementById("ideasNext")
    },
    scripts: {
      back: document.getElementById("scriptsBack"),
      run: document.getElementById("scriptsRun"),
      rerun: document.getElementById("scriptsRerun"),
      next: document.getElementById("scriptsNext")
    },
    assets: {
      back: document.getElementById("assetsBack"),
      run: document.getElementById("assetsRun"),
      rerun: document.getElementById("assetsRerun"),
      next: document.getElementById("assetsNext")
    }
  }
};

function randomUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return template.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

async function postJson(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {})
  });

  if (!response.ok) {
    let message;
    try {
      const data = await response.json();
      message = data?.error || data?.message;
    } catch (err) {
      message = await response.text();
    }
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json();
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}


function setStepStatus(step, status) {
  state.stepStatus[step] = status;
  const badge = elements.statusBadges[step];
  badge.dataset.status = status;
  badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  updateNavigation();
}

function updateNavigation() {
  STEP_ORDER.forEach((step, index) => {
    const controls = elements.buttons[step];
    if (!controls) return;
    const isFirst = index === 0;
    const isLast = index === STEP_ORDER.length - 1;
    if (controls.back) {
      controls.back.disabled = isFirst;
    }
    if (controls.next) {
      const completed = state.stepStatus[step] === "completed";
      controls.next.disabled = isLast ? !completed : !completed;
    }
  });
}

function goToStep(step) {
  if (!STEP_ORDER.includes(step)) return;
  state.currentStep = step;
  const section = elements.sections[step];
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function resetDownstream(step) {
  const index = STEP_ORDER.indexOf(step);
  for (let i = index + 1; i < STEP_ORDER.length; i++) {
    const key = STEP_ORDER[i];
    state.stepStatus[key] = "pending";
    const badge = elements.statusBadges[key];
    badge.dataset.status = "pending";
    badge.textContent = "Pending";
    switch (key) {
      case "personas":
        state.personas = [];
        state.anchorPersonaIndex = null;
        state.anchorPersonaId = null;
        elements.personasGrid.innerHTML = "";
        elements.buttons.personas.run.disabled = true;
        elements.buttons.personas.rerun.disabled = true;
        elements.buttons.personas.next.disabled = true;
        break;
      case "ideas":
        state.ideas = [];
        state.selectedIdeaIds = new Set();
        elements.ideasList.innerHTML = "";
        elements.buttons.ideas.run.disabled = true;
        elements.buttons.ideas.rerun.disabled = true;
        elements.buttons.ideas.next.disabled = true;
        break;
      case "scripts":
        state.scripts = [];
        elements.scriptsOutput.textContent = "";
        elements.buttons.scripts.run.disabled = true;
        elements.buttons.scripts.rerun.disabled = true;
        elements.buttons.scripts.next.disabled = true;
        break;
      case "assets":
        state.assets = [];
        elements.assetsOutput.textContent = "";
        elements.buttons.assets.run.disabled = true;
        elements.buttons.assets.rerun.disabled = true;
        elements.buttons.assets.next.disabled = true;
        break;
      default:
        break;
    }
  }
  updateNavigation();
}

function renderContextOutput() {
  elements.contextOutput.textContent = JSON.stringify(
    {
      request_id: state.requestId,
      prompt: state.contextMetadata?.prompt?.name ?? state.contextPrompt?.name,
      context: state.context,
      metadata: state.contextMetadata
    },
    null,
    2
  );
}

function renderPersonas(personas) {
  elements.personasGrid.innerHTML = "";
  const template = elements.personaTemplate.content;
  personas.forEach((persona, index) => {
    const node = template.cloneNode(true);
    const card = node.querySelector(".persona-card");
    card.dataset.index = String(index);
    card.querySelector(".persona-name").textContent = persona.name;
    card.querySelector(".persona-tone").textContent = persona.tone;
    card.querySelector(".persona-description").textContent = persona.description;

    const pains = card.querySelector(".persona-pains");
    pains.innerHTML = "";
    persona.pain_points.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      pains.appendChild(li);
    });

    const tags = card.querySelector(".persona-tags");
    tags.innerHTML = "";
    persona.keywords.forEach((keyword) => {
      const span = document.createElement("span");
      span.textContent = keyword;
      tags.appendChild(span);
    });

    card.addEventListener("click", () => {
      selectPersona(index);
    });
    if (persona.selected) {
      card.classList.add("selected");
    }
    elements.personasGrid.appendChild(node);
  });
}

function selectPersona(index) {
  state.anchorPersonaIndex = index;
  state.personas = state.personas.map((persona, idx) => ({
    ...persona,
    selected: idx === index
  }));
  state.anchorPersonaId = state.personas[index]?.id ?? null;
  elements.personaIndex.value = index;
  document.querySelectorAll(".persona-card").forEach((card) => {
    card.classList.toggle("selected", Number(card.dataset.index) === index);
  });
  elements.buttons.ideas.run.disabled = false;
  elements.buttons.personas.next.disabled = state.personas.length === 0;
  setStepStatus("personas", "completed");
}

function renderIdeas(ideas) {
  elements.ideasList.innerHTML = "";
  const template = elements.ideaTemplate.content;
  ideas.forEach((idea) => {
    const node = template.cloneNode(true);
    node.querySelector(".idea-card").dataset.id = idea.id;
    node.querySelector(".idea-headline").textContent = idea.headline;
    node.querySelector(".idea-hook").textContent = idea.hook;
    node.querySelector(".idea-body").textContent = idea.body;
    node.querySelector(".idea-batch").textContent = `Batch ${idea.batch_id}`;

    const footer = node.querySelector(".idea-footer");
    footer.innerHTML = "";
    idea.keywords.forEach((keyword) => {
      const tag = document.createElement("span");
      tag.textContent = keyword;
      footer.appendChild(tag);
    });

    const checkbox = node.querySelector(".idea-select");
    checkbox.checked = state.selectedIdeaIds.has(idea.id);
    checkbox.addEventListener("change", () => {
      toggleIdeaSelection(idea.id, checkbox.checked);
    });

    elements.ideasList.appendChild(node);
  });
}

function updateIdeaSelectionControls() {
  const hasSelection = state.selectedIdeaIds.size > 0;
  elements.buttons.ideas.next.disabled = !hasSelection;
  elements.buttons.scripts.run.disabled = !hasSelection;
}

function toggleIdeaSelection(ideaId, selected) {
  if (ideaId == null) return;
  if (selected) {
    state.selectedIdeaIds.add(ideaId);
  } else {
    state.selectedIdeaIds.delete(ideaId);
  }
  updateIdeaSelectionControls();
}

function renderScripts() {
  elements.scriptsOutput.textContent = JSON.stringify(
    {
      request_id: state.requestId,
      persona_id: state.personas[state.anchorPersonaIndex]?.id,
      metadata: state.scriptMetadata,
      scripts: state.scripts
    },
    null,
    2
  );
}

function renderAssets() {
  elements.assetsOutput.textContent = JSON.stringify(
    {
      request_id: state.requestId,
      metadata: state.assetMetadata,
      assets: state.assets
    },
    null,
    2
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function loadModelConfig(key) {
  const descriptor = MODEL_CONFIGS[key];
  if (!descriptor) {
    throw new Error(`Unknown model key: ${key}`);
  }
  return fetchJson(descriptor.path);
}

async function initialise() {
  try {
    state.contextPrompt = await fetchJson(PROMPT_PATHS.context);
    state.personaPrompt = await fetchJson(PROMPT_PATHS.personas);
    state.ideaPrompt = await fetchJson(PROMPT_PATHS.ideas);
    state.seeds = await fetchJson(SEEDS_PATH);

    Object.entries(MODEL_CONFIGS).forEach(([key, info]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = info.label;
      elements.modelSelect.appendChild(option);
    });
    elements.modelSelect.value = state.modelKey;
    state.modelConfig = await loadModelConfig(state.modelKey);

    elements.buttons.context.run.disabled = false;
    updateNavigation();
  } catch (error) {
    alert(`Failed to initialise resources: ${error.message}`);
  }
}

async function handleContextRun() {
  const { run, rerun, next } = elements.buttons.context;
  try {
    run.disabled = true;
    rerun.disabled = true;
    next.disabled = true;
    setStepStatus("context", "running");
    const url = elements.companyUrl.value.trim();
    if (!url) {
      throw new Error("Enter a company URL first.");
    }

    const response = await postJson("/api/context", { companyUrl: url });
    state.requestId = response.requestId;
    state.context = response.context;
    state.contextMetadata = response.metadata ?? null;

    renderContextOutput();

    resetDownstream("context");
    elements.buttons.personas.run.disabled = false;
    elements.buttons.personas.back.disabled = false;
    rerun.disabled = false;
    next.disabled = false;
    setStepStatus("context", "completed");
  } catch (error) {
    alert(`Context ingestion error: ${error.message}`);
    state.requestId = null;
    state.context = null;
    state.contextMetadata = null;
    elements.contextOutput.textContent = "";
    resetDownstream("context");
    setStepStatus("context", "pending");
  } finally {
    elements.buttons.context.run.disabled = false;
  }
}

async function handlePersonasRun() {
  if (!state.context) {
    alert("Run the context step first.");
    return;
  }
  const controls = elements.buttons.personas;
  try {
    controls.run.disabled = true;
    controls.rerun.disabled = true;
    controls.next.disabled = true;
    setStepStatus("personas", "running");
    const desiredIndex = clamp(Number(elements.personaIndex.value) || 0, 0, 4);
    const response = await postJson("/api/personas", {
      requestId: state.requestId,
      modelKey: state.modelKey,
      personaIndex: desiredIndex
    });

    resetDownstream("personas");
    state.personaPrompt = response.prompt ?? state.personaPrompt;
    state.personaMetadata = response.metadata ?? null;
    state.personas = response.personas.map((persona, index) => ({
      ...persona,
      selected: index === response.anchorPersonaIndex
    }));
    renderPersonas(state.personas);
    selectPersona(response.anchorPersonaIndex ?? desiredIndex);

    controls.rerun.disabled = false;
    setStepStatus("personas", "completed");
  } catch (error) {
    alert(`Persona generation error: ${error.message}`);
    setStepStatus("personas", "pending");
  } finally {
    controls.run.disabled = false;
  }
}

async function handleIdeasRun() {
  if (state.anchorPersonaIndex == null) {
    alert("Select a persona to continue.");
    return;
  }
  const controls = elements.buttons.ideas;
  try {
    controls.run.disabled = true;
    controls.rerun.disabled = true;
    controls.next.disabled = true;
    setStepStatus("ideas", "running");
    const batchSize = clamp(Number(elements.batchSize.value) || 5, 1, 50);
    const targetIdeas = clamp(Number(elements.targetIdeas.value) || 30, 1, 200);
    const tempSeed = Number(elements.temperatureSeed.value) || 0.8;
    const persona = state.personas[state.anchorPersonaIndex];

    const response = await postJson("/api/ideas", {
      requestId: state.requestId,
      personaId: persona.id,
      batchSize,
      targetIdeas,
      temperatureSeed: tempSeed,
      modelKey: state.modelKey
    });

    resetDownstream("ideas");
    state.ideaPrompt = response.prompt ?? state.ideaPrompt;
    state.ideaMetadata = response.metadata ?? null;
    state.ideas = response.ideas;
    state.selectedIdeaIds = new Set(state.ideas.map((idea) => idea.id));
    renderIdeas(state.ideas);
    updateIdeaSelectionControls();

    controls.rerun.disabled = false;
    setStepStatus("ideas", "completed");
  } catch (error) {
    alert(`Idea generation error: ${error.message}`);
    setStepStatus("ideas", "pending");
  } finally {
    controls.run.disabled = false;
  }
}

async function handleScriptsRun() {
  if (!state.selectedIdeaIds.size) {
    alert("Select at least one idea first.");
    return;
  }
  const controls = elements.buttons.scripts;
  try {
    controls.run.disabled = true;
    controls.rerun.disabled = true;
    controls.next.disabled = true;
    setStepStatus("scripts", "running");
    const ideaIds = Array.from(state.selectedIdeaIds);
    const response = await postJson("/api/scripts", {
      requestId: state.requestId,
      ideaIds
    });

    resetDownstream("scripts");
    state.scripts = response.scripts;
    state.scriptMetadata = response.metadata ?? null;
    renderScripts();

    controls.rerun.disabled = false;
    controls.next.disabled = false;
    elements.buttons.assets.run.disabled = false;
    setStepStatus("scripts", "completed");
  } catch (error) {
    alert(`Script generation error: ${error.message}`);
    setStepStatus("scripts", "pending");
  } finally {
    controls.run.disabled = false;
  }
}

async function handleAssetsRun() {
  if (!state.scripts.length) {
    alert("Generate scripts first.");
    return;
  }
  const controls = elements.buttons.assets;
  try {
    controls.run.disabled = true;
    controls.rerun.disabled = true;
    controls.next.disabled = true;
    setStepStatus("assets", "running");
    const response = await postJson("/api/assets", {
      requestId: state.requestId
    });

    state.assets = response.assets;
    state.assetMetadata = response.metadata ?? null;
    renderAssets();

    controls.rerun.disabled = false;
    controls.next.disabled = false;
    setStepStatus("assets", "completed");
  } catch (error) {
    alert(`Asset generation error: ${error.message}`);
    setStepStatus("assets", "pending");
  } finally {
    controls.run.disabled = false;
  }
}

function handleModelChange(event) {
  const key = event.target.value;
  loadModelConfig(key)
    .then((config) => {
      state.modelKey = key;
      state.modelConfig = config;
    })
    .catch((error) => {
      alert(`Failed to load model config: ${error.message}`);
    });
}

function attachNavigationHandlers() {
  elements.buttons.context.next.addEventListener("click", () => goToStep("personas"));
  elements.buttons.personas.back.addEventListener("click", () => goToStep("context"));
  elements.buttons.personas.next.addEventListener("click", () => goToStep("ideas"));
  elements.buttons.ideas.back.addEventListener("click", () => goToStep("personas"));
  elements.buttons.ideas.next.addEventListener("click", () => goToStep("scripts"));
  elements.buttons.scripts.back.addEventListener("click", () => goToStep("ideas"));
  elements.buttons.scripts.next.addEventListener("click", () => goToStep("assets"));
  elements.buttons.assets.back.addEventListener("click", () => goToStep("scripts"));
  elements.buttons.assets.next.addEventListener("click", () => goToStep("context"));
}

function attachEventHandlers() {
  elements.modelSelect.addEventListener("change", handleModelChange);
  elements.buttons.context.run.addEventListener("click", handleContextRun);
  elements.buttons.context.rerun.addEventListener("click", handleContextRun);

  elements.buttons.personas.run.addEventListener("click", handlePersonasRun);
  elements.buttons.personas.rerun.addEventListener("click", handlePersonasRun);

  elements.buttons.ideas.run.addEventListener("click", handleIdeasRun);
  elements.buttons.ideas.rerun.addEventListener("click", handleIdeasRun);

  elements.buttons.scripts.run.addEventListener("click", handleScriptsRun);
  elements.buttons.scripts.rerun.addEventListener("click", handleScriptsRun);

  elements.buttons.assets.run.addEventListener("click", handleAssetsRun);
  elements.buttons.assets.rerun.addEventListener("click", handleAssetsRun);

  attachNavigationHandlers();
}

function bootstrap() {
  initialise();
  attachEventHandlers();
}

document.addEventListener("DOMContentLoaded", bootstrap);
