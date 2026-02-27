import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import gTTS from "gtts";

dotenv.config();

const app = express();
const PORT = 5500;

app.use(cors());
app.use(express.json());

if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ GOOGLE_API_KEY missing");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

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

/* ===============================
   MAIN CHAT ROUTE (Gemini only)
=================================*/
app.post("/ask", async (req, res) => {
  const question = req.body.question?.trim();
  if (!question) return res.json({ answer: "Please enter a question." });

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest"
    });

    const result = await model.generateContent(question);
    const answer = result.response.text();

    res.json({ answer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ answer: "Error generating answer." });
  }
});

/* ===============================
   TRANSLATE + AUDIO (Free Translation)
=================================*/
app.post("/translate-audio", async (req, res) => {
  const { text, language } = req.body;

  if (!text || !language) {
    return res.status(400).json({ error: "Missing text or language" });
  }

  const langCode = SUPPORTED_LANGUAGES[language];

  if (!langCode) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  try {
    // 🌍 Google Free Translate Endpoint (Stable)
    const translateURL = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`;

    const translationResponse = await fetch(translateURL);

    if (!translationResponse.ok) {
      throw new Error("Translation request failed");
    }

    const translationData = await translationResponse.json();

    // Extract translated text from array structure
    const translatedText = translationData[0]
      .map(item => item[0])
      .join("");

    if (!translatedText) {
      throw new Error("Translation parsing failed");
    }

    // 🔊 Generate Audio
    if (langCode === "te") {
      return res.json({
        translatedText,
        audio: null,
        note: "Audio not supported for Telugu in gTTS"
      });
    }
    const tts = new gTTS(translatedText, langCode);
    const chunks = [];

    tts.stream()
      .on("data", chunk => chunks.push(chunk))
      .on("end", () => {
        const audioBuffer = Buffer.concat(chunks);
        const base64Audio = audioBuffer.toString("base64");

        res.json({
          translatedText,
          audio: base64Audio
        });
      })
      .on("error", err => {
        console.error(err);
        res.status(500).json({ error: "Audio generation failed" });
      });

  } catch (err) {
    console.error("Translation error:", err.message);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
