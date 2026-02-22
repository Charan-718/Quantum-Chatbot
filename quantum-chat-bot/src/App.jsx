import { useState, useEffect } from "react";
import ChatBox from "./components/ChatBox";
import InputBox from "./components/InputBox";
import LanguageModal from "./components/LanguageModal";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm QuBot, your quantum AI assistant. How can I help you today?" }
  ]);

  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const sendQuestion = async (question) => {
    if (!question.trim()) return;
    setMessages(prev => [...prev, { sender: "user", text: question }]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5500/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { sender: "bot", text: data.answer }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Server error. Please try again." }
      ]);
    }

    setLoading(false);
  };

  const handleLanguageSelect = async (text, language) => {
    if (!language) return;
    setModalLoading(true);
    setModalData({ translatedText: "", audio: "" });

    try {
      const response = await fetch("http://localhost:5500/translate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language })
      });
      const data = await response.json();
      setModalData(data);
    } catch {
      setModalData({ translatedText: "Translation failed.", audio: "" });
    }

    setModalLoading(false);
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>QuBot</h1>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <div className="toggle-track">
            <div className="toggle-thumb" />
          </div>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <ChatBox
        messages={messages}
        loading={loading}
        onLanguageSelect={handleLanguageSelect}
      />

      <InputBox onSend={sendQuestion} />

      {modalData && (
        <LanguageModal
          translatedText={modalData.translatedText}
          audioData={modalData.audio}
          loading={modalLoading}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
}

export default App;