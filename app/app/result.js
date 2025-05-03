import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Result({ message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RESULT:</Text>
      <View style={styles.resultBox}>
        <Text style={styles.resultText}>{message}</Text>
      </View>
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