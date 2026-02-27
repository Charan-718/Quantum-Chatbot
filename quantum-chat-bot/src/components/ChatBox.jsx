import Message from "./Message";
import './ChatBox.css'

function ChatBox({ messages, loading, onLanguageSelect, translatedMessages = {}, selectedLanguage = "English" }) {
  return (
    <div className="chat-box">
      {messages.map((msg, index) => (
        <Message
          key={index}
          sender={msg.sender}
          text={translatedMessages[index] || msg.text}
          originalText={msg.text}
          onLanguageSelect={onLanguageSelect}
          shouldAnimate={msg.shouldAnimate || false}
          selectedLanguage={selectedLanguage}
        />
      ))}

      {loading && (
        <div className="message bot typing">
          <strong>Assistant:</strong>
          <p>
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </p>
        </div>
      )}
    </div>
  );
}

export default ChatBox;