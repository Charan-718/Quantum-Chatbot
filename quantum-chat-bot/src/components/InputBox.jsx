import { useState } from "react";
import "./InputBox.css";

function InputBox({ onSend }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="input-container">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Ask a question..."
      />
      <button onClick={handleSend}>Ask</button>
    </div>
  );
}

export default InputBox;