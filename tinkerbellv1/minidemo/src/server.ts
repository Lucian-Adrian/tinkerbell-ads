import express, { type Request, type Response, type NextFunction } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Buffer } from "node:buffer";
import { getMediaClient, getTextClient } from "./clients.js";
import { extractText } from "./extractText.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.resolve(__dirname, "..", "public")));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/text", async (req: Request, res: Response) => {
  try {
    const prompt = String(req.body?.prompt ?? "").trim();
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const client = getTextClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = extractText(response);
    res.json({ text, raw: response });
  } catch (error) {
    console.error("[text] generation failed", error);
    res.status(500).json({ error: (error as Error).message ?? "Unknown error" });
  }
});

app.post("/api/image", async (req: Request, res: Response) => {
  try {
    const prompt = String(req.body?.prompt ?? "").trim();
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const client = getMediaClient() as unknown as {
      models: {
        generateImages: (params: {
          model: string;
          prompt: string;
          config?: { numberOfImages?: number };
        }) => Promise<{ generatedImages?: Array<{ image?: { imageBytes?: string; mimeType?: string } }> }>;
      };
    };

    const response = await client.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: { numberOfImages: 1 },
    });

    const image = response.generatedImages?.[0]?.image;
    if (!image?.imageBytes) {
      res.status(502).json({ error: "Model returned no image bytes" });
      return;
    }

    res.json({
      imageBase64: image.imageBytes,
      mimeType: image.mimeType ?? "image/png",
    });
  } catch (error) {
    console.error("[image] generation failed", error);
    res.status(500).json({ error: (error as Error).message ?? "Unknown error" });
  }
});

async function pollVideo(operationHandle: unknown, attempts = 24): Promise<{ videoBytes?: string; mimeType?: string } | null> {
  const client = getMediaClient() as unknown as {
    operations: {
      get: (params: { operation: unknown }) => Promise<{
        done?: boolean;
        response?: { generatedVideos?: Array<{ video?: { videoBytes?: string; mimeType?: string } }> };
      }>;
    };
  };

  let current = operationHandle;

  for (let i = 0; i < attempts; i += 1) {
    current = await client.operations.get({ operation: current });
    const result = current as unknown as {
      done?: boolean;
      response?: { generatedVideos?: Array<{ video?: { videoBytes?: string; mimeType?: string } }> };
    };

    if (result.done) {
      return result.response?.generatedVideos?.[0]?.video ?? null;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  return null;
}

app.post("/api/video", async (req: Request, res: Response) => {
  try {
    const prompt = String(req.body?.prompt ?? "").trim();
    const durationSeconds = Number(req.body?.durationSeconds ?? 6);

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const client = getMediaClient() as unknown as {
      models: {
        generateVideos: (params: {
          model: string;
          prompt: string;
          config?: { durationSeconds?: number };
        }) => Promise<{ operation?: { name?: string }; name?: string }>;
      };
    };

    const operation = await client.models.generateVideos({
      model: "veo-3.0-fast-generate-001",
      prompt,
      config: { durationSeconds },
    });

    const handle = operation.operation ?? operation;
    if (!handle) {
      res.status(502).json({ error: "Video model did not return an operation handle" });
      return;
    }

    const video = await pollVideo(handle);
    if (!video?.videoBytes) {
      res.status(504).json({ error: "Timed out waiting for video generation" });
      return;
    }

    res.json({
      videoBase64: video.videoBytes,
      mimeType: video.mimeType ?? "video/mp4",
    });
  } catch (error) {
    console.error("[video] generation failed", error);
    res.status(500).json({ error: (error as Error).message ?? "Unknown error" });
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[server] unexpected error", err);
  res.status(500).json({ error: err.message ?? "Unexpected server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Mini demo server running at http://localhost:${PORT}`);
});
