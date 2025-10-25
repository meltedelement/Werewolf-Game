import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { roleListAPI } from "../services/api";

export default function Roles() {
  const router = useRouter();
  const [roleLists, setRoleLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRoleLists();
  }, []);

  const loadRoleLists = async () => {
    try {
      const lists = await roleListAPI.getAllRoleLists();
      setRoleLists(lists);
    } catch (error) {
      console.error("Error loading role lists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await roleListAPI.deleteRoleList(id);
      setRoleLists(roleLists.filter((list) => list.id !== id));
    } catch (error) {
      console.error("Error deleting role list:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3282b8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Roles</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Role Lists</Text>
          {roleLists.length === 0 ? (
            <Text style={styles.emptyText}>No role lists saved yet</Text>
          ) : (
            roleLists.map((list) => (
              <View key={list.id} style={styles.roleListCard}>
                <View style={styles.roleListInfo}>
                  <Text style={styles.roleListName}>{list.name}</Text>
                  <Text style={styles.roleListDescription}>
                    {list.description}
                  </Text>
                  <Text style={styles.roleListCount}>
                    {list.roles.length} roles
                  </Text>
                </View>
                <View style={styles.roleListActions}>
                  <TouchableOpacity
                    onPress={() => router.push(`/role-editor/${list.id}`)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(list.id, list.name)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/role-editor/new")}
        >
          <Text style={styles.createButtonText}>+ Create New Role List</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  roleListCard: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0f4c75",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleListInfo: {
    flex: 1,
  },
  roleListName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  roleListDescription: {
    fontSize: 13,
    color: "#a0a0a0",
    marginBottom: 4,
  },
  roleListCount: {
    fontSize: 12,
    color: "#3282b8",
  },
  roleListActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#3282b8",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#ff4757",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
  },
  createButton: {
    backgroundColor: "#3282b8",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
