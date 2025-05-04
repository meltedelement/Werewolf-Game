import React, { useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import useWebSocket from "./hooks/useWebSocket";

export default function Result({ message }) {
  const { messages, sendMessage } = useWebSocket("ws://192.168.64.94/24:8080"); // Replace with your backend WebSocket URL

  useEffect(() => {
    console.log("Received messages:", messages);
  }, [messages]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RESULT:</Text>
      <View style={styles.resultBox}>
        <Text style={styles.resultText}>{message}</Text>
      </View>
      <Button
        title="Send Test Message"
        onPress={() => sendMessage("Hello from React!")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  resultBox: {
    width: "80%",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
  },
  resultText: {
    fontSize: 16,
    textAlign: "center",
  },
});