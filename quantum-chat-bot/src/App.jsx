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

  /* LANGUAGE STATE - Initialize from localStorage */
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return savedLanguage || "English";
  });
  
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  const LANGUAGES = [
    "English", "Hindi", "Telugu", "Spanish", "French", "German",
    "Italian", "Portuguese", "Russian", "Arabic", "Japanese", "Korean"
  ];

  /* Save language preference to localStorage whenever it changes */
  useEffect(() => {
    localStorage.setItem('preferredLanguage', selectedLanguage);
  }, [selectedLanguage]);

  /* Auto-translate messages when language is not English and messages change */
  useEffect(() => {
    if (selectedLanguage !== "English" && messages.length > 0) {
      translateAllMessages(selectedLanguage, false); // Don't show loading for auto-translate
    }
  }, [messages]);

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
    
    // Filter out system messages and deduplicate user messages
    const rawMessages = data.messages || [];
    const filteredMessages = [];
    
    for (let i = 0; i < rawMessages.length; i++) {
      const currentMsg = rawMessages[i];
      
      // Skip system bot messages
      if (currentMsg.sender === "bot") {
        // Skip welcome message
        if (currentMsg.text === "Hello! I'm QuBot, your quantum AI assistant. How can I help you today?") {
          continue;
        }
        // Skip "New session started" message
        if (currentMsg.text === "New session started.") {
          continue;
        }
        // Add other bot messages
        filteredMessages.push(currentMsg);
        continue;
      }
      
      // For user messages, check for duplicates
      if (currentMsg.sender === 'user') {
        // Check if this is a duplicate of the previous user message
        const prevMsg = filteredMessages.length > 0 ? filteredMessages[filteredMessages.length - 1] : null;
        
        if (prevMsg && 
            prevMsg.sender === 'user' && 
            prevMsg.text === currentMsg.text) {
          // Skip duplicate user message
          continue;
        }
        
        filteredMessages.push(currentMsg);
      }
    }
    
    // Add shouldAnimate: false to all messages when loading from history
    const loadedMessages = filteredMessages.map(msg => ({
      ...msg,
      shouldAnimate: false
    }));
    
    setMessages(loadedMessages);
    
    // Reset translations when loading new chat but keep language preference
    setTranslatedMessages({});
    
    // Close sidebar after selecting a chat
    setSidebarOpen(false);
  }
  catch {
    console.log("Failed to load chat");
  }
};


  /* START NEW CHAT - Reset to fresh session */

  const startNewChat = () => {
    // Check if current chat has messages (excluding the initial bot greeting)
    if (messages.length > 1) {
      // If there are messages, ask to save
      setPendingMode(mode); // Keep current mode
      setShowConfirm(true);
    } else {
      // If no messages, just reset
      resetToNewChat();
    }
  };

  const resetToNewChat = () => {
    setConversationId(null);
    setMessages([
      { 
        sender: "bot", 
        text: "Hello! I'm QuBot, your quantum AI assistant. How can I help you today?",
        shouldAnimate: true 
      }
    ]);
    setTranslatedMessages({});
    setSidebarOpen(false);
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

    // Save only user messages and their corresponding bot responses
    // Skip system messages like welcome message and "New session started"
    const messagesToSave = [];
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      
      // Skip system bot messages
      if (msg.sender === "bot") {
        // Skip welcome message
        if (msg.text === "Hello! I'm QuBot, your quantum AI assistant. How can I help you today?") {
          continue;
        }
        // Skip "New session started" message
        if (msg.text === "New session started.") {
          continue;
        }
      }
      
      // Check for duplicates: if this is a user message and the next message is also a user message with same text, skip this one
      if (msg.sender === "user" && i < messages.length - 1) {
        const nextMsg = messages[i + 1];
        if (nextMsg.sender === "user" && nextMsg.text === msg.text) {
          continue; // Skip this duplicate user message
        }
      }
      
      messagesToSave.push(msg);
    }

    // Save filtered messages
    for (const msg of messagesToSave) {
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


  /* UNIVERSAL TRANSLATE - Translate all messages */
  const translateAllMessages = async (targetLanguage, showLoading = true) => {
    if (targetLanguage === "English") {
      setSelectedLanguage(targetLanguage);
      setTranslatedMessages({});
      return;
    }

    if (showLoading) {
      setIsTranslating(true);
    }
    
    // Get all unique messages that need translation
    const messagesToTranslate = messages.map((msg, index) => ({
      index,
      text: msg.text
    }));

    const newTranslations = {};

    for (const { index, text } of messagesToTranslate) {
      try {
        const res = await fetch("http://localhost:5500/translate-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text, 
            language: targetLanguage,
            audio: false // Don't need audio for bulk translation
          })
        });

        const data = await res.json();
        newTranslations[index] = data.translatedText || text;
      } catch {
        newTranslations[index] = text; // Fallback to original text
      }
    }

    setTranslatedMessages(newTranslations);
    setSelectedLanguage(targetLanguage);
    
    if (showLoading) {
      setIsTranslating(false);
    }
  };


  /* UI */

  return (

    <div className={`app ${sidebarOpen ? 'sidebar-expanded' : ''}`}>

      <div className="squidbot-container">
        <SquidBot />
      </div>

      {/* Minimal Floating Text */}
      <div className="floating-essence">
        <h4>
          {"H!  I'm Qubot."
            .split("")
            .map((letter, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                {letter}
              </span>
            ))}
        </h4>
        <p>
          {"Ask me about qubits, circuits, algorithms, or frameworks like Qiskit and PennyLane. Let's explore the quantum world together."
            .split(" ")
            .map((word, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                {word}&nbsp;
              </span>
            ))}
        </p>
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
        onNewChat={startNewChat}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />

      <div className={`main-content ${showContent ? "visible" : "hidden"}`}>
        
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          mode={mode}
          requestModeChange={requestModeChange}
          showContent={showContent}
          selectedLanguage={selectedLanguage}
          onLanguageChange={translateAllMessages}
          isTranslating={isTranslating}
          languages={LANGUAGES}
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

        <InputBox onSend={sendQuestion} />

        <ChatBox
          messages={messages}
          loading={loading}
          onLanguageSelect={handleLanguageSelect}
          translatedMessages={translatedMessages}
          selectedLanguage={selectedLanguage}
        />

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