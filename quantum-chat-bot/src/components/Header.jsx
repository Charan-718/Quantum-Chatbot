import './Header.css'

function Header({
  theme,
  toggleTheme,
  mode,
  requestModeChange
}) {
  return (
    <div className="app-header">

      <h1>QuBot</h1>

      <div className="mode-toggle">

        <button
          className={mode === "chat" ? "active" : ""}
          onClick={() => requestModeChange("chat")}
        >
          Chat Mode
        </button>

        <button
          className={mode === "research" ? "active" : ""}
          onClick={() => requestModeChange("research")}
        >
          Research Mode
        </button>

      </div>

      <button
        className="theme-toggle"
        onClick={toggleTheme}
      >
        <div className="toggle-track">
          <div className="toggle-thumb"/>
        </div>

        {theme === "dark" ? "Light Mode" : "Dark Mode"}

      </button>

    </div>
  );
}

export default Header;