require('dotenv').config();

const { readFile } = require('fs/promises');
const path = require('path');

(async () => {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const key = process.env.GEMINI_API_KEY;
    if (!key) return console.error('Missing GEMINI_API_KEY in .env'), process.exit(1);

    const promptPath = process.env.PROMPT_FILE || path.join(__dirname, 'prompt.json');
    let raw;
    try { raw = await readFile(promptPath, 'utf8'); }
    catch (e) { console.error('Cannot read prompt file', promptPath); return process.exit(1); }

    let prompt;
    try { const p = JSON.parse(raw); prompt = typeof p === 'string' ? p : p?.prompt; }
    catch (e) { console.error('prompt file is not valid JSON'); return process.exit(1); }
    if (!prompt) { console.error('prompt file must be a string or {"prompt": "..."}'); return process.exit(1); }

    const client = new GoogleGenerativeAI(key);
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash-lite-preview-09-2025' });

    const res = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 1, maxOutputTokens: 512 } });

    const text = typeof res?.response?.text === 'function' ? res.response.text() : (res?.response?.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || '');

    console.log('\n--- Generated text ---\n' + text);
    console.log('\n--- Metadata ---', JSON.stringify({ finishReason: res?.response?.finishReason, safety: res?.response?.candidates?.[0]?.safetyRatings, usage: res?.response?.usageMetadata }, null, 2));

  } catch (e) { console.error('Request failed:', e?.message ?? e); process.exit(1); }
})();
