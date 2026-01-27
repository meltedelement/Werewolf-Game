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
import { gameAPI, roleListAPI, playerPresetAPI } from "../services/api";
import { ROLE_CATEGORIES, ROLE_CATEGORY_MAPPINGS, getRoleCategoryColor, formatCategoryForDisplay } from "../constants/roleCategories";

export default function Game() {
  const router = useRouter();
  const [players, setPlayers] = useState([]); // Array of {name: string, role: string}
  const [newPlayerName, setNewPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Role list selection
  const [selectedRoleList, setSelectedRoleList] = useState(null); // Selected role list object
  const [workingRoles, setWorkingRoles] = useState([]); // Modified roles before applying
  const [showRoleListModal, setShowRoleListModal] = useState(false);
  const [showEditRolesModal, setShowEditRolesModal] = useState(false);
  const [roleLists, setRoleLists] = useState([]);
  const [roleListsLoading, setRoleListsLoading] = useState(false);

  // Player preset selection
  const [showPlayerPresetModal, setShowPlayerPresetModal] = useState(false);
  const [playerPresets, setPlayerPresets] = useState([]);
  const [playerPresetsLoading, setPlayerPresetsLoading] = useState(false);

  // Role assignment
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(null);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  // All available roles grouped by category (using Java enum format)
  // Note: Pestilence is excluded as it's a transformation of Plaguebearer, not a starting role
  const AVAILABLE_ROLES = {
    "TOWN_INVESTIGATIVE": [
      "Seer", "Apprentice_Seer", "Aura_Seer", "Ghost",
      "Private_Investigator", "Clockmaker", "Tracker", "Lookout", "Empath"
    ],
    "TOWN_PROTECTIVE": ["Bodyguard", "Witch", "Escort", "Trickster"],
    "TOWN_KILLING": ["Deputy", "Vigilante", "Veteran", "Hunter"],
    "TOWN_NEGATIVE": ["Cupid", "Lycan", "Cursed"],
    "TOWN": [
      // Any Town category includes all specific town roles, but NOT Villager
      "Seer", "Apprentice_Seer", "Aura_Seer", "Ghost",
      "Private_Investigator", "Clockmaker", "Tracker", "Lookout", "Empath",
      "Bodyguard", "Witch", "Escort", "Trickster",
      "Deputy", "Vigilante", "Veteran", "Hunter",
      "Cupid", "Lycan", "Cursed"
    ],
    "VILLAGER": ["Villager"], // Villager as its own category for manual assignment only
    "WEREWOLF": ["Werewolf", "Sorceror", "Cubwolf", "Hexwolf", "Mistwolf", "Consort"],
    "NEUTRAL_BENIGN": ["Doppelganger", "Tanner", "Executioner"],
    "NEUTRAL_APOCALYPSE": ["Arsonist", "Serial_Killer", "Plaguebearer", "Grave_Digger", "Doom_sayer"]
  };

  // Flatten roles for searching
  const allRoles = Object.values(AVAILABLE_ROLES).flat();

  // Load role lists and player presets on mount
  useEffect(() => {
    loadRoleLists();
    loadPlayerPresets();
  }, []);

  const loadRoleLists = async () => {
    try {
      setRoleListsLoading(true);
      const lists = await roleListAPI.getAllRoleLists();
      setRoleLists(lists);
    } catch (error) {
      console.error("Error loading role lists:", error);
      Alert.alert("Error", `Failed to load role lists: ${error.message}`);
    } finally {
      setRoleListsLoading(false);
    }
  };

  const loadPlayerPresets = async () => {
    try {
      setPlayerPresetsLoading(true);
      const presets = await playerPresetAPI.getAllPresets();
      setPlayerPresets(presets);
    } catch (error) {
      console.error("Error loading player presets:", error);
      Alert.alert("Error", `Failed to load player presets: ${error.message}`);
    } finally {
      setPlayerPresetsLoading(false);
    }
  };

  // Handle role list selection
  const handleSelectRoleList = (roleList) => {
    setSelectedRoleList(roleList);
    // Convert role list items to working format
    const roles = roleList.roles.flatMap(item => {
      if (item.type === "SPECIFIC") {
        return Array(item.count).fill(item.value);
      } else if (item.type === "CATEGORY") {
        // For categories, just add a placeholder - will be resolved later
        return Array(item.count).fill({ category: item.value, type: "CATEGORY" });
      }
      return [];
    });
    setWorkingRoles(roles);
    setShowRoleListModal(false);
    // Immediately show edit modal to allow modifications
    setTimeout(() => setShowEditRolesModal(true), 300);
  };

  // Resolve category placeholders to random specific roles
  // Returns array of { role: string, fromCategory: boolean, category: string }
  const resolveCategoriesToRoles = (roles) => {
    const usedRoles = new Set(); // Track already-used roles to prevent duplicates

    return roles.map(role => {
      if (typeof role === 'object' && role.category) {
        // Find roles in this category (now using same format as backend)
        const categoryRoles = AVAILABLE_ROLES[role.category];
        if (categoryRoles && categoryRoles.length > 0) {
          // Filter out already-used roles (Villager can be reused)
          const availableRoles = categoryRoles.filter(r =>
            r === "Villager" || !usedRoles.has(r)
          );

          // If no roles available, fall back to Villager
          if (availableRoles.length === 0) {
            return { role: "Villager", fromCategory: true, category: role.category };
          }

          // Pick a random role from available roles
          const randomIndex = Math.floor(Math.random() * availableRoles.length);
          const selectedRole = availableRoles[randomIndex];

          // Track non-Villager roles to prevent duplicates
          if (selectedRole !== "Villager") {
            usedRoles.add(selectedRole);
          }

          return { role: selectedRole, fromCategory: true, category: role.category };
        }
        // Fallback to Villager if category not found
        console.warn(`Category not found: ${role.category}`);
        return { role: "Villager", fromCategory: true, category: role.category };
      }

      // Track specific roles as well
      if (typeof role === 'string' && role !== "Villager") {
        usedRoles.add(role);
      }

      return { role: role, fromCategory: false, category: null };
    });
  };

  // Shuffle array randomly (Fisher-Yates shuffle)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Apply working roles to players
  const applyRolesToPlayers = () => {
    if (players.length !== workingRoles.length) {
      Alert.alert(
        "Mismatch",
        `You have ${players.length} players but ${workingRoles.length} roles. Please adjust.`
      );
      return;
    }

    // Resolve any category placeholders to specific roles
    // Returns array of { role: string, fromCategory: boolean, category: string }
    const resolvedRoles = resolveCategoriesToRoles(workingRoles);

    // Shuffle the roles randomly
    const shuffledRoles = shuffleArray(resolvedRoles);

    // Assign shuffled roles to players
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      role: shuffledRoles[index].role,
      roleFromCategory: shuffledRoles[index].fromCategory,
      roleCategory: shuffledRoles[index].category, // Track the original category
    }));

    setPlayers(updatedPlayers);
    setShowEditRolesModal(false);
    Alert.alert("Success", "Roles randomly assigned to players!");
  };

  // Clear role list selection
  const clearRoleList = () => {
    setSelectedRoleList(null);
    setWorkingRoles([]);
  };

  // Handle player preset selection
  const handleSelectPlayerPreset = (preset) => {
    // Add all names from preset to players list
    const newPlayers = preset.playerNames.map(name => ({
      name: name,
      role: null,
      roleFromCategory: false,
      roleCategory: null
    }));
    setPlayers(newPlayers);
    setShowPlayerPresetModal(false);
    Alert.alert("Success", `Added ${preset.playerNames.length} players from preset "${preset.name}"`);
  };

  // Add a role to working roles
  const addWorkingRole = (role) => {
    setWorkingRoles([...workingRoles, role]);
  };

  // Remove a role from working roles
  const removeWorkingRole = (index) => {
    setWorkingRoles(workingRoles.filter((_, i) => i !== index));
  };

  // Replace a role in working roles
  const replaceWorkingRole = (index, newRole) => {
    const updated = [...workingRoles];
    updated[index] = newRole;
    setWorkingRoles(updated);
  };

  // Rerandomise a single player's role
  const rerandomisePlayerRole = (playerIndex) => {
    const player = players[playerIndex];

    // Only rerandomise if the role came from a category
    if (!player.role || !player.roleFromCategory || !player.roleCategory) {
      return;
    }

    // Get available roles from the ORIGINAL category only
    const categoryRoles = AVAILABLE_ROLES[player.roleCategory];
    if (!categoryRoles || categoryRoles.length === 0) {
      return;
    }

    // Track already-used roles by other players (except Villager)
    const usedRoles = new Set();
    players.forEach((p, i) => {
      if (i !== playerIndex && p.role && p.role !== "Villager") {
        usedRoles.add(p.role);
      }
    });

    // Filter out already-used roles (Villager can be reused)
    const availableRoles = categoryRoles.filter(r =>
      r === "Villager" || !usedRoles.has(r)
    );

    // If no roles available, fall back to Villager
    if (availableRoles.length === 0) {
      const updatedPlayers = [...players];
      updatedPlayers[playerIndex] = {
        ...player,
        role: "Villager",
        roleFromCategory: true,
        roleCategory: player.roleCategory // Keep original category
      };
      setPlayers(updatedPlayers);
      return;
    }

    // Pick a random role from available roles
    const randomIndex = Math.floor(Math.random() * availableRoles.length);
    const selectedRole = availableRoles[randomIndex];

    // Update player's role (keep roleFromCategory and roleCategory)
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex] = {
      ...player,
      role: selectedRole,
      roleFromCategory: true,
      roleCategory: player.roleCategory // Keep original category
    };
    setPlayers(updatedPlayers);
  };

  // Rerandomise all players' roles (reshuffle)
  const rerandomiseAllPlayerRoles = () => {
    // Filter players who have category roles
    const categoryRolePlayers = players.filter(p => p.role && p.roleFromCategory);

    // If no category roles, do nothing
    if (categoryRolePlayers.length === 0) {
      Alert.alert(
        "Cannot Rerandomise",
        "No category roles found to rerandomise."
      );
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      "Rerandomise All Roles",
      `This will shuffle all ${categoryRolePlayers.length} role(s) that were assigned from categories. Continue?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Rerandomise",
          onPress: () => {
            // Get all category roles with their indices and categories
            const categoryRoleData = players
              .map((p, index) => ({
                role: p.role,
                roleFromCategory: p.roleFromCategory,
                roleCategory: p.roleCategory,
                index
              }))
              .filter(data => data.role && data.roleFromCategory);

            // Extract just the roles
            const rolesToShuffle = categoryRoleData.map(data => data.role);

            // Shuffle the roles
            const shuffledRoles = shuffleArray(rolesToShuffle);

            // Create updated players array
            const updatedPlayers = [...players];
            categoryRoleData.forEach((data, i) => {
              updatedPlayers[data.index] = {
                ...updatedPlayers[data.index],
                role: shuffledRoles[i],
                roleFromCategory: true, // Preserve category flag
                roleCategory: categoryRoleData[i].roleCategory // Preserve original category
              };
            });

            setPlayers(updatedPlayers);
          }
        }
      ]
    );
  };

  // Filter roles based on search
  const getFilteredRoles = () => {
    if (!roleSearchQuery.trim()) return AVAILABLE_ROLES;

    const query = roleSearchQuery.toLowerCase();
    const filtered = {};

    Object.entries(AVAILABLE_ROLES).forEach(([category, roles]) => {
      const matchingRoles = roles.filter(role =>
        role.toLowerCase().replace(/_/g, ' ').includes(query)
      );
      if (matchingRoles.length > 0) {
        filtered[category] = matchingRoles;
      }
    });

    return filtered;
  };

  const addPlayer = () => {
    if (newPlayerName.trim() === "") {
      Alert.alert("Error", "Please enter a player name");
      return;
    }
    if (players.some(p => p.name === newPlayerName.trim())) {
      Alert.alert("Error", "Player name already exists");
      return;
    }
    setPlayers([...players, { name: newPlayerName.trim(), role: null, roleFromCategory: false, roleCategory: null }]);
    setNewPlayerName("");
    // Keep focus on input field
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const removePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const assignRole = (index, role) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].role = role;
    updatedPlayers[index].roleFromCategory = false; // Manually assigned roles cannot be rerandomised
    updatedPlayers[index].roleCategory = null; // No category for manually assigned roles
    setPlayers(updatedPlayers);
    setShowRoleModal(false);
    setCurrentPlayerIndex(null);
    setRoleSearchQuery(""); // Clear search when closing
  };

  const handleStartGame = async () => {
    if (players.length < 3) {
      Alert.alert("Error", "You need at least 3 players to start a game");
      return;
    }

    // Check if all players have roles assigned
    const unassignedPlayers = players.filter(p => !p.role);
    if (unassignedPlayers.length > 0) {
      Alert.alert(
        "Roles Not Assigned",
        `Please assign roles to: ${unassignedPlayers.map(p => p.name).join(", ")}`,
      );
      return;
    }

    setLoading(true);

    try {
      // Create game with manual role assignments
      const response = await gameAPI.createGameWithRoles(players);

      // Navigate to game
      router.push(`/game-active/${response.gameId}`);
    } catch (error) {
      console.error("Error creating game:", error);

      // Extract user-friendly error message
      let errorMessage = "Failed to create game";

      // Try to parse the error message from the response
      if (error.message) {
        try {
          // Check if error message contains JSON response
          const jsonMatch = error.message.match(/\{.*\}/s);
          if (jsonMatch) {
            const errorData = JSON.parse(jsonMatch[0]);
            if (errorData.message) {
              // Extract the actual error message (remove "Failed to create game: " prefix if present)
              errorMessage = errorData.message.replace(/^Failed to create game: /, "");
            }
          } else {
            errorMessage = error.message;
          }
        } catch (parseError) {
          errorMessage = error.message;
        }
      }

      Alert.alert("Cannot Create Game", errorMessage);
    } finally {
      setLoading(false);
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
        {/* Role List Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role List</Text>
          {selectedRoleList ? (
            <View style={styles.selectedRoleList}>
              <View style={styles.selectedRoleListInfo}>
                <Text style={styles.selectedRoleListName}>
                  {selectedRoleList.name}
                </Text>
                {selectedRoleList.description && (
                  <Text style={styles.selectedRoleListDescription}>
                    {selectedRoleList.description}
                  </Text>
                )}
                <Text style={styles.selectedRoleListCount}>
                  {workingRoles.length} roles selected
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={styles.editRoleListButton}
                  onPress={() => setShowEditRolesModal(true)}
                >
                  <Text style={styles.editRoleListButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearRoleList}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectRoleListButton}
              onPress={() => setShowRoleListModal(true)}
            >
              <Text style={styles.selectRoleListButtonText}>
                📋 Select a Role List
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Add Player Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Players</Text>

          {/* Load from preset button */}
          <TouchableOpacity
            style={styles.loadPresetButton}
            onPress={() => setShowPlayerPresetModal(true)}
          >
            <Text style={styles.loadPresetButtonText}>
              👥 Load from Preset
            </Text>
          </TouchableOpacity>

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

        {/* Players List with Role Assignment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Players & Roles ({players.length})
          </Text>
          {players.length === 0 ? (
            <Text style={styles.emptyText}>No players added yet</Text>
          ) : (
            <View style={styles.playersList}>
              {players.map((player, index) => {
                const roleColor = player.role ? getRoleCategoryColor(player.role) : null;
                return (
                  <View key={index} style={styles.playerItem}>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <TouchableOpacity
                        style={[
                          styles.roleButton,
                          player.role && styles.roleButtonAssigned,
                          player.role && { backgroundColor: roleColor + '40', borderColor: roleColor },
                        ]}
                        onPress={() => {
                          setCurrentPlayerIndex(index);
                          setShowRoleModal(true);
                        }}
                      >
                        <Text
                          style={[
                            styles.roleButtonText,
                            player.role && styles.roleButtonTextAssigned,
                          ]}
                        >
                          {player.role ? player.role.replace(/_/g, " ") : "Assign Role"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.playerActions}>
                      {/* Rerandomise button - only shown if role came from a category */}
                      {player.role && player.roleFromCategory && (
                        <TouchableOpacity
                          style={styles.playerRerandomiseButton}
                          onPress={() => rerandomisePlayerRole(index)}
                        >
                          <Text style={styles.playerRerandomiseButtonText}>🔄</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => removePlayer(index)}>
                        <Text style={styles.removeButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {/* Rerandomise All button - only shown if at least one player has a category role */}
              {players.some(p => p.role && p.roleFromCategory) && (
                <TouchableOpacity
                  style={styles.rerandomiseAllPlayersButton}
                  onPress={rerandomiseAllPlayerRoles}
                >
                  <Text style={styles.rerandomiseAllPlayersButtonText}>🔄 Rerandomise All Roles</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Game Info */}
        <View style={styles.section}>
          <Text style={styles.infoText}>
            Assign roles to all players before starting. Minimum 3 players required.
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

      {/* Role Selection Modal */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowRoleModal(false);
          setCurrentPlayerIndex(null);
          setRoleSearchQuery("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Role for {currentPlayerIndex !== null ? players[currentPlayerIndex]?.name : ""}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowRoleModal(false);
                  setCurrentPlayerIndex(null);
                  setRoleSearchQuery("");
                }}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.modalSearchContainer}>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search roles..."
                placeholderTextColor="#666"
                value={roleSearchQuery}
                onChangeText={setRoleSearchQuery}
              />
            </View>

            <ScrollView style={styles.modalScroll}>
              {Object.entries(getFilteredRoles()).map(([category, roles]) => {
                const categoryColor = ROLE_CATEGORIES[category]?.color || "#3282b8";
                return (
                  <View key={category} style={styles.roleCategoryContainer}>
                    <Text style={[styles.roleCategoryTitle, { color: categoryColor }]}>
                      {formatCategoryForDisplay(category)}
                    </Text>
                    <View style={styles.roleGrid}>
                      {roles.map((role) => {
                        const roleColor = getRoleCategoryColor(role);
                        return (
                          <TouchableOpacity
                            key={role}
                            style={[
                              styles.roleOption,
                              { backgroundColor: roleColor + '40', borderColor: roleColor }
                            ]}
                            onPress={() => assignRole(currentPlayerIndex, role)}
                          >
                            <Text style={styles.roleOptionText}>
                              {role.replace(/_/g, " ")}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
              {roleListsLoading ? (
                <View style={styles.modalEmpty}>
                  <ActivityIndicator size="large" color="#3282b8" />
                </View>
              ) : roleLists.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>No role lists saved yet</Text>
                  <TouchableOpacity
                    style={styles.modalCreateButton}
                    onPress={() => {
                      setShowRoleListModal(false);
                      router.push("/role-editor/new");
                    }}
                  >
                    <Text style={styles.modalCreateButtonText}>
                      Create First Role List
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                roleLists.map((roleList) => (
                  <TouchableOpacity
                    key={roleList.id}
                    style={styles.modalRoleListOption}
                    onPress={() => handleSelectRoleList(roleList)}
                  >
                    <Text style={styles.modalRoleListName}>{roleList.name}</Text>
                    {roleList.description && (
                      <Text style={styles.modalRoleListDescription}>
                        {roleList.description}
                      </Text>
                    )}
                    <Text style={styles.modalRoleListCount}>
                      {roleList.roles.reduce((sum, item) => sum + item.count, 0)}{" "}
                      roles
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Roles Modal */}
      <Modal
        visible={showEditRolesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditRolesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit Roles ({workingRoles.length})
              </Text>
              <TouchableOpacity onPress={() => setShowEditRolesModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.editRolesInfo}>
              <Text style={styles.editRolesInfoText}>
                You have {players.length} player(s) and {workingRoles.length} role(s).
                {players.length !== workingRoles.length && " ⚠️ Numbers should match!"}
              </Text>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Current roles list */}
              <View style={styles.workingRolesList}>
                {workingRoles.map((role, index) => {
                  let roleDisplay, roleColor;

                  if (typeof role === 'string') {
                    // Specific role
                    roleDisplay = role.replace(/_/g, " ");
                    roleColor = getRoleCategoryColor(role);
                  } else if (role.category) {
                    // Category placeholder (using enum format)
                    roleDisplay = formatCategoryForDisplay(role.category);
                    roleColor = ROLE_CATEGORIES[role.category]?.color || "#666";
                  } else {
                    // Fallback
                    roleDisplay = "Unknown";
                    roleColor = "#666";
                  }

                  return (
                    <View key={index} style={styles.workingRoleItem}>
                      <View style={styles.workingRoleInfo}>
                        <Text style={styles.workingRoleIndex}>{index + 1}.</Text>
                        <View
                          style={[
                            styles.workingRoleBadge,
                            { backgroundColor: roleColor + '40', borderColor: roleColor }
                          ]}
                        >
                          <Text style={styles.workingRoleName}>{roleDisplay}</Text>
                        </View>
                      </View>
                      <View style={styles.workingRoleActions}>
                        <TouchableOpacity
                          style={styles.workingRoleChangeButton}
                          onPress={() => {
                            setCurrentPlayerIndex(index);
                            setShowRoleModal(true);
                          }}
                        >
                          <Text style={styles.workingRoleChangeButtonText}>Change</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.workingRoleRemoveButton}
                          onPress={() => removeWorkingRole(index)}
                        >
                          <Text style={styles.workingRoleRemoveButtonText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Add role button */}
              <TouchableOpacity
                style={styles.addRoleToListButton}
                onPress={() => {
                  setCurrentPlayerIndex(workingRoles.length);
                  setShowRoleModal(true);
                }}
              >
                <Text style={styles.addRoleToListButtonText}>+ Add Another Role</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Apply button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.applyRolesButton,
                  players.length !== workingRoles.length && styles.applyRolesButtonDisabled
                ]}
                onPress={applyRolesToPlayers}
                disabled={players.length !== workingRoles.length}
              >
                <Text style={styles.applyRolesButtonText}>
                  Apply Roles to Players
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Role Selection Modal (for changing working roles) */}
      {showRoleModal && showEditRolesModal && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowRoleModal(false);
            setCurrentPlayerIndex(null);
            setRoleSearchQuery("");
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {currentPlayerIndex < workingRoles.length ? "Change Role" : "Select Role to Add"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowRoleModal(false);
                    setCurrentPlayerIndex(null);
                    setRoleSearchQuery("");
                  }}
                >
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalSearchContainer}>
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search roles..."
                  placeholderTextColor="#666"
                  value={roleSearchQuery}
                  onChangeText={setRoleSearchQuery}
                />
              </View>

              <ScrollView style={styles.modalScroll}>
                {Object.entries(getFilteredRoles()).map(([category, roles]) => {
                  const categoryColor = ROLE_CATEGORIES[category]?.color || "#3282b8";
                  return (
                    <View key={category} style={styles.roleCategoryContainer}>
                      <Text style={[styles.roleCategoryTitle, { color: categoryColor }]}>
                        {formatCategoryForDisplay(category)}
                      </Text>
                      <View style={styles.roleGrid}>
                        {roles.map((role) => {
                          const roleColor = getRoleCategoryColor(role);
                          return (
                            <TouchableOpacity
                              key={role}
                              style={[
                                styles.roleOption,
                                { backgroundColor: roleColor + '40', borderColor: roleColor }
                              ]}
                              onPress={() => {
                                if (currentPlayerIndex < workingRoles.length) {
                                  replaceWorkingRole(currentPlayerIndex, role);
                                } else {
                                  addWorkingRole(role);
                                }
                                setShowRoleModal(false);
                                setCurrentPlayerIndex(null);
                                setRoleSearchQuery("");
                              }}
                            >
                              <Text style={styles.roleOptionText}>
                                {role.replace(/_/g, " ")}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Player Preset Selection Modal */}
      <Modal
        visible={showPlayerPresetModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlayerPresetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Player Preset</Text>
              <TouchableOpacity onPress={() => setShowPlayerPresetModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {playerPresetsLoading ? (
                <View style={styles.modalEmpty}>
                  <ActivityIndicator size="large" color="#3282b8" />
                </View>
              ) : playerPresets.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>No player presets saved yet</Text>
                  <TouchableOpacity
                    style={styles.modalCreateButton}
                    onPress={() => {
                      setShowPlayerPresetModal(false);
                      router.push("/player-preset-editor/new");
                    }}
                  >
                    <Text style={styles.modalCreateButtonText}>
                      Create First Preset
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                playerPresets.map((preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={styles.modalRoleListOption}
                    onPress={() => handleSelectPlayerPreset(preset)}
                  >
                    <Text style={styles.modalRoleListName}>{preset.name}</Text>
                    {preset.description && (
                      <Text style={styles.modalRoleListDescription}>
                        {preset.description}
                      </Text>
                    )}
                    <Text style={styles.modalRoleListCount}>
                      {preset.playerNames.length} players
                    </Text>
                    <View style={styles.presetPlayerNamePreview}>
                      {preset.playerNames.slice(0, 3).map((name, index) => (
                        <Text key={index} style={styles.presetPlayerNameText}>
                          • {name}
                        </Text>
                      ))}
                      {preset.playerNames.length > 3 && (
                        <Text style={styles.presetPlayerNameText}>
                          ... and {preset.playerNames.length - 3} more
                        </Text>
                      )}
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
  playerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playerName: {
    fontSize: 16,
    color: "#fff",
    minWidth: 100,
  },
  roleButton: {
    backgroundColor: "#0f4c75",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#0f4c75",
    borderStyle: "dashed",
  },
  roleButtonAssigned: {
    backgroundColor: "#3282b8",
    borderColor: "#3282b8",
    borderStyle: "solid",
  },
  roleButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  roleButtonTextAssigned: {
    color: "#fff",
    fontWeight: "600",
  },
  removeButton: {
    fontSize: 20,
    color: "#ff4757",
    paddingHorizontal: 8,
  },
  playerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playerRerandomiseButton: {
    backgroundColor: "#27ae60",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  playerRerandomiseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  rerandomiseAllPlayersButton: {
    backgroundColor: "#27ae60",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  rerandomiseAllPlayersButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  modalSearchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalSearchInput: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  roleCategoryContainer: {
    marginBottom: 24,
  },
  roleCategoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleOption: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#0f4c75",
    minWidth: "30%",
    alignItems: "center",
  },
  roleOptionText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  editRoleListButton: {
    backgroundColor: "#3282b8",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editRoleListButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  editRolesInfo: {
    backgroundColor: "#16213e",
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  editRolesInfoText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  workingRolesList: {
    gap: 8,
    marginBottom: 16,
  },
  workingRoleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  workingRoleInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  workingRoleIndex: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    minWidth: 24,
  },
  workingRoleBadge: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
  },
  workingRoleName: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  workingRoleActions: {
    flexDirection: "row",
    gap: 6,
  },
  workingRoleChangeButton: {
    backgroundColor: "#3282b8",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  workingRoleChangeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  workingRoleRemoveButton: {
    backgroundColor: "#c23616",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  workingRoleRemoveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  addRoleToListButton: {
    backgroundColor: "#0f4c75",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3282b8",
    borderStyle: "dashed",
  },
  addRoleToListButtonText: {
    color: "#3282b8",
    fontSize: 14,
    fontWeight: "600",
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#0f4c75",
  },
  applyRolesButton: {
    backgroundColor: "#3282b8",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  applyRolesButtonDisabled: {
    backgroundColor: "#2c3e50",
    opacity: 0.5,
  },
  applyRolesButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadPresetButton: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3282b8",
    marginBottom: 12,
  },
  loadPresetButtonText: {
    fontSize: 15,
    color: "#3282b8",
    fontWeight: "600",
  },
  presetPlayerNamePreview: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#0f4c75",
  },
  presetPlayerNameText: {
    fontSize: 12,
    color: "#a0a0a0",
    marginBottom: 2,
  },
});
