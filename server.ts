import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check to verify environment configuration
  app.get("/api/config-status", (req, res) => {
    const customKey = process.env["Gemini-API-Key"];
    const standardKey = process.env.GEMINI_API_KEY;
    
    res.json({
      geminiKeyConfigured: !!(customKey || standardKey),
      keySource: customKey ? "Gemini-API-Key (Custom)" : (standardKey ? "GEMINI_API_KEY (Standard)" : "None"),
      nodeEnv: process.env.NODE_ENV || "development",
    });
  });

  // Gemini API Endpoint - PROTECTED (Server-Side)
  app.post("/api/analyze", async (req, res) => {
    try {
      const { 
        playerLabel, 
        playerRole, 
        momentTitle, 
        zone, 
        channel, 
        formation,
        x,
        y
      } = req.body;

      // Check both the custom name the user provided and the standard one
      const apiKey = process.env["Gemini-API-Key"] || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured in the environment." 
        });
      }

      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const prompt = `You are the Head Tactical Analyst for Pickering Football Club. 
Pickering FC Game Model: "Possess to Progress to Score".
Identity: HEART (Hardworking, Encouraging, Accountable, Respect, Trustworthy).

Formation: ${formation}. 
Moment: ${momentTitle}.
Player: ${playerLabel} (${playerRole}).
Current Location: ${zone}, ${channel} (Coordinates: x=${x?.toFixed(1)}, y=${y?.toFixed(1)}).

Describe in 2 concise sentences: 
1. What this player's specific tactical movement/objective should be according to the Pickering FC model (Attacking: 1-4-4-2 "B+", Defending: 1-1-2-3-1 "B-").
2. For #9: prioritize blocking the CB-to-CB pass in low blocks. For #6/#8: prioritize cover shadows and central compactness.

Use professional Pickering FC coaching terminology (Zones 1-4, 5 vertical channels, Gold Zone).`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      res.json({ analysis: text });
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      res.status(500).json({ error: "Failed to generate tactical analysis." });
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
    // Production static serving
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
