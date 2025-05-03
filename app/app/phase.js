import React, { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Phase() {
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Placeholder data for now
  const playerRole = "Sarah - Werewolf"; // This will be dynamically passed later
  const playerList = ["James", "Anna", "Ciaran", "Yasmin", "April", "Skye"];
  const optionsNeeded = 2; // This will also be dynamically passed later

  const handleOptionToggle = (player) => {
    if (selectedOptions.includes(player)) {
      setSelectedOptions((prev) => prev.filter((option) => option !== player));
    } else if (selectedOptions.length < optionsNeeded) {
      setSelectedOptions((prev) => [...prev, player]);
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length === optionsNeeded) {
      Alert.alert("Selection Submitted", `You selected: ${selectedOptions.join(", ")}`);
    } else {
      Alert.alert("Invalid Selection", `Please select exactly ${optionsNeeded} options.`);
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
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
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
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});