/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing up to 10MB to support Base64 selfie uploads
app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI on the server
// The API key is acquired securely via process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// AI Style Analyzer Endpoint
app.post("/api/analyze-style", async (req, res) => {
  try {
    const { image, surveyData } = req.body;

    let contents: any[] = [];
    let systemInstruction = `You are a world-class premium luxury fashion designer and personal stylist for the high-end apparel brand CLINZA. 
Your goal is to inspect a user's uploaded portrait/selfie alongside optional profile preferences to generate a deeply personalized style archetype diagnosis.

You must identify:
1. Face Shape (e.g. Oval, Square, Round, Heart, Chiseled)
2. Skin Tone (e.g. Fair Cool, Olive Warm, Deep Neutral, Medium Beige)
3. Body Type (e.g. Athletic, Ectomorph, Mesomorph, Endomorph, Rectangular)
4. Fashion Preference (e.g. Italian Sartorial, Minimalist Linen, Heritage Rugged, Business Casual)
5. Color Compatibility: Recommended shades and colors to avoid.
6. Style Archetype (e.g. "The Effortless Minimalist", "The Modern Aristocrat", "Nordic Clean", "Sartorial Leisure")
7. A beautiful, validating professional stylist's rationale.
8. Recommendations mapping directly to CLINZA collections: "shirts" (shirts, linen shirts), "jeans" (jeans), "pants" (trousers), "combos" (co-ord sets), "accessories" (watch, wallet), "footwear" (chelsea boot).
9. Specific color names matching Clinza products (e.g., "Sartorial White", "Sage Green", "Raw Indigo", "Coffee Dark Brown", "Oatmeal Beige", "Sand Beige").
10. Recommended structural fits matching their profile.

You must respond strictly in JSON format matching the schema requested. Do not output markdown code blocks or wrapping quotes, just the pure JSON.`;

    if (image && image.startsWith("data:")) {
      const mimeType = image.split(";")[0].split(":")[1];
      const data = image.split(",")[1];
      
      contents.push({
        inlineData: {
          mimeType,
          data
        }
      });
      contents.push({
        text: `Analyze this selfie image. If the image is not a real face, deduce a hypothetical fashion archetype from the lighting/colors anyway. Survey metadata: ${JSON.stringify(surveyData || {})}`
      });
    } else {
      contents.push({
        text: `Compute a bespoke style profile purely from this survey preferences sheet (no image provided): ${JSON.stringify(surveyData || {})}`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "faceShape",
            "skinTone",
            "bodyType",
            "fashionPreference",
            "colorCompatibility",
            "styleArchetype",
            "rationale",
            "recommendedCollections",
            "recommendedFits",
            "recommendedColors"
          ],
          properties: {
            faceShape: { type: Type.STRING, description: "Identified face shape" },
            skinTone: { type: Type.STRING, description: "Identified skin undertone" },
            bodyType: { type: Type.STRING, description: "Inferred body build category" },
            fashionPreference: { type: Type.STRING, description: "Fashion style archetype matching preferences" },
            colorCompatibility: {
              type: Type.OBJECT,
              required: ["recommended", "avoid"],
              properties: {
                recommended: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Premium colors recommended"
                },
                avoid: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Colors to steer away from"
                }
              }
            },
            styleArchetype: { type: Type.STRING, description: "Named fashion persona identity" },
            rationale: { type: Type.STRING, description: "Stylist's narrative rationale explaining the tailoring compatibility" },
            recommendedCollections: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Must map to standard slugs: shirts, jeans, pants, combos, footwear, accessories"
            },
            recommendedFits: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific fits e.g. Slim-Taper, Relaxed Resort, Sartorial Double-Pleat"
            },
            recommendedColors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific clinza product colors recommended"
            }
          }
        }
      }
    });

    const textOutput = response.text?.trim() || "{}";
    res.setHeader("Content-Type", "application/json");
    res.send(textOutput);
  } catch (error) {
    console.error("Gemini server-side analysis error:", error);
    res.status(500).json({
      error: "Style analyzer failed to execute on server",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Configure Vite integration for standard development and static fallbacks
async function initializeApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CLINZA Fullstack] Server listening at http://0.0.0.0:${PORT}`);
  });
}

initializeApp().catch((err) => {
  console.error("Vite/Express initialization failed:", err);
});
