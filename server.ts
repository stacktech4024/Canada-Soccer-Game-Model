import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory cache for API responses
const analysisCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ===== API ROUTES (must come BEFORE Vite middleware) =====
  
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

  // Test endpoint to see available models
  app.get("/api/test-models", async (req, res) => {
    try {
      const apiKey = process.env["Gemini-API-Key"] || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "No API key configured" });
      }
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Test models error:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // Clear cache endpoint (useful for testing)
  app.post("/api/clear-cache", (req, res) => {
    analysisCache.clear();
    res.json({ message: "Cache cleared", size: 0 });
  });

  // Gemini API Endpoint - PROTECTED (Server-Side with Caching)
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

      // Create a unique cache key based on the request
      const cacheKey = `${playerLabel}-${playerRole}-${momentTitle}-${zone}-${channel}`;
      
      // Check cache first
      if (analysisCache.has(cacheKey)) {
        const cached = analysisCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log(`✅ Cache hit for: ${cacheKey}`);
          return res.json({ analysis: cached.analysis, cached: true });
        } else {
          analysisCache.delete(cacheKey);
        }
      }

      const apiKey = process.env["Gemini-API-Key"] || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured in the environment." 
        });
      }

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

      console.log(`📡 Calling Gemini API for: ${cacheKey}`);

      // Using the budget-friendly gemini-2.0-flash-lite model
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("Gemini API error:", data.error);
        
        // Return a helpful fallback message when quota is exceeded
        if (data.error.message && data.error.message.includes("quota")) {
          return res.json({ 
            analysis: `[Cached Response] As the ${playerLabel} in ${momentTitle}, maintain tactical discipline in ${zone} ${channel}. Focus on ${playerRole} responsibilities and support teammates according to the Pickering FC model.`,
            cached: false,
            quotaExceeded: true
          });
        }
        
        return res.status(500).json({ error: data.error.message });
      }

      const text = data.candidates[0].content.parts[0].text;
      
      // Store in cache
      analysisCache.set(cacheKey, {
        analysis: text,
        timestamp: Date.now()
      });
      
      console.log(`💾 Cached response for: ${cacheKey} (Cache size: ${analysisCache.size})`);
      res.json({ analysis: text, cached: false });
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      // Return a graceful fallback instead of an error
      res.json({ 
        analysis: "Tactical analysis temporarily unavailable. Please try again in a moment.",
        error: true
      });
    }
  });

  // ===== VITE MIDDLEWARE (for serving React app) =====
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
    console.log(`Cache duration: ${CACHE_DURATION / 1000 / 60} minutes`);
  });
}

startServer().catch(console.error);