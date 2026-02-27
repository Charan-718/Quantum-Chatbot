import { useEffect, useState } from "react";
import "./Sidebar.css";

function Sidebar({ onSelectChat, onNewChat, isOpen, onToggle }) {

  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("chat");
  const [showSidebarButton, setShowSidebarButton] = useState(false);


  /* LOAD HISTORY */
  const loadHistory = async (selectedMode) => {

    try {

      const res =
        await fetch(
          `http://localhost:5000/history/${selectedMode}`
        );

      if (!res.ok) return;

      const data = await res.json();

      setHistory(data);

    }
    catch {

      console.log("history offline");

    }

  };



  useEffect(() => {
  const timer = setTimeout(() => {
    setShowSidebarButton(true);
  }, 8000);

  return () => clearTimeout(timer);
}, []);


  useEffect(() => {

    loadHistory(mode);

  }, [mode]);


  /* DELETE CHAT */
  const deleteChat = async (id) => {

    try {

      await fetch(
        `http://localhost:5000/history/${mode}/${id}`,
        {
          method: "DELETE"
        }
      );

      setHistory(prev =>
        prev.filter(chat =>
          chat._id !== id
        )
      );

    }
    catch {

      alert("Delete failed");

    }

  };


  return (

    <>

      {!isOpen && showSidebarButton && (

        <button
          className="sidebar-open"
          onClick={() => onToggle(true)}
        >
          ☰
        </button>

      )}


      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>

        <div className="sidebar-header">

          <h3>History</h3>

          <button
            className="sidebar-close"
            onClick={() => onToggle(false)}
          >
            ✕
          </button>

        </div>


        {/* NEW CHAT BUTTON */}
        <div className="new-chat-container">
          <button
            className="new-chat-btn"
            onClick={() => {
              onNewChat();
              onToggle(false); // Close sidebar after starting new chat
            }}
          >
            + New Chat
          </button>
        </div>


        {/* MODE SWITCH */}
        <div className="sidebar-tabs">

          <button
            className={mode === "chat" ? "active" : ""}
            onClick={() => setMode("chat")}
          >
            Chat
          </button>

          <button
            className={mode === "research" ? "active" : ""}
            onClick={() => setMode("research")}
          >
            Research
          </button>

        </div>


        {/* HISTORY */}
        <div className="history-list">

          {history.length === 0 && (
            <div className="empty-history">
              No conversations
            </div>
          )}


          {history.map(chat => {

            const title =
              chat.title ||
              chat.messages?.[0]?.text ||
              "Untitled";

            return (

              <div
                key={chat._id}
                className="history-item"
              >

                <span
                  className="history-title"
                  onClick={() =>
                    onSelectChat({
                      _id: chat._id,
                      mode,
                      messages: chat.messages
                    })
                  }
                >
                  {title}
                </span>


                <button
                  className="delete-btn"
                  onClick={() => deleteChat(chat._id)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 11v6M14 11v6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

              </div>

            );

          })}

        </div>

      </div>

    </>

  );

}

export default Sidebar;