import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { gameAPI } from "../services/api";

export default function Result() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const router = useRouter();

  // Get data from navigation params
  const gameId = params.gameId || null;
  const result = params.result || "No result available";

  useEffect(() => {
    if (gameId) {
      fetchGameState();
    }
  }, [gameId]);

  const fetchGameState = async () => {
    if (!gameId) return;

    setLoading(true);
    try {
      const response = await gameAPI.getGame(gameId);
      setGameState(response);
    } catch (error) {
      console.error("Failed to fetch game state:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RESULT:</Text>
      <View style={styles.resultBox}>
        <Text style={styles.resultText}>{result}</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#007bff" style={styles.loader} />}

      {gameState && (
        <View style={styles.gameStateBox}>
          <Text style={styles.gameStateTitle}>Game State:</Text>
          <Text style={styles.gameIdText}>Game ID: {gameState.gameId}</Text>
          <Text style={styles.playersTitle}>Players:</Text>
          {gameState.players?.map((player, index) => (
            <Text key={index} style={styles.playerText}>
              {player.name} - {player.role} {player.alive ? "✓" : "✗"}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchGameState}
        disabled={!gameId || loading}
      >
        <Text style={styles.refreshButtonText}>
          {loading ? "Loading..." : "Refresh Game State"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  resultBox: {
    width: "100%",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 16,
    textAlign: "center",
  },
  loader: {
    marginVertical: 20,
  },
  gameStateBox: {
    width: "100%",
    padding: 15,
    backgroundColor: "#e8f4f8",
    borderWidth: 1,
    borderColor: "#b3d9e6",
    borderRadius: 10,
    marginBottom: 20,
  },
  gameStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  gameIdText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  playerText: {
    fontSize: 14,
    marginVertical: 2,
    paddingLeft: 10,
  },
  refreshButton: {
    padding: 15,
    backgroundColor: "#28a745",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    padding: 15,
    backgroundColor: "#6c757d",
    borderRadius: 5,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});