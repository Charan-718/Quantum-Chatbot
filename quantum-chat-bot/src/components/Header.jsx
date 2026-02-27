import { useEffect, useState } from 'react';
import './Header.css'

function Header({
  theme,
  toggleTheme,
  mode,
  requestModeChange,
  showContent,
  selectedLanguage,
  onLanguageChange,
  isTranslating,
  languages
}) {
  const [animateLogo, setAnimateLogo] = useState(false);

  useEffect(() => {
    if (showContent) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setAnimateLogo(true);
      }, 1000);
    }
  }, [showContent]);

  return (
    <div className="app-header">

      <h1 className="logo">
        {"QuBot".split("").map((letter, index) => (
          <span
            key={index}
            className={animateLogo ? 'animate' : ''}
            style={{ animationDelay: animateLogo ? `${index * 0.15}s` : '0s' }}
          >
            {letter}
          </span>
        ))}
      </h1>

      <div className="mode-toggle">


        <button
          className="theme-toggle"
          onClick={toggleTheme}
        >
          <div className="toggle-track">
            <div className="toggle-thumb"/>
          </div>

          {theme === "dark" ? "Light Mode" : "Dark Mode"}

        </button>

        <button
          className={mode === "chat" ? "active" : ""}
          onClick={() => requestModeChange("chat")}
        >
          Chat Mode
        </button>

        {/* <button
          className={mode === "research" ? "active" : ""}
          onClick={() => requestModeChange("research")}
        >
          Research Mode
        </button> */}

      </div>

      {/* Universal Language Dropdown */}
      <div className="language-bar">
        <div className="language-selector-wrapper">
          <label htmlFor="universal-language">🌐</label>
          <select
            id="universal-language"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={isTranslating}
            className="universal-language-select"
          >
            {languages.map((lang, i) => (
              <option key={i} value={lang}>{lang}</option>
            ))}
          </select>
          {isTranslating && (
            <span className="language-loader">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          )}
        </div>
      </div>

    </div>
  );
}

export default Header;