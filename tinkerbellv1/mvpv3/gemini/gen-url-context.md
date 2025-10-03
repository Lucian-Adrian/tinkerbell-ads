# URL Context (tooling) for Gemini (JavaScript)

Gemini can fetch and use web pages as context during generation by enabling the `urlContext` tool. Use this when you want the model to read one or more URLs and ground its answer on those pages.

## Basic example

```js
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

const res = await ai.models.generateContent({
  model: 'gemini-2.5-flash-lite-preview-09-2025',
  contents: [
    'Compare the ingredients and cooking times from these recipes: https://www.foodnetwork.com/recipes/ina-garten/perfect-roast-chicken-recipe-1940592 and https://www.allrecipes.com/recipe/21151/simple-whole-roast-chicken/'
  ],
  config: {
    tools: [ { urlContext: {} } ]
  }
});

console.log(res.text);
// Inspect which URLs were retrieved and any metadata
console.log(res.candidates[0].urlContextMetadata);
```

## Multiple tools (URL + search)

```js
const res = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [ 'Create a 3-day event schedule based on THIS_URL. Mention weather & commute concerns.' ],
  config: { tools: [ { urlContext: {} }, { googleSearch: {} } ] }
});

console.log(res.text);
console.log(res.candidates[0].urlContextMetadata);
```

## Notes & best practices
- Provide the URLs inline in the prompt (the model and URL tool will detect and fetch them) or include them as plain text parts.
- Start with a small set of URLs (2–5); fetching many pages increases latency and cost.
- Inspect `urlContextMetadata` on the chosen candidate to see which URLs the model actually retrieved and any retrieval scores.
- Respect robots.txt and the target site's terms of use. Consider mirroring pages to your own storage to avoid scraping restrictions.
- For privacy-sensitive flows, do not send private URLs unless you control access and storage policy; fetched content may be logged.

Keep prompts short and explicit about what to extract from each URL (e.g., "Compare ingredients and total cooking time").
