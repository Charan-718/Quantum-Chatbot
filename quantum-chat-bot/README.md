# 🧠 QuBot — Quantum AI Assistant

QuBot is a full-stack AI chatbot designed for **quantum computing assistance**, supporting:

• Conversational chat and research modes  
• Retrieval-Augmented Generation (RAG) via FastAPI backend  
• Conversation history stored in MongoDB  
• Multi-language translation with audio playback  
• Session management and persistent chat history  
• Modern React frontend  

---

# 🏗️ Architecture Overview
Frontend (React)
│
├── Chat UI
├── Translation Modal + Audio
├── Theme & Mode Switching
└── History Sidebar
│
├─────────────── HTTP ────────────────┐
│ │
History Server (Node + MongoDB) AI Backend (FastAPI)
Port 5000 Port 8000
│ │
Stores conversations RAG pipeline
Session history LLM generation
Chat titles Vector database retrieval
│ │
Translation Server (Node)
Port 5500
│
Google Translate API + gTTS


---

# 📂 Project Structure
project/
│
├── frontend/ React App
│ ├── src/components
│ ├── App.jsx
│ └── App.css
│
├── history-server/ MongoDB chat history server
│ └── server.js
│
├── translation-server/ Translation + audio backend
│ └── server.js
│
├── quantum-backend/ FastAPI RAG backend
│ ├── api/
│ ├── services/
│ ├── scripts/
│ └── requirements.txt
│
└── README.md






---

# ⚙️ Prerequisites

Install the following:

## Required

• Node.js 18+  
• Python 3.10+  
• MongoDB  

## Optional but Recommended

• Redis  
• PostgreSQL  
• Ollama or HuggingFace API key  

---

# 🚀 Setup Guide

---

# 1️⃣ Frontend Setup

```

cd frontend
npm install
npm start

```

Runs at:

```

http://localhost:3000

```

---

# 2️⃣ MongoDB History Server

Stores chat sessions and messages.

## Create `.env`

```

MONGO_URI=mongodb://127.0.0.1:27017/qubot

```

## Run server

```

node server.js

```

Runs at:

```

http://localhost:5000

```

---

# 3️⃣ Translation + Audio Server

Provides translation and speech.

## Install

```

npm install express cors dotenv gtts

```

## Run

```

node server.js

```

Runs at:

```

http://localhost:5500

```

---

# 4️⃣ FastAPI Quantum Backend (RAG + LLM)

## Create virtual environment

Windows:

```

python -m venv venv
venv\Scripts\activate

```

Linux/Mac:

```

python -m venv venv
source venv/bin/activate

```

---

## Install dependencies

```

pip install -r requirements.txt

```

---

## Configure environment

Copy:

```

.env.example → .env

```

Set minimum:

```

ENABLE_AUTH=false

CHROMA_PERSIST_DIR=./chroma

EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

```

Optional LLM provider:

```

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

or

HF_API_KEY=your_key

```

---

## Initialize database

```

python scripts/setup_db.py
python scripts/setup_chroma.py

```

---

## Run backend

```

uvicorn api.main:app --reload

```

Runs at:

```

http://127.0.0.1:8000

```

Docs:

```

http://127.0.0.1:8000/docs

```

---

# 🧪 Health Check

```

http://127.0.0.1:8000/health

```

Expected:

```

{
status: "healthy"
}

```

---

# 💬 Chat API Endpoint

```

POST /api/chat/message

```

Example:

```

{
"message": "Explain Bell State",
"detail_level": "beginner",
"client_context": {
"client_type": "website"
}
}

```

Response:

```

{
"reply": "Bell state is..."
}

```

---

# 🌍 Translation Endpoint

```

POST http://localhost:5500/translate-audio

```

Body:

```

{
"text": "Hello",
"language": "Hindi"
}

```

Response:

```

{
"translatedText": "नमस्ते",
"audio": "base64..."
}

```

---

# 🧠 Features

## Chat Modes

Chat Mode  
General assistance

Research Mode  
Advanced technical responses

---

## RAG Pipeline

Embedding generation  
Vector search (ChromaDB)  
Context retrieval  
LLM response generation  

---

## Chat History

Stored in MongoDB

Supports:

• Save conversations  
• Load previous chats  
• Auto-delete after 30 days  

---

## Translation + Audio

Supports:

English  
Hindi  
Spanish  
French  
German  
Italian  
Portuguese  
Russian  
Arabic  
Japanese  
Korean  

---

## UI Features

Dark / Light theme  
Language modal  
Audio playback  
Session switching  
History sidebar  

---

# 🖥️ Ports Used

| Service | Port |
|--------|------|
Frontend | 3000
History Server | 5000
Translation Server | 5500
FastAPI Backend | 8000
MongoDB | 27017

---

# ▶️ Full Startup Order

Start in this order:

```

MongoDB

History Server

node server.js

Translation Server

node server.js

FastAPI backend

uvicorn api.main:app --reload

Frontend

npm start

```

---

# 🧯 Troubleshooting

## Backend not responding

Check:

```

http://127.0.0.1:8000/health

```

---

## MongoDB error

Start MongoDB:

```

mongod

```

---

## Translation fails

Ensure port 5500 running

---

## Chat history not saving

Check MongoDB connection string

---

# 📌 Tech Stack

Frontend  
React  
CSS  

Backend AI  
FastAPI  
LangChain  
ChromaDB  
Transformers  

History  
Node.js  
MongoDB  

Translation  
Google Translate API  
gTTS  

---

# 👨‍💻 Developer Notes

Main chatbot endpoint:

```

/api/chat/message

```

Frontend integration:

```

App.jsx → sendQuestion()

```

History integration:

```

history server → MongoDB

```

Translation integration:

```

LanguageModal → translate-audio endpoint

```

---

# ✅ Project Status

Fully functional:

Chat  
RAG backend  
Translation  
Audio playback  
History persistence  
Theme switching  

---

# 📜 License

MIT License

```

---

If you'd like, I can also generate a **production-grade README with diagrams and deployment instructions (Docker + Nginx + VPS)**.