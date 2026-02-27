import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./Message.css";

const LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "German",
  "Italian", "Portuguese", "Russian", "Arabic", "Japanese", "Korean"
];

/* ─── DELIMITER NORMALISER ───────────────────────────────────
   Converts whatever the AI sends into the $...$ / $$...$$ 
   delimiters that remark-math understands.

   Handles:
     \[ ... \]   → $$ ... $$   (display)
     \( ... \)   → $ ... $     (inline)
     [ ... ]     → $$ ... $$   (display — common LLM output)
     ( ... ) when preceded by math context  ← left as-is (too broad)
──────────────────────────────────────────────────────────── */
function normaliseMath(text) {
  if (!text) return text;

  return text
    // \[ ... \]  →  $$ ... $$
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_, expr) => `$$\n${expr.trim()}\n$$`)

    // \( ... \)  →  $ ... $
    .replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (_, expr) => `$${expr.trim()}$`)

    // Standalone [ ... ] on its own line(s) — display math
    .replace(/(?:^|\n)\[\s*([\s\S]*?)\s*\](?=\s*(?:\n|$))/g, (_, expr) => `\n$$\n${expr.trim()}\n$$\n`);
}

function Message({ sender, text, onLanguageSelect, shouldAnimate = false }) {

  const [displayedText, setDisplayedText] = useState(
    sender === "bot" ? (shouldAnimate ? "" : text) : text
  );
  const [typingComplete, setTypingComplete]   = useState(!shouldAnimate);
  const [copySuccess,    setCopySuccess]       = useState(false);
  const [showTooltip,    setShowTooltip]       = useState(false);

  useEffect(() => {
    setDisplayedText(sender === "bot" ? (shouldAnimate ? "" : text) : text);
    setTypingComplete(!shouldAnimate);
  }, [text, sender, shouldAnimate]);

  useEffect(() => {
    if (sender !== "bot" || !shouldAnimate) return;
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) { clearInterval(interval); setTypingComplete(true); }
    }, 12);
    return () => clearInterval(interval);
  }, [text, sender, shouldAnimate]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    if (!lang) return;
    onLanguageSelect(text, lang);
    e.target.value = "";
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true); setShowTooltip(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setTimeout(() => setShowTooltip(false),  1500);
    } catch (err) { console.error("Copy failed", err); }
  };

  const renderedText = sender === "bot" ? normaliseMath(displayedText) : displayedText;

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
            >
              {renderedText}
            </ReactMarkdown>
            {!typingComplete && shouldAnimate && (
              <span className="typing-cursor">▌</span>
            )}
          </>
        ) : (
          <p>{text}</p>
        )}
      </div>

      {/* Bot footer */}
      {sender === "bot" && typingComplete && (
        <div className="message-footer">
          <div className="language-selector">
            <select onChange={handleLanguageChange}>
              <option value="">🌐 Translate &amp; Listen</option>
              {LANGUAGES.map((lang, i) => (
                <option key={i} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <CopyBtn success={copySuccess} tooltip={showTooltip} onCopy={handleCopy} />
        </div>
      )}

      {/* User footer */}
      {sender === "user" && (
        <div className="message-footer">
          <CopyBtn success={copySuccess} tooltip={showTooltip} onCopy={handleCopy} />
        </div>
      )}

    </div>
  );
}

/* Small isolated copy button so state doesn't re-render the whole message */
function CopyBtn({ success, tooltip, onCopy }) {
  return (
    <div className="copy-button-container">
      <button
        className={`copy-button ${success ? "success" : ""}`}
        onClick={onCopy}
        title="Copy to clipboard"
      >
        {success ? "✓" : "📋"}
      </button>
      {tooltip && (
        <span className="copy-tooltip">{success ? "Copied!" : "Copy"}</span>
      )}
    </div>
  );
}

export default Message;