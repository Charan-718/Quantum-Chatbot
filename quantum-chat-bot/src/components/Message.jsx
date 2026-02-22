import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./Message.css";

const LANGUAGES = [
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Arabic",
  "Japanese",
  "Korean"
];

function Message({ sender, text, onLanguageSelect }) {

  const [displayedText, setDisplayedText] = useState(
    sender === "bot" ? "" : text
  );

  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    if (sender !== "bot") return;

    let index = 0;
    const speed = 12;

    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;

      if (index >= text.length) {
        clearInterval(interval);
        setTypingComplete(true);
      }
    }, speed);

    return () => clearInterval(interval);

  }, [text, sender]);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    if (!selectedLang) return;
    onLanguageSelect(text, selectedLang);
    e.target.value = ""; // reset dropdown
  };

  return (
    <div className={`message ${sender}`}>

      <div className="message-header">
        <span className="message-role">
          {sender === "user" ? "You" : "Assistant"}
        </span>
      </div>

      <div className="message-body">

        {sender === "bot" ? (
          <>
            <ReactMarkdown>
              {displayedText}
            </ReactMarkdown>

            {!typingComplete && (
              <span className="typing-cursor">▌</span>
            )}
          </>
        ) : (
          <p>{text}</p>
        )}

      </div>

      {sender === "bot" && typingComplete && (
        <div className="language-selector">
          <select onChange={handleLanguageChange}>
            <option value="">🌐 Translate & Listen</option>
            {LANGUAGES.map((lang, index) => (
              <option key={index} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      )}

    </div>
  );
}

export default Message;