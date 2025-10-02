# Structured Output & Tools on Vertex (JavaScript)

Vertex Gemini supports the same JSON schema enforcement as the consumer API with enterprise logging.

## JSON Schema Enforcement

```js
const schema = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
    confidence: { type: 'number' }
  },
  required: ['headline', 'sentiment']
};

const structured = await generativeModel.generateContent({
  contents,
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: schema,
    temperature: 0
  }
});

const payload = JSON.parse(structured.response.text());
```

Log `payload` plus `structured.response.usageMetadata.totalTokenCount` to BigQuery for analytics.

## Tool Calling

```js
const tools = [{
  functionDeclarations: [{
    name: 'createInvoice',
    description: 'Generates an invoice in ERP',
    parameters: {
      type: 'object',
      properties: {
        customerId: { type: 'string' },
        amount: { type: 'number' },
        currency: { type: 'string' }
      },
      required: ['customerId', 'amount']
    }
  }]
}];

const toolModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro-preview-0514',
  tools
});

const toolResult = await toolModel.generateContent({ contents });

const call = toolResult.response.functionCalls?.[0];
if (call?.name === 'createInvoice') {
  await erpClient.create(call.args);
}
```

## Audit Logging
- Vertex automatically sends logs to Cloud Logging; add labels (`labels.workflow = 'invoice'`).
- Store tool invocations in BigQuery for compliance.

## Human-in-the-Loop
- Use Vertex AI Agents or your own UI to request human approval before executing high-risk tools.
- Append reviewer decisions to the chat history so the model can learn to defer when ambiguous.

Reuse the same JSON schemas in `python/vertex/gen-text-structured-output.md` to avoid drift.