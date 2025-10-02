import { argv, exit } from "node:process";
import { createInterface } from "node:readline/promises";

export interface CliArgs {
  url: string;
  uvp: string;
}

export function parseArgs(): CliArgs {
  const args = argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (!key || !value) continue;
    const normalized = key.replace(/^--/, "");
    result[normalized] = value;
  }

  if (!result.url || !result.uvp) {
    console.error("Usage: npm start -- --url <company_url> --uvp \"Unique value proposition\"");
    exit(1);
  }

  return {
    url: result.url,
    uvp: result.uvp,
  };
}

export async function selectPersona<T extends { name: string; role: string }>(personas: T[]): Promise<number> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log("\nSelect a persona to continue:");
    personas.forEach((persona, index) => {
      console.log(`${index + 1}. ${persona.name} (${persona.role})`);
    });
    const answer = await rl.question("Enter 1-3: ");
    const choice = Number.parseInt(answer, 10);
    if (Number.isNaN(choice) || choice < 1 || choice > personas.length) {
      throw new Error("Invalid selection");
    }
    return choice - 1;
  } finally {
    rl.close();
  }
}
