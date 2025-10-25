import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { roleListAPI } from "../../services/api";
import { ROLE_CATEGORIES, ROLE_CATEGORY_MAPPINGS } from "../../constants/roleCategories";

export default function RoleEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [roles, setRoles] = useState([]);

  // For adding roles
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [roleSearchFilter, setRoleSearchFilter] = useState("");

  useEffect(() => {
    loadAvailableOptions();
    if (!isNew) {
      loadRoleList();
    }
  }, []);

  const loadAvailableOptions = async () => {
    try {
      const [rolesData, categoriesData] = await Promise.all([
        roleListAPI.getRoles(),
        roleListAPI.getCategories(),
      ]);
      setAvailableRoles(rolesData.roles);
      setAvailableCategories(categoriesData.categories);
    } catch (error) {
      console.error("Error loading available options:", error);
    }
  };

  const loadRoleList = async () => {
    try {
      const roleList = await roleListAPI.getRoleList(id);
      setName(roleList.name);
      setDescription(roleList.description);
      setRoles(roleList.roles);
    } catch (error) {
      console.error("Error loading role list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await roleListAPI.createRoleList(name, description, roles);
      } else {
        await roleListAPI.updateRoleList(id, name, description, roles);
      }
      router.back();
    } catch (error) {
      console.error("Error saving role list:", error);
    } finally {
      setSaving(false);
    }
  };

  const addRole = (type, value) => {
    const newRole = { type, value, count: 1 };
    setRoles([...roles, newRole]);
    setShowRoleModal(false);
    setRoleSearchFilter("");
  };

  const removeRole = (index) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const updateRoleCount = (index, count) => {
    const newRoles = [...roles];
    newRoles[index].count = Math.max(1, count);
    setRoles(newRoles);
  };

  const getRoleDisplayName = (role) => {
    if (role.type === "CATEGORY") {
      return `[${role.value}]`;
    }
    return role.value.replace(/_/g, " ");
  };

  // Categorize roles by their category
  const categorizeRoles = (roles) => {
    // Initialize categories with colors from centralized config
    const categories = Object.keys(ROLE_CATEGORIES).reduce((acc, categoryName) => {
      acc[categoryName] = {
        roles: [],
        color: ROLE_CATEGORIES[categoryName].color,
      };
      return acc;
    }, {});

    roles.forEach((role) => {
      const category = ROLE_CATEGORY_MAPPINGS[role] || "Other";
      categories[category].roles.push(role);
    });

    return categories;
  };

  const filteredRoles = roleSearchFilter
    ? availableRoles.filter((role) =>
        role.toLowerCase().includes(roleSearchFilter.toLowerCase())
      )
    : availableRoles;

  const categorizedRoles = categorizeRoles(filteredRoles);

  const filteredCategories = roleSearchFilter
    ? availableCategories.filter((cat) =>
        cat.toLowerCase().includes(roleSearchFilter.toLowerCase())
      )
    : availableCategories;

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
        <Text style={styles.title}>{isNew ? "Create" : "Edit"} Role List</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Name and Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 7-Player Balanced"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional description"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Roles List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Roles</Text>
            <TouchableOpacity
              style={styles.addRoleButton}
              onPress={() => setShowRoleModal(true)}
            >
              <Text style={styles.addRoleButtonText}>+ Add Role</Text>
            </TouchableOpacity>
          </View>

          {roles.length === 0 ? (
            <Text style={styles.emptyText}>
              No roles added yet. Tap "Add Role" to get started.
            </Text>
          ) : (
            roles.map((role, index) => (
              <View key={index} style={styles.roleItem}>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>{getRoleDisplayName(role)}</Text>
                  <Text style={styles.roleType}>
                    {role.type === "CATEGORY" ? "Random" : "Specific"}
                  </Text>
                </View>
                <View style={styles.roleControls}>
                  <TouchableOpacity
                    onPress={() => updateRoleCount(index, role.count - 1)}
                    style={styles.countButton}
                    disabled={role.count <= 1}
                  >
                    <Text style={styles.countButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.countText}>{role.count}</Text>
                  <TouchableOpacity
                    onPress={() => updateRoleCount(index, role.count + 1)}
                    style={styles.countButton}
                  >
                    <Text style={styles.countButtonText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeRole(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            • Specific roles will be assigned as-is
          </Text>
          <Text style={styles.infoText}>
            • Categories (shown in [brackets]) will be randomly selected at game
            start
          </Text>
          <Text style={styles.infoText}>
            • Count determines how many of each role/category to add
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (!name.trim() || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Role List</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Add Role Modal */}
      <Modal
        visible={
          showRoleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Role</Text>
              <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search roles or categories..."
              placeholderTextColor="#666"
              value={roleSearchFilter}
              onChangeText={setRoleSearchFilter}
            />

            <ScrollView style={styles.modalScroll}>
              {/* Categories */}
              {filteredCategories.length > 0 && (
                <>
                  <Text style={styles.modalSectionTitle}>Categories (Random)</Text>
                  {filteredCategories.map((category) => {
                    // Convert backend format (TOWN_INVESTIGATIVE) to our format (Town Investigative)
                    const formattedCategory = category.split('_').map(word =>
                      word.charAt(0) + word.slice(1).toLowerCase()
                    ).join(' ');
                    const categoryColor = ROLE_CATEGORIES[formattedCategory]?.color || "#fff";
                    return (
                      <TouchableOpacity
                        key={category}
                        style={[styles.modalOption, { backgroundColor: categoryColor + '40' }]}
                        onPress={() => addRole("CATEGORY", category)}
                      >
                        <Text style={styles.modalOptionText}>
                          [{category.replace(/_/g, " ")}]
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}

              {/* Specific Roles - Grouped by Category */}
              {filteredRoles.length > 0 && (
                <>
                  <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>
                    Specific Roles
                  </Text>
                  {Object.entries(categorizedRoles).map(([categoryName, categoryData]) => {
                    if (categoryData.roles.length === 0) return null;

                    return (
                      <View key={categoryName}>
                        <Text style={[styles.modalSubsectionTitle, { color: categoryData.color }]}>
                          {categoryName}
                        </Text>
                        {categoryData.roles.map((role) => (
                          <TouchableOpacity
                            key={role}
                            style={[styles.modalOption, { backgroundColor: categoryData.color + '40' }]}
                            onPress={() => addRole("SPECIFIC", role)}
                          >
                            <Text style={[styles.modalOptionText, { fontSize: 17 }]}>
                              {role.replace(/_/g, " ")}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  })}
                </>
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#a0a0a0",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  addRoleButton: {
    backgroundColor: "#3282b8",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addRoleButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  roleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
    marginBottom: 2,
  },
  roleType: {
    fontSize: 11,
    color: "#3282b8",
  },
  roleControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countButton: {
    backgroundColor: "#0f4c75",
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  countButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  countText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    backgroundColor: "#ff4757",
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#0f4c75",
  },
  infoText: {
    fontSize: 13,
    color: "#a0a0a0",
    marginBottom: 4,
  },
  footer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: "#3282b8",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#2c3e50",
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
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
    maxHeight: "80%",
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
  searchInput: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#0f4c75",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3282b8",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  modalSubsectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 6,
  },
  modalCategoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modalOption: {
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#0f4c75",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 15,
    color: "#fff",
  },
  modalOptionBadge: {
    backgroundColor: "#3282b8",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
});
