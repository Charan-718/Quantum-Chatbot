import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import gTTS from "gtts";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

/* ===============================
   DATABASE CONNECTION (MongoDB)
=================================*/
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("⚠️ MongoDB connection error:", err.message));
} else {
  console.warn("⚠️ MONGO_URI not provided; chat history will not be saved.");
}

/* ===============================
   AI SERVICE (Google Gemini)
=================================*/
let genAI = null;
if (process.env.GOOGLE_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
} else {
  console.warn("⚠️ GOOGLE_API_KEY missing");
}

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-pro-preview"
];

async function generateWithGemini(prompt) {
  if (!genAI) {
    throw new Error("GOOGLE_API_KEY is missing or invalid");
  }

  let lastError = null;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return text;
    } catch (err) {
      console.warn(`Gemini model ${modelName} failed (${err.message}), trying next...`);
      lastError = err;
    }
  }
  throw lastError || new Error("All Gemini models failed");
}

/* ===============================
   CHAT & RESEARCH ROUTES
=================================*/
async function handleChat(req, res, isResearch = false) {
  const userPrompt = req.body.message || req.body.question || "";
  const trimmed = userPrompt.trim();

  if (!trimmed) {
    return res.json({
      reply: "Please enter a question.",
      answer: "Please enter a question."
    });
  }

  try {
    const systemInstruction = isResearch
      ? "You are QuBot, an expert quantum computing research assistant. Provide an advanced, in-depth technical analysis with rigorous mathematical formulations, circuit logic, and foundational quantum mechanical concepts where applicable."
      : "You are QuBot, a helpful and knowledgeable AI assistant specializing in quantum computing and general science. Answer clearly, accurately, and concisely.";

    const prompt = `${systemInstruction}\n\nUser Question: ${trimmed}`;
    const answer = await generateWithGemini(prompt);

    return res.json({
      reply: answer,
      answer: answer
    });
  } catch (err) {
    console.error("AI Generation Error:", err.message);
    return res.status(500).json({
      reply: "Error generating AI response. Please try again later.",
      answer: "Error generating AI response."
    });
  }
}

// Support both standard QuBot frontend endpoints and legacy /ask
app.post("/api/chat/message", (req, res) => handleChat(req, res, false));
app.post("/api/research/message", (req, res) => handleChat(req, res, true));
app.post("/ask", (req, res) => handleChat(req, res, false));

/* ===============================
   TRANSLATION + AUDIO (With Gemini Fallback)
=================================*/
const SUPPORTED_LANGUAGES = {
  English: "en",
  Hindi: "hi",
  Telugu: "te",
  Spanish: "es",
  French: "fr",
  German: "de",
  Italian: "it",
  Portuguese: "pt",
  Russian: "ru",
  Arabic: "ar",
  Japanese: "ja",
  Korean: "ko"
};

app.post("/translate-audio", async (req, res) => {
  const { text, language } = req.body;

  if (!text || !language) {
    return res.status(400).json({ error: "Missing text or language" });
  }

  const langCode = SUPPORTED_LANGUAGES[language];
  if (!langCode) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  let translatedText = "";

  // 1. Try Google Translate Free API first
  try {
    const translateURL = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`;
    const translationResponse = await fetch(translateURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (translationResponse.ok) {
      const translationData = await translationResponse.json();
      translatedText = translationData[0].map((item) => item[0]).join("");
    }
  } catch (err) {
    console.warn("Primary translation endpoint failed, using Gemini fallback:", err.message);
  }

  // 2. Fallback to Gemini AI translation if Google Translate is blocked on cloud IP
  if (!translatedText && genAI) {
    try {
      const prompt = `Translate the following text accurately into ${language}. Output ONLY the direct translation, nothing else:\n\n${text}`;
      const translation = await generateWithGemini(prompt);
      translatedText = translation.trim();
    } catch (geminiErr) {
      console.error("Gemini translation error:", geminiErr.message);
    }
  }

  if (!translatedText) {
    return res.status(500).json({ error: "Translation failed" });
  }

  // 3. Audio generation (gTTS)
  if (langCode === "te") {
    return res.json({
      translatedText,
      audio: null,
      note: "Audio not supported for Telugu in gTTS"
    });
  }

  try {
    const tts = new gTTS(translatedText, langCode);
    const chunks = [];

    tts
      .stream()
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => {
        const audioBuffer = Buffer.concat(chunks);
        const base64Audio = audioBuffer.toString("base64");
        res.json({
          translatedText,
          audio: base64Audio
        });
      })
      .on("error", (ttsErr) => {
        console.warn("TTS Audio generation failed:", ttsErr.message);
        // Return 200 with translated text even if audio generation fails on datacenter IP
        res.json({
          translatedText,
          audio: null,
          note: "Audio generation unavailable"
        });
      });
  } catch (err) {
    console.warn("gTTS exception:", err.message);
    res.json({
      translatedText,
      audio: null,
      note: "Audio generation failed"
    });
  }
});

/* ===============================
   CHAT HISTORY (MongoDB Schemas & Routes)
=================================*/
const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  title: String,
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // auto delete after 30 days
  }
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", conversationSchema, "chats");
const Research = mongoose.models.Research || mongoose.model("Research", conversationSchema, "research");

const getModel = (mode) => (mode === "research" ? Research : Chat);

app.post("/history/start", async (req, res) => {
  try {
    const { firstMessage, mode } = req.body;
    const Model = getModel(mode);

    const convo = await Model.create({
      title: firstMessage,
      messages: [
        {
          sender: "user",
          text: firstMessage
        }
      ]
    });

    res.json(convo);
  } catch (err) {
    console.error("Start history failed:", err.message);
    res.status(500).json({ error: "start failed" });
  }
});

app.post("/history/:mode/:id/message", async (req, res) => {
  try {
    const { mode, id } = req.params;
    const { sender, text } = req.body;
    const Model = getModel(mode);

    await Model.findByIdAndUpdate(id, {
      $push: {
        messages: {
          sender,
          text
        }
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Save message failed:", err.message);
    res.status(500).json({ error: "message save failed" });
  }
});

app.get("/history/:mode", async (req, res) => {
  try {
    const Model = getModel(req.params.mode);
    const data = await Model.find()
      .select("_id title createdAt")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.error("Fetch history failed:", err.message);
    res.status(500).json({ error: "fetch failed" });
  }
});

app.get("/history/:mode/:id", async (req, res) => {
  try {
    const Model = getModel(req.params.mode);
    const convo = await Model.findById(req.params.id);

    res.json(convo);
  } catch (err) {
    console.error("Fetch convo failed:", err.message);
    res.status(500).json({ error: "fetch convo failed" });
  }
});

app.delete("/history/:mode/:id", async (req, res) => {
  try {
    const Model = getModel(req.params.mode);
    await Model.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete history failed:", err.message);
    res.status(500).json({ error: "delete failed" });
  }
});

/* ===============================
   HEALTH & STATUS
=================================*/
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("🚀 QuBot Unified Backend API is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
