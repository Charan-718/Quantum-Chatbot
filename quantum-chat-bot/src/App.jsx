import { useState, useEffect } from "react";
import ChatBox from "./components/ChatBox";
import InputBox from "./components/InputBox";
import LanguageModal from "./components/LanguageModal";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ConfirmModal from "./components/ConfirmModal";
import SquidBot from "./components/SquidBot";
import "./App.css";

function App() {

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm QuBot, your quantum AI assistant. How can I help you today?",
      shouldAnimate: true // First message should animate
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [theme, setTheme] = useState("dark");

  const [mode, setMode] = useState("chat");
  const [pendingMode, setPendingMode] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [conversationId, setConversationId] = useState(null);
  const [showContent, setShowContent] = useState(false);

  /* SIDEBAR STATE */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* THEME */

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => prev === "dark" ? "light" : "dark");


  useEffect(() => {
  const timer = setTimeout(() => {
    setShowContent(true);
  }, 8000);

  return () => clearTimeout(timer);
}, []);


  /* LOAD CHAT - No animation for saved chats */

  const loadChat = async (chat) => {
    try {
      const res =
        await fetch(`http://localhost:5000/history/${chat.mode}/${chat._id}`);

      const data = await res.json();

      setConversationId(data._id);
      setMode(chat.mode);
      
      // Add shouldAnimate: false to all messages when loading from history
      const loadedMessages = (data.messages || []).map(msg => ({
        ...msg,
        shouldAnimate: false
      }));
      
      setMessages(loadedMessages);
      
      // Close sidebar after selecting a chat
      setSidebarOpen(false);
    }
    catch {
      console.log("Failed to load chat");
    }
  };


  /* START CONVERSATION - Only used when manually saving */

  const startConversation = async (firstMessage) => {
    try {
      const res =
        await fetch("http://localhost:5000/history/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstMessage, mode })
        });

      if (!res.ok) throw new Error();

      const convo = await res.json();
      return convo._id;
    }
    catch {
      console.warn("History server offline");
      return null;
    }
  };


  /* SAVE MESSAGE */

  const saveMessage = async (id, sender, text) => {
    if (!id) return;

    try {
      await fetch(
        `http://localhost:5000/history/${mode}/${id}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender, text })
        }
      );
    }
    catch {
      console.warn("Message not saved");
    }
  };


  /* SAVE FULL CHAT - Manual save only */

  const saveFullConversation = async () => {

    // Don't save if conversation is empty or already saved
    if (messages.length <= 1) {
      alert("No messages to save");
      return;
    }

    // If already saved, don't save again
    if (conversationId) {
      alert("Conversation already saved");
      return;
    }

    const firstUser = messages.find(m => m.sender === "user");
    if (!firstUser) {
      alert("No user messages to save");
      return;
    }

    const id = await startConversation(firstUser.text);

    if (!id) {
      alert("History server offline");
      return;
    }

    // Save all messages except the initial bot greeting if it's the only message
    for (const msg of messages) {
      await saveMessage(id, msg.sender, msg.text);
    }

    setConversationId(id);
    alert("Conversation saved successfully");

  };


  /* MODE SWITCH */

  const requestModeChange = (newMode) => {

    if (messages.length > 1) {
      setPendingMode(newMode);
      setShowConfirm(true);
    }
    else {
      setMode(newMode);
    }
  };


  const confirmModeSwitch = async (save) => {

    if (save) {
      await saveFullConversation();
    }

    setConversationId(null);

    setMessages([
      { 
        sender: "bot", 
        text: "New session started.",
        shouldAnimate: true 
      }
    ]);

    setMode(pendingMode);
    setShowConfirm(false);
  };


  /* SEND QUESTION - New messages should animate */

  const sendQuestion = async (question) => {

    if (!question.trim()) return;

    // Add user message to UI immediately (no animation for user messages)
    setMessages(prev => [
      ...prev, 
      { sender: "user", text: question, shouldAnimate: false }
    ]);

    setLoading(true);

    try {

      // No conversation ID is created or saved here
      // Just send to backend and get response

      const endpoint =
        mode === "chat"
          ? "http://127.0.0.1:8000/api/chat/message"
          : "http://127.0.0.1:8000/api/research/message";

      const res =
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: question,
            detail_level:
              mode === "research"
                ? "advanced"
                : "intermediate",
            client_context: {
              client_type: "website"
            }
          })
        });

      const data = await res.json();
      const reply = data.reply || "No response";

      // Add bot response to UI with animation enabled
      setMessages(prev => [
        ...prev, 
        { sender: "bot", text: reply, shouldAnimate: true }
      ]);

      // NO AUTO-SAVE - Don't create conversation or save messages

    }
    catch {
      setMessages(prev => [
        ...prev, 
        { 
          sender: "bot", 
          text: "Backend connection failed.",
          shouldAnimate: true 
        }
      ]);
    }

    setLoading(false);
  };


  /* TRANSLATE */

  const handleLanguageSelect = async (text, language) => {

    setModalLoading(true);
    setModalData({ translatedText: "", audio: "" });

    try {

      const res =
        await fetch(
          "http://localhost:5500/translate-audio",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, language })
          }
        );

      const data = await res.json();
      setModalData(data);

    }
    catch {
      setModalData({
        translatedText: "Translation failed",
        audio: ""
      });
    }

    setModalLoading(false);
  };


  /* UI */

  return (

    <div className={`app ${sidebarOpen ? 'sidebar-expanded' : ''}`}>

      <div className="squidbot-container">
        <SquidBot />
      </div>

      {/* Floating Cards */}
      <div className="floating-card top-right">
        <h4>Quantum Code Hub Assistant</h4>
        <p>
          Welcome to Quantum Code Hub. I’m your intelligent coding companion,
          ready to translate ideas into quantum circuits and logic into precision.
          Let’s explore, build, and innovate together.
        </p>
      </div>

      <div className="floating-card bottom-left">
        <h4>Your Quantum Guide</h4>
        <p>
          Ask your questions, share your code, or describe your challenge.
          I’ll analyze, generate, refine, and explain with clarity,
          turning complex quantum concepts into practical solutions.
        </p>
      </div>

      <Sidebar 
        onSelectChat={loadChat} 
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />

      <div className={`main-content ${showContent ? "visible" : "hidden"}`}>

        {/* <div className="squidbot-container">
          <SquidBot />
        </div> */}
        
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          mode={mode}
          requestModeChange={requestModeChange}
        />

        {messages.length > 1 && !conversationId && (
          <button
            className="save-chat-btn"
            onClick={saveFullConversation}
          >
            Save Chat
          </button>
        )}

        {conversationId && (
          <div className="saved-badge">
            ✓ Saved
          </div>
        )}

        <ChatBox
          messages={messages}
          loading={loading}
          onLanguageSelect={handleLanguageSelect}
        />

        <InputBox onSend={sendQuestion} />
      </div>

      {modalData && (
        <LanguageModal
          translatedText={modalData.translatedText}
          audioData={modalData.audio}
          loading={modalLoading}
          onClose={() => setModalData(null)}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          onSave={() => confirmModeSwitch(true)}
          onDiscard={() => confirmModeSwitch(false)}
        />
      )}

    </div>
  );
}

export default App;