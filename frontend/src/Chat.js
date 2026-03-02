import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  // Load saved messages on start
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Listen for new messages
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => {
        const updated = [...prev, data];
        localStorage.setItem("chatMessages", JSON.stringify(updated));
        return updated;
      });
    });

    return () => socket.off("receiveMessage");
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;

    const msgData = {
      sender: user?.name || "Guest",
      text: message,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("sendMessage", msgData);
    setMessage("");
  };

  const clearChat = () => {
    localStorage.removeItem("chatMessages");
    setMessages([]);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Real-Time Chat</h2>

      <div
        style={{
          border: "1px solid #ccc",
          height: "250px",
          overflowY: "auto",
          padding: "10px",
          backgroundColor: "#f4f4f4",
          borderRadius: "8px",
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "gray" }}>No messages yet...</p>
        )}

        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "8px" }}>
            <strong>{msg.sender}</strong>
            <div>{msg.text}</div>
            <small style={{ fontSize: "10px", color: "gray" }}>
              {msg.time}
            </small>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
          style={{ width: "65%", padding: "8px" }}
        />
        <button
          onClick={sendMessage}
          style={{ padding: "8px 15px", marginLeft: "10px" }}
        >
          Send
        </button>

        <button
          onClick={clearChat}
          style={{
            padding: "8px 15px",
            marginLeft: "10px",
            backgroundColor: "red",
            color: "white",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default Chat;