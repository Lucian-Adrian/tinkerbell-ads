# Structured Output & Tool Calling (JavaScript)

Structured output keeps responses parseable and production-safe.

## JSON Schemas via `responseMimeType`

```js
import { GoogleGenerativeAI } from '@google/generative-ai';

const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
	.getGenerativeModel({ model: 'gemini-1.5-pro' });

const schema = {
	type: 'object',
	properties: {
		title: { type: 'string' },
		owner: { type: 'string' },
		dueDate: { type: 'string', format: 'date' },
		tags: { type: 'array', items: { type: 'string' } }
	},
	required: ['title', 'dueDate']
};

const res = await model.generateContent({
	contents: [{
		role: 'user',
		parts: [{
			text: 'Extract task details from: Finish the Q3 board deck by July 2 for Priya. Tag: strategy.'
		}]
	}],
	generationConfig: {
		responseMimeType: 'application/json',
		responseSchema: schema,
		temperature: 0
	}
});

const task = JSON.parse(res.response.text());
```

### Validation
- Always wrap `JSON.parse` in try/catch. Fallback to `res.response.candidates?.[0]?.content` for debugging.
- Combine with Zod or Ajv to enforce schema before persisting.

## Function / Tool Calling

```js
const tools = [{
	functionDeclarations: [{
		name: 'createSupportTicket',
		description: 'Creates a Zendesk ticket',
		parameters: {
			type: 'object',
			properties: {
				subject: { type: 'string' },
				body: { type: 'string' },
				priority: { type: 'string', enum: ['low', 'normal', 'high'] }
			},
			required: ['subject', 'body']
		}
	}]
}];

const toolModel = genAI.getGenerativeModel({
	model: 'gemini-1.5-pro',
	tools
});

const toolResponse = await toolModel.generateContent({
	contents: [{
		role: 'user',
		parts: [{ text: 'Customer cannot reset password, escalate.' }]
	}]
});

const call = toolResponse.response.functionCalls?.[0];
if (call?.name === 'createSupportTicket') {
	await zendesk.createTicket(call.args);
}
```

### Loop Strategy
1. Send user message.
2. If function call returned → execute tool → append tool result as `role: 'tool'` message → reissue request.
3. If plain text, render to user.

## Safety Hooks
- Log every tool call and arguments for auditing.
- Before executing external side effects, run allow-lists (e.g., permitted priorities, cost thresholds).
- Set `maxOutputTokens` small to avoid oversized JSON payloads.

## Structured Streaming
- `generateContentStream` supports schema enforcement; parse each chunk’s `functionCall` events as they arrive.
- Debounce UI updates until `chunk.candidates?.[0]?.finishReason === 'STOP'` to avoid partial JSON.

Reuse schema definitions across languages by storing them in a shared `schemas/` directory and importing them into both Node and Python clients.
