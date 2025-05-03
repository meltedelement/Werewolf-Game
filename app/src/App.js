import React, { useEffect, useState } from "react";
import Phase from "./Phase";


function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentScreen, setCurrentScreen] = useState("menu");
  let socket;

  useEffect(() => {
    // Connect to the WebSocket server
    socket = new WebSocket("ws://localhost:8080/ws");

    // Handle incoming messages
    socket.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    // Cleanup on component unmount
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.send(input); // Send the input message to the backend
      setInput(""); // Clear the input field
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "phase":
        return (
          <Phase
            playerRole="James - Werewolf"
            playerList={["Player 1", "Player 2", "Player 3", "Player 4"]}
            optionsNeeded={2}
            onSubmit={(selectedOptions) => {
              console.log("Selected options:", selectedOptions);
            }}
          />
        );
      case "chat":
        return (
          <div>
            <h1>WebSocket Chat</h1>
            <div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
              />
              <button onClick={sendMessage}>Send</button>
            </div>
            <div>
              <h2>Messages:</h2>
              <ul>
                {messages.map((msg, Phase) => (
                  <li key={Phase}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h1>Development Menu</h1>
            <button onClick={() => setCurrentScreen("phase")}>Test Phase Screen</button>
            <button onClick={() => setCurrentScreen("chat")}>Test Chat Screen</button>
          </div>
        );
    }
  };

  return <div className="App">{renderScreen()}</div>;
}

export default App;
