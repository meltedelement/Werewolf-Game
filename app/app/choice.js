import React, { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { gameAPI } from "../services/api";

export default function Choice() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get data from navigation params or use placeholder
  const gameId = params.gameId || "test-game";
  const playerRole = params.playerRole || "Sarah - Werewolf";
  const playerList = params.playerList ? JSON.parse(params.playerList) : ["James", "Anna", "Ciaran", "Yasmin", "April", "Skye"];
  const optionsNeeded = params.optionsNeeded ? parseInt(params.optionsNeeded) : 2;

  const handleOptionToggle = (player) => {
    if (selectedOptions.includes(player)) {
      setSelectedOptions((prev) => prev.filter((option) => option !== player));
    } else if (selectedOptions.length < optionsNeeded) {
      setSelectedOptions((prev) => [...prev, player]);
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length !== optionsNeeded) {
      Alert.alert("Invalid Selection", `Please select exactly ${optionsNeeded} options.`);
      return;
    }

    setLoading(true);
    try {
      // Extract role from playerRole string (e.g., "Sarah - Werewolf" -> "WEREWOLF")
      const role = playerRole.split(" - ")[1]?.toUpperCase() || "WEREWOLF";

      // Call API to perform night action
      const response = await gameAPI.performNightAction(gameId, role, selectedOptions);

      if (response.success) {
        Alert.alert(
          "Action Submitted",
          `You selected: ${selectedOptions.join(", ")}\n\n${response.message}`,
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to result screen with the response
                router.push({
                  pathname: "/result",
                  params: {
                    gameId: gameId,
                    result: response.result || "Action completed successfully"
                  }
                });
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", response.message || "Failed to submit action");
      }
    } catch (error) {
      console.error("Failed to submit action:", error);
      Alert.alert("Error", `Failed to submit action: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Action Phase for:</Text>
      <Text style={styles.role}>{playerRole}</Text>
      <Text style={styles.instructions}>Choose {optionsNeeded} number of options:</Text>
      <Text style={styles.subTitle}>Player List:</Text>
      <FlatList
        data={playerList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.option,
              selectedOptions.includes(item) ? styles.selectedOption : null,
            ]}
            onPress={() => handleOptionToggle(item)}
            disabled={
              selectedOptions.length >= optionsNeeded &&
              !selectedOptions.includes(item)
            }
          >
            <Text style={styles.optionText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit</Text>
        )}
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
    marginBottom: 10,
  },
  role: {
    fontSize: 20,
    color: "#555",
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  option: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: "#cce5ff",
  },
  optionText: {
    fontSize: 16,
  },
  submitButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});