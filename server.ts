import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Auto Definition
  app.post("/api/define", async (req, res) => {
    try {
      const { word, apiKey } = req.body;
      
      if (!word) {
        return res.status(400).json({ error: "Word is required" });
      }

      // Use provided key or fallback to server key
      const keyToUse = apiKey || process.env.GEMINI_API_KEY;
      
      if (!keyToUse) {
         return res.status(500).json({ error: "No Gemini API key available." });
      }

      const ai = new GoogleGenAI({ apiKey: keyToUse });
      
      const prompt = `You are an expert English teacher. You are provided with a word: "${word}".
If the word is misspelled, correct it to the most likely intended valid English word.
Provide the definition of the word (or the corrected word) for a Vietnamese learner.
Respond ONLY with a valid JSON object matching this structure (no markdown, no backticks, just raw JSON):
{
  "correctedWord": "The correct spelling of the word if there was a typo, otherwise the original word",
  "ipa": "phonetic transcription (e.g., /kɒn.fɪˈden.ʃəl/)",
  "wordType": "part of speech (e.g., adj., noun, verb)",
  "meaning": "Vietnamese meaning",
  "definition": "English definition",
  "example": "A short English example sentence",
  "synonyms": "comma-separated synonyms",
  "antonyms": "comma-separated antonyms",
  "band": "IELTS band estimate (e.g., Band 5.5, Band 6)",
  "topic": "General topic category"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response from AI");
      }
      
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error("Definition error:", error);
      res.status(500).json({ error: error.message || "Failed to generate definition" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support React Router SPA fallback
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
