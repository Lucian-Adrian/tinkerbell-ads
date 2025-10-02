export function renderTemplate(template: string, context: Record<string, string>): string {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = context[key.trim()];
    return value ?? "";
  });
}
