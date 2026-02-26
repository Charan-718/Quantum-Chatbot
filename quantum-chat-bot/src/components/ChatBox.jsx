// import Message from "./Message";
// import './ChatBox.css'

// function ChatBox({ messages, loading, onLanguageSelect }) {
//   return (
//     <div className="chat-box">
//       {messages.map((msg, index) => (
//         <Message
//           key={index}
//           sender={msg.sender}
//           text={msg.text}
//           onLanguageSelect={onLanguageSelect}
//         />
//       ))}

//       {loading && (
//         <div className="message bot typing">
//           <strong>Assistant:</strong>
//           <p>
//             <span className="typing-dot" />
//             <span className="typing-dot" />
//             <span className="typing-dot" />
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ChatBox;





import Message from "./Message";
import './ChatBox.css'

function ChatBox({ messages, loading, onLanguageSelect }) {
  return (
    <div className="chat-box">
      {messages.map((msg, index) => (
        <Message
          key={index}
          sender={msg.sender}
          text={msg.text}
          onLanguageSelect={onLanguageSelect}
          shouldAnimate={msg.shouldAnimate || false}
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