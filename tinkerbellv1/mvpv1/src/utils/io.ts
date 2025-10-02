import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { resolvePath } from "../config.js";

export async function ensureDir(...segments: string[]): Promise<string> {
  const dir = resolvePath(...segments);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function writeJSON(relativePath: string, data: unknown): Promise<void> {
  const absolutePath = resolvePath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function writeText(relativePath: string, data: string): Promise<void> {
  const absolutePath = resolvePath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, data, "utf-8");
}

export async function readText(relativePath: string): Promise<string> {
  return readFile(resolvePath(relativePath), "utf-8");
}
