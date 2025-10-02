export function logSection(title: string): void {
  console.log("\n" + "=".repeat(80));
  console.log(title);
  console.log("=".repeat(80));
}

export function logInfo(message: string, ...extras: unknown[]): void {
  console.log(`[INFO] ${message}`, ...extras);
}

export function logWarn(message: string, ...extras: unknown[]): void {
  console.warn(`[WARN] ${message}`, ...extras);
}

export function logError(message: string, ...extras: unknown[]): void {
  console.error(`[ERROR] ${message}`, ...extras);
}
