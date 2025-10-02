import { getTextClient } from "./clients/google";

const ai = getTextClient();
const apiKey = process.env.GEMINI_API_KEY;
console.log("API key prefix", apiKey?.slice(0, 6));

const res = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    {
      role: "user",
      parts: [{ text: "Return {\"hello\":\"world\"}" }],
    },
  ],
  config: {
    systemInstruction: "Return JSON only.",
  },
});

console.log(res);
console.log(Object.keys(res));
console.log("has text", "text" in res ? (res as any).text : "no");
