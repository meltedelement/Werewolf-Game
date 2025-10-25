import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Werewolf Game Master</Text>
        <Text style={styles.subtitle}>Manage your Werewolf/Mafia games</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push("/game")}
        >
          <Text style={styles.menuButtonText}>🎮 New Game</Text>
          <Text style={styles.menuButtonSubtext}>Start a new game session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.menuButtonSecondary]}
          onPress={() => router.push("/roles")}
        >
          <Text style={styles.menuButtonText}>📋 Manage Roles</Text>
          <Text style={styles.menuButtonSubtext}>Create custom role lists</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#a0a0a0",
  },
  menu: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuButton: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: "#0f4c75",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuButtonSecondary: {
    borderColor: "#3282b8",
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  menuButtonSubtext: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
  },
});