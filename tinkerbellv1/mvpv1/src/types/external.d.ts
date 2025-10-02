declare module "node-html-parser" {
  interface HTMLElementLike {
    text: string;
    querySelector(selector: string): HTMLElementLike | null;
    querySelectorAll(selector: string): HTMLElementLike[];
    getAttribute(name: string): string | null;
  }

  export function parse(html: string): HTMLElementLike;
}

declare module "google-trends-api" {
  interface TrendsClient {
    interestOverTime(options: Record<string, unknown>): Promise<string>;
  }

  const client: TrendsClient;
  export default client;
}

declare module "p-limit" {
  type AsyncFn<T> = () => Promise<T>;
  interface Limit {
    <T>(fn: AsyncFn<T>): Promise<T>;
  }

  function pLimit(concurrency: number): Limit;
  export default pLimit;
}
