"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
(async () => {
    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const key = process.env.GEMINI_API_KEY;
        if (!key)
            return console.error('Missing GEMINI_API_KEY in .env'), process.exit(1);
        const promptPath = process.env.PROMPT_FILE || path_1.default.join(process.cwd(), 'test', 'gemini', 'prompt.json');
        let raw;
        try {
            raw = await (0, promises_1.readFile)(promptPath, 'utf8');
        }
        catch {
            console.error('Cannot read prompt file', promptPath);
            return process.exit(1);
        }
        let promptObj;
        try {
            promptObj = JSON.parse(raw);
        }
        catch {
            console.error('prompt file is not valid JSON');
            return process.exit(1);
        }
        const promptText = typeof promptObj === 'string' ? promptObj : promptObj?.prompt;
        const url = promptObj?.url;
        if (!promptText) {
            console.error('prompt file must be a string or {"prompt": "..."}');
            return process.exit(1);
        }
        const client = new GoogleGenerativeAI(key);
        // use the standard flash model for URL-context examples
        const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });
        // include the prompt and optionally fetch the URL locally and pass its text as inline context
        const parts = [{ text: promptText }];
        let fetchedInfo = null;
        if (url) {
            parts.push({ text: `Reference URL: ${url}` });
            try {
                const resp = await fetch(url, { headers: { 'user-agent': 'gen-ai-demo/1.0' } });
                const html = await resp.text();
                // crude HTML -> text extraction; fine for demo and small pages
                const cleaned = html
                    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
                    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                const excerpt = cleaned.slice(0, 20_000); // limit
                parts.push({ text: excerpt });
                fetchedInfo = { ok: resp.ok, status: resp.status, length: html.length };
            }
            catch (err) {
                fetchedInfo = { ok: false, error: err?.message ?? String(err) };
            }
        }
        const res = await model.generateContent({
            contents: [{ role: 'user', parts }],
            generationConfig: { temperature: 1, maxOutputTokens: 512 }
        });
        const text = typeof res?.response?.text === 'function' ? res.response.text() : (res?.response?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n') || '');
        console.log('\n--- Generated text (with URL context) ---\n' + text);
        console.log('\n--- Metadata ---', JSON.stringify({ finishReason: res?.response?.finishReason, safety: res?.response?.candidates?.[0]?.safetyRatings, usage: res?.response?.usageMetadata }, null, 2));
        // report fetch info (local fetch) and any URL metadata returned by the model
        console.log('\n--- Local fetch info ---', JSON.stringify(fetchedInfo, null, 2));
        console.log('\n--- URL context metadata (model) ---', JSON.stringify(res?.response?.candidates?.[0]?.urlContextMetadata ?? {}, null, 2));
    }
    catch (e) {
        console.error('Request failed:', e?.message ?? e);
        process.exit(1);
    }
})();
