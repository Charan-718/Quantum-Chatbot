import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./Message.css";

const LANGUAGES = [
  "English",
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

function Message({ sender, text, onLanguageSelect, shouldAnimate = false }) {

  const [displayedText, setDisplayedText] = useState(
    sender === "bot" ? (shouldAnimate ? "" : text) : text
  );

  const [typingComplete, setTypingComplete] = useState(!shouldAnimate);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Reset states when text changes
    setDisplayedText(sender === "bot" ? (shouldAnimate ? "" : text) : text);
    setTypingComplete(!shouldAnimate);
  }, [text, sender, shouldAnimate]);

  useEffect(() => {
    // Only animate if shouldAnimate is true and sender is bot
    if (sender !== "bot" || !shouldAnimate) return;

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

  }, [text, sender, shouldAnimate]);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    if (!selectedLang) return;
    onLanguageSelect(text, selectedLang);
    e.target.value = ""; // reset dropdown
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setShowTooltip(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      
      // Hide tooltip after 1.5 seconds
      setTimeout(() => {
        setShowTooltip(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
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
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                math: ({ value }) => <span className="math-inline">{value}</span>,
                inlineMath: ({ value }) => <span className="math-inline">{value}</span>
              }}
            >
              {displayedText}
            </ReactMarkdown>

            {!typingComplete && shouldAnimate && (
              <span className="typing-cursor">▌</span>
            )}
          </>
        ) : (
          <p>{text}</p>
        )}

      </div>

      {/* Message Footer with Copy Button and Language Selector */}
      {(sender === "bot" && typingComplete) && (
        <div className="message-footer">
          
          {/* Language Selector - Left side */}
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

          {/* Copy Button - Right side */}
          <div className="copy-button-container">
            <button
              className={`copy-button ${copySuccess ? 'success' : ''}`}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copySuccess ? '✓' : '📋'}
            </button>
            {showTooltip && (
              <span className="copy-tooltip">
                {copySuccess ? 'Copied!' : 'Copy'}
              </span>
            )}
          </div>

        </div>
      )}

      {/* For user messages, only show copy button if needed */}
      {sender === "user" && (
        <div className="message-footer">
          <div className="copy-button-container">
            <button
              className={`copy-button ${copySuccess ? 'success' : ''}`}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copySuccess ? '✓' : '📋'}
            </button>
            {showTooltip && (
              <span className="copy-tooltip">
                {copySuccess ? 'Copied!' : 'Copy'}
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Message;