import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { gameAPI } from "../../services/api";
import { getRoleCategoryColor } from "../../constants/roleCategories";

export default function GameActive() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams();

  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Day phase management
  const [showLynchModal, setShowLynchModal] = useState(false);
  const [lynchedPlayer, setLynchedPlayer] = useState(null);

  // Deputy action
  const [showDeputyModal, setShowDeputyModal] = useState(false);
  const [deputyTarget, setDeputyTarget] = useState(null);

  // Hunter revenge
  const [showHunterRevengeModal, setShowHunterRevengeModal] = useState(false);
  const [hunterName, setHunterName] = useState(null);
  const [hunterTarget, setHunterTarget] = useState(null);

  // Tanner revenge
  const [showTannerRevengeModal, setShowTannerRevengeModal] = useState(false);
  const [tannerName, setTannerName] = useState(null);
  const [tannerTarget, setTannerTarget] = useState(null);

  // Resolution results
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionData, setResolutionData] = useState(null);

  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    try {
      const response = await gameAPI.getGameState(gameId);
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

  const getPhaseDisplay = (phase) => {
    switch (phase) {
      case "NIGHT_ONE": return "🌙 Night 1";
      case "NIGHT": return "🌙 Night";
      case "DAY": return "☀️ Day";
      case "GAME_OVER": return "🏁 Game Over";
      default: return phase;
    }
  };

  const handleStartNight = async () => {
    try {
      setLoading(true);
      await gameAPI.startNight(gameId);
      await loadGameState();
      Alert.alert("Success", "Night phase started");
    } catch (error) {
      Alert.alert("Error", `Failed to start night: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUndoAction = async (actionId) => {
    try {
      await gameAPI.undoAction(gameId, actionId);
      Alert.alert("Success", "Action undone");
      await loadGameState();
    } catch (error) {
      Alert.alert("Error", `Failed to undo action: ${error.message}`);
    }
  };

  const handleResolveNight = async () => {
    Alert.alert(
      "Resolve Night",
      "Process all night actions and advance to day?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Resolve",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await gameAPI.resolveNight(gameId);
              console.log("Resolution response:", JSON.stringify(response, null, 2));
              setResolutionData(response);
              setShowResolutionModal(true);
              await loadGameState();
            } catch (error) {
              console.error("Resolution error:", error);
              Alert.alert("Error", `Failed to resolve night: ${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleResolveDay = async () => {
    setShowLynchModal(true);
  };

  const handleConfirmLynch = async () => {
    try {
      setLoading(true);
      const response = await gameAPI.resolveDay(gameId, {
        lynchedPlayerName: lynchedPlayer
      });

      setShowLynchModal(false);
      setLynchedPlayer(null);

      // Check for revenge kills and wins
      if (response.tannerRevenge) {
        setTannerName(response.tannerName);
        setShowTannerRevengeModal(true);
      } else if (response.hunterRevenge) {
        setHunterName(response.hunterName);
        setShowHunterRevengeModal(true);
      } else {
        // Show any win conditions but don't end game
        let message = response.message || "Day phase resolved";
        if (response.tannerWon) {
          message = "Tanner win condition met! " + message;
        }
        if (response.executionerWin) {
          message = "Executioner win condition met! " + message;
        }
        Alert.alert("Success", message);
      }

      await loadGameState();
    } catch (error) {
      Alert.alert("Error", `Failed to resolve day: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeputyShoot = async () => {
    if (!deputyTarget) {
      Alert.alert("Error", "Please select a target");
      return;
    }

    try {
      setLoading(true);
      const response = await gameAPI.deputyShoot(gameId, deputyTarget);

      setShowDeputyModal(false);
      setDeputyTarget(null);

      // Check for Hunter revenge
      if (response.hunterRevenge) {
        setHunterName(response.hunterName);
        setShowHunterRevengeModal(true);
      } else {
        Alert.alert("Deputy Shot", response.events.join("\n"));
      }

      await loadGameState();
    } catch (error) {
      Alert.alert("Error", `Failed to shoot: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleHunterRevenge = async () => {
    if (!hunterTarget) {
      Alert.alert("Error", "Please select a target");
      return;
    }

    try {
      setLoading(true);
      const response = await gameAPI.hunterRevenge(gameId, hunterName, hunterTarget);

      setShowHunterRevengeModal(false);
      setHunterName(null);
      setHunterTarget(null);

      // Check for chain Hunter revenge
      if (response.chainHunterRevenge) {
        setHunterName(response.chainHunterName);
        setShowHunterRevengeModal(true);
      } else {
        Alert.alert("Hunter Revenge", response.events.join("\n"));
      }

      await loadGameState();
    } catch (error) {
      Alert.alert("Error", `Failed to execute revenge: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTannerRevenge = async () => {
    if (!tannerTarget) {
      Alert.alert("Error", "Please select a target");
      return;
    }

    try {
      setLoading(true);
      const response = await gameAPI.tannerRevenge(gameId, tannerName, tannerTarget);

      setShowTannerRevengeModal(false);
      setTannerName(null);
      setTannerTarget(null);

      // Check for Hunter revenge (if Tanner killed Hunter)
      if (response.hunterRevenge) {
        setHunterName(response.hunterName);
        setShowHunterRevengeModal(true);
      } else {
        Alert.alert("Tanner Revenge", response.events.join("\n"));
      }

      await loadGameState();
    } catch (error) {
      Alert.alert("Error", `Failed to execute revenge: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

  const alivePlayers = gameState.players.filter(p => p.alive);
  const deadPlayers = gameState.players.filter(p => !p.alive);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Game Master</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Text style={styles.refreshButton}>
              {refreshing ? "..." : "🔄"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.gameId}>ID: {gameId.substring(0, 8)}...</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Phase Info */}
        <View style={styles.phaseCard}>
          <Text style={styles.phaseTitle}>{getPhaseDisplay(gameState.currentPhase)}</Text>
          <View style={styles.phaseStats}>
            <Text style={styles.phaseStatText}>Day {gameState.dayNumber}</Text>
            <Text style={styles.phaseStatText}>•</Text>
            <Text style={styles.phaseStatText}>Night {gameState.nightNumber}</Text>
          </View>
          {gameState.mistWolfAlive && (
            <Text style={styles.mistWolfWarning}>⚠️ Mistwolf alive - roles hidden</Text>
          )}
        </View>

        {/* Game Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Game Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{gameState.players.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: "#2ecc71"}]}>{alivePlayers.length}</Text>
              <Text style={styles.statLabel}>Alive</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: "#e74c3c"}]}>{deadPlayers.length}</Text>
              <Text style={styles.statLabel}>Dead</Text>
            </View>
          </View>
        </View>

        {/* Phase Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phase Actions</Text>

          {gameState.currentPhase === "DAY" && (
            <>
              {/* Ghost Reminder */}
              {deadPlayers.some(p => p.role === "Ghost") && (
                <View style={styles.reminderBox}>
                  <Text style={styles.reminderIcon}>👻</Text>
                  <Text style={styles.reminderText}>
                    Reminder: Ghost can write a letter to share information!
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.actionButton} onPress={handleResolveDay}>
                <Text style={styles.actionButtonText}>🗳️ Resolve Lynch</Text>
              </TouchableOpacity>
              {alivePlayers.some(p => p.role === "Deputy" && !p.deputyShotUsed) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deputyButton]}
                  onPress={() => setShowDeputyModal(true)}
                >
                  <Text style={styles.actionButtonText}>🔫 Deputy Shoot</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={handleStartNight}
              >
                <Text style={styles.actionButtonText}>🌙 Start Night</Text>
              </TouchableOpacity>
            </>
          )}

          {(gameState.currentPhase === "NIGHT_ONE" || gameState.currentPhase === "NIGHT") && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/night-sequence/${gameId}`)}
              >
                <Text style={styles.actionButtonText}>🌙 Start Night Sequence</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.warningButton]}
                onPress={handleResolveNight}
              >
                <Text style={styles.actionButtonText}>⚡ Resolve Night</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Pending Actions */}
        {gameState.pendingActions && gameState.pendingActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Actions ({gameState.pendingActions.length})</Text>
            {gameState.pendingActions.map((action, index) => (
              <View key={index} style={styles.actionCard}>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionRole}>{action.role}</Text>
                  <Text style={styles.actionText}>{action.actor}: {action.actionType}</Text>
                  <Text style={styles.actionTargets}>
                    → {action.targets.join(", ")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleUndoAction(action.actionId)}
                  style={styles.undoButton}
                >
                  <Text style={styles.undoButtonText}>Undo</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Alive Players */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alive Players ({alivePlayers.length})</Text>
          {alivePlayers.map((player, index) => (
            <View key={index} style={styles.playerCard}>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleCategoryColor(player.role) }]}>
                  <Text style={styles.roleText}>{player.role}</Text>
                </View>
              </View>
              {/* Status effects */}
              <View style={styles.statusEffects}>
                {player.cupidLinkedTo && <Text style={styles.statusBadge}>💕 Linked to {player.cupidLinkedTo}</Text>}
                {player.hexed && <Text style={styles.statusBadge}>🔮 Hexed</Text>}
                {player.doused && <Text style={styles.statusBadge}>💧 Doused</Text>}
                {player.infected && <Text style={styles.statusBadge}>🦠 Infected</Text>}
                {player.protected && <Text style={styles.statusBadge}>🛡️ Protected</Text>}
                {player.roleBlocked && <Text style={styles.statusBadge}>🚫 Blocked</Text>}
                {player.silenced && <Text style={styles.statusBadge}>🤐 Silenced</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Dead Players */}
        {deadPlayers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dead Players ({deadPlayers.length})</Text>
            {deadPlayers.map((player, index) => (
              <View key={index} style={[styles.playerCard, styles.playerCardDead]}>
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, styles.playerNameDead]}>
                    {player.name} 💀
                  </Text>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleCategoryColor(player.role), opacity: 0.5 }]}>
                    <Text style={styles.roleText}>{player.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Lynch Modal */}
      <Modal
        visible={showLynchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLynchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resolve Lynch</Text>
            <Text style={styles.modalSubtitle}>
              Select who was lynched (or none)
            </Text>

            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  lynchedPlayer === null && styles.roleOptionSelected
                ]}
                onPress={() => setLynchedPlayer(null)}
              >
                <Text style={styles.roleOptionText}>No Lynch (tie/majority)</Text>
              </TouchableOpacity>

              {alivePlayers.map((player, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.roleOption,
                    lynchedPlayer === player.name && styles.roleOptionSelected
                  ]}
                  onPress={() => setLynchedPlayer(player.name)}
                >
                  <Text style={styles.roleOptionText}>
                    {player.name} ({player.role})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleConfirmLynch}
            >
              <Text style={styles.submitButtonText}>Confirm Lynch</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowLynchModal(false);
                setLynchedPlayer(null);
              }}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Resolution Results Modal */}
      <Modal
        visible={showResolutionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResolutionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Night Resolution</Text>

            <ScrollView style={styles.modalScroll}>
              {resolutionData && (
                <>
                  {console.log("Modal rendering with data:", {
                    hasDeaths: !!resolutionData.deaths,
                    deathsCount: resolutionData.deaths?.length,
                    hasInvestigations: !!resolutionData.investigationResults,
                    investigationsCount: Object.keys(resolutionData.investigationResults || {}).length,
                    investigationResults: resolutionData.investigationResults
                  })}

                  {/* Deaths */}
                  {resolutionData.deaths && resolutionData.deaths.length > 0 && (
                    <View style={styles.resultsSection}>
                      <Text style={styles.resultsTitle}>💀 Deaths:</Text>
                      {resolutionData.deaths.map((death, index) => (
                        <Text key={index} style={styles.resultsText}>
                          • {death.playerName} ({death.role}) - {death.causeOfDeath}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Investigations */}
                  {resolutionData.investigationResults && Object.keys(resolutionData.investigationResults).length > 0 && (
                    <View style={styles.resultsSection}>
                      <Text style={styles.resultsTitle}>🔍 Investigation Results:</Text>
                      {Object.entries(resolutionData.investigationResults).map(([investigator, result], index) => (
                        <Text key={index} style={styles.resultsText}>
                          • {investigator}: {result}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Status Changes */}
                  {resolutionData.statusChanges && resolutionData.statusChanges.length > 0 && (
                    <View style={styles.resultsSection}>
                      <Text style={styles.resultsTitle}>📋 Status Changes:</Text>
                      {resolutionData.statusChanges.map((change, index) => (
                        <Text key={index} style={styles.resultsText}>
                          • {change}
                        </Text>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowResolutionModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Deputy Shoot Modal */}
      <Modal
        visible={showDeputyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeputyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Deputy Shoot</Text>
            <Text style={styles.modalSubtitle}>
              Select a player to shoot. If you shoot town, Deputy dies too!
            </Text>

            <ScrollView style={styles.modalScroll}>
              {alivePlayers.map((player, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.roleOption,
                    deputyTarget === player.name && styles.roleOptionSelected
                  ]}
                  onPress={() => setDeputyTarget(player.name)}
                >
                  <Text style={styles.roleOptionText}>
                    {player.name} ({player.role})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleDeputyShoot}
            >
              <Text style={styles.submitButtonText}>Shoot</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowDeputyModal(false);
                setDeputyTarget(null);
              }}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Hunter Revenge Modal */}
      <Modal
        visible={showHunterRevengeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHunterRevengeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hunter Revenge</Text>
            <Text style={styles.modalSubtitle}>
              {hunterName} (Hunter) died! They get to kill someone.
            </Text>

            <ScrollView style={styles.modalScroll}>
              {alivePlayers.map((player, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.roleOption,
                    hunterTarget === player.name && styles.roleOptionSelected
                  ]}
                  onPress={() => setHunterTarget(player.name)}
                >
                  <Text style={styles.roleOptionText}>
                    {player.name} ({player.role})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleHunterRevenge}
            >
              <Text style={styles.submitButtonText}>Execute Revenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tanner Revenge Modal */}
      <Modal
        visible={showTannerRevengeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTannerRevengeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tanner Revenge!</Text>
            <Text style={styles.modalSubtitle}>
              {tannerName} (Tanner) was lynched and wins! They get to kill someone as a parting gift.
            </Text>

            <ScrollView style={styles.modalScroll}>
              {alivePlayers.map((player, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.roleOption,
                    tannerTarget === player.name && styles.roleOptionSelected
                  ]}
                  onPress={() => setTannerTarget(player.name)}
                >
                  <Text style={styles.roleOptionText}>
                    {player.name} ({player.role})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleTannerRevenge}
            >
              <Text style={styles.submitButtonText}>Execute Revenge</Text>
            </TouchableOpacity>
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
  phaseCard: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#0f4c75",
    alignItems: "center",
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  phaseStats: {
    flexDirection: "row",
    gap: 8,
  },
  phaseStatText: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  mistWolfWarning: {
    fontSize: 12,
    color: "#ffa502",
    marginTop: 8,
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
    marginBottom: 8,
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
  statusEffects: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  statusBadge: {
    fontSize: 10,
    color: "#ffa502",
    backgroundColor: "#2a2a3e",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionButton: {
    backgroundColor: "#3282b8",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: "#0f4c75",
  },
  deputyButton: {
    backgroundColor: "#f39c12",
  },
  warningButton: {
    backgroundColor: "#e74c3c",
  },
  reminderBox: {
    backgroundColor: "#2a2a3e",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#6c5ce7",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reminderIcon: {
    fontSize: 24,
  },
  reminderText: {
    fontSize: 14,
    color: "#a0a0a0",
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  actionCard: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#0f4c75",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionInfo: {
    flex: 1,
  },
  actionRole: {
    fontSize: 12,
    color: "#3282b8",
    fontWeight: "600",
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 2,
  },
  actionTargets: {
    fontSize: 12,
    color: "#a0a0a0",
  },
  undoButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  undoButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#a0a0a0",
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
    marginTop: 12,
  },
  roleOption: {
    backgroundColor: "#1a1a2e",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  roleOptionSelected: {
    borderColor: "#3282b8",
    backgroundColor: "#0f4c75",
  },
  roleOptionText: {
    fontSize: 14,
    color: "#fff",
  },
  input: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#0f4c75",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  resultsSection: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3282b8",
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
    paddingLeft: 8,
  },
});
