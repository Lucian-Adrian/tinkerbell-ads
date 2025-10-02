import { parse } from "node-html-parser";
import { z } from "zod";
import { CompanyContext, PromptDefinition } from "../types.js";
import { generateJSON } from "../utils/llm.js";
import { logInfo, logWarn } from "../utils/logger.js";
import { nowIso } from "../utils/time.js";

export interface ContextStepOptions {
  companyId: string;
  url: string;
  uvp: string;
  prompt: PromptDefinition;
  model: string;
  maxRetries: number;
}

const contextSchema = z.object({
  company_id: z.string(),
  url: z.string(),
  uvp: z.string(),
  brand_headline: z.string().default(""),
  brand_keywords: z.array(z.string()).default([]),
  brand_colors: z.array(z.string()).default([]),
  logo_urls: z.array(z.string()).default([]),
  short_bullets: z.array(z.string()).default([]),
  tone: z.string().default(""),
  generated_at: z.string().default(() => nowIso()),
});

type NodeWithText = { text: string };

function buildSample(html: string): string {
  try {
    const root = parse(html);
    const title = root.querySelector("title")?.text?.trim() ?? "";
    const description = root.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? "";
    const headings = root
      .querySelectorAll("h1, h2")
      .slice(0, 5)
      .map((node: NodeWithText) => node.text.trim())
      .filter(Boolean);
    const paragraphs = root
      .querySelectorAll("p")
      .slice(0, 6)
      .map((node: NodeWithText) => node.text.trim())
      .filter((text: string) => text.length > 40)
      .slice(0, 4);

    const bullets = root
      .querySelectorAll("li")
      .slice(0, 8)
      .map((node: NodeWithText) => node.text.trim())
      .filter(Boolean);

    const sections = [title, description, ...headings, ...paragraphs, ...bullets].filter(Boolean);
    return sections.slice(0, 12).join("\n");
  } catch (error) {
    logWarn("Failed to parse HTML for context sample; falling back to UVP", error);
    return "";
  }
}

async function fetchSample(url: string, uvp: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const html = await response.text();
    const sample = buildSample(html);
    return sample || uvp;
  } catch (error) {
    logWarn(`Unable to fetch URL for context ingestion: ${url}`, error);
    return uvp;
  }
}

export interface ContextResult {
  context: CompanyContext;
  rawText: string;
  sample: string;
}

export async function generateCompanyContext(options: ContextStepOptions): Promise<ContextResult> {
  const { companyId, url, uvp, prompt, model, maxRetries } = options;
  logInfo("Fetching site content for context extraction", { url });
  const sample = await fetchSample(url, uvp);

  const { data, rawText } = await generateJSON<{ [key: string]: unknown }>({
    prompt,
    variables: {
      companyId,
      url,
      uvp,
      sample,
    },
    model,
    maxRetries,
    tag: "context",
  });

  const parsed = contextSchema.parse(data);
  const context: CompanyContext = {
    ...parsed,
    generated_at: parsed.generated_at || nowIso(),
  };

  logInfo("Context extracted", { headline: context.brand_headline, keywords: context.brand_keywords.slice(0, 5) });
  return { context, rawText, sample };
}
