// Centralized role category configuration
// Change colors here to update them throughout the entire app

export const ROLE_CATEGORIES = {
  "TOWN": {
    color: "#3282b8", // Blue
  },
  "TOWN_INVESTIGATIVE": {
    color: "#32b892", // Bluey green
  },
  "TOWN_PROTECTIVE": {
    color: "#719fbe", // Blue Grey
  },
  "TOWN_KILLING": {
    color: "#ede918", // Yellow
  },
  "TOWN_NEGATIVE": {
    color: "#6c5ce7", // Purple
  },
  "VILLAGER": {
    color: "#7cb3d9", // Light Blue (for basic town role)
  },
  "WEREWOLF": {
    color: "#c62828", // Dark Red
  },
  "NEUTRAL_BENIGN": {
    color: "#ffa502", // Orange
  },
  "NEUTRAL_APOCALYPSE": {
    color: "#e84118", // Dark Red
  },
  "OTHER": {
    color: "#a0a0a0", // Gray
  },
};

// Role to category mappings based on Roles.java
export const ROLE_CATEGORY_MAPPINGS = {
  // Town Investigative
  Seer: "TOWN_INVESTIGATIVE",
  Apprentice_Seer: "TOWN_INVESTIGATIVE",
  Aura_Seer: "TOWN_INVESTIGATIVE",
  Ghost: "TOWN_INVESTIGATIVE",
  Private_Investigator: "TOWN_INVESTIGATIVE",
  Clockmaker: "TOWN_INVESTIGATIVE",
  Tracker: "TOWN_INVESTIGATIVE",
  Lookout: "TOWN_INVESTIGATIVE",
  Empath: "TOWN_INVESTIGATIVE",

  // Town Protective
  Bodyguard: "TOWN_PROTECTIVE",
  Witch: "TOWN_PROTECTIVE",
  Escort: "TOWN_PROTECTIVE",
  Trickster: "TOWN_PROTECTIVE",

  // Town Killing
  Deputy: "TOWN_KILLING",
  Vigilante: "TOWN_KILLING",
  Veteran: "TOWN_KILLING",
  Hunter: "TOWN_KILLING",

  // Town Negative
  Cupid: "TOWN_NEGATIVE",
  Lycan: "TOWN_NEGATIVE",
  Cursed: "TOWN_NEGATIVE",

  // Werewolf
  Werewolf: "WEREWOLF",
  Sorceror: "WEREWOLF",
  Cubwolf: "WEREWOLF",
  Hexwolf: "WEREWOLF",
  Mistwolf: "WEREWOLF",
  Consort: "WEREWOLF",

  // Neutral Benign
  Doppelganger: "NEUTRAL_BENIGN",
  Tanner: "NEUTRAL_BENIGN",
  Executioner: "NEUTRAL_BENIGN",

  // Neutral Apocalypse
  Arsonist: "NEUTRAL_APOCALYPSE",
  Serial_Killer: "NEUTRAL_APOCALYPSE",
  Plaguebearer: "NEUTRAL_APOCALYPSE",
  Pestilence: "NEUTRAL_APOCALYPSE",
  Grave_Digger: "NEUTRAL_APOCALYPSE",
  Doom_sayer: "NEUTRAL_APOCALYPSE",

  // Villager (basic town role with no special ability)
  Villager: "VILLAGER",
};

// Helper function to get category color for a role
export const getRoleCategoryColor = (roleName) => {
  const category = ROLE_CATEGORY_MAPPINGS[roleName] || "OTHER";
  return ROLE_CATEGORIES[category]?.color || ROLE_CATEGORIES["OTHER"].color;
};

// Helper function to format category name for display
// Converts "TOWN_INVESTIGATIVE" -> "Town Investigative"
export const formatCategoryForDisplay = (category) => {
  if (!category) return "";
  return category
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
