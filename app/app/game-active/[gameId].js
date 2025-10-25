import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { gameAPI } from "../../services/api";

export default function GameActive() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams();

  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    try {
      const response = await gameAPI.getGame(gameId);
      setGameState(response);
    } catch (error) {
      Alert.alert("Error", `Failed to load game: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGameState();
  };

  const getRoleColor = (role) => {
    const werewolfRoles = ["Werewolf", "Cubwolf", "Mistwolf", "Hexwolf", "Sorceror", "Consort"];
    const townRoles = ["Seer", "Bodyguard", "Witch", "Deputy", "Vigilante", "Veteran", "Hunter", "Escort", "Trickster"];

    if (werewolfRoles.includes(role)) return "#ff4757";
    if (townRoles.includes(role)) return "#3282b8";
    return "#ffa502"; // Neutral
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3282b8" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  if (!gameState) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Failed to load game</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Active Game</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Text style={styles.refreshButton}>
              {refreshing ? "..." : "🔄"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.gameId}>Game ID: {gameId.substring(0, 8)}...</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Game Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Game Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{gameState.players.length}</Text>
              <Text style={styles.statLabel}>Total Players</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {gameState.players.filter((p) => p.alive).length}
              </Text>
              <Text style={styles.statLabel}>Alive</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {gameState.players.filter((p) => !p.alive).length}
              </Text>
              <Text style={styles.statLabel}>Dead</Text>
            </View>
          </View>
        </View>

        {/* Players List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players & Roles</Text>
          {gameState.players.map((player, index) => (
            <View
              key={index}
              style={[
                styles.playerCard,
                !player.alive && styles.playerCardDead,
              ]}
            >
              <View style={styles.playerInfo}>
                <Text style={[styles.playerName, !player.alive && styles.playerNameDead]}>
                  {player.name}
                  {!player.alive && " 💀"}
                </Text>
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: getRoleColor(player.role) },
                  ]}
                >
                  <Text style={styles.roleText}>{player.role}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              router.push({
                pathname: "/choice",
                params: {
                  gameId: gameId,
                  playerList: JSON.stringify(gameState.players.map((p) => p.name)),
                },
              });
            }}
          >
            <Text style={styles.actionButtonText}>🌙 Perform Night Action</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3282b8",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  refreshButton: {
    fontSize: 24,
    padding: 8,
  },
  gameId: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#3282b8",
  },
  statLabel: {
    fontSize: 12,
    color: "#a0a0a0",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  playerCard: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  playerCardDead: {
    opacity: 0.5,
    borderColor: "#666",
  },
  playerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playerName: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  playerNameDead: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: "#3282b8",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#a0a0a0",
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#ff4757",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3282b8",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
