import { getTextClient, getMediaClient } from '../src/clients.js';

async function run() {
  try {
    const client = getTextClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [ { role: 'user', parts: [{ text: 'Hello from debug script' }] } ],
    });
    console.log('Text response ok:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Text call error:', err);
  }

  try {
    const mclient = getMediaClient();
    const img = await mclient.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: 'A blue widget', config: { numberOfImages: 1 } });
    console.log('Image response ok:', JSON.stringify(img, null, 2));
  } catch (err) {
    console.error('Image call error:', err);
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
