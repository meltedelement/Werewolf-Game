import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { gameAPI, roleListAPI } from "../services/api";

export default function Game() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Role list selection
  const [showRoleListModal, setShowRoleListModal] = useState(false);
  const [roleLists, setRoleLists] = useState([]);
  const [selectedRoleList, setSelectedRoleList] = useState(null);

  useEffect(() => {
    loadRoleLists();
  }, []);

  const loadRoleLists = async () => {
    try {
      const lists = await roleListAPI.getAllRoleLists();
      setRoleLists(lists);
    } catch (error) {
      console.error("Error loading role lists:", error);
    }
  };

  const addPlayer = () => {
    if (newPlayerName.trim() === "") {
      Alert.alert("Error", "Please enter a player name");
      return;
    }
    if (players.includes(newPlayerName.trim())) {
      Alert.alert("Error", "Player name already exists");
      return;
    }
    setPlayers([...players, newPlayerName.trim()]);
    setNewPlayerName("");
    // Keep focus on input field
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const removePlayer = (playerToRemove) => {
    setPlayers(players.filter((player) => player !== playerToRemove));
  };

  const handleStartGame = async () => {
    console.log("Start Game button pressed");
    console.log("Number of players:", players.length);

    if (players.length < 3) {
      Alert.alert("Error", "You need at least 3 players to start a game");
      return;
    }

    setLoading(true);
    console.log("Creating game with players:", players);

    try {
      // Create game with selected role list if available
      console.log("Calling API...");
      let response;
      if (selectedRoleList) {
        // Convert role list to roleListItems format
        response = await gameAPI.createGame(players, selectedRoleList.roles, true);
      } else {
        // Create game with random roles
        response = await gameAPI.createGame(players, null, false);
      }
      console.log("API response received:", response);

      // Navigate immediately after successful creation
      console.log("Navigating to game-active");
      router.push(`/game-active/${response.gameId}`);
    } catch (error) {
      console.error("Error creating game:", error);
      Alert.alert("Error", `Failed to create game: ${error.message}`);
    } finally {
      setLoading(false);
      console.log("Loading complete");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Setup New Game</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Add Player Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Players</Text>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Enter player name"
              placeholderTextColor="#666"
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              onSubmitEditing={addPlayer}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Players List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Players ({players.length})
          </Text>
          {players.length === 0 ? (
            <Text style={styles.emptyText}>No players added yet</Text>
          ) : (
            <View style={styles.playersList}>
              {players.map((player, index) => (
                <View key={index} style={styles.playerItem}>
                  <Text style={styles.playerName}>{player}</Text>
                  <TouchableOpacity onPress={() => removePlayer(player)}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Role List Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role List (Optional)</Text>
          {selectedRoleList ? (
            <View style={styles.selectedRoleList}>
              <View style={styles.selectedRoleListInfo}>
                <Text style={styles.selectedRoleListName}>
                  {selectedRoleList.name}
                </Text>
                <Text style={styles.selectedRoleListDescription}>
                  {selectedRoleList.description}
                </Text>
                <Text style={styles.selectedRoleListCount}>
                  {selectedRoleList.roles.length} roles
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedRoleList(null)}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectRoleListButton}
              onPress={() => setShowRoleListModal(true)}
            >
              <Text style={styles.selectRoleListButtonText}>
                Select Role List
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.infoText}>
            {selectedRoleList
              ? "Using custom role list"
              : "Roles will be randomly assigned"}
          </Text>
        </View>

        {/* Game Info */}
        <View style={styles.section}>
          <Text style={styles.infoText}>
            Minimum 3 players required to start.
          </Text>
        </View>
      </ScrollView>

      {/* Start Game Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            (players.length < 3 || loading) && styles.startButtonDisabled,
          ]}
          onPress={handleStartGame}
          disabled={players.length < 3 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startButtonText}>Start Game</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Role List Selection Modal */}
      <Modal
        visible={showRoleListModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoleListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Role List</Text>
              <TouchableOpacity onPress={() => setShowRoleListModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {roleLists.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>
                    No role lists available
                  </Text>
                  <TouchableOpacity
                    style={styles.modalCreateButton}
                    onPress={() => {
                      setShowRoleListModal(false);
                      router.push("/roles");
                    }}
                  >
                    <Text style={styles.modalCreateButtonText}>
                      Create Role List
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                roleLists.map((list) => (
                  <TouchableOpacity
                    key={list.id}
                    style={styles.modalRoleListOption}
                    onPress={() => {
                      setSelectedRoleList(list);
                      setShowRoleListModal(false);
                    }}
                  >
                    <View>
                      <Text style={styles.modalRoleListName}>{list.name}</Text>
                      <Text style={styles.modalRoleListDescription}>
                        {list.description}
                      </Text>
                      <Text style={styles.modalRoleListCount}>
                        {list.roles.length} roles
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  addButton: {
    backgroundColor: "#3282b8",
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  playersList: {
    gap: 8,
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  playerName: {
    fontSize: 16,
    color: "#fff",
  },
  removeButton: {
    fontSize: 20,
    color: "#ff4757",
    paddingHorizontal: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  infoText: {
    fontSize: 14,
    color: "#a0a0a0",
    marginBottom: 8,
  },
  footer: {
    padding: 20,
  },
  startButton: {
    backgroundColor: "#3282b8",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  startButtonDisabled: {
    backgroundColor: "#2c3e50",
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  selectedRoleList: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3282b8",
  },
  selectedRoleListInfo: {
    flex: 1,
  },
  selectedRoleListName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  selectedRoleListDescription: {
    fontSize: 13,
    color: "#a0a0a0",
    marginBottom: 4,
  },
  selectedRoleListCount: {
    fontSize: 12,
    color: "#3282b8",
  },
  clearButton: {
    backgroundColor: "#ff4757",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectRoleListButton: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0f4c75",
    borderStyle: "dashed",
  },
  selectRoleListButtonText: {
    fontSize: 15,
    color: "#3282b8",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  modalClose: {
    fontSize: 24,
    color: "#a0a0a0",
    padding: 4,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalEmpty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  modalEmptyText: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
  },
  modalCreateButton: {
    backgroundColor: "#3282b8",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalCreateButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  modalRoleListOption: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  modalRoleListName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  modalRoleListDescription: {
    fontSize: 13,
    color: "#a0a0a0",
    marginBottom: 4,
  },
  modalRoleListCount: {
    fontSize: 12,
    color: "#3282b8",
  },
});
