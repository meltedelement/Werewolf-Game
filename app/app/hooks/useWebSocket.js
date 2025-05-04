import { useEffect, useState } from "react";

export default function useWebSocket(url) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const data = event.data;
      console.log("Message received:", data);

      if (data.startsWith("choice,")) {
        // Handle "choice" message
        const parts = data.split(",");
        const title = parts[1]; // First player-role is the title
        const playerRoles = parts.slice(2); // Remaining player-roles
        console.log("Choice Screen Title:", title);
        console.log("Player Roles:", playerRoles);
        setMessages((prev) => [...prev, { type: "choice", title, playerRoles }]);
      } else if (data.startsWith("result,")) {
        // Handle "result" message
        const message = data.split(",")[1]; // Extract the result message
        console.log("Result Message:", message);
        setMessages((prev) => [...prev, { type: "result", message }]);
      } else {
        // Handle any other string
        console.log("Other Message:", data);
        setMessages((prev) => [...prev, { type: "other", message: data }]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(ws);

    return () => {
      ws.close(); // Clean up on component unmount
    };
  }, [url]);

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
      console.log("Message sent:", message);
    } else {
      console.error("WebSocket is not open");
    }
  };

  return { messages, sendMessage };
}