import { useState } from "react";
import { Send } from "lucide-react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Kitty, let's chat! 🎀", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, sender: "user" }]);
    setInput("");

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { text: "Meow~ That's so interesting! 😻", sender: "bot" }
      ]);
    }, 1000);
  };

  return (
    <div className="container">
      <div className="chat-window">
        <h1 className="header">🎀 Hello Kitty Chat 🎀</h1>
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            className="input-field"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} className="send-button">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

